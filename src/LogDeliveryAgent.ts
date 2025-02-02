import fs from 'fs';
import newrelic from 'newrelic';
import zlib from 'zlib';
import { NewRelicLogTransport } from './NewRelicLogTransport';
import { PassThrough } from 'stream';
import { Logger } from 'winston';
import { NPMLoggingLevels } from './logger';
import Axios from 'axios';

const API_HOSTNAME = process.env.KL_NR_LOG_HOSTNAME || 'log-api.eu.newrelic.com';
const API_PATH = process.env.KL_NR_LOG_PATH || '/log/v1';
const MAX_PAYLOAD_SIZE = 10**6;
const MAX_ATTRIBUTES_PER_EVENT = 255;
const MAX_ATTRIBUTE_NAME_LENGTH = 255;
const MAX_ATTRIBUTE_VALUE_LENGTH = 4096;

let log: Logger | undefined;
let internalLogBuffer: Array<[string, string]> = [];

/**
 * Function to write logs that are internal to this module.
 * Buffers calls until the Winston logger can be async importd
 * Afterwords, writes logs directly to the logger
 * @param level 
 * @param message 
 */
function internalLog(level: string, message: string) {
    if (log) {
        (log as any)[level](message);
    } else {
        internalLogBuffer.push([level, message]);
    }
}

export interface NewRelicLogDeliveryAgentConfig {
    /**
     * How frequently checks should be run to push logs to NR
     * Default is 10 seconds
     */
     logPushFrequency?: number;

     /**
      * Minimum number of log statements written before logs can be pushed to NR
      * by periodic logger.
      * Default is 2
      */
     minLogItems?: number;
 
 
     /**
      * Minimum number of log statements to force an immediate push to NR. Used
      * to ensure that the logging system does not get backed up if amount being
      * logged surpasses the bandwidth of the periodic logger.
      * Default is 100.
      */
     minLogItemsToForce?: number;

 
     /**
      * Minimum number of bytes written to compression stream before pushing to NR
      */
     minBytesWritten?: number;
 
     /**
      * Threshold for bytes written at which point a new write to NR will be automatically
      * triggered. Defaults to (4/5 * MAX_PAYLOAD_SIZE)
      */
     bytesWrittenThreshold?: number;
 
     /**
      * Produce a warning when attribute values overflow the NR maximum length of 4096.
      * Default is false.
      */
     warnOnAttributeLengthOverflow?: boolean;
}

const defaultConfig: NewRelicLogDeliveryAgentConfig = {
    bytesWrittenThreshold: MAX_PAYLOAD_SIZE * 4 / 5,
    warnOnAttributeLengthOverflow: false,
    minBytesWritten: MAX_PAYLOAD_SIZE * 1 / 5,
    minLogItems: 2,
    logPushFrequency: 60000,
    minLogItemsToForce: 100,
}

export class NewRelicLogDeliveryAgent {
 
    private appLabel: string;
    private regionLabel: string = 'undefined';
    private environmentLabel: string = 'undefined';
    private versionLabel: string = 'undefined';

    /**
     * Initializes a NewRelicLogDeliveryAgent instance if the LOG_STYLE environment
     * variable is set to NEW_RELIC. Otherwise it does nothing.
     * @param config 
     * @returns 
     */
    public static initialize() {
        if (!process.env.NEW_RELIC_LICENSE_KEY) return;
        NewRelicLogDeliveryAgent.instance = new NewRelicLogDeliveryAgent();
        return NewRelicLogDeliveryAgent.instance;
    }

    public static getInstance() {
        return NewRelicLogDeliveryAgent?.instance;
    }

    public static configure(config: NewRelicLogDeliveryAgentConfig) {
        const instance = NewRelicLogDeliveryAgent.instance;
        if (!instance) {
            internalLog('warn', 'Configure called before instance initialization. Configuration not applied');
            return;
        }
        instance.config = {
            ...instance.config,
            ...config
        }
    }

    public static getWinstonTransport() {
        return NewRelicLogDeliveryAgent?.instance?.logTransform;
    }
    
    private static instance: NewRelicLogDeliveryAgent;
    private logQueue: any[] = [];
    private config: NewRelicLogDeliveryAgentConfig;
    private logLengthQueue: number[] = [];
    private totalLengthCount = 0;
    private globalAttributes: {[key: string]: string} = {};
    private newRelicLogTransport: NewRelicLogTransport;
    private debugMode = process.env.DEBUG_WRITE_LOGS_TO_FILE === 'true';
    private timeoutId: NodeJS.Timeout | undefined;
    private logsWritten = 0;
    private newRelicInitialized = false;
    
