import { Logger } from 'winston';
declare type NPMLoggingLevels = 'silly' | 'debug' | 'verbose' | 'http' | 'info' | 'warn' | 'error';
export declare const withLogger: (label: string, level?: NPMLoggingLevels | undefined) => Logger;
export {};
//# sourceMappingURL=logger.d.ts.map