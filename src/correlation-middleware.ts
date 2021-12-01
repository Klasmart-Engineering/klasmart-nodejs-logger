import { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AsyncLocalStorage } from 'async_hooks';

export const DEFAULT_CORRELATION_HEADER = 'x-correlation-id'

const localStorage = new AsyncLocalStorage<string>();

/**
 * Creates a middleware function to extract a correlation ID from an incoming request or to create
 * a correlation ID if no such ID exists
 * 
 * @param header -  
 * @returns 
 */
export function correlationMiddleware(header = DEFAULT_CORRELATION_HEADER) {
    return (request: Request, response: Response, next: NextFunction) => {
        let correlationId = request.headers[header] as string || generateCorrelationId();
        localStorage.run(correlationId, async () => {
            next();
        });
    }
}

const generateCorrelationId = () => uuidv4();

export function withCorrelation() {
    return localStorage.getStore();
}