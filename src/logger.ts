// @ts-ignore
import newrelicFormatter from '@newrelic/winston-enricher';
import winston, { Logger } from 'winston';
import { withCorrelation } from './correlationMiddleware';
import { NewRelicLogTransport } from './newRelicLogForwarder';

type NPMLoggingLevels = 'silly' | 'debug' | 'verbose' | 'http' | 'info' | 'warn' | 'error';
type LogStyle = 'STRING_COLOR' | 'STRING' | 'JSON' | 'SILENT';

const logStyles: LogStyle[] = ['STRING_COLOR', 'STRING', 'JSON', 'SILENT'];
const defaultLogStyle: LogStyle = logStyles[0];

const stdoutFormat = winston.format.printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level}: ${message}`
})

const correlationIdFormat = winston.format(info => {
    info.correlationId = withCorrelation();
    return info;
});

const getLogStyleOption = (): [LogStyle, string] => {
    if (!process.env.LOG_STYLE) {
        return [
            defaultLogStyle,
            `Using default log style: ${defaultLogStyle}. Override this using the LOG_STYLE environment variable. Valid values are: ${logStyles}.`]
    }

    if (logStyles.includes(process.env.LOG_STYLE.toUpperCase().trim() as LogStyle)) {
        return [
            process.env.LOG_STYLE as LogStyle,
            `Using log style: ${process.env.LOG_STYLE}`
        ];
    }

    return [
        defaultLogStyle,
        `Unrecognized log style: ${process.env.LOG_STYLE}. Using default log style: ${defaultLogStyle}. Valid log styles are: ${logStyles}`
    ]
}

const defaultLoggingLevel = process.env.LOG_LEVEL ?? process.env.LEVEL ?? 'debug';
const [logStyle, message] = getLogStyleOption();

export const withLogger = (label: string, level?: NPMLoggingLevels): Logger => {
    console.log(label);
    switch(logStyle) {
        case 'JSON': return createJsonLogger(label, level);
        case 'STRING': return createStringLogger(label, level);
        case 'STRING_COLOR': return createColorStringLogger(label, level);
        case 'SILENT': return createSilentLogger(label, level);
    }
}

const createJsonLogger = (label: string, level?: NPMLoggingLevels) => {
    console.log(label);
    return winston.loggers.add(label, {
        level: level ?? defaultLoggingLevel,
        format: winston.format.combine(
            correlationIdFormat(),
            winston.format.label({ label }),
            winston.format.timestamp(),
            newrelicFormatter()
        ),
        
        transports: [
            new winston.transports.Console(),
            new NewRelicLogTransport({}, {})
        ]
    });
}

const createStringLogger = (label: string, level?: NPMLoggingLevels) => {
    return winston.loggers.add(label, {
        level: level ?? defaultLoggingLevel,
        format: winston.format.combine(
            correlationIdFormat(),
            winston.format.label({ label }),
            winston.format.timestamp(),
            stdoutFormat
        ),
        transports: [
            new winston.transports.Console()
        ]
    });
}

const createColorStringLogger = (label: string, level?: NPMLoggingLevels) => {
    return winston.loggers.add(label, {
        level: level ?? defaultLoggingLevel,
        format: winston.format.combine(
            correlationIdFormat(),
            winston.format.label({ label }),
            winston.format.timestamp(),
            winston.format.colorize(),
            stdoutFormat
        ),
        transports: [
            new winston.transports.Console()
        ]
    });
}

const createSilentLogger = (label: string, level?: NPMLoggingLevels) => {
    return winston.loggers.add(label, {
        silent: true,
        level: level ?? defaultLoggingLevel,
        transports: [
            new winston.transports.Console()
        ]
    });
}

const log = withLogger('logger');
log.info(message);
winston