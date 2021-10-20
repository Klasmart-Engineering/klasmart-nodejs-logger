import winston from 'winston';
import { PassThrough } from 'node:stream';
import https from 'https';
import zlib from 'zlib';
import fs from 'fs';

const API_ENDPOINT = process.env.KL_NR_LOG_ENDPOINT || 'https://log-api.eu.newrelic.com/log/v1';
const MAX_PAYLOAD_SIZE = 10**6;
const MAX_ATTRIBUTES_PER_EVENT = 255;
const MAX_ATTRIBUTE_NAME_LENGTH = 255;
const MAX_ATTRIBUTE_VALUE_LENGTH = 4096;

const buffer: String[] = [];

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

export function NewRelicLogForwarderTransport(config?: NewRelicLogForwarderTransportConfig): winston.transport {

    const stream = new PassThrough();
    const minLogItems = config?.minLogItems || 1;
    let timeoutId;
    const compressorConfig: zlib.ZlibOptions = {
        
    }

    const compressor = zlib.createGzip(compressorConfig);
    
    stream.on('data', log => {
        log = patchLog(log);
        compressor.write(log);

        if (compressor.bytesWritten > (config?.bytesWrittenThreshold || 10000)) {
            pushLogs();        
        }

    });



    /**
     * Fixes possible issues in log format caused by limitations of NRs logging
     * values
     * @param log 
     * @returns 
     */
    function patchLog(log: string) {

        // Object form of log message
        const obj = JSON.parse(log);
        
        // Track whether modifications are made
        let modified = false;
        if (Object.getOwnPropertyNames(obj).length > MAX_ATTRIBUTES_PER_EVENT) {
            console.warn(`Log to send to JSON contains ${Object.getOwnPropertyNames(obj)} / ${MAX_ATTRIBUTES_PER_EVENT} attributes.`);
        }
        
        for (let key of Object.keys(obj)) {
            const value = obj[key];
            // replace key with length too high
            if (key.length > MAX_ATTRIBUTE_NAME_LENGTH) {
                const newKey = key.slice(0, MAX_ATTRIBUTE_NAME_LENGTH);
                Object.defineProperty(obj, key.slice(0, MAX_ATTRIBUTE_NAME_LENGTH), 
                    Object.getOwnPropertyDescriptor(obj, key as PropertyKey) as PropertyDescriptor);
                delete obj.key;

                // Update key name for usage in later steps
                key = newKey;
                modified = true;
            }

            // Concatenate log messages with length greater than MAX_ATTRIBUTE_VALUE_LENGTH
            if (typeof value === 'string' && value.length > MAX_ATTRIBUTE_VALUE_LENGTH) {
                if (config?.warnOnAttributeLengthOverflow) {
                    console.warn(`NR Log attribute length overflow. Length: ${value.length}/${MAX_ATTRIBUTE_VALUE_LENGTH}`);
                }
                obj.key = value.slice(0, MAX_ATTRIBUTE_VALUE_LENGTH); 
                modified = true;
            }

            if (key.includes(' ')) {
                const newKey = key.replaceAll(' ', '.');
                Object.defineProperty(obj, key.slice(0, MAX_ATTRIBUTE_NAME_LENGTH), 
                    Object.getOwnPropertyDescriptor(obj, key as PropertyKey) as PropertyDescriptor);
                delete obj.key;

                // Update key name for usage in later steps
                key = newKey;
                modified = true;
            };
        }

        // If we made changes stringify the new object data, otherwise return the original log
        return modified 
            ? JSON.stringify(obj)
            : log;
    }

    function pushLogsTimeout(frequency = 10_000) {
        setTimeout(async () => {
            if (logsPushable()) {
                await pushLogs();
                timeoutId = pushLogsTimeout();
            }
        }, frequency);
    }
    
    function logsPushable(): boolean {
        if (buffer.length < minLogItems) return false;
        return true;
    }

    const pushLogs = async (): Promise<void> => {
        const options = {
            hostname: API_ENDPOINT,
            method: 'POST',
            headers: {
                'Content-Type': 'application/gzip',
            }            
        };
        const req = https.request(options, res => {
        })

        compressor.pipe(req);

    }

    const localWriteLogs = async (): Promise<void> => {
        const output = fs.createWriteStream('./test.log', { flags: 'a', autoClose: true });
        output.on('close', () => {
            compressor.unpipe();
        })
        compressor.pipe(output);
    }

    const getPushableData = () => {
        const sendableData = [];
        let totalSize = 0;
        while(buffer.length !== 0) {
            if (totalSize + totalSize <= MAX_PAYLOAD_SIZE) {
                const message = buffer.shift() as string;
                totalSize += message.length;
                sendableData.push(message);
            } else break;
        }

        return sendableData;
    }

    // Start timeouts to check
    timeoutId = pushLogsTimeout();

    return stream;
}

