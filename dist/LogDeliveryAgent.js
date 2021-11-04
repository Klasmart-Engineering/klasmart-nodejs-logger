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
        var obj = JSON.parse(str); // Rewrite bootstrap object into a format that will work for new relic

        if (obj.msg && obj !== null && obj !== void 0 && obj.name('newrelic_bootstrap') && !obj.message) {
          obj.message = obj.msg;
          obj.level = 'info';
          delete obj.msg;
        }

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9Mb2dEZWxpdmVyeUFnZW50LnRzIl0sIm5hbWVzIjpbIkFQSV9IT1NUTkFNRSIsInByb2Nlc3MiLCJlbnYiLCJLTF9OUl9MT0dfSE9TVE5BTUUiLCJBUElfUEFUSCIsIktMX05SX0xPR19QQVRIIiwiTUFYX1BBWUxPQURfU0laRSIsIk1BWF9BVFRSSUJVVEVTX1BFUl9FVkVOVCIsIk1BWF9BVFRSSUJVVEVfTkFNRV9MRU5HVEgiLCJNQVhfQVRUUklCVVRFX1ZBTFVFX0xFTkdUSCIsImxvZyIsImludGVybmFsTG9nQnVmZmVyIiwiaW50ZXJuYWxMb2ciLCJsZXZlbCIsIm1lc3NhZ2UiLCJwdXNoIiwiZGVmYXVsdENvbmZpZyIsImJ5dGVzV3JpdHRlblRocmVzaG9sZCIsIndhcm5PbkF0dHJpYnV0ZUxlbmd0aE92ZXJmbG93IiwibWluQnl0ZXNXcml0dGVuIiwibWluTG9nSXRlbXMiLCJsb2dQdXNoRnJlcXVlbmN5IiwibWluTG9nSXRlbXNUb0ZvcmNlIiwiTmV3UmVsaWNMb2dEZWxpdmVyeUFnZW50IiwiREVCVUdfV1JJVEVfTE9HU19UT19GSUxFIiwiY29uZmlnIiwibmV3UmVsaWNMb2dUcmFuc3BvcnQiLCJOZXdSZWxpY0xvZ1RyYW5zcG9ydCIsImNiIiwiYWRkTG9nIiwibG9nQ2FsbGJhY2siLCJlcnJDYWxsYmFjayIsImxhYmVsIiwic3RhbmRhcmRPdXRQYXNzVGhyb3VnaCIsIlN0YW5kYXJkT3V0UGFzc1Rocm91Z2giLCJyZWdpc3RlckFwcERlYXRoTG9nUHVzaCIsImNyZWF0ZUxvZ0NoZWNrVGltZW91dCIsInRpbWVvdXRJZCIsImNsZWFyVGltZW91dCIsImRlc3Ryb3kiLCJjbG9zZSIsIndyaXRlTG9nc1N5bmMiLCJzdHIiLCJKU09OIiwic3RyaW5naWZ5Iiwib2JqIiwicGFyc2UiLCJtc2ciLCJuYW1lIiwiZXJyIiwiY2FsbGJhY2siLCJqc29uRGF0YSIsImlzTlJDb21wYXRpYmxlSnNvbkxvZ1N0cmluZyIsInByb2Nlc3NBc0pzb25Mb2ciLCJwcm9jZXNzQXNTdHJpbmdMb2ciLCJpbW1lZGlhdGVMb2dXcml0YWJsZVByZWRpY2F0ZSIsImJlZ2luV3JpdGVMb2dzIiwic3RkZXJyQnlwYXNzIiwic3Rkb3V0QnlwYXNzIiwibG9nVHJhbnNmb3JtIiwibG9nU3RyaW5nIiwibGVuZ3RoIiwiQnVmZmVyIiwiYnl0ZUxlbmd0aCIsImxvZ1F1ZXVlIiwibG9nTGVuZ3RoUXVldWUiLCJ0b3RhbExlbmd0aENvdW50IiwiZW5kc1dpdGgiLCJzdWJzdHJpbmciLCJuZXdSZWxpY01ldGFkYXRhIiwibmV3cmVsaWMiLCJnZXRMaW5raW5nTWV0YWRhdGEiLCJzdHJ1Y3R1cmVkTG9nIiwidGltZXN0YW1wIiwiRGF0ZSIsIm5vdyIsIm9yaWdpbmFsX3RpbWVzdGFtcCIsInRvSVNPU3RyaW5nIiwiaG9zdG5hbWUiLCJqc29uTG9nU3RyaW5nIiwiYXR0cmlidXRlcyIsImdsb2JhbEF0dHJpYnV0ZXMiLCJsb2dzVG9Xcml0ZSIsInNsaWNlTG9ncyIsInJhd1BheWxvYWQiLCJidWlsZFJhd1Bvc3RCb2R5IiwiY29tcHJlc3NlZFBheWxvYWQiLCJ6bGliIiwiZ3ppcFN5bmMiLCJkZWJ1Z01vZGUiLCJzZW5kTG9ncyIsIndyaXRlTG9nc1RvRmlsZVN5c3RlbSIsImJ1ZmZlciIsImZzIiwid3JpdGVGaWxlU3luYyIsImxvZ3NXcml0dGVuIiwiY29tcHJlc3NQYXlsb2FkIiwiZmFsbGJhY2tNZXNzYWdlIiwiRXJyb3IiLCJzdGFjayIsIkF4aW9zIiwicG9zdCIsImhlYWRlcnMiLCJORVdfUkVMSUNfTElDRU5TRV9LRVkiLCJ0aGVuIiwicmVzcG9uc2UiLCJpbmNsdWRlcyIsInN0YXR1cyIsImRhdGEiLCJyZXF1ZXN0SWQiLCJsb2dzIiwicGF5bG9hZCIsImNvbW1vbiIsInNlcnZpY2UiLCJORVdfUkVMSUNfQVBQX05BTUUiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsImd6aXAiLCJmcm9tIiwibG9nc1RvU2VuZCIsImxvZ1NpemUiLCJsb2dTbGljZUluZGV4Iiwic2xpY2UiLCJtaW5Mb2dJdGVtc0V4Y2VlZGVkIiwiT2JqZWN0IiwiZ2V0T3duUHJvcGVydHlOYW1lcyIsImtleXMiLCJrZXkiLCJ2YWx1ZSIsIm5ld0tleSIsImRlZmluZVByb3BlcnR5IiwiZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yIiwicmVwbGFjZUFsbCIsInNldFRpbWVvdXQiLCJmaW5hbFdyaXR0ZW4iLCJvbiIsIm8iLCJleGl0IiwiZSIsImNvbnNvbGUiLCJpbnN0YW5jZSIsInN0ZG91dENiIiwic3RkZXJyQ2IiLCJQYXNzVGhyb3VnaCIsInN0ZG91dCIsIndyaXRlIiwic3RkZXJyIiwid3JpdGVTdGRvdXQiLCJjYWxsIiwid3JpdGVTdGRlcnIiLCJzdGRvdXRQdCIsInRvU3RyaW5nIiwic3RkZXJyUHQiLCJiaW5kIiwiZXJyb3IiLCJ3aXRoTG9nZ2VyIiwiTE9HX0RFTElWRVJZX0FHRU5UX0xFVkVMIiwic2hpZnQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFHQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFQSxJQUFNQSxZQUFZLEdBQUdDLE9BQU8sQ0FBQ0MsR0FBUixDQUFZQyxrQkFBWixJQUFrQyx5QkFBdkQ7QUFDQSxJQUFNQyxRQUFRLEdBQUdILE9BQU8sQ0FBQ0MsR0FBUixDQUFZRyxjQUFaLElBQThCLFNBQS9DO0FBQ0EsSUFBTUMsZ0JBQWdCLFlBQUcsRUFBSCxFQUFPLENBQVAsQ0FBdEI7QUFDQSxJQUFNQyx3QkFBd0IsR0FBRyxHQUFqQztBQUNBLElBQU1DLHlCQUF5QixHQUFHLEdBQWxDO0FBQ0EsSUFBTUMsMEJBQTBCLEdBQUcsSUFBbkM7QUFFQSxJQUFJQyxHQUFKO0FBQ0EsSUFBSUMsaUJBQTBDLEdBQUcsRUFBakQ7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFDQSxTQUFTQyxXQUFULENBQXFCQyxLQUFyQixFQUFvQ0MsT0FBcEMsRUFBcUQ7QUFDakQsTUFBSUos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QUFDQSxXQUFLa0gsUUFBTCxDQUFjbEgsT0FBZDtBQUNIO0FBRUQ7QUFDSjtBQUNBO0FBQ0E7QUFDQTs7OztXQUNJLHNCQUFvQnFFLElBQXBCLEVBQTJDO0FBQ3ZDLFVBQUlBLElBQUksWUFBWWlCLE1BQXBCLEVBQTRCO0FBQ3hCakIsUUFBQUEsSUFBSSxHQUFHakUsSUFBSSxDQUFDQyxTQUFMLENBQWVnRSxJQUFmLENBQVA7QUFDSDs7QUFDRCxXQUFLd0MsV0FBTCxDQUFrQnhDLElBQWxCO0FBQ0g7QUFFRDtBQUNKO0FBQ0E7QUFDQTtBQUNBOzs7O1dBQ0ksc0JBQW9CQSxJQUFwQixFQUFrQztBQUM5QixXQUFLMEMsV0FBTCxDQUFpQjFDLElBQWpCO0FBQ0g7Ozs7O0FBSUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBQ0Esd0RBQUM7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxtREFDdUMsVUFEdkM7QUFBQTs7QUFBQTtBQUFBO0FBQ1dnRCxVQUFBQSxVQURYLGlCQUNXQSxVQURYO0FBRVMvSSxVQUFBQSxLQUZULEdBRW1DWixPQUFPLENBQUNDLEdBQVIsQ0FBWTJKLHdCQUFaLElBQTRELE1BRi9GO0FBR0duSixVQUFBQSxHQUFHLEdBQUdrSixVQUFVLENBQUMsc0JBQUQsRUFBeUIvSSxLQUF6QixDQUFoQjs7QUFDQSxpQkFBTUYsaUJBQWlCLENBQUNrRCxNQUF4QixFQUFnQztBQUFBLG9CQUNIbEQsaUJBQWlCLENBQUNtSixLQUFsQixFQURHLG9DQUNyQmpKLE1BRHFCLGFBQ2RDLE9BRGM7O0FBRTNCSixZQUFBQSxHQUFELENBQWFHLE1BQWIsRUFBb0JDLE9BQXBCO0FBQ0g7O0FBUEo7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsQ0FBRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgbmV3cmVsaWMgZnJvbSAnbmV3cmVsaWMnO1xuaW1wb3J0IHpsaWIgZnJvbSAnemxpYic7XG5pbXBvcnQgeyBOZXdSZWxpY0xvZ1RyYW5zcG9ydCB9IGZyb20gJy4vTmV3UmVsaWNMb2dUcmFuc3BvcnQnO1xuaW1wb3J0IHsgUGFzc1Rocm91Z2ggfSBmcm9tICdzdHJlYW0nO1xuaW1wb3J0IHsgTG9nZ2VyIH0gZnJvbSAnd2luc3Rvbic7XG5pbXBvcnQgeyBOUE1Mb2dnaW5nTGV2ZWxzIH0gZnJvbSAnLi9sb2dnZXInO1xuaW1wb3J0IEF4aW9zIGZyb20gJ2F4aW9zJztcblxuY29uc3QgQVBJX0hPU1ROQU1FID0gcHJvY2Vzcy5lbnYuS0xfTlJfTE9HX0hPU1ROQU1FIHx8ICdsb2ctYXBpLmV1Lm5ld3JlbGljLmNvbSc7XG5jb25zdCBBUElfUEFUSCA9IHByb2Nlc3MuZW52LktMX05SX0xPR19QQVRIIHx8ICcvbG9nL3YxJztcbmNvbnN0IE1BWF9QQVlMT0FEX1NJWkUgPSAxMCoqNjtcbmNvbnN0IE1BWF9BVFRSSUJVVEVTX1BFUl9FVkVOVCA9IDI1NTtcbmNvbnN0IE1BWF9BVFRSSUJVVEVfTkFNRV9MRU5HVEggPSAyNTU7XG5jb25zdCBNQVhfQVRUUklCVVRFX1ZBTFVFX0xFTkdUSCA9IDQwOTY7XG5cbmxldCBsb2c6IExvZ2dlciB8IHVuZGVmaW5lZDtcbmxldCBpbnRlcm5hbExvZ0J1ZmZlcjogQXJyYXk8W3N0cmluZywgc3RyaW5nXT4gPSBbXTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byB3cml0ZSBsb2dzIHRoYXQgYXJlIGludGVybmFsIHRvIHRoaXMgbW9kdWxlLlxuICogQnVmZmVycyBjYWxscyB1bnRpbCB0aGUgV2luc3RvbiBsb2dnZXIgY2FuIGJlIGFzeW5jIGltcG9ydGRcbiAqIEFmdGVyd29yZHMsIHdyaXRlcyBsb2dzIGRpcmVjdGx5IHRvIHRoZSBsb2dnZXJcbiAqIEBwYXJhbSBsZXZlbCBcbiAqIEBwYXJhbSBtZXNzYWdlIFxuICovXG5mdW5jdGlvbiBpbnRlcm5hbExvZyhsZXZlbDogc3RyaW5nLCBtZXNzYWdlOiBzdHJpbmcpIHtcbiAgICBpZiAobG9nKSB7XG4gICAgICAgIChsb2cgYXMgYW55KVtsZXZlbF0obWVzc2FnZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgaW50ZXJuYWxMb2dCdWZmZXIucHVzaChbbGV2ZWwsIG1lc3NhZ2VdKTtcbiAgICB9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTmV3UmVsaWNMb2dEZWxpdmVyeUFnZW50Q29uZmlnIHtcbiAgICAvKipcbiAgICAgKiBIb3cgZnJlcXVlbnRseSBjaGVja3Mgc2hvdWxkIGJlIHJ1biB0byBwdXNoIGxvZ3MgdG8gTlJcbiAgICAgKiBEZWZhdWx0IGlzIDEwIHNlY29uZHNcbiAgICAgKi9cbiAgICAgbG9nUHVzaEZyZXF1ZW5jeT86IG51bWJlcjtcblxuICAgICAvKipcbiAgICAgICogTWluaW11bSBudW1iZXIgb2YgbG9nIHN0YXRlbWVudHMgd3JpdHRlbiBiZWZvcmUgbG9ncyBjYW4gYmUgcHVzaGVkIHRvIE5SXG4gICAgICAqIGJ5IHBlcmlvZGljIGxvZ2dlci5cbiAgICAgICogRGVmYXVsdCBpcyAyXG4gICAgICAqL1xuICAgICBtaW5Mb2dJdGVtcz86IG51bWJlcjtcbiBcbiBcbiAgICAgLyoqXG4gICAgICAqIE1pbmltdW0gbnVtYmVyIG9mIGxvZyBzdGF0ZW1lbnRzIHRvIGZvcmNlIGFuIGltbWVkaWF0ZSBwdXNoIHRvIE5SLiBVc2VkXG4gICAgICAqIHRvIGVuc3VyZSB0aGF0IHRoZSBsb2dnaW5nIHN5c3RlbSBkb2VzIG5vdCBnZXQgYmFja2VkIHVwIGlmIGFtb3VudCBiZWluZ1xuICAgICAgKiBsb2dnZWQgc3VycGFzc2VzIHRoZSBiYW5kd2lkdGggb2YgdGhlIHBlcmlvZGljIGxvZ2dlci5cbiAgICAgICogRGVmYXVsdCBpcyAxMDAuXG4gICAgICAqL1xuICAgICBtaW5Mb2dJdGVtc1RvRm9yY2U/OiBudW1iZXI7XG5cbiBcbiAgICAgLyoqXG4gICAgICAqIE1pbmltdW0gbnVtYmVyIG9mIGJ5dGVzIHdyaXR0ZW4gdG8gY29tcHJlc3Npb24gc3RyZWFtIGJlZm9yZSBwdXNoaW5nIHRvIE5SXG4gICAgICAqL1xuICAgICBtaW5CeXRlc1dyaXR0ZW4/OiBudW1iZXI7XG4gXG4gICAgIC8qKlxuICAgICAgKiBUaHJlc2hvbGQgZm9yIGJ5dGVzIHdyaXR0ZW4gYXQgd2hpY2ggcG9pbnQgYSBuZXcgd3JpdGUgdG8gTlIgd2lsbCBiZSBhdXRvbWF0aWNhbGx5XG4gICAgICAqIHRyaWdnZXJlZC4gRGVmYXVsdHMgdG8gKDQvNSAqIE1BWF9QQVlMT0FEX1NJWkUpXG4gICAgICAqL1xuICAgICBieXRlc1dyaXR0ZW5UaHJlc2hvbGQ/OiBudW1iZXI7XG4gXG4gICAgIC8qKlxuICAgICAgKiBQcm9kdWNlIGEgd2FybmluZyB3aGVuIGF0dHJpYnV0ZSB2YWx1ZXMgb3ZlcmZsb3cgdGhlIE5SIG1heGltdW0gbGVuZ3RoIG9mIDQwOTYuXG4gICAgICAqIERlZmF1bHQgaXMgZmFsc2UuXG4gICAgICAqL1xuICAgICB3YXJuT25BdHRyaWJ1dGVMZW5ndGhPdmVyZmxvdz86IGJvb2xlYW47XG59XG5cbmNvbnN0IGRlZmF1bHRDb25maWc6IE5ld1JlbGljTG9nRGVsaXZlcnlBZ2VudENvbmZpZyA9IHtcbiAgICBieXRlc1dyaXR0ZW5UaHJlc2hvbGQ6IE1BWF9QQVlMT0FEX1NJWkUgKiA0IC8gNSxcbiAgICB3YXJuT25BdHRyaWJ1dGVMZW5ndGhPdmVyZmxvdzogZmFsc2UsXG4gICAgbWluQnl0ZXNXcml0dGVuOiBNQVhfUEFZTE9BRF9TSVpFICogMSAvIDUsXG4gICAgbWluTG9nSXRlbXM6IDIsXG4gICAgbG9nUHVzaEZyZXF1ZW5jeTogNjAwMDAsXG4gICAgbWluTG9nSXRlbXNUb0ZvcmNlOiAxMDAsXG59XG5cbmV4cG9ydCBjbGFzcyBOZXdSZWxpY0xvZ0RlbGl2ZXJ5QWdlbnQge1xuIFxuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemVzIGEgTmV3UmVsaWNMb2dEZWxpdmVyeUFnZW50IGluc3RhbmNlIGlmIHRoZSBMT0dfU1RZTEUgZW52aXJvbm1lbnRcbiAgICAgKiB2YXJpYWJsZSBpcyBzZXQgdG8gTkVXX1JFTElDLiBPdGhlcndpc2UgaXQgZG9lcyBub3RoaW5nLlxuICAgICAqIEBwYXJhbSBjb25maWcgXG4gICAgICogQHJldHVybnMgXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBpbml0aWFsaXplKCkge1xuICAgICAgICBpZiAoIXByb2Nlc3MuZW52Lk5FV19SRUxJQ19MSUNFTlNFX0tFWSkgcmV0dXJuO1xuICAgICAgICBOZXdSZWxpY0xvZ0RlbGl2ZXJ5QWdlbnQuaW5zdGFuY2UgPSBuZXcgTmV3UmVsaWNMb2dEZWxpdmVyeUFnZW50KCk7XG4gICAgICAgIHJldHVybiBOZXdSZWxpY0xvZ0RlbGl2ZXJ5QWdlbnQuaW5zdGFuY2U7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyBnZXRJbnN0YW5jZSgpIHtcbiAgICAgICAgcmV0dXJuIE5ld1JlbGljTG9nRGVsaXZlcnlBZ2VudD8uaW5zdGFuY2U7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyBjb25maWd1cmUoY29uZmlnOiBOZXdSZWxpY0xvZ0RlbGl2ZXJ5QWdlbnRDb25maWcpIHtcbiAgICAgICAgY29uc3QgaW5zdGFuY2UgPSBOZXdSZWxpY0xvZ0RlbGl2ZXJ5QWdlbnQuaW5zdGFuY2U7XG4gICAgICAgIGlmICghaW5zdGFuY2UpIHtcbiAgICAgICAgICAgIGludGVybmFsTG9nKCd3YXJuJywgJ0NvbmZpZ3VyZSBjYWxsZWQgYmVmb3JlIGluc3RhbmNlIGluaXRpYWxpemF0aW9uLiBDb25maWd1cmF0aW9uIG5vdCBhcHBsaWVkJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaW5zdGFuY2UuY29uZmlnID0ge1xuICAgICAgICAgICAgLi4uaW5zdGFuY2UuY29uZmlnLFxuICAgICAgICAgICAgLi4uY29uZmlnXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIGdldFdpbnN0b25UcmFuc3BvcnQoKSB7XG4gICAgICAgIHJldHVybiBOZXdSZWxpY0xvZ0RlbGl2ZXJ5QWdlbnQ/Lmluc3RhbmNlPy5sb2dUcmFuc2Zvcm07XG4gICAgfVxuICAgIFxuICAgIHByaXZhdGUgc3RhdGljIGluc3RhbmNlOiBOZXdSZWxpY0xvZ0RlbGl2ZXJ5QWdlbnQ7XG4gICAgcHJpdmF0ZSBsb2dRdWV1ZTogYW55W10gPSBbXTtcbiAgICBwcml2YXRlIGNvbmZpZzogTmV3UmVsaWNMb2dEZWxpdmVyeUFnZW50Q29uZmlnO1xuICAgIHByaXZhdGUgbG9nTGVuZ3RoUXVldWU6IG51bWJlcltdID0gW107XG4gICAgcHJpdmF0ZSB0b3RhbExlbmd0aENvdW50ID0gMDtcbiAgICBwcml2YXRlIGdsb2JhbEF0dHJpYnV0ZXM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9ID0ge307XG4gICAgcHJpdmF0ZSBuZXdSZWxpY0xvZ1RyYW5zcG9ydDogTmV3UmVsaWNMb2dUcmFuc3BvcnQ7XG4gICAgcHJpdmF0ZSBkZWJ1Z01vZGUgPSBwcm9jZXNzLmVudi5ERUJVR19XUklURV9MT0dTX1RPX0ZJTEUgPT09ICd0cnVlJztcbiAgICBwcml2YXRlIHRpbWVvdXRJZDogTm9kZUpTLlRpbWVvdXQgfCB1bmRlZmluZWQ7XG4gICAgcHJpdmF0ZSBsb2dzV3JpdHRlbiA9IDA7XG4gICAgXG4gICAgcHVibGljIHN0YW5kYXJkT3V0UGFzc1Rocm91Z2g6IFN0YW5kYXJkT3V0UGFzc1Rocm91Z2g7XG4gICAgXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgaW50ZXJuYWxMb2coJ2RlYnVnJywgJ0luaXRpYWxpemluZyBMb2dEZWxpdmVyeUFnZW50Jyk7XG4gICAgICAgIHRoaXMuY29uZmlnID0geyAuLi5kZWZhdWx0Q29uZmlnIH07XG5cbiAgICAgICAgaW50ZXJuYWxMb2coJ2luZm8nLCBgQ3JlYXRpbmcgTmV3UmVsaWNMb2dUcmFuc3BvcnRgKTtcbiAgICAgICAgdGhpcy5uZXdSZWxpY0xvZ1RyYW5zcG9ydCA9IG5ldyBOZXdSZWxpY0xvZ1RyYW5zcG9ydCgobG9nLCBjYikgPT4gdGhpcy5hZGRMb2cobG9nLCBjYikpO1xuXG4gICAgICAgIC8vIENyZWF0ZXMgbG9nZ2luZyBjb25maWd1cmF0aW9uIGZvciByZXdyaXRpbmcgc3Rkb3V0L3N0ZGVyclxuICAgICAgICBjb25zdCBsb2dDYWxsYmFjayA9IChsb2c6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgdGhpcy5hZGRMb2cobG9nLCAoKSA9PiB7fSk7XG4gICAgICAgIH07XG4gICAgXG4gICAgICAgIGNvbnN0IGVyckNhbGxiYWNrID0gKGxvZzogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmFkZExvZyh7XG4gICAgICAgICAgICAgICAgbGFiZWw6ICdlcnJvcicsXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogbG9nXG4gICAgICAgICAgICB9LCAoKSA9PiB7fSk7XG4gICAgICAgIH07XG4gICAgXG4gICAgICAgIHRoaXMuc3RhbmRhcmRPdXRQYXNzVGhyb3VnaCA9IG5ldyBTdGFuZGFyZE91dFBhc3NUaHJvdWdoKGxvZ0NhbGxiYWNrLCBlcnJDYWxsYmFjayk7XG4gICAgICAgIHRoaXMucmVnaXN0ZXJBcHBEZWF0aExvZ1B1c2goKTtcbiAgICAgICAgdGhpcy5jcmVhdGVMb2dDaGVja1RpbWVvdXQoKTtcbiAgICAgICAgaW50ZXJuYWxMb2coJ2RlYnVnJywgJ0xvZ0RlbGl2ZXJ5QWdlbnQgSW5pdGlhbGl6ZWQnKVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFjY2Vzc29yIGZvciBXaW5zdG9uIFRyYW5zcG9ydCB0aGF0IHdyaXRlcyB0byB0aGlzIFxuICAgICAqIGFnZW50IGluc3RhbmNlXG4gICAgICogQHJldHVybnMgd2luc3Rvbi50cmFuc3BvcnRcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0TG9nVHJhbnNwb3J0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5uZXdSZWxpY0xvZ1RyYW5zcG9ydDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTaHV0c2Rvd24gdGhlIGRlbGl2ZXJ5IGFnZW50LiBUaGlzIGNhbiBiZSB1dGlsaXplZCB3aGVuIGFwcCBpcyBleHBlY3RlZCB0byBzaHV0ZG93blxuICAgICAqIGF0IGEgZ2l2ZW4gdGltZSBhbmQgdGhlIHBlcmlvZGljIGRlbGl2ZXJ5IHRpbWVvdXQgaXMgYmxvY2tpbmcgc2h1dGRvd24uXG4gICAgICogXG4gICAgICogQ2xlYXJzIGludGVybmFsIHRpbWVvdXQsIGNvbmZpZ3VyZXMgd2luc3RvbiB0cmFuc3BvcnQgdG8gbm90IHNlbmQgbG9ncy5cbiAgICAgKiBSZWNvbm5lY3RzIHN0ZG91dCBhbmQgc3RkZXJyLlxuICAgICAqIFdyaXRlcyBhbnkgcmVtYWluaW5nIGxvZ3MuXG4gICAgICovXG4gICAgcHVibGljIHNodXRkb3duKCkge1xuICAgICAgICBpbnRlcm5hbExvZygnZGVidWcnLCAnU2h1dGRvd24gb2YgTG9nRGVsaXZlcnlBZ2VudCB0cmlnZ2VyZWQnKTtcbiAgICAgICAgaWYgKHRoaXMudGltZW91dElkKSBjbGVhclRpbWVvdXQodGhpcy50aW1lb3V0SWQpO1xuICAgICAgICB0aGlzLnN0YW5kYXJkT3V0UGFzc1Rocm91Z2guZGVzdHJveSgpO1xuICAgICAgICB0aGlzLm5ld1JlbGljTG9nVHJhbnNwb3J0LmNsb3NlKCk7XG4gICAgICAgIHRoaXMud3JpdGVMb2dzU3luYygpO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogRGV0ZXJtaW5lIGlmIHRoZSBsb2cgc3RyaW5nIG9yIG9iamVjdCBpcyBhIE5ldyBSZWxpYyBcbiAgICAgKiBjb21wYXRpYmxlIEpTT04uIEluIG9yZGVyIHRvIGJlIGNvbnNpZGVyZWQgdGhpcyBpdCBtdXN0XG4gICAgICogYmUgYSB3ZWxsIHN0cnVjdHVyZWQgSlNPTiBvYmplY3Qgd2l0aCBhIHRvcCBsZXZlbCAnbWVzc2FnZSdcbiAgICAgKiBhbmQgJ2xldmVsJyBwcm9wZXJ0eS5cbiAgICAgKiBAcGFyYW0gc3RyIFxuICAgICAqIEByZXR1cm5zIG9iamVjdCBmb3JtIG9mIEpTT04gb3IgZmFsc2VcbiAgICAgKi9cbiAgICBwcml2YXRlIGlzTlJDb21wYXRpYmxlSnNvbkxvZ1N0cmluZyhzdHI6IHN0cmluZyB8IG9iamVjdCkge1xuICAgICAgICBpZiAodHlwZW9mIHN0ciA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIHN0ciA9IEpTT04uc3RyaW5naWZ5KHN0cik7XG4gICAgICAgIH1cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IG9iaiA9IEpTT04ucGFyc2Uoc3RyIGFzIHN0cmluZyk7XG4gICAgICAgICAgICAvLyBSZXdyaXRlIGJvb3RzdHJhcCBvYmplY3QgaW50byBhIGZvcm1hdCB0aGF0IHdpbGwgd29yayBmb3IgbmV3IHJlbGljXG4gICAgICAgICAgICBpZiAob2JqLm1zZyAmJiBvYmo/Lm5hbWUoJ25ld3JlbGljX2Jvb3RzdHJhcCcpICYmICFvYmoubWVzc2FnZSkge1xuICAgICAgICAgICAgICAgIG9iai5tZXNzYWdlID0gb2JqLm1zZztcbiAgICAgICAgICAgICAgICBvYmoubGV2ZWwgPSAnaW5mbyc7XG4gICAgICAgICAgICAgICAgZGVsZXRlIG9iai5tc2c7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAob2JqICYmIHR5cGVvZiBvYmogPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgICAgICBpZiAob2JqLm1lc3NhZ2UgJiYgb2JqLmxldmVsKSB7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7IH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEludGVybmFsIGZ1bmN0aW9uIHVzZWQgdG8gYWNjZXB0IGxvZyBzdGF0ZW1lbnRzIGFuZFxuICAgICAqIHByb2Nlc3MgdGhlbS4gTG9nIGlzIHR5cGVkIHRvIGFueSB0byBmaXQgdHlwaW5nIGZvclxuICAgICAqIHRoZSBXaW5zdG9uIHRyYW5zcG9ydC5cbiAgICAgKiBcbiAgICAgKiBUT0RPOiBSZXdvcmsgdGhlIFdpbnN0b24gdHJhbnNwb3J0IGxvZ2ljIHRvIGRvIGEgYml0XG4gICAgICogICAgICBtb3JlIHdvcmsgdG8gcHJvdmlkZSBtb3JlIGNvbnNpc3RlbnQgdHlwaW5nLlxuICAgICAqIFxuICAgICAqIEBwYXJhbSBsb2cgXG4gICAgICogQHBhcmFtIGNhbGxiYWNrIFxuICAgICAqL1xuICAgIHByaXZhdGUgYWRkTG9nKGxvZzogYW55LCBjYWxsYmFjazogKCgpID0+IHZvaWQpIHwgdW5kZWZpbmVkKSB7XG4gICAgICAgIGNvbnN0IGpzb25EYXRhID0gdGhpcy5pc05SQ29tcGF0aWJsZUpzb25Mb2dTdHJpbmcobG9nKTtcbiAgICAgICAgaWYoanNvbkRhdGEpIHtcbiAgICAgICAgICAgIHRoaXMucHJvY2Vzc0FzSnNvbkxvZyhqc29uRGF0YSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnByb2Nlc3NBc1N0cmluZ0xvZyhsb2cpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuaW1tZWRpYXRlTG9nV3JpdGFibGVQcmVkaWNhdGUoKSkge1xuICAgICAgICAgICAgdGhpcy5iZWdpbldyaXRlTG9ncygpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGpzb25EYXRhKSBsb2cgPSBKU09OLnN0cmluZ2lmeShsb2cpKydcXG4nO1xuICAgIFxuICAgICAgICBpZiAoanNvbkRhdGE/Lm1lc3NhZ2UgJiYganNvbkRhdGE/LmxldmVsID09PSAnZXJyb3InKSB7XG4gICAgICAgICAgICB0aGlzLnN0YW5kYXJkT3V0UGFzc1Rocm91Z2guc3RkZXJyQnlwYXNzKGxvZyk7XG4gICAgICAgIH0gZWxzZSBpZihqc29uRGF0YS5tZXNzYWdlKSB7XG4gICAgICAgICAgICB0aGlzLnN0YW5kYXJkT3V0UGFzc1Rocm91Z2guc3Rkb3V0QnlwYXNzKGxvZyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY2FsbGJhY2spIGNhbGxiYWNrKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSGFuZGxlciBmb3IgcHJvY2Vzc2luZyBhIGxvZyBzdGF0ZW1lbnQgd2hlbiBpdCBpcyBmb3JtYXR0ZWRcbiAgICAgKiBhcyBhIE5ldyBSZWxpYyBjb21wYXRpYmxlIEpTT04gc3RyaW5nLlxuICAgICAqIEBwYXJhbSBsb2cgXG4gICAgICovXG4gICAgcHJvY2Vzc0FzSnNvbkxvZyhsb2c6IGFueSkge1xuICAgICAgICB0aGlzLmxvZ1RyYW5zZm9ybShsb2cpO1xuICAgICAgICBjb25zdCBsb2dTdHJpbmcgPSBKU09OLnN0cmluZ2lmeShsb2cpO1xuICAgICAgICBjb25zdCBsZW5ndGggPSBCdWZmZXIuYnl0ZUxlbmd0aChsb2dTdHJpbmcpO1xuICAgICAgICB0aGlzLmxvZ1F1ZXVlLnB1c2gobG9nKTtcbiAgICAgICAgdGhpcy5sb2dMZW5ndGhRdWV1ZS5wdXNoKGxlbmd0aCk7XG4gICAgICAgIHRoaXMudG90YWxMZW5ndGhDb3VudCArPSBsZW5ndGg7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSGFuZGxlciBmb3IgcHJvY2Vzc2luZyBhIGxvZyBzdGF0ZW1lbnQgdGhhdCBpcyBhIHNpbXBsZVxuICAgICAqIHN0cmluZyBmb3JtYXQuXG4gICAgICogQHBhcmFtIGxvZyBcbiAgICAgKi9cbiAgICBwcm9jZXNzQXNTdHJpbmdMb2cobG9nOiBzdHJpbmcpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBsb2cgPT09ICdzdHJpbmcnICYmIGxvZy5lbmRzV2l0aCgnXFxuJykpIHtcbiAgICAgICAgICAgIGxvZyA9IGxvZy5zdWJzdHJpbmcoMCwgbG9nLmxlbmd0aCAtIDEpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbmV3UmVsaWNNZXRhZGF0YSA9IG5ld3JlbGljLmdldExpbmtpbmdNZXRhZGF0YSgpO1xuICAgICAgICBjb25zdCBzdHJ1Y3R1cmVkTG9nID0ge1xuICAgICAgICAgICAgbWVzc2FnZTogbG9nLFxuICAgICAgICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxuICAgICAgICAgICAgb3JpZ2luYWxfdGltZXN0YW1wOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICAgICAgICBcImVudGl0eS5uYW1lXCI6IG5ld1JlbGljTWV0YWRhdGFbJ2VudGl0eS5uYW1lJ10sXG4gICAgICAgICAgICBcImVudGl0eS50eXBlXCI6IG5ld1JlbGljTWV0YWRhdGFbJ2VudGl0eS50eXBlJ10sXG4gICAgICAgICAgICBob3N0bmFtZTogbmV3UmVsaWNNZXRhZGF0YS5ob3N0bmFtZVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QganNvbkxvZ1N0cmluZyA9IEpTT04uc3RyaW5naWZ5KHN0cnVjdHVyZWRMb2cpO1xuICAgICAgICBjb25zdCBsZW5ndGggPSBCdWZmZXIuYnl0ZUxlbmd0aChqc29uTG9nU3RyaW5nKTtcbiAgICAgICAgdGhpcy5sb2dRdWV1ZS5wdXNoKHN0cnVjdHVyZWRMb2cpO1xuICAgICAgICB0aGlzLmxvZ0xlbmd0aFF1ZXVlLnB1c2gobGVuZ3RoKTtcbiAgICAgICAgdGhpcy50b3RhbExlbmd0aENvdW50ICs9IGxlbmd0aDtcbiAgICB9XG4gICAgXG4gICAgLyoqXG4gICAgICogU2V0IGdsb2JhbCBhdHRyaWJ1dGVzIGZvciB0aGUgYXBwbGljYXRpb24uICBUaGlzIHNob3VsZFxuICAgICAqIGdlbmVyYWxseSBiZSBjb25maWd1cmVkIGVhcmx5IGluIHRoZSBhcHBsaWNhdGlvbiBsaWZlY3ljbGUuXG4gICAgICogR2xvYmFsIGF0dHJpYnV0ZXMgd2lsbCBiZSBib3VuZCB0byBhbGwgbG9nIHN0YXRlbWVudHNcbiAgICAgKiBpbiBOZXcgUmVsaWMuXG4gICAgICogQHBhcmFtIGF0dHJpYnV0ZXMgS1YgcGFpcnMgdG8gYmUgcHJvdmlkZWQgdG8gTlIgd2l0aCBsb2dzXG4gICAgICovXG4gICAgc2V0R2xvYmFsQXR0cmlidXRlcyhhdHRyaWJ1dGVzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSkge1xuICAgICAgICB0aGlzLmdsb2JhbEF0dHJpYnV0ZXMgPSBhdHRyaWJ1dGVzO1xuICAgIH0gIFxuXG4gICAgLyoqXG4gICAgICogV3JpdGVzIGxvZ3Mgc3luY2hyb25vdXNseS4gIFRoaXMgZnVuY3Rpb24gaXMgaW50ZW5kZWQgdG8gYmVcbiAgICAgKiB1dGlsaXplZCBpbiBzaXR1YXRpb25zIHdoZXJlIGxvZ2dpbmcgY2Fubm90IGJlIHdyaXR0ZW4gXG4gICAgICogYXN5bmNocm9ub3VzbHksIG1vc3QgY29tbW9ubHkgaW4gdGhlIGhhbmRsZXIgb2YgYSBTSUdURVJNXG4gICAgICogZXZlbnQsIHdoaWNoIG9ubHkgYWxsb3dzIHN5bmNocm9ub3VzIGNhbGxzLlxuICAgICAqL1xuICAgIHByaXZhdGUgd3JpdGVMb2dzU3luYygpIHtcbiAgICAgICAgY29uc3QgbG9nc1RvV3JpdGUgPSB0aGlzLnNsaWNlTG9ncygpO1xuICAgICAgICBpbnRlcm5hbExvZygnc2lsbHknLCBgUHJlcGFyaW5nIGZpbmFsIGxvZyBwYXlsb2FkIG9mICR7bG9nc1RvV3JpdGUubGVuZ3RofSBmb3IgTlIgY29sbGVjdG9yYCk7XG4gICAgICAgIGNvbnN0IHJhd1BheWxvYWQgPSB0aGlzLmJ1aWxkUmF3UG9zdEJvZHkobG9nc1RvV3JpdGUpO1xuICAgICAgICBjb25zdCBjb21wcmVzc2VkUGF5bG9hZCA9IHpsaWIuZ3ppcFN5bmMocmF3UGF5bG9hZCk7XG4gICAgICAgIGlmICghdGhpcy5kZWJ1Z01vZGUpIHtcbiAgICAgICAgICAgIHRoaXMuc2VuZExvZ3MoY29tcHJlc3NlZFBheWxvYWQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy53cml0ZUxvZ3NUb0ZpbGVTeXN0ZW0oY29tcHJlc3NlZFBheWxvYWQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIHdyaXRlTG9nc1RvRmlsZVN5c3RlbShidWZmZXI6IEJ1ZmZlcikge1xuICAgICAgICBmcy53cml0ZUZpbGVTeW5jKGB0ZXN0LSR7dGhpcy5sb2dzV3JpdHRlbisrfS5nemAsIGJ1ZmZlcik7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBiZWdpbldyaXRlTG9ncygpIHtcbiAgICAgICAgY29uc3QgbG9nc1RvV3JpdGUgPSB0aGlzLnNsaWNlTG9ncygpO1xuXG4gICAgICAgIGludGVybmFsTG9nKCdzaWxseScsIGBQcmVwYXJpbmcgbG9nIHBheWxvYWQgb2YgJHtsb2dzVG9Xcml0ZS5sZW5ndGh9IGZvciBOUiBjb2xsZWN0b3JgKTtcbiAgICAgICAgY29uc3QgcmF3UGF5bG9hZCA9IHRoaXMuYnVpbGRSYXdQb3N0Qm9keShsb2dzVG9Xcml0ZSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBjb21wcmVzc2VkUGF5bG9hZDogQnVmZmVyID0gYXdhaXQgdGhpcy5jb21wcmVzc1BheWxvYWQocmF3UGF5bG9hZCk7XG4gICAgICAgICAgICBpZiAoIXRoaXMuZGVidWdNb2RlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZW5kTG9ncyhjb21wcmVzc2VkUGF5bG9hZCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMud3JpdGVMb2dzVG9GaWxlU3lzdGVtKGNvbXByZXNzZWRQYXlsb2FkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zdCBmYWxsYmFja01lc3NhZ2UgPSAnVW5rbm93biBlcnJvciBvY2N1cnJlZCB3aGlsZSBjb21wcmVzc2luZyBsb2dzIHRvIHNlbmQgdG8gTmV3IFJlbGljJztcbiAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnIgaW5zdGFuY2VvZiBFcnJvciAmJiBlcnIuc3RhY2sgPyBlcnIuc3RhY2sgOiBmYWxsYmFja01lc3NhZ2U7IFxuICAgICAgICAgICAgaW50ZXJuYWxMb2coJ2Vycm9yJywgbWVzc2FnZSlcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEhhbmRsZXMgSFRUUCByZXF1ZXN0IHRoYXQgc2VuZHMgY29tcHJlc3NlZCBsb2cgZGF0YVxuICAgICAqIHRvIHRoZSBOZXcgUmVsaWMgZW5kcG9pbnQuXG4gICAgICogQHBhcmFtIGNvbXByZXNzZWRQYXlsb2FkIFxuICAgICAqL1xuICAgIHByaXZhdGUgc2VuZExvZ3MoY29tcHJlc3NlZFBheWxvYWQ6IEJ1ZmZlcikge1xuICAgICAgICBBeGlvcy5wb3N0KGBodHRwczovLyR7QVBJX0hPU1ROQU1FfSR7QVBJX1BBVEh9YCwgY29tcHJlc3NlZFBheWxvYWQsIHtcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAnQWNjZXB0JzogJyovKicsXG4gICAgICAgICAgICAgICAgJ0FwaS1LZXknOiBwcm9jZXNzLmVudi5ORVdfUkVMSUNfTElDRU5TRV9LRVkgYXMgc3RyaW5nLFxuICAgICAgICAgICAgICAgICdDb250ZW50LUVuY29kaW5nJzogJ2d6aXAnLFxuICAgICAgICAgICAgICAgICdDb250ZW50LUxlbmd0aCc6ICcnK2NvbXByZXNzZWRQYXlsb2FkLmJ5dGVMZW5ndGgsXG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9nemlwJyxcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgICAgICBpZiAoWzIwMCwgMjAyXS5pbmNsdWRlcyhyZXNwb25zZS5zdGF0dXMpKSB7XG4gICAgICAgICAgICAgICAgaW50ZXJuYWxMb2coJ3NpbGx5JywgYExvZyBwYXlsb2FkIGFjY2VwdGVkIGJ5IE5ldyBSZWxpYyBBUEkuIFJlcXVlc3QgSUQ6ICR7cmVzcG9uc2UuZGF0YS5yZXF1ZXN0SWR9YClcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaW50ZXJuYWxMb2coJ3dhcm4nLCBgVW5leHBlY3RlZCBzdWNjZXNzZnVsIHJlc3BvbnNlIHN0YXR1cyBjb2RlIGZyb20gTlI6ICR7cmVzcG9uc2Uuc3RhdHVzfWApXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSkuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgICAgIGludGVybmFsTG9nKCdlcnJvcicsICdFcnJvciBzZW5kaW5nIGxvZyBwYXlsb2FkIHRvIE5ldyBSZWxpYycpO1xuICAgICAgICAgICAgaW50ZXJuYWxMb2coJ2Vycm9yJywgZXJyLnN0YWNrKVxuICAgICAgICB9KVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgdGhlIGdyZWF0ZXIgb2JqZWN0IHN0cnVjdHVyZSBmb3IgYSBsb2cgZGVsaXZlcnkgXG4gICAgICogcGF5bG9hZCBhbmQgYXR0YWNoZXMgYW4gYXJyYXkgb2YgbG9ncyB0byBpdC4gUmV0dXJucyBcbiAgICAgKiBzdHJpbmdpZmllZC5cbiAgICAgKiBAcGFyYW0gbG9ncyBcbiAgICAgKiBAcmV0dXJucyBcbiAgICAgKi9cbiAgICBwcml2YXRlIGJ1aWxkUmF3UG9zdEJvZHkobG9nczogYW55W10pOiBzdHJpbmcge1xuICAgICAgICBjb25zdCBwYXlsb2FkID0gW3tcbiAgICAgICAgICAgIGNvbW1vbjoge1xuICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgLi4udGhpcy5nbG9iYWxBdHRyaWJ1dGVzLFxuICAgICAgICAgICAgICAgICAgICBzZXJ2aWNlOiBwcm9jZXNzLmVudi5ORVdfUkVMSUNfQVBQX05BTUVcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGxvZ3M6IGxvZ3NcbiAgICAgICAgfV07XG4gICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShwYXlsb2FkKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBc3luY2hyb25vdXNseSBjb21wcmVzcyBzdHJpbmcgdG8gZ3ppcCBjb21wcmVzc2VkIGRhdGEuXG4gICAgICogQHBhcmFtIHJhd1BheWxvYWQgXG4gICAgICogQHJldHVybnMgXG4gICAgICovXG4gICAgcHJpdmF0ZSBhc3luYyBjb21wcmVzc1BheWxvYWQocmF3UGF5bG9hZDogc3RyaW5nKTogUHJvbWlzZTxCdWZmZXI+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPEJ1ZmZlcj4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgemxpYi5nemlwKEJ1ZmZlci5mcm9tKHJhd1BheWxvYWQsICd1dGY4JyksIChlcnIsIGNvbXByZXNzZWRQYXlsb2FkKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikgcmVqZWN0KGVycik7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShjb21wcmVzc2VkUGF5bG9hZCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2xpY2VzIGxvZyBxdWV1ZS5cbiAgICAgKiBXaWxsIHByZWZlciB0byB1c2UgdGhlIGVudGlyZSBsb2cgcXVldWUgd2hlbiBwb3NzaWJsZSwgYnV0XG4gICAgICogbWF5IHNlbmQgb25seSBhIHN1YnNlY3Rpb24gaWYgdGhlIHNpemUgb2YgdGhlIGRhdGEgaXMgbmVhclxuICAgICAqIHRoZSBsaW1pdGF0aW9ucyBkZWZpbmVkIGJ5IE5ldyBSZWxpYydzIEFQSS5cbiAgICAgKiBAcmV0dXJucyBcbiAgICAgKi9cbiAgICBwcml2YXRlIHNsaWNlTG9ncygpIHtcbiAgICAgICAgbGV0IGxvZ3NUb1NlbmQ7XG4gICAgICAgIFxuICAgICAgICAvLyBJZiB3ZSBrbm93IHRoZSB0b3RhbCBsZW5ndGggd2lsbCBub3QgZXhjZWVkIG1heGltdW0gbGVuZ3RoIHNpemVcbiAgICAgICAgaWYgKHRoaXMudG90YWxMZW5ndGhDb3VudCA8IE1BWF9QQVlMT0FEX1NJWkUpIHtcbiAgICAgICAgICAgIFtsb2dzVG9TZW5kLCB0aGlzLmxvZ1F1ZXVlXSA9IFt0aGlzLmxvZ1F1ZXVlLCBbXV07XG4gICAgICAgICAgICB0aGlzLmxvZ0xlbmd0aFF1ZXVlID0gW107XG4gICAgICAgICAgICB0aGlzLnRvdGFsTGVuZ3RoQ291bnQgPSAwO1xuICAgICAgICAgICAgcmV0dXJuIGxvZ3NUb1NlbmQ7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBvdGhlcndpc2UsIHNsaWNlIG9mZiBhIHNsaWNlIG9mIGxvZ3MgdGhhdCB3aWxsIGZpdCBpbnRvIGEgc2luZ2xlIHJlcXVlc3RcbiAgICAgICAgbGV0IGxvZ1NpemUgPSAwO1xuICAgICAgICBsZXQgbG9nU2xpY2VJbmRleCA9IDA7XG5cbiAgICAgICAgd2hpbGUoKHRoaXMubG9nUXVldWUubGVuZ3RoID4gMCkgJiYgKGxvZ1NpemUgKyB0aGlzLmxvZ0xlbmd0aFF1ZXVlWzBdIDwgTUFYX1BBWUxPQURfU0laRSkpIHtcbiAgICAgICAgICAgIGxvZ1NsaWNlSW5kZXgrKztcbiAgICAgICAgfVxuXG4gICAgICAgIGxvZ3NUb1NlbmQgPSB0aGlzLmxvZ1F1ZXVlLnNsaWNlKDAsIGxvZ1NsaWNlSW5kZXgpO1xuICAgICAgICB0aGlzLmxvZ1F1ZXVlID0gdGhpcy5sb2dRdWV1ZS5zbGljZShsb2dTbGljZUluZGV4KTtcbiAgICAgICAgdGhpcy5sb2dMZW5ndGhRdWV1ZSA9IHRoaXMubG9nTGVuZ3RoUXVldWUuc2xpY2UobG9nU2xpY2VJbmRleCk7XG5cbiAgICAgICAgcmV0dXJuIGxvZ3NUb1NlbmQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUHJlZGljYXRlIHRvIGRldGVybWluZSBpZiBsb2dzIHNob3VsZCBiZSB3cml0dGVuIGJlIHdyaXR0ZW4gaW1tZWRpYXRlbHkuXG4gICAgICogQHJldHVybnMgYm9vbGVhblxuICAgICAqL1xuICAgIHByaXZhdGUgaW1tZWRpYXRlTG9nV3JpdGFibGVQcmVkaWNhdGUoKTogYm9vbGVhbiB7XG4gICAgICAgIGlmICh0aGlzLmxvZ1F1ZXVlLmxlbmd0aCA+ICh0aGlzLmNvbmZpZy5taW5Mb2dJdGVtc1RvRm9yY2UgfHwgMTAwKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFByZWRpY2F0ZSB0byBkZXRlcm1pbmUgaWYgbG9ncyBzaG91bGQgYmUgd3JpdHRlbiBvbiBuZXh0IHBlcmlvZGljIGNoZWNrLlxuICAgICAqIEByZXR1cm5zIGJvb2xlYW5cbiAgICAgKi9cbiAgICBwcml2YXRlIGxvZ3NXcml0YWJsZVByZWRpY2F0ZSgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWluTG9nSXRlbXNFeGNlZWRlZCgpXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUHJlZGljYXRlIHRvIGRldGVybWluZSBpZiB0aGUgdG90YWwgbG9ncyBoYXZlIGV4Y2VlZGVkIGEgY29uZmlndXJlZCBtaW5Mb2dcbiAgICAgKiBjb3VudCB2YWx1ZSBpZiBzdWNoIGEgdmFsdWUgaXMgY29uZmlndXJlZC5cbiAgICAgKiBAcmV0dXJucyBcbiAgICAgKi9cbiAgICBwcml2YXRlIG1pbkxvZ0l0ZW1zRXhjZWVkZWQoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiAhISh0aGlzLmNvbmZpZy5taW5Mb2dJdGVtcyAmJiAodGhpcy5sb2dRdWV1ZS5sZW5ndGggPiB0aGlzLmNvbmZpZy5taW5Mb2dJdGVtcykpO1xuICAgIH0gICAgXG4gICAgXG4gICAgLyoqXG4gICAgICogRml4ZXMgcG9zc2libGUgaXNzdWVzIGluIGxvZyBmb3JtYXQgY2F1c2VkIGJ5IGxpbWl0YXRpb25zIG9mIE5ScyBsb2dnaW5nXG4gICAgICogdmFsdWVzXG4gICAgICogQHBhcmFtIGxvZyBcbiAgICAgKiBAcmV0dXJucyBcbiAgICAgKi9cbiAgICBwcml2YXRlIGxvZ1RyYW5zZm9ybShsb2c6IGFueSkge1xuICAgICAgICBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMobG9nKS5sZW5ndGggPiBNQVhfQVRUUklCVVRFU19QRVJfRVZFTlQpIHtcbiAgICAgICAgICAgIGludGVybmFsTG9nKCd3YXJuJywgYExvZyB0byBzZW5kIHRvIEpTT04gY29udGFpbnMgJHtPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhsb2cpfSAvICR7TUFYX0FUVFJJQlVURVNfUEVSX0VWRU5UfSBhdHRyaWJ1dGVzLmApO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBmb3IgKGxldCBrZXkgb2YgT2JqZWN0LmtleXMobG9nKSkge1xuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBsb2dba2V5XTtcbiAgICAgICAgICAgIC8vIHJlcGxhY2Uga2V5IHdpdGggbGVuZ3RoIHRvbyBoaWdoXG4gICAgICAgICAgICBpZiAoa2V5Lmxlbmd0aCA+IE1BWF9BVFRSSUJVVEVfTkFNRV9MRU5HVEgpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBuZXdLZXkgPSBrZXkuc2xpY2UoMCwgTUFYX0FUVFJJQlVURV9OQU1FX0xFTkdUSCk7XG4gICAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGxvZywga2V5LnNsaWNlKDAsIE1BWF9BVFRSSUJVVEVfTkFNRV9MRU5HVEgpLCBcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihsb2csIGtleSBhcyBQcm9wZXJ0eUtleSkgYXMgUHJvcGVydHlEZXNjcmlwdG9yKTtcbiAgICAgICAgICAgICAgICBkZWxldGUgbG9nLmtleTtcblxuICAgICAgICAgICAgICAgIC8vIFVwZGF0ZSBrZXkgbmFtZSBmb3IgdXNhZ2UgaW4gbGF0ZXIgc3RlcHNcbiAgICAgICAgICAgICAgICBrZXkgPSBuZXdLZXk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIENvbmNhdGVuYXRlIGxvZyBtZXNzYWdlcyB3aXRoIGxlbmd0aCBncmVhdGVyIHRoYW4gTUFYX0FUVFJJQlVURV9WQUxVRV9MRU5HVEhcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmIHZhbHVlLmxlbmd0aCA+IE1BWF9BVFRSSUJVVEVfVkFMVUVfTEVOR1RIKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY29uZmlnPy53YXJuT25BdHRyaWJ1dGVMZW5ndGhPdmVyZmxvdykge1xuICAgICAgICAgICAgICAgICAgICBpbnRlcm5hbExvZygnd2FybicsIGBOUiBMb2cgYXR0cmlidXRlIGxlbmd0aCBvdmVyZmxvdy4gTGVuZ3RoOiAke3ZhbHVlLmxlbmd0aH0vJHtNQVhfQVRUUklCVVRFX1ZBTFVFX0xFTkdUSH1gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbG9nLmtleSA9IHZhbHVlLnNsaWNlKDAsIE1BWF9BVFRSSUJVVEVfVkFMVUVfTEVOR1RIKTsgXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChrZXkuaW5jbHVkZXMoJyAnKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG5ld0tleSA9IGtleS5yZXBsYWNlQWxsKCcgJywgJy4nKTtcbiAgICAgICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobG9nLCBrZXkuc2xpY2UoMCwgTUFYX0FUVFJJQlVURV9OQU1FX0xFTkdUSCksIFxuICAgICAgICAgICAgICAgICAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGxvZywga2V5IGFzIFByb3BlcnR5S2V5KSBhcyBQcm9wZXJ0eURlc2NyaXB0b3IpO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBsb2cua2V5O1xuXG4gICAgICAgICAgICAgICAgLy8gVXBkYXRlIGtleSBuYW1lIGZvciB1c2FnZSBpbiBsYXRlciBzdGVwc1xuICAgICAgICAgICAgICAgIGtleSA9IG5ld0tleTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiB1c2VkIHRvIHJlcGVhdGVkbHkgdHJpZ2dlciBsb2cgcHVzaGVzXG4gICAgICovXG4gICAgcHJpdmF0ZSBjcmVhdGVMb2dDaGVja1RpbWVvdXQoKSB7XG4gICAgICAgIHRoaXMudGltZW91dElkID0gc2V0VGltZW91dChhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy5sb2dRdWV1ZS5sZW5ndGggPiAodGhpcy5jb25maWcubWluTG9nSXRlbXMgfHwgMSkpIHtcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLmJlZ2luV3JpdGVMb2dzKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5jcmVhdGVMb2dDaGVja1RpbWVvdXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdGhpcy5jb25maWcubG9nUHVzaEZyZXF1ZW5jeSlcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBIZWxwZXIgbWV0aG9kIHRoYXQgcmVnaXN0ZXJzIGxpc3RlbmVycyBmb3IgZXZlbnRzXG4gICAgICogcmVsYXRlZCB0byBpbW1pbmVudCBhcHBsaWNhdGlvbiBzaHV0ZG93biBzbyB0aGF0XG4gICAgICogZmluYWwgbG9ncyBjYW4gYmUgcHVzaGVkXG4gICAgICovXG4gICAgcHJpdmF0ZSByZWdpc3RlckFwcERlYXRoTG9nUHVzaCgpIHtcbiAgICAgICAgbGV0IGZpbmFsV3JpdHRlbiA9IGZhbHNlO1xuICAgICAgICBwcm9jZXNzLm9uKCdleGl0JywgKCkgPT4ge1xuICAgICAgICAgICAgaWYgKHRoaXMudGltZW91dElkKSBjbGVhclRpbWVvdXQodGhpcy50aW1lb3V0SWQpO1xuICAgICAgICAgICAgbGV0IG8gPSBmaW5hbFdyaXR0ZW47XG4gICAgICAgICAgICBmaW5hbFdyaXR0ZW4gPSB0cnVlO1xuICAgICAgICAgICAgaWYgKG8pIHJldHVybjtcblxuICAgICAgICAgICAgaW50ZXJuYWxMb2coJ2luZm8nLCAnd3JpdGluZyBmaW5hbCBsb2dzJyk7XG5cbiAgICAgICAgICAgIHRoaXMud3JpdGVMb2dzU3luYygpO1xuICAgICAgICB9KTtcblxuICAgICAgICBwcm9jZXNzLm9uKCdTSUdJTlQnLCAoKSA9PiB7XG4gICAgICAgICAgICBwcm9jZXNzLmV4aXQoMik7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHByb2Nlc3Mub24oJ3VuY2F1Z2h0RXhjZXB0aW9uJywgKGUpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGUpO1xuICAgICAgICAgICAgaW50ZXJuYWxMb2coJ2Vycm9yJywgZS5zdGFjayB8fCAnJyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHByb2Nlc3Mub24oJ1NJR1RFUk0nLCAoKSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy50aW1lb3V0SWQpIGNsZWFyVGltZW91dCh0aGlzLnRpbWVvdXRJZCk7XG4gICAgICAgICAgICB0aGlzLndyaXRlTG9nc1N5bmMoKTtcbiAgICAgICAgfSlcbiAgICB9XG59XG5cbi8qKlxuICogUmVwbGFjZXMgZXhpc3Rpbmcgd3JpdGVycyBmb3Igc3Rkb3V0IGFuZCBzdGRlcnIgd2l0aFxuICogUGFzc1Rocm91Z2ggc3RyZWFtcyB0aGF0IHdpbGwgaW52b2tlIHByb3ZpZGVkIGNhbGxiYWNrc1xuICogd2l0aCB0aGUgZGF0YSBwcmlvciB0byBwYXNzaW5nIHRoZW0gdG8gdGhlIG9yaWdpbmFsIHN0cmVhbXNcbiAqL1xuY2xhc3MgU3RhbmRhcmRPdXRQYXNzVGhyb3VnaCB7XG5cblxuICAgIHByaXZhdGUgcmVhZG9ubHkgc3Rkb3V0UHQgPSBuZXcgUGFzc1Rocm91Z2goKTtcbiAgICBwcml2YXRlIHJlYWRvbmx5IHN0ZGVyclB0ID0gbmV3IFBhc3NUaHJvdWdoKCk7XG5cbiAgICBwcml2YXRlIHJlYWRvbmx5IHN0ZG91dDtcbiAgICBwcml2YXRlIHJlYWRvbmx5IHN0ZGVycjtcblxuICAgIHByaXZhdGUgcmVhZG9ubHkgd3JpdGVTdGRvdXQ7XG4gICAgcHJpdmF0ZSByZWFkb25seSB3cml0ZVN0ZGVycjtcblxuICAgIGNvbnN0cnVjdG9yKHN0ZG91dENiOiAoZGF0YTogc3RyaW5nKSA9PiB2b2lkLCBzdGRlcnJDYjogKGRhdGE6IHN0cmluZykgPT4gdm9pZCkge1xuICAgICAgICAvLyBTdG9yZSBvcmlnaW5hbCB3cml0ZSBzdGRvdXQvc3RkZXJyIHdyaXRlIGZ1bmN0aW9uc1xuICAgICAgICB0aGlzLnN0ZG91dCA9IHByb2Nlc3Muc3Rkb3V0LndyaXRlO1xuICAgICAgICB0aGlzLnN0ZGVyciA9IHByb2Nlc3Muc3RkZXJyLndyaXRlO1xuXG4gICAgICAgIC8vIENyZWF0ZSBmdW5jdGlvbnMgd2hpY2ggd3JpdGUgdG8gb3JpZ2luYWwgd3JpdGVzIHdpdGggc3Rkb3V0L3N0ZGVyciBjb250ZXh0cyBib3VuZFxuICAgICAgICB0aGlzLndyaXRlU3Rkb3V0ID0gKGRhdGE6IHN0cmluZykgPT4gdGhpcy5zdGRvdXQuY2FsbChwcm9jZXNzLnN0ZG91dCwgZGF0YSk7XG4gICAgICAgIHRoaXMud3JpdGVTdGRlcnIgPSAoZGF0YTogc3RyaW5nKSA9PiB0aGlzLnN0ZGVyci5jYWxsKHByb2Nlc3Muc3RkZXJyLCBkYXRhKTtcblxuICAgICAgICAvLyBBc3NpZ24gbGlzdGVuZXJzIHRvIFBhc3NUaHJvdWdoc1xuICAgICAgICB0aGlzLnN0ZG91dFB0Lm9uKCdkYXRhJywgKGRhdGEpID0+IHtcbiAgICAgICAgICAgIGlmIChkYXRhIGluc3RhbmNlb2YgQnVmZmVyKSB7XG4gICAgICAgICAgICAgICAgZGF0YSA9IGRhdGEudG9TdHJpbmcoJ3V0ZjgnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN0ZG91dENiKGRhdGEpO1xuICAgICAgICAgICAgdGhpcy53cml0ZVN0ZG91dChkYXRhKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5zdGRlcnJQdC5vbignZGF0YScsIChkYXRhKSA9PiB7XG4gICAgICAgICAgICBpZiAoZGF0YSBpbnN0YW5jZW9mIEJ1ZmZlcikge1xuICAgICAgICAgICAgICAgIGRhdGEgPSBkYXRhLnRvU3RyaW5nKCd1dGY4Jyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzdGRlcnJDYihkYXRhKTtcbiAgICAgICAgICAgIHRoaXMud3JpdGVTdGRlcnIoZGF0YSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIFJlcGxhY2Ugb3JpZ2luYWwgd3JpdGUgY2FsbHMgd2l0aCBjb250ZXh0cyBib3VuZCB0byBwYXJlbnQgb2JqZWN0XG4gICAgICAgIHByb2Nlc3Muc3Rkb3V0LndyaXRlID0gdGhpcy5zdGRvdXRQdC53cml0ZS5iaW5kKHRoaXMuc3Rkb3V0UHQpIGFzIGFueTtcbiAgICAgICAgcHJvY2Vzcy5zdGRlcnIud3JpdGUgPSB0aGlzLnN0ZGVyclB0LndyaXRlLmJpbmQodGhpcy5zdGRlcnJQdCkgYXMgYW55O1xuXG4gICAgICAgIC8vIEFkZCB1bmNhdWdodCBlcnJvciBoYW5kbGVyIHRvIGhhbmRsZSBsb2dnaW5nIG9mIGZhaWx1cmUgY2FzZVxuICAgICAgICBwcm9jZXNzLm9uKCd1bmNhdWdodEV4Y2VwdGlvbicsIChlcnIpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVhZmZpeCB0aGUgcmVwbGFjZWQgc3Rkb3V0IGFuZCBzdGRlcnIgdGhlblxuICAgICAqIGNsb3NlcyBhbGwgc3RyZWFtcyBvd25lZCBieSB0aGlzIGluc3RhbmNlLlxuICAgICAqL1xuICAgIHB1YmxpYyBkZXN0cm95KCkge1xuICAgICAgICBwcm9jZXNzLnN0ZG91dC53cml0ZSA9IHRoaXMuc3Rkb3V0O1xuICAgICAgICBwcm9jZXNzLnN0ZGVyci53cml0ZSA9IHRoaXMuc3RkZXJyO1xuXG4gICAgICAgIHRoaXMuc3Rkb3V0UHQuZGVzdHJveSgpXG4gICAgICAgIHRoaXMuc3RkZXJyUHQuZGVzdHJveSgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEJ5cGFzcyB0aGUgY29uZmlndXJlZCBjYWxsYmFjayBmdW5jdGlvbiBmb3Igc3Rkb3V0IGJ5XG4gICAgICogd3JpdGluZyBkaXJlY3RseSB0byB0aGUgZGV0YWNoZWQgb3V0cHV0IHN0cmVhbVxuICAgICAqIEBwYXJhbSBkYXRhIFxuICAgICAqL1xuICAgIHB1YmxpYyBzdGRvdXRCeXBhc3MoZGF0YTogc3RyaW5nIHwgb2JqZWN0KSB7XG4gICAgICAgIGlmIChkYXRhIGluc3RhbmNlb2YgT2JqZWN0KSB7XG4gICAgICAgICAgICBkYXRhID0gSlNPTi5zdHJpbmdpZnkoZGF0YSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy53cml0ZVN0ZG91dCgoZGF0YSBhcyB1bmtub3duIGFzIHN0cmluZykpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEJ5cGFzcyB0aGUgY29uZmlndXJlZCBjYWxsYmFjayBmdW5jdGlvbiBmb3Igc3RkZXJyIGJ5XG4gICAgICogd3JpdGluZyBkaXJlY3RseSB0byB0aGUgZGV0YWNoZWQgb3V0cHV0IHN0cmVhbVxuICAgICAqIEBwYXJhbSBkYXRhIFxuICAgICAqL1xuICAgIHB1YmxpYyBzdGRlcnJCeXBhc3MoZGF0YTogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMud3JpdGVTdGRlcnIoZGF0YSk7XG4gICAgfVxufVxuXG5cbi8qKlxuICogTGF6eSBsb2FkIGxvZ2dlciwgd3JpdGUgYnVmZmVyZWQgbWVzc2FnZXMgb25jZSBsb2FkZWRcbiAqIE5vdGU6IExhenkgbG9hZGluZyBpcyBuZWNlc3NhcnkgdG8gcmVzb2x2ZSBjaXJjdWxhciBkZXBlbmRlbmNpZXMgYmV0d2VlbiB0aGlzXG4gKiBtb2R1bGUgYW5kIHRoZSBsb2dnZXIuXG4gKi9cbihhc3luYyAoKSA9PiB7XG4gICAgY29uc3QgeyB3aXRoTG9nZ2VyIH0gPSBhd2FpdCBpbXBvcnQoJy4vbG9nZ2VyJyk7XG4gICAgY29uc3QgbGV2ZWw6IE5QTUxvZ2dpbmdMZXZlbHMgPSBwcm9jZXNzLmVudi5MT0dfREVMSVZFUllfQUdFTlRfTEVWRUwgYXMgTlBNTG9nZ2luZ0xldmVscyB8fCAnd2Fybic7XG4gICAgbG9nID0gd2l0aExvZ2dlcignTmV3UmVsaWNMb2dGb3J3YXJkZXInLCBsZXZlbCk7XG4gICAgd2hpbGUoaW50ZXJuYWxMb2dCdWZmZXIubGVuZ3RoKSB7XG4gICAgICAgIGNvbnN0IFtsZXZlbCwgbWVzc2FnZV0gPSBpbnRlcm5hbExvZ0J1ZmZlci5zaGlmdCgpIGFzIFtzdHJpbmcsIHN0cmluZ107XG4gICAgICAgIChsb2cgYXMgYW55KVtsZXZlbF0obWVzc2FnZSk7XG4gICAgfVxufSkoKTtcbiJdfQ==