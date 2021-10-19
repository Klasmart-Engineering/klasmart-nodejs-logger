# Kidsloop NodeJS Logger

This is a utility logging package that wraps around Winston logger. The goal of this module is to provide an easy to use package that will produce consistent logging for aggregation while also allowing for formats that are convenient for local development work. Additionally, the module can assist with distributed tracing by providing a mechanism for propagating correlation data for consumption by New Relic.

## Usage

### Logger

#### Basic Setup
To get a logging instance, use `withLogger` and pass in a label for the logger intance - generally this can be the file or classname, but can be any label that provides appropriate context for logs.

```
import { withLogger } from 'kidsloop-nodejs-logger';
const log = withLogger('my-module');

log.info('logger configured');
```

#### Logging Levels
This package uses NPM logging levels.  From highest priority to lowest these are:

0. error
1. warn
2. info
3. verbose
4. debug
5. silly

#### Additional Configuration
##### Instance Level Logging Level
A second parameter can be provided to withLogger which provides a logging level specific to that logger. This can be useful for when developers want to focus their attention on logs from specific components or otherwise want more precise control over log levels.

```
// LOG_LEVEL=info
const log = withLogger('logs-info-or-above');
const allLogs = withLogger('logs-everything', 'silly');

log.silly('this log will not be shown');
allLogs.silly('this log will be shown');
```

##### Environment Configuration
LOG_STYLE - One of: [STRING_COLOR, STRING, JSON, SILENT]. Default: STRING_COLOR. Configures Winston format used for logs. Value explanation:

* STRING_COLOR: Provides simple string interpolated logs with color enhancement. Recommended for viewing logs in a local terminal.
* STRING: Similar to STRING_COLOR format but lacks color encoding. Useful for environments where Strings are preferred but color encoding characters are not processed.
* JSON: Logs are written in JSON format. Useful for injestion for automated tooling, aggregate logs. Recommended for deployed services.
* SILENT: Disabled logging mode. Useful for when you want to run code where logs may be clutter, for instance general unit test runs.


LOG_LEVEL - One of: [silly, debug, verbose, http, info, warn, error]. Default: debug. Configures minimum log level for the application. Logger instances that are not provided specific log levels will log to this application default. The value is a mimimum. Logs at the specified level and above will be written and log statements below this level will not be written.

LEVEL - Alternative to LOG_LEVEL provided for convenience when migrating from the `debug` logging library. If both LOG_LEVEL and LEVEL are defined, then the value of LOG_LEVEL will be used.


### Correlation ID Middleware

#### Purpose
A correlation ID is a value utilized to track the processing of a request throughout its propagation between services. A single request could interact with many services, so by filtering by a correlation ID one can filter logs and see the full lifecycle of a request between different services. The correlation ID generally propagated through a header, typically `x-correlation-id`. As this value is useful for logging, tooling is provided to make it easy for developers to manage it.

#### Usage

This module provides an express middlware that will read and store requests' correlation ID or otherwise generate a correlation ID when one is not provided.  To utilize this, simply call the correlation ID higher order function prior to routing your request to final handlers.

```
import Express from 'express';
import { correlationMiddleware } from 'kidsloop-nodejs-logger';

const app = Express();
app.use(correlationMiddleware());
```

If you are using the logger provided in this package, this is all you need to do. Correlation IDs will be managed using AsyncLocalStorage internally and will automatically be added to log statements. You do not need to manually provide the correlation ID to log statements.

#### Retrieving the correlation ID

In the case that you are sending requests out to other services, you should propagate the `x-correlation-id` header with these requests. To retrieve the correlation ID value, use the `withCorrelation` helper function.

```
import { withCorrelation } from 'kidsloop-nodejs-logger`;

const correlationId = withCorrelation();
```

Note: Correlation IDs are only available within the scope of a request. Logs written outside of this scope will have no correlation ID and calls to withCorrelation will return undefined in this scenario.