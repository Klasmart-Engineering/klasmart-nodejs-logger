import 'babel-polyfill';
import { correlationMiddleware, withCorrelation, DEFAULT_CORRELATION_HEADER } from './correlation-middleware';
import { withLogger, KLLogger } from './logger';
import { NewRelicLogDeliveryAgent } from './LogDeliveryAgent';

export {
    correlationMiddleware,
    withCorrelation,
    withLogger,
    NewRelicLogDeliveryAgent,
    KLLogger,
    DEFAULT_CORRELATION_HEADER
};
