"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _typeof3 = require("@babel/runtime/helpers/typeof");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NewRelicLogDeliveryAgent = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _fs = _interopRequireDefault(require("fs"));

var _newrelic = _interopRequireDefault(require("newrelic"));

var _zlib = _interopRequireDefault(require("zlib"));

var _NewRelicLogTransport = require("./NewRelicLogTransport");

var _stream = require("stream");

var _axios = _interopRequireDefault(require("axios"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof3(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var API_HOSTNAME = process.env.KL_NR_LOG_HOSTNAME || 'log-api.eu.newrelic.com';
var API_PATH = process.env.KL_NR_LOG_PATH || '/log/v1';
var MAX_PAYLOAD_SIZE = Math.pow(10, 6);
var MAX_ATTRIBUTES_PER_EVENT = 255;
var MAX_ATTRIBUTE_NAME_LENGTH = 255;
var MAX_ATTRIBUTE_VALUE_LENGTH = 4096;
var log;
var internalLogBuffer = [];
/**
 * Function to write logs that are internal to this module.
 * Buffers calls until the Winston logger can be async importd
 * Afterwords, writes logs directly to the logger
 * @param level 
 * @param message 
 */

function internalLog(level, message) {
  if (log) {
    log[level](message);
  } else {
    internalLogBuffer.push([level, message]);
  }
}

var defaultConfig = {
  bytesWrittenThreshold: MAX_PAYLOAD_SIZE * 4 / 5,
  warnOnAttributeLengthOverflow: false,
  minBytesWritten: MAX_PAYLOAD_SIZE * 1 / 5,
  minLogItems: 2,
  logPushFrequency: 60000,
  minLogItemsToForce: 100
};

var NewRelicLogDeliveryAgent = /*#__PURE__*/function () {
  function NewRelicLogDeliveryAgent() {
    var _this = this;

    (0, _classCallCheck2["default"])(this, NewRelicLogDeliveryAgent);
    (0, _defineProperty2["default"])(this, "appLabel", void 0);
    (0, _defineProperty2["default"])(this, "regionLabel", 'undefined');
    (0, _defineProperty2["default"])(this, "environmentLabel", 'undefined');
    (0, _defineProperty2["default"])(this, "versionLabel", 'undefined');
    (0, _defineProperty2["default"])(this, "logQueue", []);
    (0, _defineProperty2["default"])(this, "config", void 0);
    (0, _defineProperty2["default"])(this, "logLengthQueue", []);
    (0, _defineProperty2["default"])(this, "totalLengthCount", 0);
    (0, _defineProperty2["default"])(this, "globalAttributes", {});
    (0, _defineProperty2["default"])(this, "newRelicLogTransport", void 0);
    (0, _defineProperty2["default"])(this, "debugMode", process.env.DEBUG_WRITE_LOGS_TO_FILE === 'true');
    (0, _defineProperty2["default"])(this, "timeoutId", void 0);
    (0, _defineProperty2["default"])(this, "logsWritten", 0);
    (0, _defineProperty2["default"])(this, "newRelicInitialized", false);
    (0, _defineProperty2["default"])(this, "standardOutPassThrough", void 0);
    internalLog('debug', 'Initializing LogDeliveryAgent');
    this.config = _objectSpread({}, defaultConfig);
    internalLog('info', "Creating NewRelicLogTransport");
    this.newRelicLogTransport = new _NewRelicLogTransport.NewRelicLogTransport(function (log, cb) {
      return _this.addLog(log, cb);
    }); // Creates logging configuration for rewriting stdout/stderr

    var logCallback = function logCallback(log) {
      _this.addLog(log, function () {});
    };

    var errCallback = function errCallback(log) {
      _this.addLog({
        label: 'error',
        message: log
      }, function () {});
    };

    this.standardOutPassThrough = new StandardOutPassThrough(logCallback, errCallback);
    this.registerAppDeathLogPush();
    this.createLogCheckTimeout();
    this.registerNewRelicInitializationInterval();
    internalLog('debug', 'LogDeliveryAgent Initialized');
    var serviceLabel = process.env.SERVICE_LABEL;
    var component;
    var labels = process.env.NEW_RELIC_LABELS;

    if (labels) {
      var parts = labels.split(';');
      var labelMap = new Map();
      parts.forEach(function (part) {
        var _part$split = part.split(':'),
            _part$split2 = (0, _slicedToArray2["default"])(_part$split, 2),
            label = _part$split2[0],
            value = _part$split2[1];

        labelMap.set(label.toLowerCase(), value);
      });

      if (labelMap.has('region')) {
        this.regionLabel = labelMap.get('region');
      }

      if (labelMap.has('environment')) {
        this.environmentLabel = labelMap.get('environment');
      }

      if (labelMap.has('version')) {
        this.versionLabel = labelMap.get('version');
      }

      component = labelMap.get('component');
    }
    /* 
        Assign label name using the following priorities:
        1. SERVICE_LABEL env value
        2. NEW_RELIC_LABELS env value component part
        3. NEW_RELIC_APP_NAME env value
        4. undefined literal
    */


    this.appLabel = serviceLabel || component || process.env.NEW_RELIC_APP_NAME || 'undefined';
  }
  /**
   * Accessor for Winston Transport that writes to this 
   * agent instance
   * @returns winston.transport
   */


  (0, _createClass2["default"])(NewRelicLogDeliveryAgent, [{
    key: "getLogTransport",
    value: function getLogTransport() {
      return this.newRelicLogTransport;
    }
    /**
     * Shutsdown the delivery agent. This can be utilized when app is expected to shutdown
     * at a given time and the periodic delivery timeout is blocking shutdown.
     * 
     * Clears internal timeout, configures winston transport to not send logs.
     * Reconnects stdout and stderr.
     * Writes any remaining logs.
     */

  }, {
    key: "shutdown",
    value: function shutdown() {
      internalLog('debug', 'Shutdown of LogDeliveryAgent triggered');
      if (this.timeoutId) clearTimeout(this.timeoutId);
      this.standardOutPassThrough.destroy();
      this.newRelicLogTransport.close();
      this.writeLogsSync();
    }
    /**
     * Determine if the log string or object is a New Relic 
     * compatible JSON. In order to be considered this it must
     * be a well structured JSON object with a top level 'message'
     * and 'level' property.
     * @param str 
     * @returns object form of JSON or false
     */

  }, {
    key: "isNRCompatibleJsonLogString",
    value: function isNRCompatibleJsonLogString(str) {
      if ((0, _typeof2["default"])(str) === 'object') {
        str = JSON.stringify(str);
      }

      try {
        var obj = JSON.parse(str); // Rewrite bootstrap object into a format that will work for new relic

        if (obj.msg && obj !== null && obj !== void 0 && obj.name('newrelic_bootstrap') && !obj.message) {
          obj.message = obj.msg;
          obj.level = 'info';
          delete obj.msg;
        }

        if (obj && (0, _typeof2["default"])(obj) === "object") {
          if (obj.message && obj.level) {
            return obj;
          }
        }
      } catch (err) {}

      return false;
    }
    /**
     * Internal function used to accept log statements and
     * process them. Log is typed to any to fit typing for
     * the Winston transport.
     * 
     * TODO: Rework the Winston transport logic to do a bit
     *      more work to provide more consistent typing.
     * 
     * @param log 
     * @param callback 
     */

  }, {
    key: "addLog",
    value: function addLog(log, callback) {
      var jsonData = this.isNRCompatibleJsonLogString(log);

      if (jsonData) {
        this.processAsJsonLog(jsonData);
      } else {
        this.processAsStringLog(log);
      }

      if (this.immediateLogWritablePredicate()) {
        this.beginWriteLogs();
      }

      if (jsonData) log = JSON.stringify(log) + '\n';

      if (jsonData !== null && jsonData !== void 0 && jsonData.message && (jsonData === null || jsonData === void 0 ? void 0 : jsonData.level) === 'error') {
        this.standardOutPassThrough.stderrBypass(log);
      } else if (jsonData.message) {
        this.standardOutPassThrough.stdoutBypass(log);
      }

      if (callback) callback();
    }
    /**
     * Handler for processing a log statement when it is formatted
     * as a New Relic compatible JSON string.
     * @param log 
     */

  }, {
    key: "processAsJsonLog",
    value: function processAsJsonLog(log) {
      this.logTransform(log);
      var logString = JSON.stringify(log);
      var length = Buffer.byteLength(logString);
      this.logQueue.push(log);
      this.logLengthQueue.push(length);
      this.totalLengthCount += length;
    }
    /**
     * Handler for processing a log statement that is a simple
     * string format.
     * @param log 
     */

  }, {
    key: "processAsStringLog",
    value: function processAsStringLog(log) {
      if (typeof log === 'string' && log.endsWith('\n')) {
        log = log.substring(0, log.length - 1);
      }

      var newRelicMetadata = _newrelic["default"].getLinkingMetadata();

      var structuredLog = {
        message: log,
        timestamp: Date.now(),
        original_timestamp: new Date().toISOString(),
        "entity.name": newRelicMetadata['entity.name'],
        "entity.type": newRelicMetadata['entity.type'],
        hostname: newRelicMetadata.hostname
      };
      var jsonLogString = JSON.stringify(structuredLog);
      var length = Buffer.byteLength(jsonLogString);
      this.logQueue.push(structuredLog);
      this.logLengthQueue.push(length);
      this.totalLengthCount += length;
    }
    /**
     * Set global attributes for the application.  This should
     * generally be configured early in the application lifecycle.
     * Global attributes will be bound to all log statements
     * in New Relic.
     * @param attributes KV pairs to be provided to NR with logs
     */

  }, {
    key: "setGlobalAttributes",
    value: function setGlobalAttributes(attributes) {
      this.globalAttributes = attributes;
    }
    /**
     * Writes logs synchronously.  This function is intended to be
     * utilized in situations where logging cannot be written 
     * asynchronously, most commonly in the handler of a SIGTERM
     * event, which only allows synchronous calls.
     */

  }, {
    key: "writeLogsSync",
    value: function writeLogsSync() {
      var logsToWrite = this.sliceLogs();
      internalLog('silly', "Preparing final log payload of ".concat(logsToWrite.length, " for NR collector"));
      var rawPayload = this.buildRawPostBody(logsToWrite);

      var compressedPayload = _zlib["default"].gzipSync(rawPayload);

      if (!this.debugMode) {
        this.sendLogs(compressedPayload);
      } else {
        this.writeLogsToFileSystem(compressedPayload);
      }
    }
  }, {
    key: "writeLogsToFileSystem",
    value: function writeLogsToFileSystem(buffer) {
      _fs["default"].writeFileSync("test-".concat(this.logsWritten++, ".gz"), buffer);
    }
  }, {
    key: "beginWriteLogs",
    value: function () {
      var _beginWriteLogs = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
        var logsToWrite, rawPayload, compressedPayload, fallbackMessage, message;
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                logsToWrite = this.sliceLogs();
                internalLog('silly', "Preparing log payload of ".concat(logsToWrite.length, " for NR collector"));
                rawPayload = this.buildRawPostBody(logsToWrite);
                _context.prev = 3;
                _context.next = 6;
                return this.compressPayload(rawPayload);

              case 6:
                compressedPayload = _context.sent;

                if (!this.debugMode) {
                  this.sendLogs(compressedPayload);
                } else {
                  this.writeLogsToFileSystem(compressedPayload);
                }

                _context.next = 15;
                break;

              case 10:
                _context.prev = 10;
                _context.t0 = _context["catch"](3);
                fallbackMessage = 'Unknown error occurred while compressing logs to send to New Relic';
                message = _context.t0 instanceof Error && _context.t0.stack ? _context.t0.stack : fallbackMessage;
                internalLog('error', message);

              case 15:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this, [[3, 10]]);
      }));

      function beginWriteLogs() {
        return _beginWriteLogs.apply(this, arguments);
      }

      return beginWriteLogs;
    }()
    /**
     * Handles HTTP request that sends compressed log data
     * to the New Relic endpoint.
     * @param compressedPayload 
     */

  }, {
    key: "sendLogs",
    value: function sendLogs(compressedPayload) {
      _axios["default"].post("https://".concat(API_HOSTNAME).concat(API_PATH), compressedPayload, {
        headers: {
          'Accept': '*/*',
          'Api-Key': process.env.NEW_RELIC_LICENSE_KEY,
          'Content-Encoding': 'gzip',
          'Content-Length': '' + compressedPayload.byteLength,
          'Content-Type': 'application/gzip'
        }
      }).then(function (response) {
        if ([200, 202].includes(response.status)) {
          internalLog('silly', "Log payload accepted by New Relic API. Request ID: ".concat(response.data.requestId));
        } else {
          internalLog('warn', "Unexpected successful response status code from NR: ".concat(response.status));
        }
      })["catch"](function (err) {
        internalLog('error', 'Error sending log payload to New Relic');
        internalLog('error', err.stack);
      });
    }
    /**
     * Creates the greater object structure for a log delivery 
     * payload and attaches an array of logs to it. Returns 
     * stringified.
     * @param logs 
     * @returns 
     */

  }, {
    key: "buildRawPostBody",
    value: function buildRawPostBody(logs) {
      var payload = [{
        common: {
          attributes: _objectSpread(_objectSpread({}, this.globalAttributes), {}, {
            service: this.appLabel,
            version: this.versionLabel,
            region: this.regionLabel,
            environment: this.environmentLabel,
            entityGuid: _newrelic["default"].getLinkingMetadata()['entity.guid']
          })
        },
        logs: logs
      }];
      return JSON.stringify(payload);
    }
    /**
     * Asynchronously compress string to gzip compressed data.
     * @param rawPayload 
     * @returns 
     */

  }, {
    key: "compressPayload",
    value: function () {
      var _compressPayload = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(rawPayload) {
        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                return _context2.abrupt("return", new Promise(function (resolve, reject) {
                  _zlib["default"].gzip(Buffer.from(rawPayload, 'utf8'), function (err, compressedPayload) {
                    if (err) reject(err);
                    resolve(compressedPayload);
                  });
                }));

              case 1:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2);
      }));

      function compressPayload(_x) {
        return _compressPayload.apply(this, arguments);
      }

      return compressPayload;
    }()
    /**
     * Slices log queue.
     * Will prefer to use the entire log queue when possible, but
     * may send only a subsection if the size of the data is near
     * the limitations defined by New Relic's API.
     * @returns 
     */

  }, {
    key: "sliceLogs",
    value: function sliceLogs() {
      var logsToSend; // If we know the total length will not exceed maximum length size

      if (this.totalLengthCount < MAX_PAYLOAD_SIZE) {
        var _ref = [this.logQueue, []];
        logsToSend = _ref[0];
        this.logQueue = _ref[1];
        this.logLengthQueue = [];
        this.totalLengthCount = 0;
        return logsToSend;
      } // otherwise, slice off a slice of logs that will fit into a single request


      var logSize = 0;
      var logSliceIndex = 0;

      while (this.logQueue.length > 0 && logSize + this.logLengthQueue[0] < MAX_PAYLOAD_SIZE) {
        logSliceIndex++;
      }

      logsToSend = this.logQueue.slice(0, logSliceIndex);
      this.logQueue = this.logQueue.slice(logSliceIndex);
      this.logLengthQueue = this.logLengthQueue.slice(logSliceIndex);
      return logsToSend;
    }
    /**
     * Predicate to determine if logs should be written be written immediately.
     * @returns boolean
     */

  }, {
    key: "immediateLogWritablePredicate",
    value: function immediateLogWritablePredicate() {
      if (this.newRelicInitialized && this.logQueue.length > (this.config.minLogItemsToForce || 100)) {
        return true;
      } // Push logs even if new relic hasn't been initialized if the backlog grows too large


      if (this.logQueue.length > 500) {
        return true;
      }

      return false;
    }
    /**
     * Predicate to determine if logs should be written on next periodic check.
     * @returns boolean
     */

  }, {
    key: "logsWritablePredicate",
    value: function logsWritablePredicate() {
      return this.minLogItemsExceeded();
    }
    /**
     * Predicate to determine if the total logs have exceeded a configured minLog
     * count value if such a value is configured.
     * @returns 
     */

  }, {
    key: "minLogItemsExceeded",
    value: function minLogItemsExceeded() {
      return !!(this.config.minLogItems && this.logQueue.length > this.config.minLogItems);
    }
    /**
     * Fixes possible issues in log format caused by limitations of NRs logging
     * values
     * @param log 
     * @returns 
     */

  }, {
    key: "logTransform",
    value: function logTransform(log) {
      if (Object.getOwnPropertyNames(log).length > MAX_ATTRIBUTES_PER_EVENT) {
        internalLog('warn', "Log to send to JSON contains ".concat(Object.getOwnPropertyNames(log), " / ").concat(MAX_ATTRIBUTES_PER_EVENT, " attributes."));
      }

      for (var _i = 0, _Object$keys = Object.keys(log); _i < _Object$keys.length; _i++) {
        var _key = _Object$keys[_i];
        var value = log[_key]; // replace key with length too high

        if (_key.length > MAX_ATTRIBUTE_NAME_LENGTH) {
          var newKey = _key.slice(0, MAX_ATTRIBUTE_NAME_LENGTH);

          Object.defineProperty(log, _key.slice(0, MAX_ATTRIBUTE_NAME_LENGTH), Object.getOwnPropertyDescriptor(log, _key));
          delete log.key; // Update key name for usage in later steps

          _key = newKey;
        } // Concatenate log messages with length greater than MAX_ATTRIBUTE_VALUE_LENGTH


        if (typeof value === 'string' && value.length > MAX_ATTRIBUTE_VALUE_LENGTH) {
          var _this$config;

          if ((_this$config = this.config) !== null && _this$config !== void 0 && _this$config.warnOnAttributeLengthOverflow) {
            internalLog('warn', "NR Log attribute length overflow. Length: ".concat(value.length, "/").concat(MAX_ATTRIBUTE_VALUE_LENGTH));
          }

          log.key = value.slice(0, MAX_ATTRIBUTE_VALUE_LENGTH);
        }

        if (_key.includes(' ')) {
          var _newKey = _key.replaceAll(' ', '.');

          Object.defineProperty(log, _key.slice(0, MAX_ATTRIBUTE_NAME_LENGTH), Object.getOwnPropertyDescriptor(log, _key));
          delete log.key; // Update key name for usage in later steps

          _key = _newKey;
        }

        ;
      }
    }
    /**
     * Function used to repeatedly trigger log pushes
     */

  }, {
    key: "createLogCheckTimeout",
    value: function createLogCheckTimeout() {
      var _this2 = this;

      this.timeoutId = setTimeout( /*#__PURE__*/(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3() {
        return _regenerator["default"].wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                if (!(_this2.logQueue.length > (_this2.config.minLogItems || 1))) {
                  _context3.next = 4;
                  break;
                }

                _context3.next = 3;
                return _this2.beginWriteLogs();

              case 3:
                _this2.createLogCheckTimeout();

              case 4:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3);
      })), this.config.logPushFrequency);
    }
    /**
     * Helper method that registers listeners for events
     * related to imminent application shutdown so that
     * final logs can be pushed
     */

  }, {
    key: "registerAppDeathLogPush",
    value: function registerAppDeathLogPush() {
      var _this3 = this;

      var finalWritten = false;
      process.on('exit', function () {
        if (_this3.timeoutId) clearTimeout(_this3.timeoutId);
        var o = finalWritten;
        finalWritten = true;
        if (o) return;
        internalLog('info', 'writing final logs');

        _this3.writeLogsSync();
      });
      process.on('SIGINT', function () {
        process.exit(2);
      });
      process.on('uncaughtException', function (e) {
        console.log(e);
        internalLog('error', e.stack || '');
      });
      process.on('SIGTERM', function () {
        if (_this3.timeoutId) clearTimeout(_this3.timeoutId);

        _this3.writeLogsSync();
      });
    }
    /**
     * New Relic does not expose a method to check its initialization status
     * If we push logs before New Relic initializes, they will not have an attached
     * entity guid.  For this reason we will initialize an interval that can run until
     * it is initialized.
     */

  }, {
    key: "registerNewRelicInitializationInterval",
    value: function registerNewRelicInitializationInterval() {
      var _this4 = this;

      var newRelicInitializationCheckTimeout = setInterval(function () {
        var metadata = _newrelic["default"].getLinkingMetadata();

        if (metadata['entity.guid']) {
          _this4.newRelicInitialized = true;
          internalLog('info', 'Detected New Relic has initialized with entity.guid');
          clearInterval(newRelicInitializationCheckTimeout);
        }
      }, 100);
    }
  }], [{
    key: "initialize",
    value:
    /**
     * Initializes a NewRelicLogDeliveryAgent instance if the LOG_STYLE environment
     * variable is set to NEW_RELIC. Otherwise it does nothing.
     * @param config 
     * @returns 
     */
    function initialize() {
      if (!process.env.NEW_RELIC_LICENSE_KEY) return;
      NewRelicLogDeliveryAgent.instance = new NewRelicLogDeliveryAgent();
      return NewRelicLogDeliveryAgent.instance;
    }
  }, {
    key: "getInstance",
    value: function getInstance() {
      return NewRelicLogDeliveryAgent === null || NewRelicLogDeliveryAgent === void 0 ? void 0 : NewRelicLogDeliveryAgent.instance;
    }
  }, {
    key: "configure",
    value: function configure(config) {
      var instance = NewRelicLogDeliveryAgent.instance;

      if (!instance) {
        internalLog('warn', 'Configure called before instance initialization. Configuration not applied');
        return;
      }

      instance.config = _objectSpread(_objectSpread({}, instance.config), config);
    }
  }, {
    key: "getWinstonTransport",
    value: function getWinstonTransport() {
      var _NewRelicLogDeliveryA;

      return NewRelicLogDeliveryAgent === null || NewRelicLogDeliveryAgent === void 0 ? void 0 : (_NewRelicLogDeliveryA = NewRelicLogDeliveryAgent.instance) === null || _NewRelicLogDeliveryA === void 0 ? void 0 : _NewRelicLogDeliveryA.logTransform;
    }
  }]);
  return NewRelicLogDeliveryAgent;
}();
/**
 * Replaces existing writers for stdout and stderr with
 * PassThrough streams that will invoke provided callbacks
 * with the data prior to passing them to the original streams
 */


