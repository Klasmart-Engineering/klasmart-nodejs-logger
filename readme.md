# Kidsloop NodeJS Logger

This is a utility logging package that wraps around [Winston logger](https://github.com/winstonjs/winston). The goal of this module is to provide an easy to use package that will produce consistent logging for aggregation while also allowing for formats that are convenient for local development work. Additionally, the module can assist with distributed tracing by providing a mechanism for propagating correlation data for consumption by New Relic.

## Usage

### Logger

#### Basic Setup
To get a logging instance, use `withLogger` and pass in a label for the logger intance - generally this can be the file or classname, but can be any label that provides appropriate context for logs.

```
import { withLogger } from 'kidsloop-nodejs-logger';
const log = withLogger('my-module');

log.info('logger configured');

// with string interpolation
// outputs "info: test message first second"
logger.log('info', 'test message %s, %s', 'first', 'second');
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
LOG_STYLE - One of: [STRING_COLOR, STRING, JSON, SILENT, NEW_RELIC]. Default: STRING_COLOR. Configures Winston format used for logs. Value explanation:

* STRING_COLOR: Provides simple string interpolated logs with color enhancement. Recommended for viewing logs in a local terminal.
* STRING: Similar to STRING_COLOR format but lacks color encoding. Useful for environments where Strings are preferred but color encoding characters are not processed.
* JSON: Logs are written in JSON format. Reports logs in JSON format.
* SILENT: Disabled logging mode. Useful for when you want to run code where logs may be clutter, for instance general unit test runs.
* NEW_RELIC: JSON logs enhanced with the Winston New Relic log extender. When configured to NEW_RELIC a LogDeliveryAgent will be configured that will attempt to send logs written to winston and through stdout and stderr to New Relic. This is the recommended setting for deployed apps that are configured to use New Relic. Note: This setting will fall back to JSON if there is insufficient configuration for New Relic (lacking NEW_RELIC_LICENSE_KEY or NEW_RELIC_APP_NAME).


LOG_LEVEL - One of: [silly, debug, verbose, http, info, warn, error]. Default: debug. Configures minimum log level for the application. Logger instances that are not provided specific log levels will log to this application default. The value is a mimimum. Logs at the specified level and above will be written and log statements below this level will not be written.

LEVEL - Alternative to LOG_LEVEL provided for convenience when migrating from the `debug` logging library. If both LOG_LEVEL and LEVEL are defined, then the value of LOG_LEVEL will be used.

KL_NR_LOG_HOSTNAME - Hostname for New Relic Log API. Defaults to `log-api.eu.newrelic.com`.

KL_NR_LOG_PATH - Path part of New Relic Log API. Defaults to `/log/v1`.

LOG_DELIVERY_AGENT_LEVEL - Value read to configure the logging level of the LogDeliveryAgent. Useful for debugging the behavior of log delivery. Should be one of values listed in the Logging Levels section. Defaults to 'warn'.

DEBUG_WRITE_LOGS_TO_FILE - When set to 'true' the LogDeliveryAgent will write logs to a debug file rather than sending them to NewRelic. Useful for debugging LogDeliveryAgent's behavior. Not recommended for general usage.

SERVICE_LABEL - Optional. Used to provide a 'service' label for logs delivered to New Relic.  This is the highest priority value for the service label, if not provided it will fallback to component tags in NEW_RELIC_LABELS, the value of NEW_RELIC_APP_NAME, and then 'undefined' in that order.

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


### Log Delivery
This module includes functionality to collect and deliver logs to New Relic when sufficient configuration exists. Logs are collected both from logs directly written to Winston and logs written to stdout/stderr. Logs from Winston will be delivered even if they are not being written to stdout.

In order to enable log delivery, the application must have sufficient configuration to enable the newrelic module (NEW_RELIC_LICENSE_KEY and NEW_RELIC_APP_NAME must be defined) and the logging mode must be configured to NEW_RELIC. If this is defined, then an instance of LogDeliveryAgent will be configured. The LogDeliveryAgent exposes a Winston transport to feed logs to itself and creates stdout/stderr bypasses to collect logs written using the default console and process.stdout.write(...)/.stderr.write(...) functions.

In order to maximize log collection, the LogDeliveryAgent will start up immediately upon the import of the withLogger function. Generally it is recommended to do this right after the newrelic module is imported or soon after. The LogDeliveryAgent assumes a default configuration upon initialization so that it can begin collecting logs, but this configuration can be altered at any time by importing the agent:

```
import { NewRelicLogDeliveryAgent } from 'kidsloop-nodejs-logger';

NewRelicLogDeliveryAgent.initialize()
NewRelicLogDeliveryAgent.configure({})
```

Logs are labeled with several pieces of metadata to help with aggregating and filtering logs on New Relic.  The general recommendation is to ensure that deployed services include a NEW_RELIC_LABEL environment variable with the following properties correctly defined:

* Component
* Environment
* Region
* Version

This values will be read and included as global log parameters when payloads are sent to the NR under the following labels:

* service
* environment
* region
* version

This allows for aggregation and filtering along several dimensions as well as easily confirming deployment details of the service when looking at logs. For example, filtering logs to only the pdf-service alpha deployments could be done by including the following in the NR logs toolbar: `"service":"pdf-service" "environment":"alpha"`

See NewRelicLogDeliveryAgentConfig for configuration options.