    public standardOutPassThrough: StandardOutPassThrough;
    
    private constructor() {
        internalLog('debug', 'Initializing LogDeliveryAgent');
        this.config = { ...defaultConfig };

        internalLog('info', `Creating NewRelicLogTransport`);
        this.newRelicLogTransport = new NewRelicLogTransport((log, cb) => this.addLog(log, cb));

        // Creates logging configuration for rewriting stdout/stderr
        const logCallback = (log: string) => {
            this.addLog(log, () => {});
        };
    
        const errCallback = (log: string) => {
            this.addLog({
                label: 'error',
                message: log
            }, () => {});
        };
    
        this.standardOutPassThrough = new StandardOutPassThrough(logCallback, errCallback);
        this.registerAppDeathLogPush();
        this.createLogCheckTimeout();
        this.registerNewRelicInitializationInterval();      
        internalLog('debug', 'LogDeliveryAgent Initialized')

        const serviceLabel = process.env.SERVICE_LABEL;
        let component;
        const labels = process.env.NEW_RELIC_LABELS;
        if (labels) {
            const parts = labels.split(';');
            const labelMap = new Map<string, string>();
            parts.forEach(part => {
                const [label, value] = part.split(':');
                labelMap.set(label.toLowerCase(), value);
            });

            if (labelMap.has('region')) {
                this.regionLabel = labelMap.get('region') as string;
            }

            if (labelMap.has('environment')) {
                this.environmentLabel = labelMap.get('environment') as string;
            }

            if (labelMap.has('version')) {
                this.versionLabel = labelMap.get('version') as string;
            }

            component = labelMap.get('component');
        }

        /* 
            Assign label name using the following priorities:
            1. SERVICE_LABEL env value
            2. NEW_RELIC_LABELS env value component part
            3. NEW_RELIC_APP_NAME env value
            4. undefined literal
        */
        this.appLabel = serviceLabel
            || component
            || process.env.NEW_RELIC_APP_NAME
            || 'undefined';
    }

    /**
     * Accessor for Winston Transport that writes to this 
     * agent instance
     * @returns winston.transport
     */
    public getLogTransport() {
        return this.newRelicLogTransport;
    }

    /**
     * Shutsdown the delivery agent. This can be utilized when app is expected to shutdown
     * at a given time and the periodic delivery timeout is blocking shutdown.
     * 
     * Clears internal timeout, configures winston transport to not send logs.
     * Reconnects stdout and stderr.
     * Writes any remaining logs.
     */
    public shutdown() {
        internalLog('debug', 'Shutdown of LogDeliveryAgent triggered');
        if (this.timeoutId) clearTimeout(this.timeoutId);
        this.standardOutPassThrough.destroy();
        this.newRelicLogTransport.close();
        this.writeLogsSync();
    }


    /**
     * Determine if the log string or object is a New Relic 
     * compatible JSON. In order to be considered this it must
     * be a well structured JSON object with a top level 'message'
     * and 'level' property.
     * @param str 
     * @returns object form of JSON or false
     */
    private isNRCompatibleJsonLogString(str: string | object) {
        if (typeof str === 'object') {
            str = JSON.stringify(str);
        }
        try {
            const obj = JSON.parse(str as string);
            // Rewrite bootstrap object into a format that will work for new relic
            if (obj.msg && obj?.name('newrelic_bootstrap') && !obj.message) {
                obj.message = obj.msg;
                obj.level = 'info';
                delete obj.msg;
            }
            if (obj && typeof obj === "object") {
                if (obj.message && obj.level) {
                    
                    return obj;
                }
            }
        } catch (err) { }
        return false;
    }

    /**
     * Internal function used to accept log statements and
     * process them. Log is typed to any to fit typing for
     * the Winston transport.
     * 
     * TODO: Rework the Winston transport logic to do a bit
     *      more work to provide more consistent typing.
     * 
     * @param log 
     * @param callback 
     */
    private addLog(log: any, callback: (() => void) | undefined) {
        const jsonData = this.isNRCompatibleJsonLogString(log);
        if(jsonData) {
            this.processAsJsonLog(jsonData);
        } else {
            this.processAsStringLog(log);
        }

        if (this.immediateLogWritablePredicate()) {
            this.beginWriteLogs();
        }

        if (jsonData) log = JSON.stringify(log)+'\n';
    
        if (jsonData?.message && jsonData?.level === 'error') {
            this.standardOutPassThrough.stderrBypass(log);
        } else if(jsonData.message) {
            this.standardOutPassThrough.stdoutBypass(log);
        }

        if (callback) callback();
    }