exports.NewRelicLogDeliveryAgent = NewRelicLogDeliveryAgent;
(0, _defineProperty2["default"])(NewRelicLogDeliveryAgent, "instance", void 0);

var StandardOutPassThrough = /*#__PURE__*/function () {
  function StandardOutPassThrough(stdoutCb, stderrCb) {
    var _this5 = this;

    (0, _classCallCheck2["default"])(this, StandardOutPassThrough);
    (0, _defineProperty2["default"])(this, "stdoutPt", new _stream.PassThrough());
    (0, _defineProperty2["default"])(this, "stderrPt", new _stream.PassThrough());
    (0, _defineProperty2["default"])(this, "stdout", void 0);
    (0, _defineProperty2["default"])(this, "stderr", void 0);
    (0, _defineProperty2["default"])(this, "writeStdout", void 0);
    (0, _defineProperty2["default"])(this, "writeStderr", void 0);
    // Store original write stdout/stderr write functions
    this.stdout = process.stdout.write;
    this.stderr = process.stderr.write; // Create functions which write to original writes with stdout/stderr contexts bound

    this.writeStdout = function (data) {
      return _this5.stdout.call(process.stdout, data);
    };

    this.writeStderr = function (data) {
      return _this5.stderr.call(process.stderr, data);
    }; // Assign listeners to PassThroughs


    this.stdoutPt.on('data', function (data) {
      if (data instanceof Buffer) {
        data = data.toString('utf8');
      }

      stdoutCb(data);

      _this5.writeStdout(data);
    });
    this.stderrPt.on('data', function (data) {
      if (data instanceof Buffer) {
        data = data.toString('utf8');
      }

      stderrCb(data);

      _this5.writeStderr(data);
    }); // Replace original write calls with contexts bound to parent object

    process.stdout.write = this.stdoutPt.write.bind(this.stdoutPt);
    process.stderr.write = this.stderrPt.write.bind(this.stderrPt); // Add uncaught error handler to handle logging of failure case

    process.on('uncaughtException', function (err) {
      console.error(err);
      throw err;
    });
  }
  /**
   * Reaffix the replaced stdout and stderr then
   * closes all streams owned by this instance.
   */


  (0, _createClass2["default"])(StandardOutPassThrough, [{
    key: "destroy",
    value: function destroy() {
      process.stdout.write = this.stdout;
      process.stderr.write = this.stderr;
      this.stdoutPt.destroy();
      this.stderrPt.destroy();
    }
    /**
     * Bypass the configured callback function for stdout by
     * writing directly to the detached output stream
     * @param data 
     */

  }, {
    key: "stdoutBypass",
    value: function stdoutBypass(data) {
      if (data instanceof Object) {
        data = JSON.stringify(data);
      }

      this.writeStdout(data);
    }
    /**
     * Bypass the configured callback function for stderr by
     * writing directly to the detached output stream
     * @param data 
     */

  }, {
    key: "stderrBypass",
    value: function stderrBypass(data) {
      this.writeStderr(data);
    }
  }]);
  return StandardOutPassThrough;
}();
/**
 * Lazy load logger, write buffered messages once loaded
 * Note: Lazy loading is necessary to resolve circular dependencies between this
 * module and the logger.
 */


