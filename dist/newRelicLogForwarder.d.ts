import winston from 'winston';
interface NewRelicLogForwarderTransportConfig {
    /**
     * How frequently checks should be run to push logs to NR
     */
    logPushFrequency?: number;
    /**
     * Minimum number of log statements written before logs can be pushed to NR
     */
    minLogItems?: number;
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
export declare function NewRelicLogForwarderTransport(config?: NewRelicLogForwarderTransportConfig): winston.transport;
export {};
//# sourceMappingURL=newRelicLogForwarder.d.ts.map