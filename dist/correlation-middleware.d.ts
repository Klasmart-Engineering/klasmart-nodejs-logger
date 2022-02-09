import { NextFunction, Request, Response } from 'express';
export declare const DEFAULT_CORRELATION_HEADER = "x-correlation-id";
/**
 * Creates a middleware function to extract a correlation ID from an incoming request or to create
 * a correlation ID if no such ID exists
 *
 * @param header -
 * @returns
 */
export declare function correlationMiddleware(header?: string): (request: Request, response: Response, next: NextFunction) => void;
/**
 * Utility function to provide access to correlation ID tracking in the
 * wrapped async context. Consumers may manually supply the correlation ID or
 * this function will generate a correlation ID as a v4 UUID.
 */
export declare function correlationContextWrapper(correlationId: string, callback: () => any): Promise<void>;
export declare function correlationContextWrapper(callback: () => any): Promise<void>;
export declare function withCorrelation(): string | undefined;
//# sourceMappingURL=correlation-middleware.d.ts.map