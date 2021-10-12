import request from 'supertest';
import Express from 'express';
import { correlationMiddleware, withCorrelation } from '../src';
import { v4 as uuidv4 } from 'uuid';

const app = Express();
const stub = jest.fn();

app.use(correlationMiddleware());
app.use((_, response) => {
    stub(withCorrelation());
    response.sendStatus(200);
});

describe('correlationMiddleware', () => {
    it('should make a new correlationId available from withCorrelation when the x-correlation-id header is not defined', async () => {
        await request(app)
            .get('some/url')
            .expect(200);
        
        expect(stub.mock.calls[0][0]).toBeInstanceOf(String);
    });

    it('should make a new correlationId available from withCorrelation when the x-correlation-id header is not defined', async () => {
        const uuid = uuidv4();

        await request(app)
            .get('some/url')
            .set('x-correlation-id', uuid)
            .expect(200);
        
        expect(stub.mock.calls[0][0]).toEqual(uuid);
    });
})