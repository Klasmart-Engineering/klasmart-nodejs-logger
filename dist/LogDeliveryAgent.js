"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NewRelicLogDeliveryAgent = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _newrelic = _interopRequireDefault(require("newrelic"));

var _zlib = _interopRequireDefault(require("zlib"));

var _NewRelicLogTransport = require("./NewRelicLogTransport");

var _stream = require("stream");

var _axios = _interopRequireDefault(require("axios"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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

    _classCallCheck(this, NewRelicLogDeliveryAgent);

    _defineProperty(this, "logQueue", []);

    _defineProperty(this, "config", void 0);

    _defineProperty(this, "logLengthQueue", []);

    _defineProperty(this, "totalLengthCount", 0);

    _defineProperty(this, "globalAttributes", {});

    _defineProperty(this, "newRelicLogTransport", void 0);

    _defineProperty(this, "debugMode", process.env.DEBUG_WRITE_LOGS_TO_FILE === 'true');

    _defineProperty(this, "timeoutId", void 0);

    _defineProperty(this, "logsWritten", 0);

    _defineProperty(this, "standardOutPassThrough", void 0);

    internalLog('debug', 'Initializing LogDeliveryAgent');
    this.config = _objectSpread({}, defaultConfig);
    this.logQueue.push("Creating NewRelicLogTransport");
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
    internalLog('debug', 'LogDeliveryAgent Initialized');
  }
  /**
   * Accessor for Winston Transport that writes to this 
   * agent instance
   * @returns winston.transport
   */


  _createClass(NewRelicLogDeliveryAgent, [{
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
      if (_typeof(str) === 'object') {
        str = JSON.stringify(str);
      }

      try {
        var obj = JSON.parse(str);

        if (obj && _typeof(obj) === "object") {
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
        this.writeLogsSync();
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
      var _beginWriteLogs = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        var logsToWrite, rawPayload, compressedPayload, fallbackMessage, message;
        return regeneratorRuntime.wrap(function _callee$(_context) {
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
            service: process.env.NEW_RELIC_APP_NAME
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
      var _compressPayload = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(rawPayload) {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
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
      if (this.logQueue.length > (this.config.minLogItemsToForce || 100)) {
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

      this.timeoutId = setTimeout( /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
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

_defineProperty(NewRelicLogDeliveryAgent, "instance", void 0);

var StandardOutPassThrough = /*#__PURE__*/function () {
  function StandardOutPassThrough(stdoutCb, stderrCb) {
    var _this4 = this;

    _classCallCheck(this, StandardOutPassThrough);

    _defineProperty(this, "stdoutPt", new _stream.PassThrough());

    _defineProperty(this, "stderrPt", new _stream.PassThrough());

    _defineProperty(this, "stdout", void 0);

    _defineProperty(this, "stderr", void 0);

    _defineProperty(this, "writeStdout", void 0);

    _defineProperty(this, "writeStderr", void 0);

    // Store original write stdout/stderr write functions
    this.stdout = process.stdout.write;
    this.stderr = process.stderr.write; // Create functions which write to original writes with stdout/stderr contexts bound

    this.writeStdout = function (data) {
      return _this4.stdout.call(process.stdout, data);
    };

    this.writeStderr = function (data) {
      return _this4.stderr.call(process.stderr, data);
    }; // Assign listeners to PassThroughs


    this.stdoutPt.on('data', function (data) {
      if (data instanceof Buffer) {
        data = data.toString('utf8');
      }

      stdoutCb(data);

      _this4.writeStdout(data);
    });
    this.stderrPt.on('data', function (data) {
      if (data instanceof Buffer) {
        data = data.toString('utf8');
      }

      stderrCb(data);

      _this4.writeStderr(data);
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


  _createClass(StandardOutPassThrough, [{
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


_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
  var _yield$import, withLogger, level, _ref4, _ref5, _level, message;

  return regeneratorRuntime.wrap(function _callee4$(_context4) {
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
            _ref4 = internalLogBuffer.shift(), _ref5 = _slicedToArray(_ref4, 2), _level = _ref5[0], message = _ref5[1];

            log[_level](message);
          }

        case 7:
        case "end":
          return _context4.stop();
      }
    }
  }, _callee4);
}))();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9Mb2dEZWxpdmVyeUFnZW50LnRzIl0sIm5hbWVzIjpbIkFQSV9IT1NUTkFNRSIsInByb2Nlc3MiLCJlbnYiLCJLTF9OUl9MT0dfSE9TVE5BTUUiLCJBUElfUEFUSCIsIktMX05SX0xPR19QQVRIIiwiTUFYX1BBWUxPQURfU0laRSIsIk1BWF9BVFRSSUJVVEVTX1BFUl9FVkVOVCIsIk1BWF9BVFRSSUJVVEVfTkFNRV9MRU5HVEgiLCJNQVhfQVRUUklCVVRFX1ZBTFVFX0xFTkdUSCIsImxvZyIsImludGVybmFsTG9nQnVmZmVyIiwiaW50ZXJuYWxMb2ciLCJsZXZlbCIsIm1lc3NhZ2UiLCJwdXNoIiwiZGVmYXVsdENvbmZpZyIsImJ5dGVzV3JpdHRlblRocmVzaG9sZCIsIndhcm5PbkF0dHJpYnV0ZUxlbmd0aE92ZXJmbG93IiwibWluQnl0ZXNXcml0dGVuIiwibWluTG9nSXRlbXMiLCJsb2dQdXNoRnJlcXVlbmN5IiwibWluTG9nSXRlbXNUb0ZvcmNlIiwiTmV3UmVsaWNMb2dEZWxpdmVyeUFnZW50IiwiREVCVUdfV1JJVEVfTE9HU19UT19GSUxFIiwiY29uZmlnIiwibG9nUXVldWUiLCJuZXdSZWxpY0xvZ1RyYW5zcG9ydCIsIk5ld1JlbGljTG9nVHJhbnNwb3J0IiwiY2IiLCJhZGRMb2ciLCJsb2dDYWxsYmFjayIsImVyckNhbGxiYWNrIiwibGFiZWwiLCJzdGFuZGFyZE91dFBhc3NUaHJvdWdoIiwiU3RhbmRhcmRPdXRQYXNzVGhyb3VnaCIsInJlZ2lzdGVyQXBwRGVhdGhMb2dQdXNoIiwiY3JlYXRlTG9nQ2hlY2tUaW1lb3V0IiwidGltZW91dElkIiwiY2xlYXJUaW1lb3V0IiwiZGVzdHJveSIsImNsb3NlIiwid3JpdGVMb2dzU3luYyIsInN0ciIsIkpTT04iLCJzdHJpbmdpZnkiLCJvYmoiLCJwYXJzZSIsImVyciIsImNhbGxiYWNrIiwianNvbkRhdGEiLCJpc05SQ29tcGF0aWJsZUpzb25Mb2dTdHJpbmciLCJwcm9jZXNzQXNKc29uTG9nIiwicHJvY2Vzc0FzU3RyaW5nTG9nIiwiaW1tZWRpYXRlTG9nV3JpdGFibGVQcmVkaWNhdGUiLCJzdGRlcnJCeXBhc3MiLCJzdGRvdXRCeXBhc3MiLCJsb2dUcmFuc2Zvcm0iLCJsb2dTdHJpbmciLCJsZW5ndGgiLCJCdWZmZXIiLCJieXRlTGVuZ3RoIiwibG9nTGVuZ3RoUXVldWUiLCJ0b3RhbExlbmd0aENvdW50IiwiZW5kc1dpdGgiLCJzdWJzdHJpbmciLCJuZXdSZWxpY01ldGFkYXRhIiwibmV3cmVsaWMiLCJnZXRMaW5raW5nTWV0YWRhdGEiLCJzdHJ1Y3R1cmVkTG9nIiwidGltZXN0YW1wIiwiRGF0ZSIsIm5vdyIsIm9yaWdpbmFsX3RpbWVzdGFtcCIsInRvSVNPU3RyaW5nIiwiaG9zdG5hbWUiLCJqc29uTG9nU3RyaW5nIiwiYXR0cmlidXRlcyIsImdsb2JhbEF0dHJpYnV0ZXMiLCJsb2dzVG9Xcml0ZSIsInNsaWNlTG9ncyIsInJhd1BheWxvYWQiLCJidWlsZFJhd1Bvc3RCb2R5IiwiY29tcHJlc3NlZFBheWxvYWQiLCJ6bGliIiwiZ3ppcFN5bmMiLCJkZWJ1Z01vZGUiLCJzZW5kTG9ncyIsIndyaXRlTG9nc1RvRmlsZVN5c3RlbSIsImJ1ZmZlciIsImZzIiwid3JpdGVGaWxlU3luYyIsImxvZ3NXcml0dGVuIiwiY29tcHJlc3NQYXlsb2FkIiwiZmFsbGJhY2tNZXNzYWdlIiwiRXJyb3IiLCJzdGFjayIsIkF4aW9zIiwicG9zdCIsImhlYWRlcnMiLCJORVdfUkVMSUNfTElDRU5TRV9LRVkiLCJ0aGVuIiwicmVzcG9uc2UiLCJpbmNsdWRlcyIsInN0YXR1cyIsImRhdGEiLCJyZXF1ZXN0SWQiLCJsb2dzIiwicGF5bG9hZCIsImNvbW1vbiIsInNlcnZpY2UiLCJORVdfUkVMSUNfQVBQX05BTUUiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsImd6aXAiLCJmcm9tIiwibG9nc1RvU2VuZCIsImxvZ1NpemUiLCJsb2dTbGljZUluZGV4Iiwic2xpY2UiLCJtaW5Mb2dJdGVtc0V4Y2VlZGVkIiwiT2JqZWN0IiwiZ2V0T3duUHJvcGVydHlOYW1lcyIsImtleXMiLCJrZXkiLCJ2YWx1ZSIsIm5ld0tleSIsImRlZmluZVByb3BlcnR5IiwiZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yIiwicmVwbGFjZUFsbCIsInNldFRpbWVvdXQiLCJiZWdpbldyaXRlTG9ncyIsImZpbmFsV3JpdHRlbiIsIm9uIiwibyIsImV4aXQiLCJlIiwiY29uc29sZSIsImluc3RhbmNlIiwic3Rkb3V0Q2IiLCJzdGRlcnJDYiIsIlBhc3NUaHJvdWdoIiwic3Rkb3V0Iiwid3JpdGUiLCJzdGRlcnIiLCJ3cml0ZVN0ZG91dCIsImNhbGwiLCJ3cml0ZVN0ZGVyciIsInN0ZG91dFB0IiwidG9TdHJpbmciLCJzdGRlcnJQdCIsImJpbmQiLCJlcnJvciIsIndpdGhMb2dnZXIiLCJMT0dfREVMSVZFUllfQUdFTlRfTEVWRUwiLCJzaGlmdCJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUdBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVBLElBQU1BLFlBQVksR0FBR0MsT0FBTyxDQUFDQyxHQUFSLENBQVlDLGtCQUFaLElBQWtDLHlCQUF2RDtBQUNBLElBQU1DLFFBQVEsR0FBR0gsT0FBTyxDQUFDQyxHQUFSLENBQVlHLGNBQVosSUFBOEIsU0FBL0M7QUFDQSxJQUFNQyxnQkFBZ0IsWUFBRyxFQUFILEVBQU8sQ0FBUCxDQUF0QjtBQUNBLElBQU1DLHdCQUF3QixHQUFHLEdBQWpDO0FBQ0EsSUFBTUMseUJBQXlCLEdBQUcsR0FBbEM7QUFDQSxJQUFNQywwQkFBMEIsR0FBRyxJQUFuQztBQUVBLElBQUlDLEdBQUo7QUFDQSxJQUFJQyxpQkFBMEMsR0FBRyxFQUFqRDtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUNBLFNBQVNDLFdBQVQsQ0FBcUJDLEtBQXJCLEVBQW9DQyxPQUFwQyxFQUFxRDtBQUNqRCxNQUFJSixHQUFKLEVBQVM7QUFD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QUM5QixXQUFLMkMsV0FBTCxDQUFpQjNDLElBQWpCO0FBQ0g7Ozs7O0FBSUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBQ0Esd0RBQUM7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxtREFDdUMsVUFEdkM7QUFBQTs7QUFBQTtBQUFBO0FBQ1dpRCxVQUFBQSxVQURYLGlCQUNXQSxVQURYO0FBRVM3SSxVQUFBQSxLQUZULEdBRW1DWixPQUFPLENBQUNDLEdBQVIsQ0FBWXlKLHdCQUFaLElBQTRELE1BRi9GO0FBR0dqSixVQUFBQSxHQUFHLEdBQUdnSixVQUFVLENBQUMsc0JBQUQsRUFBeUI3SSxLQUF6QixDQUFoQjs7QUFDQSxpQkFBTUYsaUJBQWlCLENBQUNnRCxNQUF4QixFQUFnQztBQUFBLG9CQUNIaEQsaUJBQWlCLENBQUNpSixLQUFsQixFQURHLG9DQUNyQi9JLE1BRHFCLGFBQ2RDLE9BRGM7O0FBRTNCSixZQUFBQSxHQUFELENBQWFHLE1BQWIsRUFBb0JDLE9BQXBCO0FBQ0g7O0FBUEo7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsQ0FBRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgaHR0cHMsIHsgcmVxdWVzdCB9IGZyb20gJ2h0dHAnO1xuaW1wb3J0IG5ld3JlbGljIGZyb20gJ25ld3JlbGljJztcbmltcG9ydCB6bGliIGZyb20gJ3psaWInO1xuaW1wb3J0IHsgTmV3UmVsaWNMb2dUcmFuc3BvcnQgfSBmcm9tICcuL05ld1JlbGljTG9nVHJhbnNwb3J0JztcbmltcG9ydCB7IFBhc3NUaHJvdWdoLCBSZWFkYWJsZSB9IGZyb20gJ3N0cmVhbSc7XG5pbXBvcnQgeyBMb2dnZXIgfSBmcm9tICd3aW5zdG9uJztcbmltcG9ydCB7IE5QTUxvZ2dpbmdMZXZlbHMgfSBmcm9tICcuL2xvZ2dlcic7XG5pbXBvcnQgQXhpb3MgZnJvbSAnYXhpb3MnO1xuXG5jb25zdCBBUElfSE9TVE5BTUUgPSBwcm9jZXNzLmVudi5LTF9OUl9MT0dfSE9TVE5BTUUgfHwgJ2xvZy1hcGkuZXUubmV3cmVsaWMuY29tJztcbmNvbnN0IEFQSV9QQVRIID0gcHJvY2Vzcy5lbnYuS0xfTlJfTE9HX1BBVEggfHwgJy9sb2cvdjEnO1xuY29uc3QgTUFYX1BBWUxPQURfU0laRSA9IDEwKio2O1xuY29uc3QgTUFYX0FUVFJJQlVURVNfUEVSX0VWRU5UID0gMjU1O1xuY29uc3QgTUFYX0FUVFJJQlVURV9OQU1FX0xFTkdUSCA9IDI1NTtcbmNvbnN0IE1BWF9BVFRSSUJVVEVfVkFMVUVfTEVOR1RIID0gNDA5NjtcblxubGV0IGxvZzogTG9nZ2VyIHwgdW5kZWZpbmVkO1xubGV0IGludGVybmFsTG9nQnVmZmVyOiBBcnJheTxbc3RyaW5nLCBzdHJpbmddPiA9IFtdO1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHdyaXRlIGxvZ3MgdGhhdCBhcmUgaW50ZXJuYWwgdG8gdGhpcyBtb2R1bGUuXG4gKiBCdWZmZXJzIGNhbGxzIHVudGlsIHRoZSBXaW5zdG9uIGxvZ2dlciBjYW4gYmUgYXN5bmMgaW1wb3J0ZFxuICogQWZ0ZXJ3b3Jkcywgd3JpdGVzIGxvZ3MgZGlyZWN0bHkgdG8gdGhlIGxvZ2dlclxuICogQHBhcmFtIGxldmVsIFxuICogQHBhcmFtIG1lc3NhZ2UgXG4gKi9cbmZ1bmN0aW9uIGludGVybmFsTG9nKGxldmVsOiBzdHJpbmcsIG1lc3NhZ2U6IHN0cmluZykge1xuICAgIGlmIChsb2cpIHtcbiAgICAgICAgKGxvZyBhcyBhbnkpW2xldmVsXShtZXNzYWdlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBpbnRlcm5hbExvZ0J1ZmZlci5wdXNoKFtsZXZlbCwgbWVzc2FnZV0pO1xuICAgIH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBOZXdSZWxpY0xvZ0RlbGl2ZXJ5QWdlbnRDb25maWcge1xuICAgIC8qKlxuICAgICAqIEhvdyBmcmVxdWVudGx5IGNoZWNrcyBzaG91bGQgYmUgcnVuIHRvIHB1c2ggbG9ncyB0byBOUlxuICAgICAqIERlZmF1bHQgaXMgMTAgc2Vjb25kc1xuICAgICAqL1xuICAgICBsb2dQdXNoRnJlcXVlbmN5PzogbnVtYmVyO1xuXG4gICAgIC8qKlxuICAgICAgKiBNaW5pbXVtIG51bWJlciBvZiBsb2cgc3RhdGVtZW50cyB3cml0dGVuIGJlZm9yZSBsb2dzIGNhbiBiZSBwdXNoZWQgdG8gTlJcbiAgICAgICogYnkgcGVyaW9kaWMgbG9nZ2VyLlxuICAgICAgKiBEZWZhdWx0IGlzIDJcbiAgICAgICovXG4gICAgIG1pbkxvZ0l0ZW1zPzogbnVtYmVyO1xuIFxuIFxuICAgICAvKipcbiAgICAgICogTWluaW11bSBudW1iZXIgb2YgbG9nIHN0YXRlbWVudHMgdG8gZm9yY2UgYW4gaW1tZWRpYXRlIHB1c2ggdG8gTlIuIFVzZWRcbiAgICAgICogdG8gZW5zdXJlIHRoYXQgdGhlIGxvZ2dpbmcgc3lzdGVtIGRvZXMgbm90IGdldCBiYWNrZWQgdXAgaWYgYW1vdW50IGJlaW5nXG4gICAgICAqIGxvZ2dlZCBzdXJwYXNzZXMgdGhlIGJhbmR3aWR0aCBvZiB0aGUgcGVyaW9kaWMgbG9nZ2VyLlxuICAgICAgKiBEZWZhdWx0IGlzIDEwMC5cbiAgICAgICovXG4gICAgIG1pbkxvZ0l0ZW1zVG9Gb3JjZT86IG51bWJlcjtcblxuIFxuICAgICAvKipcbiAgICAgICogTWluaW11bSBudW1iZXIgb2YgYnl0ZXMgd3JpdHRlbiB0byBjb21wcmVzc2lvbiBzdHJlYW0gYmVmb3JlIHB1c2hpbmcgdG8gTlJcbiAgICAgICovXG4gICAgIG1pbkJ5dGVzV3JpdHRlbj86IG51bWJlcjtcbiBcbiAgICAgLyoqXG4gICAgICAqIFRocmVzaG9sZCBmb3IgYnl0ZXMgd3JpdHRlbiBhdCB3aGljaCBwb2ludCBhIG5ldyB3cml0ZSB0byBOUiB3aWxsIGJlIGF1dG9tYXRpY2FsbHlcbiAgICAgICogdHJpZ2dlcmVkLiBEZWZhdWx0cyB0byAoNC81ICogTUFYX1BBWUxPQURfU0laRSlcbiAgICAgICovXG4gICAgIGJ5dGVzV3JpdHRlblRocmVzaG9sZD86IG51bWJlcjtcbiBcbiAgICAgLyoqXG4gICAgICAqIFByb2R1Y2UgYSB3YXJuaW5nIHdoZW4gYXR0cmlidXRlIHZhbHVlcyBvdmVyZmxvdyB0aGUgTlIgbWF4aW11bSBsZW5ndGggb2YgNDA5Ni5cbiAgICAgICogRGVmYXVsdCBpcyBmYWxzZS5cbiAgICAgICovXG4gICAgIHdhcm5PbkF0dHJpYnV0ZUxlbmd0aE92ZXJmbG93PzogYm9vbGVhbjtcbn1cblxuY29uc3QgZGVmYXVsdENvbmZpZzogTmV3UmVsaWNMb2dEZWxpdmVyeUFnZW50Q29uZmlnID0ge1xuICAgIGJ5dGVzV3JpdHRlblRocmVzaG9sZDogTUFYX1BBWUxPQURfU0laRSAqIDQgLyA1LFxuICAgIHdhcm5PbkF0dHJpYnV0ZUxlbmd0aE92ZXJmbG93OiBmYWxzZSxcbiAgICBtaW5CeXRlc1dyaXR0ZW46IE1BWF9QQVlMT0FEX1NJWkUgKiAxIC8gNSxcbiAgICBtaW5Mb2dJdGVtczogMixcbiAgICBsb2dQdXNoRnJlcXVlbmN5OiA2MDAwMCxcbiAgICBtaW5Mb2dJdGVtc1RvRm9yY2U6IDEwMCxcbn1cblxuZXhwb3J0IGNsYXNzIE5ld1JlbGljTG9nRGVsaXZlcnlBZ2VudCB7XG4gXG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6ZXMgYSBOZXdSZWxpY0xvZ0RlbGl2ZXJ5QWdlbnQgaW5zdGFuY2UgaWYgdGhlIExPR19TVFlMRSBlbnZpcm9ubWVudFxuICAgICAqIHZhcmlhYmxlIGlzIHNldCB0byBORVdfUkVMSUMuIE90aGVyd2lzZSBpdCBkb2VzIG5vdGhpbmcuXG4gICAgICogQHBhcmFtIGNvbmZpZyBcbiAgICAgKiBAcmV0dXJucyBcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGluaXRpYWxpemUoKSB7XG4gICAgICAgIGlmICghcHJvY2Vzcy5lbnYuTkVXX1JFTElDX0xJQ0VOU0VfS0VZKSByZXR1cm47XG4gICAgICAgIE5ld1JlbGljTG9nRGVsaXZlcnlBZ2VudC5pbnN0YW5jZSA9IG5ldyBOZXdSZWxpY0xvZ0RlbGl2ZXJ5QWdlbnQoKTtcbiAgICAgICAgcmV0dXJuIE5ld1JlbGljTG9nRGVsaXZlcnlBZ2VudC5pbnN0YW5jZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIGdldEluc3RhbmNlKCkge1xuICAgICAgICByZXR1cm4gTmV3UmVsaWNMb2dEZWxpdmVyeUFnZW50Py5pbnN0YW5jZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIGNvbmZpZ3VyZShjb25maWc6IE5ld1JlbGljTG9nRGVsaXZlcnlBZ2VudENvbmZpZykge1xuICAgICAgICBjb25zdCBpbnN0YW5jZSA9IE5ld1JlbGljTG9nRGVsaXZlcnlBZ2VudC5pbnN0YW5jZTtcbiAgICAgICAgaWYgKCFpbnN0YW5jZSkge1xuICAgICAgICAgICAgaW50ZXJuYWxMb2coJ3dhcm4nLCAnQ29uZmlndXJlIGNhbGxlZCBiZWZvcmUgaW5zdGFuY2UgaW5pdGlhbGl6YXRpb24uIENvbmZpZ3VyYXRpb24gbm90IGFwcGxpZWQnKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpbnN0YW5jZS5jb25maWcgPSB7XG4gICAgICAgICAgICAuLi5pbnN0YW5jZS5jb25maWcsXG4gICAgICAgICAgICAuLi5jb25maWdcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0V2luc3RvblRyYW5zcG9ydCgpIHtcbiAgICAgICAgcmV0dXJuIE5ld1JlbGljTG9nRGVsaXZlcnlBZ2VudD8uaW5zdGFuY2U/LmxvZ1RyYW5zZm9ybTtcbiAgICB9XG4gICAgXG4gICAgcHJpdmF0ZSBzdGF0aWMgaW5zdGFuY2U6IE5ld1JlbGljTG9nRGVsaXZlcnlBZ2VudDtcbiAgICBwcml2YXRlIGxvZ1F1ZXVlOiBhbnlbXSA9IFtdO1xuICAgIHByaXZhdGUgY29uZmlnOiBOZXdSZWxpY0xvZ0RlbGl2ZXJ5QWdlbnRDb25maWc7XG4gICAgcHJpdmF0ZSBsb2dMZW5ndGhRdWV1ZTogbnVtYmVyW10gPSBbXTtcbiAgICBwcml2YXRlIHRvdGFsTGVuZ3RoQ291bnQgPSAwO1xuICAgIHByaXZhdGUgZ2xvYmFsQXR0cmlidXRlczoge1trZXk6IHN0cmluZ106IHN0cmluZ30gPSB7fTtcbiAgICBwcml2YXRlIG5ld1JlbGljTG9nVHJhbnNwb3J0OiBOZXdSZWxpY0xvZ1RyYW5zcG9ydDtcbiAgICBwcml2YXRlIGRlYnVnTW9kZSA9IHByb2Nlc3MuZW52LkRFQlVHX1dSSVRFX0xPR1NfVE9fRklMRSA9PT0gJ3RydWUnO1xuICAgIHByaXZhdGUgdGltZW91dElkOiBOb2RlSlMuVGltZW91dCB8IHVuZGVmaW5lZDtcbiAgICBwcml2YXRlIGxvZ3NXcml0dGVuID0gMDtcbiAgICBcbiAgICBwdWJsaWMgc3RhbmRhcmRPdXRQYXNzVGhyb3VnaDogU3RhbmRhcmRPdXRQYXNzVGhyb3VnaDtcbiAgICBcbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBpbnRlcm5hbExvZygnZGVidWcnLCAnSW5pdGlhbGl6aW5nIExvZ0RlbGl2ZXJ5QWdlbnQnKTtcbiAgICAgICAgdGhpcy5jb25maWcgPSB7IC4uLmRlZmF1bHRDb25maWcgfTtcblxuICAgICAgICB0aGlzLmxvZ1F1ZXVlLnB1c2goYENyZWF0aW5nIE5ld1JlbGljTG9nVHJhbnNwb3J0YCk7XG4gICAgICAgIHRoaXMubmV3UmVsaWNMb2dUcmFuc3BvcnQgPSBuZXcgTmV3UmVsaWNMb2dUcmFuc3BvcnQoKGxvZywgY2IpID0+IHRoaXMuYWRkTG9nKGxvZywgY2IpKTtcblxuICAgICAgICAvLyBDcmVhdGVzIGxvZ2dpbmcgY29uZmlndXJhdGlvbiBmb3IgcmV3cml0aW5nIHN0ZG91dC9zdGRlcnJcbiAgICAgICAgY29uc3QgbG9nQ2FsbGJhY2sgPSAobG9nOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgIHRoaXMuYWRkTG9nKGxvZywgKCkgPT4ge30pO1xuICAgICAgICB9O1xuICAgIFxuICAgICAgICBjb25zdCBlcnJDYWxsYmFjayA9IChsb2c6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgdGhpcy5hZGRMb2coe1xuICAgICAgICAgICAgICAgIGxhYmVsOiAnZXJyb3InLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGxvZ1xuICAgICAgICAgICAgfSwgKCkgPT4ge30pO1xuICAgICAgICB9O1xuICAgIFxuICAgICAgICB0aGlzLnN0YW5kYXJkT3V0UGFzc1Rocm91Z2ggPSBuZXcgU3RhbmRhcmRPdXRQYXNzVGhyb3VnaChsb2dDYWxsYmFjaywgZXJyQ2FsbGJhY2spO1xuICAgICAgICB0aGlzLnJlZ2lzdGVyQXBwRGVhdGhMb2dQdXNoKCk7XG4gICAgICAgIHRoaXMuY3JlYXRlTG9nQ2hlY2tUaW1lb3V0KCk7XG4gICAgICAgIGludGVybmFsTG9nKCdkZWJ1ZycsICdMb2dEZWxpdmVyeUFnZW50IEluaXRpYWxpemVkJylcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBY2Nlc3NvciBmb3IgV2luc3RvbiBUcmFuc3BvcnQgdGhhdCB3cml0ZXMgdG8gdGhpcyBcbiAgICAgKiBhZ2VudCBpbnN0YW5jZVxuICAgICAqIEByZXR1cm5zIHdpbnN0b24udHJhbnNwb3J0XG4gICAgICovXG4gICAgcHVibGljIGdldExvZ1RyYW5zcG9ydCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubmV3UmVsaWNMb2dUcmFuc3BvcnQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2h1dHNkb3duIHRoZSBkZWxpdmVyeSBhZ2VudC4gVGhpcyBjYW4gYmUgdXRpbGl6ZWQgd2hlbiBhcHAgaXMgZXhwZWN0ZWQgdG8gc2h1dGRvd25cbiAgICAgKiBhdCBhIGdpdmVuIHRpbWUgYW5kIHRoZSBwZXJpb2RpYyBkZWxpdmVyeSB0aW1lb3V0IGlzIGJsb2NraW5nIHNodXRkb3duLlxuICAgICAqIFxuICAgICAqIENsZWFycyBpbnRlcm5hbCB0aW1lb3V0LCBjb25maWd1cmVzIHdpbnN0b24gdHJhbnNwb3J0IHRvIG5vdCBzZW5kIGxvZ3MuXG4gICAgICogUmVjb25uZWN0cyBzdGRvdXQgYW5kIHN0ZGVyci5cbiAgICAgKiBXcml0ZXMgYW55IHJlbWFpbmluZyBsb2dzLlxuICAgICAqL1xuICAgIHB1YmxpYyBzaHV0ZG93bigpIHtcbiAgICAgICAgaW50ZXJuYWxMb2coJ2RlYnVnJywgJ1NodXRkb3duIG9mIExvZ0RlbGl2ZXJ5QWdlbnQgdHJpZ2dlcmVkJyk7XG4gICAgICAgIGlmICh0aGlzLnRpbWVvdXRJZCkgY2xlYXJUaW1lb3V0KHRoaXMudGltZW91dElkKTtcbiAgICAgICAgdGhpcy5zdGFuZGFyZE91dFBhc3NUaHJvdWdoLmRlc3Ryb3koKTtcbiAgICAgICAgdGhpcy5uZXdSZWxpY0xvZ1RyYW5zcG9ydC5jbG9zZSgpO1xuICAgICAgICB0aGlzLndyaXRlTG9nc1N5bmMoKTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIERldGVybWluZSBpZiB0aGUgbG9nIHN0cmluZyBvciBvYmplY3QgaXMgYSBOZXcgUmVsaWMgXG4gICAgICogY29tcGF0aWJsZSBKU09OLiBJbiBvcmRlciB0byBiZSBjb25zaWRlcmVkIHRoaXMgaXQgbXVzdFxuICAgICAqIGJlIGEgd2VsbCBzdHJ1Y3R1cmVkIEpTT04gb2JqZWN0IHdpdGggYSB0b3AgbGV2ZWwgJ21lc3NhZ2UnXG4gICAgICogYW5kICdsZXZlbCcgcHJvcGVydHkuXG4gICAgICogQHBhcmFtIHN0ciBcbiAgICAgKiBAcmV0dXJucyBvYmplY3QgZm9ybSBvZiBKU09OIG9yIGZhbHNlXG4gICAgICovXG4gICAgcHJpdmF0ZSBpc05SQ29tcGF0aWJsZUpzb25Mb2dTdHJpbmcoc3RyOiBzdHJpbmcgfCBvYmplY3QpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBzdHIgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICBzdHIgPSBKU09OLnN0cmluZ2lmeShzdHIpO1xuICAgICAgICB9XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBvYmogPSBKU09OLnBhcnNlKHN0ciBhcyBzdHJpbmcpO1xuICAgICAgICAgICAgaWYgKG9iaiAmJiB0eXBlb2Ygb2JqID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKG9iai5tZXNzYWdlICYmIG9iai5sZXZlbCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7IH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEludGVybmFsIGZ1bmN0aW9uIHVzZWQgdG8gYWNjZXB0IGxvZyBzdGF0ZW1lbnRzIGFuZFxuICAgICAqIHByb2Nlc3MgdGhlbS4gTG9nIGlzIHR5cGVkIHRvIGFueSB0byBmaXQgdHlwaW5nIGZvclxuICAgICAqIHRoZSBXaW5zdG9uIHRyYW5zcG9ydC5cbiAgICAgKiBcbiAgICAgKiBUT0RPOiBSZXdvcmsgdGhlIFdpbnN0b24gdHJhbnNwb3J0IGxvZ2ljIHRvIGRvIGEgYml0XG4gICAgICogICAgICBtb3JlIHdvcmsgdG8gcHJvdmlkZSBtb3JlIGNvbnNpc3RlbnQgdHlwaW5nLlxuICAgICAqIFxuICAgICAqIEBwYXJhbSBsb2cgXG4gICAgICogQHBhcmFtIGNhbGxiYWNrIFxuICAgICAqL1xuICAgIHByaXZhdGUgYWRkTG9nKGxvZzogYW55LCBjYWxsYmFjazogKCgpID0+IHZvaWQpIHwgdW5kZWZpbmVkKSB7XG4gICAgICAgIGNvbnN0IGpzb25EYXRhID0gdGhpcy5pc05SQ29tcGF0aWJsZUpzb25Mb2dTdHJpbmcobG9nKTtcbiAgICAgICAgaWYoanNvbkRhdGEpIHtcbiAgICAgICAgICAgIHRoaXMucHJvY2Vzc0FzSnNvbkxvZyhqc29uRGF0YSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnByb2Nlc3NBc1N0cmluZ0xvZyhsb2cpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuaW1tZWRpYXRlTG9nV3JpdGFibGVQcmVkaWNhdGUoKSkge1xuICAgICAgICAgICAgdGhpcy53cml0ZUxvZ3NTeW5jKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoanNvbkRhdGEpIGxvZyA9IEpTT04uc3RyaW5naWZ5KGxvZykrJ1xcbic7XG4gICAgXG4gICAgICAgIGlmIChqc29uRGF0YT8ubWVzc2FnZSAmJiBqc29uRGF0YT8ubGV2ZWwgPT09ICdlcnJvcicpIHtcbiAgICAgICAgICAgIHRoaXMuc3RhbmRhcmRPdXRQYXNzVGhyb3VnaC5zdGRlcnJCeXBhc3MobG9nKTtcbiAgICAgICAgfSBlbHNlIGlmKGpzb25EYXRhLm1lc3NhZ2UpIHtcbiAgICAgICAgICAgIHRoaXMuc3RhbmRhcmRPdXRQYXNzVGhyb3VnaC5zdGRvdXRCeXBhc3MobG9nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjYWxsYmFjaykgY2FsbGJhY2soKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBIYW5kbGVyIGZvciBwcm9jZXNzaW5nIGEgbG9nIHN0YXRlbWVudCB3aGVuIGl0IGlzIGZvcm1hdHRlZFxuICAgICAqIGFzIGEgTmV3IFJlbGljIGNvbXBhdGlibGUgSlNPTiBzdHJpbmcuXG4gICAgICogQHBhcmFtIGxvZyBcbiAgICAgKi9cbiAgICBwcm9jZXNzQXNKc29uTG9nKGxvZzogYW55KSB7XG4gICAgICAgIHRoaXMubG9nVHJhbnNmb3JtKGxvZyk7XG4gICAgICAgIGNvbnN0IGxvZ1N0cmluZyA9IEpTT04uc3RyaW5naWZ5KGxvZyk7XG4gICAgICAgIGNvbnN0IGxlbmd0aCA9IEJ1ZmZlci5ieXRlTGVuZ3RoKGxvZ1N0cmluZyk7XG4gICAgICAgIHRoaXMubG9nUXVldWUucHVzaChsb2cpO1xuICAgICAgICB0aGlzLmxvZ0xlbmd0aFF1ZXVlLnB1c2gobGVuZ3RoKTtcbiAgICAgICAgdGhpcy50b3RhbExlbmd0aENvdW50ICs9IGxlbmd0aDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBIYW5kbGVyIGZvciBwcm9jZXNzaW5nIGEgbG9nIHN0YXRlbWVudCB0aGF0IGlzIGEgc2ltcGxlXG4gICAgICogc3RyaW5nIGZvcm1hdC5cbiAgICAgKiBAcGFyYW0gbG9nIFxuICAgICAqL1xuICAgIHByb2Nlc3NBc1N0cmluZ0xvZyhsb2c6IHN0cmluZykge1xuICAgICAgICBpZiAodHlwZW9mIGxvZyA9PT0gJ3N0cmluZycgJiYgbG9nLmVuZHNXaXRoKCdcXG4nKSkge1xuICAgICAgICAgICAgbG9nID0gbG9nLnN1YnN0cmluZygwLCBsb2cubGVuZ3RoIC0gMSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbmV3UmVsaWNNZXRhZGF0YSA9IG5ld3JlbGljLmdldExpbmtpbmdNZXRhZGF0YSgpO1xuICAgICAgICBjb25zdCBzdHJ1Y3R1cmVkTG9nID0ge1xuICAgICAgICAgICAgbWVzc2FnZTogbG9nLFxuICAgICAgICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxuICAgICAgICAgICAgb3JpZ2luYWxfdGltZXN0YW1wOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICAgICAgICBcImVudGl0eS5uYW1lXCI6IG5ld1JlbGljTWV0YWRhdGFbJ2VudGl0eS5uYW1lJ10sXG4gICAgICAgICAgICBcImVudGl0eS50eXBlXCI6IG5ld1JlbGljTWV0YWRhdGFbJ2VudGl0eS50eXBlJ10sXG4gICAgICAgICAgICBob3N0bmFtZTogbmV3UmVsaWNNZXRhZGF0YS5ob3N0bmFtZVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QganNvbkxvZ1N0cmluZyA9IEpTT04uc3RyaW5naWZ5KHN0cnVjdHVyZWRMb2cpO1xuICAgICAgICBjb25zdCBsZW5ndGggPSBCdWZmZXIuYnl0ZUxlbmd0aChqc29uTG9nU3RyaW5nKTtcbiAgICAgICAgdGhpcy5sb2dRdWV1ZS5wdXNoKHN0cnVjdHVyZWRMb2cpO1xuICAgICAgICB0aGlzLmxvZ0xlbmd0aFF1ZXVlLnB1c2gobGVuZ3RoKTtcbiAgICAgICAgdGhpcy50b3RhbExlbmd0aENvdW50ICs9IGxlbmd0aDtcblxuICAgIH1cbiAgICBcbiAgICAvKipcbiAgICAgKiBTZXQgZ2xvYmFsIGF0dHJpYnV0ZXMgZm9yIHRoZSBhcHBsaWNhdGlvbi4gIFRoaXMgc2hvdWxkXG4gICAgICogZ2VuZXJhbGx5IGJlIGNvbmZpZ3VyZWQgZWFybHkgaW4gdGhlIGFwcGxpY2F0aW9uIGxpZmVjeWNsZS5cbiAgICAgKiBHbG9iYWwgYXR0cmlidXRlcyB3aWxsIGJlIGJvdW5kIHRvIGFsbCBsb2cgc3RhdGVtZW50c1xuICAgICAqIGluIE5ldyBSZWxpYy5cbiAgICAgKiBAcGFyYW0gYXR0cmlidXRlcyBLViBwYWlycyB0byBiZSBwcm92aWRlZCB0byBOUiB3aXRoIGxvZ3NcbiAgICAgKi9cbiAgICBzZXRHbG9iYWxBdHRyaWJ1dGVzKGF0dHJpYnV0ZXM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9KSB7XG4gICAgICAgIHRoaXMuZ2xvYmFsQXR0cmlidXRlcyA9IGF0dHJpYnV0ZXM7XG4gICAgfSAgXG5cbiAgICAvKipcbiAgICAgKiBXcml0ZXMgbG9ncyBzeW5jaHJvbm91c2x5LiAgVGhpcyBmdW5jdGlvbiBpcyBpbnRlbmRlZCB0byBiZVxuICAgICAqIHV0aWxpemVkIGluIHNpdHVhdGlvbnMgd2hlcmUgbG9nZ2luZyBjYW5ub3QgYmUgd3JpdHRlbiBcbiAgICAgKiBhc3luY2hyb25vdXNseSwgbW9zdCBjb21tb25seSBpbiB0aGUgaGFuZGxlciBvZiBhIFNJR1RFUk1cbiAgICAgKiBldmVudCwgd2hpY2ggb25seSBhbGxvd3Mgc3luY2hyb25vdXMgY2FsbHMuXG4gICAgICovXG4gICAgcHJpdmF0ZSB3cml0ZUxvZ3NTeW5jKCkge1xuICAgICAgICBjb25zdCBsb2dzVG9Xcml0ZSA9IHRoaXMuc2xpY2VMb2dzKCk7XG4gICAgICAgIGludGVybmFsTG9nKCdzaWxseScsIGBQcmVwYXJpbmcgZmluYWwgbG9nIHBheWxvYWQgb2YgJHtsb2dzVG9Xcml0ZS5sZW5ndGh9IGZvciBOUiBjb2xsZWN0b3JgKTtcbiAgICAgICAgY29uc3QgcmF3UGF5bG9hZCA9IHRoaXMuYnVpbGRSYXdQb3N0Qm9keShsb2dzVG9Xcml0ZSk7XG4gICAgICAgIGNvbnN0IGNvbXByZXNzZWRQYXlsb2FkID0gemxpYi5nemlwU3luYyhyYXdQYXlsb2FkKTtcbiAgICAgICAgaWYgKCF0aGlzLmRlYnVnTW9kZSkge1xuICAgICAgICAgICAgdGhpcy5zZW5kTG9ncyhjb21wcmVzc2VkUGF5bG9hZCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLndyaXRlTG9nc1RvRmlsZVN5c3RlbShjb21wcmVzc2VkUGF5bG9hZCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgd3JpdGVMb2dzVG9GaWxlU3lzdGVtKGJ1ZmZlcjogQnVmZmVyKSB7XG4gICAgICAgIGZzLndyaXRlRmlsZVN5bmMoYHRlc3QtJHt0aGlzLmxvZ3NXcml0dGVuKyt9Lmd6YCwgYnVmZmVyKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIGJlZ2luV3JpdGVMb2dzKCkge1xuICAgICAgICBjb25zdCBsb2dzVG9Xcml0ZSA9IHRoaXMuc2xpY2VMb2dzKCk7XG5cbiAgICAgICAgaW50ZXJuYWxMb2coJ3NpbGx5JywgYFByZXBhcmluZyBsb2cgcGF5bG9hZCBvZiAke2xvZ3NUb1dyaXRlLmxlbmd0aH0gZm9yIE5SIGNvbGxlY3RvcmApO1xuICAgICAgICBjb25zdCByYXdQYXlsb2FkID0gdGhpcy5idWlsZFJhd1Bvc3RCb2R5KGxvZ3NUb1dyaXRlKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGNvbXByZXNzZWRQYXlsb2FkOiBCdWZmZXIgPSBhd2FpdCB0aGlzLmNvbXByZXNzUGF5bG9hZChyYXdQYXlsb2FkKTtcbiAgICAgICAgICAgIGlmICghdGhpcy5kZWJ1Z01vZGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNlbmRMb2dzKGNvbXByZXNzZWRQYXlsb2FkKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy53cml0ZUxvZ3NUb0ZpbGVTeXN0ZW0oY29tcHJlc3NlZFBheWxvYWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnN0IGZhbGxiYWNrTWVzc2FnZSA9ICdVbmtub3duIGVycm9yIG9jY3VycmVkIHdoaWxlIGNvbXByZXNzaW5nIGxvZ3MgdG8gc2VuZCB0byBOZXcgUmVsaWMnO1xuICAgICAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVyciBpbnN0YW5jZW9mIEVycm9yICYmIGVyci5zdGFjayA/IGVyci5zdGFjayA6IGZhbGxiYWNrTWVzc2FnZTsgXG4gICAgICAgICAgICBpbnRlcm5hbExvZygnZXJyb3InLCBtZXNzYWdlKVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSGFuZGxlcyBIVFRQIHJlcXVlc3QgdGhhdCBzZW5kcyBjb21wcmVzc2VkIGxvZyBkYXRhXG4gICAgICogdG8gdGhlIE5ldyBSZWxpYyBlbmRwb2ludC5cbiAgICAgKiBAcGFyYW0gY29tcHJlc3NlZFBheWxvYWQgXG4gICAgICovXG4gICAgcHJpdmF0ZSBzZW5kTG9ncyhjb21wcmVzc2VkUGF5bG9hZDogQnVmZmVyKSB7XG4gICAgICAgIEF4aW9zLnBvc3QoYGh0dHBzOi8vJHtBUElfSE9TVE5BTUV9JHtBUElfUEFUSH1gLCBjb21wcmVzc2VkUGF5bG9hZCwge1xuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICdBY2NlcHQnOiAnKi8qJyxcbiAgICAgICAgICAgICAgICAnQXBpLUtleSc6IHByb2Nlc3MuZW52Lk5FV19SRUxJQ19MSUNFTlNFX0tFWSBhcyBzdHJpbmcsXG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtRW5jb2RpbmcnOiAnZ3ppcCcsXG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtTGVuZ3RoJzogJycrY29tcHJlc3NlZFBheWxvYWQuYnl0ZUxlbmd0aCxcbiAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2d6aXAnLFxuICAgICAgICAgICAgfVxuICAgICAgICB9KS50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgIGlmIChbMjAwLCAyMDJdLmluY2x1ZGVzKHJlc3BvbnNlLnN0YXR1cykpIHtcbiAgICAgICAgICAgICAgICBpbnRlcm5hbExvZygnc2lsbHknLCBgTG9nIHBheWxvYWQgYWNjZXB0ZWQgYnkgTmV3IFJlbGljIEFQSS4gUmVxdWVzdCBJRDogJHtyZXNwb25zZS5kYXRhLnJlcXVlc3RJZH1gKVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpbnRlcm5hbExvZygnd2FybicsIGBVbmV4cGVjdGVkIHN1Y2Nlc3NmdWwgcmVzcG9uc2Ugc3RhdHVzIGNvZGUgZnJvbSBOUjogJHtyZXNwb25zZS5zdGF0dXN9YClcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9KS5jYXRjaChlcnIgPT4ge1xuICAgICAgICAgICAgaW50ZXJuYWxMb2coJ2Vycm9yJywgJ0Vycm9yIHNlbmRpbmcgbG9nIHBheWxvYWQgdG8gTmV3IFJlbGljJyk7XG4gICAgICAgICAgICBpbnRlcm5hbExvZygnZXJyb3InLCBlcnIuc3RhY2spXG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyB0aGUgZ3JlYXRlciBvYmplY3Qgc3RydWN0dXJlIGZvciBhIGxvZyBkZWxpdmVyeSBcbiAgICAgKiBwYXlsb2FkIGFuZCBhdHRhY2hlcyBhbiBhcnJheSBvZiBsb2dzIHRvIGl0LiBSZXR1cm5zIFxuICAgICAqIHN0cmluZ2lmaWVkLlxuICAgICAqIEBwYXJhbSBsb2dzIFxuICAgICAqIEByZXR1cm5zIFxuICAgICAqL1xuICAgIHByaXZhdGUgYnVpbGRSYXdQb3N0Qm9keShsb2dzOiBhbnlbXSk6IHN0cmluZyB7XG4gICAgICAgIGNvbnN0IHBheWxvYWQgPSBbe1xuICAgICAgICAgICAgY29tbW9uOiB7XG4gICAgICAgICAgICAgICAgYXR0cmlidXRlczoge1xuICAgICAgICAgICAgICAgICAgICAuLi50aGlzLmdsb2JhbEF0dHJpYnV0ZXMsXG4gICAgICAgICAgICAgICAgICAgIHNlcnZpY2U6IHByb2Nlc3MuZW52Lk5FV19SRUxJQ19BUFBfTkFNRVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbG9nczogbG9nc1xuICAgICAgICB9XTtcbiAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHBheWxvYWQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFzeW5jaHJvbm91c2x5IGNvbXByZXNzIHN0cmluZyB0byBnemlwIGNvbXByZXNzZWQgZGF0YS5cbiAgICAgKiBAcGFyYW0gcmF3UGF5bG9hZCBcbiAgICAgKiBAcmV0dXJucyBcbiAgICAgKi9cbiAgICBwcml2YXRlIGFzeW5jIGNvbXByZXNzUGF5bG9hZChyYXdQYXlsb2FkOiBzdHJpbmcpOiBQcm9taXNlPEJ1ZmZlcj4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8QnVmZmVyPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICB6bGliLmd6aXAoQnVmZmVyLmZyb20ocmF3UGF5bG9hZCwgJ3V0ZjgnKSwgKGVyciwgY29tcHJlc3NlZFBheWxvYWQpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSByZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgICByZXNvbHZlKGNvbXByZXNzZWRQYXlsb2FkKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTbGljZXMgbG9nIHF1ZXVlLlxuICAgICAqIFdpbGwgcHJlZmVyIHRvIHVzZSB0aGUgZW50aXJlIGxvZyBxdWV1ZSB3aGVuIHBvc3NpYmxlLCBidXRcbiAgICAgKiBtYXkgc2VuZCBvbmx5IGEgc3Vic2VjdGlvbiBpZiB0aGUgc2l6ZSBvZiB0aGUgZGF0YSBpcyBuZWFyXG4gICAgICogdGhlIGxpbWl0YXRpb25zIGRlZmluZWQgYnkgTmV3IFJlbGljJ3MgQVBJLlxuICAgICAqIEByZXR1cm5zIFxuICAgICAqL1xuICAgIHByaXZhdGUgc2xpY2VMb2dzKCkge1xuICAgICAgICBsZXQgbG9nc1RvU2VuZDtcbiAgICAgICAgXG4gICAgICAgIC8vIElmIHdlIGtub3cgdGhlIHRvdGFsIGxlbmd0aCB3aWxsIG5vdCBleGNlZWQgbWF4aW11bSBsZW5ndGggc2l6ZVxuICAgICAgICBpZiAodGhpcy50b3RhbExlbmd0aENvdW50IDwgTUFYX1BBWUxPQURfU0laRSkge1xuICAgICAgICAgICAgW2xvZ3NUb1NlbmQsIHRoaXMubG9nUXVldWVdID0gW3RoaXMubG9nUXVldWUsIFtdXTtcbiAgICAgICAgICAgIHRoaXMubG9nTGVuZ3RoUXVldWUgPSBbXTtcbiAgICAgICAgICAgIHRoaXMudG90YWxMZW5ndGhDb3VudCA9IDA7XG4gICAgICAgICAgICByZXR1cm4gbG9nc1RvU2VuZDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIG90aGVyd2lzZSwgc2xpY2Ugb2ZmIGEgc2xpY2Ugb2YgbG9ncyB0aGF0IHdpbGwgZml0IGludG8gYSBzaW5nbGUgcmVxdWVzdFxuICAgICAgICBsZXQgbG9nU2l6ZSA9IDA7XG4gICAgICAgIGxldCBsb2dTbGljZUluZGV4ID0gMDtcblxuICAgICAgICB3aGlsZSgodGhpcy5sb2dRdWV1ZS5sZW5ndGggPiAwKSAmJiAobG9nU2l6ZSArIHRoaXMubG9nTGVuZ3RoUXVldWVbMF0gPCBNQVhfUEFZTE9BRF9TSVpFKSkge1xuICAgICAgICAgICAgbG9nU2xpY2VJbmRleCsrO1xuICAgICAgICB9XG5cbiAgICAgICAgbG9nc1RvU2VuZCA9IHRoaXMubG9nUXVldWUuc2xpY2UoMCwgbG9nU2xpY2VJbmRleCk7XG4gICAgICAgIHRoaXMubG9nUXVldWUgPSB0aGlzLmxvZ1F1ZXVlLnNsaWNlKGxvZ1NsaWNlSW5kZXgpO1xuICAgICAgICB0aGlzLmxvZ0xlbmd0aFF1ZXVlID0gdGhpcy5sb2dMZW5ndGhRdWV1ZS5zbGljZShsb2dTbGljZUluZGV4KTtcblxuICAgICAgICByZXR1cm4gbG9nc1RvU2VuZDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQcmVkaWNhdGUgdG8gZGV0ZXJtaW5lIGlmIGxvZ3Mgc2hvdWxkIGJlIHdyaXR0ZW4gYmUgd3JpdHRlbiBpbW1lZGlhdGVseS5cbiAgICAgKiBAcmV0dXJucyBib29sZWFuXG4gICAgICovXG4gICAgcHJpdmF0ZSBpbW1lZGlhdGVMb2dXcml0YWJsZVByZWRpY2F0ZSgpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKHRoaXMubG9nUXVldWUubGVuZ3RoID4gKHRoaXMuY29uZmlnLm1pbkxvZ0l0ZW1zVG9Gb3JjZSB8fCAxMDApKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUHJlZGljYXRlIHRvIGRldGVybWluZSBpZiBsb2dzIHNob3VsZCBiZSB3cml0dGVuIG9uIG5leHQgcGVyaW9kaWMgY2hlY2suXG4gICAgICogQHJldHVybnMgYm9vbGVhblxuICAgICAqL1xuICAgIHByaXZhdGUgbG9nc1dyaXRhYmxlUHJlZGljYXRlKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5taW5Mb2dJdGVtc0V4Y2VlZGVkKClcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQcmVkaWNhdGUgdG8gZGV0ZXJtaW5lIGlmIHRoZSB0b3RhbCBsb2dzIGhhdmUgZXhjZWVkZWQgYSBjb25maWd1cmVkIG1pbkxvZ1xuICAgICAqIGNvdW50IHZhbHVlIGlmIHN1Y2ggYSB2YWx1ZSBpcyBjb25maWd1cmVkLlxuICAgICAqIEByZXR1cm5zIFxuICAgICAqL1xuICAgIHByaXZhdGUgbWluTG9nSXRlbXNFeGNlZWRlZCgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuICEhKHRoaXMuY29uZmlnLm1pbkxvZ0l0ZW1zICYmICh0aGlzLmxvZ1F1ZXVlLmxlbmd0aCA+IHRoaXMuY29uZmlnLm1pbkxvZ0l0ZW1zKSk7XG4gICAgfSAgICBcbiAgICBcbiAgICAvKipcbiAgICAgKiBGaXhlcyBwb3NzaWJsZSBpc3N1ZXMgaW4gbG9nIGZvcm1hdCBjYXVzZWQgYnkgbGltaXRhdGlvbnMgb2YgTlJzIGxvZ2dpbmdcbiAgICAgKiB2YWx1ZXNcbiAgICAgKiBAcGFyYW0gbG9nIFxuICAgICAqIEByZXR1cm5zIFxuICAgICAqL1xuICAgIHByaXZhdGUgbG9nVHJhbnNmb3JtKGxvZzogYW55KSB7XG4gICAgICAgIGlmIChPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhsb2cpLmxlbmd0aCA+IE1BWF9BVFRSSUJVVEVTX1BFUl9FVkVOVCkge1xuICAgICAgICAgICAgaW50ZXJuYWxMb2coJ3dhcm4nLCBgTG9nIHRvIHNlbmQgdG8gSlNPTiBjb250YWlucyAke09iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGxvZyl9IC8gJHtNQVhfQVRUUklCVVRFU19QRVJfRVZFTlR9IGF0dHJpYnV0ZXMuYCk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGZvciAobGV0IGtleSBvZiBPYmplY3Qua2V5cyhsb2cpKSB7XG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IGxvZ1trZXldO1xuICAgICAgICAgICAgLy8gcmVwbGFjZSBrZXkgd2l0aCBsZW5ndGggdG9vIGhpZ2hcbiAgICAgICAgICAgIGlmIChrZXkubGVuZ3RoID4gTUFYX0FUVFJJQlVURV9OQU1FX0xFTkdUSCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG5ld0tleSA9IGtleS5zbGljZSgwLCBNQVhfQVRUUklCVVRFX05BTUVfTEVOR1RIKTtcbiAgICAgICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobG9nLCBrZXkuc2xpY2UoMCwgTUFYX0FUVFJJQlVURV9OQU1FX0xFTkdUSCksIFxuICAgICAgICAgICAgICAgICAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGxvZywga2V5IGFzIFByb3BlcnR5S2V5KSBhcyBQcm9wZXJ0eURlc2NyaXB0b3IpO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBsb2cua2V5O1xuXG4gICAgICAgICAgICAgICAgLy8gVXBkYXRlIGtleSBuYW1lIGZvciB1c2FnZSBpbiBsYXRlciBzdGVwc1xuICAgICAgICAgICAgICAgIGtleSA9IG5ld0tleTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gQ29uY2F0ZW5hdGUgbG9nIG1lc3NhZ2VzIHdpdGggbGVuZ3RoIGdyZWF0ZXIgdGhhbiBNQVhfQVRUUklCVVRFX1ZBTFVFX0xFTkdUSFxuICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgdmFsdWUubGVuZ3RoID4gTUFYX0FUVFJJQlVURV9WQUxVRV9MRU5HVEgpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jb25maWc/Lndhcm5PbkF0dHJpYnV0ZUxlbmd0aE92ZXJmbG93KSB7XG4gICAgICAgICAgICAgICAgICAgIGludGVybmFsTG9nKCd3YXJuJywgYE5SIExvZyBhdHRyaWJ1dGUgbGVuZ3RoIG92ZXJmbG93LiBMZW5ndGg6ICR7dmFsdWUubGVuZ3RofS8ke01BWF9BVFRSSUJVVEVfVkFMVUVfTEVOR1RIfWApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBsb2cua2V5ID0gdmFsdWUuc2xpY2UoMCwgTUFYX0FUVFJJQlVURV9WQUxVRV9MRU5HVEgpOyBcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGtleS5pbmNsdWRlcygnICcpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbmV3S2V5ID0ga2V5LnJlcGxhY2VBbGwoJyAnLCAnLicpO1xuICAgICAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShsb2csIGtleS5zbGljZSgwLCBNQVhfQVRUUklCVVRFX05BTUVfTEVOR1RIKSwgXG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IobG9nLCBrZXkgYXMgUHJvcGVydHlLZXkpIGFzIFByb3BlcnR5RGVzY3JpcHRvcik7XG4gICAgICAgICAgICAgICAgZGVsZXRlIGxvZy5rZXk7XG5cbiAgICAgICAgICAgICAgICAvLyBVcGRhdGUga2V5IG5hbWUgZm9yIHVzYWdlIGluIGxhdGVyIHN0ZXBzXG4gICAgICAgICAgICAgICAga2V5ID0gbmV3S2V5O1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZ1bmN0aW9uIHVzZWQgdG8gcmVwZWF0ZWRseSB0cmlnZ2VyIGxvZyBwdXNoZXNcbiAgICAgKi9cbiAgICBwcml2YXRlIGNyZWF0ZUxvZ0NoZWNrVGltZW91dCgpIHtcbiAgICAgICAgdGhpcy50aW1lb3V0SWQgPSBzZXRUaW1lb3V0KGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgIGlmICh0aGlzLmxvZ1F1ZXVlLmxlbmd0aCA+ICh0aGlzLmNvbmZpZy5taW5Mb2dJdGVtcyB8fCAxKSkge1xuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuYmVnaW5Xcml0ZUxvZ3MoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZUxvZ0NoZWNrVGltZW91dCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCB0aGlzLmNvbmZpZy5sb2dQdXNoRnJlcXVlbmN5KVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEhlbHBlciBtZXRob2QgdGhhdCByZWdpc3RlcnMgbGlzdGVuZXJzIGZvciBldmVudHNcbiAgICAgKiByZWxhdGVkIHRvIGltbWluZW50IGFwcGxpY2F0aW9uIHNodXRkb3duIHNvIHRoYXRcbiAgICAgKiBmaW5hbCBsb2dzIGNhbiBiZSBwdXNoZWRcbiAgICAgKi9cbiAgICBwcml2YXRlIHJlZ2lzdGVyQXBwRGVhdGhMb2dQdXNoKCkge1xuICAgICAgICBsZXQgZmluYWxXcml0dGVuID0gZmFsc2U7XG4gICAgICAgIHByb2Nlc3Mub24oJ2V4aXQnLCAoKSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy50aW1lb3V0SWQpIGNsZWFyVGltZW91dCh0aGlzLnRpbWVvdXRJZCk7XG4gICAgICAgICAgICBsZXQgbyA9IGZpbmFsV3JpdHRlbjtcbiAgICAgICAgICAgIGZpbmFsV3JpdHRlbiA9IHRydWU7XG4gICAgICAgICAgICBpZiAobykgcmV0dXJuO1xuXG4gICAgICAgICAgICBpbnRlcm5hbExvZygnaW5mbycsICd3cml0aW5nIGZpbmFsIGxvZ3MnKTtcblxuICAgICAgICAgICAgdGhpcy53cml0ZUxvZ3NTeW5jKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHByb2Nlc3Mub24oJ1NJR0lOVCcsICgpID0+IHtcbiAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgyKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcHJvY2Vzcy5vbigndW5jYXVnaHRFeGNlcHRpb24nLCAoZSkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coZSk7XG4gICAgICAgICAgICBpbnRlcm5hbExvZygnZXJyb3InLCBlLnN0YWNrIHx8ICcnKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcHJvY2Vzcy5vbignU0lHVEVSTScsICgpID0+IHtcbiAgICAgICAgICAgIGlmICh0aGlzLnRpbWVvdXRJZCkgY2xlYXJUaW1lb3V0KHRoaXMudGltZW91dElkKTtcbiAgICAgICAgICAgIHRoaXMud3JpdGVMb2dzU3luYygpO1xuICAgICAgICB9KVxuICAgIH1cbn1cblxuLyoqXG4gKiBSZXBsYWNlcyBleGlzdGluZyB3cml0ZXJzIGZvciBzdGRvdXQgYW5kIHN0ZGVyciB3aXRoXG4gKiBQYXNzVGhyb3VnaCBzdHJlYW1zIHRoYXQgd2lsbCBpbnZva2UgcHJvdmlkZWQgY2FsbGJhY2tzXG4gKiB3aXRoIHRoZSBkYXRhIHByaW9yIHRvIHBhc3NpbmcgdGhlbSB0byB0aGUgb3JpZ2luYWwgc3RyZWFtc1xuICovXG5jbGFzcyBTdGFuZGFyZE91dFBhc3NUaHJvdWdoIHtcblxuXG4gICAgcHJpdmF0ZSByZWFkb25seSBzdGRvdXRQdCA9IG5ldyBQYXNzVGhyb3VnaCgpO1xuICAgIHByaXZhdGUgcmVhZG9ubHkgc3RkZXJyUHQgPSBuZXcgUGFzc1Rocm91Z2goKTtcblxuICAgIHByaXZhdGUgcmVhZG9ubHkgc3Rkb3V0O1xuICAgIHByaXZhdGUgcmVhZG9ubHkgc3RkZXJyO1xuXG4gICAgcHJpdmF0ZSByZWFkb25seSB3cml0ZVN0ZG91dDtcbiAgICBwcml2YXRlIHJlYWRvbmx5IHdyaXRlU3RkZXJyO1xuXG4gICAgY29uc3RydWN0b3Ioc3Rkb3V0Q2I6IChkYXRhOiBzdHJpbmcpID0+IHZvaWQsIHN0ZGVyckNiOiAoZGF0YTogc3RyaW5nKSA9PiB2b2lkKSB7XG4gICAgICAgIC8vIFN0b3JlIG9yaWdpbmFsIHdyaXRlIHN0ZG91dC9zdGRlcnIgd3JpdGUgZnVuY3Rpb25zXG4gICAgICAgIHRoaXMuc3Rkb3V0ID0gcHJvY2Vzcy5zdGRvdXQud3JpdGU7XG4gICAgICAgIHRoaXMuc3RkZXJyID0gcHJvY2Vzcy5zdGRlcnIud3JpdGU7XG5cbiAgICAgICAgLy8gQ3JlYXRlIGZ1bmN0aW9ucyB3aGljaCB3cml0ZSB0byBvcmlnaW5hbCB3cml0ZXMgd2l0aCBzdGRvdXQvc3RkZXJyIGNvbnRleHRzIGJvdW5kXG4gICAgICAgIHRoaXMud3JpdGVTdGRvdXQgPSAoZGF0YTogc3RyaW5nKSA9PiB0aGlzLnN0ZG91dC5jYWxsKHByb2Nlc3Muc3Rkb3V0LCBkYXRhKTtcbiAgICAgICAgdGhpcy53cml0ZVN0ZGVyciA9IChkYXRhOiBzdHJpbmcpID0+IHRoaXMuc3RkZXJyLmNhbGwocHJvY2Vzcy5zdGRlcnIsIGRhdGEpO1xuXG4gICAgICAgIC8vIEFzc2lnbiBsaXN0ZW5lcnMgdG8gUGFzc1Rocm91Z2hzXG4gICAgICAgIHRoaXMuc3Rkb3V0UHQub24oJ2RhdGEnLCAoZGF0YSkgPT4ge1xuICAgICAgICAgICAgaWYgKGRhdGEgaW5zdGFuY2VvZiBCdWZmZXIpIHtcbiAgICAgICAgICAgICAgICBkYXRhID0gZGF0YS50b1N0cmluZygndXRmOCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3Rkb3V0Q2IoZGF0YSk7XG4gICAgICAgICAgICB0aGlzLndyaXRlU3Rkb3V0KGRhdGEpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnN0ZGVyclB0Lm9uKCdkYXRhJywgKGRhdGEpID0+IHtcbiAgICAgICAgICAgIGlmIChkYXRhIGluc3RhbmNlb2YgQnVmZmVyKSB7XG4gICAgICAgICAgICAgICAgZGF0YSA9IGRhdGEudG9TdHJpbmcoJ3V0ZjgnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN0ZGVyckNiKGRhdGEpO1xuICAgICAgICAgICAgdGhpcy53cml0ZVN0ZGVycihkYXRhKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gUmVwbGFjZSBvcmlnaW5hbCB3cml0ZSBjYWxscyB3aXRoIGNvbnRleHRzIGJvdW5kIHRvIHBhcmVudCBvYmplY3RcbiAgICAgICAgcHJvY2Vzcy5zdGRvdXQud3JpdGUgPSB0aGlzLnN0ZG91dFB0LndyaXRlLmJpbmQodGhpcy5zdGRvdXRQdCkgYXMgYW55O1xuICAgICAgICBwcm9jZXNzLnN0ZGVyci53cml0ZSA9IHRoaXMuc3RkZXJyUHQud3JpdGUuYmluZCh0aGlzLnN0ZGVyclB0KSBhcyBhbnk7XG5cbiAgICAgICAgLy8gQWRkIHVuY2F1Z2h0IGVycm9yIGhhbmRsZXIgdG8gaGFuZGxlIGxvZ2dpbmcgb2YgZmFpbHVyZSBjYXNlXG4gICAgICAgIHByb2Nlc3Mub24oJ3VuY2F1Z2h0RXhjZXB0aW9uJywgKGVycikgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZWFmZml4IHRoZSByZXBsYWNlZCBzdGRvdXQgYW5kIHN0ZGVyciB0aGVuXG4gICAgICogY2xvc2VzIGFsbCBzdHJlYW1zIG93bmVkIGJ5IHRoaXMgaW5zdGFuY2UuXG4gICAgICovXG4gICAgcHVibGljIGRlc3Ryb3koKSB7XG4gICAgICAgIHByb2Nlc3Muc3Rkb3V0LndyaXRlID0gdGhpcy5zdGRvdXQ7XG4gICAgICAgIHByb2Nlc3Muc3RkZXJyLndyaXRlID0gdGhpcy5zdGRlcnI7XG5cbiAgICAgICAgdGhpcy5zdGRvdXRQdC5kZXN0cm95KClcbiAgICAgICAgdGhpcy5zdGRlcnJQdC5kZXN0cm95KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQnlwYXNzIHRoZSBjb25maWd1cmVkIGNhbGxiYWNrIGZ1bmN0aW9uIGZvciBzdGRvdXQgYnlcbiAgICAgKiB3cml0aW5nIGRpcmVjdGx5IHRvIHRoZSBkZXRhY2hlZCBvdXRwdXQgc3RyZWFtXG4gICAgICogQHBhcmFtIGRhdGEgXG4gICAgICovXG4gICAgcHVibGljIHN0ZG91dEJ5cGFzcyhkYXRhOiBzdHJpbmcgfCBvYmplY3QpIHtcbiAgICAgICAgaWYgKGRhdGEgaW5zdGFuY2VvZiBPYmplY3QpIHtcbiAgICAgICAgICAgIGRhdGEgPSBKU09OLnN0cmluZ2lmeShkYXRhKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLndyaXRlU3Rkb3V0KChkYXRhIGFzIHVua25vd24gYXMgc3RyaW5nKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQnlwYXNzIHRoZSBjb25maWd1cmVkIGNhbGxiYWNrIGZ1bmN0aW9uIGZvciBzdGRlcnIgYnlcbiAgICAgKiB3cml0aW5nIGRpcmVjdGx5IHRvIHRoZSBkZXRhY2hlZCBvdXRwdXQgc3RyZWFtXG4gICAgICogQHBhcmFtIGRhdGEgXG4gICAgICovXG4gICAgcHVibGljIHN0ZGVyckJ5cGFzcyhkYXRhOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy53cml0ZVN0ZGVycihkYXRhKTtcbiAgICB9XG59XG5cblxuLyoqXG4gKiBMYXp5IGxvYWQgbG9nZ2VyLCB3cml0ZSBidWZmZXJlZCBtZXNzYWdlcyBvbmNlIGxvYWRlZFxuICogTm90ZTogTGF6eSBsb2FkaW5nIGlzIG5lY2Vzc2FyeSB0byByZXNvbHZlIGNpcmN1bGFyIGRlcGVuZGVuY2llcyBiZXR3ZWVuIHRoaXNcbiAqIG1vZHVsZSBhbmQgdGhlIGxvZ2dlci5cbiAqL1xuKGFzeW5jICgpID0+IHtcbiAgICBjb25zdCB7IHdpdGhMb2dnZXIgfSA9IGF3YWl0IGltcG9ydCgnLi9sb2dnZXInKTtcbiAgICBjb25zdCBsZXZlbDogTlBNTG9nZ2luZ0xldmVscyA9IHByb2Nlc3MuZW52LkxPR19ERUxJVkVSWV9BR0VOVF9MRVZFTCBhcyBOUE1Mb2dnaW5nTGV2ZWxzIHx8ICd3YXJuJztcbiAgICBsb2cgPSB3aXRoTG9nZ2VyKCdOZXdSZWxpY0xvZ0ZvcndhcmRlcicsIGxldmVsKTtcbiAgICB3aGlsZShpbnRlcm5hbExvZ0J1ZmZlci5sZW5ndGgpIHtcbiAgICAgICAgY29uc3QgW2xldmVsLCBtZXNzYWdlXSA9IGludGVybmFsTG9nQnVmZmVyLnNoaWZ0KCkgYXMgW3N0cmluZywgc3RyaW5nXTtcbiAgICAgICAgKGxvZyBhcyBhbnkpW2xldmVsXShtZXNzYWdlKTtcbiAgICB9XG59KSgpO1xuIl19