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
    internalLog('debug', 'LogDeliveryAgent Initialized');
    var serviceLabel = process.env.SERVICE_LABEL;
    var component;
    var labels = process.env.NEW_RELIC_LABELS;

    if (labels) {
      var parts = labels.split(';');
      var labelMap = new Map();
      parts.forEach(function (part) {
        var _part$split = part.split(':'),
            _part$split2 = _slicedToArray(_part$split, 2),
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9Mb2dEZWxpdmVyeUFnZW50LnRzIl0sIm5hbWVzIjpbIkFQSV9IT1NUTkFNRSIsInByb2Nlc3MiLCJlbnYiLCJLTF9OUl9MT0dfSE9TVE5BTUUiLCJBUElfUEFUSCIsIktMX05SX0xPR19QQVRIIiwiTUFYX1BBWUxPQURfU0laRSIsIk1BWF9BVFRSSUJVVEVTX1BFUl9FVkVOVCIsIk1BWF9BVFRSSUJVVEVfTkFNRV9MRU5HVEgiLCJNQVhfQVRUUklCVVRFX1ZBTFVFX0xFTkdUSCIsImxvZyIsImludGVybmFsTG9nQnVmZmVyIiwiaW50ZXJuYWxMb2ciLCJsZXZlbCIsIm1lc3NhZ2UiLCJwdXNoIiwiZGVmYXVsdENvbmZpZyIsImJ5dGVzV3JpdHRlblRocmVzaG9sZCIsIndhcm5PbkF0dHJpYnV0ZUxlbmd0aE92ZXJmbG93IiwibWluQnl0ZXNXcml0dGVuIiwibWluTG9nSXRlbXMiLCJsb2dQdXNoRnJlcXVlbmN5IiwibWluTG9nSXRlbXNUb0ZvcmNlIiwiTmV3UmVsaWNMb2dEZWxpdmVyeUFnZW50IiwiREVCVUdfV1JJVEVfTE9HU19UT19GSUxFIiwiY29uZmlnIiwibmV3UmVsaWNMb2dUcmFuc3BvcnQiLCJOZXdSZWxpY0xvZ1RyYW5zcG9ydCIsImNiIiwiYWRkTG9nIiwibG9nQ2FsbGJhY2siLCJlcnJDYWxsYmFjayIsImxhYmVsIiwic3RhbmRhcmRPdXRQYXNzVGhyb3VnaCIsIlN0YW5kYXJkT3V0UGFzc1Rocm91Z2giLCJyZWdpc3RlckFwcERlYXRoTG9nUHVzaCIsImNyZWF0ZUxvZ0NoZWNrVGltZW91dCIsInJlZ2lzdGVyTmV3UmVsaWNJbml0aWFsaXphdGlvbkludGVydmFsIiwic2VydmljZUxhYmVsIiwiU0VSVklDRV9MQUJFTCIsImNvbXBvbmVudCIsImxhYmVscyIsIk5FV19SRUxJQ19MQUJFTFMiLCJwYXJ0cyIsInNwbGl0IiwibGFiZWxNYXAiLCJNYXAiLCJmb3JFYWNoIiwicGFydCIsInZhbHVlIiwic2V0IiwidG9Mb3dlckNhc2UiLCJoYXMiLCJyZWdpb25MYWJlbCIsImdldCIsImVudmlyb25tZW50TGFiZWwiLCJ2ZXJzaW9uTGFiZWwiLCJhcHBMYWJlbCIsIk5FV19SRUxJQ19BUFBfTkFNRSIsInRpbWVvdXRJZCIsImNsZWFyVGltZW91dCIsImRlc3Ryb3kiLCJjbG9zZSIsIndyaXRlTG9nc1N5bmMiLCJzdHIiLCJKU09OIiwic3RyaW5naWZ5Iiwib2JqIiwicGFyc2UiLCJtc2ciLCJuYW1lIiwiZXJyIiwiY2FsbGJhY2siLCJqc29uRGF0YSIsImlzTlJDb21wYXRpYmxlSnNvbkxvZ1N0cmluZyIsInByb2Nlc3NBc0pzb25Mb2ciLCJwcm9jZXNzQXNTdHJpbmdMb2ciLCJpbW1lZGlhdGVMb2dXcml0YWJsZVByZWRpY2F0ZSIsImJlZ2luV3JpdGVMb2dzIiwic3RkZXJyQnlwYXNzIiwic3Rkb3V0QnlwYXNzIiwibG9nVHJhbnNmb3JtIiwibG9nU3RyaW5nIiwibGVuZ3RoIiwiQnVmZmVyIiwiYnl0ZUxlbmd0aCIsImxvZ1F1ZXVlIiwibG9nTGVuZ3RoUXVldWUiLCJ0b3RhbExlbmd0aENvdW50IiwiZW5kc1dpdGgiLCJzdWJzdHJpbmciLCJuZXdSZWxpY01ldGFkYXRhIiwibmV3cmVsaWMiLCJnZXRMaW5raW5nTWV0YWRhdGEiLCJzdHJ1Y3R1cmVkTG9nIiwidGltZXN0YW1wIiwiRGF0ZSIsIm5vdyIsIm9yaWdpbmFsX3RpbWVzdGFtcCIsInRvSVNPU3RyaW5nIiwiaG9zdG5hbWUiLCJqc29uTG9nU3RyaW5nIiwiYXR0cmlidXRlcyIsImdsb2JhbEF0dHJpYnV0ZXMiLCJsb2dzVG9Xcml0ZSIsInNsaWNlTG9ncyIsInJhd1BheWxvYWQiLCJidWlsZFJhd1Bvc3RCb2R5IiwiY29tcHJlc3NlZFBheWxvYWQiLCJ6bGliIiwiZ3ppcFN5bmMiLCJkZWJ1Z01vZGUiLCJzZW5kTG9ncyIsIndyaXRlTG9nc1RvRmlsZVN5c3RlbSIsImJ1ZmZlciIsImZzIiwid3JpdGVGaWxlU3luYyIsImxvZ3NXcml0dGVuIiwiY29tcHJlc3NQYXlsb2FkIiwiZmFsbGJhY2tNZXNzYWdlIiwiRXJyb3IiLCJzdGFjayIsIkF4aW9zIiwicG9zdCIsImhlYWRlcnMiLCJORVdfUkVMSUNfTElDRU5TRV9LRVkiLCJ0aGVuIiwicmVzcG9uc2UiLCJpbmNsdWRlcyIsInN0YXR1cyIsImRhdGEiLCJyZXF1ZXN0SWQiLCJsb2dzIiwicGF5bG9hZCIsImNvbW1vbiIsInNlcnZpY2UiLCJ2ZXJzaW9uIiwicmVnaW9uIiwiZW52aXJvbm1lbnQiLCJlbnRpdHlHdWlkIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJnemlwIiwiZnJvbSIsImxvZ3NUb1NlbmQiLCJsb2dTaXplIiwibG9nU2xpY2VJbmRleCIsInNsaWNlIiwibmV3UmVsaWNJbml0aWFsaXplZCIsIm1pbkxvZ0l0ZW1zRXhjZWVkZWQiLCJPYmplY3QiLCJnZXRPd25Qcm9wZXJ0eU5hbWVzIiwia2V5cyIsImtleSIsIm5ld0tleSIsImRlZmluZVByb3BlcnR5IiwiZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yIiwicmVwbGFjZUFsbCIsInNldFRpbWVvdXQiLCJmaW5hbFdyaXR0ZW4iLCJvbiIsIm8iLCJleGl0IiwiZSIsImNvbnNvbGUiLCJuZXdSZWxpY0luaXRpYWxpemF0aW9uQ2hlY2tUaW1lb3V0Iiwic2V0SW50ZXJ2YWwiLCJtZXRhZGF0YSIsImNsZWFySW50ZXJ2YWwiLCJpbnN0YW5jZSIsInN0ZG91dENiIiwic3RkZXJyQ2IiLCJQYXNzVGhyb3VnaCIsInN0ZG91dCIsIndyaXRlIiwic3RkZXJyIiwid3JpdGVTdGRvdXQiLCJjYWxsIiwid3JpdGVTdGRlcnIiLCJzdGRvdXRQdCIsInRvU3RyaW5nIiwic3RkZXJyUHQiLCJiaW5kIiwiZXJyb3IiLCJ3aXRoTG9nZ2VyIiwiTE9HX0RFTElWRVJZX0FHRU5UX0xFVkVMIiwic2hpZnQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFHQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFQSxJQUFNQSxZQUFZLEdBQUdDLE9BQU8sQ0FBQ0MsR0FBUixDQUFZQyxrQkFBWixJQUFrQyx5QkFBdkQ7QUFDQSxJQUFNQyxRQUFRLEdBQUdILE9BQU8sQ0FBQ0MsR0FBUixDQUFZRyxjQUFaLElBQThCLFNBQS9DO0FBQ0EsSUFBTUMsZ0JBQWdCLFlBQUcsRUFBSCxFQUFPLENBQVAsQ0FBdEI7QUFDQSxJQUFNQyx3QkFBd0IsR0FBRyxHQUFqQztBQUNBLElBQU1DLHlCQUF5QixHQUFHLEdBQWxDO0FBQ0EsSUFBTUMsMEJBQTBCLEdBQUcsSUFBbkM7QUFFQSxJQUFJQyxHQUFKO0FBQ0EsSUFBSUMsaUJBQTBDLEdBQUcsRUFBakQ7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFDQSxTQUFTQyxXQUFULENBQXFCQyxLQUFyQixFQUFvQ0MsT0FBcEMsRUFBcUQ7QUFDakQsTUFBSUosR0FBSixFQUFTO0FBQ0pBLElBQUFBLEdBQUQsQ0FBYUcsS0FBYixFQUFvQkMsT0FBcEI7QUFDSCxHQUZELE1BRU87QUFDSEgsSUFBQUEsaUJBQWlCLENBQUNJLElBQWxCLENBQXVCLENBQUNGLEtBQUQsRUFBUUMsT0FBUixDQUF2QjtBQUNIO0FBQ0o7O0FBNENELElBQU1FLGFBQTZDLEdBQUc7QUFDbERDLEVBQUFBLHFCQUFxQixFQUFFWCxnQkFBZ0IsR0FBRyxDQUFuQixHQUF1QixDQURJO0FBRWxEWSxFQUFBQSw2QkFBNkIsRUFBRSxLQUZtQjtBQUdsREMsRUFBQUEsZUFBZSxFQUFFYixnQkFBZ0IsR0FBRyxDQUFuQixHQUF1QixDQUhVO0FBSWxEYyxFQUFBQSxXQUFXLEVBQUUsQ0FKcUM7QUFLbERDLEVBQUFBLGdCQUFnQixFQUFFLEtBTGdDO0FBTWxEQyxFQUFBQSxrQkFBa0IsRUFBRTtBQU44QixDQUF0RDs7SUFTYUMsd0I7QUFxRFQsc0NBQXNCO0FBQUE7O0FBQUE7O0FBQUE7O0FBQUEseUNBbERRLFdBa0RSOztBQUFBLDhDQWpEYSxXQWlEYjs7QUFBQSwwQ0FoRFMsV0FnRFQ7O0FBQUEsc0NBYkksRUFhSjs7QUFBQTs7QUFBQSw0Q0FYYSxFQVdiOztBQUFBLDhDQVZLLENBVUw7O0FBQUEsOENBVDhCLEVBUzlCOztBQUFBOztBQUFBLHVDQVBGdEIsT0FBTyxDQUFDQyxHQUFSLENBQVlzQix3QkFBWixLQUF5QyxNQU92Qzs7QUFBQTs7QUFBQSx5Q0FMQSxDQUtBOztBQUFBLGlEQUpRLEtBSVI7O0FBQUE7O0FBQ2xCWixJQUFBQSxXQUFXLENBQUMsT0FBRCxFQUFVLCtCQUFWLENBQVg7QUFDQSxTQUFLYSxNQUFMLHFCQUFtQlQsYUFBbkI7QUFFQUosSUFBQUEsV0FBVyxDQUFDLE1BQUQsa0NBQVg7QUFDQSxTQUFLYyxvQkFBTCxHQUE0QixJQUFJQywwQ0FBSixDQUF5QixVQUFDakIsR0FBRCxFQUFNa0IsRUFBTjtBQUFBLGFBQWEsS0FBSSxDQUFDQyxNQUFMLENBQVluQixHQUFaLEVBQWlCa0IsRUFBakIsQ0FBYjtBQUFBLEtBQXpCLENBQTVCLENBTGtCLENBT2xCOztBQUNBLFFBQU1FLFdBQVcsR0FBRyxTQUFkQSxXQUFjLENBQUNwQixHQUFELEVBQWlCO0FBQ2pDLE1BQUEsS0FBSSxDQUFDbUIsTUFBTCxDQUFZbkIsR0FBWixFQUFpQixZQUFNLENBQUUsQ0FBekI7QUFDSCxLQUZEOztBQUlBLFFBQU1xQixXQUFXLEdBQUcsU0FBZEEsV0FBYyxDQUFDckIsR0FBRCxFQUFpQjtBQUNqQyxNQUFBLEtBQUksQ0FBQ21CLE1BQUwsQ0FBWTtBQUNSRyxRQUFBQSxLQUFLLEVBQUUsT0FEQztBQUVSbEIsUUFBQUEsT0FBTyxFQUFFSjtBQUZELE9BQVosRUFHRyxZQUFNLENBQUUsQ0FIWDtBQUlILEtBTEQ7O0FBT0EsU0FBS3VCLHNCQUFMLEdBQThCLElBQUlDLHNCQUFKLENBQTJCSixXQUEzQixFQUF3Q0MsV0FBeEMsQ0FBOUI7QUFDQSxTQUFLSSx1QkFBTDtBQUNBLFNBQUtDLHFCQUFMO0FBQ0EsU0FBS0Msc0NBQUw7QUFDQXpCLElBQUFBLFdBQVcsQ0FBQyxPQUFELEVBQVUsOEJBQVYsQ0FBWDtBQUVBLFFBQU0wQixZQUFZLEdBQUdyQyxPQUFPLENBQUNDLEdBQVIsQ0FBWXFDLGFBQWpDO0FBQ0EsUUFBSUMsU0FBSjtBQUNBLFFBQU1DLE1BQU0sR0FBR3hDLE9BQU8sQ0FBQ0MsR0FBUixDQUFZd0MsZ0JBQTNCOztBQUNBLFFBQUlELE1BQUosRUFBWTtBQUNSLFVBQU1FLEtBQUssR0FBR0YsTUFBTSxDQUFDRyxLQUFQLENBQWEsR0FBYixDQUFkO0FBQ0EsVUFBTUMsUUFBUSxHQUFHLElBQUlDLEdBQUosRUFBakI7QUFDQUgsTUFBQUEsS0FBSyxDQUFDSSxPQUFOLENBQWMsVUFBQUMsSUFBSSxFQUFJO0FBQ2xCLDBCQUF1QkEsSUFBSSxDQUFDSixLQUFMLENBQVcsR0FBWCxDQUF2QjtBQUFBO0FBQUEsWUFBT1osS0FBUDtBQUFBLFlBQWNpQixLQUFkOztBQUNBSixRQUFBQSxRQUFRLENBQUNLLEdBQVQsQ0FBYWxCLEtBQUssQ0FBQ21CLFdBQU4sRUFBYixFQUFrQ0YsS0FBbEM7QUFDSCxPQUhEOztBQUtBLFVBQUlKLFFBQVEsQ0FBQ08sR0FBVCxDQUFhLFFBQWIsQ0FBSixFQUE0QjtBQUN4QixhQUFLQyxXQUFMLEdBQW1CUixRQUFRLENBQUNTLEdBQVQsQ0FBYSxRQUFiLENBQW5CO0FBQ0g7O0FBRUQsVUFBSVQsUUFBUSxDQUFDTyxHQUFULENBQWEsYUFBYixDQUFKLEVBQWlDO0FBQzdCLGFBQUtHLGdCQUFMLEdBQXdCVixRQUFRLENBQUNTLEdBQVQsQ0FBYSxhQUFiLENBQXhCO0FBQ0g7O0FBRUQsVUFBSVQsUUFBUSxDQUFDTyxHQUFULENBQWEsU0FBYixDQUFKLEVBQTZCO0FBQ3pCLGFBQUtJLFlBQUwsR0FBb0JYLFFBQVEsQ0FBQ1MsR0FBVCxDQUFhLFNBQWIsQ0FBcEI7QUFDSDs7QUFFRGQsTUFBQUEsU0FBUyxHQUFHSyxRQUFRLENBQUNTLEdBQVQsQ0FBYSxXQUFiLENBQVo7QUFDSDtBQUVEO0FBQ1I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFDUSxTQUFLRyxRQUFMLEdBQWdCbkIsWUFBWSxJQUNyQkUsU0FEUyxJQUVUdkMsT0FBTyxDQUFDQyxHQUFSLENBQVl3RCxrQkFGSCxJQUdULFdBSFA7QUFJSDtBQUVEO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7Ozs7O1dBQ0ksMkJBQXlCO0FBQ3JCLGFBQU8sS0FBS2hDLG9CQUFaO0FBQ0g7QUFFRDtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O1dBQ0ksb0JBQWtCO0FBQ2RkLE1BQUFBLFdBQVcsQ0FBQyxPQUFELEVBQVUsd0NBQVYsQ0FBWDtBQUNBLFVBQUksS0FBSytDLFNBQVQsRUFBb0JDLFlBQVksQ0FBQyxLQUFLRCxTQUFOLENBQVo7QUFDcEIsV0FBSzFCLHNCQUFMLENBQTRCNEIsT0FBNUI7QUFDQSxXQUFLbkMsb0JBQUwsQ0FBMEJvQyxLQUExQjtBQUNBLFdBQUtDLGFBQUw7QUFDSDtBQUdEO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7V0FDSSxxQ0FBb0NDLEdBQXBDLEVBQTBEO0FBQ3RELFVBQUksUUFBT0EsR0FBUCxNQUFlLFFBQW5CLEVBQTZCO0FBQ3pCQSxRQUFBQSxHQUFHLEdBQUdDLElBQUksQ0FBQ0MsU0FBTCxDQUFlRixHQUFmLENBQU47QUFDSDs7QUFDRCxVQUFJO0FBQ0EsWUFBTUcsR0FBRyxHQUFHRixJQUFJLENBQUNHLEtBQUwsQ0FBV0osR0FBWCxDQUFaLENBREEsQ0FFQTs7QUFDQSxZQUFJRyxHQUFHLENBQUNFLEdBQUosSUFBV0YsR0FBWCxhQUFXQSxHQUFYLGVBQVdBLEdBQUcsQ0FBRUcsSUFBTCxDQUFVLG9CQUFWLENBQVgsSUFBOEMsQ0FBQ0gsR0FBRyxDQUFDckQsT0FBdkQsRUFBZ0U7QUFDNURxRCxVQUFBQSxHQUFHLENBQUNyRCxPQUFKLEdBQWNxRCxHQUFHLENBQUNFLEdBQWxCO0FBQ0FGLFVBQUFBLEdBQUcsQ0FBQ3RELEtBQUosR0FBWSxNQUFaO0FBQ0EsaUJBQU9zRCxHQUFHLENBQUNFLEdBQVg7QUFDSDs7QUFDRCxZQUFJRixHQUFHLElBQUksUUFBT0EsR0FBUCxNQUFlLFFBQTFCLEVBQW9DO0FBQ2hDLGNBQUlBLEdBQUcsQ0FBQ3JELE9BQUosSUFBZXFELEdBQUcsQ0FBQ3RELEtBQXZCLEVBQThCO0FBRTFCLG1CQUFPc0QsR0FBUDtBQUNIO0FBQ0o7QUFDSixPQWRELENBY0UsT0FBT0ksR0FBUCxFQUFZLENBQUc7O0FBQ2pCLGFBQU8sS0FBUDtBQUNIO0FBRUQ7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztXQUNJLGdCQUFlN0QsR0FBZixFQUF5QjhELFFBQXpCLEVBQTZEO0FBQ3pELFVBQU1DLFFBQVEsR0FBRyxLQUFLQywyQkFBTCxDQUFpQ2hFLEdBQWpDLENBQWpCOztBQUNBLFVBQUcrRCxRQUFILEVBQWE7QUFDVCxhQUFLRSxnQkFBTCxDQUFzQkYsUUFBdEI7QUFDSCxPQUZELE1BRU87QUFDSCxhQUFLRyxrQkFBTCxDQUF3QmxFLEdBQXhCO0FBQ0g7O0FBRUQsVUFBSSxLQUFLbUUsNkJBQUwsRUFBSixFQUEwQztBQUN0QyxhQUFLQyxjQUFMO0FBQ0g7O0FBRUQsVUFBSUwsUUFBSixFQUFjL0QsR0FBRyxHQUFHdUQsSUFBSSxDQUFDQyxTQUFMLENBQWV4RCxHQUFmLElBQW9CLElBQTFCOztBQUVkLFVBQUkrRCxRQUFRLFNBQVIsSUFBQUEsUUFBUSxXQUFSLElBQUFBLFFBQVEsQ0FBRTNELE9BQVYsSUFBcUIsQ0FBQTJELFFBQVEsU0FBUixJQUFBQSxRQUFRLFdBQVIsWUFBQUEsUUFBUSxDQUFFNUQsS0FBVixNQUFvQixPQUE3QyxFQUFzRDtBQUNsRCxhQUFLb0Isc0JBQUwsQ0FBNEI4QyxZQUE1QixDQUF5Q3JFLEdBQXpDO0FBQ0gsT0FGRCxNQUVPLElBQUcrRCxRQUFRLENBQUMzRCxPQUFaLEVBQXFCO0FBQ3hCLGFBQUttQixzQkFBTCxDQUE0QitDLFlBQTVCLENBQXlDdEUsR0FBekM7QUFDSDs7QUFFRCxVQUFJOEQsUUFBSixFQUFjQSxRQUFRO0FBQ3pCO0FBRUQ7QUFDSjtBQUNBO0FBQ0E7QUFDQTs7OztXQUNJLDBCQUFpQjlELEdBQWpCLEVBQTJCO0FBQ3ZCLFdBQUt1RSxZQUFMLENBQWtCdkUsR0FBbEI7QUFDQSxVQUFNd0UsU0FBUyxHQUFHakIsSUFBSSxDQUFDQyxTQUFMLENBQWV4RCxHQUFmLENBQWxCO0FBQ0EsVUFBTXlFLE1BQU0sR0FBR0MsTUFBTSxDQUFDQyxVQUFQLENBQWtCSCxTQUFsQixDQUFmO0FBQ0EsV0FBS0ksUUFBTCxDQUFjdkUsSUFBZCxDQUFtQkwsR0FBbkI7QUFDQSxXQUFLNkUsY0FBTCxDQUFvQnhFLElBQXBCLENBQXlCb0UsTUFBekI7QUFDQSxXQUFLSyxnQkFBTCxJQUF5QkwsTUFBekI7QUFDSDtBQUVEO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7Ozs7V0FDSSw0QkFBbUJ6RSxHQUFuQixFQUFnQztBQUM1QixVQUFJLE9BQU9BLEdBQVAsS0FBZSxRQUFmLElBQTJCQSxHQUFHLENBQUMrRSxRQUFKLENBQWEsSUFBYixDQUEvQixFQUFtRDtBQUMvQy9FLFFBQUFBLEdBQUcsR0FBR0EsR0FBRyxDQUFDZ0YsU0FBSixDQUFjLENBQWQsRUFBaUJoRixHQUFHLENBQUN5RSxNQUFKLEdBQWEsQ0FBOUIsQ0FBTjtBQUNIOztBQUVELFVBQU1RLGdCQUFnQixHQUFHQyxxQkFBU0Msa0JBQVQsRUFBekI7O0FBQ0EsVUFBTUMsYUFBYSxHQUFHO0FBQ2xCaEYsUUFBQUEsT0FBTyxFQUFFSixHQURTO0FBRWxCcUYsUUFBQUEsU0FBUyxFQUFFQyxJQUFJLENBQUNDLEdBQUwsRUFGTztBQUdsQkMsUUFBQUEsa0JBQWtCLEVBQUUsSUFBSUYsSUFBSixHQUFXRyxXQUFYLEVBSEY7QUFJbEIsdUJBQWVSLGdCQUFnQixDQUFDLGFBQUQsQ0FKYjtBQUtsQix1QkFBZUEsZ0JBQWdCLENBQUMsYUFBRCxDQUxiO0FBTWxCUyxRQUFBQSxRQUFRLEVBQUVULGdCQUFnQixDQUFDUztBQU5ULE9BQXRCO0FBU0EsVUFBTUMsYUFBYSxHQUFHcEMsSUFBSSxDQUFDQyxTQUFMLENBQWU0QixhQUFmLENBQXRCO0FBQ0EsVUFBTVgsTUFBTSxHQUFHQyxNQUFNLENBQUNDLFVBQVAsQ0FBa0JnQixhQUFsQixDQUFmO0FBQ0EsV0FBS2YsUUFBTCxDQUFjdkUsSUFBZCxDQUFtQitFLGFBQW5CO0FBQ0EsV0FBS1AsY0FBTCxDQUFvQnhFLElBQXBCLENBQXlCb0UsTUFBekI7QUFDQSxXQUFLSyxnQkFBTCxJQUF5QkwsTUFBekI7QUFDSDtBQUVEO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O1dBQ0ksNkJBQW9CbUIsVUFBcEIsRUFBeUQ7QUFDckQsV0FBS0MsZ0JBQUwsR0FBd0JELFVBQXhCO0FBQ0g7QUFFRDtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7V0FDSSx5QkFBd0I7QUFDcEIsVUFBTUUsV0FBVyxHQUFHLEtBQUtDLFNBQUwsRUFBcEI7QUFDQTdGLE1BQUFBLFdBQVcsQ0FBQyxPQUFELDJDQUE0QzRGLFdBQVcsQ0FBQ3JCLE1BQXhELHVCQUFYO0FBQ0EsVUFBTXVCLFVBQVUsR0FBRyxLQUFLQyxnQkFBTCxDQUFzQkgsV0FBdEIsQ0FBbkI7O0FBQ0EsVUFBTUksaUJBQWlCLEdBQUdDLGlCQUFLQyxRQUFMLENBQWNKLFVBQWQsQ0FBMUI7O0FBQ0EsVUFBSSxDQUFDLEtBQUtLLFNBQVYsRUFBcUI7QUFDakIsYUFBS0MsUUFBTCxDQUFjSixpQkFBZDtBQUNILE9BRkQsTUFFTztBQUNILGFBQUtLLHFCQUFMLENBQTJCTCxpQkFBM0I7QUFDSDtBQUNKOzs7V0FFRCwrQkFBNkJNLE1BQTdCLEVBQTZDO0FBQ3pDQyxxQkFBR0MsYUFBSCxnQkFBeUIsS0FBS0MsV0FBTCxFQUF6QixVQUFrREgsTUFBbEQ7QUFDSDs7OztvRkFFRDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFDVVYsZ0JBQUFBLFdBRFYsR0FDd0IsS0FBS0MsU0FBTCxFQUR4QjtBQUdJN0YsZ0JBQUFBLFdBQVcsQ0FBQyxPQUFELHFDQUFzQzRGLFdBQVcsQ0FBQ3JCLE1BQWxELHVCQUFYO0FBQ011QixnQkFBQUEsVUFKVixHQUl1QixLQUFLQyxnQkFBTCxDQUFzQkgsV0FBdEIsQ0FKdkI7QUFBQTtBQUFBO0FBQUEsdUJBTWdELEtBQUtjLGVBQUwsQ0FBcUJaLFVBQXJCLENBTmhEOztBQUFBO0FBTWNFLGdCQUFBQSxpQkFOZDs7QUFPUSxvQkFBSSxDQUFDLEtBQUtHLFNBQVYsRUFBcUI7QUFDakIsdUJBQUtDLFFBQUwsQ0FBY0osaUJBQWQ7QUFDSCxpQkFGRCxNQUVPO0FBQ0gsdUJBQUtLLHFCQUFMLENBQTJCTCxpQkFBM0I7QUFDSDs7QUFYVDtBQUFBOztBQUFBO0FBQUE7QUFBQTtBQWFjVyxnQkFBQUEsZUFiZCxHQWFnQyxvRUFiaEM7QUFjY3pHLGdCQUFBQSxPQWRkLEdBY3dCLHVCQUFlMEcsS0FBZixJQUF3QixZQUFJQyxLQUE1QixHQUFvQyxZQUFJQSxLQUF4QyxHQUFnREYsZUFkeEU7QUFlUTNHLGdCQUFBQSxXQUFXLENBQUMsT0FBRCxFQUFVRSxPQUFWLENBQVg7O0FBZlI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsTzs7Ozs7Ozs7QUFtQkE7QUFDSjtBQUNBO0FBQ0E7QUFDQTs7OztXQUNJLGtCQUFpQjhGLGlCQUFqQixFQUE0QztBQUN4Q2Msd0JBQU1DLElBQU4sbUJBQXNCM0gsWUFBdEIsU0FBcUNJLFFBQXJDLEdBQWlEd0csaUJBQWpELEVBQW9FO0FBQ2hFZ0IsUUFBQUEsT0FBTyxFQUFFO0FBQ0wsb0JBQVUsS0FETDtBQUVMLHFCQUFXM0gsT0FBTyxDQUFDQyxHQUFSLENBQVkySCxxQkFGbEI7QUFHTCw4QkFBb0IsTUFIZjtBQUlMLDRCQUFrQixLQUFHakIsaUJBQWlCLENBQUN2QixVQUpsQztBQUtMLDBCQUFnQjtBQUxYO0FBRHVELE9BQXBFLEVBUUd5QyxJQVJILENBUVEsVUFBQUMsUUFBUSxFQUFJO0FBQ2hCLFlBQUksQ0FBQyxHQUFELEVBQU0sR0FBTixFQUFXQyxRQUFYLENBQW9CRCxRQUFRLENBQUNFLE1BQTdCLENBQUosRUFBMEM7QUFDdENySCxVQUFBQSxXQUFXLENBQUMsT0FBRCwrREFBZ0VtSCxRQUFRLENBQUNHLElBQVQsQ0FBY0MsU0FBOUUsRUFBWDtBQUNILFNBRkQsTUFFTztBQUNIdkgsVUFBQUEsV0FBVyxDQUFDLE1BQUQsZ0VBQWdFbUgsUUFBUSxDQUFDRSxNQUF6RSxFQUFYO0FBQ0g7QUFFSixPQWZELFdBZVMsVUFBQTFELEdBQUcsRUFBSTtBQUNaM0QsUUFBQUEsV0FBVyxDQUFDLE9BQUQsRUFBVSx3Q0FBVixDQUFYO0FBQ0FBLFFBQUFBLFdBQVcsQ0FBQyxPQUFELEVBQVUyRCxHQUFHLENBQUNrRCxLQUFkLENBQVg7QUFDSCxPQWxCRDtBQW1CSDtBQUVEO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O1dBQ0ksMEJBQXlCVyxJQUF6QixFQUE4QztBQUMxQyxVQUFNQyxPQUFPLEdBQUcsQ0FBQztBQUNiQyxRQUFBQSxNQUFNLEVBQUU7QUFDSmhDLFVBQUFBLFVBQVUsa0NBQ0gsS0FBS0MsZ0JBREY7QUFFTmdDLFlBQUFBLE9BQU8sRUFBRSxLQUFLOUUsUUFGUjtBQUdOK0UsWUFBQUEsT0FBTyxFQUFFLEtBQUtoRixZQUhSO0FBSU5pRixZQUFBQSxNQUFNLEVBQUUsS0FBS3BGLFdBSlA7QUFLTnFGLFlBQUFBLFdBQVcsRUFBRSxLQUFLbkYsZ0JBTFo7QUFNTm9GLFlBQUFBLFVBQVUsRUFBRS9DLHFCQUFTQyxrQkFBVCxHQUE4QixhQUE5QjtBQU5OO0FBRE4sU0FESztBQVdidUMsUUFBQUEsSUFBSSxFQUFFQTtBQVhPLE9BQUQsQ0FBaEI7QUFhQSxhQUFPbkUsSUFBSSxDQUFDQyxTQUFMLENBQWVtRSxPQUFmLENBQVA7QUFDSDtBQUVEO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7Ozs7O3FGQUNJLGtCQUE4QjNCLFVBQTlCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxrREFDVyxJQUFJa0MsT0FBSixDQUFvQixVQUFDQyxPQUFELEVBQVVDLE1BQVYsRUFBcUI7QUFDNUNqQyxtQ0FBS2tDLElBQUwsQ0FBVTNELE1BQU0sQ0FBQzRELElBQVAsQ0FBWXRDLFVBQVosRUFBd0IsTUFBeEIsQ0FBVixFQUEyQyxVQUFDbkMsR0FBRCxFQUFNcUMsaUJBQU4sRUFBNEI7QUFDbkUsd0JBQUlyQyxHQUFKLEVBQVN1RSxNQUFNLENBQUN2RSxHQUFELENBQU47QUFDVHNFLG9CQUFBQSxPQUFPLENBQUNqQyxpQkFBRCxDQUFQO0FBQ0gsbUJBSEQ7QUFJSCxpQkFMTSxDQURYOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE87Ozs7Ozs7O0FBU0E7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7V0FDSSxxQkFBb0I7QUFDaEIsVUFBSXFDLFVBQUosQ0FEZ0IsQ0FHaEI7O0FBQ0EsVUFBSSxLQUFLekQsZ0JBQUwsR0FBd0JsRixnQkFBNUIsRUFBOEM7QUFBQSxtQkFDWixDQUFDLEtBQUtnRixRQUFOLEVBQWdCLEVBQWhCLENBRFk7QUFDekMyRCxRQUFBQSxVQUR5QztBQUM3QixhQUFLM0QsUUFEd0I7QUFFMUMsYUFBS0MsY0FBTCxHQUFzQixFQUF0QjtBQUNBLGFBQUtDLGdCQUFMLEdBQXdCLENBQXhCO0FBQ0EsZUFBT3lELFVBQVA7QUFDSCxPQVRlLENBV2hCOzs7QUFDQSxVQUFJQyxPQUFPLEdBQUcsQ0FBZDtBQUNBLFVBQUlDLGFBQWEsR0FBRyxDQUFwQjs7QUFFQSxhQUFPLEtBQUs3RCxRQUFMLENBQWNILE1BQWQsR0FBdUIsQ0FBeEIsSUFBK0IrRCxPQUFPLEdBQUcsS0FBSzNELGNBQUwsQ0FBb0IsQ0FBcEIsQ0FBVixHQUFtQ2pGLGdCQUF4RSxFQUEyRjtBQUN2RjZJLFFBQUFBLGFBQWE7QUFDaEI7O0FBRURGLE1BQUFBLFVBQVUsR0FBRyxLQUFLM0QsUUFBTCxDQUFjOEQsS0FBZCxDQUFvQixDQUFwQixFQUF1QkQsYUFBdkIsQ0FBYjtBQUNBLFdBQUs3RCxRQUFMLEdBQWdCLEtBQUtBLFFBQUwsQ0FBYzhELEtBQWQsQ0FBb0JELGFBQXBCLENBQWhCO0FBQ0EsV0FBSzVELGNBQUwsR0FBc0IsS0FBS0EsY0FBTCxDQUFvQjZELEtBQXBCLENBQTBCRCxhQUExQixDQUF0QjtBQUVBLGFBQU9GLFVBQVA7QUFDSDtBQUVEO0FBQ0o7QUFDQTtBQUNBOzs7O1dBQ0kseUNBQWlEO0FBQzdDLFVBQUksS0FBS0ksbUJBQUwsSUFBNEIsS0FBSy9ELFFBQUwsQ0FBY0gsTUFBZCxJQUF3QixLQUFLMUQsTUFBTCxDQUFZSCxrQkFBWixJQUFrQyxHQUExRCxDQUFoQyxFQUFnRztBQUM1RixlQUFPLElBQVA7QUFDSCxPQUg0QyxDQUs3Qzs7O0FBQ0EsVUFBSSxLQUFLZ0UsUUFBTCxDQUFjSCxNQUFkLEdBQXVCLEdBQTNCLEVBQWdDO0FBQzVCLGVBQU8sSUFBUDtBQUNIOztBQUNELGFBQU8sS0FBUDtBQUNIO0FBRUQ7QUFDSjtBQUNBO0FBQ0E7Ozs7V0FDSSxpQ0FBeUM7QUFDckMsYUFBTyxLQUFLbUUsbUJBQUwsRUFBUDtBQUNIO0FBRUQ7QUFDSjtBQUNBO0FBQ0E7QUFDQTs7OztXQUNJLCtCQUF1QztBQUNuQyxhQUFPLENBQUMsRUFBRSxLQUFLN0gsTUFBTCxDQUFZTCxXQUFaLElBQTRCLEtBQUtrRSxRQUFMLENBQWNILE1BQWQsR0FBdUIsS0FBSzFELE1BQUwsQ0FBWUwsV0FBakUsQ0FBUjtBQUNIO0FBRUQ7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O1dBQ0ksc0JBQXFCVixHQUFyQixFQUErQjtBQUMzQixVQUFJNkksTUFBTSxDQUFDQyxtQkFBUCxDQUEyQjlJLEdBQTNCLEVBQWdDeUUsTUFBaEMsR0FBeUM1RSx3QkFBN0MsRUFBdUU7QUFDbkVLLFFBQUFBLFdBQVcsQ0FBQyxNQUFELHlDQUF5QzJJLE1BQU0sQ0FBQ0MsbUJBQVAsQ0FBMkI5SSxHQUEzQixDQUF6QyxnQkFBOEVILHdCQUE5RSxrQkFBWDtBQUNIOztBQUVELHVDQUFnQmdKLE1BQU0sQ0FBQ0UsSUFBUCxDQUFZL0ksR0FBWixDQUFoQixvQ0FBa0M7QUFBN0IsWUFBSWdKLElBQUcsb0JBQVA7QUFDRCxZQUFNekcsS0FBSyxHQUFHdkMsR0FBRyxDQUFDZ0osSUFBRCxDQUFqQixDQUQ4QixDQUU5Qjs7QUFDQSxZQUFJQSxJQUFHLENBQUN2RSxNQUFKLEdBQWEzRSx5QkFBakIsRUFBNEM7QUFDeEMsY0FBTW1KLE1BQU0sR0FBR0QsSUFBRyxDQUFDTixLQUFKLENBQVUsQ0FBVixFQUFhNUkseUJBQWIsQ0FBZjs7QUFDQStJLFVBQUFBLE1BQU0sQ0FBQ0ssY0FBUCxDQUFzQmxKLEdBQXRCLEVBQTJCZ0osSUFBRyxDQUFDTixLQUFKLENBQVUsQ0FBVixFQUFhNUkseUJBQWIsQ0FBM0IsRUFDSStJLE1BQU0sQ0FBQ00sd0JBQVAsQ0FBZ0NuSixHQUFoQyxFQUFxQ2dKLElBQXJDLENBREo7QUFFQSxpQkFBT2hKLEdBQUcsQ0FBQ2dKLEdBQVgsQ0FKd0MsQ0FNeEM7O0FBQ0FBLFVBQUFBLElBQUcsR0FBR0MsTUFBTjtBQUNILFNBWDZCLENBYTlCOzs7QUFDQSxZQUFJLE9BQU8xRyxLQUFQLEtBQWlCLFFBQWpCLElBQTZCQSxLQUFLLENBQUNrQyxNQUFOLEdBQWUxRSwwQkFBaEQsRUFBNEU7QUFBQTs7QUFDeEUsOEJBQUksS0FBS2dCLE1BQVQseUNBQUksYUFBYVAsNkJBQWpCLEVBQWdEO0FBQzVDTixZQUFBQSxXQUFXLENBQUMsTUFBRCxzREFBc0RxQyxLQUFLLENBQUNrQyxNQUE1RCxjQUFzRTFFLDBCQUF0RSxFQUFYO0FBQ0g7O0FBQ0RDLFVBQUFBLEdBQUcsQ0FBQ2dKLEdBQUosR0FBVXpHLEtBQUssQ0FBQ21HLEtBQU4sQ0FBWSxDQUFaLEVBQWUzSSwwQkFBZixDQUFWO0FBQ0g7O0FBRUQsWUFBSWlKLElBQUcsQ0FBQzFCLFFBQUosQ0FBYSxHQUFiLENBQUosRUFBdUI7QUFDbkIsY0FBTTJCLE9BQU0sR0FBR0QsSUFBRyxDQUFDSSxVQUFKLENBQWUsR0FBZixFQUFvQixHQUFwQixDQUFmOztBQUNBUCxVQUFBQSxNQUFNLENBQUNLLGNBQVAsQ0FBc0JsSixHQUF0QixFQUEyQmdKLElBQUcsQ0FBQ04sS0FBSixDQUFVLENBQVYsRUFBYTVJLHlCQUFiLENBQTNCLEVBQ0krSSxNQUFNLENBQUNNLHdCQUFQLENBQWdDbkosR0FBaEMsRUFBcUNnSixJQUFyQyxDQURKO0FBRUEsaUJBQU9oSixHQUFHLENBQUNnSixHQUFYLENBSm1CLENBTW5COztBQUNBQSxVQUFBQSxJQUFHLEdBQUdDLE9BQU47QUFDSDs7QUFBQTtBQUNKO0FBQ0o7QUFFRDtBQUNKO0FBQ0E7Ozs7V0FDSSxpQ0FBZ0M7QUFBQTs7QUFDNUIsV0FBS2hHLFNBQUwsR0FBaUJvRyxVQUFVLHVFQUFDO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxzQkFDcEIsTUFBSSxDQUFDekUsUUFBTCxDQUFjSCxNQUFkLElBQXdCLE1BQUksQ0FBQzFELE1BQUwsQ0FBWUwsV0FBWixJQUEyQixDQUFuRCxDQURvQjtBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBLHVCQUVkLE1BQUksQ0FBQzBELGNBQUwsRUFGYzs7QUFBQTtBQUdwQixnQkFBQSxNQUFJLENBQUMxQyxxQkFBTDs7QUFIb0I7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsT0FBRCxJQUt4QixLQUFLWCxNQUFMLENBQVlKLGdCQUxZLENBQTNCO0FBTUg7QUFFRDtBQUNKO0FBQ0E7QUFDQTtBQUNBOzs7O1dBQ0ksbUNBQWtDO0FBQUE7O0FBQzlCLFVBQUkySSxZQUFZLEdBQUcsS0FBbkI7QUFDQS9KLE1BQUFBLE9BQU8sQ0FBQ2dLLEVBQVIsQ0FBVyxNQUFYLEVBQW1CLFlBQU07QUFDckIsWUFBSSxNQUFJLENBQUN0RyxTQUFULEVBQW9CQyxZQUFZLENBQUMsTUFBSSxDQUFDRCxTQUFOLENBQVo7QUFDcEIsWUFBSXVHLENBQUMsR0FBR0YsWUFBUjtBQUNBQSxRQUFBQSxZQUFZLEdBQUcsSUFBZjtBQUNBLFlBQUlFLENBQUosRUFBTztBQUVQdEosUUFBQUEsV0FBVyxDQUFDLE1BQUQsRUFBUyxvQkFBVCxDQUFYOztBQUVBLFFBQUEsTUFBSSxDQUFDbUQsYUFBTDtBQUNILE9BVEQ7QUFXQTlELE1BQUFBLE9BQU8sQ0FBQ2dLLEVBQVIsQ0FBVyxRQUFYLEVBQXFCLFlBQU07QUFDdkJoSyxRQUFBQSxPQUFPLENBQUNrSyxJQUFSLENBQWEsQ0FBYjtBQUNILE9BRkQ7QUFJQWxLLE1BQUFBLE9BQU8sQ0FBQ2dLLEVBQVIsQ0FBVyxtQkFBWCxFQUFnQyxVQUFDRyxDQUFELEVBQU87QUFDbkNDLFFBQUFBLE9BQU8sQ0FBQzNKLEdBQVIsQ0FBWTBKLENBQVo7QUFDQXhKLFFBQUFBLFdBQVcsQ0FBQyxPQUFELEVBQVV3SixDQUFDLENBQUMzQyxLQUFGLElBQVcsRUFBckIsQ0FBWDtBQUNILE9BSEQ7QUFLQXhILE1BQUFBLE9BQU8sQ0FBQ2dLLEVBQVIsQ0FBVyxTQUFYLEVBQXNCLFlBQU07QUFDeEIsWUFBSSxNQUFJLENBQUN0RyxTQUFULEVBQW9CQyxZQUFZLENBQUMsTUFBSSxDQUFDRCxTQUFOLENBQVo7O0FBQ3BCLFFBQUEsTUFBSSxDQUFDSSxhQUFMO0FBQ0gsT0FIRDtBQUlIO0FBRUQ7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O1dBQ0ksa0RBQWlEO0FBQUE7O0FBQzdDLFVBQU11RyxrQ0FBa0MsR0FBR0MsV0FBVyxDQUFDLFlBQU07QUFDekQsWUFBTUMsUUFBUSxHQUFHNUUscUJBQVNDLGtCQUFULEVBQWpCOztBQUNBLFlBQUkyRSxRQUFRLENBQUMsYUFBRCxDQUFaLEVBQTZCO0FBQ3pCLFVBQUEsTUFBSSxDQUFDbkIsbUJBQUwsR0FBMkIsSUFBM0I7QUFDQXpJLFVBQUFBLFdBQVcsQ0FBQyxNQUFELEVBQVMscURBQVQsQ0FBWDtBQUNBNkosVUFBQUEsYUFBYSxDQUFDSCxrQ0FBRCxDQUFiO0FBQ0g7QUFDSixPQVBxRCxFQU9uRCxHQVBtRCxDQUF0RDtBQVFIOzs7O0FBaGhCRDtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDSSwwQkFBMkI7QUFDdkIsVUFBSSxDQUFDckssT0FBTyxDQUFDQyxHQUFSLENBQVkySCxxQkFBakIsRUFBd0M7QUFDeEN0RyxNQUFBQSx3QkFBd0IsQ0FBQ21KLFFBQXpCLEdBQW9DLElBQUluSix3QkFBSixFQUFwQztBQUNBLGFBQU9BLHdCQUF3QixDQUFDbUosUUFBaEM7QUFDSDs7O1dBRUQsdUJBQTRCO0FBQ3hCLGFBQU9uSix3QkFBUCxhQUFPQSx3QkFBUCx1QkFBT0Esd0JBQXdCLENBQUVtSixRQUFqQztBQUNIOzs7V0FFRCxtQkFBd0JqSixNQUF4QixFQUFnRTtBQUM1RCxVQUFNaUosUUFBUSxHQUFHbkosd0JBQXdCLENBQUNtSixRQUExQzs7QUFDQSxVQUFJLENBQUNBLFFBQUwsRUFBZTtBQUNYOUosUUFBQUEsV0FBVyxDQUFDLE1BQUQsRUFBUyw0RUFBVCxDQUFYO0FBQ0E7QUFDSDs7QUFDRDhKLE1BQUFBLFFBQVEsQ0FBQ2pKLE1BQVQsbUNBQ09pSixRQUFRLENBQUNqSixNQURoQixHQUVPQSxNQUZQO0FBSUg7OztXQUVELCtCQUFvQztBQUFBOztBQUNoQyxhQUFPRix3QkFBUCxhQUFPQSx3QkFBUCxnREFBT0Esd0JBQXdCLENBQUVtSixRQUFqQywwREFBTyxzQkFBb0N6RixZQUEzQztBQUNIOzs7OztBQXFmTDtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztnQkE5aEJhMUQsd0I7O0lBK2hCUFcsc0I7QUFZRixrQ0FBWXlJLFFBQVosRUFBOENDLFFBQTlDLEVBQWdGO0FBQUE7O0FBQUE7O0FBQUEsc0NBVHBELElBQUlDLG1CQUFKLEVBU29EOztBQUFBLHNDQVJwRCxJQUFJQSxtQkFBSixFQVFvRDs7QUFBQTs7QUFBQTs7QUFBQTs7QUFBQTs7QUFDNUU7QUFDQSxTQUFLQyxNQUFMLEdBQWM3SyxPQUFPLENBQUM2SyxNQUFSLENBQWVDLEtBQTdCO0FBQ0EsU0FBS0MsTUFBTCxHQUFjL0ssT0FBTyxDQUFDK0ssTUFBUixDQUFlRCxLQUE3QixDQUg0RSxDQUs1RTs7QUFDQSxTQUFLRSxXQUFMLEdBQW1CLFVBQUMvQyxJQUFEO0FBQUEsYUFBa0IsTUFBSSxDQUFDNEMsTUFBTCxDQUFZSSxJQUFaLENBQWlCakwsT0FBTyxDQUFDNkssTUFBekIsRUFBaUM1QyxJQUFqQyxDQUFsQjtBQUFBLEtBQW5COztBQUNBLFNBQUtpRCxXQUFMLEdBQW1CLFVBQUNqRCxJQUFEO0FBQUEsYUFBa0IsTUFBSSxDQUFDOEMsTUFBTCxDQUFZRSxJQUFaLENBQWlCakwsT0FBTyxDQUFDK0ssTUFBekIsRUFBaUM5QyxJQUFqQyxDQUFsQjtBQUFBLEtBQW5CLENBUDRFLENBUzVFOzs7QUFDQSxTQUFLa0QsUUFBTCxDQUFjbkIsRUFBZCxDQUFpQixNQUFqQixFQUF5QixVQUFDL0IsSUFBRCxFQUFVO0FBQy9CLFVBQUlBLElBQUksWUFBWTlDLE1BQXBCLEVBQTRCO0FBQ3hCOEMsUUFBQUEsSUFBSSxHQUFHQSxJQUFJLENBQUNtRCxRQUFMLENBQWMsTUFBZCxDQUFQO0FBQ0g7O0FBQ0RWLE1BQUFBLFFBQVEsQ0FBQ3pDLElBQUQsQ0FBUjs7QUFDQSxNQUFBLE1BQUksQ0FBQytDLFdBQUwsQ0FBaUIvQyxJQUFqQjtBQUNILEtBTkQ7QUFRQSxTQUFLb0QsUUFBTCxDQUFjckIsRUFBZCxDQUFpQixNQUFqQixFQUF5QixVQUFDL0IsSUFBRCxFQUFVO0FBQy9CLFVBQUlBLElBQUksWUFBWTlDLE1BQXBCLEVBQTRCO0FBQ3hCOEMsUUFBQUEsSUFBSSxHQUFHQSxJQUFJLENBQUNtRCxRQUFMLENBQWMsTUFBZCxDQUFQO0FBQ0g7O0FBQ0RULE1BQUFBLFFBQVEsQ0FBQzFDLElBQUQsQ0FBUjs7QUFDQSxNQUFBLE1BQUksQ0FBQ2lELFdBQUwsQ0FBaUJqRCxJQUFqQjtBQUNILEtBTkQsRUFsQjRFLENBMEI1RTs7QUFDQWpJLElBQUFBLE9BQU8sQ0FBQzZLLE1BQVIsQ0FBZUMsS0FBZixHQUF1QixLQUFLSyxRQUFMLENBQWNMLEtBQWQsQ0FBb0JRLElBQXBCLENBQXlCLEtBQUtILFFBQTlCLENBQXZCO0FBQ0FuTCxJQUFBQSxPQUFPLENBQUMrSyxNQUFSLENBQWVELEtBQWYsR0FBdUIsS0FBS08sUUFBTCxDQUFjUCxLQUFkLENBQW9CUSxJQUFwQixDQUF5QixLQUFLRCxRQUE5QixDQUF2QixDQTVCNEUsQ0E4QjVFOztBQUNBckwsSUFBQUEsT0FBTyxDQUFDZ0ssRUFBUixDQUFXLG1CQUFYLEVBQWdDLFVBQUMxRixHQUFELEVBQVM7QUFDckM4RixNQUFBQSxPQUFPLENBQUNtQixLQUFSLENBQWNqSCxHQUFkO0FBQ0EsWUFBTUEsR0FBTjtBQUNILEtBSEQ7QUFJSDtBQUVEO0FBQ0o7QUFDQTtBQUNBOzs7OztXQUNJLG1CQUFpQjtBQUNidEUsTUFBQUEsT0FBTyxDQUFDNkssTUFBUixDQUFlQyxLQUFmLEdBQXVCLEtBQUtELE1BQTVCO0FBQ0E3SyxNQUFBQSxPQUFPLENBQUMrSyxNQUFSLENBQWVELEtBQWYsR0FBdUIsS0FBS0MsTUFBNUI7QUFFQSxXQUFLSSxRQUFMLENBQWN2SCxPQUFkO0FBQ0EsV0FBS3lILFFBQUwsQ0FBY3pILE9BQWQ7QUFDSDtBQUVEO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7Ozs7V0FDSSxzQkFBb0JxRSxJQUFwQixFQUEyQztBQUN2QyxVQUFJQSxJQUFJLFlBQVlxQixNQUFwQixFQUE0QjtBQUN4QnJCLFFBQUFBLElBQUksR0FBR2pFLElBQUksQ0FBQ0MsU0FBTCxDQUFlZ0UsSUFBZixDQUFQO0FBQ0g7O0FBQ0QsV0FBSytDLFdBQUwsQ0FBa0IvQyxJQUFsQjtBQUNIO0FBRUQ7QUFDSjtBQUNBO0FBQ0E7QUFDQTs7OztXQUNJLHNCQUFvQkEsSUFBcEIsRUFBa0M7QUFDOUIsV0FBS2lELFdBQUwsQ0FBaUJqRCxJQUFqQjtBQUNIOzs7OztBQUlMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUNBLHdEQUFDO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsbURBQ3VDLFVBRHZDO0FBQUE7O0FBQUE7QUFBQTtBQUNXdUQsVUFBQUEsVUFEWCxpQkFDV0EsVUFEWDtBQUVTNUssVUFBQUEsS0FGVCxHQUVtQ1osT0FBTyxDQUFDQyxHQUFSLENBQVl3TCx3QkFBWixJQUE0RCxNQUYvRjtBQUdHaEwsVUFBQUEsR0FBRyxHQUFHK0ssVUFBVSxDQUFDLHNCQUFELEVBQXlCNUssS0FBekIsQ0FBaEI7O0FBQ0EsaUJBQU1GLGlCQUFpQixDQUFDd0UsTUFBeEIsRUFBZ0M7QUFBQSxvQkFDSHhFLGlCQUFpQixDQUFDZ0wsS0FBbEIsRUFERyxvQ0FDckI5SyxNQURxQixhQUNkQyxPQURjOztBQUUzQkosWUFBQUEsR0FBRCxDQUFhRyxNQUFiLEVBQW9CQyxPQUFwQjtBQUNIOztBQVBKO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLENBQUQiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IG5ld3JlbGljIGZyb20gJ25ld3JlbGljJztcbmltcG9ydCB6bGliIGZyb20gJ3psaWInO1xuaW1wb3J0IHsgTmV3UmVsaWNMb2dUcmFuc3BvcnQgfSBmcm9tICcuL05ld1JlbGljTG9nVHJhbnNwb3J0JztcbmltcG9ydCB7IFBhc3NUaHJvdWdoIH0gZnJvbSAnc3RyZWFtJztcbmltcG9ydCB7IExvZ2dlciB9IGZyb20gJ3dpbnN0b24nO1xuaW1wb3J0IHsgTlBNTG9nZ2luZ0xldmVscyB9IGZyb20gJy4vbG9nZ2VyJztcbmltcG9ydCBBeGlvcyBmcm9tICdheGlvcyc7XG5cbmNvbnN0IEFQSV9IT1NUTkFNRSA9IHByb2Nlc3MuZW52LktMX05SX0xPR19IT1NUTkFNRSB8fCAnbG9nLWFwaS5ldS5uZXdyZWxpYy5jb20nO1xuY29uc3QgQVBJX1BBVEggPSBwcm9jZXNzLmVudi5LTF9OUl9MT0dfUEFUSCB8fCAnL2xvZy92MSc7XG5jb25zdCBNQVhfUEFZTE9BRF9TSVpFID0gMTAqKjY7XG5jb25zdCBNQVhfQVRUUklCVVRFU19QRVJfRVZFTlQgPSAyNTU7XG5jb25zdCBNQVhfQVRUUklCVVRFX05BTUVfTEVOR1RIID0gMjU1O1xuY29uc3QgTUFYX0FUVFJJQlVURV9WQUxVRV9MRU5HVEggPSA0MDk2O1xuXG5sZXQgbG9nOiBMb2dnZXIgfCB1bmRlZmluZWQ7XG5sZXQgaW50ZXJuYWxMb2dCdWZmZXI6IEFycmF5PFtzdHJpbmcsIHN0cmluZ10+ID0gW107XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gd3JpdGUgbG9ncyB0aGF0IGFyZSBpbnRlcm5hbCB0byB0aGlzIG1vZHVsZS5cbiAqIEJ1ZmZlcnMgY2FsbHMgdW50aWwgdGhlIFdpbnN0b24gbG9nZ2VyIGNhbiBiZSBhc3luYyBpbXBvcnRkXG4gKiBBZnRlcndvcmRzLCB3cml0ZXMgbG9ncyBkaXJlY3RseSB0byB0aGUgbG9nZ2VyXG4gKiBAcGFyYW0gbGV2ZWwgXG4gKiBAcGFyYW0gbWVzc2FnZSBcbiAqL1xuZnVuY3Rpb24gaW50ZXJuYWxMb2cobGV2ZWw6IHN0cmluZywgbWVzc2FnZTogc3RyaW5nKSB7XG4gICAgaWYgKGxvZykge1xuICAgICAgICAobG9nIGFzIGFueSlbbGV2ZWxdKG1lc3NhZ2UpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGludGVybmFsTG9nQnVmZmVyLnB1c2goW2xldmVsLCBtZXNzYWdlXSk7XG4gICAgfVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIE5ld1JlbGljTG9nRGVsaXZlcnlBZ2VudENvbmZpZyB7XG4gICAgLyoqXG4gICAgICogSG93IGZyZXF1ZW50bHkgY2hlY2tzIHNob3VsZCBiZSBydW4gdG8gcHVzaCBsb2dzIHRvIE5SXG4gICAgICogRGVmYXVsdCBpcyAxMCBzZWNvbmRzXG4gICAgICovXG4gICAgIGxvZ1B1c2hGcmVxdWVuY3k/OiBudW1iZXI7XG5cbiAgICAgLyoqXG4gICAgICAqIE1pbmltdW0gbnVtYmVyIG9mIGxvZyBzdGF0ZW1lbnRzIHdyaXR0ZW4gYmVmb3JlIGxvZ3MgY2FuIGJlIHB1c2hlZCB0byBOUlxuICAgICAgKiBieSBwZXJpb2RpYyBsb2dnZXIuXG4gICAgICAqIERlZmF1bHQgaXMgMlxuICAgICAgKi9cbiAgICAgbWluTG9nSXRlbXM/OiBudW1iZXI7XG4gXG4gXG4gICAgIC8qKlxuICAgICAgKiBNaW5pbXVtIG51bWJlciBvZiBsb2cgc3RhdGVtZW50cyB0byBmb3JjZSBhbiBpbW1lZGlhdGUgcHVzaCB0byBOUi4gVXNlZFxuICAgICAgKiB0byBlbnN1cmUgdGhhdCB0aGUgbG9nZ2luZyBzeXN0ZW0gZG9lcyBub3QgZ2V0IGJhY2tlZCB1cCBpZiBhbW91bnQgYmVpbmdcbiAgICAgICogbG9nZ2VkIHN1cnBhc3NlcyB0aGUgYmFuZHdpZHRoIG9mIHRoZSBwZXJpb2RpYyBsb2dnZXIuXG4gICAgICAqIERlZmF1bHQgaXMgMTAwLlxuICAgICAgKi9cbiAgICAgbWluTG9nSXRlbXNUb0ZvcmNlPzogbnVtYmVyO1xuXG4gXG4gICAgIC8qKlxuICAgICAgKiBNaW5pbXVtIG51bWJlciBvZiBieXRlcyB3cml0dGVuIHRvIGNvbXByZXNzaW9uIHN0cmVhbSBiZWZvcmUgcHVzaGluZyB0byBOUlxuICAgICAgKi9cbiAgICAgbWluQnl0ZXNXcml0dGVuPzogbnVtYmVyO1xuIFxuICAgICAvKipcbiAgICAgICogVGhyZXNob2xkIGZvciBieXRlcyB3cml0dGVuIGF0IHdoaWNoIHBvaW50IGEgbmV3IHdyaXRlIHRvIE5SIHdpbGwgYmUgYXV0b21hdGljYWxseVxuICAgICAgKiB0cmlnZ2VyZWQuIERlZmF1bHRzIHRvICg0LzUgKiBNQVhfUEFZTE9BRF9TSVpFKVxuICAgICAgKi9cbiAgICAgYnl0ZXNXcml0dGVuVGhyZXNob2xkPzogbnVtYmVyO1xuIFxuICAgICAvKipcbiAgICAgICogUHJvZHVjZSBhIHdhcm5pbmcgd2hlbiBhdHRyaWJ1dGUgdmFsdWVzIG92ZXJmbG93IHRoZSBOUiBtYXhpbXVtIGxlbmd0aCBvZiA0MDk2LlxuICAgICAgKiBEZWZhdWx0IGlzIGZhbHNlLlxuICAgICAgKi9cbiAgICAgd2Fybk9uQXR0cmlidXRlTGVuZ3RoT3ZlcmZsb3c/OiBib29sZWFuO1xufVxuXG5jb25zdCBkZWZhdWx0Q29uZmlnOiBOZXdSZWxpY0xvZ0RlbGl2ZXJ5QWdlbnRDb25maWcgPSB7XG4gICAgYnl0ZXNXcml0dGVuVGhyZXNob2xkOiBNQVhfUEFZTE9BRF9TSVpFICogNCAvIDUsXG4gICAgd2Fybk9uQXR0cmlidXRlTGVuZ3RoT3ZlcmZsb3c6IGZhbHNlLFxuICAgIG1pbkJ5dGVzV3JpdHRlbjogTUFYX1BBWUxPQURfU0laRSAqIDEgLyA1LFxuICAgIG1pbkxvZ0l0ZW1zOiAyLFxuICAgIGxvZ1B1c2hGcmVxdWVuY3k6IDYwMDAwLFxuICAgIG1pbkxvZ0l0ZW1zVG9Gb3JjZTogMTAwLFxufVxuXG5leHBvcnQgY2xhc3MgTmV3UmVsaWNMb2dEZWxpdmVyeUFnZW50IHtcbiBcbiAgICBwcml2YXRlIGFwcExhYmVsOiBzdHJpbmc7XG4gICAgcHJpdmF0ZSByZWdpb25MYWJlbDogc3RyaW5nID0gJ3VuZGVmaW5lZCc7XG4gICAgcHJpdmF0ZSBlbnZpcm9ubWVudExhYmVsOiBzdHJpbmcgPSAndW5kZWZpbmVkJztcbiAgICBwcml2YXRlIHZlcnNpb25MYWJlbDogc3RyaW5nID0gJ3VuZGVmaW5lZCc7XG5cbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplcyBhIE5ld1JlbGljTG9nRGVsaXZlcnlBZ2VudCBpbnN0YW5jZSBpZiB0aGUgTE9HX1NUWUxFIGVudmlyb25tZW50XG4gICAgICogdmFyaWFibGUgaXMgc2V0IHRvIE5FV19SRUxJQy4gT3RoZXJ3aXNlIGl0IGRvZXMgbm90aGluZy5cbiAgICAgKiBAcGFyYW0gY29uZmlnIFxuICAgICAqIEByZXR1cm5zIFxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgaW5pdGlhbGl6ZSgpIHtcbiAgICAgICAgaWYgKCFwcm9jZXNzLmVudi5ORVdfUkVMSUNfTElDRU5TRV9LRVkpIHJldHVybjtcbiAgICAgICAgTmV3UmVsaWNMb2dEZWxpdmVyeUFnZW50Lmluc3RhbmNlID0gbmV3IE5ld1JlbGljTG9nRGVsaXZlcnlBZ2VudCgpO1xuICAgICAgICByZXR1cm4gTmV3UmVsaWNMb2dEZWxpdmVyeUFnZW50Lmluc3RhbmNlO1xuICAgIH1cblxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0SW5zdGFuY2UoKSB7XG4gICAgICAgIHJldHVybiBOZXdSZWxpY0xvZ0RlbGl2ZXJ5QWdlbnQ/Lmluc3RhbmNlO1xuICAgIH1cblxuICAgIHB1YmxpYyBzdGF0aWMgY29uZmlndXJlKGNvbmZpZzogTmV3UmVsaWNMb2dEZWxpdmVyeUFnZW50Q29uZmlnKSB7XG4gICAgICAgIGNvbnN0IGluc3RhbmNlID0gTmV3UmVsaWNMb2dEZWxpdmVyeUFnZW50Lmluc3RhbmNlO1xuICAgICAgICBpZiAoIWluc3RhbmNlKSB7XG4gICAgICAgICAgICBpbnRlcm5hbExvZygnd2FybicsICdDb25maWd1cmUgY2FsbGVkIGJlZm9yZSBpbnN0YW5jZSBpbml0aWFsaXphdGlvbi4gQ29uZmlndXJhdGlvbiBub3QgYXBwbGllZCcpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGluc3RhbmNlLmNvbmZpZyA9IHtcbiAgICAgICAgICAgIC4uLmluc3RhbmNlLmNvbmZpZyxcbiAgICAgICAgICAgIC4uLmNvbmZpZ1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyBnZXRXaW5zdG9uVHJhbnNwb3J0KCkge1xuICAgICAgICByZXR1cm4gTmV3UmVsaWNMb2dEZWxpdmVyeUFnZW50Py5pbnN0YW5jZT8ubG9nVHJhbnNmb3JtO1xuICAgIH1cbiAgICBcbiAgICBwcml2YXRlIHN0YXRpYyBpbnN0YW5jZTogTmV3UmVsaWNMb2dEZWxpdmVyeUFnZW50O1xuICAgIHByaXZhdGUgbG9nUXVldWU6IGFueVtdID0gW107XG4gICAgcHJpdmF0ZSBjb25maWc6IE5ld1JlbGljTG9nRGVsaXZlcnlBZ2VudENvbmZpZztcbiAgICBwcml2YXRlIGxvZ0xlbmd0aFF1ZXVlOiBudW1iZXJbXSA9IFtdO1xuICAgIHByaXZhdGUgdG90YWxMZW5ndGhDb3VudCA9IDA7XG4gICAgcHJpdmF0ZSBnbG9iYWxBdHRyaWJ1dGVzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSA9IHt9O1xuICAgIHByaXZhdGUgbmV3UmVsaWNMb2dUcmFuc3BvcnQ6IE5ld1JlbGljTG9nVHJhbnNwb3J0O1xuICAgIHByaXZhdGUgZGVidWdNb2RlID0gcHJvY2Vzcy5lbnYuREVCVUdfV1JJVEVfTE9HU19UT19GSUxFID09PSAndHJ1ZSc7XG4gICAgcHJpdmF0ZSB0aW1lb3V0SWQ6IE5vZGVKUy5UaW1lb3V0IHwgdW5kZWZpbmVkO1xuICAgIHByaXZhdGUgbG9nc1dyaXR0ZW4gPSAwO1xuICAgIHByaXZhdGUgbmV3UmVsaWNJbml0aWFsaXplZCA9IGZhbHNlO1xuICAgIFxuICAgIHB1YmxpYyBzdGFuZGFyZE91dFBhc3NUaHJvdWdoOiBTdGFuZGFyZE91dFBhc3NUaHJvdWdoO1xuICAgIFxuICAgIHByaXZhdGUgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIGludGVybmFsTG9nKCdkZWJ1ZycsICdJbml0aWFsaXppbmcgTG9nRGVsaXZlcnlBZ2VudCcpO1xuICAgICAgICB0aGlzLmNvbmZpZyA9IHsgLi4uZGVmYXVsdENvbmZpZyB9O1xuXG4gICAgICAgIGludGVybmFsTG9nKCdpbmZvJywgYENyZWF0aW5nIE5ld1JlbGljTG9nVHJhbnNwb3J0YCk7XG4gICAgICAgIHRoaXMubmV3UmVsaWNMb2dUcmFuc3BvcnQgPSBuZXcgTmV3UmVsaWNMb2dUcmFuc3BvcnQoKGxvZywgY2IpID0+IHRoaXMuYWRkTG9nKGxvZywgY2IpKTtcblxuICAgICAgICAvLyBDcmVhdGVzIGxvZ2dpbmcgY29uZmlndXJhdGlvbiBmb3IgcmV3cml0aW5nIHN0ZG91dC9zdGRlcnJcbiAgICAgICAgY29uc3QgbG9nQ2FsbGJhY2sgPSAobG9nOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgIHRoaXMuYWRkTG9nKGxvZywgKCkgPT4ge30pO1xuICAgICAgICB9O1xuICAgIFxuICAgICAgICBjb25zdCBlcnJDYWxsYmFjayA9IChsb2c6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgdGhpcy5hZGRMb2coe1xuICAgICAgICAgICAgICAgIGxhYmVsOiAnZXJyb3InLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGxvZ1xuICAgICAgICAgICAgfSwgKCkgPT4ge30pO1xuICAgICAgICB9O1xuICAgIFxuICAgICAgICB0aGlzLnN0YW5kYXJkT3V0UGFzc1Rocm91Z2ggPSBuZXcgU3RhbmRhcmRPdXRQYXNzVGhyb3VnaChsb2dDYWxsYmFjaywgZXJyQ2FsbGJhY2spO1xuICAgICAgICB0aGlzLnJlZ2lzdGVyQXBwRGVhdGhMb2dQdXNoKCk7XG4gICAgICAgIHRoaXMuY3JlYXRlTG9nQ2hlY2tUaW1lb3V0KCk7XG4gICAgICAgIHRoaXMucmVnaXN0ZXJOZXdSZWxpY0luaXRpYWxpemF0aW9uSW50ZXJ2YWwoKTsgICAgICBcbiAgICAgICAgaW50ZXJuYWxMb2coJ2RlYnVnJywgJ0xvZ0RlbGl2ZXJ5QWdlbnQgSW5pdGlhbGl6ZWQnKVxuXG4gICAgICAgIGNvbnN0IHNlcnZpY2VMYWJlbCA9IHByb2Nlc3MuZW52LlNFUlZJQ0VfTEFCRUw7XG4gICAgICAgIGxldCBjb21wb25lbnQ7XG4gICAgICAgIGNvbnN0IGxhYmVscyA9IHByb2Nlc3MuZW52Lk5FV19SRUxJQ19MQUJFTFM7XG4gICAgICAgIGlmIChsYWJlbHMpIHtcbiAgICAgICAgICAgIGNvbnN0IHBhcnRzID0gbGFiZWxzLnNwbGl0KCc7Jyk7XG4gICAgICAgICAgICBjb25zdCBsYWJlbE1hcCA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KCk7XG4gICAgICAgICAgICBwYXJ0cy5mb3JFYWNoKHBhcnQgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IFtsYWJlbCwgdmFsdWVdID0gcGFydC5zcGxpdCgnOicpO1xuICAgICAgICAgICAgICAgIGxhYmVsTWFwLnNldChsYWJlbC50b0xvd2VyQ2FzZSgpLCB2YWx1ZSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgaWYgKGxhYmVsTWFwLmhhcygncmVnaW9uJykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlZ2lvbkxhYmVsID0gbGFiZWxNYXAuZ2V0KCdyZWdpb24nKSBhcyBzdHJpbmc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChsYWJlbE1hcC5oYXMoJ2Vudmlyb25tZW50JykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmVudmlyb25tZW50TGFiZWwgPSBsYWJlbE1hcC5nZXQoJ2Vudmlyb25tZW50JykgYXMgc3RyaW5nO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAobGFiZWxNYXAuaGFzKCd2ZXJzaW9uJykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnZlcnNpb25MYWJlbCA9IGxhYmVsTWFwLmdldCgndmVyc2lvbicpIGFzIHN0cmluZztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29tcG9uZW50ID0gbGFiZWxNYXAuZ2V0KCdjb21wb25lbnQnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qIFxuICAgICAgICAgICAgQXNzaWduIGxhYmVsIG5hbWUgdXNpbmcgdGhlIGZvbGxvd2luZyBwcmlvcml0aWVzOlxuICAgICAgICAgICAgMS4gU0VSVklDRV9MQUJFTCBlbnYgdmFsdWVcbiAgICAgICAgICAgIDIuIE5FV19SRUxJQ19MQUJFTFMgZW52IHZhbHVlIGNvbXBvbmVudCBwYXJ0XG4gICAgICAgICAgICAzLiBORVdfUkVMSUNfQVBQX05BTUUgZW52IHZhbHVlXG4gICAgICAgICAgICA0LiB1bmRlZmluZWQgbGl0ZXJhbFxuICAgICAgICAqL1xuICAgICAgICB0aGlzLmFwcExhYmVsID0gc2VydmljZUxhYmVsXG4gICAgICAgICAgICB8fCBjb21wb25lbnRcbiAgICAgICAgICAgIHx8IHByb2Nlc3MuZW52Lk5FV19SRUxJQ19BUFBfTkFNRVxuICAgICAgICAgICAgfHwgJ3VuZGVmaW5lZCc7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWNjZXNzb3IgZm9yIFdpbnN0b24gVHJhbnNwb3J0IHRoYXQgd3JpdGVzIHRvIHRoaXMgXG4gICAgICogYWdlbnQgaW5zdGFuY2VcbiAgICAgKiBAcmV0dXJucyB3aW5zdG9uLnRyYW5zcG9ydFxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRMb2dUcmFuc3BvcnQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm5ld1JlbGljTG9nVHJhbnNwb3J0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNodXRzZG93biB0aGUgZGVsaXZlcnkgYWdlbnQuIFRoaXMgY2FuIGJlIHV0aWxpemVkIHdoZW4gYXBwIGlzIGV4cGVjdGVkIHRvIHNodXRkb3duXG4gICAgICogYXQgYSBnaXZlbiB0aW1lIGFuZCB0aGUgcGVyaW9kaWMgZGVsaXZlcnkgdGltZW91dCBpcyBibG9ja2luZyBzaHV0ZG93bi5cbiAgICAgKiBcbiAgICAgKiBDbGVhcnMgaW50ZXJuYWwgdGltZW91dCwgY29uZmlndXJlcyB3aW5zdG9uIHRyYW5zcG9ydCB0byBub3Qgc2VuZCBsb2dzLlxuICAgICAqIFJlY29ubmVjdHMgc3Rkb3V0IGFuZCBzdGRlcnIuXG4gICAgICogV3JpdGVzIGFueSByZW1haW5pbmcgbG9ncy5cbiAgICAgKi9cbiAgICBwdWJsaWMgc2h1dGRvd24oKSB7XG4gICAgICAgIGludGVybmFsTG9nKCdkZWJ1ZycsICdTaHV0ZG93biBvZiBMb2dEZWxpdmVyeUFnZW50IHRyaWdnZXJlZCcpO1xuICAgICAgICBpZiAodGhpcy50aW1lb3V0SWQpIGNsZWFyVGltZW91dCh0aGlzLnRpbWVvdXRJZCk7XG4gICAgICAgIHRoaXMuc3RhbmRhcmRPdXRQYXNzVGhyb3VnaC5kZXN0cm95KCk7XG4gICAgICAgIHRoaXMubmV3UmVsaWNMb2dUcmFuc3BvcnQuY2xvc2UoKTtcbiAgICAgICAgdGhpcy53cml0ZUxvZ3NTeW5jKCk7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBEZXRlcm1pbmUgaWYgdGhlIGxvZyBzdHJpbmcgb3Igb2JqZWN0IGlzIGEgTmV3IFJlbGljIFxuICAgICAqIGNvbXBhdGlibGUgSlNPTi4gSW4gb3JkZXIgdG8gYmUgY29uc2lkZXJlZCB0aGlzIGl0IG11c3RcbiAgICAgKiBiZSBhIHdlbGwgc3RydWN0dXJlZCBKU09OIG9iamVjdCB3aXRoIGEgdG9wIGxldmVsICdtZXNzYWdlJ1xuICAgICAqIGFuZCAnbGV2ZWwnIHByb3BlcnR5LlxuICAgICAqIEBwYXJhbSBzdHIgXG4gICAgICogQHJldHVybnMgb2JqZWN0IGZvcm0gb2YgSlNPTiBvciBmYWxzZVxuICAgICAqL1xuICAgIHByaXZhdGUgaXNOUkNvbXBhdGlibGVKc29uTG9nU3RyaW5nKHN0cjogc3RyaW5nIHwgb2JqZWN0KSB7XG4gICAgICAgIGlmICh0eXBlb2Ygc3RyID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgc3RyID0gSlNPTi5zdHJpbmdpZnkoc3RyKTtcbiAgICAgICAgfVxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3Qgb2JqID0gSlNPTi5wYXJzZShzdHIgYXMgc3RyaW5nKTtcbiAgICAgICAgICAgIC8vIFJld3JpdGUgYm9vdHN0cmFwIG9iamVjdCBpbnRvIGEgZm9ybWF0IHRoYXQgd2lsbCB3b3JrIGZvciBuZXcgcmVsaWNcbiAgICAgICAgICAgIGlmIChvYmoubXNnICYmIG9iaj8ubmFtZSgnbmV3cmVsaWNfYm9vdHN0cmFwJykgJiYgIW9iai5tZXNzYWdlKSB7XG4gICAgICAgICAgICAgICAgb2JqLm1lc3NhZ2UgPSBvYmoubXNnO1xuICAgICAgICAgICAgICAgIG9iai5sZXZlbCA9ICdpbmZvJztcbiAgICAgICAgICAgICAgICBkZWxldGUgb2JqLm1zZztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChvYmogJiYgdHlwZW9mIG9iaiA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgICAgIGlmIChvYmoubWVzc2FnZSAmJiBvYmoubGV2ZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlcnIpIHsgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSW50ZXJuYWwgZnVuY3Rpb24gdXNlZCB0byBhY2NlcHQgbG9nIHN0YXRlbWVudHMgYW5kXG4gICAgICogcHJvY2VzcyB0aGVtLiBMb2cgaXMgdHlwZWQgdG8gYW55IHRvIGZpdCB0eXBpbmcgZm9yXG4gICAgICogdGhlIFdpbnN0b24gdHJhbnNwb3J0LlxuICAgICAqIFxuICAgICAqIFRPRE86IFJld29yayB0aGUgV2luc3RvbiB0cmFuc3BvcnQgbG9naWMgdG8gZG8gYSBiaXRcbiAgICAgKiAgICAgIG1vcmUgd29yayB0byBwcm92aWRlIG1vcmUgY29uc2lzdGVudCB0eXBpbmcuXG4gICAgICogXG4gICAgICogQHBhcmFtIGxvZyBcbiAgICAgKiBAcGFyYW0gY2FsbGJhY2sgXG4gICAgICovXG4gICAgcHJpdmF0ZSBhZGRMb2cobG9nOiBhbnksIGNhbGxiYWNrOiAoKCkgPT4gdm9pZCkgfCB1bmRlZmluZWQpIHtcbiAgICAgICAgY29uc3QganNvbkRhdGEgPSB0aGlzLmlzTlJDb21wYXRpYmxlSnNvbkxvZ1N0cmluZyhsb2cpO1xuICAgICAgICBpZihqc29uRGF0YSkge1xuICAgICAgICAgICAgdGhpcy5wcm9jZXNzQXNKc29uTG9nKGpzb25EYXRhKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucHJvY2Vzc0FzU3RyaW5nTG9nKGxvZyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5pbW1lZGlhdGVMb2dXcml0YWJsZVByZWRpY2F0ZSgpKSB7XG4gICAgICAgICAgICB0aGlzLmJlZ2luV3JpdGVMb2dzKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoanNvbkRhdGEpIGxvZyA9IEpTT04uc3RyaW5naWZ5KGxvZykrJ1xcbic7XG4gICAgXG4gICAgICAgIGlmIChqc29uRGF0YT8ubWVzc2FnZSAmJiBqc29uRGF0YT8ubGV2ZWwgPT09ICdlcnJvcicpIHtcbiAgICAgICAgICAgIHRoaXMuc3RhbmRhcmRPdXRQYXNzVGhyb3VnaC5zdGRlcnJCeXBhc3MobG9nKTtcbiAgICAgICAgfSBlbHNlIGlmKGpzb25EYXRhLm1lc3NhZ2UpIHtcbiAgICAgICAgICAgIHRoaXMuc3RhbmRhcmRPdXRQYXNzVGhyb3VnaC5zdGRvdXRCeXBhc3MobG9nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjYWxsYmFjaykgY2FsbGJhY2soKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBIYW5kbGVyIGZvciBwcm9jZXNzaW5nIGEgbG9nIHN0YXRlbWVudCB3aGVuIGl0IGlzIGZvcm1hdHRlZFxuICAgICAqIGFzIGEgTmV3IFJlbGljIGNvbXBhdGlibGUgSlNPTiBzdHJpbmcuXG4gICAgICogQHBhcmFtIGxvZyBcbiAgICAgKi9cbiAgICBwcm9jZXNzQXNKc29uTG9nKGxvZzogYW55KSB7XG4gICAgICAgIHRoaXMubG9nVHJhbnNmb3JtKGxvZyk7XG4gICAgICAgIGNvbnN0IGxvZ1N0cmluZyA9IEpTT04uc3RyaW5naWZ5KGxvZyk7XG4gICAgICAgIGNvbnN0IGxlbmd0aCA9IEJ1ZmZlci5ieXRlTGVuZ3RoKGxvZ1N0cmluZyk7XG4gICAgICAgIHRoaXMubG9nUXVldWUucHVzaChsb2cpO1xuICAgICAgICB0aGlzLmxvZ0xlbmd0aFF1ZXVlLnB1c2gobGVuZ3RoKTtcbiAgICAgICAgdGhpcy50b3RhbExlbmd0aENvdW50ICs9IGxlbmd0aDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBIYW5kbGVyIGZvciBwcm9jZXNzaW5nIGEgbG9nIHN0YXRlbWVudCB0aGF0IGlzIGEgc2ltcGxlXG4gICAgICogc3RyaW5nIGZvcm1hdC5cbiAgICAgKiBAcGFyYW0gbG9nIFxuICAgICAqL1xuICAgIHByb2Nlc3NBc1N0cmluZ0xvZyhsb2c6IHN0cmluZykge1xuICAgICAgICBpZiAodHlwZW9mIGxvZyA9PT0gJ3N0cmluZycgJiYgbG9nLmVuZHNXaXRoKCdcXG4nKSkge1xuICAgICAgICAgICAgbG9nID0gbG9nLnN1YnN0cmluZygwLCBsb2cubGVuZ3RoIC0gMSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBuZXdSZWxpY01ldGFkYXRhID0gbmV3cmVsaWMuZ2V0TGlua2luZ01ldGFkYXRhKCk7XG4gICAgICAgIGNvbnN0IHN0cnVjdHVyZWRMb2cgPSB7XG4gICAgICAgICAgICBtZXNzYWdlOiBsb2csXG4gICAgICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KCksXG4gICAgICAgICAgICBvcmlnaW5hbF90aW1lc3RhbXA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgICAgICAgIFwiZW50aXR5Lm5hbWVcIjogbmV3UmVsaWNNZXRhZGF0YVsnZW50aXR5Lm5hbWUnXSxcbiAgICAgICAgICAgIFwiZW50aXR5LnR5cGVcIjogbmV3UmVsaWNNZXRhZGF0YVsnZW50aXR5LnR5cGUnXSxcbiAgICAgICAgICAgIGhvc3RuYW1lOiBuZXdSZWxpY01ldGFkYXRhLmhvc3RuYW1lXG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBqc29uTG9nU3RyaW5nID0gSlNPTi5zdHJpbmdpZnkoc3RydWN0dXJlZExvZyk7XG4gICAgICAgIGNvbnN0IGxlbmd0aCA9IEJ1ZmZlci5ieXRlTGVuZ3RoKGpzb25Mb2dTdHJpbmcpO1xuICAgICAgICB0aGlzLmxvZ1F1ZXVlLnB1c2goc3RydWN0dXJlZExvZyk7XG4gICAgICAgIHRoaXMubG9nTGVuZ3RoUXVldWUucHVzaChsZW5ndGgpO1xuICAgICAgICB0aGlzLnRvdGFsTGVuZ3RoQ291bnQgKz0gbGVuZ3RoO1xuICAgIH1cbiAgICBcbiAgICAvKipcbiAgICAgKiBTZXQgZ2xvYmFsIGF0dHJpYnV0ZXMgZm9yIHRoZSBhcHBsaWNhdGlvbi4gIFRoaXMgc2hvdWxkXG4gICAgICogZ2VuZXJhbGx5IGJlIGNvbmZpZ3VyZWQgZWFybHkgaW4gdGhlIGFwcGxpY2F0aW9uIGxpZmVjeWNsZS5cbiAgICAgKiBHbG9iYWwgYXR0cmlidXRlcyB3aWxsIGJlIGJvdW5kIHRvIGFsbCBsb2cgc3RhdGVtZW50c1xuICAgICAqIGluIE5ldyBSZWxpYy5cbiAgICAgKiBAcGFyYW0gYXR0cmlidXRlcyBLViBwYWlycyB0byBiZSBwcm92aWRlZCB0byBOUiB3aXRoIGxvZ3NcbiAgICAgKi9cbiAgICBzZXRHbG9iYWxBdHRyaWJ1dGVzKGF0dHJpYnV0ZXM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9KSB7XG4gICAgICAgIHRoaXMuZ2xvYmFsQXR0cmlidXRlcyA9IGF0dHJpYnV0ZXM7XG4gICAgfSAgXG5cbiAgICAvKipcbiAgICAgKiBXcml0ZXMgbG9ncyBzeW5jaHJvbm91c2x5LiAgVGhpcyBmdW5jdGlvbiBpcyBpbnRlbmRlZCB0byBiZVxuICAgICAqIHV0aWxpemVkIGluIHNpdHVhdGlvbnMgd2hlcmUgbG9nZ2luZyBjYW5ub3QgYmUgd3JpdHRlbiBcbiAgICAgKiBhc3luY2hyb25vdXNseSwgbW9zdCBjb21tb25seSBpbiB0aGUgaGFuZGxlciBvZiBhIFNJR1RFUk1cbiAgICAgKiBldmVudCwgd2hpY2ggb25seSBhbGxvd3Mgc3luY2hyb25vdXMgY2FsbHMuXG4gICAgICovXG4gICAgcHJpdmF0ZSB3cml0ZUxvZ3NTeW5jKCkge1xuICAgICAgICBjb25zdCBsb2dzVG9Xcml0ZSA9IHRoaXMuc2xpY2VMb2dzKCk7XG4gICAgICAgIGludGVybmFsTG9nKCdzaWxseScsIGBQcmVwYXJpbmcgZmluYWwgbG9nIHBheWxvYWQgb2YgJHtsb2dzVG9Xcml0ZS5sZW5ndGh9IGZvciBOUiBjb2xsZWN0b3JgKTtcbiAgICAgICAgY29uc3QgcmF3UGF5bG9hZCA9IHRoaXMuYnVpbGRSYXdQb3N0Qm9keShsb2dzVG9Xcml0ZSk7XG4gICAgICAgIGNvbnN0IGNvbXByZXNzZWRQYXlsb2FkID0gemxpYi5nemlwU3luYyhyYXdQYXlsb2FkKTtcbiAgICAgICAgaWYgKCF0aGlzLmRlYnVnTW9kZSkge1xuICAgICAgICAgICAgdGhpcy5zZW5kTG9ncyhjb21wcmVzc2VkUGF5bG9hZCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLndyaXRlTG9nc1RvRmlsZVN5c3RlbShjb21wcmVzc2VkUGF5bG9hZCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgd3JpdGVMb2dzVG9GaWxlU3lzdGVtKGJ1ZmZlcjogQnVmZmVyKSB7XG4gICAgICAgIGZzLndyaXRlRmlsZVN5bmMoYHRlc3QtJHt0aGlzLmxvZ3NXcml0dGVuKyt9Lmd6YCwgYnVmZmVyKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIGJlZ2luV3JpdGVMb2dzKCkge1xuICAgICAgICBjb25zdCBsb2dzVG9Xcml0ZSA9IHRoaXMuc2xpY2VMb2dzKCk7XG5cbiAgICAgICAgaW50ZXJuYWxMb2coJ3NpbGx5JywgYFByZXBhcmluZyBsb2cgcGF5bG9hZCBvZiAke2xvZ3NUb1dyaXRlLmxlbmd0aH0gZm9yIE5SIGNvbGxlY3RvcmApO1xuICAgICAgICBjb25zdCByYXdQYXlsb2FkID0gdGhpcy5idWlsZFJhd1Bvc3RCb2R5KGxvZ3NUb1dyaXRlKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGNvbXByZXNzZWRQYXlsb2FkOiBCdWZmZXIgPSBhd2FpdCB0aGlzLmNvbXByZXNzUGF5bG9hZChyYXdQYXlsb2FkKTtcbiAgICAgICAgICAgIGlmICghdGhpcy5kZWJ1Z01vZGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNlbmRMb2dzKGNvbXByZXNzZWRQYXlsb2FkKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy53cml0ZUxvZ3NUb0ZpbGVTeXN0ZW0oY29tcHJlc3NlZFBheWxvYWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnN0IGZhbGxiYWNrTWVzc2FnZSA9ICdVbmtub3duIGVycm9yIG9jY3VycmVkIHdoaWxlIGNvbXByZXNzaW5nIGxvZ3MgdG8gc2VuZCB0byBOZXcgUmVsaWMnO1xuICAgICAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVyciBpbnN0YW5jZW9mIEVycm9yICYmIGVyci5zdGFjayA/IGVyci5zdGFjayA6IGZhbGxiYWNrTWVzc2FnZTsgXG4gICAgICAgICAgICBpbnRlcm5hbExvZygnZXJyb3InLCBtZXNzYWdlKVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSGFuZGxlcyBIVFRQIHJlcXVlc3QgdGhhdCBzZW5kcyBjb21wcmVzc2VkIGxvZyBkYXRhXG4gICAgICogdG8gdGhlIE5ldyBSZWxpYyBlbmRwb2ludC5cbiAgICAgKiBAcGFyYW0gY29tcHJlc3NlZFBheWxvYWQgXG4gICAgICovXG4gICAgcHJpdmF0ZSBzZW5kTG9ncyhjb21wcmVzc2VkUGF5bG9hZDogQnVmZmVyKSB7XG4gICAgICAgIEF4aW9zLnBvc3QoYGh0dHBzOi8vJHtBUElfSE9TVE5BTUV9JHtBUElfUEFUSH1gLCBjb21wcmVzc2VkUGF5bG9hZCwge1xuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICdBY2NlcHQnOiAnKi8qJyxcbiAgICAgICAgICAgICAgICAnQXBpLUtleSc6IHByb2Nlc3MuZW52Lk5FV19SRUxJQ19MSUNFTlNFX0tFWSBhcyBzdHJpbmcsXG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtRW5jb2RpbmcnOiAnZ3ppcCcsXG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtTGVuZ3RoJzogJycrY29tcHJlc3NlZFBheWxvYWQuYnl0ZUxlbmd0aCxcbiAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2d6aXAnLFxuICAgICAgICAgICAgfVxuICAgICAgICB9KS50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgIGlmIChbMjAwLCAyMDJdLmluY2x1ZGVzKHJlc3BvbnNlLnN0YXR1cykpIHtcbiAgICAgICAgICAgICAgICBpbnRlcm5hbExvZygnc2lsbHknLCBgTG9nIHBheWxvYWQgYWNjZXB0ZWQgYnkgTmV3IFJlbGljIEFQSS4gUmVxdWVzdCBJRDogJHtyZXNwb25zZS5kYXRhLnJlcXVlc3RJZH1gKVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpbnRlcm5hbExvZygnd2FybicsIGBVbmV4cGVjdGVkIHN1Y2Nlc3NmdWwgcmVzcG9uc2Ugc3RhdHVzIGNvZGUgZnJvbSBOUjogJHtyZXNwb25zZS5zdGF0dXN9YClcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9KS5jYXRjaChlcnIgPT4ge1xuICAgICAgICAgICAgaW50ZXJuYWxMb2coJ2Vycm9yJywgJ0Vycm9yIHNlbmRpbmcgbG9nIHBheWxvYWQgdG8gTmV3IFJlbGljJyk7XG4gICAgICAgICAgICBpbnRlcm5hbExvZygnZXJyb3InLCBlcnIuc3RhY2spXG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyB0aGUgZ3JlYXRlciBvYmplY3Qgc3RydWN0dXJlIGZvciBhIGxvZyBkZWxpdmVyeSBcbiAgICAgKiBwYXlsb2FkIGFuZCBhdHRhY2hlcyBhbiBhcnJheSBvZiBsb2dzIHRvIGl0LiBSZXR1cm5zIFxuICAgICAqIHN0cmluZ2lmaWVkLlxuICAgICAqIEBwYXJhbSBsb2dzIFxuICAgICAqIEByZXR1cm5zIFxuICAgICAqL1xuICAgIHByaXZhdGUgYnVpbGRSYXdQb3N0Qm9keShsb2dzOiBhbnlbXSk6IHN0cmluZyB7XG4gICAgICAgIGNvbnN0IHBheWxvYWQgPSBbe1xuICAgICAgICAgICAgY29tbW9uOiB7XG4gICAgICAgICAgICAgICAgYXR0cmlidXRlczoge1xuICAgICAgICAgICAgICAgICAgICAuLi50aGlzLmdsb2JhbEF0dHJpYnV0ZXMsXG4gICAgICAgICAgICAgICAgICAgIHNlcnZpY2U6IHRoaXMuYXBwTGFiZWwsXG4gICAgICAgICAgICAgICAgICAgIHZlcnNpb246IHRoaXMudmVyc2lvbkxhYmVsLFxuICAgICAgICAgICAgICAgICAgICByZWdpb246IHRoaXMucmVnaW9uTGFiZWwsXG4gICAgICAgICAgICAgICAgICAgIGVudmlyb25tZW50OiB0aGlzLmVudmlyb25tZW50TGFiZWwsXG4gICAgICAgICAgICAgICAgICAgIGVudGl0eUd1aWQ6IG5ld3JlbGljLmdldExpbmtpbmdNZXRhZGF0YSgpWydlbnRpdHkuZ3VpZCddLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbG9nczogbG9nc1xuICAgICAgICB9XTtcbiAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHBheWxvYWQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFzeW5jaHJvbm91c2x5IGNvbXByZXNzIHN0cmluZyB0byBnemlwIGNvbXByZXNzZWQgZGF0YS5cbiAgICAgKiBAcGFyYW0gcmF3UGF5bG9hZCBcbiAgICAgKiBAcmV0dXJucyBcbiAgICAgKi9cbiAgICBwcml2YXRlIGFzeW5jIGNvbXByZXNzUGF5bG9hZChyYXdQYXlsb2FkOiBzdHJpbmcpOiBQcm9taXNlPEJ1ZmZlcj4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8QnVmZmVyPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICB6bGliLmd6aXAoQnVmZmVyLmZyb20ocmF3UGF5bG9hZCwgJ3V0ZjgnKSwgKGVyciwgY29tcHJlc3NlZFBheWxvYWQpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSByZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgICByZXNvbHZlKGNvbXByZXNzZWRQYXlsb2FkKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTbGljZXMgbG9nIHF1ZXVlLlxuICAgICAqIFdpbGwgcHJlZmVyIHRvIHVzZSB0aGUgZW50aXJlIGxvZyBxdWV1ZSB3aGVuIHBvc3NpYmxlLCBidXRcbiAgICAgKiBtYXkgc2VuZCBvbmx5IGEgc3Vic2VjdGlvbiBpZiB0aGUgc2l6ZSBvZiB0aGUgZGF0YSBpcyBuZWFyXG4gICAgICogdGhlIGxpbWl0YXRpb25zIGRlZmluZWQgYnkgTmV3IFJlbGljJ3MgQVBJLlxuICAgICAqIEByZXR1cm5zIFxuICAgICAqL1xuICAgIHByaXZhdGUgc2xpY2VMb2dzKCkge1xuICAgICAgICBsZXQgbG9nc1RvU2VuZDtcbiAgICAgICAgXG4gICAgICAgIC8vIElmIHdlIGtub3cgdGhlIHRvdGFsIGxlbmd0aCB3aWxsIG5vdCBleGNlZWQgbWF4aW11bSBsZW5ndGggc2l6ZVxuICAgICAgICBpZiAodGhpcy50b3RhbExlbmd0aENvdW50IDwgTUFYX1BBWUxPQURfU0laRSkge1xuICAgICAgICAgICAgW2xvZ3NUb1NlbmQsIHRoaXMubG9nUXVldWVdID0gW3RoaXMubG9nUXVldWUsIFtdXTtcbiAgICAgICAgICAgIHRoaXMubG9nTGVuZ3RoUXVldWUgPSBbXTtcbiAgICAgICAgICAgIHRoaXMudG90YWxMZW5ndGhDb3VudCA9IDA7XG4gICAgICAgICAgICByZXR1cm4gbG9nc1RvU2VuZDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIG90aGVyd2lzZSwgc2xpY2Ugb2ZmIGEgc2xpY2Ugb2YgbG9ncyB0aGF0IHdpbGwgZml0IGludG8gYSBzaW5nbGUgcmVxdWVzdFxuICAgICAgICBsZXQgbG9nU2l6ZSA9IDA7XG4gICAgICAgIGxldCBsb2dTbGljZUluZGV4ID0gMDtcblxuICAgICAgICB3aGlsZSgodGhpcy5sb2dRdWV1ZS5sZW5ndGggPiAwKSAmJiAobG9nU2l6ZSArIHRoaXMubG9nTGVuZ3RoUXVldWVbMF0gPCBNQVhfUEFZTE9BRF9TSVpFKSkge1xuICAgICAgICAgICAgbG9nU2xpY2VJbmRleCsrO1xuICAgICAgICB9XG5cbiAgICAgICAgbG9nc1RvU2VuZCA9IHRoaXMubG9nUXVldWUuc2xpY2UoMCwgbG9nU2xpY2VJbmRleCk7XG4gICAgICAgIHRoaXMubG9nUXVldWUgPSB0aGlzLmxvZ1F1ZXVlLnNsaWNlKGxvZ1NsaWNlSW5kZXgpO1xuICAgICAgICB0aGlzLmxvZ0xlbmd0aFF1ZXVlID0gdGhpcy5sb2dMZW5ndGhRdWV1ZS5zbGljZShsb2dTbGljZUluZGV4KTtcblxuICAgICAgICByZXR1cm4gbG9nc1RvU2VuZDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQcmVkaWNhdGUgdG8gZGV0ZXJtaW5lIGlmIGxvZ3Mgc2hvdWxkIGJlIHdyaXR0ZW4gYmUgd3JpdHRlbiBpbW1lZGlhdGVseS5cbiAgICAgKiBAcmV0dXJucyBib29sZWFuXG4gICAgICovXG4gICAgcHJpdmF0ZSBpbW1lZGlhdGVMb2dXcml0YWJsZVByZWRpY2F0ZSgpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKHRoaXMubmV3UmVsaWNJbml0aWFsaXplZCAmJiB0aGlzLmxvZ1F1ZXVlLmxlbmd0aCA+ICh0aGlzLmNvbmZpZy5taW5Mb2dJdGVtc1RvRm9yY2UgfHwgMTAwKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBQdXNoIGxvZ3MgZXZlbiBpZiBuZXcgcmVsaWMgaGFzbid0IGJlZW4gaW5pdGlhbGl6ZWQgaWYgdGhlIGJhY2tsb2cgZ3Jvd3MgdG9vIGxhcmdlXG4gICAgICAgIGlmICh0aGlzLmxvZ1F1ZXVlLmxlbmd0aCA+IDUwMCkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFByZWRpY2F0ZSB0byBkZXRlcm1pbmUgaWYgbG9ncyBzaG91bGQgYmUgd3JpdHRlbiBvbiBuZXh0IHBlcmlvZGljIGNoZWNrLlxuICAgICAqIEByZXR1cm5zIGJvb2xlYW5cbiAgICAgKi9cbiAgICBwcml2YXRlIGxvZ3NXcml0YWJsZVByZWRpY2F0ZSgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWluTG9nSXRlbXNFeGNlZWRlZCgpXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUHJlZGljYXRlIHRvIGRldGVybWluZSBpZiB0aGUgdG90YWwgbG9ncyBoYXZlIGV4Y2VlZGVkIGEgY29uZmlndXJlZCBtaW5Mb2dcbiAgICAgKiBjb3VudCB2YWx1ZSBpZiBzdWNoIGEgdmFsdWUgaXMgY29uZmlndXJlZC5cbiAgICAgKiBAcmV0dXJucyBcbiAgICAgKi9cbiAgICBwcml2YXRlIG1pbkxvZ0l0ZW1zRXhjZWVkZWQoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiAhISh0aGlzLmNvbmZpZy5taW5Mb2dJdGVtcyAmJiAodGhpcy5sb2dRdWV1ZS5sZW5ndGggPiB0aGlzLmNvbmZpZy5taW5Mb2dJdGVtcykpO1xuICAgIH0gICAgXG4gICAgXG4gICAgLyoqXG4gICAgICogRml4ZXMgcG9zc2libGUgaXNzdWVzIGluIGxvZyBmb3JtYXQgY2F1c2VkIGJ5IGxpbWl0YXRpb25zIG9mIE5ScyBsb2dnaW5nXG4gICAgICogdmFsdWVzXG4gICAgICogQHBhcmFtIGxvZyBcbiAgICAgKiBAcmV0dXJucyBcbiAgICAgKi9cbiAgICBwcml2YXRlIGxvZ1RyYW5zZm9ybShsb2c6IGFueSkge1xuICAgICAgICBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMobG9nKS5sZW5ndGggPiBNQVhfQVRUUklCVVRFU19QRVJfRVZFTlQpIHtcbiAgICAgICAgICAgIGludGVybmFsTG9nKCd3YXJuJywgYExvZyB0byBzZW5kIHRvIEpTT04gY29udGFpbnMgJHtPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhsb2cpfSAvICR7TUFYX0FUVFJJQlVURVNfUEVSX0VWRU5UfSBhdHRyaWJ1dGVzLmApO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBmb3IgKGxldCBrZXkgb2YgT2JqZWN0LmtleXMobG9nKSkge1xuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBsb2dba2V5XTtcbiAgICAgICAgICAgIC8vIHJlcGxhY2Uga2V5IHdpdGggbGVuZ3RoIHRvbyBoaWdoXG4gICAgICAgICAgICBpZiAoa2V5Lmxlbmd0aCA+IE1BWF9BVFRSSUJVVEVfTkFNRV9MRU5HVEgpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBuZXdLZXkgPSBrZXkuc2xpY2UoMCwgTUFYX0FUVFJJQlVURV9OQU1FX0xFTkdUSCk7XG4gICAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGxvZywga2V5LnNsaWNlKDAsIE1BWF9BVFRSSUJVVEVfTkFNRV9MRU5HVEgpLCBcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihsb2csIGtleSBhcyBQcm9wZXJ0eUtleSkgYXMgUHJvcGVydHlEZXNjcmlwdG9yKTtcbiAgICAgICAgICAgICAgICBkZWxldGUgbG9nLmtleTtcblxuICAgICAgICAgICAgICAgIC8vIFVwZGF0ZSBrZXkgbmFtZSBmb3IgdXNhZ2UgaW4gbGF0ZXIgc3RlcHNcbiAgICAgICAgICAgICAgICBrZXkgPSBuZXdLZXk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIENvbmNhdGVuYXRlIGxvZyBtZXNzYWdlcyB3aXRoIGxlbmd0aCBncmVhdGVyIHRoYW4gTUFYX0FUVFJJQlVURV9WQUxVRV9MRU5HVEhcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmIHZhbHVlLmxlbmd0aCA+IE1BWF9BVFRSSUJVVEVfVkFMVUVfTEVOR1RIKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY29uZmlnPy53YXJuT25BdHRyaWJ1dGVMZW5ndGhPdmVyZmxvdykge1xuICAgICAgICAgICAgICAgICAgICBpbnRlcm5hbExvZygnd2FybicsIGBOUiBMb2cgYXR0cmlidXRlIGxlbmd0aCBvdmVyZmxvdy4gTGVuZ3RoOiAke3ZhbHVlLmxlbmd0aH0vJHtNQVhfQVRUUklCVVRFX1ZBTFVFX0xFTkdUSH1gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbG9nLmtleSA9IHZhbHVlLnNsaWNlKDAsIE1BWF9BVFRSSUJVVEVfVkFMVUVfTEVOR1RIKTsgXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChrZXkuaW5jbHVkZXMoJyAnKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG5ld0tleSA9IGtleS5yZXBsYWNlQWxsKCcgJywgJy4nKTtcbiAgICAgICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobG9nLCBrZXkuc2xpY2UoMCwgTUFYX0FUVFJJQlVURV9OQU1FX0xFTkdUSCksIFxuICAgICAgICAgICAgICAgICAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGxvZywga2V5IGFzIFByb3BlcnR5S2V5KSBhcyBQcm9wZXJ0eURlc2NyaXB0b3IpO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBsb2cua2V5O1xuXG4gICAgICAgICAgICAgICAgLy8gVXBkYXRlIGtleSBuYW1lIGZvciB1c2FnZSBpbiBsYXRlciBzdGVwc1xuICAgICAgICAgICAgICAgIGtleSA9IG5ld0tleTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiB1c2VkIHRvIHJlcGVhdGVkbHkgdHJpZ2dlciBsb2cgcHVzaGVzXG4gICAgICovXG4gICAgcHJpdmF0ZSBjcmVhdGVMb2dDaGVja1RpbWVvdXQoKSB7XG4gICAgICAgIHRoaXMudGltZW91dElkID0gc2V0VGltZW91dChhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy5sb2dRdWV1ZS5sZW5ndGggPiAodGhpcy5jb25maWcubWluTG9nSXRlbXMgfHwgMSkpIHtcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLmJlZ2luV3JpdGVMb2dzKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5jcmVhdGVMb2dDaGVja1RpbWVvdXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdGhpcy5jb25maWcubG9nUHVzaEZyZXF1ZW5jeSlcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBIZWxwZXIgbWV0aG9kIHRoYXQgcmVnaXN0ZXJzIGxpc3RlbmVycyBmb3IgZXZlbnRzXG4gICAgICogcmVsYXRlZCB0byBpbW1pbmVudCBhcHBsaWNhdGlvbiBzaHV0ZG93biBzbyB0aGF0XG4gICAgICogZmluYWwgbG9ncyBjYW4gYmUgcHVzaGVkXG4gICAgICovXG4gICAgcHJpdmF0ZSByZWdpc3RlckFwcERlYXRoTG9nUHVzaCgpIHtcbiAgICAgICAgbGV0IGZpbmFsV3JpdHRlbiA9IGZhbHNlO1xuICAgICAgICBwcm9jZXNzLm9uKCdleGl0JywgKCkgPT4ge1xuICAgICAgICAgICAgaWYgKHRoaXMudGltZW91dElkKSBjbGVhclRpbWVvdXQodGhpcy50aW1lb3V0SWQpO1xuICAgICAgICAgICAgbGV0IG8gPSBmaW5hbFdyaXR0ZW47XG4gICAgICAgICAgICBmaW5hbFdyaXR0ZW4gPSB0cnVlO1xuICAgICAgICAgICAgaWYgKG8pIHJldHVybjtcblxuICAgICAgICAgICAgaW50ZXJuYWxMb2coJ2luZm8nLCAnd3JpdGluZyBmaW5hbCBsb2dzJyk7XG5cbiAgICAgICAgICAgIHRoaXMud3JpdGVMb2dzU3luYygpO1xuICAgICAgICB9KTtcblxuICAgICAgICBwcm9jZXNzLm9uKCdTSUdJTlQnLCAoKSA9PiB7XG4gICAgICAgICAgICBwcm9jZXNzLmV4aXQoMik7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHByb2Nlc3Mub24oJ3VuY2F1Z2h0RXhjZXB0aW9uJywgKGUpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGUpO1xuICAgICAgICAgICAgaW50ZXJuYWxMb2coJ2Vycm9yJywgZS5zdGFjayB8fCAnJyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHByb2Nlc3Mub24oJ1NJR1RFUk0nLCAoKSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy50aW1lb3V0SWQpIGNsZWFyVGltZW91dCh0aGlzLnRpbWVvdXRJZCk7XG4gICAgICAgICAgICB0aGlzLndyaXRlTG9nc1N5bmMoKTtcbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBOZXcgUmVsaWMgZG9lcyBub3QgZXhwb3NlIGEgbWV0aG9kIHRvIGNoZWNrIGl0cyBpbml0aWFsaXphdGlvbiBzdGF0dXNcbiAgICAgKiBJZiB3ZSBwdXNoIGxvZ3MgYmVmb3JlIE5ldyBSZWxpYyBpbml0aWFsaXplcywgdGhleSB3aWxsIG5vdCBoYXZlIGFuIGF0dGFjaGVkXG4gICAgICogZW50aXR5IGd1aWQuICBGb3IgdGhpcyByZWFzb24gd2Ugd2lsbCBpbml0aWFsaXplIGFuIGludGVydmFsIHRoYXQgY2FuIHJ1biB1bnRpbFxuICAgICAqIGl0IGlzIGluaXRpYWxpemVkLlxuICAgICAqL1xuICAgIHByaXZhdGUgcmVnaXN0ZXJOZXdSZWxpY0luaXRpYWxpemF0aW9uSW50ZXJ2YWwoKSB7XG4gICAgICAgIGNvbnN0IG5ld1JlbGljSW5pdGlhbGl6YXRpb25DaGVja1RpbWVvdXQgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBtZXRhZGF0YSA9IG5ld3JlbGljLmdldExpbmtpbmdNZXRhZGF0YSgpO1xuICAgICAgICAgICAgaWYgKG1ldGFkYXRhWydlbnRpdHkuZ3VpZCddKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5uZXdSZWxpY0luaXRpYWxpemVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBpbnRlcm5hbExvZygnaW5mbycsICdEZXRlY3RlZCBOZXcgUmVsaWMgaGFzIGluaXRpYWxpemVkIHdpdGggZW50aXR5Lmd1aWQnKTtcbiAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKG5ld1JlbGljSW5pdGlhbGl6YXRpb25DaGVja1RpbWVvdXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCAxMDApO1xuICAgIH1cbn1cblxuLyoqXG4gKiBSZXBsYWNlcyBleGlzdGluZyB3cml0ZXJzIGZvciBzdGRvdXQgYW5kIHN0ZGVyciB3aXRoXG4gKiBQYXNzVGhyb3VnaCBzdHJlYW1zIHRoYXQgd2lsbCBpbnZva2UgcHJvdmlkZWQgY2FsbGJhY2tzXG4gKiB3aXRoIHRoZSBkYXRhIHByaW9yIHRvIHBhc3NpbmcgdGhlbSB0byB0aGUgb3JpZ2luYWwgc3RyZWFtc1xuICovXG5jbGFzcyBTdGFuZGFyZE91dFBhc3NUaHJvdWdoIHtcblxuXG4gICAgcHJpdmF0ZSByZWFkb25seSBzdGRvdXRQdCA9IG5ldyBQYXNzVGhyb3VnaCgpO1xuICAgIHByaXZhdGUgcmVhZG9ubHkgc3RkZXJyUHQgPSBuZXcgUGFzc1Rocm91Z2goKTtcblxuICAgIHByaXZhdGUgcmVhZG9ubHkgc3Rkb3V0O1xuICAgIHByaXZhdGUgcmVhZG9ubHkgc3RkZXJyO1xuXG4gICAgcHJpdmF0ZSByZWFkb25seSB3cml0ZVN0ZG91dDtcbiAgICBwcml2YXRlIHJlYWRvbmx5IHdyaXRlU3RkZXJyO1xuXG4gICAgY29uc3RydWN0b3Ioc3Rkb3V0Q2I6IChkYXRhOiBzdHJpbmcpID0+IHZvaWQsIHN0ZGVyckNiOiAoZGF0YTogc3RyaW5nKSA9PiB2b2lkKSB7XG4gICAgICAgIC8vIFN0b3JlIG9yaWdpbmFsIHdyaXRlIHN0ZG91dC9zdGRlcnIgd3JpdGUgZnVuY3Rpb25zXG4gICAgICAgIHRoaXMuc3Rkb3V0ID0gcHJvY2Vzcy5zdGRvdXQud3JpdGU7XG4gICAgICAgIHRoaXMuc3RkZXJyID0gcHJvY2Vzcy5zdGRlcnIud3JpdGU7XG5cbiAgICAgICAgLy8gQ3JlYXRlIGZ1bmN0aW9ucyB3aGljaCB3cml0ZSB0byBvcmlnaW5hbCB3cml0ZXMgd2l0aCBzdGRvdXQvc3RkZXJyIGNvbnRleHRzIGJvdW5kXG4gICAgICAgIHRoaXMud3JpdGVTdGRvdXQgPSAoZGF0YTogc3RyaW5nKSA9PiB0aGlzLnN0ZG91dC5jYWxsKHByb2Nlc3Muc3Rkb3V0LCBkYXRhKTtcbiAgICAgICAgdGhpcy53cml0ZVN0ZGVyciA9IChkYXRhOiBzdHJpbmcpID0+IHRoaXMuc3RkZXJyLmNhbGwocHJvY2Vzcy5zdGRlcnIsIGRhdGEpO1xuXG4gICAgICAgIC8vIEFzc2lnbiBsaXN0ZW5lcnMgdG8gUGFzc1Rocm91Z2hzXG4gICAgICAgIHRoaXMuc3Rkb3V0UHQub24oJ2RhdGEnLCAoZGF0YSkgPT4ge1xuICAgICAgICAgICAgaWYgKGRhdGEgaW5zdGFuY2VvZiBCdWZmZXIpIHtcbiAgICAgICAgICAgICAgICBkYXRhID0gZGF0YS50b1N0cmluZygndXRmOCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3Rkb3V0Q2IoZGF0YSk7XG4gICAgICAgICAgICB0aGlzLndyaXRlU3Rkb3V0KGRhdGEpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnN0ZGVyclB0Lm9uKCdkYXRhJywgKGRhdGEpID0+IHtcbiAgICAgICAgICAgIGlmIChkYXRhIGluc3RhbmNlb2YgQnVmZmVyKSB7XG4gICAgICAgICAgICAgICAgZGF0YSA9IGRhdGEudG9TdHJpbmcoJ3V0ZjgnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN0ZGVyckNiKGRhdGEpO1xuICAgICAgICAgICAgdGhpcy53cml0ZVN0ZGVycihkYXRhKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gUmVwbGFjZSBvcmlnaW5hbCB3cml0ZSBjYWxscyB3aXRoIGNvbnRleHRzIGJvdW5kIHRvIHBhcmVudCBvYmplY3RcbiAgICAgICAgcHJvY2Vzcy5zdGRvdXQud3JpdGUgPSB0aGlzLnN0ZG91dFB0LndyaXRlLmJpbmQodGhpcy5zdGRvdXRQdCkgYXMgYW55O1xuICAgICAgICBwcm9jZXNzLnN0ZGVyci53cml0ZSA9IHRoaXMuc3RkZXJyUHQud3JpdGUuYmluZCh0aGlzLnN0ZGVyclB0KSBhcyBhbnk7XG5cbiAgICAgICAgLy8gQWRkIHVuY2F1Z2h0IGVycm9yIGhhbmRsZXIgdG8gaGFuZGxlIGxvZ2dpbmcgb2YgZmFpbHVyZSBjYXNlXG4gICAgICAgIHByb2Nlc3Mub24oJ3VuY2F1Z2h0RXhjZXB0aW9uJywgKGVycikgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZWFmZml4IHRoZSByZXBsYWNlZCBzdGRvdXQgYW5kIHN0ZGVyciB0aGVuXG4gICAgICogY2xvc2VzIGFsbCBzdHJlYW1zIG93bmVkIGJ5IHRoaXMgaW5zdGFuY2UuXG4gICAgICovXG4gICAgcHVibGljIGRlc3Ryb3koKSB7XG4gICAgICAgIHByb2Nlc3Muc3Rkb3V0LndyaXRlID0gdGhpcy5zdGRvdXQ7XG4gICAgICAgIHByb2Nlc3Muc3RkZXJyLndyaXRlID0gdGhpcy5zdGRlcnI7XG5cbiAgICAgICAgdGhpcy5zdGRvdXRQdC5kZXN0cm95KClcbiAgICAgICAgdGhpcy5zdGRlcnJQdC5kZXN0cm95KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQnlwYXNzIHRoZSBjb25maWd1cmVkIGNhbGxiYWNrIGZ1bmN0aW9uIGZvciBzdGRvdXQgYnlcbiAgICAgKiB3cml0aW5nIGRpcmVjdGx5IHRvIHRoZSBkZXRhY2hlZCBvdXRwdXQgc3RyZWFtXG4gICAgICogQHBhcmFtIGRhdGEgXG4gICAgICovXG4gICAgcHVibGljIHN0ZG91dEJ5cGFzcyhkYXRhOiBzdHJpbmcgfCBvYmplY3QpIHtcbiAgICAgICAgaWYgKGRhdGEgaW5zdGFuY2VvZiBPYmplY3QpIHtcbiAgICAgICAgICAgIGRhdGEgPSBKU09OLnN0cmluZ2lmeShkYXRhKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLndyaXRlU3Rkb3V0KChkYXRhIGFzIHVua25vd24gYXMgc3RyaW5nKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQnlwYXNzIHRoZSBjb25maWd1cmVkIGNhbGxiYWNrIGZ1bmN0aW9uIGZvciBzdGRlcnIgYnlcbiAgICAgKiB3cml0aW5nIGRpcmVjdGx5IHRvIHRoZSBkZXRhY2hlZCBvdXRwdXQgc3RyZWFtXG4gICAgICogQHBhcmFtIGRhdGEgXG4gICAgICovXG4gICAgcHVibGljIHN0ZGVyckJ5cGFzcyhkYXRhOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy53cml0ZVN0ZGVycihkYXRhKTtcbiAgICB9XG59XG5cblxuLyoqXG4gKiBMYXp5IGxvYWQgbG9nZ2VyLCB3cml0ZSBidWZmZXJlZCBtZXNzYWdlcyBvbmNlIGxvYWRlZFxuICogTm90ZTogTGF6eSBsb2FkaW5nIGlzIG5lY2Vzc2FyeSB0byByZXNvbHZlIGNpcmN1bGFyIGRlcGVuZGVuY2llcyBiZXR3ZWVuIHRoaXNcbiAqIG1vZHVsZSBhbmQgdGhlIGxvZ2dlci5cbiAqL1xuKGFzeW5jICgpID0+IHtcbiAgICBjb25zdCB7IHdpdGhMb2dnZXIgfSA9IGF3YWl0IGltcG9ydCgnLi9sb2dnZXInKTtcbiAgICBjb25zdCBsZXZlbDogTlBNTG9nZ2luZ0xldmVscyA9IHByb2Nlc3MuZW52LkxPR19ERUxJVkVSWV9BR0VOVF9MRVZFTCBhcyBOUE1Mb2dnaW5nTGV2ZWxzIHx8ICd3YXJuJztcbiAgICBsb2cgPSB3aXRoTG9nZ2VyKCdOZXdSZWxpY0xvZ0ZvcndhcmRlcicsIGxldmVsKTtcbiAgICB3aGlsZShpbnRlcm5hbExvZ0J1ZmZlci5sZW5ndGgpIHtcbiAgICAgICAgY29uc3QgW2xldmVsLCBtZXNzYWdlXSA9IGludGVybmFsTG9nQnVmZmVyLnNoaWZ0KCkgYXMgW3N0cmluZywgc3RyaW5nXTtcbiAgICAgICAgKGxvZyBhcyBhbnkpW2xldmVsXShtZXNzYWdlKTtcbiAgICB9XG59KSgpO1xuIl19