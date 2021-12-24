import { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AsyncLocalStorage } from 'async_hooks';
import http, { IncomingMessage } from 'http';
import https, { RequestOptions } from 'https';

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
        response.setHeader(header, correlationId);
        localStorage.run(correlationId, async () => {
            next();
        });
    }
}

const generateCorrelationId = () => uuidv4();

export function withCorrelation() {
    return localStorage.getStore();
}

/**
 * Adds hooks to http/https modules to automatically attach a correlation
 * ID to outgoing requests
 */
function attachCorrelationIDHook(module: typeof http | typeof https) {
    let actualCall = module.request;

    function request(options: RequestOptions | string | URL, callback?: (res: http.IncomingMessage) => void): http.ClientRequest;
    function request(url: string | URL, options: RequestOptions, callback?: (res: http.IncomingMessage) => void): http.ClientRequest;
    function request(
        url: string | URL | RequestOptions, 
        options: RequestOptions | ((res: http.IncomingMessage) => void) | undefined,
        callback?: (res: http.IncomingMessage) => void | undefined
    ) {
        // Logic around painful overloading
        let actualUrl: string | URL;
        let actualOptions: RequestOptions;
        let actualCallback: ((res: http.IncomingMessage) => void) | undefined;;
        
        if (url instanceof URL || typeof url === 'string') {
            actualUrl = url;
            actualOptions = options as RequestOptions;
            actualCallback = callback;
        } else {
            actualOptions = url;
            actualCallback = options as (res: http.IncomingMessage) => void;
        }

        // Get correlation ID
        const correlationId = withCorrelation();

        // Case: Headers object is present but no correlationID provided
        if (correlationId && actualOptions.headers && !actualOptions.headers[DEFAULT_CORRELATION_HEADER]) {
            actualOptions.headers[DEFAULT_CORRELATION_HEADER] = correlationId;
        }

        // Case: Headers option was not passed, add both headers option and correlationID
        if (correlationId && !actualOptions.headers) {
            actualOptions.headers = {};
            actualOptions.headers[DEFAULT_CORRELATION_HEADER] = correlationId;
        }

        // Delegate to wrapped request call
        return actualCall(actualOptions, actualCallback)
    }
    module.request = request;
}

attachCorrelationIDHook(http);
attachCorrelationIDHook(https);