    /**
     * Handler for processing a log statement when it is formatted
     * as a New Relic compatible JSON string.
     * @param log 
     */
    processAsJsonLog(log: any) {
        this.logTransform(log);
        const logString = JSON.stringify(log);
        const length = Buffer.byteLength(logString);
        this.logQueue.push(log);
        this.logLengthQueue.push(length);
        this.totalLengthCount += length;
    }

    /**
     * Handler for processing a log statement that is a simple
     * string format.
     * @param log 
     */
    processAsStringLog(log: string) {
        if (typeof log === 'string' && log.endsWith('\n')) {
            log = log.substring(0, log.length - 1);
        }

        const newRelicMetadata = newrelic.getLinkingMetadata();
        const structuredLog = {
            message: log,
            timestamp: Date.now(),
            original_timestamp: new Date().toISOString(),
            "entity.name": newRelicMetadata['entity.name'],
            "entity.type": newRelicMetadata['entity.type'],
            hostname: newRelicMetadata.hostname
        }

        const jsonLogString = JSON.stringify(structuredLog);
        const length = Buffer.byteLength(jsonLogString);
        this.logQueue.push(structuredLog);
        this.logLengthQueue.push(length);
        this.totalLengthCount += length;
    }
    
    /**
     * Set global attributes for the application.  This should
     * generally be configured early in the application lifecycle.
     * Global attributes will be bound to all log statements
     * in New Relic.
     * @param attributes KV pairs to be provided to NR with logs
     */
    setGlobalAttributes(attributes: {[key: string]: string}) {
        this.globalAttributes = attributes;
    }  

    /**
     * Writes logs synchronously.  This function is intended to be
     * utilized in situations where logging cannot be written 
     * asynchronously, most commonly in the handler of a SIGTERM
     * event, which only allows synchronous calls.
     */
    private writeLogsSync() {
        const logsToWrite = this.sliceLogs();
        internalLog('silly', `Preparing final log payload of ${logsToWrite.length} for NR collector`);
        const rawPayload = this.buildRawPostBody(logsToWrite);
        const compressedPayload = zlib.gzipSync(rawPayload);
        if (!this.debugMode) {
            this.sendLogs(compressedPayload);
        } else {
            this.writeLogsToFileSystem(compressedPayload);
        }
    }

    public writeLogsToFileSystem(buffer: Buffer) {
        fs.writeFileSync(`test-${this.logsWritten++}.gz`, buffer);
    }

    private async beginWriteLogs() {
        const logsToWrite = this.sliceLogs();

        internalLog('silly', `Preparing log payload of ${logsToWrite.length} for NR collector`);
        const rawPayload = this.buildRawPostBody(logsToWrite);
        try {
            const compressedPayload: Buffer = await this.compressPayload(rawPayload);
            if (!this.debugMode) {
                this.sendLogs(compressedPayload);
            } else {
                this.writeLogsToFileSystem(compressedPayload);
            }
        } catch (err) {
            const fallbackMessage = 'Unknown error occurred while compressing logs to send to New Relic';
            const message = err instanceof Error && err.stack ? err.stack : fallbackMessage; 
            internalLog('error', message)
        }
    }

    /**
     * Handles HTTP request that sends compressed log data
     * to the New Relic endpoint.
     * @param compressedPayload 
     */
    private sendLogs(compressedPayload: Buffer) {
        Axios.post(`https://${API_HOSTNAME}${API_PATH}`, compressedPayload, {
            headers: {
                'Accept': '*/*',
                'Api-Key': process.env.NEW_RELIC_LICENSE_KEY as string,
                'Content-Encoding': 'gzip',
                'Content-Length': ''+compressedPayload.byteLength,
                'Content-Type': 'application/gzip',
            }
        }).then(response => {
            if ([200, 202].includes(response.status)) {
                internalLog('silly', `Log payload accepted by New Relic API. Request ID: ${response.data.requestId}`)
            } else {
                internalLog('warn', `Unexpected successful response status code from NR: ${response.status}`)
            }

        }).catch(err => {
            internalLog('error', 'Error sending log payload to New Relic');
            internalLog('error', err.stack)
        })
    }

    /**
     * Creates the greater object structure for a log delivery 
     * payload and attaches an array of logs to it. Returns 
     * stringified.
     * @param logs 
     * @returns 
     */
    private buildRawPostBody(logs: any[]): string {
        const payload = [{
            common: {
                attributes: {
                    ...this.globalAttributes,
                    service: this.appLabel,
                    version: this.versionLabel,
                    region: this.regionLabel,
                    environment: this.environmentLabel,
                    entityGuid: newrelic.getLinkingMetadata()['entity.guid'],
                },
            },
            logs: logs
        }];
        return JSON.stringify(payload);
    }

