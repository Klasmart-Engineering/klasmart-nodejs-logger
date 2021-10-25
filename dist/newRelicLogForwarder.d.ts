/// <reference types="node" />
import Transport from 'winston-transport';
interface UniqueNewRelicLogTransportOptions {
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
    /**
     * Log level of internal logger, pass this value if you want the logger
     * used in the NewRelicLogForwarder module to be different than the global
     * default logging level.
     * Default is undefined.
     */
    internalLogLevel?: 'silly' | 'debug' | 'verbose' | 'http' | 'info' | 'warn' | 'error' | undefined;
}
declare type NewRelicLogTransportOptions = UniqueNewRelicLogTransportOptions & Transport.TransportStreamOptions;
export declare class NewRelicLogTransport extends Transport {
    private static readonly gzipOpts;
    private config;
    private logQueue;
    private logLengthQueue;
    private totalLengthCount;
    private globalAttributes;
    constructor(opts: NewRelicLogTransportOptions, globalAttributes: {
        [key: string]: string;
    });
    /**
     * Function to write logs that are internal to this module.
     * Buffers calls until the Winston logger can be async importd
     * Afterwords, writes logs directly to the logger
     * @param level
     * @param message
     */
    internalLog(level: string, message: string): void;
    log(info: any, callback: (() => void) | undefined): void;
    private writeLogsSync;
    private logsWritten;
    writeLogsToFileSystem(buffer: Buffer): void;
    private beginWriteLogs;
    private sendLogs;
    private buildRawPostBody;
    private compressPayload;
    private sliceLogs;
    private immediateLogWritablePredicate;
    private logsWritablePredicate;
    private minLogItemsExceeded;
    /**
     * Fixes possible issues in log format caused by limitations of NRs logging
     * values
     * @param log
     * @returns
     */
    private logTransform;
    private createLogCheckTimeout;
    private registerAppDeathLogPush;
}
export {};
//# sourceMappingURL=newRelicLogForwarder.d.ts.map