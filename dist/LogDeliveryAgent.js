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

    _defineProperty(this, "newRelicInitialized", false);

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
    this.registerNewRelicInitializationInterval();
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

_defineProperty(NewRelicLogDeliveryAgent, "instance", void 0);

var StandardOutPassThrough = /*#__PURE__*/function () {
  function StandardOutPassThrough(stdoutCb, stderrCb) {
    var _this5 = this;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9Mb2dEZWxpdmVyeUFnZW50LnRzIl0sIm5hbWVzIjpbIkFQSV9IT1NUTkFNRSIsInByb2Nlc3MiLCJlbnYiLCJLTF9OUl9MT0dfSE9TVE5BTUUiLCJBUElfUEFUSCIsIktMX05SX0xPR19QQVRIIiwiTUFYX1BBWUxPQURfU0laRSIsIk1BWF9BVFRSSUJVVEVTX1BFUl9FVkVOVCIsIk1BWF9BVFRSSUJVVEVfTkFNRV9MRU5HVEgiLCJNQVhfQVRUUklCVVRFX1ZBTFVFX0xFTkdUSCIsImxvZyIsImludGVybmFsTG9nQnVmZmVyIiwiaW50ZXJuYWxMb2ciLCJsZXZlbCIsIm1lc3NhZ2UiLCJwdXNoIiwiZGVmYXVsdENvbmZpZyIsImJ5dGVzV3JpdHRlblRocmVzaG9sZCIsIndhcm5PbkF0dHJpYnV0ZUxlbmd0aE92ZXJmbG93IiwibWluQnl0ZXNXcml0dGVuIiwibWluTG9nSXRlbXMiLCJsb2dQdXNoRnJlcXVlbmN5IiwibWluTG9nSXRlbXNUb0ZvcmNlIiwiTmV3UmVsaWNMb2dEZWxpdmVyeUFnZW50IiwiREVCVUdfV1JJVEVfTE9HU19UT19GSUxFIiwiY29uZmlnIiwibmV3UmVsaWNMb2dUcmFuc3BvcnQiLCJOZXdSZWxpY0xvZ1RyYW5zcG9ydCIsImNiIiwiYWRkTG9nIiwibG9nQ2FsbGJhY2siLCJlcnJDYWxsYmFjayIsImxhYmVsIiwic3RhbmRhcmRPdXRQYXNzVGhyb3VnaCIsIlN0YW5kYXJkT3V0UGFzc1Rocm91Z2giLCJyZWdpc3RlckFwcERlYXRoTG9nUHVzaCIsImNyZWF0ZUxvZ0NoZWNrVGltZW91dCIsInJlZ2lzdGVyTmV3UmVsaWNJbml0aWFsaXphdGlvbkludGVydmFsIiwidGltZW91dElkIiwiY2xlYXJUaW1lb3V0IiwiZGVzdHJveSIsImNsb3NlIiwid3JpdGVMb2dzU3luYyIsInN0ciIsIkpTT04iLCJzdHJpbmdpZnkiLCJvYmoiLCJwYXJzZSIsIm1zZyIsIm5hbWUiLCJlcnIiLCJjYWxsYmFjayIsImpzb25EYXRhIiwiaXNOUkNvbXBhdGlibGVKc29uTG9nU3RyaW5nIiwicHJvY2Vzc0FzSnNvbkxvZyIsInByb2Nlc3NBc1N0cmluZ0xvZyIsImltbWVkaWF0ZUxvZ1dyaXRhYmxlUHJlZGljYXRlIiwiYmVnaW5Xcml0ZUxvZ3MiLCJzdGRlcnJCeXBhc3MiLCJzdGRvdXRCeXBhc3MiLCJsb2dUcmFuc2Zvcm0iLCJsb2dTdHJpbmciLCJsZW5ndGgiLCJCdWZmZXIiLCJieXRlTGVuZ3RoIiwibG9nUXVldWUiLCJsb2dMZW5ndGhRdWV1ZSIsInRvdGFsTGVuZ3RoQ291bnQiLCJlbmRzV2l0aCIsInN1YnN0cmluZyIsIm5ld1JlbGljTWV0YWRhdGEiLCJuZXdyZWxpYyIsImdldExpbmtpbmdNZXRhZGF0YSIsInN0cnVjdHVyZWRMb2ciLCJ0aW1lc3RhbXAiLCJEYXRlIiwibm93Iiwib3JpZ2luYWxfdGltZXN0YW1wIiwidG9JU09TdHJpbmciLCJob3N0bmFtZSIsImpzb25Mb2dTdHJpbmciLCJhdHRyaWJ1dGVzIiwiZ2xvYmFsQXR0cmlidXRlcyIsImxvZ3NUb1dyaXRlIiwic2xpY2VMb2dzIiwicmF3UGF5bG9hZCIsImJ1aWxkUmF3UG9zdEJvZHkiLCJjb21wcmVzc2VkUGF5bG9hZCIsInpsaWIiLCJnemlwU3luYyIsImRlYnVnTW9kZSIsInNlbmRMb2dzIiwid3JpdGVMb2dzVG9GaWxlU3lzdGVtIiwiYnVmZmVyIiwiZnMiLCJ3cml0ZUZpbGVTeW5jIiwibG9nc1dyaXR0ZW4iLCJjb21wcmVzc1BheWxvYWQiLCJmYWxsYmFja01lc3NhZ2UiLCJFcnJvciIsInN0YWNrIiwiQXhpb3MiLCJwb3N0IiwiaGVhZGVycyIsIk5FV19SRUxJQ19MSUNFTlNFX0tFWSIsInRoZW4iLCJyZXNwb25zZSIsImluY2x1ZGVzIiwic3RhdHVzIiwiZGF0YSIsInJlcXVlc3RJZCIsImxvZ3MiLCJwYXlsb2FkIiwiY29tbW9uIiwic2VydmljZSIsIk5FV19SRUxJQ19BUFBfTkFNRSIsImVudGl0eUd1aWQiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsImd6aXAiLCJmcm9tIiwibG9nc1RvU2VuZCIsImxvZ1NpemUiLCJsb2dTbGljZUluZGV4Iiwic2xpY2UiLCJuZXdSZWxpY0luaXRpYWxpemVkIiwibWluTG9nSXRlbXNFeGNlZWRlZCIsIk9iamVjdCIsImdldE93blByb3BlcnR5TmFtZXMiLCJrZXlzIiwia2V5IiwidmFsdWUiLCJuZXdLZXkiLCJkZWZpbmVQcm9wZXJ0eSIsImdldE93blByb3BlcnR5RGVzY3JpcHRvciIsInJlcGxhY2VBbGwiLCJzZXRUaW1lb3V0IiwiZmluYWxXcml0dGVuIiwib24iLCJvIiwiZXhpdCIsImUiLCJjb25zb2xlIiwibmV3UmVsaWNJbml0aWFsaXphdGlvbkNoZWNrVGltZW91dCIsInNldEludGVydmFsIiwibWV0YWRhdGEiLCJjbGVhckludGVydmFsIiwiaW5zdGFuY2UiLCJzdGRvdXRDYiIsInN0ZGVyckNiIiwiUGFzc1Rocm91Z2giLCJzdGRvdXQiLCJ3cml0ZSIsInN0ZGVyciIsIndyaXRlU3Rkb3V0IiwiY2FsbCIsIndyaXRlU3RkZXJyIiwic3Rkb3V0UHQiLCJ0b1N0cmluZyIsInN0ZGVyclB0IiwiYmluZCIsImVycm9yIiwid2l0aExvZ2dlciIsIkxPR19ERUxJVkVSWV9BR0VOVF9MRVZFTCIsInNoaWZ0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBR0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUEsSUFBTUEsWUFBWSxHQUFHQyxPQUFPLENBQUNDLEdBQVIsQ0FBWUMsa0JBQVosSUFBa0MseUJBQXZEO0FBQ0EsSUFBTUMsUUFBUSxHQUFHSCxPQUFPLENBQUNDLEdBQVIsQ0FBWUcsY0FBWixJQUE4QixTQUEvQztBQUNBLElBQU1DLGdCQUFnQixZQUFHLEVBQUgsRUFBTyxDQUFQLENBQXRCO0FBQ0EsSUFBTUMsd0JBQXdCLEdBQUcsR0FBakM7QUFDQSxJQUFNQyx5QkFBeUIsR0FBRyxHQUFsQztBQUNBLElBQU1DLDBCQUEwQixHQUFHLElBQW5DO0FBRUEsSUFBSUMsR0FBSjtBQUNBLElBQUlDLGlCQUEwQyxHQUFHLEVBQWpEO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBQ0EsU0FBU0MsV0FBVCxDQUFxQkMsS0FBckIsRUFBb0NDLE9BQXBDLEVBQXFEO0FBQ2pELE1BQUlKLEdBQUosRUFBUztBQUNKQSxJQUFBQSxHQUFELENBQWFHLEtBQWIsRUFBb0JDLE9BQXBCO0FBQ0gsR0FGRCxNQUVPO0FBQ0hILElBQUFBLGlCQUFpQixDQUFDSSxJQUFsQixDQUF1QixDQUFDRixLQUFELEVBQVFDLE9BQVIsQ0FBdkI7QUFDSDtBQUNKOztBQTRDRCxJQUFNRSxhQUE2QyxHQUFHO0FBQ2xEQyxFQUFBQSxxQkFBcUIsRUFBRVgsZ0JBQWdCLEdBQUcsQ0FBbkIsR0FBdUIsQ0FESTtBQUVsRFksRUFBQUEsNkJBQTZCLEVBQUUsS0FGbUI7QUFHbERDLEVBQUFBLGVBQWUsRUFBRWIsZ0JBQWdCLEdBQUcsQ0FBbkIsR0FBdUIsQ0FIVTtBQUlsRGMsRUFBQUEsV0FBVyxFQUFFLENBSnFDO0FBS2xEQyxFQUFBQSxnQkFBZ0IsRUFBRSxLQUxnQztBQU1sREMsRUFBQUEsa0JBQWtCLEVBQUU7QUFOOEIsQ0FBdEQ7O0lBU2FDLHdCO0FBZ0RULHNDQUFzQjtBQUFBOztBQUFBOztBQUFBLHNDQWJJLEVBYUo7O0FBQUE7O0FBQUEsNENBWGEsRUFXYjs7QUFBQSw4Q0FWSyxDQVVMOztBQUFBLDhDQVQ4QixFQVM5Qjs7QUFBQTs7QUFBQSx1Q0FQRnRCLE9BQU8sQ0FBQ0MsR0FBUixDQUFZc0Isd0JBQVosS0FBeUMsTUFPdkM7O0FBQUE7O0FBQUEseUNBTEEsQ0FLQTs7QUFBQSxpREFKUSxLQUlSOztBQUFBOztBQUNsQlosSUFBQUEsV0FBVyxDQUFDLE9BQUQsRUFBVSwrQkFBVixDQUFYO0FBQ0EsU0FBS2EsTUFBTCxxQkFBbUJULGFBQW5CO0FBRUFKLElBQUFBLFdBQVcsQ0FBQyxNQUFELGtDQUFYO0FBQ0EsU0FBS2Msb0JBQUwsR0FBNEIsSUFBSUMsMENBQUosQ0FBeUIsVUFBQ2pCLEdBQUQsRUFBTWtCLEVBQU47QUFBQSxhQUFhLEtBQUksQ0FBQ0MsTUFBTCxDQUFZbkIsR0FBWixFQUFpQmtCLEVBQWpCLENBQWI7QUFBQSxLQUF6QixDQUE1QixDQUxrQixDQU9sQjs7QUFDQSxRQUFNRSxXQUFXLEdBQUcsU0FBZEEsV0FBYyxDQUFDcEIsR0FBRCxFQUFpQjtBQUNqQyxNQUFBLEtBQUksQ0FBQ21CLE1BQUwsQ0FBWW5CLEdBQVosRUFBaUIsWUFBTSxDQUFFLENBQXpCO0FBQ0gsS0FGRDs7QUFJQSxRQUFNcUIsV0FBVyxHQUFHLFNBQWRBLFdBQWMsQ0FBQ3JCLEdBQUQsRUFBaUI7QUFDakMsTUFBQSxLQUFJLENBQUNtQixNQUFMLENBQVk7QUFDUkcsUUFBQUEsS0FBSyxFQUFFLE9BREM7QUFFUmxCLFFBQUFBLE9BQU8sRUFBRUo7QUFGRCxPQUFaLEVBR0csWUFBTSxDQUFFLENBSFg7QUFJSCxLQUxEOztBQU9BLFNBQUt1QixzQkFBTCxHQUE4QixJQUFJQyxzQkFBSixDQUEyQkosV0FBM0IsRUFBd0NDLFdBQXhDLENBQTlCO0FBQ0EsU0FBS0ksdUJBQUw7QUFDQSxTQUFLQyxxQkFBTDtBQUNBLFNBQUtDLHNDQUFMO0FBQ0F6QixJQUFBQSxXQUFXLENBQUMsT0FBRCxFQUFVLDhCQUFWLENBQVg7QUFHSDtBQUVEO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7Ozs7O1dBQ0ksMkJBQXlCO0FBQ3JCLGFBQU8sS0FBS2Msb0JBQVo7QUFDSDtBQUVEO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7V0FDSSxvQkFBa0I7QUFDZGQsTUFBQUEsV0FBVyxDQUFDLE9BQUQsRUFBVSx3Q0FBVixDQUFYO0FBQ0EsVUFBSSxLQUFLMEIsU0FBVCxFQUFvQkMsWUFBWSxDQUFDLEtBQUtELFNBQU4sQ0FBWjtBQUNwQixXQUFLTCxzQkFBTCxDQUE0Qk8sT0FBNUI7QUFDQSxXQUFLZCxvQkFBTCxDQUEwQmUsS0FBMUI7QUFDQSxXQUFLQyxhQUFMO0FBQ0g7QUFHRDtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O1dBQ0kscUNBQW9DQyxHQUFwQyxFQUEwRDtBQUN0RCxVQUFJLFFBQU9BLEdBQVAsTUFBZSxRQUFuQixFQUE2QjtBQUN6QkEsUUFBQUEsR0FBRyxHQUFHQyxJQUFJLENBQUNDLFNBQUwsQ0FBZUYsR0FBZixDQUFOO0FBQ0g7O0FBQ0QsVUFBSTtBQUNBLFlBQU1HLEdBQUcsR0FBR0YsSUFBSSxDQUFDRyxLQUFMLENBQVdKLEdBQVgsQ0FBWixDQURBLENBRUE7O0FBQ0EsWUFBSUcsR0FBRyxDQUFDRSxHQUFKLElBQVdGLEdBQVgsYUFBV0EsR0FBWCxlQUFXQSxHQUFHLENBQUVHLElBQUwsQ0FBVSxvQkFBVixDQUFYLElBQThDLENBQUNILEdBQUcsQ0FBQ2hDLE9BQXZELEVBQWdFO0FBQzVEZ0MsVUFBQUEsR0FBRyxDQUFDaEMsT0FBSixHQUFjZ0MsR0FBRyxDQUFDRSxHQUFsQjtBQUNBRixVQUFBQSxHQUFHLENBQUNqQyxLQUFKLEdBQVksTUFBWjtBQUNBLGlCQUFPaUMsR0FBRyxDQUFDRSxHQUFYO0FBQ0g7O0FBQ0QsWUFBSUYsR0FBRyxJQUFJLFFBQU9BLEdBQVAsTUFBZSxRQUExQixFQUFvQztBQUNoQyxjQUFJQSxHQUFHLENBQUNoQyxPQUFKLElBQWVnQyxHQUFHLENBQUNqQyxLQUF2QixFQUE4QjtBQUUxQixtQkFBT2lDLEdBQVA7QUFDSDtBQUNKO0FBQ0osT0FkRCxDQWNFLE9BQU9JLEdBQVAsRUFBWSxDQUFHOztBQUNqQixhQUFPLEtBQVA7QUFDSDtBQUVEO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7V0FDSSxnQkFBZXhDLEdBQWYsRUFBeUJ5QyxRQUF6QixFQUE2RDtBQUN6RCxVQUFNQyxRQUFRLEdBQUcsS0FBS0MsMkJBQUwsQ0FBaUMzQyxHQUFqQyxDQUFqQjs7QUFDQSxVQUFHMEMsUUFBSCxFQUFhO0FBQ1QsYUFBS0UsZ0JBQUwsQ0FBc0JGLFFBQXRCO0FBQ0gsT0FGRCxNQUVPO0FBQ0gsYUFBS0csa0JBQUwsQ0FBd0I3QyxHQUF4QjtBQUNIOztBQUVELFVBQUksS0FBSzhDLDZCQUFMLEVBQUosRUFBMEM7QUFDdEMsYUFBS0MsY0FBTDtBQUNIOztBQUVELFVBQUlMLFFBQUosRUFBYzFDLEdBQUcsR0FBR2tDLElBQUksQ0FBQ0MsU0FBTCxDQUFlbkMsR0FBZixJQUFvQixJQUExQjs7QUFFZCxVQUFJMEMsUUFBUSxTQUFSLElBQUFBLFFBQVEsV0FBUixJQUFBQSxRQUFRLENBQUV0QyxPQUFWLElBQXFCLENBQUFzQyxRQUFRLFNBQVIsSUFBQUEsUUFBUSxXQUFSLFlBQUFBLFFBQVEsQ0FBRXZDLEtBQVYsTUFBb0IsT0FBN0MsRUFBc0Q7QUFDbEQsYUFBS29CLHNCQUFMLENBQTRCeUIsWUFBNUIsQ0FBeUNoRCxHQUF6QztBQUNILE9BRkQsTUFFTyxJQUFHMEMsUUFBUSxDQUFDdEMsT0FBWixFQUFxQjtBQUN4QixhQUFLbUIsc0JBQUwsQ0FBNEIwQixZQUE1QixDQUF5Q2pELEdBQXpDO0FBQ0g7O0FBRUQsVUFBSXlDLFFBQUosRUFBY0EsUUFBUTtBQUN6QjtBQUVEO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7Ozs7V0FDSSwwQkFBaUJ6QyxHQUFqQixFQUEyQjtBQUN2QixXQUFLa0QsWUFBTCxDQUFrQmxELEdBQWxCO0FBQ0EsVUFBTW1ELFNBQVMsR0FBR2pCLElBQUksQ0FBQ0MsU0FBTCxDQUFlbkMsR0FBZixDQUFsQjtBQUNBLFVBQU1vRCxNQUFNLEdBQUdDLE1BQU0sQ0FBQ0MsVUFBUCxDQUFrQkgsU0FBbEIsQ0FBZjtBQUNBLFdBQUtJLFFBQUwsQ0FBY2xELElBQWQsQ0FBbUJMLEdBQW5CO0FBQ0EsV0FBS3dELGNBQUwsQ0FBb0JuRCxJQUFwQixDQUF5QitDLE1BQXpCO0FBQ0EsV0FBS0ssZ0JBQUwsSUFBeUJMLE1BQXpCO0FBQ0g7QUFFRDtBQUNKO0FBQ0E7QUFDQTtBQUNBOzs7O1dBQ0ksNEJBQW1CcEQsR0FBbkIsRUFBZ0M7QUFDNUIsVUFBSSxPQUFPQSxHQUFQLEtBQWUsUUFBZixJQUEyQkEsR0FBRyxDQUFDMEQsUUFBSixDQUFhLElBQWIsQ0FBL0IsRUFBbUQ7QUFDL0MxRCxRQUFBQSxHQUFHLEdBQUdBLEdBQUcsQ0FBQzJELFNBQUosQ0FBYyxDQUFkLEVBQWlCM0QsR0FBRyxDQUFDb0QsTUFBSixHQUFhLENBQTlCLENBQU47QUFDSDs7QUFFRCxVQUFNUSxnQkFBZ0IsR0FBR0MscUJBQVNDLGtCQUFULEVBQXpCOztBQUNBLFVBQU1DLGFBQWEsR0FBRztBQUNsQjNELFFBQUFBLE9BQU8sRUFBRUosR0FEUztBQUVsQmdFLFFBQUFBLFNBQVMsRUFBRUMsSUFBSSxDQUFDQyxHQUFMLEVBRk87QUFHbEJDLFFBQUFBLGtCQUFrQixFQUFFLElBQUlGLElBQUosR0FBV0csV0FBWCxFQUhGO0FBSWxCLHVCQUFlUixnQkFBZ0IsQ0FBQyxhQUFELENBSmI7QUFLbEIsdUJBQWVBLGdCQUFnQixDQUFDLGFBQUQsQ0FMYjtBQU1sQlMsUUFBQUEsUUFBUSxFQUFFVCxnQkFBZ0IsQ0FBQ1M7QUFOVCxPQUF0QjtBQVNBLFVBQU1DLGFBQWEsR0FBR3BDLElBQUksQ0FBQ0MsU0FBTCxDQUFlNEIsYUFBZixDQUF0QjtBQUNBLFVBQU1YLE1BQU0sR0FBR0MsTUFBTSxDQUFDQyxVQUFQLENBQWtCZ0IsYUFBbEIsQ0FBZjtBQUNBLFdBQUtmLFFBQUwsQ0FBY2xELElBQWQsQ0FBbUIwRCxhQUFuQjtBQUNBLFdBQUtQLGNBQUwsQ0FBb0JuRCxJQUFwQixDQUF5QitDLE1BQXpCO0FBQ0EsV0FBS0ssZ0JBQUwsSUFBeUJMLE1BQXpCO0FBQ0g7QUFFRDtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztXQUNJLDZCQUFvQm1CLFVBQXBCLEVBQXlEO0FBQ3JELFdBQUtDLGdCQUFMLEdBQXdCRCxVQUF4QjtBQUNIO0FBRUQ7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O1dBQ0kseUJBQXdCO0FBQ3BCLFVBQU1FLFdBQVcsR0FBRyxLQUFLQyxTQUFMLEVBQXBCO0FBQ0F4RSxNQUFBQSxXQUFXLENBQUMsT0FBRCwyQ0FBNEN1RSxXQUFXLENBQUNyQixNQUF4RCx1QkFBWDtBQUNBLFVBQU11QixVQUFVLEdBQUcsS0FBS0MsZ0JBQUwsQ0FBc0JILFdBQXRCLENBQW5COztBQUNBLFVBQU1JLGlCQUFpQixHQUFHQyxpQkFBS0MsUUFBTCxDQUFjSixVQUFkLENBQTFCOztBQUNBLFVBQUksQ0FBQyxLQUFLSyxTQUFWLEVBQXFCO0FBQ2pCLGFBQUtDLFFBQUwsQ0FBY0osaUJBQWQ7QUFDSCxPQUZELE1BRU87QUFDSCxhQUFLSyxxQkFBTCxDQUEyQkwsaUJBQTNCO0FBQ0g7QUFDSjs7O1dBRUQsK0JBQTZCTSxNQUE3QixFQUE2QztBQUN6Q0MscUJBQUdDLGFBQUgsZ0JBQXlCLEtBQUtDLFdBQUwsRUFBekIsVUFBa0RILE1BQWxEO0FBQ0g7Ozs7b0ZBRUQ7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQ1VWLGdCQUFBQSxXQURWLEdBQ3dCLEtBQUtDLFNBQUwsRUFEeEI7QUFHSXhFLGdCQUFBQSxXQUFXLENBQUMsT0FBRCxxQ0FBc0N1RSxXQUFXLENBQUNyQixNQUFsRCx1QkFBWDtBQUNNdUIsZ0JBQUFBLFVBSlYsR0FJdUIsS0FBS0MsZ0JBQUwsQ0FBc0JILFdBQXRCLENBSnZCO0FBQUE7QUFBQTtBQUFBLHVCQU1nRCxLQUFLYyxlQUFMLENBQXFCWixVQUFyQixDQU5oRDs7QUFBQTtBQU1jRSxnQkFBQUEsaUJBTmQ7O0FBT1Esb0JBQUksQ0FBQyxLQUFLRyxTQUFWLEVBQXFCO0FBQ2pCLHVCQUFLQyxRQUFMLENBQWNKLGlCQUFkO0FBQ0gsaUJBRkQsTUFFTztBQUNILHVCQUFLSyxxQkFBTCxDQUEyQkwsaUJBQTNCO0FBQ0g7O0FBWFQ7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFhY1csZ0JBQUFBLGVBYmQsR0FhZ0Msb0VBYmhDO0FBY2NwRixnQkFBQUEsT0FkZCxHQWN3Qix1QkFBZXFGLEtBQWYsSUFBd0IsWUFBSUMsS0FBNUIsR0FBb0MsWUFBSUEsS0FBeEMsR0FBZ0RGLGVBZHhFO0FBZVF0RixnQkFBQUEsV0FBVyxDQUFDLE9BQUQsRUFBVUUsT0FBVixDQUFYOztBQWZSO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE87Ozs7Ozs7O0FBbUJBO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7Ozs7V0FDSSxrQkFBaUJ5RSxpQkFBakIsRUFBNEM7QUFDeENjLHdCQUFNQyxJQUFOLG1CQUFzQnRHLFlBQXRCLFNBQXFDSSxRQUFyQyxHQUFpRG1GLGlCQUFqRCxFQUFvRTtBQUNoRWdCLFFBQUFBLE9BQU8sRUFBRTtBQUNMLG9CQUFVLEtBREw7QUFFTCxxQkFBV3RHLE9BQU8sQ0FBQ0MsR0FBUixDQUFZc0cscUJBRmxCO0FBR0wsOEJBQW9CLE1BSGY7QUFJTCw0QkFBa0IsS0FBR2pCLGlCQUFpQixDQUFDdkIsVUFKbEM7QUFLTCwwQkFBZ0I7QUFMWDtBQUR1RCxPQUFwRSxFQVFHeUMsSUFSSCxDQVFRLFVBQUFDLFFBQVEsRUFBSTtBQUNoQixZQUFJLENBQUMsR0FBRCxFQUFNLEdBQU4sRUFBV0MsUUFBWCxDQUFvQkQsUUFBUSxDQUFDRSxNQUE3QixDQUFKLEVBQTBDO0FBQ3RDaEcsVUFBQUEsV0FBVyxDQUFDLE9BQUQsK0RBQWdFOEYsUUFBUSxDQUFDRyxJQUFULENBQWNDLFNBQTlFLEVBQVg7QUFDSCxTQUZELE1BRU87QUFDSGxHLFVBQUFBLFdBQVcsQ0FBQyxNQUFELGdFQUFnRThGLFFBQVEsQ0FBQ0UsTUFBekUsRUFBWDtBQUNIO0FBRUosT0FmRCxXQWVTLFVBQUExRCxHQUFHLEVBQUk7QUFDWnRDLFFBQUFBLFdBQVcsQ0FBQyxPQUFELEVBQVUsd0NBQVYsQ0FBWDtBQUNBQSxRQUFBQSxXQUFXLENBQUMsT0FBRCxFQUFVc0MsR0FBRyxDQUFDa0QsS0FBZCxDQUFYO0FBQ0gsT0FsQkQ7QUFtQkg7QUFFRDtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztXQUNJLDBCQUF5QlcsSUFBekIsRUFBOEM7QUFDMUMsVUFBTUMsT0FBTyxHQUFHLENBQUM7QUFDYkMsUUFBQUEsTUFBTSxFQUFFO0FBQ0poQyxVQUFBQSxVQUFVLGtDQUNILEtBQUtDLGdCQURGO0FBRU5nQyxZQUFBQSxPQUFPLEVBQUVqSCxPQUFPLENBQUNDLEdBQVIsQ0FBWWlILGtCQUZmO0FBR05DLFlBQUFBLFVBQVUsRUFBRTdDLHFCQUFTQyxrQkFBVCxHQUE4QixhQUE5QjtBQUhOO0FBRE4sU0FESztBQVFidUMsUUFBQUEsSUFBSSxFQUFFQTtBQVJPLE9BQUQsQ0FBaEI7QUFVQSxhQUFPbkUsSUFBSSxDQUFDQyxTQUFMLENBQWVtRSxPQUFmLENBQVA7QUFDSDtBQUVEO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7Ozs7O3FGQUNJLGtCQUE4QjNCLFVBQTlCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxrREFDVyxJQUFJZ0MsT0FBSixDQUFvQixVQUFDQyxPQUFELEVBQVVDLE1BQVYsRUFBcUI7QUFDNUMvQixtQ0FBS2dDLElBQUwsQ0FBVXpELE1BQU0sQ0FBQzBELElBQVAsQ0FBWXBDLFVBQVosRUFBd0IsTUFBeEIsQ0FBVixFQUEyQyxVQUFDbkMsR0FBRCxFQUFNcUMsaUJBQU4sRUFBNEI7QUFDbkUsd0JBQUlyQyxHQUFKLEVBQVNxRSxNQUFNLENBQUNyRSxHQUFELENBQU47QUFDVG9FLG9CQUFBQSxPQUFPLENBQUMvQixpQkFBRCxDQUFQO0FBQ0gsbUJBSEQ7QUFJSCxpQkFMTSxDQURYOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE87Ozs7Ozs7O0FBU0E7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7V0FDSSxxQkFBb0I7QUFDaEIsVUFBSW1DLFVBQUosQ0FEZ0IsQ0FHaEI7O0FBQ0EsVUFBSSxLQUFLdkQsZ0JBQUwsR0FBd0I3RCxnQkFBNUIsRUFBOEM7QUFBQSxtQkFDWixDQUFDLEtBQUsyRCxRQUFOLEVBQWdCLEVBQWhCLENBRFk7QUFDekN5RCxRQUFBQSxVQUR5QztBQUM3QixhQUFLekQsUUFEd0I7QUFFMUMsYUFBS0MsY0FBTCxHQUFzQixFQUF0QjtBQUNBLGFBQUtDLGdCQUFMLEdBQXdCLENBQXhCO0FBQ0EsZUFBT3VELFVBQVA7QUFDSCxPQVRlLENBV2hCOzs7QUFDQSxVQUFJQyxPQUFPLEdBQUcsQ0FBZDtBQUNBLFVBQUlDLGFBQWEsR0FBRyxDQUFwQjs7QUFFQSxhQUFPLEtBQUszRCxRQUFMLENBQWNILE1BQWQsR0FBdUIsQ0FBeEIsSUFBK0I2RCxPQUFPLEdBQUcsS0FBS3pELGNBQUwsQ0FBb0IsQ0FBcEIsQ0FBVixHQUFtQzVELGdCQUF4RSxFQUEyRjtBQUN2RnNILFFBQUFBLGFBQWE7QUFDaEI7O0FBRURGLE1BQUFBLFVBQVUsR0FBRyxLQUFLekQsUUFBTCxDQUFjNEQsS0FBZCxDQUFvQixDQUFwQixFQUF1QkQsYUFBdkIsQ0FBYjtBQUNBLFdBQUszRCxRQUFMLEdBQWdCLEtBQUtBLFFBQUwsQ0FBYzRELEtBQWQsQ0FBb0JELGFBQXBCLENBQWhCO0FBQ0EsV0FBSzFELGNBQUwsR0FBc0IsS0FBS0EsY0FBTCxDQUFvQjJELEtBQXBCLENBQTBCRCxhQUExQixDQUF0QjtBQUVBLGFBQU9GLFVBQVA7QUFDSDtBQUVEO0FBQ0o7QUFDQTtBQUNBOzs7O1dBQ0kseUNBQWlEO0FBQzdDLFVBQUksS0FBS0ksbUJBQUwsSUFBNEIsS0FBSzdELFFBQUwsQ0FBY0gsTUFBZCxJQUF3QixLQUFLckMsTUFBTCxDQUFZSCxrQkFBWixJQUFrQyxHQUExRCxDQUFoQyxFQUFnRztBQUM1RixlQUFPLElBQVA7QUFDSCxPQUg0QyxDQUs3Qzs7O0FBQ0EsVUFBSSxLQUFLMkMsUUFBTCxDQUFjSCxNQUFkLEdBQXVCLEdBQTNCLEVBQWdDO0FBQzVCLGVBQU8sSUFBUDtBQUNIOztBQUNELGFBQU8sS0FBUDtBQUNIO0FBRUQ7QUFDSjtBQUNBO0FBQ0E7Ozs7V0FDSSxpQ0FBeUM7QUFDckMsYUFBTyxLQUFLaUUsbUJBQUwsRUFBUDtBQUNIO0FBRUQ7QUFDSjtBQUNBO0FBQ0E7QUFDQTs7OztXQUNJLCtCQUF1QztBQUNuQyxhQUFPLENBQUMsRUFBRSxLQUFLdEcsTUFBTCxDQUFZTCxXQUFaLElBQTRCLEtBQUs2QyxRQUFMLENBQWNILE1BQWQsR0FBdUIsS0FBS3JDLE1BQUwsQ0FBWUwsV0FBakUsQ0FBUjtBQUNIO0FBRUQ7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O1dBQ0ksc0JBQXFCVixHQUFyQixFQUErQjtBQUMzQixVQUFJc0gsTUFBTSxDQUFDQyxtQkFBUCxDQUEyQnZILEdBQTNCLEVBQWdDb0QsTUFBaEMsR0FBeUN2RCx3QkFBN0MsRUFBdUU7QUFDbkVLLFFBQUFBLFdBQVcsQ0FBQyxNQUFELHlDQUF5Q29ILE1BQU0sQ0FBQ0MsbUJBQVAsQ0FBMkJ2SCxHQUEzQixDQUF6QyxnQkFBOEVILHdCQUE5RSxrQkFBWDtBQUNIOztBQUVELHNDQUFnQnlILE1BQU0sQ0FBQ0UsSUFBUCxDQUFZeEgsR0FBWixDQUFoQixrQ0FBa0M7QUFBN0IsWUFBSXlILElBQUcsbUJBQVA7QUFDRCxZQUFNQyxLQUFLLEdBQUcxSCxHQUFHLENBQUN5SCxJQUFELENBQWpCLENBRDhCLENBRTlCOztBQUNBLFlBQUlBLElBQUcsQ0FBQ3JFLE1BQUosR0FBYXRELHlCQUFqQixFQUE0QztBQUN4QyxjQUFNNkgsTUFBTSxHQUFHRixJQUFHLENBQUNOLEtBQUosQ0FBVSxDQUFWLEVBQWFySCx5QkFBYixDQUFmOztBQUNBd0gsVUFBQUEsTUFBTSxDQUFDTSxjQUFQLENBQXNCNUgsR0FBdEIsRUFBMkJ5SCxJQUFHLENBQUNOLEtBQUosQ0FBVSxDQUFWLEVBQWFySCx5QkFBYixDQUEzQixFQUNJd0gsTUFBTSxDQUFDTyx3QkFBUCxDQUFnQzdILEdBQWhDLEVBQXFDeUgsSUFBckMsQ0FESjtBQUVBLGlCQUFPekgsR0FBRyxDQUFDeUgsR0FBWCxDQUp3QyxDQU14Qzs7QUFDQUEsVUFBQUEsSUFBRyxHQUFHRSxNQUFOO0FBQ0gsU0FYNkIsQ0FhOUI7OztBQUNBLFlBQUksT0FBT0QsS0FBUCxLQUFpQixRQUFqQixJQUE2QkEsS0FBSyxDQUFDdEUsTUFBTixHQUFlckQsMEJBQWhELEVBQTRFO0FBQUE7O0FBQ3hFLDhCQUFJLEtBQUtnQixNQUFULHlDQUFJLGFBQWFQLDZCQUFqQixFQUFnRDtBQUM1Q04sWUFBQUEsV0FBVyxDQUFDLE1BQUQsc0RBQXNEd0gsS0FBSyxDQUFDdEUsTUFBNUQsY0FBc0VyRCwwQkFBdEUsRUFBWDtBQUNIOztBQUNEQyxVQUFBQSxHQUFHLENBQUN5SCxHQUFKLEdBQVVDLEtBQUssQ0FBQ1AsS0FBTixDQUFZLENBQVosRUFBZXBILDBCQUFmLENBQVY7QUFDSDs7QUFFRCxZQUFJMEgsSUFBRyxDQUFDeEIsUUFBSixDQUFhLEdBQWIsQ0FBSixFQUF1QjtBQUNuQixjQUFNMEIsT0FBTSxHQUFHRixJQUFHLENBQUNLLFVBQUosQ0FBZSxHQUFmLEVBQW9CLEdBQXBCLENBQWY7O0FBQ0FSLFVBQUFBLE1BQU0sQ0FBQ00sY0FBUCxDQUFzQjVILEdBQXRCLEVBQTJCeUgsSUFBRyxDQUFDTixLQUFKLENBQVUsQ0FBVixFQUFhckgseUJBQWIsQ0FBM0IsRUFDSXdILE1BQU0sQ0FBQ08sd0JBQVAsQ0FBZ0M3SCxHQUFoQyxFQUFxQ3lILElBQXJDLENBREo7QUFFQSxpQkFBT3pILEdBQUcsQ0FBQ3lILEdBQVgsQ0FKbUIsQ0FNbkI7O0FBQ0FBLFVBQUFBLElBQUcsR0FBR0UsT0FBTjtBQUNIOztBQUFBO0FBQ0o7QUFDSjtBQUVEO0FBQ0o7QUFDQTs7OztXQUNJLGlDQUFnQztBQUFBOztBQUM1QixXQUFLL0YsU0FBTCxHQUFpQm1HLFVBQVUsdUVBQUM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLHNCQUNwQixNQUFJLENBQUN4RSxRQUFMLENBQWNILE1BQWQsSUFBd0IsTUFBSSxDQUFDckMsTUFBTCxDQUFZTCxXQUFaLElBQTJCLENBQW5ELENBRG9CO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUEsdUJBRWQsTUFBSSxDQUFDcUMsY0FBTCxFQUZjOztBQUFBO0FBR3BCLGdCQUFBLE1BQUksQ0FBQ3JCLHFCQUFMOztBQUhvQjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxPQUFELElBS3hCLEtBQUtYLE1BQUwsQ0FBWUosZ0JBTFksQ0FBM0I7QUFNSDtBQUVEO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7Ozs7V0FDSSxtQ0FBa0M7QUFBQTs7QUFDOUIsVUFBSXFILFlBQVksR0FBRyxLQUFuQjtBQUNBekksTUFBQUEsT0FBTyxDQUFDMEksRUFBUixDQUFXLE1BQVgsRUFBbUIsWUFBTTtBQUNyQixZQUFJLE1BQUksQ0FBQ3JHLFNBQVQsRUFBb0JDLFlBQVksQ0FBQyxNQUFJLENBQUNELFNBQU4sQ0FBWjtBQUNwQixZQUFJc0csQ0FBQyxHQUFHRixZQUFSO0FBQ0FBLFFBQUFBLFlBQVksR0FBRyxJQUFmO0FBQ0EsWUFBSUUsQ0FBSixFQUFPO0FBRVBoSSxRQUFBQSxXQUFXLENBQUMsTUFBRCxFQUFTLG9CQUFULENBQVg7O0FBRUEsUUFBQSxNQUFJLENBQUM4QixhQUFMO0FBQ0gsT0FURDtBQVdBekMsTUFBQUEsT0FBTyxDQUFDMEksRUFBUixDQUFXLFFBQVgsRUFBcUIsWUFBTTtBQUN2QjFJLFFBQUFBLE9BQU8sQ0FBQzRJLElBQVIsQ0FBYSxDQUFiO0FBQ0gsT0FGRDtBQUlBNUksTUFBQUEsT0FBTyxDQUFDMEksRUFBUixDQUFXLG1CQUFYLEVBQWdDLFVBQUNHLENBQUQsRUFBTztBQUNuQ0MsUUFBQUEsT0FBTyxDQUFDckksR0FBUixDQUFZb0ksQ0FBWjtBQUNBbEksUUFBQUEsV0FBVyxDQUFDLE9BQUQsRUFBVWtJLENBQUMsQ0FBQzFDLEtBQUYsSUFBVyxFQUFyQixDQUFYO0FBQ0gsT0FIRDtBQUtBbkcsTUFBQUEsT0FBTyxDQUFDMEksRUFBUixDQUFXLFNBQVgsRUFBc0IsWUFBTTtBQUN4QixZQUFJLE1BQUksQ0FBQ3JHLFNBQVQsRUFBb0JDLFlBQVksQ0FBQyxNQUFJLENBQUNELFNBQU4sQ0FBWjs7QUFDcEIsUUFBQSxNQUFJLENBQUNJLGFBQUw7QUFDSCxPQUhEO0FBSUg7QUFFRDtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7V0FDSSxrREFBaUQ7QUFBQTs7QUFDN0MsVUFBTXNHLGtDQUFrQyxHQUFHQyxXQUFXLENBQUMsWUFBTTtBQUN6RCxZQUFNQyxRQUFRLEdBQUczRSxxQkFBU0Msa0JBQVQsRUFBakI7O0FBQ0EsWUFBSTBFLFFBQVEsQ0FBQyxhQUFELENBQVosRUFBNkI7QUFDekIsVUFBQSxNQUFJLENBQUNwQixtQkFBTCxHQUEyQixJQUEzQjtBQUNBbEgsVUFBQUEsV0FBVyxDQUFDLE1BQUQsRUFBUyxxREFBVCxDQUFYO0FBQ0F1SSxVQUFBQSxhQUFhLENBQUNILGtDQUFELENBQWI7QUFDSDtBQUNKLE9BUHFELEVBT25ELEdBUG1ELENBQXREO0FBUUg7Ozs7QUF6ZUQ7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0ksMEJBQTJCO0FBQ3ZCLFVBQUksQ0FBQy9JLE9BQU8sQ0FBQ0MsR0FBUixDQUFZc0cscUJBQWpCLEVBQXdDO0FBQ3hDakYsTUFBQUEsd0JBQXdCLENBQUM2SCxRQUF6QixHQUFvQyxJQUFJN0gsd0JBQUosRUFBcEM7QUFDQSxhQUFPQSx3QkFBd0IsQ0FBQzZILFFBQWhDO0FBQ0g7OztXQUVELHVCQUE0QjtBQUN4QixhQUFPN0gsd0JBQVAsYUFBT0Esd0JBQVAsdUJBQU9BLHdCQUF3QixDQUFFNkgsUUFBakM7QUFDSDs7O1dBRUQsbUJBQXdCM0gsTUFBeEIsRUFBZ0U7QUFDNUQsVUFBTTJILFFBQVEsR0FBRzdILHdCQUF3QixDQUFDNkgsUUFBMUM7O0FBQ0EsVUFBSSxDQUFDQSxRQUFMLEVBQWU7QUFDWHhJLFFBQUFBLFdBQVcsQ0FBQyxNQUFELEVBQVMsNEVBQVQsQ0FBWDtBQUNBO0FBQ0g7O0FBQ0R3SSxNQUFBQSxRQUFRLENBQUMzSCxNQUFULG1DQUNPMkgsUUFBUSxDQUFDM0gsTUFEaEIsR0FFT0EsTUFGUDtBQUlIOzs7V0FFRCwrQkFBb0M7QUFBQTs7QUFDaEMsYUFBT0Ysd0JBQVAsYUFBT0Esd0JBQVAsZ0RBQU9BLHdCQUF3QixDQUFFNkgsUUFBakMsMERBQU8sc0JBQW9DeEYsWUFBM0M7QUFDSDs7Ozs7QUE4Y0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Z0JBbGZhckMsd0I7O0lBbWZQVyxzQjtBQVlGLGtDQUFZbUgsUUFBWixFQUE4Q0MsUUFBOUMsRUFBZ0Y7QUFBQTs7QUFBQTs7QUFBQSxzQ0FUcEQsSUFBSUMsbUJBQUosRUFTb0Q7O0FBQUEsc0NBUnBELElBQUlBLG1CQUFKLEVBUW9EOztBQUFBOztBQUFBOztBQUFBOztBQUFBOztBQUM1RTtBQUNBLFNBQUtDLE1BQUwsR0FBY3ZKLE9BQU8sQ0FBQ3VKLE1BQVIsQ0FBZUMsS0FBN0I7QUFDQSxTQUFLQyxNQUFMLEdBQWN6SixPQUFPLENBQUN5SixNQUFSLENBQWVELEtBQTdCLENBSDRFLENBSzVFOztBQUNBLFNBQUtFLFdBQUwsR0FBbUIsVUFBQzlDLElBQUQ7QUFBQSxhQUFrQixNQUFJLENBQUMyQyxNQUFMLENBQVlJLElBQVosQ0FBaUIzSixPQUFPLENBQUN1SixNQUF6QixFQUFpQzNDLElBQWpDLENBQWxCO0FBQUEsS0FBbkI7O0FBQ0EsU0FBS2dELFdBQUwsR0FBbUIsVUFBQ2hELElBQUQ7QUFBQSxhQUFrQixNQUFJLENBQUM2QyxNQUFMLENBQVlFLElBQVosQ0FBaUIzSixPQUFPLENBQUN5SixNQUF6QixFQUFpQzdDLElBQWpDLENBQWxCO0FBQUEsS0FBbkIsQ0FQNEUsQ0FTNUU7OztBQUNBLFNBQUtpRCxRQUFMLENBQWNuQixFQUFkLENBQWlCLE1BQWpCLEVBQXlCLFVBQUM5QixJQUFELEVBQVU7QUFDL0IsVUFBSUEsSUFBSSxZQUFZOUMsTUFBcEIsRUFBNEI7QUFDeEI4QyxRQUFBQSxJQUFJLEdBQUdBLElBQUksQ0FBQ2tELFFBQUwsQ0FBYyxNQUFkLENBQVA7QUFDSDs7QUFDRFYsTUFBQUEsUUFBUSxDQUFDeEMsSUFBRCxDQUFSOztBQUNBLE1BQUEsTUFBSSxDQUFDOEMsV0FBTCxDQUFpQjlDLElBQWpCO0FBQ0gsS0FORDtBQVFBLFNBQUttRCxRQUFMLENBQWNyQixFQUFkLENBQWlCLE1BQWpCLEVBQXlCLFVBQUM5QixJQUFELEVBQVU7QUFDL0IsVUFBSUEsSUFBSSxZQUFZOUMsTUFBcEIsRUFBNEI7QUFDeEI4QyxRQUFBQSxJQUFJLEdBQUdBLElBQUksQ0FBQ2tELFFBQUwsQ0FBYyxNQUFkLENBQVA7QUFDSDs7QUFDRFQsTUFBQUEsUUFBUSxDQUFDekMsSUFBRCxDQUFSOztBQUNBLE1BQUEsTUFBSSxDQUFDZ0QsV0FBTCxDQUFpQmhELElBQWpCO0FBQ0gsS0FORCxFQWxCNEUsQ0EwQjVFOztBQUNBNUcsSUFBQUEsT0FBTyxDQUFDdUosTUFBUixDQUFlQyxLQUFmLEdBQXVCLEtBQUtLLFFBQUwsQ0FBY0wsS0FBZCxDQUFvQlEsSUFBcEIsQ0FBeUIsS0FBS0gsUUFBOUIsQ0FBdkI7QUFDQTdKLElBQUFBLE9BQU8sQ0FBQ3lKLE1BQVIsQ0FBZUQsS0FBZixHQUF1QixLQUFLTyxRQUFMLENBQWNQLEtBQWQsQ0FBb0JRLElBQXBCLENBQXlCLEtBQUtELFFBQTlCLENBQXZCLENBNUI0RSxDQThCNUU7O0FBQ0EvSixJQUFBQSxPQUFPLENBQUMwSSxFQUFSLENBQVcsbUJBQVgsRUFBZ0MsVUFBQ3pGLEdBQUQsRUFBUztBQUNyQzZGLE1BQUFBLE9BQU8sQ0FBQ21CLEtBQVIsQ0FBY2hILEdBQWQ7QUFDQSxZQUFNQSxHQUFOO0FBQ0gsS0FIRDtBQUlIO0FBRUQ7QUFDSjtBQUNBO0FBQ0E7Ozs7O1dBQ0ksbUJBQWlCO0FBQ2JqRCxNQUFBQSxPQUFPLENBQUN1SixNQUFSLENBQWVDLEtBQWYsR0FBdUIsS0FBS0QsTUFBNUI7QUFDQXZKLE1BQUFBLE9BQU8sQ0FBQ3lKLE1BQVIsQ0FBZUQsS0FBZixHQUF1QixLQUFLQyxNQUE1QjtBQUVBLFdBQUtJLFFBQUwsQ0FBY3RILE9BQWQ7QUFDQSxXQUFLd0gsUUFBTCxDQUFjeEgsT0FBZDtBQUNIO0FBRUQ7QUFDSjtBQUNBO0FBQ0E7QUFDQTs7OztXQUNJLHNCQUFvQnFFLElBQXBCLEVBQTJDO0FBQ3ZDLFVBQUlBLElBQUksWUFBWW1CLE1BQXBCLEVBQTRCO0FBQ3hCbkIsUUFBQUEsSUFBSSxHQUFHakUsSUFBSSxDQUFDQyxTQUFMLENBQWVnRSxJQUFmLENBQVA7QUFDSDs7QUFDRCxXQUFLOEMsV0FBTCxDQUFrQjlDLElBQWxCO0FBQ0g7QUFFRDtBQUNKO0FBQ0E7QUFDQTtBQUNBOzs7O1dBQ0ksc0JBQW9CQSxJQUFwQixFQUFrQztBQUM5QixXQUFLZ0QsV0FBTCxDQUFpQmhELElBQWpCO0FBQ0g7Ozs7O0FBSUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBQ0Esd0RBQUM7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxtREFDdUMsVUFEdkM7QUFBQTs7QUFBQTtBQUFBO0FBQ1dzRCxVQUFBQSxVQURYLGlCQUNXQSxVQURYO0FBRVN0SixVQUFBQSxLQUZULEdBRW1DWixPQUFPLENBQUNDLEdBQVIsQ0FBWWtLLHdCQUFaLElBQTRELE1BRi9GO0FBR0cxSixVQUFBQSxHQUFHLEdBQUd5SixVQUFVLENBQUMsc0JBQUQsRUFBeUJ0SixLQUF6QixDQUFoQjs7QUFDQSxpQkFBTUYsaUJBQWlCLENBQUNtRCxNQUF4QixFQUFnQztBQUFBLG9CQUNIbkQsaUJBQWlCLENBQUMwSixLQUFsQixFQURHLG9DQUNyQnhKLE1BRHFCLGFBQ2RDLE9BRGM7O0FBRTNCSixZQUFBQSxHQUFELENBQWFHLE1BQWIsRUFBb0JDLE9BQXBCO0FBQ0g7O0FBUEo7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsQ0FBRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgbmV3cmVsaWMgZnJvbSAnbmV3cmVsaWMnO1xuaW1wb3J0IHpsaWIgZnJvbSAnemxpYic7XG5pbXBvcnQgeyBOZXdSZWxpY0xvZ1RyYW5zcG9ydCB9IGZyb20gJy4vTmV3UmVsaWNMb2dUcmFuc3BvcnQnO1xuaW1wb3J0IHsgUGFzc1Rocm91Z2ggfSBmcm9tICdzdHJlYW0nO1xuaW1wb3J0IHsgTG9nZ2VyIH0gZnJvbSAnd2luc3Rvbic7XG5pbXBvcnQgeyBOUE1Mb2dnaW5nTGV2ZWxzIH0gZnJvbSAnLi9sb2dnZXInO1xuaW1wb3J0IEF4aW9zIGZyb20gJ2F4aW9zJztcblxuY29uc3QgQVBJX0hPU1ROQU1FID0gcHJvY2Vzcy5lbnYuS0xfTlJfTE9HX0hPU1ROQU1FIHx8ICdsb2ctYXBpLmV1Lm5ld3JlbGljLmNvbSc7XG5jb25zdCBBUElfUEFUSCA9IHByb2Nlc3MuZW52LktMX05SX0xPR19QQVRIIHx8ICcvbG9nL3YxJztcbmNvbnN0IE1BWF9QQVlMT0FEX1NJWkUgPSAxMCoqNjtcbmNvbnN0IE1BWF9BVFRSSUJVVEVTX1BFUl9FVkVOVCA9IDI1NTtcbmNvbnN0IE1BWF9BVFRSSUJVVEVfTkFNRV9MRU5HVEggPSAyNTU7XG5jb25zdCBNQVhfQVRUUklCVVRFX1ZBTFVFX0xFTkdUSCA9IDQwOTY7XG5cbmxldCBsb2c6IExvZ2dlciB8IHVuZGVmaW5lZDtcbmxldCBpbnRlcm5hbExvZ0J1ZmZlcjogQXJyYXk8W3N0cmluZywgc3RyaW5nXT4gPSBbXTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byB3cml0ZSBsb2dzIHRoYXQgYXJlIGludGVybmFsIHRvIHRoaXMgbW9kdWxlLlxuICogQnVmZmVycyBjYWxscyB1bnRpbCB0aGUgV2luc3RvbiBsb2dnZXIgY2FuIGJlIGFzeW5jIGltcG9ydGRcbiAqIEFmdGVyd29yZHMsIHdyaXRlcyBsb2dzIGRpcmVjdGx5IHRvIHRoZSBsb2dnZXJcbiAqIEBwYXJhbSBsZXZlbCBcbiAqIEBwYXJhbSBtZXNzYWdlIFxuICovXG5mdW5jdGlvbiBpbnRlcm5hbExvZyhsZXZlbDogc3RyaW5nLCBtZXNzYWdlOiBzdHJpbmcpIHtcbiAgICBpZiAobG9nKSB7XG4gICAgICAgIChsb2cgYXMgYW55KVtsZXZlbF0obWVzc2FnZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgaW50ZXJuYWxMb2dCdWZmZXIucHVzaChbbGV2ZWwsIG1lc3NhZ2VdKTtcbiAgICB9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTmV3UmVsaWNMb2dEZWxpdmVyeUFnZW50Q29uZmlnIHtcbiAgICAvKipcbiAgICAgKiBIb3cgZnJlcXVlbnRseSBjaGVja3Mgc2hvdWxkIGJlIHJ1biB0byBwdXNoIGxvZ3MgdG8gTlJcbiAgICAgKiBEZWZhdWx0IGlzIDEwIHNlY29uZHNcbiAgICAgKi9cbiAgICAgbG9nUHVzaEZyZXF1ZW5jeT86IG51bWJlcjtcblxuICAgICAvKipcbiAgICAgICogTWluaW11bSBudW1iZXIgb2YgbG9nIHN0YXRlbWVudHMgd3JpdHRlbiBiZWZvcmUgbG9ncyBjYW4gYmUgcHVzaGVkIHRvIE5SXG4gICAgICAqIGJ5IHBlcmlvZGljIGxvZ2dlci5cbiAgICAgICogRGVmYXVsdCBpcyAyXG4gICAgICAqL1xuICAgICBtaW5Mb2dJdGVtcz86IG51bWJlcjtcbiBcbiBcbiAgICAgLyoqXG4gICAgICAqIE1pbmltdW0gbnVtYmVyIG9mIGxvZyBzdGF0ZW1lbnRzIHRvIGZvcmNlIGFuIGltbWVkaWF0ZSBwdXNoIHRvIE5SLiBVc2VkXG4gICAgICAqIHRvIGVuc3VyZSB0aGF0IHRoZSBsb2dnaW5nIHN5c3RlbSBkb2VzIG5vdCBnZXQgYmFja2VkIHVwIGlmIGFtb3VudCBiZWluZ1xuICAgICAgKiBsb2dnZWQgc3VycGFzc2VzIHRoZSBiYW5kd2lkdGggb2YgdGhlIHBlcmlvZGljIGxvZ2dlci5cbiAgICAgICogRGVmYXVsdCBpcyAxMDAuXG4gICAgICAqL1xuICAgICBtaW5Mb2dJdGVtc1RvRm9yY2U/OiBudW1iZXI7XG5cbiBcbiAgICAgLyoqXG4gICAgICAqIE1pbmltdW0gbnVtYmVyIG9mIGJ5dGVzIHdyaXR0ZW4gdG8gY29tcHJlc3Npb24gc3RyZWFtIGJlZm9yZSBwdXNoaW5nIHRvIE5SXG4gICAgICAqL1xuICAgICBtaW5CeXRlc1dyaXR0ZW4/OiBudW1iZXI7XG4gXG4gICAgIC8qKlxuICAgICAgKiBUaHJlc2hvbGQgZm9yIGJ5dGVzIHdyaXR0ZW4gYXQgd2hpY2ggcG9pbnQgYSBuZXcgd3JpdGUgdG8gTlIgd2lsbCBiZSBhdXRvbWF0aWNhbGx5XG4gICAgICAqIHRyaWdnZXJlZC4gRGVmYXVsdHMgdG8gKDQvNSAqIE1BWF9QQVlMT0FEX1NJWkUpXG4gICAgICAqL1xuICAgICBieXRlc1dyaXR0ZW5UaHJlc2hvbGQ/OiBudW1iZXI7XG4gXG4gICAgIC8qKlxuICAgICAgKiBQcm9kdWNlIGEgd2FybmluZyB3aGVuIGF0dHJpYnV0ZSB2YWx1ZXMgb3ZlcmZsb3cgdGhlIE5SIG1heGltdW0gbGVuZ3RoIG9mIDQwOTYuXG4gICAgICAqIERlZmF1bHQgaXMgZmFsc2UuXG4gICAgICAqL1xuICAgICB3YXJuT25BdHRyaWJ1dGVMZW5ndGhPdmVyZmxvdz86IGJvb2xlYW47XG59XG5cbmNvbnN0IGRlZmF1bHRDb25maWc6IE5ld1JlbGljTG9nRGVsaXZlcnlBZ2VudENvbmZpZyA9IHtcbiAgICBieXRlc1dyaXR0ZW5UaHJlc2hvbGQ6IE1BWF9QQVlMT0FEX1NJWkUgKiA0IC8gNSxcbiAgICB3YXJuT25BdHRyaWJ1dGVMZW5ndGhPdmVyZmxvdzogZmFsc2UsXG4gICAgbWluQnl0ZXNXcml0dGVuOiBNQVhfUEFZTE9BRF9TSVpFICogMSAvIDUsXG4gICAgbWluTG9nSXRlbXM6IDIsXG4gICAgbG9nUHVzaEZyZXF1ZW5jeTogNjAwMDAsXG4gICAgbWluTG9nSXRlbXNUb0ZvcmNlOiAxMDAsXG59XG5cbmV4cG9ydCBjbGFzcyBOZXdSZWxpY0xvZ0RlbGl2ZXJ5QWdlbnQge1xuIFxuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemVzIGEgTmV3UmVsaWNMb2dEZWxpdmVyeUFnZW50IGluc3RhbmNlIGlmIHRoZSBMT0dfU1RZTEUgZW52aXJvbm1lbnRcbiAgICAgKiB2YXJpYWJsZSBpcyBzZXQgdG8gTkVXX1JFTElDLiBPdGhlcndpc2UgaXQgZG9lcyBub3RoaW5nLlxuICAgICAqIEBwYXJhbSBjb25maWcgXG4gICAgICogQHJldHVybnMgXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBpbml0aWFsaXplKCkge1xuICAgICAgICBpZiAoIXByb2Nlc3MuZW52Lk5FV19SRUxJQ19MSUNFTlNFX0tFWSkgcmV0dXJuO1xuICAgICAgICBOZXdSZWxpY0xvZ0RlbGl2ZXJ5QWdlbnQuaW5zdGFuY2UgPSBuZXcgTmV3UmVsaWNMb2dEZWxpdmVyeUFnZW50KCk7XG4gICAgICAgIHJldHVybiBOZXdSZWxpY0xvZ0RlbGl2ZXJ5QWdlbnQuaW5zdGFuY2U7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyBnZXRJbnN0YW5jZSgpIHtcbiAgICAgICAgcmV0dXJuIE5ld1JlbGljTG9nRGVsaXZlcnlBZ2VudD8uaW5zdGFuY2U7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyBjb25maWd1cmUoY29uZmlnOiBOZXdSZWxpY0xvZ0RlbGl2ZXJ5QWdlbnRDb25maWcpIHtcbiAgICAgICAgY29uc3QgaW5zdGFuY2UgPSBOZXdSZWxpY0xvZ0RlbGl2ZXJ5QWdlbnQuaW5zdGFuY2U7XG4gICAgICAgIGlmICghaW5zdGFuY2UpIHtcbiAgICAgICAgICAgIGludGVybmFsTG9nKCd3YXJuJywgJ0NvbmZpZ3VyZSBjYWxsZWQgYmVmb3JlIGluc3RhbmNlIGluaXRpYWxpemF0aW9uLiBDb25maWd1cmF0aW9uIG5vdCBhcHBsaWVkJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaW5zdGFuY2UuY29uZmlnID0ge1xuICAgICAgICAgICAgLi4uaW5zdGFuY2UuY29uZmlnLFxuICAgICAgICAgICAgLi4uY29uZmlnXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIGdldFdpbnN0b25UcmFuc3BvcnQoKSB7XG4gICAgICAgIHJldHVybiBOZXdSZWxpY0xvZ0RlbGl2ZXJ5QWdlbnQ/Lmluc3RhbmNlPy5sb2dUcmFuc2Zvcm07XG4gICAgfVxuICAgIFxuICAgIHByaXZhdGUgc3RhdGljIGluc3RhbmNlOiBOZXdSZWxpY0xvZ0RlbGl2ZXJ5QWdlbnQ7XG4gICAgcHJpdmF0ZSBsb2dRdWV1ZTogYW55W10gPSBbXTtcbiAgICBwcml2YXRlIGNvbmZpZzogTmV3UmVsaWNMb2dEZWxpdmVyeUFnZW50Q29uZmlnO1xuICAgIHByaXZhdGUgbG9nTGVuZ3RoUXVldWU6IG51bWJlcltdID0gW107XG4gICAgcHJpdmF0ZSB0b3RhbExlbmd0aENvdW50ID0gMDtcbiAgICBwcml2YXRlIGdsb2JhbEF0dHJpYnV0ZXM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9ID0ge307XG4gICAgcHJpdmF0ZSBuZXdSZWxpY0xvZ1RyYW5zcG9ydDogTmV3UmVsaWNMb2dUcmFuc3BvcnQ7XG4gICAgcHJpdmF0ZSBkZWJ1Z01vZGUgPSBwcm9jZXNzLmVudi5ERUJVR19XUklURV9MT0dTX1RPX0ZJTEUgPT09ICd0cnVlJztcbiAgICBwcml2YXRlIHRpbWVvdXRJZDogTm9kZUpTLlRpbWVvdXQgfCB1bmRlZmluZWQ7XG4gICAgcHJpdmF0ZSBsb2dzV3JpdHRlbiA9IDA7XG4gICAgcHJpdmF0ZSBuZXdSZWxpY0luaXRpYWxpemVkID0gZmFsc2U7XG4gICAgXG4gICAgcHVibGljIHN0YW5kYXJkT3V0UGFzc1Rocm91Z2g6IFN0YW5kYXJkT3V0UGFzc1Rocm91Z2g7XG4gICAgXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgaW50ZXJuYWxMb2coJ2RlYnVnJywgJ0luaXRpYWxpemluZyBMb2dEZWxpdmVyeUFnZW50Jyk7XG4gICAgICAgIHRoaXMuY29uZmlnID0geyAuLi5kZWZhdWx0Q29uZmlnIH07XG5cbiAgICAgICAgaW50ZXJuYWxMb2coJ2luZm8nLCBgQ3JlYXRpbmcgTmV3UmVsaWNMb2dUcmFuc3BvcnRgKTtcbiAgICAgICAgdGhpcy5uZXdSZWxpY0xvZ1RyYW5zcG9ydCA9IG5ldyBOZXdSZWxpY0xvZ1RyYW5zcG9ydCgobG9nLCBjYikgPT4gdGhpcy5hZGRMb2cobG9nLCBjYikpO1xuXG4gICAgICAgIC8vIENyZWF0ZXMgbG9nZ2luZyBjb25maWd1cmF0aW9uIGZvciByZXdyaXRpbmcgc3Rkb3V0L3N0ZGVyclxuICAgICAgICBjb25zdCBsb2dDYWxsYmFjayA9IChsb2c6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgdGhpcy5hZGRMb2cobG9nLCAoKSA9PiB7fSk7XG4gICAgICAgIH07XG4gICAgXG4gICAgICAgIGNvbnN0IGVyckNhbGxiYWNrID0gKGxvZzogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmFkZExvZyh7XG4gICAgICAgICAgICAgICAgbGFiZWw6ICdlcnJvcicsXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogbG9nXG4gICAgICAgICAgICB9LCAoKSA9PiB7fSk7XG4gICAgICAgIH07XG4gICAgXG4gICAgICAgIHRoaXMuc3RhbmRhcmRPdXRQYXNzVGhyb3VnaCA9IG5ldyBTdGFuZGFyZE91dFBhc3NUaHJvdWdoKGxvZ0NhbGxiYWNrLCBlcnJDYWxsYmFjayk7XG4gICAgICAgIHRoaXMucmVnaXN0ZXJBcHBEZWF0aExvZ1B1c2goKTtcbiAgICAgICAgdGhpcy5jcmVhdGVMb2dDaGVja1RpbWVvdXQoKTtcbiAgICAgICAgdGhpcy5yZWdpc3Rlck5ld1JlbGljSW5pdGlhbGl6YXRpb25JbnRlcnZhbCgpOyAgICAgIFxuICAgICAgICBpbnRlcm5hbExvZygnZGVidWcnLCAnTG9nRGVsaXZlcnlBZ2VudCBJbml0aWFsaXplZCcpXG5cblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFjY2Vzc29yIGZvciBXaW5zdG9uIFRyYW5zcG9ydCB0aGF0IHdyaXRlcyB0byB0aGlzIFxuICAgICAqIGFnZW50IGluc3RhbmNlXG4gICAgICogQHJldHVybnMgd2luc3Rvbi50cmFuc3BvcnRcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0TG9nVHJhbnNwb3J0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5uZXdSZWxpY0xvZ1RyYW5zcG9ydDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTaHV0c2Rvd24gdGhlIGRlbGl2ZXJ5IGFnZW50LiBUaGlzIGNhbiBiZSB1dGlsaXplZCB3aGVuIGFwcCBpcyBleHBlY3RlZCB0byBzaHV0ZG93blxuICAgICAqIGF0IGEgZ2l2ZW4gdGltZSBhbmQgdGhlIHBlcmlvZGljIGRlbGl2ZXJ5IHRpbWVvdXQgaXMgYmxvY2tpbmcgc2h1dGRvd24uXG4gICAgICogXG4gICAgICogQ2xlYXJzIGludGVybmFsIHRpbWVvdXQsIGNvbmZpZ3VyZXMgd2luc3RvbiB0cmFuc3BvcnQgdG8gbm90IHNlbmQgbG9ncy5cbiAgICAgKiBSZWNvbm5lY3RzIHN0ZG91dCBhbmQgc3RkZXJyLlxuICAgICAqIFdyaXRlcyBhbnkgcmVtYWluaW5nIGxvZ3MuXG4gICAgICovXG4gICAgcHVibGljIHNodXRkb3duKCkge1xuICAgICAgICBpbnRlcm5hbExvZygnZGVidWcnLCAnU2h1dGRvd24gb2YgTG9nRGVsaXZlcnlBZ2VudCB0cmlnZ2VyZWQnKTtcbiAgICAgICAgaWYgKHRoaXMudGltZW91dElkKSBjbGVhclRpbWVvdXQodGhpcy50aW1lb3V0SWQpO1xuICAgICAgICB0aGlzLnN0YW5kYXJkT3V0UGFzc1Rocm91Z2guZGVzdHJveSgpO1xuICAgICAgICB0aGlzLm5ld1JlbGljTG9nVHJhbnNwb3J0LmNsb3NlKCk7XG4gICAgICAgIHRoaXMud3JpdGVMb2dzU3luYygpO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogRGV0ZXJtaW5lIGlmIHRoZSBsb2cgc3RyaW5nIG9yIG9iamVjdCBpcyBhIE5ldyBSZWxpYyBcbiAgICAgKiBjb21wYXRpYmxlIEpTT04uIEluIG9yZGVyIHRvIGJlIGNvbnNpZGVyZWQgdGhpcyBpdCBtdXN0XG4gICAgICogYmUgYSB3ZWxsIHN0cnVjdHVyZWQgSlNPTiBvYmplY3Qgd2l0aCBhIHRvcCBsZXZlbCAnbWVzc2FnZSdcbiAgICAgKiBhbmQgJ2xldmVsJyBwcm9wZXJ0eS5cbiAgICAgKiBAcGFyYW0gc3RyIFxuICAgICAqIEByZXR1cm5zIG9iamVjdCBmb3JtIG9mIEpTT04gb3IgZmFsc2VcbiAgICAgKi9cbiAgICBwcml2YXRlIGlzTlJDb21wYXRpYmxlSnNvbkxvZ1N0cmluZyhzdHI6IHN0cmluZyB8IG9iamVjdCkge1xuICAgICAgICBpZiAodHlwZW9mIHN0ciA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIHN0ciA9IEpTT04uc3RyaW5naWZ5KHN0cik7XG4gICAgICAgIH1cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IG9iaiA9IEpTT04ucGFyc2Uoc3RyIGFzIHN0cmluZyk7XG4gICAgICAgICAgICAvLyBSZXdyaXRlIGJvb3RzdHJhcCBvYmplY3QgaW50byBhIGZvcm1hdCB0aGF0IHdpbGwgd29yayBmb3IgbmV3IHJlbGljXG4gICAgICAgICAgICBpZiAob2JqLm1zZyAmJiBvYmo/Lm5hbWUoJ25ld3JlbGljX2Jvb3RzdHJhcCcpICYmICFvYmoubWVzc2FnZSkge1xuICAgICAgICAgICAgICAgIG9iai5tZXNzYWdlID0gb2JqLm1zZztcbiAgICAgICAgICAgICAgICBvYmoubGV2ZWwgPSAnaW5mbyc7XG4gICAgICAgICAgICAgICAgZGVsZXRlIG9iai5tc2c7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAob2JqICYmIHR5cGVvZiBvYmogPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgICAgICBpZiAob2JqLm1lc3NhZ2UgJiYgb2JqLmxldmVsKSB7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7IH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEludGVybmFsIGZ1bmN0aW9uIHVzZWQgdG8gYWNjZXB0IGxvZyBzdGF0ZW1lbnRzIGFuZFxuICAgICAqIHByb2Nlc3MgdGhlbS4gTG9nIGlzIHR5cGVkIHRvIGFueSB0byBmaXQgdHlwaW5nIGZvclxuICAgICAqIHRoZSBXaW5zdG9uIHRyYW5zcG9ydC5cbiAgICAgKiBcbiAgICAgKiBUT0RPOiBSZXdvcmsgdGhlIFdpbnN0b24gdHJhbnNwb3J0IGxvZ2ljIHRvIGRvIGEgYml0XG4gICAgICogICAgICBtb3JlIHdvcmsgdG8gcHJvdmlkZSBtb3JlIGNvbnNpc3RlbnQgdHlwaW5nLlxuICAgICAqIFxuICAgICAqIEBwYXJhbSBsb2cgXG4gICAgICogQHBhcmFtIGNhbGxiYWNrIFxuICAgICAqL1xuICAgIHByaXZhdGUgYWRkTG9nKGxvZzogYW55LCBjYWxsYmFjazogKCgpID0+IHZvaWQpIHwgdW5kZWZpbmVkKSB7XG4gICAgICAgIGNvbnN0IGpzb25EYXRhID0gdGhpcy5pc05SQ29tcGF0aWJsZUpzb25Mb2dTdHJpbmcobG9nKTtcbiAgICAgICAgaWYoanNvbkRhdGEpIHtcbiAgICAgICAgICAgIHRoaXMucHJvY2Vzc0FzSnNvbkxvZyhqc29uRGF0YSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnByb2Nlc3NBc1N0cmluZ0xvZyhsb2cpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuaW1tZWRpYXRlTG9nV3JpdGFibGVQcmVkaWNhdGUoKSkge1xuICAgICAgICAgICAgdGhpcy5iZWdpbldyaXRlTG9ncygpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGpzb25EYXRhKSBsb2cgPSBKU09OLnN0cmluZ2lmeShsb2cpKydcXG4nO1xuICAgIFxuICAgICAgICBpZiAoanNvbkRhdGE/Lm1lc3NhZ2UgJiYganNvbkRhdGE/LmxldmVsID09PSAnZXJyb3InKSB7XG4gICAgICAgICAgICB0aGlzLnN0YW5kYXJkT3V0UGFzc1Rocm91Z2guc3RkZXJyQnlwYXNzKGxvZyk7XG4gICAgICAgIH0gZWxzZSBpZihqc29uRGF0YS5tZXNzYWdlKSB7XG4gICAgICAgICAgICB0aGlzLnN0YW5kYXJkT3V0UGFzc1Rocm91Z2guc3Rkb3V0QnlwYXNzKGxvZyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY2FsbGJhY2spIGNhbGxiYWNrKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSGFuZGxlciBmb3IgcHJvY2Vzc2luZyBhIGxvZyBzdGF0ZW1lbnQgd2hlbiBpdCBpcyBmb3JtYXR0ZWRcbiAgICAgKiBhcyBhIE5ldyBSZWxpYyBjb21wYXRpYmxlIEpTT04gc3RyaW5nLlxuICAgICAqIEBwYXJhbSBsb2cgXG4gICAgICovXG4gICAgcHJvY2Vzc0FzSnNvbkxvZyhsb2c6IGFueSkge1xuICAgICAgICB0aGlzLmxvZ1RyYW5zZm9ybShsb2cpO1xuICAgICAgICBjb25zdCBsb2dTdHJpbmcgPSBKU09OLnN0cmluZ2lmeShsb2cpO1xuICAgICAgICBjb25zdCBsZW5ndGggPSBCdWZmZXIuYnl0ZUxlbmd0aChsb2dTdHJpbmcpO1xuICAgICAgICB0aGlzLmxvZ1F1ZXVlLnB1c2gobG9nKTtcbiAgICAgICAgdGhpcy5sb2dMZW5ndGhRdWV1ZS5wdXNoKGxlbmd0aCk7XG4gICAgICAgIHRoaXMudG90YWxMZW5ndGhDb3VudCArPSBsZW5ndGg7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSGFuZGxlciBmb3IgcHJvY2Vzc2luZyBhIGxvZyBzdGF0ZW1lbnQgdGhhdCBpcyBhIHNpbXBsZVxuICAgICAqIHN0cmluZyBmb3JtYXQuXG4gICAgICogQHBhcmFtIGxvZyBcbiAgICAgKi9cbiAgICBwcm9jZXNzQXNTdHJpbmdMb2cobG9nOiBzdHJpbmcpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBsb2cgPT09ICdzdHJpbmcnICYmIGxvZy5lbmRzV2l0aCgnXFxuJykpIHtcbiAgICAgICAgICAgIGxvZyA9IGxvZy5zdWJzdHJpbmcoMCwgbG9nLmxlbmd0aCAtIDEpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbmV3UmVsaWNNZXRhZGF0YSA9IG5ld3JlbGljLmdldExpbmtpbmdNZXRhZGF0YSgpO1xuICAgICAgICBjb25zdCBzdHJ1Y3R1cmVkTG9nID0ge1xuICAgICAgICAgICAgbWVzc2FnZTogbG9nLFxuICAgICAgICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxuICAgICAgICAgICAgb3JpZ2luYWxfdGltZXN0YW1wOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICAgICAgICBcImVudGl0eS5uYW1lXCI6IG5ld1JlbGljTWV0YWRhdGFbJ2VudGl0eS5uYW1lJ10sXG4gICAgICAgICAgICBcImVudGl0eS50eXBlXCI6IG5ld1JlbGljTWV0YWRhdGFbJ2VudGl0eS50eXBlJ10sXG4gICAgICAgICAgICBob3N0bmFtZTogbmV3UmVsaWNNZXRhZGF0YS5ob3N0bmFtZVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QganNvbkxvZ1N0cmluZyA9IEpTT04uc3RyaW5naWZ5KHN0cnVjdHVyZWRMb2cpO1xuICAgICAgICBjb25zdCBsZW5ndGggPSBCdWZmZXIuYnl0ZUxlbmd0aChqc29uTG9nU3RyaW5nKTtcbiAgICAgICAgdGhpcy5sb2dRdWV1ZS5wdXNoKHN0cnVjdHVyZWRMb2cpO1xuICAgICAgICB0aGlzLmxvZ0xlbmd0aFF1ZXVlLnB1c2gobGVuZ3RoKTtcbiAgICAgICAgdGhpcy50b3RhbExlbmd0aENvdW50ICs9IGxlbmd0aDtcbiAgICB9XG4gICAgXG4gICAgLyoqXG4gICAgICogU2V0IGdsb2JhbCBhdHRyaWJ1dGVzIGZvciB0aGUgYXBwbGljYXRpb24uICBUaGlzIHNob3VsZFxuICAgICAqIGdlbmVyYWxseSBiZSBjb25maWd1cmVkIGVhcmx5IGluIHRoZSBhcHBsaWNhdGlvbiBsaWZlY3ljbGUuXG4gICAgICogR2xvYmFsIGF0dHJpYnV0ZXMgd2lsbCBiZSBib3VuZCB0byBhbGwgbG9nIHN0YXRlbWVudHNcbiAgICAgKiBpbiBOZXcgUmVsaWMuXG4gICAgICogQHBhcmFtIGF0dHJpYnV0ZXMgS1YgcGFpcnMgdG8gYmUgcHJvdmlkZWQgdG8gTlIgd2l0aCBsb2dzXG4gICAgICovXG4gICAgc2V0R2xvYmFsQXR0cmlidXRlcyhhdHRyaWJ1dGVzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSkge1xuICAgICAgICB0aGlzLmdsb2JhbEF0dHJpYnV0ZXMgPSBhdHRyaWJ1dGVzO1xuICAgIH0gIFxuXG4gICAgLyoqXG4gICAgICogV3JpdGVzIGxvZ3Mgc3luY2hyb25vdXNseS4gIFRoaXMgZnVuY3Rpb24gaXMgaW50ZW5kZWQgdG8gYmVcbiAgICAgKiB1dGlsaXplZCBpbiBzaXR1YXRpb25zIHdoZXJlIGxvZ2dpbmcgY2Fubm90IGJlIHdyaXR0ZW4gXG4gICAgICogYXN5bmNocm9ub3VzbHksIG1vc3QgY29tbW9ubHkgaW4gdGhlIGhhbmRsZXIgb2YgYSBTSUdURVJNXG4gICAgICogZXZlbnQsIHdoaWNoIG9ubHkgYWxsb3dzIHN5bmNocm9ub3VzIGNhbGxzLlxuICAgICAqL1xuICAgIHByaXZhdGUgd3JpdGVMb2dzU3luYygpIHtcbiAgICAgICAgY29uc3QgbG9nc1RvV3JpdGUgPSB0aGlzLnNsaWNlTG9ncygpO1xuICAgICAgICBpbnRlcm5hbExvZygnc2lsbHknLCBgUHJlcGFyaW5nIGZpbmFsIGxvZyBwYXlsb2FkIG9mICR7bG9nc1RvV3JpdGUubGVuZ3RofSBmb3IgTlIgY29sbGVjdG9yYCk7XG4gICAgICAgIGNvbnN0IHJhd1BheWxvYWQgPSB0aGlzLmJ1aWxkUmF3UG9zdEJvZHkobG9nc1RvV3JpdGUpO1xuICAgICAgICBjb25zdCBjb21wcmVzc2VkUGF5bG9hZCA9IHpsaWIuZ3ppcFN5bmMocmF3UGF5bG9hZCk7XG4gICAgICAgIGlmICghdGhpcy5kZWJ1Z01vZGUpIHtcbiAgICAgICAgICAgIHRoaXMuc2VuZExvZ3MoY29tcHJlc3NlZFBheWxvYWQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy53cml0ZUxvZ3NUb0ZpbGVTeXN0ZW0oY29tcHJlc3NlZFBheWxvYWQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIHdyaXRlTG9nc1RvRmlsZVN5c3RlbShidWZmZXI6IEJ1ZmZlcikge1xuICAgICAgICBmcy53cml0ZUZpbGVTeW5jKGB0ZXN0LSR7dGhpcy5sb2dzV3JpdHRlbisrfS5nemAsIGJ1ZmZlcik7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBiZWdpbldyaXRlTG9ncygpIHtcbiAgICAgICAgY29uc3QgbG9nc1RvV3JpdGUgPSB0aGlzLnNsaWNlTG9ncygpO1xuXG4gICAgICAgIGludGVybmFsTG9nKCdzaWxseScsIGBQcmVwYXJpbmcgbG9nIHBheWxvYWQgb2YgJHtsb2dzVG9Xcml0ZS5sZW5ndGh9IGZvciBOUiBjb2xsZWN0b3JgKTtcbiAgICAgICAgY29uc3QgcmF3UGF5bG9hZCA9IHRoaXMuYnVpbGRSYXdQb3N0Qm9keShsb2dzVG9Xcml0ZSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBjb21wcmVzc2VkUGF5bG9hZDogQnVmZmVyID0gYXdhaXQgdGhpcy5jb21wcmVzc1BheWxvYWQocmF3UGF5bG9hZCk7XG4gICAgICAgICAgICBpZiAoIXRoaXMuZGVidWdNb2RlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZW5kTG9ncyhjb21wcmVzc2VkUGF5bG9hZCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMud3JpdGVMb2dzVG9GaWxlU3lzdGVtKGNvbXByZXNzZWRQYXlsb2FkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zdCBmYWxsYmFja01lc3NhZ2UgPSAnVW5rbm93biBlcnJvciBvY2N1cnJlZCB3aGlsZSBjb21wcmVzc2luZyBsb2dzIHRvIHNlbmQgdG8gTmV3IFJlbGljJztcbiAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnIgaW5zdGFuY2VvZiBFcnJvciAmJiBlcnIuc3RhY2sgPyBlcnIuc3RhY2sgOiBmYWxsYmFja01lc3NhZ2U7IFxuICAgICAgICAgICAgaW50ZXJuYWxMb2coJ2Vycm9yJywgbWVzc2FnZSlcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEhhbmRsZXMgSFRUUCByZXF1ZXN0IHRoYXQgc2VuZHMgY29tcHJlc3NlZCBsb2cgZGF0YVxuICAgICAqIHRvIHRoZSBOZXcgUmVsaWMgZW5kcG9pbnQuXG4gICAgICogQHBhcmFtIGNvbXByZXNzZWRQYXlsb2FkIFxuICAgICAqL1xuICAgIHByaXZhdGUgc2VuZExvZ3MoY29tcHJlc3NlZFBheWxvYWQ6IEJ1ZmZlcikge1xuICAgICAgICBBeGlvcy5wb3N0KGBodHRwczovLyR7QVBJX0hPU1ROQU1FfSR7QVBJX1BBVEh9YCwgY29tcHJlc3NlZFBheWxvYWQsIHtcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAnQWNjZXB0JzogJyovKicsXG4gICAgICAgICAgICAgICAgJ0FwaS1LZXknOiBwcm9jZXNzLmVudi5ORVdfUkVMSUNfTElDRU5TRV9LRVkgYXMgc3RyaW5nLFxuICAgICAgICAgICAgICAgICdDb250ZW50LUVuY29kaW5nJzogJ2d6aXAnLFxuICAgICAgICAgICAgICAgICdDb250ZW50LUxlbmd0aCc6ICcnK2NvbXByZXNzZWRQYXlsb2FkLmJ5dGVMZW5ndGgsXG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9nemlwJyxcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgICAgICBpZiAoWzIwMCwgMjAyXS5pbmNsdWRlcyhyZXNwb25zZS5zdGF0dXMpKSB7XG4gICAgICAgICAgICAgICAgaW50ZXJuYWxMb2coJ3NpbGx5JywgYExvZyBwYXlsb2FkIGFjY2VwdGVkIGJ5IE5ldyBSZWxpYyBBUEkuIFJlcXVlc3QgSUQ6ICR7cmVzcG9uc2UuZGF0YS5yZXF1ZXN0SWR9YClcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaW50ZXJuYWxMb2coJ3dhcm4nLCBgVW5leHBlY3RlZCBzdWNjZXNzZnVsIHJlc3BvbnNlIHN0YXR1cyBjb2RlIGZyb20gTlI6ICR7cmVzcG9uc2Uuc3RhdHVzfWApXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSkuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgICAgIGludGVybmFsTG9nKCdlcnJvcicsICdFcnJvciBzZW5kaW5nIGxvZyBwYXlsb2FkIHRvIE5ldyBSZWxpYycpO1xuICAgICAgICAgICAgaW50ZXJuYWxMb2coJ2Vycm9yJywgZXJyLnN0YWNrKVxuICAgICAgICB9KVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgdGhlIGdyZWF0ZXIgb2JqZWN0IHN0cnVjdHVyZSBmb3IgYSBsb2cgZGVsaXZlcnkgXG4gICAgICogcGF5bG9hZCBhbmQgYXR0YWNoZXMgYW4gYXJyYXkgb2YgbG9ncyB0byBpdC4gUmV0dXJucyBcbiAgICAgKiBzdHJpbmdpZmllZC5cbiAgICAgKiBAcGFyYW0gbG9ncyBcbiAgICAgKiBAcmV0dXJucyBcbiAgICAgKi9cbiAgICBwcml2YXRlIGJ1aWxkUmF3UG9zdEJvZHkobG9nczogYW55W10pOiBzdHJpbmcge1xuICAgICAgICBjb25zdCBwYXlsb2FkID0gW3tcbiAgICAgICAgICAgIGNvbW1vbjoge1xuICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgLi4udGhpcy5nbG9iYWxBdHRyaWJ1dGVzLFxuICAgICAgICAgICAgICAgICAgICBzZXJ2aWNlOiBwcm9jZXNzLmVudi5ORVdfUkVMSUNfQVBQX05BTUUsXG4gICAgICAgICAgICAgICAgICAgIGVudGl0eUd1aWQ6IG5ld3JlbGljLmdldExpbmtpbmdNZXRhZGF0YSgpWydlbnRpdHkuZ3VpZCddLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbG9nczogbG9nc1xuICAgICAgICB9XTtcbiAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHBheWxvYWQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFzeW5jaHJvbm91c2x5IGNvbXByZXNzIHN0cmluZyB0byBnemlwIGNvbXByZXNzZWQgZGF0YS5cbiAgICAgKiBAcGFyYW0gcmF3UGF5bG9hZCBcbiAgICAgKiBAcmV0dXJucyBcbiAgICAgKi9cbiAgICBwcml2YXRlIGFzeW5jIGNvbXByZXNzUGF5bG9hZChyYXdQYXlsb2FkOiBzdHJpbmcpOiBQcm9taXNlPEJ1ZmZlcj4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8QnVmZmVyPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICB6bGliLmd6aXAoQnVmZmVyLmZyb20ocmF3UGF5bG9hZCwgJ3V0ZjgnKSwgKGVyciwgY29tcHJlc3NlZFBheWxvYWQpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSByZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgICByZXNvbHZlKGNvbXByZXNzZWRQYXlsb2FkKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTbGljZXMgbG9nIHF1ZXVlLlxuICAgICAqIFdpbGwgcHJlZmVyIHRvIHVzZSB0aGUgZW50aXJlIGxvZyBxdWV1ZSB3aGVuIHBvc3NpYmxlLCBidXRcbiAgICAgKiBtYXkgc2VuZCBvbmx5IGEgc3Vic2VjdGlvbiBpZiB0aGUgc2l6ZSBvZiB0aGUgZGF0YSBpcyBuZWFyXG4gICAgICogdGhlIGxpbWl0YXRpb25zIGRlZmluZWQgYnkgTmV3IFJlbGljJ3MgQVBJLlxuICAgICAqIEByZXR1cm5zIFxuICAgICAqL1xuICAgIHByaXZhdGUgc2xpY2VMb2dzKCkge1xuICAgICAgICBsZXQgbG9nc1RvU2VuZDtcbiAgICAgICAgXG4gICAgICAgIC8vIElmIHdlIGtub3cgdGhlIHRvdGFsIGxlbmd0aCB3aWxsIG5vdCBleGNlZWQgbWF4aW11bSBsZW5ndGggc2l6ZVxuICAgICAgICBpZiAodGhpcy50b3RhbExlbmd0aENvdW50IDwgTUFYX1BBWUxPQURfU0laRSkge1xuICAgICAgICAgICAgW2xvZ3NUb1NlbmQsIHRoaXMubG9nUXVldWVdID0gW3RoaXMubG9nUXVldWUsIFtdXTtcbiAgICAgICAgICAgIHRoaXMubG9nTGVuZ3RoUXVldWUgPSBbXTtcbiAgICAgICAgICAgIHRoaXMudG90YWxMZW5ndGhDb3VudCA9IDA7XG4gICAgICAgICAgICByZXR1cm4gbG9nc1RvU2VuZDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIG90aGVyd2lzZSwgc2xpY2Ugb2ZmIGEgc2xpY2Ugb2YgbG9ncyB0aGF0IHdpbGwgZml0IGludG8gYSBzaW5nbGUgcmVxdWVzdFxuICAgICAgICBsZXQgbG9nU2l6ZSA9IDA7XG4gICAgICAgIGxldCBsb2dTbGljZUluZGV4ID0gMDtcblxuICAgICAgICB3aGlsZSgodGhpcy5sb2dRdWV1ZS5sZW5ndGggPiAwKSAmJiAobG9nU2l6ZSArIHRoaXMubG9nTGVuZ3RoUXVldWVbMF0gPCBNQVhfUEFZTE9BRF9TSVpFKSkge1xuICAgICAgICAgICAgbG9nU2xpY2VJbmRleCsrO1xuICAgICAgICB9XG5cbiAgICAgICAgbG9nc1RvU2VuZCA9IHRoaXMubG9nUXVldWUuc2xpY2UoMCwgbG9nU2xpY2VJbmRleCk7XG4gICAgICAgIHRoaXMubG9nUXVldWUgPSB0aGlzLmxvZ1F1ZXVlLnNsaWNlKGxvZ1NsaWNlSW5kZXgpO1xuICAgICAgICB0aGlzLmxvZ0xlbmd0aFF1ZXVlID0gdGhpcy5sb2dMZW5ndGhRdWV1ZS5zbGljZShsb2dTbGljZUluZGV4KTtcblxuICAgICAgICByZXR1cm4gbG9nc1RvU2VuZDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQcmVkaWNhdGUgdG8gZGV0ZXJtaW5lIGlmIGxvZ3Mgc2hvdWxkIGJlIHdyaXR0ZW4gYmUgd3JpdHRlbiBpbW1lZGlhdGVseS5cbiAgICAgKiBAcmV0dXJucyBib29sZWFuXG4gICAgICovXG4gICAgcHJpdmF0ZSBpbW1lZGlhdGVMb2dXcml0YWJsZVByZWRpY2F0ZSgpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKHRoaXMubmV3UmVsaWNJbml0aWFsaXplZCAmJiB0aGlzLmxvZ1F1ZXVlLmxlbmd0aCA+ICh0aGlzLmNvbmZpZy5taW5Mb2dJdGVtc1RvRm9yY2UgfHwgMTAwKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBQdXNoIGxvZ3MgZXZlbiBpZiBuZXcgcmVsaWMgaGFzbid0IGJlZW4gaW5pdGlhbGl6ZWQgaWYgdGhlIGJhY2tsb2cgZ3Jvd3MgdG9vIGxhcmdlXG4gICAgICAgIGlmICh0aGlzLmxvZ1F1ZXVlLmxlbmd0aCA+IDUwMCkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFByZWRpY2F0ZSB0byBkZXRlcm1pbmUgaWYgbG9ncyBzaG91bGQgYmUgd3JpdHRlbiBvbiBuZXh0IHBlcmlvZGljIGNoZWNrLlxuICAgICAqIEByZXR1cm5zIGJvb2xlYW5cbiAgICAgKi9cbiAgICBwcml2YXRlIGxvZ3NXcml0YWJsZVByZWRpY2F0ZSgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWluTG9nSXRlbXNFeGNlZWRlZCgpXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUHJlZGljYXRlIHRvIGRldGVybWluZSBpZiB0aGUgdG90YWwgbG9ncyBoYXZlIGV4Y2VlZGVkIGEgY29uZmlndXJlZCBtaW5Mb2dcbiAgICAgKiBjb3VudCB2YWx1ZSBpZiBzdWNoIGEgdmFsdWUgaXMgY29uZmlndXJlZC5cbiAgICAgKiBAcmV0dXJucyBcbiAgICAgKi9cbiAgICBwcml2YXRlIG1pbkxvZ0l0ZW1zRXhjZWVkZWQoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiAhISh0aGlzLmNvbmZpZy5taW5Mb2dJdGVtcyAmJiAodGhpcy5sb2dRdWV1ZS5sZW5ndGggPiB0aGlzLmNvbmZpZy5taW5Mb2dJdGVtcykpO1xuICAgIH0gICAgXG4gICAgXG4gICAgLyoqXG4gICAgICogRml4ZXMgcG9zc2libGUgaXNzdWVzIGluIGxvZyBmb3JtYXQgY2F1c2VkIGJ5IGxpbWl0YXRpb25zIG9mIE5ScyBsb2dnaW5nXG4gICAgICogdmFsdWVzXG4gICAgICogQHBhcmFtIGxvZyBcbiAgICAgKiBAcmV0dXJucyBcbiAgICAgKi9cbiAgICBwcml2YXRlIGxvZ1RyYW5zZm9ybShsb2c6IGFueSkge1xuICAgICAgICBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMobG9nKS5sZW5ndGggPiBNQVhfQVRUUklCVVRFU19QRVJfRVZFTlQpIHtcbiAgICAgICAgICAgIGludGVybmFsTG9nKCd3YXJuJywgYExvZyB0byBzZW5kIHRvIEpTT04gY29udGFpbnMgJHtPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhsb2cpfSAvICR7TUFYX0FUVFJJQlVURVNfUEVSX0VWRU5UfSBhdHRyaWJ1dGVzLmApO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBmb3IgKGxldCBrZXkgb2YgT2JqZWN0LmtleXMobG9nKSkge1xuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBsb2dba2V5XTtcbiAgICAgICAgICAgIC8vIHJlcGxhY2Uga2V5IHdpdGggbGVuZ3RoIHRvbyBoaWdoXG4gICAgICAgICAgICBpZiAoa2V5Lmxlbmd0aCA+IE1BWF9BVFRSSUJVVEVfTkFNRV9MRU5HVEgpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBuZXdLZXkgPSBrZXkuc2xpY2UoMCwgTUFYX0FUVFJJQlVURV9OQU1FX0xFTkdUSCk7XG4gICAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGxvZywga2V5LnNsaWNlKDAsIE1BWF9BVFRSSUJVVEVfTkFNRV9MRU5HVEgpLCBcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihsb2csIGtleSBhcyBQcm9wZXJ0eUtleSkgYXMgUHJvcGVydHlEZXNjcmlwdG9yKTtcbiAgICAgICAgICAgICAgICBkZWxldGUgbG9nLmtleTtcblxuICAgICAgICAgICAgICAgIC8vIFVwZGF0ZSBrZXkgbmFtZSBmb3IgdXNhZ2UgaW4gbGF0ZXIgc3RlcHNcbiAgICAgICAgICAgICAgICBrZXkgPSBuZXdLZXk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIENvbmNhdGVuYXRlIGxvZyBtZXNzYWdlcyB3aXRoIGxlbmd0aCBncmVhdGVyIHRoYW4gTUFYX0FUVFJJQlVURV9WQUxVRV9MRU5HVEhcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmIHZhbHVlLmxlbmd0aCA+IE1BWF9BVFRSSUJVVEVfVkFMVUVfTEVOR1RIKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY29uZmlnPy53YXJuT25BdHRyaWJ1dGVMZW5ndGhPdmVyZmxvdykge1xuICAgICAgICAgICAgICAgICAgICBpbnRlcm5hbExvZygnd2FybicsIGBOUiBMb2cgYXR0cmlidXRlIGxlbmd0aCBvdmVyZmxvdy4gTGVuZ3RoOiAke3ZhbHVlLmxlbmd0aH0vJHtNQVhfQVRUUklCVVRFX1ZBTFVFX0xFTkdUSH1gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbG9nLmtleSA9IHZhbHVlLnNsaWNlKDAsIE1BWF9BVFRSSUJVVEVfVkFMVUVfTEVOR1RIKTsgXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChrZXkuaW5jbHVkZXMoJyAnKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG5ld0tleSA9IGtleS5yZXBsYWNlQWxsKCcgJywgJy4nKTtcbiAgICAgICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobG9nLCBrZXkuc2xpY2UoMCwgTUFYX0FUVFJJQlVURV9OQU1FX0xFTkdUSCksIFxuICAgICAgICAgICAgICAgICAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGxvZywga2V5IGFzIFByb3BlcnR5S2V5KSBhcyBQcm9wZXJ0eURlc2NyaXB0b3IpO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBsb2cua2V5O1xuXG4gICAgICAgICAgICAgICAgLy8gVXBkYXRlIGtleSBuYW1lIGZvciB1c2FnZSBpbiBsYXRlciBzdGVwc1xuICAgICAgICAgICAgICAgIGtleSA9IG5ld0tleTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiB1c2VkIHRvIHJlcGVhdGVkbHkgdHJpZ2dlciBsb2cgcHVzaGVzXG4gICAgICovXG4gICAgcHJpdmF0ZSBjcmVhdGVMb2dDaGVja1RpbWVvdXQoKSB7XG4gICAgICAgIHRoaXMudGltZW91dElkID0gc2V0VGltZW91dChhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy5sb2dRdWV1ZS5sZW5ndGggPiAodGhpcy5jb25maWcubWluTG9nSXRlbXMgfHwgMSkpIHtcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLmJlZ2luV3JpdGVMb2dzKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5jcmVhdGVMb2dDaGVja1RpbWVvdXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdGhpcy5jb25maWcubG9nUHVzaEZyZXF1ZW5jeSlcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBIZWxwZXIgbWV0aG9kIHRoYXQgcmVnaXN0ZXJzIGxpc3RlbmVycyBmb3IgZXZlbnRzXG4gICAgICogcmVsYXRlZCB0byBpbW1pbmVudCBhcHBsaWNhdGlvbiBzaHV0ZG93biBzbyB0aGF0XG4gICAgICogZmluYWwgbG9ncyBjYW4gYmUgcHVzaGVkXG4gICAgICovXG4gICAgcHJpdmF0ZSByZWdpc3RlckFwcERlYXRoTG9nUHVzaCgpIHtcbiAgICAgICAgbGV0IGZpbmFsV3JpdHRlbiA9IGZhbHNlO1xuICAgICAgICBwcm9jZXNzLm9uKCdleGl0JywgKCkgPT4ge1xuICAgICAgICAgICAgaWYgKHRoaXMudGltZW91dElkKSBjbGVhclRpbWVvdXQodGhpcy50aW1lb3V0SWQpO1xuICAgICAgICAgICAgbGV0IG8gPSBmaW5hbFdyaXR0ZW47XG4gICAgICAgICAgICBmaW5hbFdyaXR0ZW4gPSB0cnVlO1xuICAgICAgICAgICAgaWYgKG8pIHJldHVybjtcblxuICAgICAgICAgICAgaW50ZXJuYWxMb2coJ2luZm8nLCAnd3JpdGluZyBmaW5hbCBsb2dzJyk7XG5cbiAgICAgICAgICAgIHRoaXMud3JpdGVMb2dzU3luYygpO1xuICAgICAgICB9KTtcblxuICAgICAgICBwcm9jZXNzLm9uKCdTSUdJTlQnLCAoKSA9PiB7XG4gICAgICAgICAgICBwcm9jZXNzLmV4aXQoMik7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHByb2Nlc3Mub24oJ3VuY2F1Z2h0RXhjZXB0aW9uJywgKGUpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGUpO1xuICAgICAgICAgICAgaW50ZXJuYWxMb2coJ2Vycm9yJywgZS5zdGFjayB8fCAnJyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHByb2Nlc3Mub24oJ1NJR1RFUk0nLCAoKSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy50aW1lb3V0SWQpIGNsZWFyVGltZW91dCh0aGlzLnRpbWVvdXRJZCk7XG4gICAgICAgICAgICB0aGlzLndyaXRlTG9nc1N5bmMoKTtcbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBOZXcgUmVsaWMgZG9lcyBub3QgZXhwb3NlIGEgbWV0aG9kIHRvIGNoZWNrIGl0cyBpbml0aWFsaXphdGlvbiBzdGF0dXNcbiAgICAgKiBJZiB3ZSBwdXNoIGxvZ3MgYmVmb3JlIE5ldyBSZWxpYyBpbml0aWFsaXplcywgdGhleSB3aWxsIG5vdCBoYXZlIGFuIGF0dGFjaGVkXG4gICAgICogZW50aXR5IGd1aWQuICBGb3IgdGhpcyByZWFzb24gd2Ugd2lsbCBpbml0aWFsaXplIGFuIGludGVydmFsIHRoYXQgY2FuIHJ1biB1bnRpbFxuICAgICAqIGl0IGlzIGluaXRpYWxpemVkLlxuICAgICAqL1xuICAgIHByaXZhdGUgcmVnaXN0ZXJOZXdSZWxpY0luaXRpYWxpemF0aW9uSW50ZXJ2YWwoKSB7XG4gICAgICAgIGNvbnN0IG5ld1JlbGljSW5pdGlhbGl6YXRpb25DaGVja1RpbWVvdXQgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBtZXRhZGF0YSA9IG5ld3JlbGljLmdldExpbmtpbmdNZXRhZGF0YSgpO1xuICAgICAgICAgICAgaWYgKG1ldGFkYXRhWydlbnRpdHkuZ3VpZCddKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5uZXdSZWxpY0luaXRpYWxpemVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBpbnRlcm5hbExvZygnaW5mbycsICdEZXRlY3RlZCBOZXcgUmVsaWMgaGFzIGluaXRpYWxpemVkIHdpdGggZW50aXR5Lmd1aWQnKTtcbiAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKG5ld1JlbGljSW5pdGlhbGl6YXRpb25DaGVja1RpbWVvdXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCAxMDApO1xuICAgIH1cbn1cblxuLyoqXG4gKiBSZXBsYWNlcyBleGlzdGluZyB3cml0ZXJzIGZvciBzdGRvdXQgYW5kIHN0ZGVyciB3aXRoXG4gKiBQYXNzVGhyb3VnaCBzdHJlYW1zIHRoYXQgd2lsbCBpbnZva2UgcHJvdmlkZWQgY2FsbGJhY2tzXG4gKiB3aXRoIHRoZSBkYXRhIHByaW9yIHRvIHBhc3NpbmcgdGhlbSB0byB0aGUgb3JpZ2luYWwgc3RyZWFtc1xuICovXG5jbGFzcyBTdGFuZGFyZE91dFBhc3NUaHJvdWdoIHtcblxuXG4gICAgcHJpdmF0ZSByZWFkb25seSBzdGRvdXRQdCA9IG5ldyBQYXNzVGhyb3VnaCgpO1xuICAgIHByaXZhdGUgcmVhZG9ubHkgc3RkZXJyUHQgPSBuZXcgUGFzc1Rocm91Z2goKTtcblxuICAgIHByaXZhdGUgcmVhZG9ubHkgc3Rkb3V0O1xuICAgIHByaXZhdGUgcmVhZG9ubHkgc3RkZXJyO1xuXG4gICAgcHJpdmF0ZSByZWFkb25seSB3cml0ZVN0ZG91dDtcbiAgICBwcml2YXRlIHJlYWRvbmx5IHdyaXRlU3RkZXJyO1xuXG4gICAgY29uc3RydWN0b3Ioc3Rkb3V0Q2I6IChkYXRhOiBzdHJpbmcpID0+IHZvaWQsIHN0ZGVyckNiOiAoZGF0YTogc3RyaW5nKSA9PiB2b2lkKSB7XG4gICAgICAgIC8vIFN0b3JlIG9yaWdpbmFsIHdyaXRlIHN0ZG91dC9zdGRlcnIgd3JpdGUgZnVuY3Rpb25zXG4gICAgICAgIHRoaXMuc3Rkb3V0ID0gcHJvY2Vzcy5zdGRvdXQud3JpdGU7XG4gICAgICAgIHRoaXMuc3RkZXJyID0gcHJvY2Vzcy5zdGRlcnIud3JpdGU7XG5cbiAgICAgICAgLy8gQ3JlYXRlIGZ1bmN0aW9ucyB3aGljaCB3cml0ZSB0byBvcmlnaW5hbCB3cml0ZXMgd2l0aCBzdGRvdXQvc3RkZXJyIGNvbnRleHRzIGJvdW5kXG4gICAgICAgIHRoaXMud3JpdGVTdGRvdXQgPSAoZGF0YTogc3RyaW5nKSA9PiB0aGlzLnN0ZG91dC5jYWxsKHByb2Nlc3Muc3Rkb3V0LCBkYXRhKTtcbiAgICAgICAgdGhpcy53cml0ZVN0ZGVyciA9IChkYXRhOiBzdHJpbmcpID0+IHRoaXMuc3RkZXJyLmNhbGwocHJvY2Vzcy5zdGRlcnIsIGRhdGEpO1xuXG4gICAgICAgIC8vIEFzc2lnbiBsaXN0ZW5lcnMgdG8gUGFzc1Rocm91Z2hzXG4gICAgICAgIHRoaXMuc3Rkb3V0UHQub24oJ2RhdGEnLCAoZGF0YSkgPT4ge1xuICAgICAgICAgICAgaWYgKGRhdGEgaW5zdGFuY2VvZiBCdWZmZXIpIHtcbiAgICAgICAgICAgICAgICBkYXRhID0gZGF0YS50b1N0cmluZygndXRmOCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3Rkb3V0Q2IoZGF0YSk7XG4gICAgICAgICAgICB0aGlzLndyaXRlU3Rkb3V0KGRhdGEpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnN0ZGVyclB0Lm9uKCdkYXRhJywgKGRhdGEpID0+IHtcbiAgICAgICAgICAgIGlmIChkYXRhIGluc3RhbmNlb2YgQnVmZmVyKSB7XG4gICAgICAgICAgICAgICAgZGF0YSA9IGRhdGEudG9TdHJpbmcoJ3V0ZjgnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN0ZGVyckNiKGRhdGEpO1xuICAgICAgICAgICAgdGhpcy53cml0ZVN0ZGVycihkYXRhKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gUmVwbGFjZSBvcmlnaW5hbCB3cml0ZSBjYWxscyB3aXRoIGNvbnRleHRzIGJvdW5kIHRvIHBhcmVudCBvYmplY3RcbiAgICAgICAgcHJvY2Vzcy5zdGRvdXQud3JpdGUgPSB0aGlzLnN0ZG91dFB0LndyaXRlLmJpbmQodGhpcy5zdGRvdXRQdCkgYXMgYW55O1xuICAgICAgICBwcm9jZXNzLnN0ZGVyci53cml0ZSA9IHRoaXMuc3RkZXJyUHQud3JpdGUuYmluZCh0aGlzLnN0ZGVyclB0KSBhcyBhbnk7XG5cbiAgICAgICAgLy8gQWRkIHVuY2F1Z2h0IGVycm9yIGhhbmRsZXIgdG8gaGFuZGxlIGxvZ2dpbmcgb2YgZmFpbHVyZSBjYXNlXG4gICAgICAgIHByb2Nlc3Mub24oJ3VuY2F1Z2h0RXhjZXB0aW9uJywgKGVycikgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZWFmZml4IHRoZSByZXBsYWNlZCBzdGRvdXQgYW5kIHN0ZGVyciB0aGVuXG4gICAgICogY2xvc2VzIGFsbCBzdHJlYW1zIG93bmVkIGJ5IHRoaXMgaW5zdGFuY2UuXG4gICAgICovXG4gICAgcHVibGljIGRlc3Ryb3koKSB7XG4gICAgICAgIHByb2Nlc3Muc3Rkb3V0LndyaXRlID0gdGhpcy5zdGRvdXQ7XG4gICAgICAgIHByb2Nlc3Muc3RkZXJyLndyaXRlID0gdGhpcy5zdGRlcnI7XG5cbiAgICAgICAgdGhpcy5zdGRvdXRQdC5kZXN0cm95KClcbiAgICAgICAgdGhpcy5zdGRlcnJQdC5kZXN0cm95KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQnlwYXNzIHRoZSBjb25maWd1cmVkIGNhbGxiYWNrIGZ1bmN0aW9uIGZvciBzdGRvdXQgYnlcbiAgICAgKiB3cml0aW5nIGRpcmVjdGx5IHRvIHRoZSBkZXRhY2hlZCBvdXRwdXQgc3RyZWFtXG4gICAgICogQHBhcmFtIGRhdGEgXG4gICAgICovXG4gICAgcHVibGljIHN0ZG91dEJ5cGFzcyhkYXRhOiBzdHJpbmcgfCBvYmplY3QpIHtcbiAgICAgICAgaWYgKGRhdGEgaW5zdGFuY2VvZiBPYmplY3QpIHtcbiAgICAgICAgICAgIGRhdGEgPSBKU09OLnN0cmluZ2lmeShkYXRhKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLndyaXRlU3Rkb3V0KChkYXRhIGFzIHVua25vd24gYXMgc3RyaW5nKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQnlwYXNzIHRoZSBjb25maWd1cmVkIGNhbGxiYWNrIGZ1bmN0aW9uIGZvciBzdGRlcnIgYnlcbiAgICAgKiB3cml0aW5nIGRpcmVjdGx5IHRvIHRoZSBkZXRhY2hlZCBvdXRwdXQgc3RyZWFtXG4gICAgICogQHBhcmFtIGRhdGEgXG4gICAgICovXG4gICAgcHVibGljIHN0ZGVyckJ5cGFzcyhkYXRhOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy53cml0ZVN0ZGVycihkYXRhKTtcbiAgICB9XG59XG5cblxuLyoqXG4gKiBMYXp5IGxvYWQgbG9nZ2VyLCB3cml0ZSBidWZmZXJlZCBtZXNzYWdlcyBvbmNlIGxvYWRlZFxuICogTm90ZTogTGF6eSBsb2FkaW5nIGlzIG5lY2Vzc2FyeSB0byByZXNvbHZlIGNpcmN1bGFyIGRlcGVuZGVuY2llcyBiZXR3ZWVuIHRoaXNcbiAqIG1vZHVsZSBhbmQgdGhlIGxvZ2dlci5cbiAqL1xuKGFzeW5jICgpID0+IHtcbiAgICBjb25zdCB7IHdpdGhMb2dnZXIgfSA9IGF3YWl0IGltcG9ydCgnLi9sb2dnZXInKTtcbiAgICBjb25zdCBsZXZlbDogTlBNTG9nZ2luZ0xldmVscyA9IHByb2Nlc3MuZW52LkxPR19ERUxJVkVSWV9BR0VOVF9MRVZFTCBhcyBOUE1Mb2dnaW5nTGV2ZWxzIHx8ICd3YXJuJztcbiAgICBsb2cgPSB3aXRoTG9nZ2VyKCdOZXdSZWxpY0xvZ0ZvcndhcmRlcicsIGxldmVsKTtcbiAgICB3aGlsZShpbnRlcm5hbExvZ0J1ZmZlci5sZW5ndGgpIHtcbiAgICAgICAgY29uc3QgW2xldmVsLCBtZXNzYWdlXSA9IGludGVybmFsTG9nQnVmZmVyLnNoaWZ0KCkgYXMgW3N0cmluZywgc3RyaW5nXTtcbiAgICAgICAgKGxvZyBhcyBhbnkpW2xldmVsXShtZXNzYWdlKTtcbiAgICB9XG59KSgpO1xuIl19