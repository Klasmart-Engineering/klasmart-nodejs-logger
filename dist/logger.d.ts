import winston, { Logger } from 'winston';
export declare type KLLogger = winston.Logger;
export declare type NPMLoggingLevels = 'silly' | 'debug' | 'verbose' | 'http' | 'info' | 'warn' | 'error';
export declare const withLogger: (label: string, level?: NPMLoggingLevels | undefined) => Logger;
//# sourceMappingURL=logger.d.ts.map