    /**
     * Asynchronously compress string to gzip compressed data.
     * @param rawPayload 
     * @returns 
     */
    private async compressPayload(rawPayload: string): Promise<Buffer> {
        return new Promise<Buffer>((resolve, reject) => {
            zlib.gzip(Buffer.from(rawPayload, 'utf8'), (err, compressedPayload) => {
                if (err) reject(err);
                resolve(compressedPayload);
            });
        });
    }

    /**
     * Slices log queue.
     * Will prefer to use the entire log queue when possible, but
     * may send only a subsection if the size of the data is near
     * the limitations defined by New Relic's API.
     * @returns 
     */
    private sliceLogs() {
        let logsToSend;
        
        // If we know the total length will not exceed maximum length size
        if (this.totalLengthCount < MAX_PAYLOAD_SIZE) {
            [logsToSend, this.logQueue] = [this.logQueue, []];
            this.logLengthQueue = [];
            this.totalLengthCount = 0;
            return logsToSend;
        }

        // otherwise, slice off a slice of logs that will fit into a single request
        let logSize = 0;
        let logSliceIndex = 0;

        while((this.logQueue.length > 0) && (logSize + this.logLengthQueue[0] < MAX_PAYLOAD_SIZE)) {
            logSliceIndex++;
        }

        logsToSend = this.logQueue.slice(0, logSliceIndex);
        this.logQueue = this.logQueue.slice(logSliceIndex);
        this.logLengthQueue = this.logLengthQueue.slice(logSliceIndex);

        return logsToSend;
    }

    /**
     * Predicate to determine if logs should be written be written immediately.
     * @returns boolean
     */
    private immediateLogWritablePredicate(): boolean {
        if (this.newRelicInitialized && this.logQueue.length > (this.config.minLogItemsToForce || 100)) {
            return true;
        }

        // Push logs even if new relic hasn't been initialized if the backlog grows too large
        if (this.logQueue.length > 500) {
            return true;
        }
        return false;
    }

    /**
     * Predicate to determine if logs should be written on next periodic check.
     * @returns boolean
     */
    private logsWritablePredicate(): boolean {
        return this.minLogItemsExceeded()
    }

    /**
     * Predicate to determine if the total logs have exceeded a configured minLog
     * count value if such a value is configured.
     * @returns 
     */
    private minLogItemsExceeded(): boolean {
        return !!(this.config.minLogItems && (this.logQueue.length > this.config.minLogItems));
    }    
    
    /**
     * Fixes possible issues in log format caused by limitations of NRs logging
     * values
     * @param log 
     * @returns 
     */
    private logTransform(log: any) {
        if (Object.getOwnPropertyNames(log).length > MAX_ATTRIBUTES_PER_EVENT) {
            internalLog('warn', `Log to send to JSON contains ${Object.getOwnPropertyNames(log)} / ${MAX_ATTRIBUTES_PER_EVENT} attributes.`);
        }
        
        for (let key of Object.keys(log)) {
            const value = log[key];
            // replace key with length too high
            if (key.length > MAX_ATTRIBUTE_NAME_LENGTH) {
                const newKey = key.slice(0, MAX_ATTRIBUTE_NAME_LENGTH);
                Object.defineProperty(log, key.slice(0, MAX_ATTRIBUTE_NAME_LENGTH), 
                    Object.getOwnPropertyDescriptor(log, key as PropertyKey) as PropertyDescriptor);
                delete log.key;

                // Update key name for usage in later steps
                key = newKey;
            }

            // Concatenate log messages with length greater than MAX_ATTRIBUTE_VALUE_LENGTH
            if (typeof value === 'string' && value.length > MAX_ATTRIBUTE_VALUE_LENGTH) {
                if (this.config?.warnOnAttributeLengthOverflow) {
                    internalLog('warn', `NR Log attribute length overflow. Length: ${value.length}/${MAX_ATTRIBUTE_VALUE_LENGTH}`);
                }
                log.key = value.slice(0, MAX_ATTRIBUTE_VALUE_LENGTH); 
            }

            if (key.includes(' ')) {
                const newKey = key.replaceAll(' ', '.');
                Object.defineProperty(log, key.slice(0, MAX_ATTRIBUTE_NAME_LENGTH), 
                    Object.getOwnPropertyDescriptor(log, key as PropertyKey) as PropertyDescriptor);
                delete log.key;

                // Update key name for usage in later steps
                key = newKey;
            };
        }
    }

