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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9Mb2dEZWxpdmVyeUFnZW50LnRzIl0sIm5hbWVzIjpbIkFQSV9IT1NUTkFNRSIsInByb2Nlc3MiLCJlbnYiLCJLTF9OUl9MT0dfSE9TVE5BTUUiLCJBUElfUEFUSCIsIktMX05SX0xPR19QQVRIIiwiTUFYX1BBWUxPQURfU0laRSIsIk1BWF9BVFRSSUJVVEVTX1BFUl9FVkVOVCIsIk1BWF9BVFRSSUJVVEVfTkFNRV9MRU5HVEgiLCJNQVhfQVRUUklCVVRFX1ZBTFVFX0xFTkdUSCIsImxvZyIsImludGVybmFsTG9nQnVmZmVyIiwiaW50ZXJuYWxMb2ciLCJsZXZlbCIsIm1lc3NhZ2UiLCJwdXNoIiwiZGVmYXVsdENvbmZpZyIsImJ5dGVzV3JpdHRlblRocmVzaG9sZCIsIndhcm5PbkF0dHJpYnV0ZUxlbmd0aE92ZXJmbG93IiwibWluQnl0ZXNXcml0dGVuIiwibWluTG9nSXRlbXMiLCJsb2dQdXNoRnJlcXVlbmN5IiwibWluTG9nSXRlbXNUb0ZvcmNlIiwiTmV3UmVsaWNMb2dEZWxpdmVyeUFnZW50IiwiREVCVUdfV1JJVEVfTE9HU19UT19GSUxFIiwiY29uZmlnIiwibG9nUXVldWUiLCJuZXdSZWxpY0xvZ1RyYW5zcG9ydCIsIk5ld1JlbGljTG9nVHJhbnNwb3J0IiwiY2IiLCJhZGRMb2ciLCJsb2dDYWxsYmFjayIsImVyckNhbGxiYWNrIiwibGFiZWwiLCJzdGFuZGFyZE91dFBhc3NUaHJvdWdoIiwiU3RhbmRhcmRPdXRQYXNzVGhyb3VnaCIsInJlZ2lzdGVyQXBwRGVhdGhMb2dQdXNoIiwiY3JlYXRlTG9nQ2hlY2tUaW1lb3V0IiwidGltZW91dElkIiwiY2xlYXJUaW1lb3V0IiwiZGVzdHJveSIsImNsb3NlIiwid3JpdGVMb2dzU3luYyIsInN0ciIsIkpTT04iLCJzdHJpbmdpZnkiLCJvYmoiLCJwYXJzZSIsImVyciIsImNhbGxiYWNrIiwianNvbkRhdGEiLCJpc05SQ29tcGF0aWJsZUpzb25Mb2dTdHJpbmciLCJwcm9jZXNzQXNKc29uTG9nIiwicHJvY2Vzc0FzU3RyaW5nTG9nIiwiaW1tZWRpYXRlTG9nV3JpdGFibGVQcmVkaWNhdGUiLCJiZWdpbldyaXRlTG9ncyIsInN0ZGVyckJ5cGFzcyIsInN0ZG91dEJ5cGFzcyIsImxvZ1RyYW5zZm9ybSIsImxvZ1N0cmluZyIsImxlbmd0aCIsIkJ1ZmZlciIsImJ5dGVMZW5ndGgiLCJsb2dMZW5ndGhRdWV1ZSIsInRvdGFsTGVuZ3RoQ291bnQiLCJlbmRzV2l0aCIsInN1YnN0cmluZyIsIm5ld1JlbGljTWV0YWRhdGEiLCJuZXdyZWxpYyIsImdldExpbmtpbmdNZXRhZGF0YSIsInN0cnVjdHVyZWRMb2ciLCJ0aW1lc3RhbXAiLCJEYXRlIiwibm93Iiwib3JpZ2luYWxfdGltZXN0YW1wIiwidG9JU09TdHJpbmciLCJob3N0bmFtZSIsImpzb25Mb2dTdHJpbmciLCJhdHRyaWJ1dGVzIiwiZ2xvYmFsQXR0cmlidXRlcyIsImxvZ3NUb1dyaXRlIiwic2xpY2VMb2dzIiwicmF3UGF5bG9hZCIsImJ1aWxkUmF3UG9zdEJvZHkiLCJjb21wcmVzc2VkUGF5bG9hZCIsInpsaWIiLCJnemlwU3luYyIsImRlYnVnTW9kZSIsInNlbmRMb2dzIiwid3JpdGVMb2dzVG9GaWxlU3lzdGVtIiwiYnVmZmVyIiwiZnMiLCJ3cml0ZUZpbGVTeW5jIiwibG9nc1dyaXR0ZW4iLCJjb21wcmVzc1BheWxvYWQiLCJmYWxsYmFja01lc3NhZ2UiLCJFcnJvciIsInN0YWNrIiwiQXhpb3MiLCJwb3N0IiwiaGVhZGVycyIsIk5FV19SRUxJQ19MSUNFTlNFX0tFWSIsInRoZW4iLCJyZXNwb25zZSIsImluY2x1ZGVzIiwic3RhdHVzIiwiZGF0YSIsInJlcXVlc3RJZCIsImxvZ3MiLCJwYXlsb2FkIiwiY29tbW9uIiwic2VydmljZSIsIk5FV19SRUxJQ19BUFBfTkFNRSIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwiZ3ppcCIsImZyb20iLCJsb2dzVG9TZW5kIiwibG9nU2l6ZSIsImxvZ1NsaWNlSW5kZXgiLCJzbGljZSIsIm1pbkxvZ0l0ZW1zRXhjZWVkZWQiLCJPYmplY3QiLCJnZXRPd25Qcm9wZXJ0eU5hbWVzIiwia2V5cyIsImtleSIsInZhbHVlIiwibmV3S2V5IiwiZGVmaW5lUHJvcGVydHkiLCJnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IiLCJyZXBsYWNlQWxsIiwic2V0VGltZW91dCIsImZpbmFsV3JpdHRlbiIsIm9uIiwibyIsImV4aXQiLCJlIiwiY29uc29sZSIsImluc3RhbmNlIiwic3Rkb3V0Q2IiLCJzdGRlcnJDYiIsIlBhc3NUaHJvdWdoIiwic3Rkb3V0Iiwid3JpdGUiLCJzdGRlcnIiLCJ3cml0ZVN0ZG91dCIsImNhbGwiLCJ3cml0ZVN0ZGVyciIsInN0ZG91dFB0IiwidG9TdHJpbmciLCJzdGRlcnJQdCIsImJpbmQiLCJlcnJvciIsIndpdGhMb2dnZXIiLCJMT0dfREVMSVZFUllfQUdFTlRfTEVWRUwiLCJzaGlmdCJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUdBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVBLElBQU1BLFlBQVksR0FBR0MsT0FBTyxDQUFDQyxHQUFSLENBQVlDLGtCQUFaLElBQWtDLHlCQUF2RDtBQUNBLElBQU1DLFFBQVEsR0FBR0gsT0FBTyxDQUFDQyxHQUFSLENBQVlHLGNBQVosSUFBOEIsU0FBL0M7QUFDQSxJQUFNQyxnQkFBZ0IsWUFBRyxFQUFILEVBQU8sQ0FBUCxDQUF0QjtBQUNBLElBQU1DLHdCQUF3QixHQUFHLEdBQWpDO0FBQ0EsSUFBTUMseUJBQXlCLEdBQUcsR0FBbEM7QUFDQSxJQUFNQywwQkFBMEIsR0FBRyxJQUFuQztBQUVBLElBQUlDLEdBQUo7QUFDQSxJQUFJQyxpQkFBMEMsR0FBRyxFQUFqRDtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUNBLFNBQVNDLFdBQVQsQ0FBcUJDLEtBQXJCLEVBQW9DQyxPQUFwQyxFQUFxRDtBQUNqRCxNQUFJSixHQUFKLEVBQVM7QUFD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QUM5QixXQUFLMEMsV0FBTCxDQUFpQjFDLElBQWpCO0FBQ0g7Ozs7O0FBSUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBQ0Esd0RBQUM7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxtREFDdUMsVUFEdkM7QUFBQTs7QUFBQTtBQUFBO0FBQ1dnRCxVQUFBQSxVQURYLGlCQUNXQSxVQURYO0FBRVM3SSxVQUFBQSxLQUZULEdBRW1DWixPQUFPLENBQUNDLEdBQVIsQ0FBWXlKLHdCQUFaLElBQTRELE1BRi9GO0FBR0dqSixVQUFBQSxHQUFHLEdBQUdnSixVQUFVLENBQUMsc0JBQUQsRUFBeUI3SSxLQUF6QixDQUFoQjs7QUFDQSxpQkFBTUYsaUJBQWlCLENBQUNpRCxNQUF4QixFQUFnQztBQUFBLG9CQUNIakQsaUJBQWlCLENBQUNpSixLQUFsQixFQURHLG9DQUNyQi9JLE1BRHFCLGFBQ2RDLE9BRGM7O0FBRTNCSixZQUFBQSxHQUFELENBQWFHLE1BQWIsRUFBb0JDLE9BQXBCO0FBQ0g7O0FBUEo7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsQ0FBRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgaHR0cHMsIHsgcmVxdWVzdCB9IGZyb20gJ2h0dHAnO1xuaW1wb3J0IG5ld3JlbGljIGZyb20gJ25ld3JlbGljJztcbmltcG9ydCB6bGliIGZyb20gJ3psaWInO1xuaW1wb3J0IHsgTmV3UmVsaWNMb2dUcmFuc3BvcnQgfSBmcm9tICcuL05ld1JlbGljTG9nVHJhbnNwb3J0JztcbmltcG9ydCB7IFBhc3NUaHJvdWdoLCBSZWFkYWJsZSB9IGZyb20gJ3N0cmVhbSc7XG5pbXBvcnQgeyBMb2dnZXIgfSBmcm9tICd3aW5zdG9uJztcbmltcG9ydCB7IE5QTUxvZ2dpbmdMZXZlbHMgfSBmcm9tICcuL2xvZ2dlcic7XG5pbXBvcnQgQXhpb3MgZnJvbSAnYXhpb3MnO1xuXG5jb25zdCBBUElfSE9TVE5BTUUgPSBwcm9jZXNzLmVudi5LTF9OUl9MT0dfSE9TVE5BTUUgfHwgJ2xvZy1hcGkuZXUubmV3cmVsaWMuY29tJztcbmNvbnN0IEFQSV9QQVRIID0gcHJvY2Vzcy5lbnYuS0xfTlJfTE9HX1BBVEggfHwgJy9sb2cvdjEnO1xuY29uc3QgTUFYX1BBWUxPQURfU0laRSA9IDEwKio2O1xuY29uc3QgTUFYX0FUVFJJQlVURVNfUEVSX0VWRU5UID0gMjU1O1xuY29uc3QgTUFYX0FUVFJJQlVURV9OQU1FX0xFTkdUSCA9IDI1NTtcbmNvbnN0IE1BWF9BVFRSSUJVVEVfVkFMVUVfTEVOR1RIID0gNDA5NjtcblxubGV0IGxvZzogTG9nZ2VyIHwgdW5kZWZpbmVkO1xubGV0IGludGVybmFsTG9nQnVmZmVyOiBBcnJheTxbc3RyaW5nLCBzdHJpbmddPiA9IFtdO1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHdyaXRlIGxvZ3MgdGhhdCBhcmUgaW50ZXJuYWwgdG8gdGhpcyBtb2R1bGUuXG4gKiBCdWZmZXJzIGNhbGxzIHVudGlsIHRoZSBXaW5zdG9uIGxvZ2dlciBjYW4gYmUgYXN5bmMgaW1wb3J0ZFxuICogQWZ0ZXJ3b3Jkcywgd3JpdGVzIGxvZ3MgZGlyZWN0bHkgdG8gdGhlIGxvZ2dlclxuICogQHBhcmFtIGxldmVsIFxuICogQHBhcmFtIG1lc3NhZ2UgXG4gKi9cbmZ1bmN0aW9uIGludGVybmFsTG9nKGxldmVsOiBzdHJpbmcsIG1lc3NhZ2U6IHN0cmluZykge1xuICAgIGlmIChsb2cpIHtcbiAgICAgICAgKGxvZyBhcyBhbnkpW2xldmVsXShtZXNzYWdlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBpbnRlcm5hbExvZ0J1ZmZlci5wdXNoKFtsZXZlbCwgbWVzc2FnZV0pO1xuICAgIH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBOZXdSZWxpY0xvZ0RlbGl2ZXJ5QWdlbnRDb25maWcge1xuICAgIC8qKlxuICAgICAqIEhvdyBmcmVxdWVudGx5IGNoZWNrcyBzaG91bGQgYmUgcnVuIHRvIHB1c2ggbG9ncyB0byBOUlxuICAgICAqIERlZmF1bHQgaXMgMTAgc2Vjb25kc1xuICAgICAqL1xuICAgICBsb2dQdXNoRnJlcXVlbmN5PzogbnVtYmVyO1xuXG4gICAgIC8qKlxuICAgICAgKiBNaW5pbXVtIG51bWJlciBvZiBsb2cgc3RhdGVtZW50cyB3cml0dGVuIGJlZm9yZSBsb2dzIGNhbiBiZSBwdXNoZWQgdG8gTlJcbiAgICAgICogYnkgcGVyaW9kaWMgbG9nZ2VyLlxuICAgICAgKiBEZWZhdWx0IGlzIDJcbiAgICAgICovXG4gICAgIG1pbkxvZ0l0ZW1zPzogbnVtYmVyO1xuIFxuIFxuICAgICAvKipcbiAgICAgICogTWluaW11bSBudW1iZXIgb2YgbG9nIHN0YXRlbWVudHMgdG8gZm9yY2UgYW4gaW1tZWRpYXRlIHB1c2ggdG8gTlIuIFVzZWRcbiAgICAgICogdG8gZW5zdXJlIHRoYXQgdGhlIGxvZ2dpbmcgc3lzdGVtIGRvZXMgbm90IGdldCBiYWNrZWQgdXAgaWYgYW1vdW50IGJlaW5nXG4gICAgICAqIGxvZ2dlZCBzdXJwYXNzZXMgdGhlIGJhbmR3aWR0aCBvZiB0aGUgcGVyaW9kaWMgbG9nZ2VyLlxuICAgICAgKiBEZWZhdWx0IGlzIDEwMC5cbiAgICAgICovXG4gICAgIG1pbkxvZ0l0ZW1zVG9Gb3JjZT86IG51bWJlcjtcblxuIFxuICAgICAvKipcbiAgICAgICogTWluaW11bSBudW1iZXIgb2YgYnl0ZXMgd3JpdHRlbiB0byBjb21wcmVzc2lvbiBzdHJlYW0gYmVmb3JlIHB1c2hpbmcgdG8gTlJcbiAgICAgICovXG4gICAgIG1pbkJ5dGVzV3JpdHRlbj86IG51bWJlcjtcbiBcbiAgICAgLyoqXG4gICAgICAqIFRocmVzaG9sZCBmb3IgYnl0ZXMgd3JpdHRlbiBhdCB3aGljaCBwb2ludCBhIG5ldyB3cml0ZSB0byBOUiB3aWxsIGJlIGF1dG9tYXRpY2FsbHlcbiAgICAgICogdHJpZ2dlcmVkLiBEZWZhdWx0cyB0byAoNC81ICogTUFYX1BBWUxPQURfU0laRSlcbiAgICAgICovXG4gICAgIGJ5dGVzV3JpdHRlblRocmVzaG9sZD86IG51bWJlcjtcbiBcbiAgICAgLyoqXG4gICAgICAqIFByb2R1Y2UgYSB3YXJuaW5nIHdoZW4gYXR0cmlidXRlIHZhbHVlcyBvdmVyZmxvdyB0aGUgTlIgbWF4aW11bSBsZW5ndGggb2YgNDA5Ni5cbiAgICAgICogRGVmYXVsdCBpcyBmYWxzZS5cbiAgICAgICovXG4gICAgIHdhcm5PbkF0dHJpYnV0ZUxlbmd0aE92ZXJmbG93PzogYm9vbGVhbjtcbn1cblxuY29uc3QgZGVmYXVsdENvbmZpZzogTmV3UmVsaWNMb2dEZWxpdmVyeUFnZW50Q29uZmlnID0ge1xuICAgIGJ5dGVzV3JpdHRlblRocmVzaG9sZDogTUFYX1BBWUxPQURfU0laRSAqIDQgLyA1LFxuICAgIHdhcm5PbkF0dHJpYnV0ZUxlbmd0aE92ZXJmbG93OiBmYWxzZSxcbiAgICBtaW5CeXRlc1dyaXR0ZW46IE1BWF9QQVlMT0FEX1NJWkUgKiAxIC8gNSxcbiAgICBtaW5Mb2dJdGVtczogMixcbiAgICBsb2dQdXNoRnJlcXVlbmN5OiA2MDAwMCxcbiAgICBtaW5Mb2dJdGVtc1RvRm9yY2U6IDEwMCxcbn1cblxuZXhwb3J0IGNsYXNzIE5ld1JlbGljTG9nRGVsaXZlcnlBZ2VudCB7XG4gXG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6ZXMgYSBOZXdSZWxpY0xvZ0RlbGl2ZXJ5QWdlbnQgaW5zdGFuY2UgaWYgdGhlIExPR19TVFlMRSBlbnZpcm9ubWVudFxuICAgICAqIHZhcmlhYmxlIGlzIHNldCB0byBORVdfUkVMSUMuIE90aGVyd2lzZSBpdCBkb2VzIG5vdGhpbmcuXG4gICAgICogQHBhcmFtIGNvbmZpZyBcbiAgICAgKiBAcmV0dXJucyBcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGluaXRpYWxpemUoKSB7XG4gICAgICAgIGlmICghcHJvY2Vzcy5lbnYuTkVXX1JFTElDX0xJQ0VOU0VfS0VZKSByZXR1cm47XG4gICAgICAgIE5ld1JlbGljTG9nRGVsaXZlcnlBZ2VudC5pbnN0YW5jZSA9IG5ldyBOZXdSZWxpY0xvZ0RlbGl2ZXJ5QWdlbnQoKTtcbiAgICAgICAgcmV0dXJuIE5ld1JlbGljTG9nRGVsaXZlcnlBZ2VudC5pbnN0YW5jZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIGdldEluc3RhbmNlKCkge1xuICAgICAgICByZXR1cm4gTmV3UmVsaWNMb2dEZWxpdmVyeUFnZW50Py5pbnN0YW5jZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIGNvbmZpZ3VyZShjb25maWc6IE5ld1JlbGljTG9nRGVsaXZlcnlBZ2VudENvbmZpZykge1xuICAgICAgICBjb25zdCBpbnN0YW5jZSA9IE5ld1JlbGljTG9nRGVsaXZlcnlBZ2VudC5pbnN0YW5jZTtcbiAgICAgICAgaWYgKCFpbnN0YW5jZSkge1xuICAgICAgICAgICAgaW50ZXJuYWxMb2coJ3dhcm4nLCAnQ29uZmlndXJlIGNhbGxlZCBiZWZvcmUgaW5zdGFuY2UgaW5pdGlhbGl6YXRpb24uIENvbmZpZ3VyYXRpb24gbm90IGFwcGxpZWQnKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpbnN0YW5jZS5jb25maWcgPSB7XG4gICAgICAgICAgICAuLi5pbnN0YW5jZS5jb25maWcsXG4gICAgICAgICAgICAuLi5jb25maWdcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0V2luc3RvblRyYW5zcG9ydCgpIHtcbiAgICAgICAgcmV0dXJuIE5ld1JlbGljTG9nRGVsaXZlcnlBZ2VudD8uaW5zdGFuY2U/LmxvZ1RyYW5zZm9ybTtcbiAgICB9XG4gICAgXG4gICAgcHJpdmF0ZSBzdGF0aWMgaW5zdGFuY2U6IE5ld1JlbGljTG9nRGVsaXZlcnlBZ2VudDtcbiAgICBwcml2YXRlIGxvZ1F1ZXVlOiBhbnlbXSA9IFtdO1xuICAgIHByaXZhdGUgY29uZmlnOiBOZXdSZWxpY0xvZ0RlbGl2ZXJ5QWdlbnRDb25maWc7XG4gICAgcHJpdmF0ZSBsb2dMZW5ndGhRdWV1ZTogbnVtYmVyW10gPSBbXTtcbiAgICBwcml2YXRlIHRvdGFsTGVuZ3RoQ291bnQgPSAwO1xuICAgIHByaXZhdGUgZ2xvYmFsQXR0cmlidXRlczoge1trZXk6IHN0cmluZ106IHN0cmluZ30gPSB7fTtcbiAgICBwcml2YXRlIG5ld1JlbGljTG9nVHJhbnNwb3J0OiBOZXdSZWxpY0xvZ1RyYW5zcG9ydDtcbiAgICBwcml2YXRlIGRlYnVnTW9kZSA9IHByb2Nlc3MuZW52LkRFQlVHX1dSSVRFX0xPR1NfVE9fRklMRSA9PT0gJ3RydWUnO1xuICAgIHByaXZhdGUgdGltZW91dElkOiBOb2RlSlMuVGltZW91dCB8IHVuZGVmaW5lZDtcbiAgICBwcml2YXRlIGxvZ3NXcml0dGVuID0gMDtcbiAgICBcbiAgICBwdWJsaWMgc3RhbmRhcmRPdXRQYXNzVGhyb3VnaDogU3RhbmRhcmRPdXRQYXNzVGhyb3VnaDtcbiAgICBcbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBpbnRlcm5hbExvZygnZGVidWcnLCAnSW5pdGlhbGl6aW5nIExvZ0RlbGl2ZXJ5QWdlbnQnKTtcbiAgICAgICAgdGhpcy5jb25maWcgPSB7IC4uLmRlZmF1bHRDb25maWcgfTtcblxuICAgICAgICB0aGlzLmxvZ1F1ZXVlLnB1c2goYENyZWF0aW5nIE5ld1JlbGljTG9nVHJhbnNwb3J0YCk7XG4gICAgICAgIHRoaXMubmV3UmVsaWNMb2dUcmFuc3BvcnQgPSBuZXcgTmV3UmVsaWNMb2dUcmFuc3BvcnQoKGxvZywgY2IpID0+IHRoaXMuYWRkTG9nKGxvZywgY2IpKTtcblxuICAgICAgICAvLyBDcmVhdGVzIGxvZ2dpbmcgY29uZmlndXJhdGlvbiBmb3IgcmV3cml0aW5nIHN0ZG91dC9zdGRlcnJcbiAgICAgICAgY29uc3QgbG9nQ2FsbGJhY2sgPSAobG9nOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgIHRoaXMuYWRkTG9nKGxvZywgKCkgPT4ge30pO1xuICAgICAgICB9O1xuICAgIFxuICAgICAgICBjb25zdCBlcnJDYWxsYmFjayA9IChsb2c6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgdGhpcy5hZGRMb2coe1xuICAgICAgICAgICAgICAgIGxhYmVsOiAnZXJyb3InLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGxvZ1xuICAgICAgICAgICAgfSwgKCkgPT4ge30pO1xuICAgICAgICB9O1xuICAgIFxuICAgICAgICB0aGlzLnN0YW5kYXJkT3V0UGFzc1Rocm91Z2ggPSBuZXcgU3RhbmRhcmRPdXRQYXNzVGhyb3VnaChsb2dDYWxsYmFjaywgZXJyQ2FsbGJhY2spO1xuICAgICAgICB0aGlzLnJlZ2lzdGVyQXBwRGVhdGhMb2dQdXNoKCk7XG4gICAgICAgIHRoaXMuY3JlYXRlTG9nQ2hlY2tUaW1lb3V0KCk7XG4gICAgICAgIGludGVybmFsTG9nKCdkZWJ1ZycsICdMb2dEZWxpdmVyeUFnZW50IEluaXRpYWxpemVkJylcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBY2Nlc3NvciBmb3IgV2luc3RvbiBUcmFuc3BvcnQgdGhhdCB3cml0ZXMgdG8gdGhpcyBcbiAgICAgKiBhZ2VudCBpbnN0YW5jZVxuICAgICAqIEByZXR1cm5zIHdpbnN0b24udHJhbnNwb3J0XG4gICAgICovXG4gICAgcHVibGljIGdldExvZ1RyYW5zcG9ydCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubmV3UmVsaWNMb2dUcmFuc3BvcnQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2h1dHNkb3duIHRoZSBkZWxpdmVyeSBhZ2VudC4gVGhpcyBjYW4gYmUgdXRpbGl6ZWQgd2hlbiBhcHAgaXMgZXhwZWN0ZWQgdG8gc2h1dGRvd25cbiAgICAgKiBhdCBhIGdpdmVuIHRpbWUgYW5kIHRoZSBwZXJpb2RpYyBkZWxpdmVyeSB0aW1lb3V0IGlzIGJsb2NraW5nIHNodXRkb3duLlxuICAgICAqIFxuICAgICAqIENsZWFycyBpbnRlcm5hbCB0aW1lb3V0LCBjb25maWd1cmVzIHdpbnN0b24gdHJhbnNwb3J0IHRvIG5vdCBzZW5kIGxvZ3MuXG4gICAgICogUmVjb25uZWN0cyBzdGRvdXQgYW5kIHN0ZGVyci5cbiAgICAgKiBXcml0ZXMgYW55IHJlbWFpbmluZyBsb2dzLlxuICAgICAqL1xuICAgIHB1YmxpYyBzaHV0ZG93bigpIHtcbiAgICAgICAgaW50ZXJuYWxMb2coJ2RlYnVnJywgJ1NodXRkb3duIG9mIExvZ0RlbGl2ZXJ5QWdlbnQgdHJpZ2dlcmVkJyk7XG4gICAgICAgIGlmICh0aGlzLnRpbWVvdXRJZCkgY2xlYXJUaW1lb3V0KHRoaXMudGltZW91dElkKTtcbiAgICAgICAgdGhpcy5zdGFuZGFyZE91dFBhc3NUaHJvdWdoLmRlc3Ryb3koKTtcbiAgICAgICAgdGhpcy5uZXdSZWxpY0xvZ1RyYW5zcG9ydC5jbG9zZSgpO1xuICAgICAgICB0aGlzLndyaXRlTG9nc1N5bmMoKTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIERldGVybWluZSBpZiB0aGUgbG9nIHN0cmluZyBvciBvYmplY3QgaXMgYSBOZXcgUmVsaWMgXG4gICAgICogY29tcGF0aWJsZSBKU09OLiBJbiBvcmRlciB0byBiZSBjb25zaWRlcmVkIHRoaXMgaXQgbXVzdFxuICAgICAqIGJlIGEgd2VsbCBzdHJ1Y3R1cmVkIEpTT04gb2JqZWN0IHdpdGggYSB0b3AgbGV2ZWwgJ21lc3NhZ2UnXG4gICAgICogYW5kICdsZXZlbCcgcHJvcGVydHkuXG4gICAgICogQHBhcmFtIHN0ciBcbiAgICAgKiBAcmV0dXJucyBvYmplY3QgZm9ybSBvZiBKU09OIG9yIGZhbHNlXG4gICAgICovXG4gICAgcHJpdmF0ZSBpc05SQ29tcGF0aWJsZUpzb25Mb2dTdHJpbmcoc3RyOiBzdHJpbmcgfCBvYmplY3QpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBzdHIgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICBzdHIgPSBKU09OLnN0cmluZ2lmeShzdHIpO1xuICAgICAgICB9XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBvYmogPSBKU09OLnBhcnNlKHN0ciBhcyBzdHJpbmcpO1xuICAgICAgICAgICAgaWYgKG9iaiAmJiB0eXBlb2Ygb2JqID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKG9iai5tZXNzYWdlICYmIG9iai5sZXZlbCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7IH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEludGVybmFsIGZ1bmN0aW9uIHVzZWQgdG8gYWNjZXB0IGxvZyBzdGF0ZW1lbnRzIGFuZFxuICAgICAqIHByb2Nlc3MgdGhlbS4gTG9nIGlzIHR5cGVkIHRvIGFueSB0byBmaXQgdHlwaW5nIGZvclxuICAgICAqIHRoZSBXaW5zdG9uIHRyYW5zcG9ydC5cbiAgICAgKiBcbiAgICAgKiBUT0RPOiBSZXdvcmsgdGhlIFdpbnN0b24gdHJhbnNwb3J0IGxvZ2ljIHRvIGRvIGEgYml0XG4gICAgICogICAgICBtb3JlIHdvcmsgdG8gcHJvdmlkZSBtb3JlIGNvbnNpc3RlbnQgdHlwaW5nLlxuICAgICAqIFxuICAgICAqIEBwYXJhbSBsb2cgXG4gICAgICogQHBhcmFtIGNhbGxiYWNrIFxuICAgICAqL1xuICAgIHByaXZhdGUgYWRkTG9nKGxvZzogYW55LCBjYWxsYmFjazogKCgpID0+IHZvaWQpIHwgdW5kZWZpbmVkKSB7XG4gICAgICAgIGNvbnN0IGpzb25EYXRhID0gdGhpcy5pc05SQ29tcGF0aWJsZUpzb25Mb2dTdHJpbmcobG9nKTtcbiAgICAgICAgaWYoanNvbkRhdGEpIHtcbiAgICAgICAgICAgIHRoaXMucHJvY2Vzc0FzSnNvbkxvZyhqc29uRGF0YSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnByb2Nlc3NBc1N0cmluZ0xvZyhsb2cpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuaW1tZWRpYXRlTG9nV3JpdGFibGVQcmVkaWNhdGUoKSkge1xuICAgICAgICAgICAgdGhpcy5iZWdpbldyaXRlTG9ncygpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGpzb25EYXRhKSBsb2cgPSBKU09OLnN0cmluZ2lmeShsb2cpKydcXG4nO1xuICAgIFxuICAgICAgICBpZiAoanNvbkRhdGE/Lm1lc3NhZ2UgJiYganNvbkRhdGE/LmxldmVsID09PSAnZXJyb3InKSB7XG4gICAgICAgICAgICB0aGlzLnN0YW5kYXJkT3V0UGFzc1Rocm91Z2guc3RkZXJyQnlwYXNzKGxvZyk7XG4gICAgICAgIH0gZWxzZSBpZihqc29uRGF0YS5tZXNzYWdlKSB7XG4gICAgICAgICAgICB0aGlzLnN0YW5kYXJkT3V0UGFzc1Rocm91Z2guc3Rkb3V0QnlwYXNzKGxvZyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY2FsbGJhY2spIGNhbGxiYWNrKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSGFuZGxlciBmb3IgcHJvY2Vzc2luZyBhIGxvZyBzdGF0ZW1lbnQgd2hlbiBpdCBpcyBmb3JtYXR0ZWRcbiAgICAgKiBhcyBhIE5ldyBSZWxpYyBjb21wYXRpYmxlIEpTT04gc3RyaW5nLlxuICAgICAqIEBwYXJhbSBsb2cgXG4gICAgICovXG4gICAgcHJvY2Vzc0FzSnNvbkxvZyhsb2c6IGFueSkge1xuICAgICAgICB0aGlzLmxvZ1RyYW5zZm9ybShsb2cpO1xuICAgICAgICBjb25zdCBsb2dTdHJpbmcgPSBKU09OLnN0cmluZ2lmeShsb2cpO1xuICAgICAgICBjb25zdCBsZW5ndGggPSBCdWZmZXIuYnl0ZUxlbmd0aChsb2dTdHJpbmcpO1xuICAgICAgICB0aGlzLmxvZ1F1ZXVlLnB1c2gobG9nKTtcbiAgICAgICAgdGhpcy5sb2dMZW5ndGhRdWV1ZS5wdXNoKGxlbmd0aCk7XG4gICAgICAgIHRoaXMudG90YWxMZW5ndGhDb3VudCArPSBsZW5ndGg7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSGFuZGxlciBmb3IgcHJvY2Vzc2luZyBhIGxvZyBzdGF0ZW1lbnQgdGhhdCBpcyBhIHNpbXBsZVxuICAgICAqIHN0cmluZyBmb3JtYXQuXG4gICAgICogQHBhcmFtIGxvZyBcbiAgICAgKi9cbiAgICBwcm9jZXNzQXNTdHJpbmdMb2cobG9nOiBzdHJpbmcpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBsb2cgPT09ICdzdHJpbmcnICYmIGxvZy5lbmRzV2l0aCgnXFxuJykpIHtcbiAgICAgICAgICAgIGxvZyA9IGxvZy5zdWJzdHJpbmcoMCwgbG9nLmxlbmd0aCAtIDEpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG5ld1JlbGljTWV0YWRhdGEgPSBuZXdyZWxpYy5nZXRMaW5raW5nTWV0YWRhdGEoKTtcbiAgICAgICAgY29uc3Qgc3RydWN0dXJlZExvZyA9IHtcbiAgICAgICAgICAgIG1lc3NhZ2U6IGxvZyxcbiAgICAgICAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcbiAgICAgICAgICAgIG9yaWdpbmFsX3RpbWVzdGFtcDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgICAgICAgXCJlbnRpdHkubmFtZVwiOiBuZXdSZWxpY01ldGFkYXRhWydlbnRpdHkubmFtZSddLFxuICAgICAgICAgICAgXCJlbnRpdHkudHlwZVwiOiBuZXdSZWxpY01ldGFkYXRhWydlbnRpdHkudHlwZSddLFxuICAgICAgICAgICAgaG9zdG5hbWU6IG5ld1JlbGljTWV0YWRhdGEuaG9zdG5hbWVcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGpzb25Mb2dTdHJpbmcgPSBKU09OLnN0cmluZ2lmeShzdHJ1Y3R1cmVkTG9nKTtcbiAgICAgICAgY29uc3QgbGVuZ3RoID0gQnVmZmVyLmJ5dGVMZW5ndGgoanNvbkxvZ1N0cmluZyk7XG4gICAgICAgIHRoaXMubG9nUXVldWUucHVzaChzdHJ1Y3R1cmVkTG9nKTtcbiAgICAgICAgdGhpcy5sb2dMZW5ndGhRdWV1ZS5wdXNoKGxlbmd0aCk7XG4gICAgICAgIHRoaXMudG90YWxMZW5ndGhDb3VudCArPSBsZW5ndGg7XG5cbiAgICB9XG4gICAgXG4gICAgLyoqXG4gICAgICogU2V0IGdsb2JhbCBhdHRyaWJ1dGVzIGZvciB0aGUgYXBwbGljYXRpb24uICBUaGlzIHNob3VsZFxuICAgICAqIGdlbmVyYWxseSBiZSBjb25maWd1cmVkIGVhcmx5IGluIHRoZSBhcHBsaWNhdGlvbiBsaWZlY3ljbGUuXG4gICAgICogR2xvYmFsIGF0dHJpYnV0ZXMgd2lsbCBiZSBib3VuZCB0byBhbGwgbG9nIHN0YXRlbWVudHNcbiAgICAgKiBpbiBOZXcgUmVsaWMuXG4gICAgICogQHBhcmFtIGF0dHJpYnV0ZXMgS1YgcGFpcnMgdG8gYmUgcHJvdmlkZWQgdG8gTlIgd2l0aCBsb2dzXG4gICAgICovXG4gICAgc2V0R2xvYmFsQXR0cmlidXRlcyhhdHRyaWJ1dGVzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSkge1xuICAgICAgICB0aGlzLmdsb2JhbEF0dHJpYnV0ZXMgPSBhdHRyaWJ1dGVzO1xuICAgIH0gIFxuXG4gICAgLyoqXG4gICAgICogV3JpdGVzIGxvZ3Mgc3luY2hyb25vdXNseS4gIFRoaXMgZnVuY3Rpb24gaXMgaW50ZW5kZWQgdG8gYmVcbiAgICAgKiB1dGlsaXplZCBpbiBzaXR1YXRpb25zIHdoZXJlIGxvZ2dpbmcgY2Fubm90IGJlIHdyaXR0ZW4gXG4gICAgICogYXN5bmNocm9ub3VzbHksIG1vc3QgY29tbW9ubHkgaW4gdGhlIGhhbmRsZXIgb2YgYSBTSUdURVJNXG4gICAgICogZXZlbnQsIHdoaWNoIG9ubHkgYWxsb3dzIHN5bmNocm9ub3VzIGNhbGxzLlxuICAgICAqL1xuICAgIHByaXZhdGUgd3JpdGVMb2dzU3luYygpIHtcbiAgICAgICAgY29uc3QgbG9nc1RvV3JpdGUgPSB0aGlzLnNsaWNlTG9ncygpO1xuICAgICAgICBpbnRlcm5hbExvZygnc2lsbHknLCBgUHJlcGFyaW5nIGZpbmFsIGxvZyBwYXlsb2FkIG9mICR7bG9nc1RvV3JpdGUubGVuZ3RofSBmb3IgTlIgY29sbGVjdG9yYCk7XG4gICAgICAgIGNvbnN0IHJhd1BheWxvYWQgPSB0aGlzLmJ1aWxkUmF3UG9zdEJvZHkobG9nc1RvV3JpdGUpO1xuICAgICAgICBjb25zdCBjb21wcmVzc2VkUGF5bG9hZCA9IHpsaWIuZ3ppcFN5bmMocmF3UGF5bG9hZCk7XG4gICAgICAgIGlmICghdGhpcy5kZWJ1Z01vZGUpIHtcbiAgICAgICAgICAgIHRoaXMuc2VuZExvZ3MoY29tcHJlc3NlZFBheWxvYWQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy53cml0ZUxvZ3NUb0ZpbGVTeXN0ZW0oY29tcHJlc3NlZFBheWxvYWQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIHdyaXRlTG9nc1RvRmlsZVN5c3RlbShidWZmZXI6IEJ1ZmZlcikge1xuICAgICAgICBmcy53cml0ZUZpbGVTeW5jKGB0ZXN0LSR7dGhpcy5sb2dzV3JpdHRlbisrfS5nemAsIGJ1ZmZlcik7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBiZWdpbldyaXRlTG9ncygpIHtcbiAgICAgICAgY29uc3QgbG9nc1RvV3JpdGUgPSB0aGlzLnNsaWNlTG9ncygpO1xuXG4gICAgICAgIGludGVybmFsTG9nKCdzaWxseScsIGBQcmVwYXJpbmcgbG9nIHBheWxvYWQgb2YgJHtsb2dzVG9Xcml0ZS5sZW5ndGh9IGZvciBOUiBjb2xsZWN0b3JgKTtcbiAgICAgICAgY29uc3QgcmF3UGF5bG9hZCA9IHRoaXMuYnVpbGRSYXdQb3N0Qm9keShsb2dzVG9Xcml0ZSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBjb21wcmVzc2VkUGF5bG9hZDogQnVmZmVyID0gYXdhaXQgdGhpcy5jb21wcmVzc1BheWxvYWQocmF3UGF5bG9hZCk7XG4gICAgICAgICAgICBpZiAoIXRoaXMuZGVidWdNb2RlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZW5kTG9ncyhjb21wcmVzc2VkUGF5bG9hZCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMud3JpdGVMb2dzVG9GaWxlU3lzdGVtKGNvbXByZXNzZWRQYXlsb2FkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zdCBmYWxsYmFja01lc3NhZ2UgPSAnVW5rbm93biBlcnJvciBvY2N1cnJlZCB3aGlsZSBjb21wcmVzc2luZyBsb2dzIHRvIHNlbmQgdG8gTmV3IFJlbGljJztcbiAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnIgaW5zdGFuY2VvZiBFcnJvciAmJiBlcnIuc3RhY2sgPyBlcnIuc3RhY2sgOiBmYWxsYmFja01lc3NhZ2U7IFxuICAgICAgICAgICAgaW50ZXJuYWxMb2coJ2Vycm9yJywgbWVzc2FnZSlcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEhhbmRsZXMgSFRUUCByZXF1ZXN0IHRoYXQgc2VuZHMgY29tcHJlc3NlZCBsb2cgZGF0YVxuICAgICAqIHRvIHRoZSBOZXcgUmVsaWMgZW5kcG9pbnQuXG4gICAgICogQHBhcmFtIGNvbXByZXNzZWRQYXlsb2FkIFxuICAgICAqL1xuICAgIHByaXZhdGUgc2VuZExvZ3MoY29tcHJlc3NlZFBheWxvYWQ6IEJ1ZmZlcikge1xuICAgICAgICBBeGlvcy5wb3N0KGBodHRwczovLyR7QVBJX0hPU1ROQU1FfSR7QVBJX1BBVEh9YCwgY29tcHJlc3NlZFBheWxvYWQsIHtcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAnQWNjZXB0JzogJyovKicsXG4gICAgICAgICAgICAgICAgJ0FwaS1LZXknOiBwcm9jZXNzLmVudi5ORVdfUkVMSUNfTElDRU5TRV9LRVkgYXMgc3RyaW5nLFxuICAgICAgICAgICAgICAgICdDb250ZW50LUVuY29kaW5nJzogJ2d6aXAnLFxuICAgICAgICAgICAgICAgICdDb250ZW50LUxlbmd0aCc6ICcnK2NvbXByZXNzZWRQYXlsb2FkLmJ5dGVMZW5ndGgsXG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9nemlwJyxcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgICAgICBpZiAoWzIwMCwgMjAyXS5pbmNsdWRlcyhyZXNwb25zZS5zdGF0dXMpKSB7XG4gICAgICAgICAgICAgICAgaW50ZXJuYWxMb2coJ3NpbGx5JywgYExvZyBwYXlsb2FkIGFjY2VwdGVkIGJ5IE5ldyBSZWxpYyBBUEkuIFJlcXVlc3QgSUQ6ICR7cmVzcG9uc2UuZGF0YS5yZXF1ZXN0SWR9YClcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaW50ZXJuYWxMb2coJ3dhcm4nLCBgVW5leHBlY3RlZCBzdWNjZXNzZnVsIHJlc3BvbnNlIHN0YXR1cyBjb2RlIGZyb20gTlI6ICR7cmVzcG9uc2Uuc3RhdHVzfWApXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSkuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgICAgIGludGVybmFsTG9nKCdlcnJvcicsICdFcnJvciBzZW5kaW5nIGxvZyBwYXlsb2FkIHRvIE5ldyBSZWxpYycpO1xuICAgICAgICAgICAgaW50ZXJuYWxMb2coJ2Vycm9yJywgZXJyLnN0YWNrKVxuICAgICAgICB9KVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgdGhlIGdyZWF0ZXIgb2JqZWN0IHN0cnVjdHVyZSBmb3IgYSBsb2cgZGVsaXZlcnkgXG4gICAgICogcGF5bG9hZCBhbmQgYXR0YWNoZXMgYW4gYXJyYXkgb2YgbG9ncyB0byBpdC4gUmV0dXJucyBcbiAgICAgKiBzdHJpbmdpZmllZC5cbiAgICAgKiBAcGFyYW0gbG9ncyBcbiAgICAgKiBAcmV0dXJucyBcbiAgICAgKi9cbiAgICBwcml2YXRlIGJ1aWxkUmF3UG9zdEJvZHkobG9nczogYW55W10pOiBzdHJpbmcge1xuICAgICAgICBjb25zdCBwYXlsb2FkID0gW3tcbiAgICAgICAgICAgIGNvbW1vbjoge1xuICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgLi4udGhpcy5nbG9iYWxBdHRyaWJ1dGVzLFxuICAgICAgICAgICAgICAgICAgICBzZXJ2aWNlOiBwcm9jZXNzLmVudi5ORVdfUkVMSUNfQVBQX05BTUVcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGxvZ3M6IGxvZ3NcbiAgICAgICAgfV07XG4gICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShwYXlsb2FkKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBc3luY2hyb25vdXNseSBjb21wcmVzcyBzdHJpbmcgdG8gZ3ppcCBjb21wcmVzc2VkIGRhdGEuXG4gICAgICogQHBhcmFtIHJhd1BheWxvYWQgXG4gICAgICogQHJldHVybnMgXG4gICAgICovXG4gICAgcHJpdmF0ZSBhc3luYyBjb21wcmVzc1BheWxvYWQocmF3UGF5bG9hZDogc3RyaW5nKTogUHJvbWlzZTxCdWZmZXI+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPEJ1ZmZlcj4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgemxpYi5nemlwKEJ1ZmZlci5mcm9tKHJhd1BheWxvYWQsICd1dGY4JyksIChlcnIsIGNvbXByZXNzZWRQYXlsb2FkKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikgcmVqZWN0KGVycik7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShjb21wcmVzc2VkUGF5bG9hZCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2xpY2VzIGxvZyBxdWV1ZS5cbiAgICAgKiBXaWxsIHByZWZlciB0byB1c2UgdGhlIGVudGlyZSBsb2cgcXVldWUgd2hlbiBwb3NzaWJsZSwgYnV0XG4gICAgICogbWF5IHNlbmQgb25seSBhIHN1YnNlY3Rpb24gaWYgdGhlIHNpemUgb2YgdGhlIGRhdGEgaXMgbmVhclxuICAgICAqIHRoZSBsaW1pdGF0aW9ucyBkZWZpbmVkIGJ5IE5ldyBSZWxpYydzIEFQSS5cbiAgICAgKiBAcmV0dXJucyBcbiAgICAgKi9cbiAgICBwcml2YXRlIHNsaWNlTG9ncygpIHtcbiAgICAgICAgbGV0IGxvZ3NUb1NlbmQ7XG4gICAgICAgIFxuICAgICAgICAvLyBJZiB3ZSBrbm93IHRoZSB0b3RhbCBsZW5ndGggd2lsbCBub3QgZXhjZWVkIG1heGltdW0gbGVuZ3RoIHNpemVcbiAgICAgICAgaWYgKHRoaXMudG90YWxMZW5ndGhDb3VudCA8IE1BWF9QQVlMT0FEX1NJWkUpIHtcbiAgICAgICAgICAgIFtsb2dzVG9TZW5kLCB0aGlzLmxvZ1F1ZXVlXSA9IFt0aGlzLmxvZ1F1ZXVlLCBbXV07XG4gICAgICAgICAgICB0aGlzLmxvZ0xlbmd0aFF1ZXVlID0gW107XG4gICAgICAgICAgICB0aGlzLnRvdGFsTGVuZ3RoQ291bnQgPSAwO1xuICAgICAgICAgICAgcmV0dXJuIGxvZ3NUb1NlbmQ7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBvdGhlcndpc2UsIHNsaWNlIG9mZiBhIHNsaWNlIG9mIGxvZ3MgdGhhdCB3aWxsIGZpdCBpbnRvIGEgc2luZ2xlIHJlcXVlc3RcbiAgICAgICAgbGV0IGxvZ1NpemUgPSAwO1xuICAgICAgICBsZXQgbG9nU2xpY2VJbmRleCA9IDA7XG5cbiAgICAgICAgd2hpbGUoKHRoaXMubG9nUXVldWUubGVuZ3RoID4gMCkgJiYgKGxvZ1NpemUgKyB0aGlzLmxvZ0xlbmd0aFF1ZXVlWzBdIDwgTUFYX1BBWUxPQURfU0laRSkpIHtcbiAgICAgICAgICAgIGxvZ1NsaWNlSW5kZXgrKztcbiAgICAgICAgfVxuXG4gICAgICAgIGxvZ3NUb1NlbmQgPSB0aGlzLmxvZ1F1ZXVlLnNsaWNlKDAsIGxvZ1NsaWNlSW5kZXgpO1xuICAgICAgICB0aGlzLmxvZ1F1ZXVlID0gdGhpcy5sb2dRdWV1ZS5zbGljZShsb2dTbGljZUluZGV4KTtcbiAgICAgICAgdGhpcy5sb2dMZW5ndGhRdWV1ZSA9IHRoaXMubG9nTGVuZ3RoUXVldWUuc2xpY2UobG9nU2xpY2VJbmRleCk7XG5cbiAgICAgICAgcmV0dXJuIGxvZ3NUb1NlbmQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUHJlZGljYXRlIHRvIGRldGVybWluZSBpZiBsb2dzIHNob3VsZCBiZSB3cml0dGVuIGJlIHdyaXR0ZW4gaW1tZWRpYXRlbHkuXG4gICAgICogQHJldHVybnMgYm9vbGVhblxuICAgICAqL1xuICAgIHByaXZhdGUgaW1tZWRpYXRlTG9nV3JpdGFibGVQcmVkaWNhdGUoKTogYm9vbGVhbiB7XG4gICAgICAgIGlmICh0aGlzLmxvZ1F1ZXVlLmxlbmd0aCA+ICh0aGlzLmNvbmZpZy5taW5Mb2dJdGVtc1RvRm9yY2UgfHwgMTAwKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFByZWRpY2F0ZSB0byBkZXRlcm1pbmUgaWYgbG9ncyBzaG91bGQgYmUgd3JpdHRlbiBvbiBuZXh0IHBlcmlvZGljIGNoZWNrLlxuICAgICAqIEByZXR1cm5zIGJvb2xlYW5cbiAgICAgKi9cbiAgICBwcml2YXRlIGxvZ3NXcml0YWJsZVByZWRpY2F0ZSgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWluTG9nSXRlbXNFeGNlZWRlZCgpXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUHJlZGljYXRlIHRvIGRldGVybWluZSBpZiB0aGUgdG90YWwgbG9ncyBoYXZlIGV4Y2VlZGVkIGEgY29uZmlndXJlZCBtaW5Mb2dcbiAgICAgKiBjb3VudCB2YWx1ZSBpZiBzdWNoIGEgdmFsdWUgaXMgY29uZmlndXJlZC5cbiAgICAgKiBAcmV0dXJucyBcbiAgICAgKi9cbiAgICBwcml2YXRlIG1pbkxvZ0l0ZW1zRXhjZWVkZWQoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiAhISh0aGlzLmNvbmZpZy5taW5Mb2dJdGVtcyAmJiAodGhpcy5sb2dRdWV1ZS5sZW5ndGggPiB0aGlzLmNvbmZpZy5taW5Mb2dJdGVtcykpO1xuICAgIH0gICAgXG4gICAgXG4gICAgLyoqXG4gICAgICogRml4ZXMgcG9zc2libGUgaXNzdWVzIGluIGxvZyBmb3JtYXQgY2F1c2VkIGJ5IGxpbWl0YXRpb25zIG9mIE5ScyBsb2dnaW5nXG4gICAgICogdmFsdWVzXG4gICAgICogQHBhcmFtIGxvZyBcbiAgICAgKiBAcmV0dXJucyBcbiAgICAgKi9cbiAgICBwcml2YXRlIGxvZ1RyYW5zZm9ybShsb2c6IGFueSkge1xuICAgICAgICBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMobG9nKS5sZW5ndGggPiBNQVhfQVRUUklCVVRFU19QRVJfRVZFTlQpIHtcbiAgICAgICAgICAgIGludGVybmFsTG9nKCd3YXJuJywgYExvZyB0byBzZW5kIHRvIEpTT04gY29udGFpbnMgJHtPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhsb2cpfSAvICR7TUFYX0FUVFJJQlVURVNfUEVSX0VWRU5UfSBhdHRyaWJ1dGVzLmApO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBmb3IgKGxldCBrZXkgb2YgT2JqZWN0LmtleXMobG9nKSkge1xuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBsb2dba2V5XTtcbiAgICAgICAgICAgIC8vIHJlcGxhY2Uga2V5IHdpdGggbGVuZ3RoIHRvbyBoaWdoXG4gICAgICAgICAgICBpZiAoa2V5Lmxlbmd0aCA+IE1BWF9BVFRSSUJVVEVfTkFNRV9MRU5HVEgpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBuZXdLZXkgPSBrZXkuc2xpY2UoMCwgTUFYX0FUVFJJQlVURV9OQU1FX0xFTkdUSCk7XG4gICAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGxvZywga2V5LnNsaWNlKDAsIE1BWF9BVFRSSUJVVEVfTkFNRV9MRU5HVEgpLCBcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihsb2csIGtleSBhcyBQcm9wZXJ0eUtleSkgYXMgUHJvcGVydHlEZXNjcmlwdG9yKTtcbiAgICAgICAgICAgICAgICBkZWxldGUgbG9nLmtleTtcblxuICAgICAgICAgICAgICAgIC8vIFVwZGF0ZSBrZXkgbmFtZSBmb3IgdXNhZ2UgaW4gbGF0ZXIgc3RlcHNcbiAgICAgICAgICAgICAgICBrZXkgPSBuZXdLZXk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIENvbmNhdGVuYXRlIGxvZyBtZXNzYWdlcyB3aXRoIGxlbmd0aCBncmVhdGVyIHRoYW4gTUFYX0FUVFJJQlVURV9WQUxVRV9MRU5HVEhcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmIHZhbHVlLmxlbmd0aCA+IE1BWF9BVFRSSUJVVEVfVkFMVUVfTEVOR1RIKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY29uZmlnPy53YXJuT25BdHRyaWJ1dGVMZW5ndGhPdmVyZmxvdykge1xuICAgICAgICAgICAgICAgICAgICBpbnRlcm5hbExvZygnd2FybicsIGBOUiBMb2cgYXR0cmlidXRlIGxlbmd0aCBvdmVyZmxvdy4gTGVuZ3RoOiAke3ZhbHVlLmxlbmd0aH0vJHtNQVhfQVRUUklCVVRFX1ZBTFVFX0xFTkdUSH1gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbG9nLmtleSA9IHZhbHVlLnNsaWNlKDAsIE1BWF9BVFRSSUJVVEVfVkFMVUVfTEVOR1RIKTsgXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChrZXkuaW5jbHVkZXMoJyAnKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG5ld0tleSA9IGtleS5yZXBsYWNlQWxsKCcgJywgJy4nKTtcbiAgICAgICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobG9nLCBrZXkuc2xpY2UoMCwgTUFYX0FUVFJJQlVURV9OQU1FX0xFTkdUSCksIFxuICAgICAgICAgICAgICAgICAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGxvZywga2V5IGFzIFByb3BlcnR5S2V5KSBhcyBQcm9wZXJ0eURlc2NyaXB0b3IpO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBsb2cua2V5O1xuXG4gICAgICAgICAgICAgICAgLy8gVXBkYXRlIGtleSBuYW1lIGZvciB1c2FnZSBpbiBsYXRlciBzdGVwc1xuICAgICAgICAgICAgICAgIGtleSA9IG5ld0tleTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiB1c2VkIHRvIHJlcGVhdGVkbHkgdHJpZ2dlciBsb2cgcHVzaGVzXG4gICAgICovXG4gICAgcHJpdmF0ZSBjcmVhdGVMb2dDaGVja1RpbWVvdXQoKSB7XG4gICAgICAgIHRoaXMudGltZW91dElkID0gc2V0VGltZW91dChhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy5sb2dRdWV1ZS5sZW5ndGggPiAodGhpcy5jb25maWcubWluTG9nSXRlbXMgfHwgMSkpIHtcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLmJlZ2luV3JpdGVMb2dzKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5jcmVhdGVMb2dDaGVja1RpbWVvdXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdGhpcy5jb25maWcubG9nUHVzaEZyZXF1ZW5jeSlcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBIZWxwZXIgbWV0aG9kIHRoYXQgcmVnaXN0ZXJzIGxpc3RlbmVycyBmb3IgZXZlbnRzXG4gICAgICogcmVsYXRlZCB0byBpbW1pbmVudCBhcHBsaWNhdGlvbiBzaHV0ZG93biBzbyB0aGF0XG4gICAgICogZmluYWwgbG9ncyBjYW4gYmUgcHVzaGVkXG4gICAgICovXG4gICAgcHJpdmF0ZSByZWdpc3RlckFwcERlYXRoTG9nUHVzaCgpIHtcbiAgICAgICAgbGV0IGZpbmFsV3JpdHRlbiA9IGZhbHNlO1xuICAgICAgICBwcm9jZXNzLm9uKCdleGl0JywgKCkgPT4ge1xuICAgICAgICAgICAgaWYgKHRoaXMudGltZW91dElkKSBjbGVhclRpbWVvdXQodGhpcy50aW1lb3V0SWQpO1xuICAgICAgICAgICAgbGV0IG8gPSBmaW5hbFdyaXR0ZW47XG4gICAgICAgICAgICBmaW5hbFdyaXR0ZW4gPSB0cnVlO1xuICAgICAgICAgICAgaWYgKG8pIHJldHVybjtcblxuICAgICAgICAgICAgaW50ZXJuYWxMb2coJ2luZm8nLCAnd3JpdGluZyBmaW5hbCBsb2dzJyk7XG5cbiAgICAgICAgICAgIHRoaXMud3JpdGVMb2dzU3luYygpO1xuICAgICAgICB9KTtcblxuICAgICAgICBwcm9jZXNzLm9uKCdTSUdJTlQnLCAoKSA9PiB7XG4gICAgICAgICAgICBwcm9jZXNzLmV4aXQoMik7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHByb2Nlc3Mub24oJ3VuY2F1Z2h0RXhjZXB0aW9uJywgKGUpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGUpO1xuICAgICAgICAgICAgaW50ZXJuYWxMb2coJ2Vycm9yJywgZS5zdGFjayB8fCAnJyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHByb2Nlc3Mub24oJ1NJR1RFUk0nLCAoKSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy50aW1lb3V0SWQpIGNsZWFyVGltZW91dCh0aGlzLnRpbWVvdXRJZCk7XG4gICAgICAgICAgICB0aGlzLndyaXRlTG9nc1N5bmMoKTtcbiAgICAgICAgfSlcbiAgICB9XG59XG5cbi8qKlxuICogUmVwbGFjZXMgZXhpc3Rpbmcgd3JpdGVycyBmb3Igc3Rkb3V0IGFuZCBzdGRlcnIgd2l0aFxuICogUGFzc1Rocm91Z2ggc3RyZWFtcyB0aGF0IHdpbGwgaW52b2tlIHByb3ZpZGVkIGNhbGxiYWNrc1xuICogd2l0aCB0aGUgZGF0YSBwcmlvciB0byBwYXNzaW5nIHRoZW0gdG8gdGhlIG9yaWdpbmFsIHN0cmVhbXNcbiAqL1xuY2xhc3MgU3RhbmRhcmRPdXRQYXNzVGhyb3VnaCB7XG5cblxuICAgIHByaXZhdGUgcmVhZG9ubHkgc3Rkb3V0UHQgPSBuZXcgUGFzc1Rocm91Z2goKTtcbiAgICBwcml2YXRlIHJlYWRvbmx5IHN0ZGVyclB0ID0gbmV3IFBhc3NUaHJvdWdoKCk7XG5cbiAgICBwcml2YXRlIHJlYWRvbmx5IHN0ZG91dDtcbiAgICBwcml2YXRlIHJlYWRvbmx5IHN0ZGVycjtcblxuICAgIHByaXZhdGUgcmVhZG9ubHkgd3JpdGVTdGRvdXQ7XG4gICAgcHJpdmF0ZSByZWFkb25seSB3cml0ZVN0ZGVycjtcblxuICAgIGNvbnN0cnVjdG9yKHN0ZG91dENiOiAoZGF0YTogc3RyaW5nKSA9PiB2b2lkLCBzdGRlcnJDYjogKGRhdGE6IHN0cmluZykgPT4gdm9pZCkge1xuICAgICAgICAvLyBTdG9yZSBvcmlnaW5hbCB3cml0ZSBzdGRvdXQvc3RkZXJyIHdyaXRlIGZ1bmN0aW9uc1xuICAgICAgICB0aGlzLnN0ZG91dCA9IHByb2Nlc3Muc3Rkb3V0LndyaXRlO1xuICAgICAgICB0aGlzLnN0ZGVyciA9IHByb2Nlc3Muc3RkZXJyLndyaXRlO1xuXG4gICAgICAgIC8vIENyZWF0ZSBmdW5jdGlvbnMgd2hpY2ggd3JpdGUgdG8gb3JpZ2luYWwgd3JpdGVzIHdpdGggc3Rkb3V0L3N0ZGVyciBjb250ZXh0cyBib3VuZFxuICAgICAgICB0aGlzLndyaXRlU3Rkb3V0ID0gKGRhdGE6IHN0cmluZykgPT4gdGhpcy5zdGRvdXQuY2FsbChwcm9jZXNzLnN0ZG91dCwgZGF0YSk7XG4gICAgICAgIHRoaXMud3JpdGVTdGRlcnIgPSAoZGF0YTogc3RyaW5nKSA9PiB0aGlzLnN0ZGVyci5jYWxsKHByb2Nlc3Muc3RkZXJyLCBkYXRhKTtcblxuICAgICAgICAvLyBBc3NpZ24gbGlzdGVuZXJzIHRvIFBhc3NUaHJvdWdoc1xuICAgICAgICB0aGlzLnN0ZG91dFB0Lm9uKCdkYXRhJywgKGRhdGEpID0+IHtcbiAgICAgICAgICAgIGlmIChkYXRhIGluc3RhbmNlb2YgQnVmZmVyKSB7XG4gICAgICAgICAgICAgICAgZGF0YSA9IGRhdGEudG9TdHJpbmcoJ3V0ZjgnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN0ZG91dENiKGRhdGEpO1xuICAgICAgICAgICAgdGhpcy53cml0ZVN0ZG91dChkYXRhKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5zdGRlcnJQdC5vbignZGF0YScsIChkYXRhKSA9PiB7XG4gICAgICAgICAgICBpZiAoZGF0YSBpbnN0YW5jZW9mIEJ1ZmZlcikge1xuICAgICAgICAgICAgICAgIGRhdGEgPSBkYXRhLnRvU3RyaW5nKCd1dGY4Jyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzdGRlcnJDYihkYXRhKTtcbiAgICAgICAgICAgIHRoaXMud3JpdGVTdGRlcnIoZGF0YSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIFJlcGxhY2Ugb3JpZ2luYWwgd3JpdGUgY2FsbHMgd2l0aCBjb250ZXh0cyBib3VuZCB0byBwYXJlbnQgb2JqZWN0XG4gICAgICAgIHByb2Nlc3Muc3Rkb3V0LndyaXRlID0gdGhpcy5zdGRvdXRQdC53cml0ZS5iaW5kKHRoaXMuc3Rkb3V0UHQpIGFzIGFueTtcbiAgICAgICAgcHJvY2Vzcy5zdGRlcnIud3JpdGUgPSB0aGlzLnN0ZGVyclB0LndyaXRlLmJpbmQodGhpcy5zdGRlcnJQdCkgYXMgYW55O1xuXG4gICAgICAgIC8vIEFkZCB1bmNhdWdodCBlcnJvciBoYW5kbGVyIHRvIGhhbmRsZSBsb2dnaW5nIG9mIGZhaWx1cmUgY2FzZVxuICAgICAgICBwcm9jZXNzLm9uKCd1bmNhdWdodEV4Y2VwdGlvbicsIChlcnIpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVhZmZpeCB0aGUgcmVwbGFjZWQgc3Rkb3V0IGFuZCBzdGRlcnIgdGhlblxuICAgICAqIGNsb3NlcyBhbGwgc3RyZWFtcyBvd25lZCBieSB0aGlzIGluc3RhbmNlLlxuICAgICAqL1xuICAgIHB1YmxpYyBkZXN0cm95KCkge1xuICAgICAgICBwcm9jZXNzLnN0ZG91dC53cml0ZSA9IHRoaXMuc3Rkb3V0O1xuICAgICAgICBwcm9jZXNzLnN0ZGVyci53cml0ZSA9IHRoaXMuc3RkZXJyO1xuXG4gICAgICAgIHRoaXMuc3Rkb3V0UHQuZGVzdHJveSgpXG4gICAgICAgIHRoaXMuc3RkZXJyUHQuZGVzdHJveSgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEJ5cGFzcyB0aGUgY29uZmlndXJlZCBjYWxsYmFjayBmdW5jdGlvbiBmb3Igc3Rkb3V0IGJ5XG4gICAgICogd3JpdGluZyBkaXJlY3RseSB0byB0aGUgZGV0YWNoZWQgb3V0cHV0IHN0cmVhbVxuICAgICAqIEBwYXJhbSBkYXRhIFxuICAgICAqL1xuICAgIHB1YmxpYyBzdGRvdXRCeXBhc3MoZGF0YTogc3RyaW5nIHwgb2JqZWN0KSB7XG4gICAgICAgIGlmIChkYXRhIGluc3RhbmNlb2YgT2JqZWN0KSB7XG4gICAgICAgICAgICBkYXRhID0gSlNPTi5zdHJpbmdpZnkoZGF0YSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy53cml0ZVN0ZG91dCgoZGF0YSBhcyB1bmtub3duIGFzIHN0cmluZykpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEJ5cGFzcyB0aGUgY29uZmlndXJlZCBjYWxsYmFjayBmdW5jdGlvbiBmb3Igc3RkZXJyIGJ5XG4gICAgICogd3JpdGluZyBkaXJlY3RseSB0byB0aGUgZGV0YWNoZWQgb3V0cHV0IHN0cmVhbVxuICAgICAqIEBwYXJhbSBkYXRhIFxuICAgICAqL1xuICAgIHB1YmxpYyBzdGRlcnJCeXBhc3MoZGF0YTogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMud3JpdGVTdGRlcnIoZGF0YSk7XG4gICAgfVxufVxuXG5cbi8qKlxuICogTGF6eSBsb2FkIGxvZ2dlciwgd3JpdGUgYnVmZmVyZWQgbWVzc2FnZXMgb25jZSBsb2FkZWRcbiAqIE5vdGU6IExhenkgbG9hZGluZyBpcyBuZWNlc3NhcnkgdG8gcmVzb2x2ZSBjaXJjdWxhciBkZXBlbmRlbmNpZXMgYmV0d2VlbiB0aGlzXG4gKiBtb2R1bGUgYW5kIHRoZSBsb2dnZXIuXG4gKi9cbihhc3luYyAoKSA9PiB7XG4gICAgY29uc3QgeyB3aXRoTG9nZ2VyIH0gPSBhd2FpdCBpbXBvcnQoJy4vbG9nZ2VyJyk7XG4gICAgY29uc3QgbGV2ZWw6IE5QTUxvZ2dpbmdMZXZlbHMgPSBwcm9jZXNzLmVudi5MT0dfREVMSVZFUllfQUdFTlRfTEVWRUwgYXMgTlBNTG9nZ2luZ0xldmVscyB8fCAnd2Fybic7XG4gICAgbG9nID0gd2l0aExvZ2dlcignTmV3UmVsaWNMb2dGb3J3YXJkZXInLCBsZXZlbCk7XG4gICAgd2hpbGUoaW50ZXJuYWxMb2dCdWZmZXIubGVuZ3RoKSB7XG4gICAgICAgIGNvbnN0IFtsZXZlbCwgbWVzc2FnZV0gPSBpbnRlcm5hbExvZ0J1ZmZlci5zaGlmdCgpIGFzIFtzdHJpbmcsIHN0cmluZ107XG4gICAgICAgIChsb2cgYXMgYW55KVtsZXZlbF0obWVzc2FnZSk7XG4gICAgfVxufSkoKTtcbiJdfQ==