"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _typeof3 = require("@babel/runtime/helpers/typeof");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NewRelicLogDeliveryAgent = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

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
            service: process.env.NEW_RELIC_APP_NAME,
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9Mb2dEZWxpdmVyeUFnZW50LnRzIl0sIm5hbWVzIjpbIkFQSV9IT1NUTkFNRSIsInByb2Nlc3MiLCJlbnYiLCJLTF9OUl9MT0dfSE9TVE5BTUUiLCJBUElfUEFUSCIsIktMX05SX0xPR19QQVRIIiwiTUFYX1BBWUxPQURfU0laRSIsIk1BWF9BVFRSSUJVVEVTX1BFUl9FVkVOVCIsIk1BWF9BVFRSSUJVVEVfTkFNRV9MRU5HVEgiLCJNQVhfQVRUUklCVVRFX1ZBTFVFX0xFTkdUSCIsImxvZyIsImludGVybmFsTG9nQnVmZmVyIiwiaW50ZXJuYWxMb2ciLCJsZXZlbCIsIm1lc3NhZ2UiLCJwdXNoIiwiZGVmYXVsdENvbmZpZyIsImJ5dGVzV3JpdHRlblRocmVzaG9sZCIsIndhcm5PbkF0dHJpYnV0ZUxlbmd0aE92ZXJmbG93IiwibWluQnl0ZXNXcml0dGVuIiwibWluTG9nSXRlbXMiLCJsb2dQdXNoRnJlcXVlbmN5IiwibWluTG9nSXRlbXNUb0ZvcmNlIiwiTmV3UmVsaWNMb2dEZWxpdmVyeUFnZW50IiwiREVCVUdfV1JJVEVfTE9HU19UT19GSUxFIiwiY29uZmlnIiwibmV3UmVsaWNMb2dUcmFuc3BvcnQiLCJOZXdSZWxpY0xvZ1RyYW5zcG9ydCIsImNiIiwiYWRkTG9nIiwibG9nQ2FsbGJhY2siLCJlcnJDYWxsYmFjayIsImxhYmVsIiwic3RhbmRhcmRPdXRQYXNzVGhyb3VnaCIsIlN0YW5kYXJkT3V0UGFzc1Rocm91Z2giLCJyZWdpc3RlckFwcERlYXRoTG9nUHVzaCIsImNyZWF0ZUxvZ0NoZWNrVGltZW91dCIsInJlZ2lzdGVyTmV3UmVsaWNJbml0aWFsaXphdGlvbkludGVydmFsIiwidGltZW91dElkIiwiY2xlYXJUaW1lb3V0IiwiZGVzdHJveSIsImNsb3NlIiwid3JpdGVMb2dzU3luYyIsInN0ciIsIkpTT04iLCJzdHJpbmdpZnkiLCJvYmoiLCJwYXJzZSIsIm1zZyIsIm5hbWUiLCJlcnIiLCJjYWxsYmFjayIsImpzb25EYXRhIiwiaXNOUkNvbXBhdGlibGVKc29uTG9nU3RyaW5nIiwicHJvY2Vzc0FzSnNvbkxvZyIsInByb2Nlc3NBc1N0cmluZ0xvZyIsImltbWVkaWF0ZUxvZ1dyaXRhYmxlUHJlZGljYXRlIiwiYmVnaW5Xcml0ZUxvZ3MiLCJzdGRlcnJCeXBhc3MiLCJzdGRvdXRCeXBhc3MiLCJsb2dUcmFuc2Zvcm0iLCJsb2dTdHJpbmciLCJsZW5ndGgiLCJCdWZmZXIiLCJieXRlTGVuZ3RoIiwibG9nUXVldWUiLCJsb2dMZW5ndGhRdWV1ZSIsInRvdGFsTGVuZ3RoQ291bnQiLCJlbmRzV2l0aCIsInN1YnN0cmluZyIsIm5ld1JlbGljTWV0YWRhdGEiLCJuZXdyZWxpYyIsImdldExpbmtpbmdNZXRhZGF0YSIsInN0cnVjdHVyZWRMb2ciLCJ0aW1lc3RhbXAiLCJEYXRlIiwibm93Iiwib3JpZ2luYWxfdGltZXN0YW1wIiwidG9JU09TdHJpbmciLCJob3N0bmFtZSIsImpzb25Mb2dTdHJpbmciLCJhdHRyaWJ1dGVzIiwiZ2xvYmFsQXR0cmlidXRlcyIsImxvZ3NUb1dyaXRlIiwic2xpY2VMb2dzIiwicmF3UGF5bG9hZCIsImJ1aWxkUmF3UG9zdEJvZHkiLCJjb21wcmVzc2VkUGF5bG9hZCIsInpsaWIiLCJnemlwU3luYyIsImRlYnVnTW9kZSIsInNlbmRMb2dzIiwid3JpdGVMb2dzVG9GaWxlU3lzdGVtIiwiYnVmZmVyIiwiZnMiLCJ3cml0ZUZpbGVTeW5jIiwibG9nc1dyaXR0ZW4iLCJjb21wcmVzc1BheWxvYWQiLCJmYWxsYmFja01lc3NhZ2UiLCJFcnJvciIsInN0YWNrIiwiQXhpb3MiLCJwb3N0IiwiaGVhZGVycyIsIk5FV19SRUxJQ19MSUNFTlNFX0tFWSIsInRoZW4iLCJyZXNwb25zZSIsImluY2x1ZGVzIiwic3RhdHVzIiwiZGF0YSIsInJlcXVlc3RJZCIsImxvZ3MiLCJwYXlsb2FkIiwiY29tbW9uIiwic2VydmljZSIsIk5FV19SRUxJQ19BUFBfTkFNRSIsImVudGl0eUd1aWQiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsImd6aXAiLCJmcm9tIiwibG9nc1RvU2VuZCIsImxvZ1NpemUiLCJsb2dTbGljZUluZGV4Iiwic2xpY2UiLCJuZXdSZWxpY0luaXRpYWxpemVkIiwibWluTG9nSXRlbXNFeGNlZWRlZCIsIk9iamVjdCIsImdldE93blByb3BlcnR5TmFtZXMiLCJrZXlzIiwia2V5IiwidmFsdWUiLCJuZXdLZXkiLCJkZWZpbmVQcm9wZXJ0eSIsImdldE93blByb3BlcnR5RGVzY3JpcHRvciIsInJlcGxhY2VBbGwiLCJzZXRUaW1lb3V0IiwiZmluYWxXcml0dGVuIiwib24iLCJvIiwiZXhpdCIsImUiLCJjb25zb2xlIiwibmV3UmVsaWNJbml0aWFsaXphdGlvbkNoZWNrVGltZW91dCIsInNldEludGVydmFsIiwibWV0YWRhdGEiLCJjbGVhckludGVydmFsIiwiaW5zdGFuY2UiLCJzdGRvdXRDYiIsInN0ZGVyckNiIiwiUGFzc1Rocm91Z2giLCJzdGRvdXQiLCJ3cml0ZSIsInN0ZGVyciIsIndyaXRlU3Rkb3V0IiwiY2FsbCIsIndyaXRlU3RkZXJyIiwic3Rkb3V0UHQiLCJ0b1N0cmluZyIsInN0ZGVyclB0IiwiYmluZCIsImVycm9yIiwid2l0aExvZ2dlciIsIkxPR19ERUxJVkVSWV9BR0VOVF9MRVZFTCIsInNoaWZ0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBR0E7Ozs7Ozs7Ozs7QUFFQSxJQUFNQSxZQUFZLEdBQUdDLE9BQU8sQ0FBQ0MsR0FBUixDQUFZQyxrQkFBWixJQUFrQyx5QkFBdkQ7QUFDQSxJQUFNQyxRQUFRLEdBQUdILE9BQU8sQ0FBQ0MsR0FBUixDQUFZRyxjQUFaLElBQThCLFNBQS9DO0FBQ0EsSUFBTUMsZ0JBQWdCLFlBQUcsRUFBSCxFQUFPLENBQVAsQ0FBdEI7QUFDQSxJQUFNQyx3QkFBd0IsR0FBRyxHQUFqQztBQUNBLElBQU1DLHlCQUF5QixHQUFHLEdBQWxDO0FBQ0EsSUFBTUMsMEJBQTBCLEdBQUcsSUFB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QUFDQTs7OztXQUNJLHNCQUFvQkEsSUFBcEIsRUFBa0M7QUFDOUIsV0FBS2dELFdBQUwsQ0FBaUJoRCxJQUFqQjtBQUNIOzs7O0FBSUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBQ0EsOEVBQUM7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxtREFDdUMsVUFEdkM7QUFBQTs7QUFBQTtBQUFBO0FBQ1dzRCxVQUFBQSxVQURYLGlCQUNXQSxVQURYO0FBRVN0SixVQUFBQSxLQUZULEdBRW1DWixPQUFPLENBQUNDLEdBQVIsQ0FBWWtLLHdCQUFaLElBQTRELE1BRi9GO0FBR0cxSixVQUFBQSxHQUFHLEdBQUd5SixVQUFVLENBQUMsc0JBQUQsRUFBeUJ0SixLQUF6QixDQUFoQjs7QUFDQSxpQkFBTUYsaUJBQWlCLENBQUNtRCxNQUF4QixFQUFnQztBQUFBLG9CQUNIbkQsaUJBQWlCLENBQUMwSixLQUFsQixFQURHLHFEQUNyQnhKLE1BRHFCLGFBQ2RDLE9BRGM7O0FBRTNCSixZQUFBQSxHQUFELENBQWFHLE1BQWIsRUFBb0JDLE9BQXBCO0FBQ0g7O0FBUEo7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsQ0FBRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgbmV3cmVsaWMgZnJvbSAnbmV3cmVsaWMnO1xuaW1wb3J0IHpsaWIgZnJvbSAnemxpYic7XG5pbXBvcnQgeyBOZXdSZWxpY0xvZ1RyYW5zcG9ydCB9IGZyb20gJy4vTmV3UmVsaWNMb2dUcmFuc3BvcnQnO1xuaW1wb3J0IHsgUGFzc1Rocm91Z2ggfSBmcm9tICdzdHJlYW0nO1xuaW1wb3J0IHsgTG9nZ2VyIH0gZnJvbSAnd2luc3Rvbic7XG5pbXBvcnQgeyBOUE1Mb2dnaW5nTGV2ZWxzIH0gZnJvbSAnLi9sb2dnZXInO1xuaW1wb3J0IEF4aW9zIGZyb20gJ2F4aW9zJztcblxuY29uc3QgQVBJX0hPU1ROQU1FID0gcHJvY2Vzcy5lbnYuS0xfTlJfTE9HX0hPU1ROQU1FIHx8ICdsb2ctYXBpLmV1Lm5ld3JlbGljLmNvbSc7XG5jb25zdCBBUElfUEFUSCA9IHByb2Nlc3MuZW52LktMX05SX0xPR19QQVRIIHx8ICcvbG9nL3YxJztcbmNvbnN0IE1BWF9QQVlMT0FEX1NJWkUgPSAxMCoqNjtcbmNvbnN0IE1BWF9BVFRSSUJVVEVTX1BFUl9FVkVOVCA9IDI1NTtcbmNvbnN0IE1BWF9BVFRSSUJVVEVfTkFNRV9MRU5HVEggPSAyNTU7XG5jb25zdCBNQVhfQVRUUklCVVRFX1ZBTFVFX0xFTkdUSCA9IDQwOTY7XG5cbmxldCBsb2c6IExvZ2dlciB8IHVuZGVmaW5lZDtcbmxldCBpbnRlcm5hbExvZ0J1ZmZlcjogQXJyYXk8W3N0cmluZywgc3RyaW5nXT4gPSBbXTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byB3cml0ZSBsb2dzIHRoYXQgYXJlIGludGVybmFsIHRvIHRoaXMgbW9kdWxlLlxuICogQnVmZmVycyBjYWxscyB1bnRpbCB0aGUgV2luc3RvbiBsb2dnZXIgY2FuIGJlIGFzeW5jIGltcG9ydGRcbiAqIEFmdGVyd29yZHMsIHdyaXRlcyBsb2dzIGRpcmVjdGx5IHRvIHRoZSBsb2dnZXJcbiAqIEBwYXJhbSBsZXZlbCBcbiAqIEBwYXJhbSBtZXNzYWdlIFxuICovXG5mdW5jdGlvbiBpbnRlcm5hbExvZyhsZXZlbDogc3RyaW5nLCBtZXNzYWdlOiBzdHJpbmcpIHtcbiAgICBpZiAobG9nKSB7XG4gICAgICAgIChsb2cgYXMgYW55KVtsZXZlbF0obWVzc2FnZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgaW50ZXJuYWxMb2dCdWZmZXIucHVzaChbbGV2ZWwsIG1lc3NhZ2VdKTtcbiAgICB9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTmV3UmVsaWNMb2dEZWxpdmVyeUFnZW50Q29uZmlnIHtcbiAgICAvKipcbiAgICAgKiBIb3cgZnJlcXVlbnRseSBjaGVja3Mgc2hvdWxkIGJlIHJ1biB0byBwdXNoIGxvZ3MgdG8gTlJcbiAgICAgKiBEZWZhdWx0IGlzIDEwIHNlY29uZHNcbiAgICAgKi9cbiAgICAgbG9nUHVzaEZyZXF1ZW5jeT86IG51bWJlcjtcblxuICAgICAvKipcbiAgICAgICogTWluaW11bSBudW1iZXIgb2YgbG9nIHN0YXRlbWVudHMgd3JpdHRlbiBiZWZvcmUgbG9ncyBjYW4gYmUgcHVzaGVkIHRvIE5SXG4gICAgICAqIGJ5IHBlcmlvZGljIGxvZ2dlci5cbiAgICAgICogRGVmYXVsdCBpcyAyXG4gICAgICAqL1xuICAgICBtaW5Mb2dJdGVtcz86IG51bWJlcjtcbiBcbiBcbiAgICAgLyoqXG4gICAgICAqIE1pbmltdW0gbnVtYmVyIG9mIGxvZyBzdGF0ZW1lbnRzIHRvIGZvcmNlIGFuIGltbWVkaWF0ZSBwdXNoIHRvIE5SLiBVc2VkXG4gICAgICAqIHRvIGVuc3VyZSB0aGF0IHRoZSBsb2dnaW5nIHN5c3RlbSBkb2VzIG5vdCBnZXQgYmFja2VkIHVwIGlmIGFtb3VudCBiZWluZ1xuICAgICAgKiBsb2dnZWQgc3VycGFzc2VzIHRoZSBiYW5kd2lkdGggb2YgdGhlIHBlcmlvZGljIGxvZ2dlci5cbiAgICAgICogRGVmYXVsdCBpcyAxMDAuXG4gICAgICAqL1xuICAgICBtaW5Mb2dJdGVtc1RvRm9yY2U/OiBudW1iZXI7XG5cbiBcbiAgICAgLyoqXG4gICAgICAqIE1pbmltdW0gbnVtYmVyIG9mIGJ5dGVzIHdyaXR0ZW4gdG8gY29tcHJlc3Npb24gc3RyZWFtIGJlZm9yZSBwdXNoaW5nIHRvIE5SXG4gICAgICAqL1xuICAgICBtaW5CeXRlc1dyaXR0ZW4/OiBudW1iZXI7XG4gXG4gICAgIC8qKlxuICAgICAgKiBUaHJlc2hvbGQgZm9yIGJ5dGVzIHdyaXR0ZW4gYXQgd2hpY2ggcG9pbnQgYSBuZXcgd3JpdGUgdG8gTlIgd2lsbCBiZSBhdXRvbWF0aWNhbGx5XG4gICAgICAqIHRyaWdnZXJlZC4gRGVmYXVsdHMgdG8gKDQvNSAqIE1BWF9QQVlMT0FEX1NJWkUpXG4gICAgICAqL1xuICAgICBieXRlc1dyaXR0ZW5UaHJlc2hvbGQ/OiBudW1iZXI7XG4gXG4gICAgIC8qKlxuICAgICAgKiBQcm9kdWNlIGEgd2FybmluZyB3aGVuIGF0dHJpYnV0ZSB2YWx1ZXMgb3ZlcmZsb3cgdGhlIE5SIG1heGltdW0gbGVuZ3RoIG9mIDQwOTYuXG4gICAgICAqIERlZmF1bHQgaXMgZmFsc2UuXG4gICAgICAqL1xuICAgICB3YXJuT25BdHRyaWJ1dGVMZW5ndGhPdmVyZmxvdz86IGJvb2xlYW47XG59XG5cbmNvbnN0IGRlZmF1bHRDb25maWc6IE5ld1JlbGljTG9nRGVsaXZlcnlBZ2VudENvbmZpZyA9IHtcbiAgICBieXRlc1dyaXR0ZW5UaHJlc2hvbGQ6IE1BWF9QQVlMT0FEX1NJWkUgKiA0IC8gNSxcbiAgICB3YXJuT25BdHRyaWJ1dGVMZW5ndGhPdmVyZmxvdzogZmFsc2UsXG4gICAgbWluQnl0ZXNXcml0dGVuOiBNQVhfUEFZTE9BRF9TSVpFICogMSAvIDUsXG4gICAgbWluTG9nSXRlbXM6IDIsXG4gICAgbG9nUHVzaEZyZXF1ZW5jeTogNjAwMDAsXG4gICAgbWluTG9nSXRlbXNUb0ZvcmNlOiAxMDAsXG59XG5cbmV4cG9ydCBjbGFzcyBOZXdSZWxpY0xvZ0RlbGl2ZXJ5QWdlbnQge1xuIFxuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemVzIGEgTmV3UmVsaWNMb2dEZWxpdmVyeUFnZW50IGluc3RhbmNlIGlmIHRoZSBMT0dfU1RZTEUgZW52aXJvbm1lbnRcbiAgICAgKiB2YXJpYWJsZSBpcyBzZXQgdG8gTkVXX1JFTElDLiBPdGhlcndpc2UgaXQgZG9lcyBub3RoaW5nLlxuICAgICAqIEBwYXJhbSBjb25maWcgXG4gICAgICogQHJldHVybnMgXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBpbml0aWFsaXplKCkge1xuICAgICAgICBpZiAoIXByb2Nlc3MuZW52Lk5FV19SRUxJQ19MSUNFTlNFX0tFWSkgcmV0dXJuO1xuICAgICAgICBOZXdSZWxpY0xvZ0RlbGl2ZXJ5QWdlbnQuaW5zdGFuY2UgPSBuZXcgTmV3UmVsaWNMb2dEZWxpdmVyeUFnZW50KCk7XG4gICAgICAgIHJldHVybiBOZXdSZWxpY0xvZ0RlbGl2ZXJ5QWdlbnQuaW5zdGFuY2U7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyBnZXRJbnN0YW5jZSgpIHtcbiAgICAgICAgcmV0dXJuIE5ld1JlbGljTG9nRGVsaXZlcnlBZ2VudD8uaW5zdGFuY2U7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyBjb25maWd1cmUoY29uZmlnOiBOZXdSZWxpY0xvZ0RlbGl2ZXJ5QWdlbnRDb25maWcpIHtcbiAgICAgICAgY29uc3QgaW5zdGFuY2UgPSBOZXdSZWxpY0xvZ0RlbGl2ZXJ5QWdlbnQuaW5zdGFuY2U7XG4gICAgICAgIGlmICghaW5zdGFuY2UpIHtcbiAgICAgICAgICAgIGludGVybmFsTG9nKCd3YXJuJywgJ0NvbmZpZ3VyZSBjYWxsZWQgYmVmb3JlIGluc3RhbmNlIGluaXRpYWxpemF0aW9uLiBDb25maWd1cmF0aW9uIG5vdCBhcHBsaWVkJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaW5zdGFuY2UuY29uZmlnID0ge1xuICAgICAgICAgICAgLi4uaW5zdGFuY2UuY29uZmlnLFxuICAgICAgICAgICAgLi4uY29uZmlnXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIGdldFdpbnN0b25UcmFuc3BvcnQoKSB7XG4gICAgICAgIHJldHVybiBOZXdSZWxpY0xvZ0RlbGl2ZXJ5QWdlbnQ/Lmluc3RhbmNlPy5sb2dUcmFuc2Zvcm07XG4gICAgfVxuICAgIFxuICAgIHByaXZhdGUgc3RhdGljIGluc3RhbmNlOiBOZXdSZWxpY0xvZ0RlbGl2ZXJ5QWdlbnQ7XG4gICAgcHJpdmF0ZSBsb2dRdWV1ZTogYW55W10gPSBbXTtcbiAgICBwcml2YXRlIGNvbmZpZzogTmV3UmVsaWNMb2dEZWxpdmVyeUFnZW50Q29uZmlnO1xuICAgIHByaXZhdGUgbG9nTGVuZ3RoUXVldWU6IG51bWJlcltdID0gW107XG4gICAgcHJpdmF0ZSB0b3RhbExlbmd0aENvdW50ID0gMDtcbiAgICBwcml2YXRlIGdsb2JhbEF0dHJpYnV0ZXM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9ID0ge307XG4gICAgcHJpdmF0ZSBuZXdSZWxpY0xvZ1RyYW5zcG9ydDogTmV3UmVsaWNMb2dUcmFuc3BvcnQ7XG4gICAgcHJpdmF0ZSBkZWJ1Z01vZGUgPSBwcm9jZXNzLmVudi5ERUJVR19XUklURV9MT0dTX1RPX0ZJTEUgPT09ICd0cnVlJztcbiAgICBwcml2YXRlIHRpbWVvdXRJZDogTm9kZUpTLlRpbWVvdXQgfCB1bmRlZmluZWQ7XG4gICAgcHJpdmF0ZSBsb2dzV3JpdHRlbiA9IDA7XG4gICAgcHJpdmF0ZSBuZXdSZWxpY0luaXRpYWxpemVkID0gZmFsc2U7XG4gICAgXG4gICAgcHVibGljIHN0YW5kYXJkT3V0UGFzc1Rocm91Z2g6IFN0YW5kYXJkT3V0UGFzc1Rocm91Z2g7XG4gICAgXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgaW50ZXJuYWxMb2coJ2RlYnVnJywgJ0luaXRpYWxpemluZyBMb2dEZWxpdmVyeUFnZW50Jyk7XG4gICAgICAgIHRoaXMuY29uZmlnID0geyAuLi5kZWZhdWx0Q29uZmlnIH07XG5cbiAgICAgICAgaW50ZXJuYWxMb2coJ2luZm8nLCBgQ3JlYXRpbmcgTmV3UmVsaWNMb2dUcmFuc3BvcnRgKTtcbiAgICAgICAgdGhpcy5uZXdSZWxpY0xvZ1RyYW5zcG9ydCA9IG5ldyBOZXdSZWxpY0xvZ1RyYW5zcG9ydCgobG9nLCBjYikgPT4gdGhpcy5hZGRMb2cobG9nLCBjYikpO1xuXG4gICAgICAgIC8vIENyZWF0ZXMgbG9nZ2luZyBjb25maWd1cmF0aW9uIGZvciByZXdyaXRpbmcgc3Rkb3V0L3N0ZGVyclxuICAgICAgICBjb25zdCBsb2dDYWxsYmFjayA9IChsb2c6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgdGhpcy5hZGRMb2cobG9nLCAoKSA9PiB7fSk7XG4gICAgICAgIH07XG4gICAgXG4gICAgICAgIGNvbnN0IGVyckNhbGxiYWNrID0gKGxvZzogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmFkZExvZyh7XG4gICAgICAgICAgICAgICAgbGFiZWw6ICdlcnJvcicsXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogbG9nXG4gICAgICAgICAgICB9LCAoKSA9PiB7fSk7XG4gICAgICAgIH07XG4gICAgXG4gICAgICAgIHRoaXMuc3RhbmRhcmRPdXRQYXNzVGhyb3VnaCA9IG5ldyBTdGFuZGFyZE91dFBhc3NUaHJvdWdoKGxvZ0NhbGxiYWNrLCBlcnJDYWxsYmFjayk7XG4gICAgICAgIHRoaXMucmVnaXN0ZXJBcHBEZWF0aExvZ1B1c2goKTtcbiAgICAgICAgdGhpcy5jcmVhdGVMb2dDaGVja1RpbWVvdXQoKTtcbiAgICAgICAgdGhpcy5yZWdpc3Rlck5ld1JlbGljSW5pdGlhbGl6YXRpb25JbnRlcnZhbCgpOyAgICAgIFxuICAgICAgICBpbnRlcm5hbExvZygnZGVidWcnLCAnTG9nRGVsaXZlcnlBZ2VudCBJbml0aWFsaXplZCcpXG5cblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFjY2Vzc29yIGZvciBXaW5zdG9uIFRyYW5zcG9ydCB0aGF0IHdyaXRlcyB0byB0aGlzIFxuICAgICAqIGFnZW50IGluc3RhbmNlXG4gICAgICogQHJldHVybnMgd2luc3Rvbi50cmFuc3BvcnRcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0TG9nVHJhbnNwb3J0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5uZXdSZWxpY0xvZ1RyYW5zcG9ydDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTaHV0c2Rvd24gdGhlIGRlbGl2ZXJ5IGFnZW50LiBUaGlzIGNhbiBiZSB1dGlsaXplZCB3aGVuIGFwcCBpcyBleHBlY3RlZCB0byBzaHV0ZG93blxuICAgICAqIGF0IGEgZ2l2ZW4gdGltZSBhbmQgdGhlIHBlcmlvZGljIGRlbGl2ZXJ5IHRpbWVvdXQgaXMgYmxvY2tpbmcgc2h1dGRvd24uXG4gICAgICogXG4gICAgICogQ2xlYXJzIGludGVybmFsIHRpbWVvdXQsIGNvbmZpZ3VyZXMgd2luc3RvbiB0cmFuc3BvcnQgdG8gbm90IHNlbmQgbG9ncy5cbiAgICAgKiBSZWNvbm5lY3RzIHN0ZG91dCBhbmQgc3RkZXJyLlxuICAgICAqIFdyaXRlcyBhbnkgcmVtYWluaW5nIGxvZ3MuXG4gICAgICovXG4gICAgcHVibGljIHNodXRkb3duKCkge1xuICAgICAgICBpbnRlcm5hbExvZygnZGVidWcnLCAnU2h1dGRvd24gb2YgTG9nRGVsaXZlcnlBZ2VudCB0cmlnZ2VyZWQnKTtcbiAgICAgICAgaWYgKHRoaXMudGltZW91dElkKSBjbGVhclRpbWVvdXQodGhpcy50aW1lb3V0SWQpO1xuICAgICAgICB0aGlzLnN0YW5kYXJkT3V0UGFzc1Rocm91Z2guZGVzdHJveSgpO1xuICAgICAgICB0aGlzLm5ld1JlbGljTG9nVHJhbnNwb3J0LmNsb3NlKCk7XG4gICAgICAgIHRoaXMud3JpdGVMb2dzU3luYygpO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogRGV0ZXJtaW5lIGlmIHRoZSBsb2cgc3RyaW5nIG9yIG9iamVjdCBpcyBhIE5ldyBSZWxpYyBcbiAgICAgKiBjb21wYXRpYmxlIEpTT04uIEluIG9yZGVyIHRvIGJlIGNvbnNpZGVyZWQgdGhpcyBpdCBtdXN0XG4gICAgICogYmUgYSB3ZWxsIHN0cnVjdHVyZWQgSlNPTiBvYmplY3Qgd2l0aCBhIHRvcCBsZXZlbCAnbWVzc2FnZSdcbiAgICAgKiBhbmQgJ2xldmVsJyBwcm9wZXJ0eS5cbiAgICAgKiBAcGFyYW0gc3RyIFxuICAgICAqIEByZXR1cm5zIG9iamVjdCBmb3JtIG9mIEpTT04gb3IgZmFsc2VcbiAgICAgKi9cbiAgICBwcml2YXRlIGlzTlJDb21wYXRpYmxlSnNvbkxvZ1N0cmluZyhzdHI6IHN0cmluZyB8IG9iamVjdCkge1xuICAgICAgICBpZiAodHlwZW9mIHN0ciA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIHN0ciA9IEpTT04uc3RyaW5naWZ5KHN0cik7XG4gICAgICAgIH1cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IG9iaiA9IEpTT04ucGFyc2Uoc3RyIGFzIHN0cmluZyk7XG4gICAgICAgICAgICAvLyBSZXdyaXRlIGJvb3RzdHJhcCBvYmplY3QgaW50byBhIGZvcm1hdCB0aGF0IHdpbGwgd29yayBmb3IgbmV3IHJlbGljXG4gICAgICAgICAgICBpZiAob2JqLm1zZyAmJiBvYmo/Lm5hbWUoJ25ld3JlbGljX2Jvb3RzdHJhcCcpICYmICFvYmoubWVzc2FnZSkge1xuICAgICAgICAgICAgICAgIG9iai5tZXNzYWdlID0gb2JqLm1zZztcbiAgICAgICAgICAgICAgICBvYmoubGV2ZWwgPSAnaW5mbyc7XG4gICAgICAgICAgICAgICAgZGVsZXRlIG9iai5tc2c7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAob2JqICYmIHR5cGVvZiBvYmogPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgICAgICBpZiAob2JqLm1lc3NhZ2UgJiYgb2JqLmxldmVsKSB7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7IH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEludGVybmFsIGZ1bmN0aW9uIHVzZWQgdG8gYWNjZXB0IGxvZyBzdGF0ZW1lbnRzIGFuZFxuICAgICAqIHByb2Nlc3MgdGhlbS4gTG9nIGlzIHR5cGVkIHRvIGFueSB0byBmaXQgdHlwaW5nIGZvclxuICAgICAqIHRoZSBXaW5zdG9uIHRyYW5zcG9ydC5cbiAgICAgKiBcbiAgICAgKiBUT0RPOiBSZXdvcmsgdGhlIFdpbnN0b24gdHJhbnNwb3J0IGxvZ2ljIHRvIGRvIGEgYml0XG4gICAgICogICAgICBtb3JlIHdvcmsgdG8gcHJvdmlkZSBtb3JlIGNvbnNpc3RlbnQgdHlwaW5nLlxuICAgICAqIFxuICAgICAqIEBwYXJhbSBsb2cgXG4gICAgICogQHBhcmFtIGNhbGxiYWNrIFxuICAgICAqL1xuICAgIHByaXZhdGUgYWRkTG9nKGxvZzogYW55LCBjYWxsYmFjazogKCgpID0+IHZvaWQpIHwgdW5kZWZpbmVkKSB7XG4gICAgICAgIGNvbnN0IGpzb25EYXRhID0gdGhpcy5pc05SQ29tcGF0aWJsZUpzb25Mb2dTdHJpbmcobG9nKTtcbiAgICAgICAgaWYoanNvbkRhdGEpIHtcbiAgICAgICAgICAgIHRoaXMucHJvY2Vzc0FzSnNvbkxvZyhqc29uRGF0YSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnByb2Nlc3NBc1N0cmluZ0xvZyhsb2cpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuaW1tZWRpYXRlTG9nV3JpdGFibGVQcmVkaWNhdGUoKSkge1xuICAgICAgICAgICAgdGhpcy5iZWdpbldyaXRlTG9ncygpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGpzb25EYXRhKSBsb2cgPSBKU09OLnN0cmluZ2lmeShsb2cpKydcXG4nO1xuICAgIFxuICAgICAgICBpZiAoanNvbkRhdGE/Lm1lc3NhZ2UgJiYganNvbkRhdGE/LmxldmVsID09PSAnZXJyb3InKSB7XG4gICAgICAgICAgICB0aGlzLnN0YW5kYXJkT3V0UGFzc1Rocm91Z2guc3RkZXJyQnlwYXNzKGxvZyk7XG4gICAgICAgIH0gZWxzZSBpZihqc29uRGF0YS5tZXNzYWdlKSB7XG4gICAgICAgICAgICB0aGlzLnN0YW5kYXJkT3V0UGFzc1Rocm91Z2guc3Rkb3V0QnlwYXNzKGxvZyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY2FsbGJhY2spIGNhbGxiYWNrKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSGFuZGxlciBmb3IgcHJvY2Vzc2luZyBhIGxvZyBzdGF0ZW1lbnQgd2hlbiBpdCBpcyBmb3JtYXR0ZWRcbiAgICAgKiBhcyBhIE5ldyBSZWxpYyBjb21wYXRpYmxlIEpTT04gc3RyaW5nLlxuICAgICAqIEBwYXJhbSBsb2cgXG4gICAgICovXG4gICAgcHJvY2Vzc0FzSnNvbkxvZyhsb2c6IGFueSkge1xuICAgICAgICB0aGlzLmxvZ1RyYW5zZm9ybShsb2cpO1xuICAgICAgICBjb25zdCBsb2dTdHJpbmcgPSBKU09OLnN0cmluZ2lmeShsb2cpO1xuICAgICAgICBjb25zdCBsZW5ndGggPSBCdWZmZXIuYnl0ZUxlbmd0aChsb2dTdHJpbmcpO1xuICAgICAgICB0aGlzLmxvZ1F1ZXVlLnB1c2gobG9nKTtcbiAgICAgICAgdGhpcy5sb2dMZW5ndGhRdWV1ZS5wdXNoKGxlbmd0aCk7XG4gICAgICAgIHRoaXMudG90YWxMZW5ndGhDb3VudCArPSBsZW5ndGg7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSGFuZGxlciBmb3IgcHJvY2Vzc2luZyBhIGxvZyBzdGF0ZW1lbnQgdGhhdCBpcyBhIHNpbXBsZVxuICAgICAqIHN0cmluZyBmb3JtYXQuXG4gICAgICogQHBhcmFtIGxvZyBcbiAgICAgKi9cbiAgICBwcm9jZXNzQXNTdHJpbmdMb2cobG9nOiBzdHJpbmcpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBsb2cgPT09ICdzdHJpbmcnICYmIGxvZy5lbmRzV2l0aCgnXFxuJykpIHtcbiAgICAgICAgICAgIGxvZyA9IGxvZy5zdWJzdHJpbmcoMCwgbG9nLmxlbmd0aCAtIDEpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbmV3UmVsaWNNZXRhZGF0YSA9IG5ld3JlbGljLmdldExpbmtpbmdNZXRhZGF0YSgpO1xuICAgICAgICBjb25zdCBzdHJ1Y3R1cmVkTG9nID0ge1xuICAgICAgICAgICAgbWVzc2FnZTogbG9nLFxuICAgICAgICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxuICAgICAgICAgICAgb3JpZ2luYWxfdGltZXN0YW1wOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICAgICAgICBcImVudGl0eS5uYW1lXCI6IG5ld1JlbGljTWV0YWRhdGFbJ2VudGl0eS5uYW1lJ10sXG4gICAgICAgICAgICBcImVudGl0eS50eXBlXCI6IG5ld1JlbGljTWV0YWRhdGFbJ2VudGl0eS50eXBlJ10sXG4gICAgICAgICAgICBob3N0bmFtZTogbmV3UmVsaWNNZXRhZGF0YS5ob3N0bmFtZVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QganNvbkxvZ1N0cmluZyA9IEpTT04uc3RyaW5naWZ5KHN0cnVjdHVyZWRMb2cpO1xuICAgICAgICBjb25zdCBsZW5ndGggPSBCdWZmZXIuYnl0ZUxlbmd0aChqc29uTG9nU3RyaW5nKTtcbiAgICAgICAgdGhpcy5sb2dRdWV1ZS5wdXNoKHN0cnVjdHVyZWRMb2cpO1xuICAgICAgICB0aGlzLmxvZ0xlbmd0aFF1ZXVlLnB1c2gobGVuZ3RoKTtcbiAgICAgICAgdGhpcy50b3RhbExlbmd0aENvdW50ICs9IGxlbmd0aDtcbiAgICB9XG4gICAgXG4gICAgLyoqXG4gICAgICogU2V0IGdsb2JhbCBhdHRyaWJ1dGVzIGZvciB0aGUgYXBwbGljYXRpb24uICBUaGlzIHNob3VsZFxuICAgICAqIGdlbmVyYWxseSBiZSBjb25maWd1cmVkIGVhcmx5IGluIHRoZSBhcHBsaWNhdGlvbiBsaWZlY3ljbGUuXG4gICAgICogR2xvYmFsIGF0dHJpYnV0ZXMgd2lsbCBiZSBib3VuZCB0byBhbGwgbG9nIHN0YXRlbWVudHNcbiAgICAgKiBpbiBOZXcgUmVsaWMuXG4gICAgICogQHBhcmFtIGF0dHJpYnV0ZXMgS1YgcGFpcnMgdG8gYmUgcHJvdmlkZWQgdG8gTlIgd2l0aCBsb2dzXG4gICAgICovXG4gICAgc2V0R2xvYmFsQXR0cmlidXRlcyhhdHRyaWJ1dGVzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSkge1xuICAgICAgICB0aGlzLmdsb2JhbEF0dHJpYnV0ZXMgPSBhdHRyaWJ1dGVzO1xuICAgIH0gIFxuXG4gICAgLyoqXG4gICAgICogV3JpdGVzIGxvZ3Mgc3luY2hyb25vdXNseS4gIFRoaXMgZnVuY3Rpb24gaXMgaW50ZW5kZWQgdG8gYmVcbiAgICAgKiB1dGlsaXplZCBpbiBzaXR1YXRpb25zIHdoZXJlIGxvZ2dpbmcgY2Fubm90IGJlIHdyaXR0ZW4gXG4gICAgICogYXN5bmNocm9ub3VzbHksIG1vc3QgY29tbW9ubHkgaW4gdGhlIGhhbmRsZXIgb2YgYSBTSUdURVJNXG4gICAgICogZXZlbnQsIHdoaWNoIG9ubHkgYWxsb3dzIHN5bmNocm9ub3VzIGNhbGxzLlxuICAgICAqL1xuICAgIHByaXZhdGUgd3JpdGVMb2dzU3luYygpIHtcbiAgICAgICAgY29uc3QgbG9nc1RvV3JpdGUgPSB0aGlzLnNsaWNlTG9ncygpO1xuICAgICAgICBpbnRlcm5hbExvZygnc2lsbHknLCBgUHJlcGFyaW5nIGZpbmFsIGxvZyBwYXlsb2FkIG9mICR7bG9nc1RvV3JpdGUubGVuZ3RofSBmb3IgTlIgY29sbGVjdG9yYCk7XG4gICAgICAgIGNvbnN0IHJhd1BheWxvYWQgPSB0aGlzLmJ1aWxkUmF3UG9zdEJvZHkobG9nc1RvV3JpdGUpO1xuICAgICAgICBjb25zdCBjb21wcmVzc2VkUGF5bG9hZCA9IHpsaWIuZ3ppcFN5bmMocmF3UGF5bG9hZCk7XG4gICAgICAgIGlmICghdGhpcy5kZWJ1Z01vZGUpIHtcbiAgICAgICAgICAgIHRoaXMuc2VuZExvZ3MoY29tcHJlc3NlZFBheWxvYWQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy53cml0ZUxvZ3NUb0ZpbGVTeXN0ZW0oY29tcHJlc3NlZFBheWxvYWQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIHdyaXRlTG9nc1RvRmlsZVN5c3RlbShidWZmZXI6IEJ1ZmZlcikge1xuICAgICAgICBmcy53cml0ZUZpbGVTeW5jKGB0ZXN0LSR7dGhpcy5sb2dzV3JpdHRlbisrfS5nemAsIGJ1ZmZlcik7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBiZWdpbldyaXRlTG9ncygpIHtcbiAgICAgICAgY29uc3QgbG9nc1RvV3JpdGUgPSB0aGlzLnNsaWNlTG9ncygpO1xuXG4gICAgICAgIGludGVybmFsTG9nKCdzaWxseScsIGBQcmVwYXJpbmcgbG9nIHBheWxvYWQgb2YgJHtsb2dzVG9Xcml0ZS5sZW5ndGh9IGZvciBOUiBjb2xsZWN0b3JgKTtcbiAgICAgICAgY29uc3QgcmF3UGF5bG9hZCA9IHRoaXMuYnVpbGRSYXdQb3N0Qm9keShsb2dzVG9Xcml0ZSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBjb21wcmVzc2VkUGF5bG9hZDogQnVmZmVyID0gYXdhaXQgdGhpcy5jb21wcmVzc1BheWxvYWQocmF3UGF5bG9hZCk7XG4gICAgICAgICAgICBpZiAoIXRoaXMuZGVidWdNb2RlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZW5kTG9ncyhjb21wcmVzc2VkUGF5bG9hZCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMud3JpdGVMb2dzVG9GaWxlU3lzdGVtKGNvbXByZXNzZWRQYXlsb2FkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zdCBmYWxsYmFja01lc3NhZ2UgPSAnVW5rbm93biBlcnJvciBvY2N1cnJlZCB3aGlsZSBjb21wcmVzc2luZyBsb2dzIHRvIHNlbmQgdG8gTmV3IFJlbGljJztcbiAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnIgaW5zdGFuY2VvZiBFcnJvciAmJiBlcnIuc3RhY2sgPyBlcnIuc3RhY2sgOiBmYWxsYmFja01lc3NhZ2U7IFxuICAgICAgICAgICAgaW50ZXJuYWxMb2coJ2Vycm9yJywgbWVzc2FnZSlcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEhhbmRsZXMgSFRUUCByZXF1ZXN0IHRoYXQgc2VuZHMgY29tcHJlc3NlZCBsb2cgZGF0YVxuICAgICAqIHRvIHRoZSBOZXcgUmVsaWMgZW5kcG9pbnQuXG4gICAgICogQHBhcmFtIGNvbXByZXNzZWRQYXlsb2FkIFxuICAgICAqL1xuICAgIHByaXZhdGUgc2VuZExvZ3MoY29tcHJlc3NlZFBheWxvYWQ6IEJ1ZmZlcikge1xuICAgICAgICBBeGlvcy5wb3N0KGBodHRwczovLyR7QVBJX0hPU1ROQU1FfSR7QVBJX1BBVEh9YCwgY29tcHJlc3NlZFBheWxvYWQsIHtcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAnQWNjZXB0JzogJyovKicsXG4gICAgICAgICAgICAgICAgJ0FwaS1LZXknOiBwcm9jZXNzLmVudi5ORVdfUkVMSUNfTElDRU5TRV9LRVkgYXMgc3RyaW5nLFxuICAgICAgICAgICAgICAgICdDb250ZW50LUVuY29kaW5nJzogJ2d6aXAnLFxuICAgICAgICAgICAgICAgICdDb250ZW50LUxlbmd0aCc6ICcnK2NvbXByZXNzZWRQYXlsb2FkLmJ5dGVMZW5ndGgsXG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9nemlwJyxcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgICAgICBpZiAoWzIwMCwgMjAyXS5pbmNsdWRlcyhyZXNwb25zZS5zdGF0dXMpKSB7XG4gICAgICAgICAgICAgICAgaW50ZXJuYWxMb2coJ3NpbGx5JywgYExvZyBwYXlsb2FkIGFjY2VwdGVkIGJ5IE5ldyBSZWxpYyBBUEkuIFJlcXVlc3QgSUQ6ICR7cmVzcG9uc2UuZGF0YS5yZXF1ZXN0SWR9YClcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaW50ZXJuYWxMb2coJ3dhcm4nLCBgVW5leHBlY3RlZCBzdWNjZXNzZnVsIHJlc3BvbnNlIHN0YXR1cyBjb2RlIGZyb20gTlI6ICR7cmVzcG9uc2Uuc3RhdHVzfWApXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSkuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgICAgIGludGVybmFsTG9nKCdlcnJvcicsICdFcnJvciBzZW5kaW5nIGxvZyBwYXlsb2FkIHRvIE5ldyBSZWxpYycpO1xuICAgICAgICAgICAgaW50ZXJuYWxMb2coJ2Vycm9yJywgZXJyLnN0YWNrKVxuICAgICAgICB9KVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgdGhlIGdyZWF0ZXIgb2JqZWN0IHN0cnVjdHVyZSBmb3IgYSBsb2cgZGVsaXZlcnkgXG4gICAgICogcGF5bG9hZCBhbmQgYXR0YWNoZXMgYW4gYXJyYXkgb2YgbG9ncyB0byBpdC4gUmV0dXJucyBcbiAgICAgKiBzdHJpbmdpZmllZC5cbiAgICAgKiBAcGFyYW0gbG9ncyBcbiAgICAgKiBAcmV0dXJucyBcbiAgICAgKi9cbiAgICBwcml2YXRlIGJ1aWxkUmF3UG9zdEJvZHkobG9nczogYW55W10pOiBzdHJpbmcge1xuICAgICAgICBjb25zdCBwYXlsb2FkID0gW3tcbiAgICAgICAgICAgIGNvbW1vbjoge1xuICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgLi4udGhpcy5nbG9iYWxBdHRyaWJ1dGVzLFxuICAgICAgICAgICAgICAgICAgICBzZXJ2aWNlOiBwcm9jZXNzLmVudi5ORVdfUkVMSUNfQVBQX05BTUUsXG4gICAgICAgICAgICAgICAgICAgIGVudGl0eUd1aWQ6IG5ld3JlbGljLmdldExpbmtpbmdNZXRhZGF0YSgpWydlbnRpdHkuZ3VpZCddLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbG9nczogbG9nc1xuICAgICAgICB9XTtcbiAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHBheWxvYWQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFzeW5jaHJvbm91c2x5IGNvbXByZXNzIHN0cmluZyB0byBnemlwIGNvbXByZXNzZWQgZGF0YS5cbiAgICAgKiBAcGFyYW0gcmF3UGF5bG9hZCBcbiAgICAgKiBAcmV0dXJucyBcbiAgICAgKi9cbiAgICBwcml2YXRlIGFzeW5jIGNvbXByZXNzUGF5bG9hZChyYXdQYXlsb2FkOiBzdHJpbmcpOiBQcm9taXNlPEJ1ZmZlcj4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8QnVmZmVyPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICB6bGliLmd6aXAoQnVmZmVyLmZyb20ocmF3UGF5bG9hZCwgJ3V0ZjgnKSwgKGVyciwgY29tcHJlc3NlZFBheWxvYWQpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSByZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgICByZXNvbHZlKGNvbXByZXNzZWRQYXlsb2FkKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTbGljZXMgbG9nIHF1ZXVlLlxuICAgICAqIFdpbGwgcHJlZmVyIHRvIHVzZSB0aGUgZW50aXJlIGxvZyBxdWV1ZSB3aGVuIHBvc3NpYmxlLCBidXRcbiAgICAgKiBtYXkgc2VuZCBvbmx5IGEgc3Vic2VjdGlvbiBpZiB0aGUgc2l6ZSBvZiB0aGUgZGF0YSBpcyBuZWFyXG4gICAgICogdGhlIGxpbWl0YXRpb25zIGRlZmluZWQgYnkgTmV3IFJlbGljJ3MgQVBJLlxuICAgICAqIEByZXR1cm5zIFxuICAgICAqL1xuICAgIHByaXZhdGUgc2xpY2VMb2dzKCkge1xuICAgICAgICBsZXQgbG9nc1RvU2VuZDtcbiAgICAgICAgXG4gICAgICAgIC8vIElmIHdlIGtub3cgdGhlIHRvdGFsIGxlbmd0aCB3aWxsIG5vdCBleGNlZWQgbWF4aW11bSBsZW5ndGggc2l6ZVxuICAgICAgICBpZiAodGhpcy50b3RhbExlbmd0aENvdW50IDwgTUFYX1BBWUxPQURfU0laRSkge1xuICAgICAgICAgICAgW2xvZ3NUb1NlbmQsIHRoaXMubG9nUXVldWVdID0gW3RoaXMubG9nUXVldWUsIFtdXTtcbiAgICAgICAgICAgIHRoaXMubG9nTGVuZ3RoUXVldWUgPSBbXTtcbiAgICAgICAgICAgIHRoaXMudG90YWxMZW5ndGhDb3VudCA9IDA7XG4gICAgICAgICAgICByZXR1cm4gbG9nc1RvU2VuZDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIG90aGVyd2lzZSwgc2xpY2Ugb2ZmIGEgc2xpY2Ugb2YgbG9ncyB0aGF0IHdpbGwgZml0IGludG8gYSBzaW5nbGUgcmVxdWVzdFxuICAgICAgICBsZXQgbG9nU2l6ZSA9IDA7XG4gICAgICAgIGxldCBsb2dTbGljZUluZGV4ID0gMDtcblxuICAgICAgICB3aGlsZSgodGhpcy5sb2dRdWV1ZS5sZW5ndGggPiAwKSAmJiAobG9nU2l6ZSArIHRoaXMubG9nTGVuZ3RoUXVldWVbMF0gPCBNQVhfUEFZTE9BRF9TSVpFKSkge1xuICAgICAgICAgICAgbG9nU2xpY2VJbmRleCsrO1xuICAgICAgICB9XG5cbiAgICAgICAgbG9nc1RvU2VuZCA9IHRoaXMubG9nUXVldWUuc2xpY2UoMCwgbG9nU2xpY2VJbmRleCk7XG4gICAgICAgIHRoaXMubG9nUXVldWUgPSB0aGlzLmxvZ1F1ZXVlLnNsaWNlKGxvZ1NsaWNlSW5kZXgpO1xuICAgICAgICB0aGlzLmxvZ0xlbmd0aFF1ZXVlID0gdGhpcy5sb2dMZW5ndGhRdWV1ZS5zbGljZShsb2dTbGljZUluZGV4KTtcblxuICAgICAgICByZXR1cm4gbG9nc1RvU2VuZDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQcmVkaWNhdGUgdG8gZGV0ZXJtaW5lIGlmIGxvZ3Mgc2hvdWxkIGJlIHdyaXR0ZW4gYmUgd3JpdHRlbiBpbW1lZGlhdGVseS5cbiAgICAgKiBAcmV0dXJucyBib29sZWFuXG4gICAgICovXG4gICAgcHJpdmF0ZSBpbW1lZGlhdGVMb2dXcml0YWJsZVByZWRpY2F0ZSgpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKHRoaXMubmV3UmVsaWNJbml0aWFsaXplZCAmJiB0aGlzLmxvZ1F1ZXVlLmxlbmd0aCA+ICh0aGlzLmNvbmZpZy5taW5Mb2dJdGVtc1RvRm9yY2UgfHwgMTAwKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBQdXNoIGxvZ3MgZXZlbiBpZiBuZXcgcmVsaWMgaGFzbid0IGJlZW4gaW5pdGlhbGl6ZWQgaWYgdGhlIGJhY2tsb2cgZ3Jvd3MgdG9vIGxhcmdlXG4gICAgICAgIGlmICh0aGlzLmxvZ1F1ZXVlLmxlbmd0aCA+IDUwMCkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFByZWRpY2F0ZSB0byBkZXRlcm1pbmUgaWYgbG9ncyBzaG91bGQgYmUgd3JpdHRlbiBvbiBuZXh0IHBlcmlvZGljIGNoZWNrLlxuICAgICAqIEByZXR1cm5zIGJvb2xlYW5cbiAgICAgKi9cbiAgICBwcml2YXRlIGxvZ3NXcml0YWJsZVByZWRpY2F0ZSgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWluTG9nSXRlbXNFeGNlZWRlZCgpXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUHJlZGljYXRlIHRvIGRldGVybWluZSBpZiB0aGUgdG90YWwgbG9ncyBoYXZlIGV4Y2VlZGVkIGEgY29uZmlndXJlZCBtaW5Mb2dcbiAgICAgKiBjb3VudCB2YWx1ZSBpZiBzdWNoIGEgdmFsdWUgaXMgY29uZmlndXJlZC5cbiAgICAgKiBAcmV0dXJucyBcbiAgICAgKi9cbiAgICBwcml2YXRlIG1pbkxvZ0l0ZW1zRXhjZWVkZWQoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiAhISh0aGlzLmNvbmZpZy5taW5Mb2dJdGVtcyAmJiAodGhpcy5sb2dRdWV1ZS5sZW5ndGggPiB0aGlzLmNvbmZpZy5taW5Mb2dJdGVtcykpO1xuICAgIH0gICAgXG4gICAgXG4gICAgLyoqXG4gICAgICogRml4ZXMgcG9zc2libGUgaXNzdWVzIGluIGxvZyBmb3JtYXQgY2F1c2VkIGJ5IGxpbWl0YXRpb25zIG9mIE5ScyBsb2dnaW5nXG4gICAgICogdmFsdWVzXG4gICAgICogQHBhcmFtIGxvZyBcbiAgICAgKiBAcmV0dXJucyBcbiAgICAgKi9cbiAgICBwcml2YXRlIGxvZ1RyYW5zZm9ybShsb2c6IGFueSkge1xuICAgICAgICBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMobG9nKS5sZW5ndGggPiBNQVhfQVRUUklCVVRFU19QRVJfRVZFTlQpIHtcbiAgICAgICAgICAgIGludGVybmFsTG9nKCd3YXJuJywgYExvZyB0byBzZW5kIHRvIEpTT04gY29udGFpbnMgJHtPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhsb2cpfSAvICR7TUFYX0FUVFJJQlVURVNfUEVSX0VWRU5UfSBhdHRyaWJ1dGVzLmApO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBmb3IgKGxldCBrZXkgb2YgT2JqZWN0LmtleXMobG9nKSkge1xuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBsb2dba2V5XTtcbiAgICAgICAgICAgIC8vIHJlcGxhY2Uga2V5IHdpdGggbGVuZ3RoIHRvbyBoaWdoXG4gICAgICAgICAgICBpZiAoa2V5Lmxlbmd0aCA+IE1BWF9BVFRSSUJVVEVfTkFNRV9MRU5HVEgpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBuZXdLZXkgPSBrZXkuc2xpY2UoMCwgTUFYX0FUVFJJQlVURV9OQU1FX0xFTkdUSCk7XG4gICAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGxvZywga2V5LnNsaWNlKDAsIE1BWF9BVFRSSUJVVEVfTkFNRV9MRU5HVEgpLCBcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihsb2csIGtleSBhcyBQcm9wZXJ0eUtleSkgYXMgUHJvcGVydHlEZXNjcmlwdG9yKTtcbiAgICAgICAgICAgICAgICBkZWxldGUgbG9nLmtleTtcblxuICAgICAgICAgICAgICAgIC8vIFVwZGF0ZSBrZXkgbmFtZSBmb3IgdXNhZ2UgaW4gbGF0ZXIgc3RlcHNcbiAgICAgICAgICAgICAgICBrZXkgPSBuZXdLZXk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIENvbmNhdGVuYXRlIGxvZyBtZXNzYWdlcyB3aXRoIGxlbmd0aCBncmVhdGVyIHRoYW4gTUFYX0FUVFJJQlVURV9WQUxVRV9MRU5HVEhcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmIHZhbHVlLmxlbmd0aCA+IE1BWF9BVFRSSUJVVEVfVkFMVUVfTEVOR1RIKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY29uZmlnPy53YXJuT25BdHRyaWJ1dGVMZW5ndGhPdmVyZmxvdykge1xuICAgICAgICAgICAgICAgICAgICBpbnRlcm5hbExvZygnd2FybicsIGBOUiBMb2cgYXR0cmlidXRlIGxlbmd0aCBvdmVyZmxvdy4gTGVuZ3RoOiAke3ZhbHVlLmxlbmd0aH0vJHtNQVhfQVRUUklCVVRFX1ZBTFVFX0xFTkdUSH1gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbG9nLmtleSA9IHZhbHVlLnNsaWNlKDAsIE1BWF9BVFRSSUJVVEVfVkFMVUVfTEVOR1RIKTsgXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChrZXkuaW5jbHVkZXMoJyAnKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG5ld0tleSA9IGtleS5yZXBsYWNlQWxsKCcgJywgJy4nKTtcbiAgICAgICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobG9nLCBrZXkuc2xpY2UoMCwgTUFYX0FUVFJJQlVURV9OQU1FX0xFTkdUSCksIFxuICAgICAgICAgICAgICAgICAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGxvZywga2V5IGFzIFByb3BlcnR5S2V5KSBhcyBQcm9wZXJ0eURlc2NyaXB0b3IpO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBsb2cua2V5O1xuXG4gICAgICAgICAgICAgICAgLy8gVXBkYXRlIGtleSBuYW1lIGZvciB1c2FnZSBpbiBsYXRlciBzdGVwc1xuICAgICAgICAgICAgICAgIGtleSA9IG5ld0tleTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiB1c2VkIHRvIHJlcGVhdGVkbHkgdHJpZ2dlciBsb2cgcHVzaGVzXG4gICAgICovXG4gICAgcHJpdmF0ZSBjcmVhdGVMb2dDaGVja1RpbWVvdXQoKSB7XG4gICAgICAgIHRoaXMudGltZW91dElkID0gc2V0VGltZW91dChhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy5sb2dRdWV1ZS5sZW5ndGggPiAodGhpcy5jb25maWcubWluTG9nSXRlbXMgfHwgMSkpIHtcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLmJlZ2luV3JpdGVMb2dzKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5jcmVhdGVMb2dDaGVja1RpbWVvdXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdGhpcy5jb25maWcubG9nUHVzaEZyZXF1ZW5jeSlcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBIZWxwZXIgbWV0aG9kIHRoYXQgcmVnaXN0ZXJzIGxpc3RlbmVycyBmb3IgZXZlbnRzXG4gICAgICogcmVsYXRlZCB0byBpbW1pbmVudCBhcHBsaWNhdGlvbiBzaHV0ZG93biBzbyB0aGF0XG4gICAgICogZmluYWwgbG9ncyBjYW4gYmUgcHVzaGVkXG4gICAgICovXG4gICAgcHJpdmF0ZSByZWdpc3RlckFwcERlYXRoTG9nUHVzaCgpIHtcbiAgICAgICAgbGV0IGZpbmFsV3JpdHRlbiA9IGZhbHNlO1xuICAgICAgICBwcm9jZXNzLm9uKCdleGl0JywgKCkgPT4ge1xuICAgICAgICAgICAgaWYgKHRoaXMudGltZW91dElkKSBjbGVhclRpbWVvdXQodGhpcy50aW1lb3V0SWQpO1xuICAgICAgICAgICAgbGV0IG8gPSBmaW5hbFdyaXR0ZW47XG4gICAgICAgICAgICBmaW5hbFdyaXR0ZW4gPSB0cnVlO1xuICAgICAgICAgICAgaWYgKG8pIHJldHVybjtcblxuICAgICAgICAgICAgaW50ZXJuYWxMb2coJ2luZm8nLCAnd3JpdGluZyBmaW5hbCBsb2dzJyk7XG5cbiAgICAgICAgICAgIHRoaXMud3JpdGVMb2dzU3luYygpO1xuICAgICAgICB9KTtcblxuICAgICAgICBwcm9jZXNzLm9uKCdTSUdJTlQnLCAoKSA9PiB7XG4gICAgICAgICAgICBwcm9jZXNzLmV4aXQoMik7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHByb2Nlc3Mub24oJ3VuY2F1Z2h0RXhjZXB0aW9uJywgKGUpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGUpO1xuICAgICAgICAgICAgaW50ZXJuYWxMb2coJ2Vycm9yJywgZS5zdGFjayB8fCAnJyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHByb2Nlc3Mub24oJ1NJR1RFUk0nLCAoKSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy50aW1lb3V0SWQpIGNsZWFyVGltZW91dCh0aGlzLnRpbWVvdXRJZCk7XG4gICAgICAgICAgICB0aGlzLndyaXRlTG9nc1N5bmMoKTtcbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBOZXcgUmVsaWMgZG9lcyBub3QgZXhwb3NlIGEgbWV0aG9kIHRvIGNoZWNrIGl0cyBpbml0aWFsaXphdGlvbiBzdGF0dXNcbiAgICAgKiBJZiB3ZSBwdXNoIGxvZ3MgYmVmb3JlIE5ldyBSZWxpYyBpbml0aWFsaXplcywgdGhleSB3aWxsIG5vdCBoYXZlIGFuIGF0dGFjaGVkXG4gICAgICogZW50aXR5IGd1aWQuICBGb3IgdGhpcyByZWFzb24gd2Ugd2lsbCBpbml0aWFsaXplIGFuIGludGVydmFsIHRoYXQgY2FuIHJ1biB1bnRpbFxuICAgICAqIGl0IGlzIGluaXRpYWxpemVkLlxuICAgICAqL1xuICAgIHByaXZhdGUgcmVnaXN0ZXJOZXdSZWxpY0luaXRpYWxpemF0aW9uSW50ZXJ2YWwoKSB7XG4gICAgICAgIGNvbnN0IG5ld1JlbGljSW5pdGlhbGl6YXRpb25DaGVja1RpbWVvdXQgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBtZXRhZGF0YSA9IG5ld3JlbGljLmdldExpbmtpbmdNZXRhZGF0YSgpO1xuICAgICAgICAgICAgaWYgKG1ldGFkYXRhWydlbnRpdHkuZ3VpZCddKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5uZXdSZWxpY0luaXRpYWxpemVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBpbnRlcm5hbExvZygnaW5mbycsICdEZXRlY3RlZCBOZXcgUmVsaWMgaGFzIGluaXRpYWxpemVkIHdpdGggZW50aXR5Lmd1aWQnKTtcbiAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKG5ld1JlbGljSW5pdGlhbGl6YXRpb25DaGVja1RpbWVvdXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCAxMDApO1xuICAgIH1cbn1cblxuLyoqXG4gKiBSZXBsYWNlcyBleGlzdGluZyB3cml0ZXJzIGZvciBzdGRvdXQgYW5kIHN0ZGVyciB3aXRoXG4gKiBQYXNzVGhyb3VnaCBzdHJlYW1zIHRoYXQgd2lsbCBpbnZva2UgcHJvdmlkZWQgY2FsbGJhY2tzXG4gKiB3aXRoIHRoZSBkYXRhIHByaW9yIHRvIHBhc3NpbmcgdGhlbSB0byB0aGUgb3JpZ2luYWwgc3RyZWFtc1xuICovXG5jbGFzcyBTdGFuZGFyZE91dFBhc3NUaHJvdWdoIHtcblxuXG4gICAgcHJpdmF0ZSByZWFkb25seSBzdGRvdXRQdCA9IG5ldyBQYXNzVGhyb3VnaCgpO1xuICAgIHByaXZhdGUgcmVhZG9ubHkgc3RkZXJyUHQgPSBuZXcgUGFzc1Rocm91Z2goKTtcblxuICAgIHByaXZhdGUgcmVhZG9ubHkgc3Rkb3V0O1xuICAgIHByaXZhdGUgcmVhZG9ubHkgc3RkZXJyO1xuXG4gICAgcHJpdmF0ZSByZWFkb25seSB3cml0ZVN0ZG91dDtcbiAgICBwcml2YXRlIHJlYWRvbmx5IHdyaXRlU3RkZXJyO1xuXG4gICAgY29uc3RydWN0b3Ioc3Rkb3V0Q2I6IChkYXRhOiBzdHJpbmcpID0+IHZvaWQsIHN0ZGVyckNiOiAoZGF0YTogc3RyaW5nKSA9PiB2b2lkKSB7XG4gICAgICAgIC8vIFN0b3JlIG9yaWdpbmFsIHdyaXRlIHN0ZG91dC9zdGRlcnIgd3JpdGUgZnVuY3Rpb25zXG4gICAgICAgIHRoaXMuc3Rkb3V0ID0gcHJvY2Vzcy5zdGRvdXQud3JpdGU7XG4gICAgICAgIHRoaXMuc3RkZXJyID0gcHJvY2Vzcy5zdGRlcnIud3JpdGU7XG5cbiAgICAgICAgLy8gQ3JlYXRlIGZ1bmN0aW9ucyB3aGljaCB3cml0ZSB0byBvcmlnaW5hbCB3cml0ZXMgd2l0aCBzdGRvdXQvc3RkZXJyIGNvbnRleHRzIGJvdW5kXG4gICAgICAgIHRoaXMud3JpdGVTdGRvdXQgPSAoZGF0YTogc3RyaW5nKSA9PiB0aGlzLnN0ZG91dC5jYWxsKHByb2Nlc3Muc3Rkb3V0LCBkYXRhKTtcbiAgICAgICAgdGhpcy53cml0ZVN0ZGVyciA9IChkYXRhOiBzdHJpbmcpID0+IHRoaXMuc3RkZXJyLmNhbGwocHJvY2Vzcy5zdGRlcnIsIGRhdGEpO1xuXG4gICAgICAgIC8vIEFzc2lnbiBsaXN0ZW5lcnMgdG8gUGFzc1Rocm91Z2hzXG4gICAgICAgIHRoaXMuc3Rkb3V0UHQub24oJ2RhdGEnLCAoZGF0YSkgPT4ge1xuICAgICAgICAgICAgaWYgKGRhdGEgaW5zdGFuY2VvZiBCdWZmZXIpIHtcbiAgICAgICAgICAgICAgICBkYXRhID0gZGF0YS50b1N0cmluZygndXRmOCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3Rkb3V0Q2IoZGF0YSk7XG4gICAgICAgICAgICB0aGlzLndyaXRlU3Rkb3V0KGRhdGEpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnN0ZGVyclB0Lm9uKCdkYXRhJywgKGRhdGEpID0+IHtcbiAgICAgICAgICAgIGlmIChkYXRhIGluc3RhbmNlb2YgQnVmZmVyKSB7XG4gICAgICAgICAgICAgICAgZGF0YSA9IGRhdGEudG9TdHJpbmcoJ3V0ZjgnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN0ZGVyckNiKGRhdGEpO1xuICAgICAgICAgICAgdGhpcy53cml0ZVN0ZGVycihkYXRhKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gUmVwbGFjZSBvcmlnaW5hbCB3cml0ZSBjYWxscyB3aXRoIGNvbnRleHRzIGJvdW5kIHRvIHBhcmVudCBvYmplY3RcbiAgICAgICAgcHJvY2Vzcy5zdGRvdXQud3JpdGUgPSB0aGlzLnN0ZG91dFB0LndyaXRlLmJpbmQodGhpcy5zdGRvdXRQdCkgYXMgYW55O1xuICAgICAgICBwcm9jZXNzLnN0ZGVyci53cml0ZSA9IHRoaXMuc3RkZXJyUHQud3JpdGUuYmluZCh0aGlzLnN0ZGVyclB0KSBhcyBhbnk7XG5cbiAgICAgICAgLy8gQWRkIHVuY2F1Z2h0IGVycm9yIGhhbmRsZXIgdG8gaGFuZGxlIGxvZ2dpbmcgb2YgZmFpbHVyZSBjYXNlXG4gICAgICAgIHByb2Nlc3Mub24oJ3VuY2F1Z2h0RXhjZXB0aW9uJywgKGVycikgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZWFmZml4IHRoZSByZXBsYWNlZCBzdGRvdXQgYW5kIHN0ZGVyciB0aGVuXG4gICAgICogY2xvc2VzIGFsbCBzdHJlYW1zIG93bmVkIGJ5IHRoaXMgaW5zdGFuY2UuXG4gICAgICovXG4gICAgcHVibGljIGRlc3Ryb3koKSB7XG4gICAgICAgIHByb2Nlc3Muc3Rkb3V0LndyaXRlID0gdGhpcy5zdGRvdXQ7XG4gICAgICAgIHByb2Nlc3Muc3RkZXJyLndyaXRlID0gdGhpcy5zdGRlcnI7XG5cbiAgICAgICAgdGhpcy5zdGRvdXRQdC5kZXN0cm95KClcbiAgICAgICAgdGhpcy5zdGRlcnJQdC5kZXN0cm95KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQnlwYXNzIHRoZSBjb25maWd1cmVkIGNhbGxiYWNrIGZ1bmN0aW9uIGZvciBzdGRvdXQgYnlcbiAgICAgKiB3cml0aW5nIGRpcmVjdGx5IHRvIHRoZSBkZXRhY2hlZCBvdXRwdXQgc3RyZWFtXG4gICAgICogQHBhcmFtIGRhdGEgXG4gICAgICovXG4gICAgcHVibGljIHN0ZG91dEJ5cGFzcyhkYXRhOiBzdHJpbmcgfCBvYmplY3QpIHtcbiAgICAgICAgaWYgKGRhdGEgaW5zdGFuY2VvZiBPYmplY3QpIHtcbiAgICAgICAgICAgIGRhdGEgPSBKU09OLnN0cmluZ2lmeShkYXRhKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLndyaXRlU3Rkb3V0KChkYXRhIGFzIHVua25vd24gYXMgc3RyaW5nKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQnlwYXNzIHRoZSBjb25maWd1cmVkIGNhbGxiYWNrIGZ1bmN0aW9uIGZvciBzdGRlcnIgYnlcbiAgICAgKiB3cml0aW5nIGRpcmVjdGx5IHRvIHRoZSBkZXRhY2hlZCBvdXRwdXQgc3RyZWFtXG4gICAgICogQHBhcmFtIGRhdGEgXG4gICAgICovXG4gICAgcHVibGljIHN0ZGVyckJ5cGFzcyhkYXRhOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy53cml0ZVN0ZGVycihkYXRhKTtcbiAgICB9XG59XG5cblxuLyoqXG4gKiBMYXp5IGxvYWQgbG9nZ2VyLCB3cml0ZSBidWZmZXJlZCBtZXNzYWdlcyBvbmNlIGxvYWRlZFxuICogTm90ZTogTGF6eSBsb2FkaW5nIGlzIG5lY2Vzc2FyeSB0byByZXNvbHZlIGNpcmN1bGFyIGRlcGVuZGVuY2llcyBiZXR3ZWVuIHRoaXNcbiAqIG1vZHVsZSBhbmQgdGhlIGxvZ2dlci5cbiAqL1xuKGFzeW5jICgpID0+IHtcbiAgICBjb25zdCB7IHdpdGhMb2dnZXIgfSA9IGF3YWl0IGltcG9ydCgnLi9sb2dnZXInKTtcbiAgICBjb25zdCBsZXZlbDogTlBNTG9nZ2luZ0xldmVscyA9IHByb2Nlc3MuZW52LkxPR19ERUxJVkVSWV9BR0VOVF9MRVZFTCBhcyBOUE1Mb2dnaW5nTGV2ZWxzIHx8ICd3YXJuJztcbiAgICBsb2cgPSB3aXRoTG9nZ2VyKCdOZXdSZWxpY0xvZ0ZvcndhcmRlcicsIGxldmVsKTtcbiAgICB3aGlsZShpbnRlcm5hbExvZ0J1ZmZlci5sZW5ndGgpIHtcbiAgICAgICAgY29uc3QgW2xldmVsLCBtZXNzYWdlXSA9IGludGVybmFsTG9nQnVmZmVyLnNoaWZ0KCkgYXMgW3N0cmluZywgc3RyaW5nXTtcbiAgICAgICAgKGxvZyBhcyBhbnkpW2xldmVsXShtZXNzYWdlKTtcbiAgICB9XG59KSgpO1xuIl19