(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4() {
  var _yield$import, withLogger, level, _ref4, _ref5, _level, message;

  return _regenerator["default"].wrap(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.next = 2;
          return Promise.resolve().then(function () {
            return _interopRequireWildcard(require('./logger'));
          });

        case 2:
          _yield$import = _context4.sent;
          withLogger = _yield$import.withLogger;
          level = process.env.LOG_DELIVERY_AGENT_LEVEL || 'warn';
          log = withLogger('NewRelicLogForwarder', level);

          while (internalLogBuffer.length) {
            _ref4 = internalLogBuffer.shift(), _ref5 = (0, _slicedToArray2["default"])(_ref4, 2), _level = _ref5[0], message = _ref5[1];

            log[_level](message);
          }

        case 7:
        case "end":
          return _context4.stop();
      }
    }
  }, _callee4);
}))();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9Mb2dEZWxpdmVyeUFnZW50LnRzIl0sIm5hbWVzIjpbIkFQSV9IT1NUTkFNRSIsInByb2Nlc3MiLCJlbnYiLCJLTF9OUl9MT0dfSE9TVE5BTUUiLCJBUElfUEFUSCIsIktMX05SX0xPR19QQVRIIiwiTUFYX1BBWUxPQURfU0laRSIsIk1BWF9BVFRSSUJVVEVTX1BFUl9FVkVOVCIsIk1BWF9BVFRSSUJVVEVfTkFNRV9MRU5HVEgiLCJNQVhfQVRUUklCVVRFX1ZBTFVFX0xFTkdUSCIsImxvZyIsImludGVybmFsTG9nQnVmZmVyIiwiaW50ZXJuYWxMb2ciLCJsZXZlbCIsIm1lc3NhZ2UiLCJwdXNoIiwiZGVmYXVsdENvbmZpZyIsImJ5dGVzV3JpdHRlblRocmVzaG9sZCIsIndhcm5PbkF0dHJpYnV0ZUxlbmd0aE92ZXJmbG93IiwibWluQnl0ZXNXcml0dGVuIiwibWluTG9nSXRlbXMiLCJsb2dQdXNoRnJlcXVlbmN5IiwibWluTG9nSXRlbXNUb0ZvcmNlIiwiTmV3UmVsaWNMb2dEZWxpdmVyeUFnZW50IiwiREVCVUdfV1JJVEVfTE9HU19UT19GSUxFIiwiY29uZmlnIiwibmV3UmVsaWNMb2dUcmFuc3BvcnQiLCJOZXdSZWxpY0xvZ1RyYW5zcG9ydCIsImNiIiwiYWRkTG9nIiwibG9nQ2FsbGJhY2siLCJlcnJDYWxsYmFjayIsImxhYmVsIiwic3RhbmRhcmRPdXRQYXNzVGhyb3VnaCIsIlN0YW5kYXJkT3V0UGFzc1Rocm91Z2giLCJyZWdpc3RlckFwcERlYXRoTG9nUHVzaCIsImNyZWF0ZUxvZ0NoZWNrVGltZW91dCIsInJlZ2lzdGVyTmV3UmVsaWNJbml0aWFsaXphdGlvbkludGVydmFsIiwic2VydmljZUxhYmVsIiwiU0VSVklDRV9MQUJFTCIsImNvbXBvbmVudCIsImxhYmVscyIsIk5FV19SRUxJQ19MQUJFTFMiLCJwYXJ0cyIsInNwbGl0IiwibGFiZWxNYXAiLCJNYXAiLCJmb3JFYWNoIiwicGFydCIsInZhbHVlIiwic2V0IiwidG9Mb3dlckNhc2UiLCJoYXMiLCJyZWdpb25MYWJlbCIsImdldCIsImVudmlyb25tZW50TGFiZWwiLCJ2ZXJzaW9uTGFiZWwiLCJhcHBMYWJlbCIsIk5FV19SRUxJQ19BUFBfTkFNRSIsInRpbWVvdXRJZCIsImNsZWFyVGltZW91dCIsImRlc3Ryb3kiLCJjbG9zZSIsIndyaXRlTG9nc1N5bmMiLCJzdHIiLCJKU09OIiwic3RyaW5naWZ5Iiwib2JqIiwicGFyc2UiLCJtc2ciLCJuYW1lIiwiZXJyIiwiY2FsbGJhY2siLCJqc29uRGF0YSIsImlzTlJDb21wYXRpYmxlSnNvbkxvZ1N0cmluZyIsInByb2Nlc3NBc0pzb25Mb2ciLCJwcm9jZXNzQXNTdHJpbmdMb2ciLCJpbW1lZGlhdGVMb2dXcml0YWJsZVByZWRpY2F0ZSIsImJlZ2luV3JpdGVMb2dzIiwic3RkZXJyQnlwYXNzIiwic3Rkb3V0QnlwYXNzIiwibG9nVHJhbnNmb3JtIiwibG9nU3RyaW5nIiwibGVuZ3RoIiwiQnVmZmVyIiwiYnl0ZUxlbmd0aCIsImxvZ1F1ZXVlIiwibG9nTGVuZ3RoUXVldWUiLCJ0b3RhbExlbmd0aENvdW50IiwiZW5kc1dpdGgiLCJzdWJzdHJpbmciLCJuZXdSZWxpY01ldGFkYXRhIiwibmV3cmVsaWMiLCJnZXRMaW5raW5nTWV0YWRhdGEiLCJzdHJ1Y3R1cmVkTG9nIiwidGltZXN0YW1wIiwiRGF0ZSIsIm5vdyIsIm9yaWdpbmFsX3RpbWVzdGFtcCIsInRvSVNPU3RyaW5nIiwiaG9zdG5hbWUiLCJqc29uTG9nU3RyaW5nIiwiYXR0cmlidXRlcyIsImdsb2JhbEF0dHJpYnV0ZXMiLCJsb2dzVG9Xcml0ZSIsInNsaWNlTG9ncyIsInJhd1BheWxvYWQiLCJidWlsZFJhd1Bvc3RCb2R5IiwiY29tcHJlc3NlZFBheWxvYWQiLCJ6bGliIiwiZ3ppcFN5bmMiLCJkZWJ1Z01vZGUiLCJzZW5kTG9ncyIsIndyaXRlTG9nc1RvRmlsZVN5c3RlbSIsImJ1ZmZlciIsImZzIiwid3JpdGVGaWxlU3luYyIsImxvZ3NXcml0dGVuIiwiY29tcHJlc3NQYXlsb2FkIiwiZmFsbGJhY2tNZXNzYWdlIiwiRXJyb3IiLCJzdGFjayIsIkF4aW9zIiwicG9zdCIsImhlYWRlcnMiLCJORVdfUkVMSUNfTElDRU5TRV9LRVkiLCJ0aGVuIiwicmVzcG9uc2UiLCJpbmNsdWRlcyIsInN0YXR1cyIsImRhdGEiLCJyZXF1ZXN0SWQiLCJsb2dzIiwicGF5bG9hZCIsImNvbW1vbiIsInNlcnZpY2UiLCJ2ZXJzaW9uIiwicmVnaW9uIiwiZW52aXJvbm1lbnQiLCJlbnRpdHlHdWlkIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJnemlwIiwiZnJvbSIsImxvZ3NUb1NlbmQiLCJsb2dTaXplIiwibG9nU2xpY2VJbmRleCIsInNsaWNlIiwibmV3UmVsaWNJbml0aWFsaXplZCIsIm1pbkxvZ0l0ZW1zRXhjZWVkZWQiLCJPYmplY3QiLCJnZXRPd25Qcm9wZXJ0eU5hbWVzIiwia2V5cyIsImtleSIsIm5ld0tleSIsImRlZmluZVByb3BlcnR5IiwiZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yIiwicmVwbGFjZUFsbCIsInNldFRpbWVvdXQiLCJmaW5hbFdyaXR0ZW4iLCJvbiIsIm8iLCJleGl0IiwiZSIsImNvbnNvbGUiLCJuZXdSZWxpY0luaXRpYWxpemF0aW9uQ2hlY2tUaW1lb3V0Iiwic2V0SW50ZXJ2YWwiLCJtZXRhZGF0YSIsImNsZWFySW50ZXJ2YWwiLCJpbnN0YW5jZSIsInN0ZG91dENiIiwic3RkZXJyQ2IiLCJQYXNzVGhyb3VnaCIsInN0ZG91dCIsIndyaXRlIiwic3RkZXJyIiwid3JpdGVTdGRvdXQiLCJjYWxsIiwid3JpdGVTdGRlcnIiLCJzdGRvdXRQdCIsInRvU3RyaW5nIiwic3RkZXJyUHQiLCJiaW5kIiwiZXJyb3IiLCJ3aXRoTG9nZ2VyIiwiTE9HX0RFTElWRVJZX0FHRU5UX0xFVkVMIiwic2hpZnQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFHQTs7Ozs7Ozs7OztBQUVBLElB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Q2RDLE9BRGM7O0FBRTNCSixZQUFBQSxHQUFELENBQWFHLE1BQWIsRUFBb0JDLE9BQXBCO0FBQ0g7O0FBUEo7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsQ0FBRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgbmV3cmVsaWMgZnJvbSAnbmV3cmVsaWMnO1xuaW1wb3J0IHpsaWIgZnJvbSAnemxpYic7XG5pbXBvcnQgeyBOZXdSZWxpY0xvZ1RyYW5zcG9ydCB9IGZyb20gJy4vTmV3UmVsaWNMb2dUcmFuc3BvcnQnO1xuaW1wb3J0IHsgUGFzc1Rocm91Z2ggfSBmcm9tICdzdHJlYW0nO1xuaW1wb3J0IHsgTG9nZ2VyIH0gZnJvbSAnd2luc3Rvbic7XG5pbXBvcnQgeyBOUE1Mb2dnaW5nTGV2ZWxzIH0gZnJvbSAnLi9sb2dnZXInO1xuaW1wb3J0IEF4aW9zIGZyb20gJ2F4aW9zJztcblxuY29uc3QgQVBJX0hPU1ROQU1FID0gcHJvY2Vzcy5lbnYuS0xfTlJfTE9HX0hPU1ROQU1FIHx8ICdsb2ctYXBpLmV1Lm5ld3JlbGljLmNvbSc7XG5jb25zdCBBUElfUEFUSCA9IHByb2Nlc3MuZW52LktMX05SX0xPR19QQVRIIHx8ICcvbG9nL3YxJztcbmNvbnN0IE1BWF9QQVlMT0FEX1NJWkUgPSAxMCoqNjtcbmNvbnN0IE1BWF9BVFRSSUJVVEVTX1BFUl9FVkVOVCA9IDI1NTtcbmNvbnN0IE1BWF9BVFRSSUJVVEVfTkFNRV9MRU5HVEggPSAyNTU7XG5jb25zdCBNQVhfQVRUUklCVVRFX1ZBTFVFX0xFTkdUSCA9IDQwOTY7XG5cbmxldCBsb2c6IExvZ2dlciB8IHVuZGVmaW5lZDtcbmxldCBpbnRlcm5hbExvZ0J1ZmZlcjogQXJyYXk8W3N0cmluZywgc3RyaW5nXT4gPSBbXTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byB3cml0ZSBsb2dzIHRoYXQgYXJlIGludGVybmFsIHRvIHRoaXMgbW9kdWxlLlxuICogQnVmZmVycyBjYWxscyB1bnRpbCB0aGUgV2luc3RvbiBsb2dnZXIgY2FuIGJlIGFzeW5jIGltcG9ydGRcbiAqIEFmdGVyd29yZHMsIHdyaXRlcyBsb2dzIGRpcmVjdGx5IHRvIHRoZSBsb2dnZXJcbiAqIEBwYXJhbSBsZXZlbCBcbiAqIEBwYXJhbSBtZXNzYWdlIFxuICovXG5mdW5jdGlvbiBpbnRlcm5hbExvZyhsZXZlbDogc3RyaW5nLCBtZXNzYWdlOiBzdHJpbmcpIHtcbiAgICBpZiAobG9nKSB7XG4gICAgICAgIChsb2cgYXMgYW55KVtsZXZlbF0obWVzc2FnZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgaW50ZXJuYWxMb2dCdWZmZXIucHVzaChbbGV2ZWwsIG1lc3NhZ2VdKTtcbiAgICB9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTmV3UmVsaWNMb2dEZWxpdmVyeUFnZW50Q29uZmlnIHtcbiAgICAvKipcbiAgICAgKiBIb3cgZnJlcXVlbnRseSBjaGVja3Mgc2hvdWxkIGJlIHJ1biB0byBwdXNoIGxvZ3MgdG8gTlJcbiAgICAgKiBEZWZhdWx0IGlzIDEwIHNlY29uZHNcbiAgICAgKi9cbiAgICAgbG9nUHVzaEZyZXF1ZW5jeT86IG51bWJlcjtcblxuICAgICAvKipcbiAgICAgICogTWluaW11bSBudW1iZXIgb2YgbG9nIHN0YXRlbWVudHMgd3JpdHRlbiBiZWZvcmUgbG9ncyBjYW4gYmUgcHVzaGVkIHRvIE5SXG4gICAgICAqIGJ5IHBlcmlvZGljIGxvZ2dlci5cbiAgICAgICogRGVmYXVsdCBpcyAyXG4gICAgICAqL1xuICAgICBtaW5Mb2dJdGVtcz86IG51bWJlcjtcbiBcbiBcbiAgICAgLyoqXG4gICAgICAqIE1pbmltdW0gbnVtYmVyIG9mIGxvZyBzdGF0ZW1lbnRzIHRvIGZvcmNlIGFuIGltbWVkaWF0ZSBwdXNoIHRvIE5SLiBVc2VkXG4gICAgICAqIHRvIGVuc3VyZSB0aGF0IHRoZSBsb2dnaW5nIHN5c3RlbSBkb2VzIG5vdCBnZXQgYmFja2VkIHVwIGlmIGFtb3VudCBiZWluZ1xuICAgICAgKiBsb2dnZWQgc3VycGFzc2VzIHRoZSBiYW5kd2lkdGggb2YgdGhlIHBlcmlvZGljIGxvZ2dlci5cbiAgICAgICogRGVmYXVsdCBpcyAxMDAuXG4gICAgICAqL1xuICAgICBtaW5Mb2dJdGVtc1RvRm9yY2U/OiBudW1iZXI7XG5cbiBcbiAgICAgLyoqXG4gICAgICAqIE1pbmltdW0gbnVtYmVyIG9mIGJ5dGVzIHdyaXR0ZW4gdG8gY29tcHJlc3Npb24gc3RyZWFtIGJlZm9yZSBwdXNoaW5nIHRvIE5SXG4gICAgICAqL1xuICAgICBtaW5CeXRlc1dyaXR0ZW4/OiBudW1iZXI7XG4gXG4gICAgIC8qKlxuICAgICAgKiBUaHJlc2hvbGQgZm9yIGJ5dGVzIHdyaXR0ZW4gYXQgd2hpY2ggcG9pbnQgYSBuZXcgd3JpdGUgdG8gTlIgd2lsbCBiZSBhdXRvbWF0aWNhbGx5XG4gICAgICAqIHRyaWdnZXJlZC4gRGVmYXVsdHMgdG8gKDQvNSAqIE1BWF9QQVlMT0FEX1NJWkUpXG4gICAgICAqL1xuICAgICBieXRlc1dyaXR0ZW5UaHJlc2hvbGQ/OiBudW1iZXI7XG4gXG4gICAgIC8qKlxuICAgICAgKiBQcm9kdWNlIGEgd2FybmluZyB3aGVuIGF0dHJpYnV0ZSB2YWx1ZXMgb3ZlcmZsb3cgdGhlIE5SIG1heGltdW0gbGVuZ3RoIG9mIDQwOTYuXG4gICAgICAqIERlZmF1bHQgaXMgZmFsc2UuXG4gICAgICAqL1xuICAgICB3YXJuT25BdHRyaWJ1dGVMZW5ndGhPdmVyZmxvdz86IGJvb2xlYW47XG59XG5cbmNvbnN0IGRlZmF1bHRDb25maWc6IE5ld1JlbGljTG9nRGVsaXZlcnlBZ2VudENvbmZpZyA9IHtcbiAgICBieXRlc1dyaXR0ZW5UaHJlc2hvbGQ6IE1BWF9QQVlMT0FEX1NJWkUgKiA0IC8gNSxcbiAgICB3YXJuT25BdHRyaWJ1dGVMZW5ndGhPdmVyZmxvdzogZmFsc2UsXG4gICAgbWluQnl0ZXNXcml0dGVuOiBNQVhfUEFZTE9BRF9TSVpFICogMSAvIDUsXG4gICAgbWluTG9nSXRlbXM6IDIsXG4gICAgbG9nUHVzaEZyZXF1ZW5jeTogNjAwMDAsXG4gICAgbWluTG9nSXRlbXNUb0ZvcmNlOiAxMDAsXG59XG5cbmV4cG9ydCBjbGFzcyBOZXdSZWxpY0xvZ0RlbGl2ZXJ5QWdlbnQge1xuIFxuICAgIHByaXZhdGUgYXBwTGFiZWw6IHN0cmluZztcbiAgICBwcml2YXRlIHJlZ2lvbkxhYmVsOiBzdHJpbmcgPSAndW5kZWZpbmVkJztcbiAgICBwcml2YXRlIGVudmlyb25tZW50TGFiZWw6IHN0cmluZyA9ICd1bmRlZmluZWQnO1xuICAgIHByaXZhdGUgdmVyc2lvbkxhYmVsOiBzdHJpbmcgPSAndW5kZWZpbmVkJztcblxuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemVzIGEgTmV3UmVsaWNMb2dEZWxpdmVyeUFnZW50IGluc3RhbmNlIGlmIHRoZSBMT0dfU1RZTEUgZW52aXJvbm1lbnRcbiAgICAgKiB2YXJpYWJsZSBpcyBzZXQgdG8gTkVXX1JFTElDLiBPdGhlcndpc2UgaXQgZG9lcyBub3RoaW5nLlxuICAgICAqIEBwYXJhbSBjb25maWcgXG4gICAgICogQHJldHVybnMgXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBpbml0aWFsaXplKCkge1xuICAgICAgICBpZiAoIXByb2Nlc3MuZW52Lk5FV19SRUxJQ19MSUNFTlNFX0tFWSkgcmV0dXJuO1xuICAgICAgICBOZXdSZWxpY0xvZ0RlbGl2ZXJ5QWdlbnQuaW5zdGFuY2UgPSBuZXcgTmV3UmVsaWNMb2dEZWxpdmVyeUFnZW50KCk7XG4gICAgICAgIHJldHVybiBOZXdSZWxpY0xvZ0RlbGl2ZXJ5QWdlbnQuaW5zdGFuY2U7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyBnZXRJbnN0YW5jZSgpIHtcbiAgICAgICAgcmV0dXJuIE5ld1JlbGljTG9nRGVsaXZlcnlBZ2VudD8uaW5zdGFuY2U7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyBjb25maWd1cmUoY29uZmlnOiBOZXdSZWxpY0xvZ0RlbGl2ZXJ5QWdlbnRDb25maWcpIHtcbiAgICAgICAgY29uc3QgaW5zdGFuY2UgPSBOZXdSZWxpY0xvZ0RlbGl2ZXJ5QWdlbnQuaW5zdGFuY2U7XG4gICAgICAgIGlmICghaW5zdGFuY2UpIHtcbiAgICAgICAgICAgIGludGVybmFsTG9nKCd3YXJuJywgJ0NvbmZpZ3VyZSBjYWxsZWQgYmVmb3JlIGluc3RhbmNlIGluaXRpYWxpemF0aW9uLiBDb25maWd1cmF0aW9uIG5vdCBhcHBsaWVkJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaW5zdGFuY2UuY29uZmlnID0ge1xuICAgICAgICAgICAgLi4uaW5zdGFuY2UuY29uZmlnLFxuICAgICAgICAgICAgLi4uY29uZmlnXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIGdldFdpbnN0b25UcmFuc3BvcnQoKSB7XG4gICAgICAgIHJldHVybiBOZXdSZWxpY0xvZ0RlbGl2ZXJ5QWdlbnQ/Lmluc3RhbmNlPy5sb2dUcmFuc2Zvcm07XG4gICAgfVxuICAgIFxuICAgIHByaXZhdGUgc3RhdGljIGluc3RhbmNlOiBOZXdSZWxpY0xvZ0RlbGl2ZXJ5QWdlbnQ7XG4gICAgcHJpdmF0ZSBsb2dRdWV1ZTogYW55W10gPSBbXTtcbiAgICBwcml2YXRlIGNvbmZpZzogTmV3UmVsaWNMb2dEZWxpdmVyeUFnZW50Q29uZmlnO1xuICAgIHByaXZhdGUgbG9nTGVuZ3RoUXVldWU6IG51bWJlcltdID0gW107XG4gICAgcHJpdmF0ZSB0b3RhbExlbmd0aENvdW50ID0gMDtcbiAgICBwcml2YXRlIGdsb2JhbEF0dHJpYnV0ZXM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9ID0ge307XG4gICAgcHJpdmF0ZSBuZXdSZWxpY0xvZ1RyYW5zcG9ydDogTmV3UmVsaWNMb2dUcmFuc3BvcnQ7XG4gICAgcHJpdmF0ZSBkZWJ1Z01vZGUgPSBwcm9jZXNzLmVudi5ERUJVR19XUklURV9MT0dTX1RPX0ZJTEUgPT09ICd0cnVlJztcbiAgICBwcml2YXRlIHRpbWVvdXRJZDogTm9kZUpTLlRpbWVvdXQgfCB1bmRlZmluZWQ7XG4gICAgcHJpdmF0ZSBsb2dzV3JpdHRlbiA9IDA7XG4gICAgcHJpdmF0ZSBuZXdSZWxpY0luaXRpYWxpemVkID0gZmFsc2U7XG4gICAgXG4gICAgcHVibGljIHN0YW5kYXJkT3V0UGFzc1Rocm91Z2g6IFN0YW5kYXJkT3V0UGFzc1Rocm91Z2g7XG4gICAgXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgaW50ZXJuYWxMb2coJ2RlYnVnJywgJ0luaXRpYWxpemluZyBMb2dEZWxpdmVyeUFnZW50Jyk7XG4gICAgICAgIHRoaXMuY29uZmlnID0geyAuLi5kZWZhdWx0Q29uZmlnIH07XG5cbiAgICAgICAgaW50ZXJuYWxMb2coJ2luZm8nLCBgQ3JlYXRpbmcgTmV3UmVsaWNMb2dUcmFuc3BvcnRgKTtcbiAgICAgICAgdGhpcy5uZXdSZWxpY0xvZ1RyYW5zcG9ydCA9IG5ldyBOZXdSZWxpY0xvZ1RyYW5zcG9ydCgobG9nLCBjYikgPT4gdGhpcy5hZGRMb2cobG9nLCBjYikpO1xuXG4gICAgICAgIC8vIENyZWF0ZXMgbG9nZ2luZyBjb25maWd1cmF0aW9uIGZvciByZXdyaXRpbmcgc3Rkb3V0L3N0ZGVyclxuICAgICAgICBjb25zdCBsb2dDYWxsYmFjayA9IChsb2c6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgdGhpcy5hZGRMb2cobG9nLCAoKSA9PiB7fSk7XG4gICAgICAgIH07XG4gICAgXG4gICAgICAgIGNvbnN0IGVyckNhbGxiYWNrID0gKGxvZzogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmFkZExvZyh7XG4gICAgICAgICAgICAgICAgbGFiZWw6ICdlcnJvcicsXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogbG9nXG4gICAgICAgICAgICB9LCAoKSA9PiB7fSk7XG4gICAgICAgIH07XG4gICAgXG4gICAgICAgIHRoaXMuc3RhbmRhcmRPdXRQYXNzVGhyb3VnaCA9IG5ldyBTdGFuZGFyZE91dFBhc3NUaHJvdWdoKGxvZ0NhbGxiYWNrLCBlcnJDYWxsYmFjayk7XG4gICAgICAgIHRoaXMucmVnaXN0ZXJBcHBEZWF0aExvZ1B1c2goKTtcbiAgICAgICAgdGhpcy5jcmVhdGVMb2dDaGVja1RpbWVvdXQoKTtcbiAgICAgICAgdGhpcy5yZWdpc3Rlck5ld1JlbGljSW5pdGlhbGl6YXRpb25JbnRlcnZhbCgpOyAgICAgIFxuICAgICAgICBpbnRlcm5hbExvZygnZGVidWcnLCAnTG9nRGVsaXZlcnlBZ2VudCBJbml0aWFsaXplZCcpXG5cbiAgICAgICAgY29uc3Qgc2VydmljZUxhYmVsID0gcHJvY2Vzcy5lbnYuU0VSVklDRV9MQUJFTDtcbiAgICAgICAgbGV0IGNvbXBvbmVudDtcbiAgICAgICAgY29uc3QgbGFiZWxzID0gcHJvY2Vzcy5lbnYuTkVXX1JFTElDX0xBQkVMUztcbiAgICAgICAgaWYgKGxhYmVscykge1xuICAgICAgICAgICAgY29uc3QgcGFydHMgPSBsYWJlbHMuc3BsaXQoJzsnKTtcbiAgICAgICAgICAgIGNvbnN0IGxhYmVsTWFwID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZz4oKTtcbiAgICAgICAgICAgIHBhcnRzLmZvckVhY2gocGFydCA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgW2xhYmVsLCB2YWx1ZV0gPSBwYXJ0LnNwbGl0KCc6Jyk7XG4gICAgICAgICAgICAgICAgbGFiZWxNYXAuc2V0KGxhYmVsLnRvTG93ZXJDYXNlKCksIHZhbHVlKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBpZiAobGFiZWxNYXAuaGFzKCdyZWdpb24nKSkge1xuICAgICAgICAgICAgICAgIHRoaXMucmVnaW9uTGFiZWwgPSBsYWJlbE1hcC5nZXQoJ3JlZ2lvbicpIGFzIHN0cmluZztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGxhYmVsTWFwLmhhcygnZW52aXJvbm1lbnQnKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZW52aXJvbm1lbnRMYWJlbCA9IGxhYmVsTWFwLmdldCgnZW52aXJvbm1lbnQnKSBhcyBzdHJpbmc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChsYWJlbE1hcC5oYXMoJ3ZlcnNpb24nKSkge1xuICAgICAgICAgICAgICAgIHRoaXMudmVyc2lvbkxhYmVsID0gbGFiZWxNYXAuZ2V0KCd2ZXJzaW9uJykgYXMgc3RyaW5nO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb21wb25lbnQgPSBsYWJlbE1hcC5nZXQoJ2NvbXBvbmVudCcpO1xuICAgICAgICB9XG5cbiAgICAgICAgLyogXG4gICAgICAgICAgICBBc3NpZ24gbGFiZWwgbmFtZSB1c2luZyB0aGUgZm9sbG93aW5nIHByaW9yaXRpZXM6XG4gICAgICAgICAgICAxLiBTRVJWSUNFX0xBQkVMIGVudiB2YWx1ZVxuICAgICAgICAgICAgMi4gTkVXX1JFTElDX0xBQkVMUyBlbnYgdmFsdWUgY29tcG9uZW50IHBhcnRcbiAgICAgICAgICAgIDMuIE5FV19SRUxJQ19BUFBfTkFNRSBlbnYgdmFsdWVcbiAgICAgICAgICAgIDQuIHVuZGVmaW5lZCBsaXRlcmFsXG4gICAgICAgICovXG4gICAgICAgIHRoaXMuYXBwTGFiZWwgPSBzZXJ2aWNlTGFiZWxcbiAgICAgICAgICAgIHx8IGNvbXBvbmVudFxuICAgICAgICAgICAgfHwgcHJvY2Vzcy5lbnYuTkVXX1JFTElDX0FQUF9OQU1FXG4gICAgICAgICAgICB8fCAndW5kZWZpbmVkJztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBY2Nlc3NvciBmb3IgV2luc3RvbiBUcmFuc3BvcnQgdGhhdCB3cml0ZXMgdG8gdGhpcyBcbiAgICAgKiBhZ2VudCBpbnN0YW5jZVxuICAgICAqIEByZXR1cm5zIHdpbnN0b24udHJhbnNwb3J0XG4gICAgICovXG4gICAgcHVibGljIGdldExvZ1RyYW5zcG9ydCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubmV3UmVsaWNMb2dUcmFuc3BvcnQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2h1dHNkb3duIHRoZSBkZWxpdmVyeSBhZ2VudC4gVGhpcyBjYW4gYmUgdXRpbGl6ZWQgd2hlbiBhcHAgaXMgZXhwZWN0ZWQgdG8gc2h1dGRvd25cbiAgICAgKiBhdCBhIGdpdmVuIHRpbWUgYW5kIHRoZSBwZXJpb2RpYyBkZWxpdmVyeSB0aW1lb3V0IGlzIGJsb2NraW5nIHNodXRkb3duLlxuICAgICAqIFxuICAgICAqIENsZWFycyBpbnRlcm5hbCB0aW1lb3V0LCBjb25maWd1cmVzIHdpbnN0b24gdHJhbnNwb3J0IHRvIG5vdCBzZW5kIGxvZ3MuXG4gICAgICogUmVjb25uZWN0cyBzdGRvdXQgYW5kIHN0ZGVyci5cbiAgICAgKiBXcml0ZXMgYW55IHJlbWFpbmluZyBsb2dzLlxuICAgICAqL1xuICAgIHB1YmxpYyBzaHV0ZG93bigpIHtcbiAgICAgICAgaW50ZXJuYWxMb2coJ2RlYnVnJywgJ1NodXRkb3duIG9mIExvZ0RlbGl2ZXJ5QWdlbnQgdHJpZ2dlcmVkJyk7XG4gICAgICAgIGlmICh0aGlzLnRpbWVvdXRJZCkgY2xlYXJUaW1lb3V0KHRoaXMudGltZW91dElkKTtcbiAgICAgICAgdGhpcy5zdGFuZGFyZE91dFBhc3NUaHJvdWdoLmRlc3Ryb3koKTtcbiAgICAgICAgdGhpcy5uZXdSZWxpY0xvZ1RyYW5zcG9ydC5jbG9zZSgpO1xuICAgICAgICB0aGlzLndyaXRlTG9nc1N5bmMoKTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIERldGVybWluZSBpZiB0aGUgbG9nIHN0cmluZyBvciBvYmplY3QgaXMgYSBOZXcgUmVsaWMgXG4gICAgICogY29tcGF0aWJsZSBKU09OLiBJbiBvcmRlciB0byBiZSBjb25zaWRlcmVkIHRoaXMgaXQgbXVzdFxuICAgICAqIGJlIGEgd2VsbCBzdHJ1Y3R1cmVkIEpTT04gb2JqZWN0IHdpdGggYSB0b3AgbGV2ZWwgJ21lc3NhZ2UnXG4gICAgICogYW5kICdsZXZlbCcgcHJvcGVydHkuXG4gICAgICogQHBhcmFtIHN0ciBcbiAgICAgKiBAcmV0dXJucyBvYmplY3QgZm9ybSBvZiBKU09OIG9yIGZhbHNlXG4gICAgICovXG4gICAgcHJpdmF0ZSBpc05SQ29tcGF0aWJsZUpzb25Mb2dTdHJpbmcoc3RyOiBzdHJpbmcgfCBvYmplY3QpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBzdHIgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICBzdHIgPSBKU09OLnN0cmluZ2lmeShzdHIpO1xuICAgICAgICB9XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBvYmogPSBKU09OLnBhcnNlKHN0ciBhcyBzdHJpbmcpO1xuICAgICAgICAgICAgLy8gUmV3cml0ZSBib290c3RyYXAgb2JqZWN0IGludG8gYSBmb3JtYXQgdGhhdCB3aWxsIHdvcmsgZm9yIG5ldyByZWxpY1xuICAgICAgICAgICAgaWYgKG9iai5tc2cgJiYgb2JqPy5uYW1lKCduZXdyZWxpY19ib290c3RyYXAnKSAmJiAhb2JqLm1lc3NhZ2UpIHtcbiAgICAgICAgICAgICAgICBvYmoubWVzc2FnZSA9IG9iai5tc2c7XG4gICAgICAgICAgICAgICAgb2JqLmxldmVsID0gJ2luZm8nO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBvYmoubXNnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG9iaiAmJiB0eXBlb2Ygb2JqID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKG9iai5tZXNzYWdlICYmIG9iai5sZXZlbCkge1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycikgeyB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJbnRlcm5hbCBmdW5jdGlvbiB1c2VkIHRvIGFjY2VwdCBsb2cgc3RhdGVtZW50cyBhbmRcbiAgICAgKiBwcm9jZXNzIHRoZW0uIExvZyBpcyB0eXBlZCB0byBhbnkgdG8gZml0IHR5cGluZyBmb3JcbiAgICAgKiB0aGUgV2luc3RvbiB0cmFuc3BvcnQuXG4gICAgICogXG4gICAgICogVE9ETzogUmV3b3JrIHRoZSBXaW5zdG9uIHRyYW5zcG9ydCBsb2dpYyB0byBkbyBhIGJpdFxuICAgICAqICAgICAgbW9yZSB3b3JrIHRvIHByb3ZpZGUgbW9yZSBjb25zaXN0ZW50IHR5cGluZy5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gbG9nIFxuICAgICAqIEBwYXJhbSBjYWxsYmFjayBcbiAgICAgKi9cbiAgICBwcml2YXRlIGFkZExvZyhsb2c6IGFueSwgY2FsbGJhY2s6ICgoKSA9PiB2b2lkKSB8IHVuZGVmaW5lZCkge1xuICAgICAgICBjb25zdCBqc29uRGF0YSA9IHRoaXMuaXNOUkNvbXBhdGlibGVKc29uTG9nU3RyaW5nKGxvZyk7XG4gICAgICAgIGlmKGpzb25EYXRhKSB7XG4gICAgICAgICAgICB0aGlzLnByb2Nlc3NBc0pzb25Mb2coanNvbkRhdGEpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5wcm9jZXNzQXNTdHJpbmdMb2cobG9nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmltbWVkaWF0ZUxvZ1dyaXRhYmxlUHJlZGljYXRlKCkpIHtcbiAgICAgICAgICAgIHRoaXMuYmVnaW5Xcml0ZUxvZ3MoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChqc29uRGF0YSkgbG9nID0gSlNPTi5zdHJpbmdpZnkobG9nKSsnXFxuJztcbiAgICBcbiAgICAgICAgaWYgKGpzb25EYXRhPy5tZXNzYWdlICYmIGpzb25EYXRhPy5sZXZlbCA9PT0gJ2Vycm9yJykge1xuICAgICAgICAgICAgdGhpcy5zdGFuZGFyZE91dFBhc3NUaHJvdWdoLnN0ZGVyckJ5cGFzcyhsb2cpO1xuICAgICAgICB9IGVsc2UgaWYoanNvbkRhdGEubWVzc2FnZSkge1xuICAgICAgICAgICAgdGhpcy5zdGFuZGFyZE91dFBhc3NUaHJvdWdoLnN0ZG91dEJ5cGFzcyhsb2cpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNhbGxiYWNrKSBjYWxsYmFjaygpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEhhbmRsZXIgZm9yIHByb2Nlc3NpbmcgYSBsb2cgc3RhdGVtZW50IHdoZW4gaXQgaXMgZm9ybWF0dGVkXG4gICAgICogYXMgYSBOZXcgUmVsaWMgY29tcGF0aWJsZSBKU09OIHN0cmluZy5cbiAgICAgKiBAcGFyYW0gbG9nIFxuICAgICAqL1xuICAgIHByb2Nlc3NBc0pzb25Mb2cobG9nOiBhbnkpIHtcbiAgICAgICAgdGhpcy5sb2dUcmFuc2Zvcm0obG9nKTtcbiAgICAgICAgY29uc3QgbG9nU3RyaW5nID0gSlNPTi5zdHJpbmdpZnkobG9nKTtcbiAgICAgICAgY29uc3QgbGVuZ3RoID0gQnVmZmVyLmJ5dGVMZW5ndGgobG9nU3RyaW5nKTtcbiAgICAgICAgdGhpcy5sb2dRdWV1ZS5wdXNoKGxvZyk7XG4gICAgICAgIHRoaXMubG9nTGVuZ3RoUXVldWUucHVzaChsZW5ndGgpO1xuICAgICAgICB0aGlzLnRvdGFsTGVuZ3RoQ291bnQgKz0gbGVuZ3RoO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEhhbmRsZXIgZm9yIHByb2Nlc3NpbmcgYSBsb2cgc3RhdGVtZW50IHRoYXQgaXMgYSBzaW1wbGVcbiAgICAgKiBzdHJpbmcgZm9ybWF0LlxuICAgICAqIEBwYXJhbSBsb2cgXG4gICAgICovXG4gICAgcHJvY2Vzc0FzU3RyaW5nTG9nKGxvZzogc3RyaW5nKSB7XG4gICAgICAgIGlmICh0eXBlb2YgbG9nID09PSAnc3RyaW5nJyAmJiBsb2cuZW5kc1dpdGgoJ1xcbicpKSB7XG4gICAgICAgICAgICBsb2cgPSBsb2cuc3Vic3RyaW5nKDAsIGxvZy5sZW5ndGggLSAxKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IG5ld1JlbGljTWV0YWRhdGEgPSBuZXdyZWxpYy5nZXRMaW5raW5nTWV0YWRhdGEoKTtcbiAgICAgICAgY29uc3Qgc3RydWN0dXJlZExvZyA9IHtcbiAgICAgICAgICAgIG1lc3NhZ2U6IGxvZyxcbiAgICAgICAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcbiAgICAgICAgICAgIG9yaWdpbmFsX3RpbWVzdGFtcDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgICAgICAgXCJlbnRpdHkubmFtZVwiOiBuZXdSZWxpY01ldGFkYXRhWydlbnRpdHkubmFtZSddLFxuICAgICAgICAgICAgXCJlbnRpdHkudHlwZVwiOiBuZXdSZWxpY01ldGFkYXRhWydlbnRpdHkudHlwZSddLFxuICAgICAgICAgICAgaG9zdG5hbWU6IG5ld1JlbGljTWV0YWRhdGEuaG9zdG5hbWVcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGpzb25Mb2dTdHJpbmcgPSBKU09OLnN0cmluZ2lmeShzdHJ1Y3R1cmVkTG9nKTtcbiAgICAgICAgY29uc3QgbGVuZ3RoID0gQnVmZmVyLmJ5dGVMZW5ndGgoanNvbkxvZ1N0cmluZyk7XG4gICAgICAgIHRoaXMubG9nUXVldWUucHVzaChzdHJ1Y3R1cmVkTG9nKTtcbiAgICAgICAgdGhpcy5sb2dMZW5ndGhRdWV1ZS5wdXNoKGxlbmd0aCk7XG4gICAgICAgIHRoaXMudG90YWxMZW5ndGhDb3VudCArPSBsZW5ndGg7XG4gICAgfVxuICAgIFxuICAgIC8qKlxuICAgICAqIFNldCBnbG9iYWwgYXR0cmlidXRlcyBmb3IgdGhlIGFwcGxpY2F0aW9uLiAgVGhpcyBzaG91bGRcbiAgICAgKiBnZW5lcmFsbHkgYmUgY29uZmlndXJlZCBlYXJseSBpbiB0aGUgYXBwbGljYXRpb24gbGlmZWN5Y2xlLlxuICAgICAqIEdsb2JhbCBhdHRyaWJ1dGVzIHdpbGwgYmUgYm91bmQgdG8gYWxsIGxvZyBzdGF0ZW1lbnRzXG4gICAgICogaW4gTmV3IFJlbGljLlxuICAgICAqIEBwYXJhbSBhdHRyaWJ1dGVzIEtWIHBhaXJzIHRvIGJlIHByb3ZpZGVkIHRvIE5SIHdpdGggbG9nc1xuICAgICAqL1xuICAgIHNldEdsb2JhbEF0dHJpYnV0ZXMoYXR0cmlidXRlczoge1trZXk6IHN0cmluZ106IHN0cmluZ30pIHtcbiAgICAgICAgdGhpcy5nbG9iYWxBdHRyaWJ1dGVzID0gYXR0cmlidXRlcztcbiAgICB9ICBcblxuICAgIC8qKlxuICAgICAqIFdyaXRlcyBsb2dzIHN5bmNocm9ub3VzbHkuICBUaGlzIGZ1bmN0aW9uIGlzIGludGVuZGVkIHRvIGJlXG4gICAgICogdXRpbGl6ZWQgaW4gc2l0dWF0aW9ucyB3aGVyZSBsb2dnaW5nIGNhbm5vdCBiZSB3cml0dGVuIFxuICAgICAqIGFzeW5jaHJvbm91c2x5LCBtb3N0IGNvbW1vbmx5IGluIHRoZSBoYW5kbGVyIG9mIGEgU0lHVEVSTVxuICAgICAqIGV2ZW50LCB3aGljaCBvbmx5IGFsbG93cyBzeW5jaHJvbm91cyBjYWxscy5cbiAgICAgKi9cbiAgICBwcml2YXRlIHdyaXRlTG9nc1N5bmMoKSB7XG4gICAgICAgIGNvbnN0IGxvZ3NUb1dyaXRlID0gdGhpcy5zbGljZUxvZ3MoKTtcbiAgICAgICAgaW50ZXJuYWxMb2coJ3NpbGx5JywgYFByZXBhcmluZyBmaW5hbCBsb2cgcGF5bG9hZCBvZiAke2xvZ3NUb1dyaXRlLmxlbmd0aH0gZm9yIE5SIGNvbGxlY3RvcmApO1xuICAgICAgICBjb25zdCByYXdQYXlsb2FkID0gdGhpcy5idWlsZFJhd1Bvc3RCb2R5KGxvZ3NUb1dyaXRlKTtcbiAgICAgICAgY29uc3QgY29tcHJlc3NlZFBheWxvYWQgPSB6bGliLmd6aXBTeW5jKHJhd1BheWxvYWQpO1xuICAgICAgICBpZiAoIXRoaXMuZGVidWdNb2RlKSB7XG4gICAgICAgICAgICB0aGlzLnNlbmRMb2dzKGNvbXByZXNzZWRQYXlsb2FkKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMud3JpdGVMb2dzVG9GaWxlU3lzdGVtKGNvbXByZXNzZWRQYXlsb2FkKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyB3cml0ZUxvZ3NUb0ZpbGVTeXN0ZW0oYnVmZmVyOiBCdWZmZXIpIHtcbiAgICAgICAgZnMud3JpdGVGaWxlU3luYyhgdGVzdC0ke3RoaXMubG9nc1dyaXR0ZW4rK30uZ3pgLCBidWZmZXIpO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgYmVnaW5Xcml0ZUxvZ3MoKSB7XG4gICAgICAgIGNvbnN0IGxvZ3NUb1dyaXRlID0gdGhpcy5zbGljZUxvZ3MoKTtcblxuICAgICAgICBpbnRlcm5hbExvZygnc2lsbHknLCBgUHJlcGFyaW5nIGxvZyBwYXlsb2FkIG9mICR7bG9nc1RvV3JpdGUubGVuZ3RofSBmb3IgTlIgY29sbGVjdG9yYCk7XG4gICAgICAgIGNvbnN0IHJhd1BheWxvYWQgPSB0aGlzLmJ1aWxkUmF3UG9zdEJvZHkobG9nc1RvV3JpdGUpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgY29tcHJlc3NlZFBheWxvYWQ6IEJ1ZmZlciA9IGF3YWl0IHRoaXMuY29tcHJlc3NQYXlsb2FkKHJhd1BheWxvYWQpO1xuICAgICAgICAgICAgaWYgKCF0aGlzLmRlYnVnTW9kZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2VuZExvZ3MoY29tcHJlc3NlZFBheWxvYWQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLndyaXRlTG9nc1RvRmlsZVN5c3RlbShjb21wcmVzc2VkUGF5bG9hZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc3QgZmFsbGJhY2tNZXNzYWdlID0gJ1Vua25vd24gZXJyb3Igb2NjdXJyZWQgd2hpbGUgY29tcHJlc3NpbmcgbG9ncyB0byBzZW5kIHRvIE5ldyBSZWxpYyc7XG4gICAgICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyIGluc3RhbmNlb2YgRXJyb3IgJiYgZXJyLnN0YWNrID8gZXJyLnN0YWNrIDogZmFsbGJhY2tNZXNzYWdlOyBcbiAgICAgICAgICAgIGludGVybmFsTG9nKCdlcnJvcicsIG1lc3NhZ2UpXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBIYW5kbGVzIEhUVFAgcmVxdWVzdCB0aGF0IHNlbmRzIGNvbXByZXNzZWQgbG9nIGRhdGFcbiAgICAgKiB0byB0aGUgTmV3IFJlbGljIGVuZHBvaW50LlxuICAgICAqIEBwYXJhbSBjb21wcmVzc2VkUGF5bG9hZCBcbiAgICAgKi9cbiAgICBwcml2YXRlIHNlbmRMb2dzKGNvbXByZXNzZWRQYXlsb2FkOiBCdWZmZXIpIHtcbiAgICAgICAgQXhpb3MucG9zdChgaHR0cHM6Ly8ke0FQSV9IT1NUTkFNRX0ke0FQSV9QQVRIfWAsIGNvbXByZXNzZWRQYXlsb2FkLCB7XG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgJ0FjY2VwdCc6ICcqLyonLFxuICAgICAgICAgICAgICAgICdBcGktS2V5JzogcHJvY2Vzcy5lbnYuTkVXX1JFTElDX0xJQ0VOU0VfS0VZIGFzIHN0cmluZyxcbiAgICAgICAgICAgICAgICAnQ29udGVudC1FbmNvZGluZyc6ICdnemlwJyxcbiAgICAgICAgICAgICAgICAnQ29udGVudC1MZW5ndGgnOiAnJytjb21wcmVzc2VkUGF5bG9hZC5ieXRlTGVuZ3RoLFxuICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vZ3ppcCcsXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgaWYgKFsyMDAsIDIwMl0uaW5jbHVkZXMocmVzcG9uc2Uuc3RhdHVzKSkge1xuICAgICAgICAgICAgICAgIGludGVybmFsTG9nKCdzaWxseScsIGBMb2cgcGF5bG9hZCBhY2NlcHRlZCBieSBOZXcgUmVsaWMgQVBJLiBSZXF1ZXN0IElEOiAke3Jlc3BvbnNlLmRhdGEucmVxdWVzdElkfWApXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGludGVybmFsTG9nKCd3YXJuJywgYFVuZXhwZWN0ZWQgc3VjY2Vzc2Z1bCByZXNwb25zZSBzdGF0dXMgY29kZSBmcm9tIE5SOiAke3Jlc3BvbnNlLnN0YXR1c31gKVxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0pLmNhdGNoKGVyciA9PiB7XG4gICAgICAgICAgICBpbnRlcm5hbExvZygnZXJyb3InLCAnRXJyb3Igc2VuZGluZyBsb2cgcGF5bG9hZCB0byBOZXcgUmVsaWMnKTtcbiAgICAgICAgICAgIGludGVybmFsTG9nKCdlcnJvcicsIGVyci5zdGFjaylcbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIHRoZSBncmVhdGVyIG9iamVjdCBzdHJ1Y3R1cmUgZm9yIGEgbG9nIGRlbGl2ZXJ5IFxuICAgICAqIHBheWxvYWQgYW5kIGF0dGFjaGVzIGFuIGFycmF5IG9mIGxvZ3MgdG8gaXQuIFJldHVybnMgXG4gICAgICogc3RyaW5naWZpZWQuXG4gICAgICogQHBhcmFtIGxvZ3MgXG4gICAgICogQHJldHVybnMgXG4gICAgICovXG4gICAgcHJpdmF0ZSBidWlsZFJhd1Bvc3RCb2R5KGxvZ3M6IGFueVtdKTogc3RyaW5nIHtcbiAgICAgICAgY29uc3QgcGF5bG9hZCA9IFt7XG4gICAgICAgICAgICBjb21tb246IHtcbiAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzOiB7XG4gICAgICAgICAgICAgICAgICAgIC4uLnRoaXMuZ2xvYmFsQXR0cmlidXRlcyxcbiAgICAgICAgICAgICAgICAgICAgc2VydmljZTogdGhpcy5hcHBMYWJlbCxcbiAgICAgICAgICAgICAgICAgICAgdmVyc2lvbjogdGhpcy52ZXJzaW9uTGFiZWwsXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbjogdGhpcy5yZWdpb25MYWJlbCxcbiAgICAgICAgICAgICAgICAgICAgZW52aXJvbm1lbnQ6IHRoaXMuZW52aXJvbm1lbnRMYWJlbCxcbiAgICAgICAgICAgICAgICAgICAgZW50aXR5R3VpZDogbmV3cmVsaWMuZ2V0TGlua2luZ01ldGFkYXRhKClbJ2VudGl0eS5ndWlkJ10sXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBsb2dzOiBsb2dzXG4gICAgICAgIH1dO1xuICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkocGF5bG9hZCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQXN5bmNocm9ub3VzbHkgY29tcHJlc3Mgc3RyaW5nIHRvIGd6aXAgY29tcHJlc3NlZCBkYXRhLlxuICAgICAqIEBwYXJhbSByYXdQYXlsb2FkIFxuICAgICAqIEByZXR1cm5zIFxuICAgICAqL1xuICAgIHByaXZhdGUgYXN5bmMgY29tcHJlc3NQYXlsb2FkKHJhd1BheWxvYWQ6IHN0cmluZyk6IFByb21pc2U8QnVmZmVyPiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTxCdWZmZXI+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIHpsaWIuZ3ppcChCdWZmZXIuZnJvbShyYXdQYXlsb2FkLCAndXRmOCcpLCAoZXJyLCBjb21wcmVzc2VkUGF5bG9hZCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgICAgIHJlc29sdmUoY29tcHJlc3NlZFBheWxvYWQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNsaWNlcyBsb2cgcXVldWUuXG4gICAgICogV2lsbCBwcmVmZXIgdG8gdXNlIHRoZSBlbnRpcmUgbG9nIHF1ZXVlIHdoZW4gcG9zc2libGUsIGJ1dFxuICAgICAqIG1heSBzZW5kIG9ubHkgYSBzdWJzZWN0aW9uIGlmIHRoZSBzaXplIG9mIHRoZSBkYXRhIGlzIG5lYXJcbiAgICAgKiB0aGUgbGltaXRhdGlvbnMgZGVmaW5lZCBieSBOZXcgUmVsaWMncyBBUEkuXG4gICAgICogQHJldHVybnMgXG4gICAgICovXG4gICAgcHJpdmF0ZSBzbGljZUxvZ3MoKSB7XG4gICAgICAgIGxldCBsb2dzVG9TZW5kO1xuICAgICAgICBcbiAgICAgICAgLy8gSWYgd2Uga25vdyB0aGUgdG90YWwgbGVuZ3RoIHdpbGwgbm90IGV4Y2VlZCBtYXhpbXVtIGxlbmd0aCBzaXplXG4gICAgICAgIGlmICh0aGlzLnRvdGFsTGVuZ3RoQ291bnQgPCBNQVhfUEFZTE9BRF9TSVpFKSB7XG4gICAgICAgICAgICBbbG9nc1RvU2VuZCwgdGhpcy5sb2dRdWV1ZV0gPSBbdGhpcy5sb2dRdWV1ZSwgW11dO1xuICAgICAgICAgICAgdGhpcy5sb2dMZW5ndGhRdWV1ZSA9IFtdO1xuICAgICAgICAgICAgdGhpcy50b3RhbExlbmd0aENvdW50ID0gMDtcbiAgICAgICAgICAgIHJldHVybiBsb2dzVG9TZW5kO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gb3RoZXJ3aXNlLCBzbGljZSBvZmYgYSBzbGljZSBvZiBsb2dzIHRoYXQgd2lsbCBmaXQgaW50byBhIHNpbmdsZSByZXF1ZXN0XG4gICAgICAgIGxldCBsb2dTaXplID0gMDtcbiAgICAgICAgbGV0IGxvZ1NsaWNlSW5kZXggPSAwO1xuXG4gICAgICAgIHdoaWxlKCh0aGlzLmxvZ1F1ZXVlLmxlbmd0aCA+IDApICYmIChsb2dTaXplICsgdGhpcy5sb2dMZW5ndGhRdWV1ZVswXSA8IE1BWF9QQVlMT0FEX1NJWkUpKSB7XG4gICAgICAgICAgICBsb2dTbGljZUluZGV4Kys7XG4gICAgICAgIH1cblxuICAgICAgICBsb2dzVG9TZW5kID0gdGhpcy5sb2dRdWV1ZS5zbGljZSgwLCBsb2dTbGljZUluZGV4KTtcbiAgICAgICAgdGhpcy5sb2dRdWV1ZSA9IHRoaXMubG9nUXVldWUuc2xpY2UobG9nU2xpY2VJbmRleCk7XG4gICAgICAgIHRoaXMubG9nTGVuZ3RoUXVldWUgPSB0aGlzLmxvZ0xlbmd0aFF1ZXVlLnNsaWNlKGxvZ1NsaWNlSW5kZXgpO1xuXG4gICAgICAgIHJldHVybiBsb2dzVG9TZW5kO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFByZWRpY2F0ZSB0byBkZXRlcm1pbmUgaWYgbG9ncyBzaG91bGQgYmUgd3JpdHRlbiBiZSB3cml0dGVuIGltbWVkaWF0ZWx5LlxuICAgICAqIEByZXR1cm5zIGJvb2xlYW5cbiAgICAgKi9cbiAgICBwcml2YXRlIGltbWVkaWF0ZUxvZ1dyaXRhYmxlUHJlZGljYXRlKCk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAodGhpcy5uZXdSZWxpY0luaXRpYWxpemVkICYmIHRoaXMubG9nUXVldWUubGVuZ3RoID4gKHRoaXMuY29uZmlnLm1pbkxvZ0l0ZW1zVG9Gb3JjZSB8fCAxMDApKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFB1c2ggbG9ncyBldmVuIGlmIG5ldyByZWxpYyBoYXNuJ3QgYmVlbiBpbml0aWFsaXplZCBpZiB0aGUgYmFja2xvZyBncm93cyB0b28gbGFyZ2VcbiAgICAgICAgaWYgKHRoaXMubG9nUXVldWUubGVuZ3RoID4gNTAwKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUHJlZGljYXRlIHRvIGRldGVybWluZSBpZiBsb2dzIHNob3VsZCBiZSB3cml0dGVuIG9uIG5leHQgcGVyaW9kaWMgY2hlY2suXG4gICAgICogQHJldHVybnMgYm9vbGVhblxuICAgICAqL1xuICAgIHByaXZhdGUgbG9nc1dyaXRhYmxlUHJlZGljYXRlKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5taW5Mb2dJdGVtc0V4Y2VlZGVkKClcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQcmVkaWNhdGUgdG8gZGV0ZXJtaW5lIGlmIHRoZSB0b3RhbCBsb2dzIGhhdmUgZXhjZWVkZWQgYSBjb25maWd1cmVkIG1pbkxvZ1xuICAgICAqIGNvdW50IHZhbHVlIGlmIHN1Y2ggYSB2YWx1ZSBpcyBjb25maWd1cmVkLlxuICAgICAqIEByZXR1cm5zIFxuICAgICAqL1xuICAgIHByaXZhdGUgbWluTG9nSXRlbXNFeGNlZWRlZCgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuICEhKHRoaXMuY29uZmlnLm1pbkxvZ0l0ZW1zICYmICh0aGlzLmxvZ1F1ZXVlLmxlbmd0aCA+IHRoaXMuY29uZmlnLm1pbkxvZ0l0ZW1zKSk7XG4gICAgfSAgICBcbiAgICBcbiAgICAvKipcbiAgICAgKiBGaXhlcyBwb3NzaWJsZSBpc3N1ZXMgaW4gbG9nIGZvcm1hdCBjYXVzZWQgYnkgbGltaXRhdGlvbnMgb2YgTlJzIGxvZ2dpbmdcbiAgICAgKiB2YWx1ZXNcbiAgICAgKiBAcGFyYW0gbG9nIFxuICAgICAqIEByZXR1cm5zIFxuICAgICAqL1xuICAgIHByaXZhdGUgbG9nVHJhbnNmb3JtKGxvZzogYW55KSB7XG4gICAgICAgIGlmIChPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhsb2cpLmxlbmd0aCA+IE1BWF9BVFRSSUJVVEVTX1BFUl9FVkVOVCkge1xuICAgICAgICAgICAgaW50ZXJuYWxMb2coJ3dhcm4nLCBgTG9nIHRvIHNlbmQgdG8gSlNPTiBjb250YWlucyAke09iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGxvZyl9IC8gJHtNQVhfQVRUUklCVVRFU19QRVJfRVZFTlR9IGF0dHJpYnV0ZXMuYCk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGZvciAobGV0IGtleSBvZiBPYmplY3Qua2V5cyhsb2cpKSB7XG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IGxvZ1trZXldO1xuICAgICAgICAgICAgLy8gcmVwbGFjZSBrZXkgd2l0aCBsZW5ndGggdG9vIGhpZ2hcbiAgICAgICAgICAgIGlmIChrZXkubGVuZ3RoID4gTUFYX0FUVFJJQlVURV9OQU1FX0xFTkdUSCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG5ld0tleSA9IGtleS5zbGljZSgwLCBNQVhfQVRUUklCVVRFX05BTUVfTEVOR1RIKTtcbiAgICAgICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobG9nLCBrZXkuc2xpY2UoMCwgTUFYX0FUVFJJQlVURV9OQU1FX0xFTkdUSCksIFxuICAgICAgICAgICAgICAgICAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGxvZywga2V5IGFzIFByb3BlcnR5S2V5KSBhcyBQcm9wZXJ0eURlc2NyaXB0b3IpO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBsb2cua2V5O1xuXG4gICAgICAgICAgICAgICAgLy8gVXBkYXRlIGtleSBuYW1lIGZvciB1c2FnZSBpbiBsYXRlciBzdGVwc1xuICAgICAgICAgICAgICAgIGtleSA9IG5ld0tleTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gQ29uY2F0ZW5hdGUgbG9nIG1lc3NhZ2VzIHdpdGggbGVuZ3RoIGdyZWF0ZXIgdGhhbiBNQVhfQVRUUklCVVRFX1ZBTFVFX0xFTkdUSFxuICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgdmFsdWUubGVuZ3RoID4gTUFYX0FUVFJJQlVURV9WQUxVRV9MRU5HVEgpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jb25maWc/Lndhcm5PbkF0dHJpYnV0ZUxlbmd0aE92ZXJmbG93KSB7XG4gICAgICAgICAgICAgICAgICAgIGludGVybmFsTG9nKCd3YXJuJywgYE5SIExvZyBhdHRyaWJ1dGUgbGVuZ3RoIG92ZXJmbG93LiBMZW5ndGg6ICR7dmFsdWUubGVuZ3RofS8ke01BWF9BVFRSSUJVVEVfVkFMVUVfTEVOR1RIfWApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBsb2cua2V5ID0gdmFsdWUuc2xpY2UoMCwgTUFYX0FUVFJJQlVURV9WQUxVRV9MRU5HVEgpOyBcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGtleS5pbmNsdWRlcygnICcpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbmV3S2V5ID0ga2V5LnJlcGxhY2VBbGwoJyAnLCAnLicpO1xuICAgICAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShsb2csIGtleS5zbGljZSgwLCBNQVhfQVRUUklCVVRFX05BTUVfTEVOR1RIKSwgXG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IobG9nLCBrZXkgYXMgUHJvcGVydHlLZXkpIGFzIFByb3BlcnR5RGVzY3JpcHRvcik7XG4gICAgICAgICAgICAgICAgZGVsZXRlIGxvZy5rZXk7XG5cbiAgICAgICAgICAgICAgICAvLyBVcGRhdGUga2V5IG5hbWUgZm9yIHVzYWdlIGluIGxhdGVyIHN0ZXBzXG4gICAgICAgICAgICAgICAga2V5ID0gbmV3S2V5O1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZ1bmN0aW9uIHVzZWQgdG8gcmVwZWF0ZWRseSB0cmlnZ2VyIGxvZyBwdXNoZXNcbiAgICAgKi9cbiAgICBwcml2YXRlIGNyZWF0ZUxvZ0NoZWNrVGltZW91dCgpIHtcbiAgICAgICAgdGhpcy50aW1lb3V0SWQgPSBzZXRUaW1lb3V0KGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgIGlmICh0aGlzLmxvZ1F1ZXVlLmxlbmd0aCA+ICh0aGlzLmNvbmZpZy5taW5Mb2dJdGVtcyB8fCAxKSkge1xuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuYmVnaW5Xcml0ZUxvZ3MoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZUxvZ0NoZWNrVGltZW91dCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCB0aGlzLmNvbmZpZy5sb2dQdXNoRnJlcXVlbmN5KVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEhlbHBlciBtZXRob2QgdGhhdCByZWdpc3RlcnMgbGlzdGVuZXJzIGZvciBldmVudHNcbiAgICAgKiByZWxhdGVkIHRvIGltbWluZW50IGFwcGxpY2F0aW9uIHNodXRkb3duIHNvIHRoYXRcbiAgICAgKiBmaW5hbCBsb2dzIGNhbiBiZSBwdXNoZWRcbiAgICAgKi9cbiAgICBwcml2YXRlIHJlZ2lzdGVyQXBwRGVhdGhMb2dQdXNoKCkge1xuICAgICAgICBsZXQgZmluYWxXcml0dGVuID0gZmFsc2U7XG4gICAgICAgIHByb2Nlc3Mub24oJ2V4aXQnLCAoKSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy50aW1lb3V0SWQpIGNsZWFyVGltZW91dCh0aGlzLnRpbWVvdXRJZCk7XG4gICAgICAgICAgICBsZXQgbyA9IGZpbmFsV3JpdHRlbjtcbiAgICAgICAgICAgIGZpbmFsV3JpdHRlbiA9IHRydWU7XG4gICAgICAgICAgICBpZiAobykgcmV0dXJuO1xuXG4gICAgICAgICAgICBpbnRlcm5hbExvZygnaW5mbycsICd3cml0aW5nIGZpbmFsIGxvZ3MnKTtcblxuICAgICAgICAgICAgdGhpcy53cml0ZUxvZ3NTeW5jKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHByb2Nlc3Mub24oJ1NJR0lOVCcsICgpID0+IHtcbiAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgyKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcHJvY2Vzcy5vbigndW5jYXVnaHRFeGNlcHRpb24nLCAoZSkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coZSk7XG4gICAgICAgICAgICBpbnRlcm5hbExvZygnZXJyb3InLCBlLnN0YWNrIHx8ICcnKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcHJvY2Vzcy5vbignU0lHVEVSTScsICgpID0+IHtcbiAgICAgICAgICAgIGlmICh0aGlzLnRpbWVvdXRJZCkgY2xlYXJUaW1lb3V0KHRoaXMudGltZW91dElkKTtcbiAgICAgICAgICAgIHRoaXMud3JpdGVMb2dzU3luYygpO1xuICAgICAgICB9KVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE5ldyBSZWxpYyBkb2VzIG5vdCBleHBvc2UgYSBtZXRob2QgdG8gY2hlY2sgaXRzIGluaXRpYWxpemF0aW9uIHN0YXR1c1xuICAgICAqIElmIHdlIHB1c2ggbG9ncyBiZWZvcmUgTmV3IFJlbGljIGluaXRpYWxpemVzLCB0aGV5IHdpbGwgbm90IGhhdmUgYW4gYXR0YWNoZWRcbiAgICAgKiBlbnRpdHkgZ3VpZC4gIEZvciB0aGlzIHJlYXNvbiB3ZSB3aWxsIGluaXRpYWxpemUgYW4gaW50ZXJ2YWwgdGhhdCBjYW4gcnVuIHVudGlsXG4gICAgICogaXQgaXMgaW5pdGlhbGl6ZWQuXG4gICAgICovXG4gICAgcHJpdmF0ZSByZWdpc3Rlck5ld1JlbGljSW5pdGlhbGl6YXRpb25JbnRlcnZhbCgpIHtcbiAgICAgICAgY29uc3QgbmV3UmVsaWNJbml0aWFsaXphdGlvbkNoZWNrVGltZW91dCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG1ldGFkYXRhID0gbmV3cmVsaWMuZ2V0TGlua2luZ01ldGFkYXRhKCk7XG4gICAgICAgICAgICBpZiAobWV0YWRhdGFbJ2VudGl0eS5ndWlkJ10pIHtcbiAgICAgICAgICAgICAgICB0aGlzLm5ld1JlbGljSW5pdGlhbGl6ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGludGVybmFsTG9nKCdpbmZvJywgJ0RldGVjdGVkIE5ldyBSZWxpYyBoYXMgaW5pdGlhbGl6ZWQgd2l0aCBlbnRpdHkuZ3VpZCcpO1xuICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwobmV3UmVsaWNJbml0aWFsaXphdGlvbkNoZWNrVGltZW91dCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIDEwMCk7XG4gICAgfVxufVxuXG4vKipcbiAqIFJlcGxhY2VzIGV4aXN0aW5nIHdyaXRlcnMgZm9yIHN0ZG91dCBhbmQgc3RkZXJyIHdpdGhcbiAqIFBhc3NUaHJvdWdoIHN0cmVhbXMgdGhhdCB3aWxsIGludm9rZSBwcm92aWRlZCBjYWxsYmFja3NcbiAqIHdpdGggdGhlIGRhdGEgcHJpb3IgdG8gcGFzc2luZyB0aGVtIHRvIHRoZSBvcmlnaW5hbCBzdHJlYW1zXG4gKi9cbmNsYXNzIFN0YW5kYXJkT3V0UGFzc1Rocm91Z2gge1xuXG5cbiAgICBwcml2YXRlIHJlYWRvbmx5IHN0ZG91dFB0ID0gbmV3IFBhc3NUaHJvdWdoKCk7XG4gICAgcHJpdmF0ZSByZWFkb25seSBzdGRlcnJQdCA9IG5ldyBQYXNzVGhyb3VnaCgpO1xuXG4gICAgcHJpdmF0ZSByZWFkb25seSBzdGRvdXQ7XG4gICAgcHJpdmF0ZSByZWFkb25seSBzdGRlcnI7XG5cbiAgICBwcml2YXRlIHJlYWRvbmx5IHdyaXRlU3Rkb3V0O1xuICAgIHByaXZhdGUgcmVhZG9ubHkgd3JpdGVTdGRlcnI7XG5cbiAgICBjb25zdHJ1Y3RvcihzdGRvdXRDYjogKGRhdGE6IHN0cmluZykgPT4gdm9pZCwgc3RkZXJyQ2I6IChkYXRhOiBzdHJpbmcpID0+IHZvaWQpIHtcbiAgICAgICAgLy8gU3RvcmUgb3JpZ2luYWwgd3JpdGUgc3Rkb3V0L3N0ZGVyciB3cml0ZSBmdW5jdGlvbnNcbiAgICAgICAgdGhpcy5zdGRvdXQgPSBwcm9jZXNzLnN0ZG91dC53cml0ZTtcbiAgICAgICAgdGhpcy5zdGRlcnIgPSBwcm9jZXNzLnN0ZGVyci53cml0ZTtcblxuICAgICAgICAvLyBDcmVhdGUgZnVuY3Rpb25zIHdoaWNoIHdyaXRlIHRvIG9yaWdpbmFsIHdyaXRlcyB3aXRoIHN0ZG91dC9zdGRlcnIgY29udGV4dHMgYm91bmRcbiAgICAgICAgdGhpcy53cml0ZVN0ZG91dCA9IChkYXRhOiBzdHJpbmcpID0+IHRoaXMuc3Rkb3V0LmNhbGwocHJvY2Vzcy5zdGRvdXQsIGRhdGEpO1xuICAgICAgICB0aGlzLndyaXRlU3RkZXJyID0gKGRhdGE6IHN0cmluZykgPT4gdGhpcy5zdGRlcnIuY2FsbChwcm9jZXNzLnN0ZGVyciwgZGF0YSk7XG5cbiAgICAgICAgLy8gQXNzaWduIGxpc3RlbmVycyB0byBQYXNzVGhyb3VnaHNcbiAgICAgICAgdGhpcy5zdGRvdXRQdC5vbignZGF0YScsIChkYXRhKSA9PiB7XG4gICAgICAgICAgICBpZiAoZGF0YSBpbnN0YW5jZW9mIEJ1ZmZlcikge1xuICAgICAgICAgICAgICAgIGRhdGEgPSBkYXRhLnRvU3RyaW5nKCd1dGY4Jyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzdGRvdXRDYihkYXRhKTtcbiAgICAgICAgICAgIHRoaXMud3JpdGVTdGRvdXQoZGF0YSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuc3RkZXJyUHQub24oJ2RhdGEnLCAoZGF0YSkgPT4ge1xuICAgICAgICAgICAgaWYgKGRhdGEgaW5zdGFuY2VvZiBCdWZmZXIpIHtcbiAgICAgICAgICAgICAgICBkYXRhID0gZGF0YS50b1N0cmluZygndXRmOCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3RkZXJyQ2IoZGF0YSk7XG4gICAgICAgICAgICB0aGlzLndyaXRlU3RkZXJyKGRhdGEpO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBSZXBsYWNlIG9yaWdpbmFsIHdyaXRlIGNhbGxzIHdpdGggY29udGV4dHMgYm91bmQgdG8gcGFyZW50IG9iamVjdFxuICAgICAgICBwcm9jZXNzLnN0ZG91dC53cml0ZSA9IHRoaXMuc3Rkb3V0UHQud3JpdGUuYmluZCh0aGlzLnN0ZG91dFB0KSBhcyBhbnk7XG4gICAgICAgIHByb2Nlc3Muc3RkZXJyLndyaXRlID0gdGhpcy5zdGRlcnJQdC53cml0ZS5iaW5kKHRoaXMuc3RkZXJyUHQpIGFzIGFueTtcblxuICAgICAgICAvLyBBZGQgdW5jYXVnaHQgZXJyb3IgaGFuZGxlciB0byBoYW5kbGUgbG9nZ2luZyBvZiBmYWlsdXJlIGNhc2VcbiAgICAgICAgcHJvY2Vzcy5vbigndW5jYXVnaHRFeGNlcHRpb24nLCAoZXJyKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlYWZmaXggdGhlIHJlcGxhY2VkIHN0ZG91dCBhbmQgc3RkZXJyIHRoZW5cbiAgICAgKiBjbG9zZXMgYWxsIHN0cmVhbXMgb3duZWQgYnkgdGhpcyBpbnN0YW5jZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgZGVzdHJveSgpIHtcbiAgICAgICAgcHJvY2Vzcy5zdGRvdXQud3JpdGUgPSB0aGlzLnN0ZG91dDtcbiAgICAgICAgcHJvY2Vzcy5zdGRlcnIud3JpdGUgPSB0aGlzLnN0ZGVycjtcblxuICAgICAgICB0aGlzLnN0ZG91dFB0LmRlc3Ryb3koKVxuICAgICAgICB0aGlzLnN0ZGVyclB0LmRlc3Ryb3koKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBCeXBhc3MgdGhlIGNvbmZpZ3VyZWQgY2FsbGJhY2sgZnVuY3Rpb24gZm9yIHN0ZG91dCBieVxuICAgICAqIHdyaXRpbmcgZGlyZWN0bHkgdG8gdGhlIGRldGFjaGVkIG91dHB1dCBzdHJlYW1cbiAgICAgKiBAcGFyYW0gZGF0YSBcbiAgICAgKi9cbiAgICBwdWJsaWMgc3Rkb3V0QnlwYXNzKGRhdGE6IHN0cmluZyB8IG9iamVjdCkge1xuICAgICAgICBpZiAoZGF0YSBpbnN0YW5jZW9mIE9iamVjdCkge1xuICAgICAgICAgICAgZGF0YSA9IEpTT04uc3RyaW5naWZ5KGRhdGEpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMud3JpdGVTdGRvdXQoKGRhdGEgYXMgdW5rbm93biBhcyBzdHJpbmcpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBCeXBhc3MgdGhlIGNvbmZpZ3VyZWQgY2FsbGJhY2sgZnVuY3Rpb24gZm9yIHN0ZGVyciBieVxuICAgICAqIHdyaXRpbmcgZGlyZWN0bHkgdG8gdGhlIGRldGFjaGVkIG91dHB1dCBzdHJlYW1cbiAgICAgKiBAcGFyYW0gZGF0YSBcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RkZXJyQnlwYXNzKGRhdGE6IHN0cmluZykge1xuICAgICAgICB0aGlzLndyaXRlU3RkZXJyKGRhdGEpO1xuICAgIH1cbn1cblxuXG4vKipcbiAqIExhenkgbG9hZCBsb2dnZXIsIHdyaXRlIGJ1ZmZlcmVkIG1lc3NhZ2VzIG9uY2UgbG9hZGVkXG4gKiBOb3RlOiBMYXp5IGxvYWRpbmcgaXMgbmVjZXNzYXJ5IHRvIHJlc29sdmUgY2lyY3VsYXIgZGVwZW5kZW5jaWVzIGJldHdlZW4gdGhpc1xuICogbW9kdWxlIGFuZCB0aGUgbG9nZ2VyLlxuICovXG4oYXN5bmMgKCkgPT4ge1xuICAgIGNvbnN0IHsgd2l0aExvZ2dlciB9ID0gYXdhaXQgaW1wb3J0KCcuL2xvZ2dlcicpO1xuICAgIGNvbnN0IGxldmVsOiBOUE1Mb2dnaW5nTGV2ZWxzID0gcHJvY2Vzcy5lbnYuTE9HX0RFTElWRVJZX0FHRU5UX0xFVkVMIGFzIE5QTUxvZ2dpbmdMZXZlbHMgfHwgJ3dhcm4nO1xuICAgIGxvZyA9IHdpdGhMb2dnZXIoJ05ld1JlbGljTG9nRm9yd2FyZGVyJywgbGV2ZWwpO1xuICAgIHdoaWxlKGludGVybmFsTG9nQnVmZmVyLmxlbmd0aCkge1xuICAgICAgICBjb25zdCBbbGV2ZWwsIG1lc3NhZ2VdID0gaW50ZXJuYWxMb2dCdWZmZXIuc2hpZnQoKSBhcyBbc3RyaW5nLCBzdHJpbmddO1xuICAgICAgICAobG9nIGFzIGFueSlbbGV2ZWxdKG1lc3NhZ2UpO1xuICAgIH1cbn0pKCk7XG4iXX0=