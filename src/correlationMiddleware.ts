import { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { createNamespace } from 'cls-hooked';

const namespace = createNamespace('correlation');

/**
 * Creates a middleware function to extract a correlation ID from an incoming request or to create
 * a correlation ID if no such ID exists
 * 
 * @param header -  
 * @returns 
 */
export function correlationMiddleware(header = 'x-correlation-id') {
    return (request: Request, response: Response, next: NextFunction) => {
        let correlationId = request.headers[header];
        if (!correlationId) {
            correlationId = generateCorrelationId();
        }
        namespace.run(() => {
            namespace.set('correlationId', correlationId);
        });
        next();
    }
}

const generateCorrelationId = () => uuidv4();

export function withCorrelation() {
    return namespace.get('correlationId');
}