    /**
     * Function used to repeatedly trigger log pushes
     */
    private createLogCheckTimeout() {
        this.timeoutId = setTimeout(async () => {
            if (this.logQueue.length > (this.config.minLogItems || 1)) {
                await this.beginWriteLogs();
                this.createLogCheckTimeout();
            }
        }, this.config.logPushFrequency)
    }

    /**
     * Helper method that registers listeners for events
     * related to imminent application shutdown so that
     * final logs can be pushed
     */
    private registerAppDeathLogPush() {
        let finalWritten = false;
        process.on('exit', () => {
            if (this.timeoutId) clearTimeout(this.timeoutId);
            let o = finalWritten;
            finalWritten = true;
            if (o) return;

            internalLog('info', 'writing final logs');

            this.writeLogsSync();
        });

        process.on('SIGINT', () => {
            process.exit(2);
        });

        process.on('uncaughtException', (e) => {
            console.log(e);
            internalLog('error', e.stack || '');
        });

        process.on('SIGTERM', () => {
            if (this.timeoutId) clearTimeout(this.timeoutId);
            this.writeLogsSync();
        })
    }

    /**
     * New Relic does not expose a method to check its initialization status
     * If we push logs before New Relic initializes, they will not have an attached
     * entity guid.  For this reason we will initialize an interval that can run until
     * it is initialized.
     */
    private registerNewRelicInitializationInterval() {
        const newRelicInitializationCheckTimeout = setInterval(() => {
            const metadata = newrelic.getLinkingMetadata();
            if (metadata['entity.guid']) {
                this.newRelicInitialized = true;
                internalLog('info', 'Detected New Relic has initialized with entity.guid');
                clearInterval(newRelicInitializationCheckTimeout);
            }
        }, 100);
    }
}

/**
 * Replaces existing writers for stdout and stderr with
 * PassThrough streams that will invoke provided callbacks
 * with the data prior to passing them to the original streams
 */
class StandardOutPassThrough {


    private readonly stdoutPt = new PassThrough();
    private readonly stderrPt = new PassThrough();

    private readonly stdout;
    private readonly stderr;

    private readonly writeStdout;
    private readonly writeStderr;

    constructor(stdoutCb: (data: string) => void, stderrCb: (data: string) => void) {
        // Store original write stdout/stderr write functions
        this.stdout = process.stdout.write;
        this.stderr = process.stderr.write;

        // Create functions which write to original writes with stdout/stderr contexts bound
        this.writeStdout = (data: string) => this.stdout.call(process.stdout, data);
        this.writeStderr = (data: string) => this.stderr.call(process.stderr, data);

        // Assign listeners to PassThroughs
        this.stdoutPt.on('data', (data) => {
            if (data instanceof Buffer) {
                data = data.toString('utf8');
            }
            stdoutCb(data);
            this.writeStdout(data);
        });

        this.stderrPt.on('data', (data) => {
            if (data instanceof Buffer) {
                data = data.toString('utf8');
            }
            stderrCb(data);
            this.writeStderr(data);
        });

        // Replace original write calls with contexts bound to parent object
        process.stdout.write = this.stdoutPt.write.bind(this.stdoutPt) as any;
        process.stderr.write = this.stderrPt.write.bind(this.stderrPt) as any;

        // Add uncaught error handler to handle logging of failure case
        process.on('uncaughtException', (err) => {
            console.error(err);
            throw err;
        });
    }

    /**
     * Reaffix the replaced stdout and stderr then
     * closes all streams owned by this instance.
     */
    public destroy() {
        process.stdout.write = this.stdout;
        process.stderr.write = this.stderr;

        this.stdoutPt.destroy()
        this.stderrPt.destroy();
    }

    /**
     * Bypass the configured callback function for stdout by
     * writing directly to the detached output stream
     * @param data 
     */
    public stdoutBypass(data: string | object) {
        if (data instanceof Object) {
            data = JSON.stringify(data);
        }
        this.writeStdout((data as unknown as string));
    }

    /**
     * Bypass the configured callback function for stderr by
     * writing directly to the detached output stream
     * @param data 
     */
    public stderrBypass(data: string) {
        this.writeStderr(data);
    }
}


/**
 * Lazy load logger, write buffered messages once loaded
 * Note: Lazy loading is necessary to resolve circular dependencies between this
 * module and the logger.
 */
(async () => {
    const { withLogger } = await import('./logger');
    const level: NPMLoggingLevels = process.env.LOG_DELIVERY_AGENT_LEVEL as NPMLoggingLevels || 'warn';
    log = withLogger('NewRelicLogForwarder', level);
    while(internalLogBuffer.length) {
        const [level, message] = internalLogBuffer.shift() as [string, string];
        (log as any)[level](message);
    }
})();
