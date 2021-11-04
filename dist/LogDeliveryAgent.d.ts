/// <reference types="node" />
import { NewRelicLogTransport } from './NewRelicLogTransport';
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
export declare class NewRelicLogDeliveryAgent {
    /**
     * Initializes a NewRelicLogDeliveryAgent instance if the LOG_STYLE environment
     * variable is set to NEW_RELIC. Otherwise it does nothing.
     * @param config
     * @returns
     */
    static initialize(): NewRelicLogDeliveryAgent | undefined;
    static getInstance(): NewRelicLogDeliveryAgent;
    static configure(config: NewRelicLogDeliveryAgentConfig): void;
    static getWinstonTransport(): (log: any) => void;
    private static instance;
    private logQueue;
    private config;
    private logLengthQueue;
    private totalLengthCount;
    private globalAttributes;
    private newRelicLogTransport;
    private debugMode;
    private timeoutId;
    private logsWritten;
    private newRelicInitialized;
    standardOutPassThrough: StandardOutPassThrough;
    private constructor();
    /**
     * Accessor for Winston Transport that writes to this
     * agent instance
     * @returns winston.transport
     */
    getLogTransport(): NewRelicLogTransport;
    /**
     * Shutsdown the delivery agent. This can be utilized when app is expected to shutdown
     * at a given time and the periodic delivery timeout is blocking shutdown.
     *
     * Clears internal timeout, configures winston transport to not send logs.
     * Reconnects stdout and stderr.
     * Writes any remaining logs.
     */
    shutdown(): void;
    /**
     * Determine if the log string or object is a New Relic
     * compatible JSON. In order to be considered this it must
     * be a well structured JSON object with a top level 'message'
     * and 'level' property.
     * @param str
     * @returns object form of JSON or false
     */
    private isNRCompatibleJsonLogString;
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
    private addLog;
    /**
     * Handler for processing a log statement when it is formatted
     * as a New Relic compatible JSON string.
     * @param log
     */
    processAsJsonLog(log: any): void;
    /**
     * Handler for processing a log statement that is a simple
     * string format.
     * @param log
     */
    processAsStringLog(log: string): void;
    /**
     * Set global attributes for the application.  This should
     * generally be configured early in the application lifecycle.
     * Global attributes will be bound to all log statements
     * in New Relic.
     * @param attributes KV pairs to be provided to NR with logs
     */
    setGlobalAttributes(attributes: {
        [key: string]: string;
    }): void;
    /**
     * Writes logs synchronously.  This function is intended to be
     * utilized in situations where logging cannot be written
     * asynchronously, most commonly in the handler of a SIGTERM
     * event, which only allows synchronous calls.
     */
    private writeLogsSync;
    writeLogsToFileSystem(buffer: Buffer): void;
    private beginWriteLogs;
    /**
     * Handles HTTP request that sends compressed log data
     * to the New Relic endpoint.
     * @param compressedPayload
     */
    private sendLogs;
    /**
     * Creates the greater object structure for a log delivery
     * payload and attaches an array of logs to it. Returns
     * stringified.
     * @param logs
     * @returns
     */
    private buildRawPostBody;
    /**
     * Asynchronously compress string to gzip compressed data.
     * @param rawPayload
     * @returns
     */
    private compressPayload;
    /**
     * Slices log queue.
     * Will prefer to use the entire log queue when possible, but
     * may send only a subsection if the size of the data is near
     * the limitations defined by New Relic's API.
     * @returns
     */
    private sliceLogs;
    /**
     * Predicate to determine if logs should be written be written immediately.
     * @returns boolean
     */
    private immediateLogWritablePredicate;
    /**
     * Predicate to determine if logs should be written on next periodic check.
     * @returns boolean
     */
    private logsWritablePredicate;
    /**
     * Predicate to determine if the total logs have exceeded a configured minLog
     * count value if such a value is configured.
     * @returns
     */
    private minLogItemsExceeded;
    /**
     * Fixes possible issues in log format caused by limitations of NRs logging
     * values
     * @param log
     * @returns
     */
    private logTransform;
    /**
     * Function used to repeatedly trigger log pushes
     */
    private createLogCheckTimeout;
    /**
     * Helper method that registers listeners for events
     * related to imminent application shutdown so that
     * final logs can be pushed
     */
    private registerAppDeathLogPush;
    /**
     * New Relic does not expose a method to check its initialization status
     * If we push logs before New Relic initializes, they will not have an attached
     * entity guid.  For this reason we will initialize an interval that can run until
     * it is initialized.
     */
    private registerNewRelicInitializationInterval;
}
/**
 * Replaces existing writers for stdout and stderr with
 * PassThrough streams that will invoke provided callbacks
 * with the data prior to passing them to the original streams
 */
declare class StandardOutPassThrough {
    private readonly stdoutPt;
    private readonly stderrPt;
    private readonly stdout;
    private readonly stderr;
    private readonly writeStdout;
    private readonly writeStderr;
    constructor(stdoutCb: (data: string) => void, stderrCb: (data: string) => void);
    /**
     * Reaffix the replaced stdout and stderr then
     * closes all streams owned by this instance.
     */
    destroy(): void;
    /**
     * Bypass the configured callback function for stdout by
     * writing directly to the detached output stream
     * @param data
     */
    stdoutBypass(data: string | object): void;
    /**
     * Bypass the configured callback function for stderr by
     * writing directly to the detached output stream
     * @param data
     */
    stderrBypass(data: string): void;
}
export {};
//# sourceMappingURL=LogDeliveryAgent.d.ts.map