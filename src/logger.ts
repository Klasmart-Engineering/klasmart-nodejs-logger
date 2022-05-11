// @ts-ignore
import newrelicFormatter from '@newrelic/winston-enricher';
import winston, { Logger } from 'winston';
import { withCorrelation } from './correlation-middleware';
import { NewRelicLogTransport } from './NewRelicLogTransport';
import { NewRelicLogDeliveryAgent } from './LogDeliveryAgent';

export type KLLogger = winston.Logger
export type NPMLoggingLevels = 'silly' | 'debug' | 'verbose' | 'http' | 'info' | 'warn' | 'error';
type LogStyle = 'STRING_COLOR' | 'STRING' | 'JSON' | 'SILENT' | 'NEW_RELIC';

// Queue for logs prior to logger creation
const logStyles: LogStyle[] = ['STRING_COLOR', 'STRING', 'JSON', 'SILENT', 'NEW_RELIC'];
const defaultLogStyle: LogStyle = logStyles[0];

const stdoutFormat = winston.format.printf(({ level, message, label, timestamp, ...meta }) => {
    if (message as any instanceof Object) {
        message = JSON.stringify(message);
    }
    let result = `${timestamp} [${label}] ${level}: ${message}`
    if (meta) {
        const metaJson = JSON.stringify(meta);

        // Don't write metadata if the JSON string was empty due to undefined values, eg: { correlationId: undefined }
        if (metaJson.length > 2) 
            result += ` ${metaJson}`
    }
    return result
});

const correlationIdFormat = winston.format(info => {
    info.correlationId = withCorrelation();
    return info;
});

const getNewRelicLogTransport: () => NewRelicLogTransport | undefined = () => {
    messages.push(['silly', 'Attempting retrieval of NewRelicLogDeliveryAgent instance']);
    let instance = NewRelicLogDeliveryAgent.getInstance();
    if (instance) {
        return instance.getLogTransport();
    }
    messages.push(['debug', 'No NewRelicLogDeliveryAgent defined, initializing instance']);
    const transport = NewRelicLogDeliveryAgent.initialize()?.getLogTransport();
    transport?.setMaxListeners(Infinity);
    messages.push(['silly', `Transport created`]);
    return transport;
}

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
const messages: [NPMLoggingLevels, string][] = [];
const [logStyle, message] = getLogStyleOption();
messages.push(['info', message]);
export const withLogger = (label: string, level?: NPMLoggingLevels): KLLogger => {
    switch(logStyle) {
        case 'JSON':            return createJsonLogger(label, level);
        case 'STRING':          return createStringLogger(label, level);
        case 'STRING_COLOR':    return createColorStringLogger(label, level);
        case 'SILENT':          return createSilentLogger(label, level);
        case 'NEW_RELIC':       return createNewRelicLogger(label, level);
    }
}

const createNewRelicLogger = (label: string, level?: NPMLoggingLevels) => {
    if (!process.env.NEW_RELIC_LICENSE_KEY) {
        messages.push(['warn', 'NEW_RELIC logging style configured but NEW_RELIC_LICENSE_KEY is not defined! Falling back to JSON logger.']);
        return createJsonLogger(label,level);
    }

    return winston.loggers.add(label, {
        level: level ?? defaultLoggingLevel,
        format: winston.format.combine(
            ...defaultLoggers(label),
            newrelicFormatter()
        ),
        transports: [ getNewRelicLogTransport() as winston.transport ]
    });
}


const createJsonLogger = (label: string, level?: NPMLoggingLevels) => {
    
    return winston.loggers.add(label, {
        level: level ?? defaultLoggingLevel,
        format: winston.format.combine(
            ...defaultLoggers(label),
            newrelicFormatter()
        ),
        transports: [ new winston.transports.Console() ]
    });
}

const createStringLogger = (label: string, level?: NPMLoggingLevels) => {
    return winston.loggers.add(label, {
        level: level ?? defaultLoggingLevel,
        format: winston.format.combine(
            ...defaultLoggers(label),
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
            ...defaultLoggers(label),
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


const defaultLoggers = (label: string): winston.Logform.Format[] => [
    correlationIdFormat(),
    winston.format.label({ label }),
    winston.format.timestamp(),
    winston.format.splat(),
] 

const log = withLogger('logger');
messages.push(['debug', 'Internal logger initialized']);
while(messages.length > 0) {
    const [level, message] = messages.shift() as [NPMLoggingLevels, string];
    log[level](message);
}
