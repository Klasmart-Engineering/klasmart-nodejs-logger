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

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

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

    _defineProperty(this, "appLabel", void 0);

    _defineProperty(this, "regionLabel", 'undefined');

    _defineProperty(this, "environmentLabel", 'undefined');

    _defineProperty(this, "versionLabel", 'undefined');

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
    internalLog('debug', 'LogDeliveryAgent Initialized'); // Parse environment for labels - Use SERVICE_LABEL if available in env

    this.appLabel = process.env.SERVICE_LABEL || process.env.NEW_RELIC_APP_NAME;
    var labels = process.env.NEW_RELIC_LABELS;

    if (labels) {
      var parts = labels.split(';');
      var labelMap = new Map();
      parts.forEach(function (part) {
        var _part$split = part.split(':'),
            _part$split2 = _slicedToArray(_part$split, 2),
            label = _part$split2[0],
            value = _part$split2[1];

        labelMap.set(label, value);
      });

      if (labelMap.has('Region')) {
        this.regionLabel = labelMap.get('Region');
      }

      if (labelMap.has('Environment')) {
        this.environmentLabel = labelMap.get('Environment');
      }

      if (labelMap.has('Version')) {
        this.versionLabel = labelMap.get('Version');
      }
    }
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

      for (var _i2 = 0, _Object$keys = Object.keys(log); _i2 < _Object$keys.length; _i2++) {
        var _key = _Object$keys[_i2];
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9Mb2dEZWxpdmVyeUFnZW50LnRzIl0sIm5hbWVzIjpbIkFQSV9IT1NUTkFNRSIsInByb2Nlc3MiLCJlbnYiLCJLTF9OUl9MT0dfSE9TVE5BTUUiLCJBUElfUEFUSCIsIktMX05SX0xPR19QQVRIIiwiTUFYX1BBWUxPQURfU0laRSIsIk1BWF9BVFRSSUJVVEVTX1BFUl9FVkVOVCIsIk1BWF9BVFRSSUJVVEVfTkFNRV9MRU5HVEgiLCJNQVhfQVRUUklCVVRFX1ZBTFVFX0xFTkdUSCIsImxvZyIsImludGVybmFsTG9nQnVmZmVyIiwiaW50ZXJuYWxMb2ciLCJsZXZlbCIsIm1lc3NhZ2UiLCJwdXNoIiwiZGVmYXVsdENvbmZpZyIsImJ5dGVzV3JpdHRlblRocmVzaG9sZCIsIndhcm5PbkF0dHJpYnV0ZUxlbmd0aE92ZXJmbG93IiwibWluQnl0ZXNXcml0dGVuIiwibWluTG9nSXRlbXMiLCJsb2dQdXNoRnJlcXVlbmN5IiwibWluTG9nSXRlbXNUb0ZvcmNlIiwiTmV3UmVsaWNMb2dEZWxpdmVyeUFnZW50IiwiREVCVUdfV1JJVEVfTE9HU19UT19GSUxFIiwiY29uZmlnIiwibmV3UmVsaWNMb2dUcmFuc3BvcnQiLCJOZXdSZWxpY0xvZ1RyYW5zcG9ydCIsImNiIiwiYWRkTG9nIiwibG9nQ2FsbGJhY2siLCJlcnJDYWxsYmFjayIsImxhYmVsIiwic3RhbmRhcmRPdXRQYXNzVGhyb3VnaCIsIlN0YW5kYXJkT3V0UGFzc1Rocm91Z2giLCJyZWdpc3RlckFwcERlYXRoTG9nUHVzaCIsImNyZWF0ZUxvZ0NoZWNrVGltZW91dCIsInJlZ2lzdGVyTmV3UmVsaWNJbml0aWFsaXphdGlvbkludGVydmFsIiwiYXBwTGFiZWwiLCJTRVJWSUNFX0xBQkVMIiwiTkVXX1JFTElDX0FQUF9OQU1FIiwibGFiZWxzIiwiTkVXX1JFTElDX0xBQkVMUyIsInBhcnRzIiwic3BsaXQiLCJsYWJlbE1hcCIsIk1hcCIsImZvckVhY2giLCJwYXJ0IiwidmFsdWUiLCJzZXQiLCJoYXMiLCJyZWdpb25MYWJlbCIsImdldCIsImVudmlyb25tZW50TGFiZWwiLCJ2ZXJzaW9uTGFiZWwiLCJ0aW1lb3V0SWQiLCJjbGVhclRpbWVvdXQiLCJkZXN0cm95IiwiY2xvc2UiLCJ3cml0ZUxvZ3NTeW5jIiwic3RyIiwiSlNPTiIsInN0cmluZ2lmeSIsIm9iaiIsInBhcnNlIiwibXNnIiwibmFtZSIsImVyciIsImNhbGxiYWNrIiwianNvbkRhdGEiLCJpc05SQ29tcGF0aWJsZUpzb25Mb2dTdHJpbmciLCJwcm9jZXNzQXNKc29uTG9nIiwicHJvY2Vzc0FzU3RyaW5nTG9nIiwiaW1tZWRpYXRlTG9nV3JpdGFibGVQcmVkaWNhdGUiLCJiZWdpbldyaXRlTG9ncyIsInN0ZGVyckJ5cGFzcyIsInN0ZG91dEJ5cGFzcyIsImxvZ1RyYW5zZm9ybSIsImxvZ1N0cmluZyIsImxlbmd0aCIsIkJ1ZmZlciIsImJ5dGVMZW5ndGgiLCJsb2dRdWV1ZSIsImxvZ0xlbmd0aFF1ZXVlIiwidG90YWxMZW5ndGhDb3VudCIsImVuZHNXaXRoIiwic3Vic3RyaW5nIiwibmV3UmVsaWNNZXRhZGF0YSIsIm5ld3JlbGljIiwiZ2V0TGlua2luZ01ldGFkYXRhIiwic3RydWN0dXJlZExvZyIsInRpbWVzdGFtcCIsIkRhdGUiLCJub3ciLCJvcmlnaW5hbF90aW1lc3RhbXAiLCJ0b0lTT1N0cmluZyIsImhvc3RuYW1lIiwianNvbkxvZ1N0cmluZyIsImF0dHJpYnV0ZXMiLCJnbG9iYWxBdHRyaWJ1dGVzIiwibG9nc1RvV3JpdGUiLCJzbGljZUxvZ3MiLCJyYXdQYXlsb2FkIiwiYnVpbGRSYXdQb3N0Qm9keSIsImNvbXByZXNzZWRQYXlsb2FkIiwiemxpYiIsImd6aXBTeW5jIiwiZGVidWdNb2RlIiwic2VuZExvZ3MiLCJ3cml0ZUxvZ3NUb0ZpbGVTeXN0ZW0iLCJidWZmZXIiLCJmcyIsIndyaXRlRmlsZVN5bmMiLCJsb2dzV3JpdHRlbiIsImNvbXByZXNzUGF5bG9hZCIsImZhbGxiYWNrTWVzc2FnZSIsIkVycm9yIiwic3RhY2siLCJBeGlvcyIsInBvc3QiLCJoZWFkZXJzIiwiTkVXX1JFTElDX0xJQ0VOU0VfS0VZIiwidGhlbiIsInJlc3BvbnNlIiwiaW5jbHVkZXMiLCJzdGF0dXMiLCJkYXRhIiwicmVxdWVzdElkIiwibG9ncyIsInBheWxvYWQiLCJjb21tb24iLCJzZXJ2aWNlIiwidmVyc2lvbiIsInJlZ2lvbiIsImVudmlyb25tZW50IiwiZW50aXR5R3VpZCIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwiZ3ppcCIsImZyb20iLCJsb2dzVG9TZW5kIiwibG9nU2l6ZSIsImxvZ1NsaWNlSW5kZXgiLCJzbGljZSIsIm5ld1JlbGljSW5pdGlhbGl6ZWQiLCJtaW5Mb2dJdGVtc0V4Y2VlZGVkIiwiT2JqZWN0IiwiZ2V0T3duUHJvcGVydHlOYW1lcyIsImtleXMiLCJrZXkiLCJuZXdLZXkiLCJkZWZpbmVQcm9wZXJ0eSIsImdldE93blByb3BlcnR5RGVzY3JpcHRvciIsInJlcGxhY2VBbGwiLCJzZXRUaW1lb3V0IiwiZmluYWxXcml0dGVuIiwib24iLCJvIiwiZXhpdCIsImUiLCJjb25zb2xlIiwibmV3UmVsaWNJbml0aWFsaXphdGlvbkNoZWNrVGltZW91dCIsInNldEludGVydmFsIiwibWV0YWRhdGEiLCJjbGVhckludGVydmFsIiwiaW5zdGFuY2UiLCJzdGRvdXRDYiIsInN0ZGVyckNiIiwiUGFzc1Rocm91Z2giLCJzdGRvdXQiLCJ3cml0ZSIsInN0ZGVyciIsIndyaXRlU3Rkb3V0IiwiY2FsbCIsIndyaXRlU3RkZXJyIiwic3Rkb3V0UHQiLCJ0b1N0cmluZyIsInN0ZGVyclB0IiwiYmluZCIsImVycm9yIiwid2l0aExvZ2dlciIsIkxPR19ERUxJVkVSWV9BR0VOVF9MRVZFTCIsInNoaWZ0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBR0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUEsSUFBTUEsWUFBWSxHQUFHQyxPQUFPLENBQUNDLEdBQVIs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cmVsaWMnO1xuaW1wb3J0IHpsaWIgZnJvbSAnemxpYic7XG5pbXBvcnQgeyBOZXdSZWxpY0xvZ1RyYW5zcG9ydCB9IGZyb20gJy4vTmV3UmVsaWNMb2dUcmFuc3BvcnQnO1xuaW1wb3J0IHsgUGFzc1Rocm91Z2ggfSBmcm9tICdzdHJlYW0nO1xuaW1wb3J0IHsgTG9nZ2VyIH0gZnJvbSAnd2luc3Rvbic7XG5pbXBvcnQgeyBOUE1Mb2dnaW5nTGV2ZWxzIH0gZnJvbSAnLi9sb2dnZXInO1xuaW1wb3J0IEF4aW9zIGZyb20gJ2F4aW9zJztcblxuY29uc3QgQVBJX0hPU1ROQU1FID0gcHJvY2Vzcy5lbnYuS0xfTlJfTE9HX0hPU1ROQU1FIHx8ICdsb2ctYXBpLmV1Lm5ld3JlbGljLmNvbSc7XG5jb25zdCBBUElfUEFUSCA9IHByb2Nlc3MuZW52LktMX05SX0xPR19QQVRIIHx8ICcvbG9nL3YxJztcbmNvbnN0IE1BWF9QQVlMT0FEX1NJWkUgPSAxMCoqNjtcbmNvbnN0IE1BWF9BVFRSSUJVVEVTX1BFUl9FVkVOVCA9IDI1NTtcbmNvbnN0IE1BWF9BVFRSSUJVVEVfTkFNRV9MRU5HVEggPSAyNTU7XG5jb25zdCBNQVhfQVRUUklCVVRFX1ZBTFVFX0xFTkdUSCA9IDQwOTY7XG5cbmxldCBsb2c6IExvZ2dlciB8IHVuZGVmaW5lZDtcbmxldCBpbnRlcm5hbExvZ0J1ZmZlcjogQXJyYXk8W3N0cmluZywgc3RyaW5nXT4gPSBbXTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byB3cml0ZSBsb2dzIHRoYXQgYXJlIGludGVybmFsIHRvIHRoaXMgbW9kdWxlLlxuICogQnVmZmVycyBjYWxscyB1bnRpbCB0aGUgV2luc3RvbiBsb2dnZXIgY2FuIGJlIGFzeW5jIGltcG9ydGRcbiAqIEFmdGVyd29yZHMsIHdyaXRlcyBsb2dzIGRpcmVjdGx5IHRvIHRoZSBsb2dnZXJcbiAqIEBwYXJhbSBsZXZlbCBcbiAqIEBwYXJhbSBtZXNzYWdlIFxuICovXG5mdW5jdGlvbiBpbnRlcm5hbExvZyhsZXZlbDogc3RyaW5nLCBtZXNzYWdlOiBzdHJpbmcpIHtcbiAgICBpZiAobG9nKSB7XG4gICAgICAgIChsb2cgYXMgYW55KVtsZXZlbF0obWVzc2FnZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgaW50ZXJuYWxMb2dCdWZmZXIucHVzaChbbGV2ZWwsIG1lc3NhZ2VdKTtcbiAgICB9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTmV3UmVsaWNMb2dEZWxpdmVyeUFnZW50Q29uZmlnIHtcbiAgICAvKipcbiAgICAgKiBIb3cgZnJlcXVlbnRseSBjaGVja3Mgc2hvdWxkIGJlIHJ1biB0byBwdXNoIGxvZ3MgdG8gTlJcbiAgICAgKiBEZWZhdWx0IGlzIDEwIHNlY29uZHNcbiAgICAgKi9cbiAgICAgbG9nUHVzaEZyZXF1ZW5jeT86IG51bWJlcjtcblxuICAgICAvKipcbiAgICAgICogTWluaW11bSBudW1iZXIgb2YgbG9nIHN0YXRlbWVudHMgd3JpdHRlbiBiZWZvcmUgbG9ncyBjYW4gYmUgcHVzaGVkIHRvIE5SXG4gICAgICAqIGJ5IHBlcmlvZGljIGxvZ2dlci5cbiAgICAgICogRGVmYXVsdCBpcyAyXG4gICAgICAqL1xuICAgICBtaW5Mb2dJdGVtcz86IG51bWJlcjtcbiBcbiBcbiAgICAgLyoqXG4gICAgICAqIE1pbmltdW0gbnVtYmVyIG9mIGxvZyBzdGF0ZW1lbnRzIHRvIGZvcmNlIGFuIGltbWVkaWF0ZSBwdXNoIHRvIE5SLiBVc2VkXG4gICAgICAqIHRvIGVuc3VyZSB0aGF0IHRoZSBsb2dnaW5nIHN5c3RlbSBkb2VzIG5vdCBnZXQgYmFja2VkIHVwIGlmIGFtb3VudCBiZWluZ1xuICAgICAgKiBsb2dnZWQgc3VycGFzc2VzIHRoZSBiYW5kd2lkdGggb2YgdGhlIHBlcmlvZGljIGxvZ2dlci5cbiAgICAgICogRGVmYXVsdCBpcyAxMDAuXG4gICAgICAqL1xuICAgICBtaW5Mb2dJdGVtc1RvRm9yY2U/OiBudW1iZXI7XG5cbiBcbiAgICAgLyoqXG4gICAgICAqIE1pbmltdW0gbnVtYmVyIG9mIGJ5dGVzIHdyaXR0ZW4gdG8gY29tcHJlc3Npb24gc3RyZWFtIGJlZm9yZSBwdXNoaW5nIHRvIE5SXG4gICAgICAqL1xuICAgICBtaW5CeXRlc1dyaXR0ZW4/OiBudW1iZXI7XG4gXG4gICAgIC8qKlxuICAgICAgKiBUaHJlc2hvbGQgZm9yIGJ5dGVzIHdyaXR0ZW4gYXQgd2hpY2ggcG9pbnQgYSBuZXcgd3JpdGUgdG8gTlIgd2lsbCBiZSBhdXRvbWF0aWNhbGx5XG4gICAgICAqIHRyaWdnZXJlZC4gRGVmYXVsdHMgdG8gKDQvNSAqIE1BWF9QQVlMT0FEX1NJWkUpXG4gICAgICAqL1xuICAgICBieXRlc1dyaXR0ZW5UaHJlc2hvbGQ/OiBudW1iZXI7XG4gXG4gICAgIC8qKlxuICAgICAgKiBQcm9kdWNlIGEgd2FybmluZyB3aGVuIGF0dHJpYnV0ZSB2YWx1ZXMgb3ZlcmZsb3cgdGhlIE5SIG1heGltdW0gbGVuZ3RoIG9mIDQwOTYuXG4gICAgICAqIERlZmF1bHQgaXMgZmFsc2UuXG4gICAgICAqL1xuICAgICB3YXJuT25BdHRyaWJ1dGVMZW5ndGhPdmVyZmxvdz86IGJvb2xlYW47XG59XG5cbmNvbnN0IGRlZmF1bHRDb25maWc6IE5ld1JlbGljTG9nRGVsaXZlcnlBZ2VudENvbmZpZyA9IHtcbiAgICBieXRlc1dyaXR0ZW5UaHJlc2hvbGQ6IE1BWF9QQVlMT0FEX1NJWkUgKiA0IC8gNSxcbiAgICB3YXJuT25BdHRyaWJ1dGVMZW5ndGhPdmVyZmxvdzogZmFsc2UsXG4gICAgbWluQnl0ZXNXcml0dGVuOiBNQVhfUEFZTE9BRF9TSVpFICogMSAvIDUsXG4gICAgbWluTG9nSXRlbXM6IDIsXG4gICAgbG9nUHVzaEZyZXF1ZW5jeTogNjAwMDAsXG4gICAgbWluTG9nSXRlbXNUb0ZvcmNlOiAxMDAsXG59XG5cbmV4cG9ydCBjbGFzcyBOZXdSZWxpY0xvZ0RlbGl2ZXJ5QWdlbnQge1xuIFxuICAgIHByaXZhdGUgYXBwTGFiZWw6IHN0cmluZztcbiAgICBwcml2YXRlIHJlZ2lvbkxhYmVsOiBzdHJpbmcgPSAndW5kZWZpbmVkJztcbiAgICBwcml2YXRlIGVudmlyb25tZW50TGFiZWw6IHN0cmluZyA9ICd1bmRlZmluZWQnO1xuICAgIHByaXZhdGUgdmVyc2lvbkxhYmVsOiBzdHJpbmcgPSAndW5kZWZpbmVkJztcblxuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemVzIGEgTmV3UmVsaWNMb2dEZWxpdmVyeUFnZW50IGluc3RhbmNlIGlmIHRoZSBMT0dfU1RZTEUgZW52aXJvbm1lbnRcbiAgICAgKiB2YXJpYWJsZSBpcyBzZXQgdG8gTkVXX1JFTElDLiBPdGhlcndpc2UgaXQgZG9lcyBub3RoaW5nLlxuICAgICAqIEBwYXJhbSBjb25maWcgXG4gICAgICogQHJldHVybnMgXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBpbml0aWFsaXplKCkge1xuICAgICAgICBpZiAoIXByb2Nlc3MuZW52Lk5FV19SRUxJQ19MSUNFTlNFX0tFWSkgcmV0dXJuO1xuICAgICAgICBOZXdSZWxpY0xvZ0RlbGl2ZXJ5QWdlbnQuaW5zdGFuY2UgPSBuZXcgTmV3UmVsaWNMb2dEZWxpdmVyeUFnZW50KCk7XG4gICAgICAgIHJldHVybiBOZXdSZWxpY0xvZ0RlbGl2ZXJ5QWdlbnQuaW5zdGFuY2U7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyBnZXRJbnN0YW5jZSgpIHtcbiAgICAgICAgcmV0dXJuIE5ld1JlbGljTG9nRGVsaXZlcnlBZ2VudD8uaW5zdGFuY2U7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyBjb25maWd1cmUoY29uZmlnOiBOZXdSZWxpY0xvZ0RlbGl2ZXJ5QWdlbnRDb25maWcpIHtcbiAgICAgICAgY29uc3QgaW5zdGFuY2UgPSBOZXdSZWxpY0xvZ0RlbGl2ZXJ5QWdlbnQuaW5zdGFuY2U7XG4gICAgICAgIGlmICghaW5zdGFuY2UpIHtcbiAgICAgICAgICAgIGludGVybmFsTG9nKCd3YXJuJywgJ0NvbmZpZ3VyZSBjYWxsZWQgYmVmb3JlIGluc3RhbmNlIGluaXRpYWxpemF0aW9uLiBDb25maWd1cmF0aW9uIG5vdCBhcHBsaWVkJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaW5zdGFuY2UuY29uZmlnID0ge1xuICAgICAgICAgICAgLi4uaW5zdGFuY2UuY29uZmlnLFxuICAgICAgICAgICAgLi4uY29uZmlnXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIGdldFdpbnN0b25UcmFuc3BvcnQoKSB7XG4gICAgICAgIHJldHVybiBOZXdSZWxpY0xvZ0RlbGl2ZXJ5QWdlbnQ/Lmluc3RhbmNlPy5sb2dUcmFuc2Zvcm07XG4gICAgfVxuICAgIFxuICAgIHByaXZhdGUgc3RhdGljIGluc3RhbmNlOiBOZXdSZWxpY0xvZ0RlbGl2ZXJ5QWdlbnQ7XG4gICAgcHJpdmF0ZSBsb2dRdWV1ZTogYW55W10gPSBbXTtcbiAgICBwcml2YXRlIGNvbmZpZzogTmV3UmVsaWNMb2dEZWxpdmVyeUFnZW50Q29uZmlnO1xuICAgIHByaXZhdGUgbG9nTGVuZ3RoUXVldWU6IG51bWJlcltdID0gW107XG4gICAgcHJpdmF0ZSB0b3RhbExlbmd0aENvdW50ID0gMDtcbiAgICBwcml2YXRlIGdsb2JhbEF0dHJpYnV0ZXM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9ID0ge307XG4gICAgcHJpdmF0ZSBuZXdSZWxpY0xvZ1RyYW5zcG9ydDogTmV3UmVsaWNMb2dUcmFuc3BvcnQ7XG4gICAgcHJpdmF0ZSBkZWJ1Z01vZGUgPSBwcm9jZXNzLmVudi5ERUJVR19XUklURV9MT0dTX1RPX0ZJTEUgPT09ICd0cnVlJztcbiAgICBwcml2YXRlIHRpbWVvdXRJZDogTm9kZUpTLlRpbWVvdXQgfCB1bmRlZmluZWQ7XG4gICAgcHJpdmF0ZSBsb2dzV3JpdHRlbiA9IDA7XG4gICAgcHJpdmF0ZSBuZXdSZWxpY0luaXRpYWxpemVkID0gZmFsc2U7XG4gICAgXG4gICAgcHVibGljIHN0YW5kYXJkT3V0UGFzc1Rocm91Z2g6IFN0YW5kYXJkT3V0UGFzc1Rocm91Z2g7XG4gICAgXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgaW50ZXJuYWxMb2coJ2RlYnVnJywgJ0luaXRpYWxpemluZyBMb2dEZWxpdmVyeUFnZW50Jyk7XG4gICAgICAgIHRoaXMuY29uZmlnID0geyAuLi5kZWZhdWx0Q29uZmlnIH07XG5cbiAgICAgICAgaW50ZXJuYWxMb2coJ2luZm8nLCBgQ3JlYXRpbmcgTmV3UmVsaWNMb2dUcmFuc3BvcnRgKTtcbiAgICAgICAgdGhpcy5uZXdSZWxpY0xvZ1RyYW5zcG9ydCA9IG5ldyBOZXdSZWxpY0xvZ1RyYW5zcG9ydCgobG9nLCBjYikgPT4gdGhpcy5hZGRMb2cobG9nLCBjYikpO1xuXG4gICAgICAgIC8vIENyZWF0ZXMgbG9nZ2luZyBjb25maWd1cmF0aW9uIGZvciByZXdyaXRpbmcgc3Rkb3V0L3N0ZGVyclxuICAgICAgICBjb25zdCBsb2dDYWxsYmFjayA9IChsb2c6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgdGhpcy5hZGRMb2cobG9nLCAoKSA9PiB7fSk7XG4gICAgICAgIH07XG4gICAgXG4gICAgICAgIGNvbnN0IGVyckNhbGxiYWNrID0gKGxvZzogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmFkZExvZyh7XG4gICAgICAgICAgICAgICAgbGFiZWw6ICdlcnJvcicsXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogbG9nXG4gICAgICAgICAgICB9LCAoKSA9PiB7fSk7XG4gICAgICAgIH07XG4gICAgXG4gICAgICAgIHRoaXMuc3RhbmRhcmRPdXRQYXNzVGhyb3VnaCA9IG5ldyBTdGFuZGFyZE91dFBhc3NUaHJvdWdoKGxvZ0NhbGxiYWNrLCBlcnJDYWxsYmFjayk7XG4gICAgICAgIHRoaXMucmVnaXN0ZXJBcHBEZWF0aExvZ1B1c2goKTtcbiAgICAgICAgdGhpcy5jcmVhdGVMb2dDaGVja1RpbWVvdXQoKTtcbiAgICAgICAgdGhpcy5yZWdpc3Rlck5ld1JlbGljSW5pdGlhbGl6YXRpb25JbnRlcnZhbCgpOyAgICAgIFxuICAgICAgICBpbnRlcm5hbExvZygnZGVidWcnLCAnTG9nRGVsaXZlcnlBZ2VudCBJbml0aWFsaXplZCcpXG5cbiAgICAgICAgLy8gUGFyc2UgZW52aXJvbm1lbnQgZm9yIGxhYmVscyAtIFVzZSBTRVJWSUNFX0xBQkVMIGlmIGF2YWlsYWJsZSBpbiBlbnZcbiAgICAgICAgdGhpcy5hcHBMYWJlbCA9IHByb2Nlc3MuZW52LlNFUlZJQ0VfTEFCRUwgfHwgcHJvY2Vzcy5lbnYuTkVXX1JFTElDX0FQUF9OQU1FIGFzIHN0cmluZztcbiAgICAgICAgY29uc3QgbGFiZWxzID0gcHJvY2Vzcy5lbnYuTkVXX1JFTElDX0xBQkVMUztcbiAgICAgICAgaWYgKGxhYmVscykge1xuICAgICAgICAgICAgY29uc3QgcGFydHMgPSBsYWJlbHMuc3BsaXQoJzsnKTtcbiAgICAgICAgICAgIGNvbnN0IGxhYmVsTWFwID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZz4oKTtcbiAgICAgICAgICAgIHBhcnRzLmZvckVhY2gocGFydCA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgW2xhYmVsLCB2YWx1ZV0gPSBwYXJ0LnNwbGl0KCc6Jyk7XG4gICAgICAgICAgICAgICAgbGFiZWxNYXAuc2V0KGxhYmVsLCB2YWx1ZSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgaWYgKGxhYmVsTWFwLmhhcygnUmVnaW9uJykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlZ2lvbkxhYmVsID0gbGFiZWxNYXAuZ2V0KCdSZWdpb24nKSBhcyBzdHJpbmc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChsYWJlbE1hcC5oYXMoJ0Vudmlyb25tZW50JykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmVudmlyb25tZW50TGFiZWwgPSBsYWJlbE1hcC5nZXQoJ0Vudmlyb25tZW50JykgYXMgc3RyaW5nO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAobGFiZWxNYXAuaGFzKCdWZXJzaW9uJykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnZlcnNpb25MYWJlbCA9IGxhYmVsTWFwLmdldCgnVmVyc2lvbicpIGFzIHN0cmluZztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFjY2Vzc29yIGZvciBXaW5zdG9uIFRyYW5zcG9ydCB0aGF0IHdyaXRlcyB0byB0aGlzIFxuICAgICAqIGFnZW50IGluc3RhbmNlXG4gICAgICogQHJldHVybnMgd2luc3Rvbi50cmFuc3BvcnRcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0TG9nVHJhbnNwb3J0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5uZXdSZWxpY0xvZ1RyYW5zcG9ydDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTaHV0c2Rvd24gdGhlIGRlbGl2ZXJ5IGFnZW50LiBUaGlzIGNhbiBiZSB1dGlsaXplZCB3aGVuIGFwcCBpcyBleHBlY3RlZCB0byBzaHV0ZG93blxuICAgICAqIGF0IGEgZ2l2ZW4gdGltZSBhbmQgdGhlIHBlcmlvZGljIGRlbGl2ZXJ5IHRpbWVvdXQgaXMgYmxvY2tpbmcgc2h1dGRvd24uXG4gICAgICogXG4gICAgICogQ2xlYXJzIGludGVybmFsIHRpbWVvdXQsIGNvbmZpZ3VyZXMgd2luc3RvbiB0cmFuc3BvcnQgdG8gbm90IHNlbmQgbG9ncy5cbiAgICAgKiBSZWNvbm5lY3RzIHN0ZG91dCBhbmQgc3RkZXJyLlxuICAgICAqIFdyaXRlcyBhbnkgcmVtYWluaW5nIGxvZ3MuXG4gICAgICovXG4gICAgcHVibGljIHNodXRkb3duKCkge1xuICAgICAgICBpbnRlcm5hbExvZygnZGVidWcnLCAnU2h1dGRvd24gb2YgTG9nRGVsaXZlcnlBZ2VudCB0cmlnZ2VyZWQnKTtcbiAgICAgICAgaWYgKHRoaXMudGltZW91dElkKSBjbGVhclRpbWVvdXQodGhpcy50aW1lb3V0SWQpO1xuICAgICAgICB0aGlzLnN0YW5kYXJkT3V0UGFzc1Rocm91Z2guZGVzdHJveSgpO1xuICAgICAgICB0aGlzLm5ld1JlbGljTG9nVHJhbnNwb3J0LmNsb3NlKCk7XG4gICAgICAgIHRoaXMud3JpdGVMb2dzU3luYygpO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogRGV0ZXJtaW5lIGlmIHRoZSBsb2cgc3RyaW5nIG9yIG9iamVjdCBpcyBhIE5ldyBSZWxpYyBcbiAgICAgKiBjb21wYXRpYmxlIEpTT04uIEluIG9yZGVyIHRvIGJlIGNvbnNpZGVyZWQgdGhpcyBpdCBtdXN0XG4gICAgICogYmUgYSB3ZWxsIHN0cnVjdHVyZWQgSlNPTiBvYmplY3Qgd2l0aCBhIHRvcCBsZXZlbCAnbWVzc2FnZSdcbiAgICAgKiBhbmQgJ2xldmVsJyBwcm9wZXJ0eS5cbiAgICAgKiBAcGFyYW0gc3RyIFxuICAgICAqIEByZXR1cm5zIG9iamVjdCBmb3JtIG9mIEpTT04gb3IgZmFsc2VcbiAgICAgKi9cbiAgICBwcml2YXRlIGlzTlJDb21wYXRpYmxlSnNvbkxvZ1N0cmluZyhzdHI6IHN0cmluZyB8IG9iamVjdCkge1xuICAgICAgICBpZiAodHlwZW9mIHN0ciA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIHN0ciA9IEpTT04uc3RyaW5naWZ5KHN0cik7XG4gICAgICAgIH1cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IG9iaiA9IEpTT04ucGFyc2Uoc3RyIGFzIHN0cmluZyk7XG4gICAgICAgICAgICAvLyBSZXdyaXRlIGJvb3RzdHJhcCBvYmplY3QgaW50byBhIGZvcm1hdCB0aGF0IHdpbGwgd29yayBmb3IgbmV3IHJlbGljXG4gICAgICAgICAgICBpZiAob2JqLm1zZyAmJiBvYmo/Lm5hbWUoJ25ld3JlbGljX2Jvb3RzdHJhcCcpICYmICFvYmoubWVzc2FnZSkge1xuICAgICAgICAgICAgICAgIG9iai5tZXNzYWdlID0gb2JqLm1zZztcbiAgICAgICAgICAgICAgICBvYmoubGV2ZWwgPSAnaW5mbyc7XG4gICAgICAgICAgICAgICAgZGVsZXRlIG9iai5tc2c7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAob2JqICYmIHR5cGVvZiBvYmogPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgICAgICBpZiAob2JqLm1lc3NhZ2UgJiYgb2JqLmxldmVsKSB7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7IH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEludGVybmFsIGZ1bmN0aW9uIHVzZWQgdG8gYWNjZXB0IGxvZyBzdGF0ZW1lbnRzIGFuZFxuICAgICAqIHByb2Nlc3MgdGhlbS4gTG9nIGlzIHR5cGVkIHRvIGFueSB0byBmaXQgdHlwaW5nIGZvclxuICAgICAqIHRoZSBXaW5zdG9uIHRyYW5zcG9ydC5cbiAgICAgKiBcbiAgICAgKiBUT0RPOiBSZXdvcmsgdGhlIFdpbnN0b24gdHJhbnNwb3J0IGxvZ2ljIHRvIGRvIGEgYml0XG4gICAgICogICAgICBtb3JlIHdvcmsgdG8gcHJvdmlkZSBtb3JlIGNvbnNpc3RlbnQgdHlwaW5nLlxuICAgICAqIFxuICAgICAqIEBwYXJhbSBsb2cgXG4gICAgICogQHBhcmFtIGNhbGxiYWNrIFxuICAgICAqL1xuICAgIHByaXZhdGUgYWRkTG9nKGxvZzogYW55LCBjYWxsYmFjazogKCgpID0+IHZvaWQpIHwgdW5kZWZpbmVkKSB7XG4gICAgICAgIGNvbnN0IGpzb25EYXRhID0gdGhpcy5pc05SQ29tcGF0aWJsZUpzb25Mb2dTdHJpbmcobG9nKTtcbiAgICAgICAgaWYoanNvbkRhdGEpIHtcbiAgICAgICAgICAgIHRoaXMucHJvY2Vzc0FzSnNvbkxvZyhqc29uRGF0YSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnByb2Nlc3NBc1N0cmluZ0xvZyhsb2cpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuaW1tZWRpYXRlTG9nV3JpdGFibGVQcmVkaWNhdGUoKSkge1xuICAgICAgICAgICAgdGhpcy5iZWdpbldyaXRlTG9ncygpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGpzb25EYXRhKSBsb2cgPSBKU09OLnN0cmluZ2lmeShsb2cpKydcXG4nO1xuICAgIFxuICAgICAgICBpZiAoanNvbkRhdGE/Lm1lc3NhZ2UgJiYganNvbkRhdGE/LmxldmVsID09PSAnZXJyb3InKSB7XG4gICAgICAgICAgICB0aGlzLnN0YW5kYXJkT3V0UGFzc1Rocm91Z2guc3RkZXJyQnlwYXNzKGxvZyk7XG4gICAgICAgIH0gZWxzZSBpZihqc29uRGF0YS5tZXNzYWdlKSB7XG4gICAgICAgICAgICB0aGlzLnN0YW5kYXJkT3V0UGFzc1Rocm91Z2guc3Rkb3V0QnlwYXNzKGxvZyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY2FsbGJhY2spIGNhbGxiYWNrKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSGFuZGxlciBmb3IgcHJvY2Vzc2luZyBhIGxvZyBzdGF0ZW1lbnQgd2hlbiBpdCBpcyBmb3JtYXR0ZWRcbiAgICAgKiBhcyBhIE5ldyBSZWxpYyBjb21wYXRpYmxlIEpTT04gc3RyaW5nLlxuICAgICAqIEBwYXJhbSBsb2cgXG4gICAgICovXG4gICAgcHJvY2Vzc0FzSnNvbkxvZyhsb2c6IGFueSkge1xuICAgICAgICB0aGlzLmxvZ1RyYW5zZm9ybShsb2cpO1xuICAgICAgICBjb25zdCBsb2dTdHJpbmcgPSBKU09OLnN0cmluZ2lmeShsb2cpO1xuICAgICAgICBjb25zdCBsZW5ndGggPSBCdWZmZXIuYnl0ZUxlbmd0aChsb2dTdHJpbmcpO1xuICAgICAgICB0aGlzLmxvZ1F1ZXVlLnB1c2gobG9nKTtcbiAgICAgICAgdGhpcy5sb2dMZW5ndGhRdWV1ZS5wdXNoKGxlbmd0aCk7XG4gICAgICAgIHRoaXMudG90YWxMZW5ndGhDb3VudCArPSBsZW5ndGg7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSGFuZGxlciBmb3IgcHJvY2Vzc2luZyBhIGxvZyBzdGF0ZW1lbnQgdGhhdCBpcyBhIHNpbXBsZVxuICAgICAqIHN0cmluZyBmb3JtYXQuXG4gICAgICogQHBhcmFtIGxvZyBcbiAgICAgKi9cbiAgICBwcm9jZXNzQXNTdHJpbmdMb2cobG9nOiBzdHJpbmcpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBsb2cgPT09ICdzdHJpbmcnICYmIGxvZy5lbmRzV2l0aCgnXFxuJykpIHtcbiAgICAgICAgICAgIGxvZyA9IGxvZy5zdWJzdHJpbmcoMCwgbG9nLmxlbmd0aCAtIDEpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbmV3UmVsaWNNZXRhZGF0YSA9IG5ld3JlbGljLmdldExpbmtpbmdNZXRhZGF0YSgpO1xuICAgICAgICBjb25zdCBzdHJ1Y3R1cmVkTG9nID0ge1xuICAgICAgICAgICAgbWVzc2FnZTogbG9nLFxuICAgICAgICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxuICAgICAgICAgICAgb3JpZ2luYWxfdGltZXN0YW1wOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICAgICAgICBcImVudGl0eS5uYW1lXCI6IG5ld1JlbGljTWV0YWRhdGFbJ2VudGl0eS5uYW1lJ10sXG4gICAgICAgICAgICBcImVudGl0eS50eXBlXCI6IG5ld1JlbGljTWV0YWRhdGFbJ2VudGl0eS50eXBlJ10sXG4gICAgICAgICAgICBob3N0bmFtZTogbmV3UmVsaWNNZXRhZGF0YS5ob3N0bmFtZVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QganNvbkxvZ1N0cmluZyA9IEpTT04uc3RyaW5naWZ5KHN0cnVjdHVyZWRMb2cpO1xuICAgICAgICBjb25zdCBsZW5ndGggPSBCdWZmZXIuYnl0ZUxlbmd0aChqc29uTG9nU3RyaW5nKTtcbiAgICAgICAgdGhpcy5sb2dRdWV1ZS5wdXNoKHN0cnVjdHVyZWRMb2cpO1xuICAgICAgICB0aGlzLmxvZ0xlbmd0aFF1ZXVlLnB1c2gobGVuZ3RoKTtcbiAgICAgICAgdGhpcy50b3RhbExlbmd0aENvdW50ICs9IGxlbmd0aDtcbiAgICB9XG4gICAgXG4gICAgLyoqXG4gICAgICogU2V0IGdsb2JhbCBhdHRyaWJ1dGVzIGZvciB0aGUgYXBwbGljYXRpb24uICBUaGlzIHNob3VsZFxuICAgICAqIGdlbmVyYWxseSBiZSBjb25maWd1cmVkIGVhcmx5IGluIHRoZSBhcHBsaWNhdGlvbiBsaWZlY3ljbGUuXG4gICAgICogR2xvYmFsIGF0dHJpYnV0ZXMgd2lsbCBiZSBib3VuZCB0byBhbGwgbG9nIHN0YXRlbWVudHNcbiAgICAgKiBpbiBOZXcgUmVsaWMuXG4gICAgICogQHBhcmFtIGF0dHJpYnV0ZXMgS1YgcGFpcnMgdG8gYmUgcHJvdmlkZWQgdG8gTlIgd2l0aCBsb2dzXG4gICAgICovXG4gICAgc2V0R2xvYmFsQXR0cmlidXRlcyhhdHRyaWJ1dGVzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSkge1xuICAgICAgICB0aGlzLmdsb2JhbEF0dHJpYnV0ZXMgPSBhdHRyaWJ1dGVzO1xuICAgIH0gIFxuXG4gICAgLyoqXG4gICAgICogV3JpdGVzIGxvZ3Mgc3luY2hyb25vdXNseS4gIFRoaXMgZnVuY3Rpb24gaXMgaW50ZW5kZWQgdG8gYmVcbiAgICAgKiB1dGlsaXplZCBpbiBzaXR1YXRpb25zIHdoZXJlIGxvZ2dpbmcgY2Fubm90IGJlIHdyaXR0ZW4gXG4gICAgICogYXN5bmNocm9ub3VzbHksIG1vc3QgY29tbW9ubHkgaW4gdGhlIGhhbmRsZXIgb2YgYSBTSUdURVJNXG4gICAgICogZXZlbnQsIHdoaWNoIG9ubHkgYWxsb3dzIHN5bmNocm9ub3VzIGNhbGxzLlxuICAgICAqL1xuICAgIHByaXZhdGUgd3JpdGVMb2dzU3luYygpIHtcbiAgICAgICAgY29uc3QgbG9nc1RvV3JpdGUgPSB0aGlzLnNsaWNlTG9ncygpO1xuICAgICAgICBpbnRlcm5hbExvZygnc2lsbHknLCBgUHJlcGFyaW5nIGZpbmFsIGxvZyBwYXlsb2FkIG9mICR7bG9nc1RvV3JpdGUubGVuZ3RofSBmb3IgTlIgY29sbGVjdG9yYCk7XG4gICAgICAgIGNvbnN0IHJhd1BheWxvYWQgPSB0aGlzLmJ1aWxkUmF3UG9zdEJvZHkobG9nc1RvV3JpdGUpO1xuICAgICAgICBjb25zdCBjb21wcmVzc2VkUGF5bG9hZCA9IHpsaWIuZ3ppcFN5bmMocmF3UGF5bG9hZCk7XG4gICAgICAgIGlmICghdGhpcy5kZWJ1Z01vZGUpIHtcbiAgICAgICAgICAgIHRoaXMuc2VuZExvZ3MoY29tcHJlc3NlZFBheWxvYWQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy53cml0ZUxvZ3NUb0ZpbGVTeXN0ZW0oY29tcHJlc3NlZFBheWxvYWQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIHdyaXRlTG9nc1RvRmlsZVN5c3RlbShidWZmZXI6IEJ1ZmZlcikge1xuICAgICAgICBmcy53cml0ZUZpbGVTeW5jKGB0ZXN0LSR7dGhpcy5sb2dzV3JpdHRlbisrfS5nemAsIGJ1ZmZlcik7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBiZWdpbldyaXRlTG9ncygpIHtcbiAgICAgICAgY29uc3QgbG9nc1RvV3JpdGUgPSB0aGlzLnNsaWNlTG9ncygpO1xuXG4gICAgICAgIGludGVybmFsTG9nKCdzaWxseScsIGBQcmVwYXJpbmcgbG9nIHBheWxvYWQgb2YgJHtsb2dzVG9Xcml0ZS5sZW5ndGh9IGZvciBOUiBjb2xsZWN0b3JgKTtcbiAgICAgICAgY29uc3QgcmF3UGF5bG9hZCA9IHRoaXMuYnVpbGRSYXdQb3N0Qm9keShsb2dzVG9Xcml0ZSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBjb21wcmVzc2VkUGF5bG9hZDogQnVmZmVyID0gYXdhaXQgdGhpcy5jb21wcmVzc1BheWxvYWQocmF3UGF5bG9hZCk7XG4gICAgICAgICAgICBpZiAoIXRoaXMuZGVidWdNb2RlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZW5kTG9ncyhjb21wcmVzc2VkUGF5bG9hZCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMud3JpdGVMb2dzVG9GaWxlU3lzdGVtKGNvbXByZXNzZWRQYXlsb2FkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zdCBmYWxsYmFja01lc3NhZ2UgPSAnVW5rbm93biBlcnJvciBvY2N1cnJlZCB3aGlsZSBjb21wcmVzc2luZyBsb2dzIHRvIHNlbmQgdG8gTmV3IFJlbGljJztcbiAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnIgaW5zdGFuY2VvZiBFcnJvciAmJiBlcnIuc3RhY2sgPyBlcnIuc3RhY2sgOiBmYWxsYmFja01lc3NhZ2U7IFxuICAgICAgICAgICAgaW50ZXJuYWxMb2coJ2Vycm9yJywgbWVzc2FnZSlcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEhhbmRsZXMgSFRUUCByZXF1ZXN0IHRoYXQgc2VuZHMgY29tcHJlc3NlZCBsb2cgZGF0YVxuICAgICAqIHRvIHRoZSBOZXcgUmVsaWMgZW5kcG9pbnQuXG4gICAgICogQHBhcmFtIGNvbXByZXNzZWRQYXlsb2FkIFxuICAgICAqL1xuICAgIHByaXZhdGUgc2VuZExvZ3MoY29tcHJlc3NlZFBheWxvYWQ6IEJ1ZmZlcikge1xuICAgICAgICBBeGlvcy5wb3N0KGBodHRwczovLyR7QVBJX0hPU1ROQU1FfSR7QVBJX1BBVEh9YCwgY29tcHJlc3NlZFBheWxvYWQsIHtcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAnQWNjZXB0JzogJyovKicsXG4gICAgICAgICAgICAgICAgJ0FwaS1LZXknOiBwcm9jZXNzLmVudi5ORVdfUkVMSUNfTElDRU5TRV9LRVkgYXMgc3RyaW5nLFxuICAgICAgICAgICAgICAgICdDb250ZW50LUVuY29kaW5nJzogJ2d6aXAnLFxuICAgICAgICAgICAgICAgICdDb250ZW50LUxlbmd0aCc6ICcnK2NvbXByZXNzZWRQYXlsb2FkLmJ5dGVMZW5ndGgsXG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9nemlwJyxcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgICAgICBpZiAoWzIwMCwgMjAyXS5pbmNsdWRlcyhyZXNwb25zZS5zdGF0dXMpKSB7XG4gICAgICAgICAgICAgICAgaW50ZXJuYWxMb2coJ3NpbGx5JywgYExvZyBwYXlsb2FkIGFjY2VwdGVkIGJ5IE5ldyBSZWxpYyBBUEkuIFJlcXVlc3QgSUQ6ICR7cmVzcG9uc2UuZGF0YS5yZXF1ZXN0SWR9YClcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaW50ZXJuYWxMb2coJ3dhcm4nLCBgVW5leHBlY3RlZCBzdWNjZXNzZnVsIHJlc3BvbnNlIHN0YXR1cyBjb2RlIGZyb20gTlI6ICR7cmVzcG9uc2Uuc3RhdHVzfWApXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSkuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgICAgIGludGVybmFsTG9nKCdlcnJvcicsICdFcnJvciBzZW5kaW5nIGxvZyBwYXlsb2FkIHRvIE5ldyBSZWxpYycpO1xuICAgICAgICAgICAgaW50ZXJuYWxMb2coJ2Vycm9yJywgZXJyLnN0YWNrKVxuICAgICAgICB9KVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgdGhlIGdyZWF0ZXIgb2JqZWN0IHN0cnVjdHVyZSBmb3IgYSBsb2cgZGVsaXZlcnkgXG4gICAgICogcGF5bG9hZCBhbmQgYXR0YWNoZXMgYW4gYXJyYXkgb2YgbG9ncyB0byBpdC4gUmV0dXJucyBcbiAgICAgKiBzdHJpbmdpZmllZC5cbiAgICAgKiBAcGFyYW0gbG9ncyBcbiAgICAgKiBAcmV0dXJucyBcbiAgICAgKi9cbiAgICBwcml2YXRlIGJ1aWxkUmF3UG9zdEJvZHkobG9nczogYW55W10pOiBzdHJpbmcge1xuICAgICAgICBjb25zdCBwYXlsb2FkID0gW3tcbiAgICAgICAgICAgIGNvbW1vbjoge1xuICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgLi4udGhpcy5nbG9iYWxBdHRyaWJ1dGVzLFxuICAgICAgICAgICAgICAgICAgICBzZXJ2aWNlOiB0aGlzLmFwcExhYmVsLFxuICAgICAgICAgICAgICAgICAgICB2ZXJzaW9uOiB0aGlzLnZlcnNpb25MYWJlbCxcbiAgICAgICAgICAgICAgICAgICAgcmVnaW9uOiB0aGlzLnJlZ2lvbkxhYmVsLFxuICAgICAgICAgICAgICAgICAgICBlbnZpcm9ubWVudDogdGhpcy5lbnZpcm9ubWVudExhYmVsLFxuICAgICAgICAgICAgICAgICAgICBlbnRpdHlHdWlkOiBuZXdyZWxpYy5nZXRMaW5raW5nTWV0YWRhdGEoKVsnZW50aXR5Lmd1aWQnXSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGxvZ3M6IGxvZ3NcbiAgICAgICAgfV07XG4gICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShwYXlsb2FkKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBc3luY2hyb25vdXNseSBjb21wcmVzcyBzdHJpbmcgdG8gZ3ppcCBjb21wcmVzc2VkIGRhdGEuXG4gICAgICogQHBhcmFtIHJhd1BheWxvYWQgXG4gICAgICogQHJldHVybnMgXG4gICAgICovXG4gICAgcHJpdmF0ZSBhc3luYyBjb21wcmVzc1BheWxvYWQocmF3UGF5bG9hZDogc3RyaW5nKTogUHJvbWlzZTxCdWZmZXI+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPEJ1ZmZlcj4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgemxpYi5nemlwKEJ1ZmZlci5mcm9tKHJhd1BheWxvYWQsICd1dGY4JyksIChlcnIsIGNvbXByZXNzZWRQYXlsb2FkKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikgcmVqZWN0KGVycik7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShjb21wcmVzc2VkUGF5bG9hZCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2xpY2VzIGxvZyBxdWV1ZS5cbiAgICAgKiBXaWxsIHByZWZlciB0byB1c2UgdGhlIGVudGlyZSBsb2cgcXVldWUgd2hlbiBwb3NzaWJsZSwgYnV0XG4gICAgICogbWF5IHNlbmQgb25seSBhIHN1YnNlY3Rpb24gaWYgdGhlIHNpemUgb2YgdGhlIGRhdGEgaXMgbmVhclxuICAgICAqIHRoZSBsaW1pdGF0aW9ucyBkZWZpbmVkIGJ5IE5ldyBSZWxpYydzIEFQSS5cbiAgICAgKiBAcmV0dXJucyBcbiAgICAgKi9cbiAgICBwcml2YXRlIHNsaWNlTG9ncygpIHtcbiAgICAgICAgbGV0IGxvZ3NUb1NlbmQ7XG4gICAgICAgIFxuICAgICAgICAvLyBJZiB3ZSBrbm93IHRoZSB0b3RhbCBsZW5ndGggd2lsbCBub3QgZXhjZWVkIG1heGltdW0gbGVuZ3RoIHNpemVcbiAgICAgICAgaWYgKHRoaXMudG90YWxMZW5ndGhDb3VudCA8IE1BWF9QQVlMT0FEX1NJWkUpIHtcbiAgICAgICAgICAgIFtsb2dzVG9TZW5kLCB0aGlzLmxvZ1F1ZXVlXSA9IFt0aGlzLmxvZ1F1ZXVlLCBbXV07XG4gICAgICAgICAgICB0aGlzLmxvZ0xlbmd0aFF1ZXVlID0gW107XG4gICAgICAgICAgICB0aGlzLnRvdGFsTGVuZ3RoQ291bnQgPSAwO1xuICAgICAgICAgICAgcmV0dXJuIGxvZ3NUb1NlbmQ7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBvdGhlcndpc2UsIHNsaWNlIG9mZiBhIHNsaWNlIG9mIGxvZ3MgdGhhdCB3aWxsIGZpdCBpbnRvIGEgc2luZ2xlIHJlcXVlc3RcbiAgICAgICAgbGV0IGxvZ1NpemUgPSAwO1xuICAgICAgICBsZXQgbG9nU2xpY2VJbmRleCA9IDA7XG5cbiAgICAgICAgd2hpbGUoKHRoaXMubG9nUXVldWUubGVuZ3RoID4gMCkgJiYgKGxvZ1NpemUgKyB0aGlzLmxvZ0xlbmd0aFF1ZXVlWzBdIDwgTUFYX1BBWUxPQURfU0laRSkpIHtcbiAgICAgICAgICAgIGxvZ1NsaWNlSW5kZXgrKztcbiAgICAgICAgfVxuXG4gICAgICAgIGxvZ3NUb1NlbmQgPSB0aGlzLmxvZ1F1ZXVlLnNsaWNlKDAsIGxvZ1NsaWNlSW5kZXgpO1xuICAgICAgICB0aGlzLmxvZ1F1ZXVlID0gdGhpcy5sb2dRdWV1ZS5zbGljZShsb2dTbGljZUluZGV4KTtcbiAgICAgICAgdGhpcy5sb2dMZW5ndGhRdWV1ZSA9IHRoaXMubG9nTGVuZ3RoUXVldWUuc2xpY2UobG9nU2xpY2VJbmRleCk7XG5cbiAgICAgICAgcmV0dXJuIGxvZ3NUb1NlbmQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUHJlZGljYXRlIHRvIGRldGVybWluZSBpZiBsb2dzIHNob3VsZCBiZSB3cml0dGVuIGJlIHdyaXR0ZW4gaW1tZWRpYXRlbHkuXG4gICAgICogQHJldHVybnMgYm9vbGVhblxuICAgICAqL1xuICAgIHByaXZhdGUgaW1tZWRpYXRlTG9nV3JpdGFibGVQcmVkaWNhdGUoKTogYm9vbGVhbiB7XG4gICAgICAgIGlmICh0aGlzLm5ld1JlbGljSW5pdGlhbGl6ZWQgJiYgdGhpcy5sb2dRdWV1ZS5sZW5ndGggPiAodGhpcy5jb25maWcubWluTG9nSXRlbXNUb0ZvcmNlIHx8IDEwMCkpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUHVzaCBsb2dzIGV2ZW4gaWYgbmV3IHJlbGljIGhhc24ndCBiZWVuIGluaXRpYWxpemVkIGlmIHRoZSBiYWNrbG9nIGdyb3dzIHRvbyBsYXJnZVxuICAgICAgICBpZiAodGhpcy5sb2dRdWV1ZS5sZW5ndGggPiA1MDApIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQcmVkaWNhdGUgdG8gZGV0ZXJtaW5lIGlmIGxvZ3Mgc2hvdWxkIGJlIHdyaXR0ZW4gb24gbmV4dCBwZXJpb2RpYyBjaGVjay5cbiAgICAgKiBAcmV0dXJucyBib29sZWFuXG4gICAgICovXG4gICAgcHJpdmF0ZSBsb2dzV3JpdGFibGVQcmVkaWNhdGUoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLm1pbkxvZ0l0ZW1zRXhjZWVkZWQoKVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFByZWRpY2F0ZSB0byBkZXRlcm1pbmUgaWYgdGhlIHRvdGFsIGxvZ3MgaGF2ZSBleGNlZWRlZCBhIGNvbmZpZ3VyZWQgbWluTG9nXG4gICAgICogY291bnQgdmFsdWUgaWYgc3VjaCBhIHZhbHVlIGlzIGNvbmZpZ3VyZWQuXG4gICAgICogQHJldHVybnMgXG4gICAgICovXG4gICAgcHJpdmF0ZSBtaW5Mb2dJdGVtc0V4Y2VlZGVkKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gISEodGhpcy5jb25maWcubWluTG9nSXRlbXMgJiYgKHRoaXMubG9nUXVldWUubGVuZ3RoID4gdGhpcy5jb25maWcubWluTG9nSXRlbXMpKTtcbiAgICB9ICAgIFxuICAgIFxuICAgIC8qKlxuICAgICAqIEZpeGVzIHBvc3NpYmxlIGlzc3VlcyBpbiBsb2cgZm9ybWF0IGNhdXNlZCBieSBsaW1pdGF0aW9ucyBvZiBOUnMgbG9nZ2luZ1xuICAgICAqIHZhbHVlc1xuICAgICAqIEBwYXJhbSBsb2cgXG4gICAgICogQHJldHVybnMgXG4gICAgICovXG4gICAgcHJpdmF0ZSBsb2dUcmFuc2Zvcm0obG9nOiBhbnkpIHtcbiAgICAgICAgaWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGxvZykubGVuZ3RoID4gTUFYX0FUVFJJQlVURVNfUEVSX0VWRU5UKSB7XG4gICAgICAgICAgICBpbnRlcm5hbExvZygnd2FybicsIGBMb2cgdG8gc2VuZCB0byBKU09OIGNvbnRhaW5zICR7T2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMobG9nKX0gLyAke01BWF9BVFRSSUJVVEVTX1BFUl9FVkVOVH0gYXR0cmlidXRlcy5gKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgZm9yIChsZXQga2V5IG9mIE9iamVjdC5rZXlzKGxvZykpIHtcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gbG9nW2tleV07XG4gICAgICAgICAgICAvLyByZXBsYWNlIGtleSB3aXRoIGxlbmd0aCB0b28gaGlnaFxuICAgICAgICAgICAgaWYgKGtleS5sZW5ndGggPiBNQVhfQVRUUklCVVRFX05BTUVfTEVOR1RIKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbmV3S2V5ID0ga2V5LnNsaWNlKDAsIE1BWF9BVFRSSUJVVEVfTkFNRV9MRU5HVEgpO1xuICAgICAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShsb2csIGtleS5zbGljZSgwLCBNQVhfQVRUUklCVVRFX05BTUVfTEVOR1RIKSwgXG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IobG9nLCBrZXkgYXMgUHJvcGVydHlLZXkpIGFzIFByb3BlcnR5RGVzY3JpcHRvcik7XG4gICAgICAgICAgICAgICAgZGVsZXRlIGxvZy5rZXk7XG5cbiAgICAgICAgICAgICAgICAvLyBVcGRhdGUga2V5IG5hbWUgZm9yIHVzYWdlIGluIGxhdGVyIHN0ZXBzXG4gICAgICAgICAgICAgICAga2V5ID0gbmV3S2V5O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBDb25jYXRlbmF0ZSBsb2cgbWVzc2FnZXMgd2l0aCBsZW5ndGggZ3JlYXRlciB0aGFuIE1BWF9BVFRSSUJVVEVfVkFMVUVfTEVOR1RIXG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiB2YWx1ZS5sZW5ndGggPiBNQVhfQVRUUklCVVRFX1ZBTFVFX0xFTkdUSCkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNvbmZpZz8ud2Fybk9uQXR0cmlidXRlTGVuZ3RoT3ZlcmZsb3cpIHtcbiAgICAgICAgICAgICAgICAgICAgaW50ZXJuYWxMb2coJ3dhcm4nLCBgTlIgTG9nIGF0dHJpYnV0ZSBsZW5ndGggb3ZlcmZsb3cuIExlbmd0aDogJHt2YWx1ZS5sZW5ndGh9LyR7TUFYX0FUVFJJQlVURV9WQUxVRV9MRU5HVEh9YCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGxvZy5rZXkgPSB2YWx1ZS5zbGljZSgwLCBNQVhfQVRUUklCVVRFX1ZBTFVFX0xFTkdUSCk7IFxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoa2V5LmluY2x1ZGVzKCcgJykpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBuZXdLZXkgPSBrZXkucmVwbGFjZUFsbCgnICcsICcuJyk7XG4gICAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGxvZywga2V5LnNsaWNlKDAsIE1BWF9BVFRSSUJVVEVfTkFNRV9MRU5HVEgpLCBcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihsb2csIGtleSBhcyBQcm9wZXJ0eUtleSkgYXMgUHJvcGVydHlEZXNjcmlwdG9yKTtcbiAgICAgICAgICAgICAgICBkZWxldGUgbG9nLmtleTtcblxuICAgICAgICAgICAgICAgIC8vIFVwZGF0ZSBrZXkgbmFtZSBmb3IgdXNhZ2UgaW4gbGF0ZXIgc3RlcHNcbiAgICAgICAgICAgICAgICBrZXkgPSBuZXdLZXk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRnVuY3Rpb24gdXNlZCB0byByZXBlYXRlZGx5IHRyaWdnZXIgbG9nIHB1c2hlc1xuICAgICAqL1xuICAgIHByaXZhdGUgY3JlYXRlTG9nQ2hlY2tUaW1lb3V0KCkge1xuICAgICAgICB0aGlzLnRpbWVvdXRJZCA9IHNldFRpbWVvdXQoYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgaWYgKHRoaXMubG9nUXVldWUubGVuZ3RoID4gKHRoaXMuY29uZmlnLm1pbkxvZ0l0ZW1zIHx8IDEpKSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5iZWdpbldyaXRlTG9ncygpO1xuICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRlTG9nQ2hlY2tUaW1lb3V0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHRoaXMuY29uZmlnLmxvZ1B1c2hGcmVxdWVuY3kpXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSGVscGVyIG1ldGhvZCB0aGF0IHJlZ2lzdGVycyBsaXN0ZW5lcnMgZm9yIGV2ZW50c1xuICAgICAqIHJlbGF0ZWQgdG8gaW1taW5lbnQgYXBwbGljYXRpb24gc2h1dGRvd24gc28gdGhhdFxuICAgICAqIGZpbmFsIGxvZ3MgY2FuIGJlIHB1c2hlZFxuICAgICAqL1xuICAgIHByaXZhdGUgcmVnaXN0ZXJBcHBEZWF0aExvZ1B1c2goKSB7XG4gICAgICAgIGxldCBmaW5hbFdyaXR0ZW4gPSBmYWxzZTtcbiAgICAgICAgcHJvY2Vzcy5vbignZXhpdCcsICgpID0+IHtcbiAgICAgICAgICAgIGlmICh0aGlzLnRpbWVvdXRJZCkgY2xlYXJUaW1lb3V0KHRoaXMudGltZW91dElkKTtcbiAgICAgICAgICAgIGxldCBvID0gZmluYWxXcml0dGVuO1xuICAgICAgICAgICAgZmluYWxXcml0dGVuID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmIChvKSByZXR1cm47XG5cbiAgICAgICAgICAgIGludGVybmFsTG9nKCdpbmZvJywgJ3dyaXRpbmcgZmluYWwgbG9ncycpO1xuXG4gICAgICAgICAgICB0aGlzLndyaXRlTG9nc1N5bmMoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcHJvY2Vzcy5vbignU0lHSU5UJywgKCkgPT4ge1xuICAgICAgICAgICAgcHJvY2Vzcy5leGl0KDIpO1xuICAgICAgICB9KTtcblxuICAgICAgICBwcm9jZXNzLm9uKCd1bmNhdWdodEV4Y2VwdGlvbicsIChlKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlKTtcbiAgICAgICAgICAgIGludGVybmFsTG9nKCdlcnJvcicsIGUuc3RhY2sgfHwgJycpO1xuICAgICAgICB9KTtcblxuICAgICAgICBwcm9jZXNzLm9uKCdTSUdURVJNJywgKCkgPT4ge1xuICAgICAgICAgICAgaWYgKHRoaXMudGltZW91dElkKSBjbGVhclRpbWVvdXQodGhpcy50aW1lb3V0SWQpO1xuICAgICAgICAgICAgdGhpcy53cml0ZUxvZ3NTeW5jKCk7XG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTmV3IFJlbGljIGRvZXMgbm90IGV4cG9zZSBhIG1ldGhvZCB0byBjaGVjayBpdHMgaW5pdGlhbGl6YXRpb24gc3RhdHVzXG4gICAgICogSWYgd2UgcHVzaCBsb2dzIGJlZm9yZSBOZXcgUmVsaWMgaW5pdGlhbGl6ZXMsIHRoZXkgd2lsbCBub3QgaGF2ZSBhbiBhdHRhY2hlZFxuICAgICAqIGVudGl0eSBndWlkLiAgRm9yIHRoaXMgcmVhc29uIHdlIHdpbGwgaW5pdGlhbGl6ZSBhbiBpbnRlcnZhbCB0aGF0IGNhbiBydW4gdW50aWxcbiAgICAgKiBpdCBpcyBpbml0aWFsaXplZC5cbiAgICAgKi9cbiAgICBwcml2YXRlIHJlZ2lzdGVyTmV3UmVsaWNJbml0aWFsaXphdGlvbkludGVydmFsKCkge1xuICAgICAgICBjb25zdCBuZXdSZWxpY0luaXRpYWxpemF0aW9uQ2hlY2tUaW1lb3V0ID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbWV0YWRhdGEgPSBuZXdyZWxpYy5nZXRMaW5raW5nTWV0YWRhdGEoKTtcbiAgICAgICAgICAgIGlmIChtZXRhZGF0YVsnZW50aXR5Lmd1aWQnXSkge1xuICAgICAgICAgICAgICAgIHRoaXMubmV3UmVsaWNJbml0aWFsaXplZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgaW50ZXJuYWxMb2coJ2luZm8nLCAnRGV0ZWN0ZWQgTmV3IFJlbGljIGhhcyBpbml0aWFsaXplZCB3aXRoIGVudGl0eS5ndWlkJyk7XG4gICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChuZXdSZWxpY0luaXRpYWxpemF0aW9uQ2hlY2tUaW1lb3V0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgMTAwKTtcbiAgICB9XG59XG5cbi8qKlxuICogUmVwbGFjZXMgZXhpc3Rpbmcgd3JpdGVycyBmb3Igc3Rkb3V0IGFuZCBzdGRlcnIgd2l0aFxuICogUGFzc1Rocm91Z2ggc3RyZWFtcyB0aGF0IHdpbGwgaW52b2tlIHByb3ZpZGVkIGNhbGxiYWNrc1xuICogd2l0aCB0aGUgZGF0YSBwcmlvciB0byBwYXNzaW5nIHRoZW0gdG8gdGhlIG9yaWdpbmFsIHN0cmVhbXNcbiAqL1xuY2xhc3MgU3RhbmRhcmRPdXRQYXNzVGhyb3VnaCB7XG5cblxuICAgIHByaXZhdGUgcmVhZG9ubHkgc3Rkb3V0UHQgPSBuZXcgUGFzc1Rocm91Z2goKTtcbiAgICBwcml2YXRlIHJlYWRvbmx5IHN0ZGVyclB0ID0gbmV3IFBhc3NUaHJvdWdoKCk7XG5cbiAgICBwcml2YXRlIHJlYWRvbmx5IHN0ZG91dDtcbiAgICBwcml2YXRlIHJlYWRvbmx5IHN0ZGVycjtcblxuICAgIHByaXZhdGUgcmVhZG9ubHkgd3JpdGVTdGRvdXQ7XG4gICAgcHJpdmF0ZSByZWFkb25seSB3cml0ZVN0ZGVycjtcblxuICAgIGNvbnN0cnVjdG9yKHN0ZG91dENiOiAoZGF0YTogc3RyaW5nKSA9PiB2b2lkLCBzdGRlcnJDYjogKGRhdGE6IHN0cmluZykgPT4gdm9pZCkge1xuICAgICAgICAvLyBTdG9yZSBvcmlnaW5hbCB3cml0ZSBzdGRvdXQvc3RkZXJyIHdyaXRlIGZ1bmN0aW9uc1xuICAgICAgICB0aGlzLnN0ZG91dCA9IHByb2Nlc3Muc3Rkb3V0LndyaXRlO1xuICAgICAgICB0aGlzLnN0ZGVyciA9IHByb2Nlc3Muc3RkZXJyLndyaXRlO1xuXG4gICAgICAgIC8vIENyZWF0ZSBmdW5jdGlvbnMgd2hpY2ggd3JpdGUgdG8gb3JpZ2luYWwgd3JpdGVzIHdpdGggc3Rkb3V0L3N0ZGVyciBjb250ZXh0cyBib3VuZFxuICAgICAgICB0aGlzLndyaXRlU3Rkb3V0ID0gKGRhdGE6IHN0cmluZykgPT4gdGhpcy5zdGRvdXQuY2FsbChwcm9jZXNzLnN0ZG91dCwgZGF0YSk7XG4gICAgICAgIHRoaXMud3JpdGVTdGRlcnIgPSAoZGF0YTogc3RyaW5nKSA9PiB0aGlzLnN0ZGVyci5jYWxsKHByb2Nlc3Muc3RkZXJyLCBkYXRhKTtcblxuICAgICAgICAvLyBBc3NpZ24gbGlzdGVuZXJzIHRvIFBhc3NUaHJvdWdoc1xuICAgICAgICB0aGlzLnN0ZG91dFB0Lm9uKCdkYXRhJywgKGRhdGEpID0+IHtcbiAgICAgICAgICAgIGlmIChkYXRhIGluc3RhbmNlb2YgQnVmZmVyKSB7XG4gICAgICAgICAgICAgICAgZGF0YSA9IGRhdGEudG9TdHJpbmcoJ3V0ZjgnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN0ZG91dENiKGRhdGEpO1xuICAgICAgICAgICAgdGhpcy53cml0ZVN0ZG91dChkYXRhKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5zdGRlcnJQdC5vbignZGF0YScsIChkYXRhKSA9PiB7XG4gICAgICAgICAgICBpZiAoZGF0YSBpbnN0YW5jZW9mIEJ1ZmZlcikge1xuICAgICAgICAgICAgICAgIGRhdGEgPSBkYXRhLnRvU3RyaW5nKCd1dGY4Jyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzdGRlcnJDYihkYXRhKTtcbiAgICAgICAgICAgIHRoaXMud3JpdGVTdGRlcnIoZGF0YSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIFJlcGxhY2Ugb3JpZ2luYWwgd3JpdGUgY2FsbHMgd2l0aCBjb250ZXh0cyBib3VuZCB0byBwYXJlbnQgb2JqZWN0XG4gICAgICAgIHByb2Nlc3Muc3Rkb3V0LndyaXRlID0gdGhpcy5zdGRvdXRQdC53cml0ZS5iaW5kKHRoaXMuc3Rkb3V0UHQpIGFzIGFueTtcbiAgICAgICAgcHJvY2Vzcy5zdGRlcnIud3JpdGUgPSB0aGlzLnN0ZGVyclB0LndyaXRlLmJpbmQodGhpcy5zdGRlcnJQdCkgYXMgYW55O1xuXG4gICAgICAgIC8vIEFkZCB1bmNhdWdodCBlcnJvciBoYW5kbGVyIHRvIGhhbmRsZSBsb2dnaW5nIG9mIGZhaWx1cmUgY2FzZVxuICAgICAgICBwcm9jZXNzLm9uKCd1bmNhdWdodEV4Y2VwdGlvbicsIChlcnIpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVhZmZpeCB0aGUgcmVwbGFjZWQgc3Rkb3V0IGFuZCBzdGRlcnIgdGhlblxuICAgICAqIGNsb3NlcyBhbGwgc3RyZWFtcyBvd25lZCBieSB0aGlzIGluc3RhbmNlLlxuICAgICAqL1xuICAgIHB1YmxpYyBkZXN0cm95KCkge1xuICAgICAgICBwcm9jZXNzLnN0ZG91dC53cml0ZSA9IHRoaXMuc3Rkb3V0O1xuICAgICAgICBwcm9jZXNzLnN0ZGVyci53cml0ZSA9IHRoaXMuc3RkZXJyO1xuXG4gICAgICAgIHRoaXMuc3Rkb3V0UHQuZGVzdHJveSgpXG4gICAgICAgIHRoaXMuc3RkZXJyUHQuZGVzdHJveSgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEJ5cGFzcyB0aGUgY29uZmlndXJlZCBjYWxsYmFjayBmdW5jdGlvbiBmb3Igc3Rkb3V0IGJ5XG4gICAgICogd3JpdGluZyBkaXJlY3RseSB0byB0aGUgZGV0YWNoZWQgb3V0cHV0IHN0cmVhbVxuICAgICAqIEBwYXJhbSBkYXRhIFxuICAgICAqL1xuICAgIHB1YmxpYyBzdGRvdXRCeXBhc3MoZGF0YTogc3RyaW5nIHwgb2JqZWN0KSB7XG4gICAgICAgIGlmIChkYXRhIGluc3RhbmNlb2YgT2JqZWN0KSB7XG4gICAgICAgICAgICBkYXRhID0gSlNPTi5zdHJpbmdpZnkoZGF0YSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy53cml0ZVN0ZG91dCgoZGF0YSBhcyB1bmtub3duIGFzIHN0cmluZykpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEJ5cGFzcyB0aGUgY29uZmlndXJlZCBjYWxsYmFjayBmdW5jdGlvbiBmb3Igc3RkZXJyIGJ5XG4gICAgICogd3JpdGluZyBkaXJlY3RseSB0byB0aGUgZGV0YWNoZWQgb3V0cHV0IHN0cmVhbVxuICAgICAqIEBwYXJhbSBkYXRhIFxuICAgICAqL1xuICAgIHB1YmxpYyBzdGRlcnJCeXBhc3MoZGF0YTogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMud3JpdGVTdGRlcnIoZGF0YSk7XG4gICAgfVxufVxuXG5cbi8qKlxuICogTGF6eSBsb2FkIGxvZ2dlciwgd3JpdGUgYnVmZmVyZWQgbWVzc2FnZXMgb25jZSBsb2FkZWRcbiAqIE5vdGU6IExhenkgbG9hZGluZyBpcyBuZWNlc3NhcnkgdG8gcmVzb2x2ZSBjaXJjdWxhciBkZXBlbmRlbmNpZXMgYmV0d2VlbiB0aGlzXG4gKiBtb2R1bGUgYW5kIHRoZSBsb2dnZXIuXG4gKi9cbihhc3luYyAoKSA9PiB7XG4gICAgY29uc3QgeyB3aXRoTG9nZ2VyIH0gPSBhd2FpdCBpbXBvcnQoJy4vbG9nZ2VyJyk7XG4gICAgY29uc3QgbGV2ZWw6IE5QTUxvZ2dpbmdMZXZlbHMgPSBwcm9jZXNzLmVudi5MT0dfREVMSVZFUllfQUdFTlRfTEVWRUwgYXMgTlBNTG9nZ2luZ0xldmVscyB8fCAnd2Fybic7XG4gICAgbG9nID0gd2l0aExvZ2dlcignTmV3UmVsaWNMb2dGb3J3YXJkZXInLCBsZXZlbCk7XG4gICAgd2hpbGUoaW50ZXJuYWxMb2dCdWZmZXIubGVuZ3RoKSB7XG4gICAgICAgIGNvbnN0IFtsZXZlbCwgbWVzc2FnZV0gPSBpbnRlcm5hbExvZ0J1ZmZlci5zaGlmdCgpIGFzIFtzdHJpbmcsIHN0cmluZ107XG4gICAgICAgIChsb2cgYXMgYW55KVtsZXZlbF0obWVzc2FnZSk7XG4gICAgfVxufSkoKTtcbiJdfQ==