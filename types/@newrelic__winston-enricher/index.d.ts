import type { TransformFunction } from 'logform';

declare module "@newrelic/winston-enricher" {
    let newrelicFormatter: TransformFunction
    export default newrelicFormatter;
}
