import https from 'https';
import zlib from 'zlib';
import Transport from 'winston-transport';
import fs from 'fs';
import { Logger } from 'winston';

const API_HOSTNAME = process.env.KL_NR_LOG_HOSTNAME || 'log-api.eu.newrelic.com';
const API_PATH = process.env.KL_NR_LOG_PATH || '/log/v1';
const MAX_PAYLOAD_SIZE = 10**6;
const MAX_ATTRIBUTES_PER_EVENT = 255;
const MAX_ATTRIBUTE_NAME_LENGTH = 255;
const MAX_ATTRIBUTE_VALUE_LENGTH = 4096;
let log: Logger | undefined;
let internalLogBuffer: Array<[string, string]> = [];
interface UniqueNewRelicLogTransportOptions {
    /**
     * How frequently checks should be run to push logs to NR
     * Default is 10 seconds
     */
    logPushFrequency?: number;

    /**
     * Minimum number of log statements written before logs can be pushed to NR.
     * Default is undefined
     */
    minLogItems?: number;

    /**
     * Minimum number of log statements to immediately trigger a push to NR.
     * Default is undefined
     */
    logCountThreshold?: number | undefined;

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

type NewRelicLogTransportOptions = UniqueNewRelicLogTransportOptions & Transport.TransportStreamOptions;

type RequiredKeepUndefined<T> = { [K in keyof T]-?: [T[K]] } extends infer U
  ? U extends Record<keyof U, [any]> ? { [K in keyof U]: U[K][0] } : never
  : never;

export class NewRelicLogTransport extends Transport {
    private static readonly gzipOpts: zlib.ZlibOptions = {
        
    }
    private config: RequiredKeepUndefined<UniqueNewRelicLogTransportOptions> & Transport.TransportStreamOptions;
    private logQueue: any[] = [];
    private logLengthQueue: number[] = [];
    private totalLengthCount = 0;
    private globalAttributes: {[key: string]: string};

    
    constructor(opts: NewRelicLogTransportOptions, globalAttributes: {[key: string]: string}) {
        super(opts);
        this.internalLog('info', 'creating new relic transport');
        this.globalAttributes = globalAttributes;
        this.config = {
            bytesWrittenThreshold: MAX_PAYLOAD_SIZE * 4 / 5,
            warnOnAttributeLengthOverflow: false,
            minBytesWritten: MAX_PAYLOAD_SIZE * 1 / 5,
            minLogItems: 10,
            logPushFrequency: 10000,
            logCountThreshold: undefined,
            ...opts
        };

        this.config.bytesWrittenThreshold = Math.min(this.config.bytesWrittenThreshold || 0, MAX_PAYLOAD_SIZE * 4 / 5);

        this.registerAppDeathLogPush();
        this.createLogCheckTimeout();
    }

    /**
     * Function to write logs that are internal to this module.
     * Buffers calls until the Winston logger can be async importd
     * Afterwords, writes logs directly to the logger
     * @param level 
     * @param message 
     */
    internalLog(level: string, message: string) {
        if (log) {
            (log as any)[level](message);
        } else {
            internalLogBuffer.push([level, message]);
        }
    }

    log(info: any, callback: (() => void) | undefined) {
        this.logTransform(info);
        const logString = JSON.stringify(info);
        const length = Buffer.byteLength(logString);
        this.logQueue.push(info);
        this.logLengthQueue.push(length);
        this.totalLengthCount += length;

        // if (this.logsWritablePredicate()) {
        //     this.beginWriteLogs();
        // }
        if (callback) callback();
    }

    private writeLogsSync() {
        const logsToWrite = this.sliceLogs();
        this.internalLog('silly', 'Preparing final log payload for NR collector');
        const rawPayload = this.buildRawPostBody(logsToWrite);
        const compressedPayload = zlib.gzipSync(rawPayload);
        this.sendLogs(compressedPayload);
    }

    private logsWritten = 0;
    public writeLogsToFileSystem(buffer: Buffer) {
        fs.writeFileSync(`test-${this.logsWritten++}.gz`, buffer);
    }

    private async beginWriteLogs() {
        const logsToWrite = this.sliceLogs();

        this.internalLog('silly', 'Preparing log payload for NR collector');
        const rawPayload = this.buildRawPostBody(logsToWrite);
        const compressedPayload: Buffer = await this.compressPayload(rawPayload);
        this.sendLogs(compressedPayload);
    }

    private sendLogs(compressedPayload: Buffer) {
        const req = https.request({
            hostname: API_HOSTNAME,
            path: API_PATH,
            port: 443,
            method: 'POST',
            headers: {
                'Content-Type': 'application/gzip',
                'X-License-Key': process.env.NEW_RELIC_LICENSE_KEY,
                'Accept': '*/*',
                'Content-Length': compressedPayload.byteLength
            }
        });

        req.on('connect', () => {
            req.write(compressedPayload);
        });

        req.on('response', response => {
            if(response.statusCode === 200) {
                return;
            } else {
                this.internalLog('error', 'Error delivering logs to NR:');
                this.internalLog('error', `${response.statusCode} - ${response.statusMessage}`)
            }
        });
    }

    private buildRawPostBody(logs: any[]): string {
        return JSON.stringify([{
            common: {
                attributes: {
                    ...this.globalAttributes,
                    service: process.env.NEW_RELIC_APP_NAME
                },
                logs: logs
            }
        }]);
    }

    private async compressPayload(rawPayload: string): Promise<Buffer> {
        return new Promise<Buffer>((resolve, reject) => {
            zlib.gzip(Buffer.from(rawPayload, 'utf8'), (err, compressedPayload) => {
                if (err) reject(err);
                resolve(compressedPayload);
            });
        });
    }

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

    private logsWritablePredicate(): boolean {
        return this.minLogItemsExceeded()
    }

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
            this.internalLog('warn', `Log to send to JSON contains ${Object.getOwnPropertyNames(log)} / ${MAX_ATTRIBUTES_PER_EVENT} attributes.`);
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
                    this.internalLog('warn', `NR Log attribute length overflow. Length: ${value.length}/${MAX_ATTRIBUTE_VALUE_LENGTH}`);
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

    private createLogCheckTimeout() {
        setTimeout(async () => {
            if (this.logQueue.length > 0) {
                await this.beginWriteLogs();
                this.createLogCheckTimeout();
            }
        }, this.config.logPushFrequency)
    }

    private registerAppDeathLogPush() {
        let finalWritten = false;
        process.on('exit', () => {
            let o = finalWritten;
            finalWritten = true;
            if (o) return;

            this.internalLog('info', 'writing final logs');
            this.writeLogsSync();
        });

        process.on('SIGINT', () => {
            process.exit(2);
        });

        process.on('uncaughtException', (e) => {
            this.internalLog('error', e.stack || '');
        });

        process.on('SIGTERM', () => {
            this.writeLogsSync();
        })
    }
}

(async () => {
    const { withLogger } = await import('./logger');
    log = withLogger('test');
    while(internalLogBuffer.length) {
        const [level, message] = internalLogBuffer.shift() as [string, string];
        (log as any)[level](message);
    }
})();

