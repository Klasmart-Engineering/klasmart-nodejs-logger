import http, { ClientRequest, Server } from 'http';
import https from 'https';
import { correlationContextWrapper } from '../src/correlation-middleware';
import express, { Request, Response } from 'express';


describe(`outgoing correlation IDs`, () => {
let server: Server;

    /* Create a server for created requests to be sent to */
    beforeAll((ready) => {
        const app = express();
        app.use((req: Request, response: Respones, next) =>{
            next();
        })
        app.use((_: Request, response: Response) => response.sendStatus(200));
        console.log('starting test server');
        server = app.listen(80, () => {
            ready();
        });
    })

    afterAll(() => {
        server.close();
    })

    const modules: [string, typeof http | typeof https][] = [
        ['http', http],
        ['https', https]
    ]

    modules.forEach(([name, module]) => {
        describe(name, () => {
            describe('with correlation ID configured', () => {
                it('should create a request with an x-correlation-id header when no params passed', done => {
                    const correlationId = '1234';
                    let request: ClientRequest;

                    correlationContextWrapper(correlationId, () => {                        
                        request = http.request('http://google.com');
                        request.on('error', (err) => {})
                        
                        expect(request.getHeaders()['x-correlation-id']).toEqual(correlationId);
                        expect(request.getHeaders()).toBeDefined();
                        request.end();
                        done();
                    });
                });

                it('should create a request with an x-correlation-id header when params are passed with no headers object provided', done =>  {
                    const correlationId = '5678';
                    let request: ClientRequest;
                    correlationContextWrapper(correlationId, () => {
                        request = http.request({
                            host: 'localhost',
                            protocol: 'http:'
                        });
                        request.on('error', (err) => {})

                        expect(request.getHeaders()).toBeDefined();
                        expect(request.getHeaders()['x-correlation-id']).toEqual(correlationId);
                        done();
                    });
                });

                it('should create a request with an x-correlation-id header when params are passed along with headers object', done => {
                    const correlationId = '9102';
                    let request: ClientRequest;
                    const headerValue = 'TEST_SERVICE';
                    correlationContextWrapper(correlationId, () => {
                        request = http.request({
                            host: 'localhost',
                            protocol: 'http:',
                            headers: {
                                'x-service-id': headerValue
                            }
                        });
                        request.on('error', (err) => {})

                        expect(request.getHeaders()).toBeDefined();
                        expect(request.getHeaders()['x-correlation-id']).toEqual(correlationId);
                        expect(request.getHeaders()['x-service-id']).toEqual(headerValue);
                        done();
                    });
                });
            });

            describe('without correlation ID configured', () => {
                it('should create a request with with no x-correlation-id header when no config object is provided', done => {
                    let request: ClientRequest;

                    request = http.request('http://google.com');
                    request.on('error', (err) => {})
                    
                    expect(request).toBeDefined();
                    expect(request.getHeaders()['x-correlation-id']).toBeUndefined();
                    request.end();
                    done();
                });

                it('should create a request with an x-correlation-id header when params are passed with no headers object provided', done =>  {
                    let request: ClientRequest;
                    request = http.request({
                        host: 'localhost',
                        protocol: 'http:'
                    });
                    request.on('error', (err) => {})

                    expect(request).toBeDefined();
                    expect(request.getHeaders()['x-correlation-id']).toBeUndefined();
                    done();
                });

                it('should create a request with an x-correlation-id header when params are passed along with headers object', done => {
                    let request: ClientRequest;
                    const headerValue = 'TEST_SERVICE';
                    request = http.request({
                        host: 'localhost',
                        protocol: 'http:',
                        headers: {
                            'x-service-id': headerValue
                        }
                    });
                    request.on('error', (err) => {})

                    expect(request.getHeaders()).toBeDefined();
                    expect(request.getHeaders()['x-correlation-id']).toBeUndefined();
                    expect(request.getHeaders()['x-service-id']).toEqual(headerValue);
                    done();
                });
            })
        });
    })

});