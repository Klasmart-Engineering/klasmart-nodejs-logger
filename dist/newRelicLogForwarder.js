"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NewRelicLogTransport = void 0;

var _https = _interopRequireDefault(require("https"));

var _zlib = _interopRequireDefault(require("zlib"));

var _winstonTransport = _interopRequireDefault(require("winston-transport"));

var _fs = _interopRequireDefault(require("fs"));

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

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var API_HOSTNAME = process.env.KL_NR_LOG_HOSTNAME || 'log-api.eu.newrelic.com';
var API_PATH = process.env.KL_NR_LOG_PATH || '/log/v1';
var MAX_PAYLOAD_SIZE = Math.pow(10, 6);
var MAX_ATTRIBUTES_PER_EVENT = 255;
var MAX_ATTRIBUTE_NAME_LENGTH = 255;
var MAX_ATTRIBUTE_VALUE_LENGTH = 4096;
var log;
var internalLogBuffer = [];

var NewRelicLogTransport = /*#__PURE__*/function (_Transport) {
  _inherits(NewRelicLogTransport, _Transport);

  var _super = _createSuper(NewRelicLogTransport);

  function NewRelicLogTransport(opts, globalAttributes) {
    var _log;

    var _this;

    _classCallCheck(this, NewRelicLogTransport);

    _this = _super.call(this, opts);

    _defineProperty(_assertThisInitialized(_this), "config", void 0);

    _defineProperty(_assertThisInitialized(_this), "logQueue", []);

    _defineProperty(_assertThisInitialized(_this), "logLengthQueue", []);

    _defineProperty(_assertThisInitialized(_this), "totalLengthCount", 0);

    _defineProperty(_assertThisInitialized(_this), "globalAttributes", void 0);

    _defineProperty(_assertThisInitialized(_this), "logsWritten", 0);

    _this.setMaxListeners(Infinity);

    _this.internalLog('info', 'creating new relic transport');

    _this.globalAttributes = globalAttributes;
    _this.config = _objectSpread({
      bytesWrittenThreshold: MAX_PAYLOAD_SIZE * 4 / 5,
      warnOnAttributeLengthOverflow: false,
      minBytesWritten: MAX_PAYLOAD_SIZE * 1 / 5,
      minLogItems: 2,
      logPushFrequency: 60000,
      logCountThreshold: undefined,
      minLogItemsToForce: 100,
      internalLogLevel: undefined
    }, opts);
    _this.config.bytesWrittenThreshold = Math.min(_this.config.bytesWrittenThreshold || 0, MAX_PAYLOAD_SIZE * 4 / 5);
    if (log) (_log = log) === null || _log === void 0 ? void 0 : _log.transports.forEach(function (t) {
      return t.level = _this.config.internalLogLevel;
    });

    _this.registerAppDeathLogPush();

    _this.createLogCheckTimeout();

    return _this;
  }
  /**
   * Function to write logs that are internal to this module.
   * Buffers calls until the Winston logger can be async importd
   * Afterwords, writes logs directly to the logger
   * @param level 
   * @param message 
   */


  _createClass(NewRelicLogTransport, [{
    key: "internalLog",
    value: function internalLog(level, message) {
      if (log) {
        log[level](message);
      } else {
        internalLogBuffer.push([level, message]);
      }
    }
  }, {
    key: "log",
    value: function log(info, callback) {
      this.logTransform(info);
      var logString = JSON.stringify(info);
      var length = Buffer.byteLength(logString);
      this.logQueue.push(info);
      this.logLengthQueue.push(length);
      this.totalLengthCount += length;

      if (this.immediateLogWritablePredicate()) {
        this.beginWriteLogs();
      }

      if (callback) callback();
    }
  }, {
    key: "writeLogsSync",
    value: function writeLogsSync() {
      var logsToWrite = this.sliceLogs();
      this.internalLog('silly', "Preparing final log payload of ".concat(logsToWrite.length, " for NR collector"));
      var rawPayload = this.buildRawPostBody(logsToWrite);

      var compressedPayload = _zlib["default"].gzipSync(rawPayload);

      this.sendLogs(compressedPayload);
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
        var logsToWrite, rawPayload, compressedPayload;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                logsToWrite = this.sliceLogs();
                this.internalLog('silly', "Preparing log payload of ".concat(logsToWrite.length, " for NR collector"));
                rawPayload = this.buildRawPostBody(logsToWrite);
                _context.next = 5;
                return this.compressPayload(rawPayload);

              case 5:
                compressedPayload = _context.sent;
                this.sendLogs(compressedPayload);

              case 7:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function beginWriteLogs() {
        return _beginWriteLogs.apply(this, arguments);
      }

      return beginWriteLogs;
    }()
  }, {
    key: "sendLogs",
    value: function sendLogs(compressedPayload) {
      var _this2 = this;

      var req = _https["default"].request({
        hostname: API_HOSTNAME,
        path: API_PATH,
        port: 443,
        method: 'POST',
        headers: {
          'Accept': '*/*',
          'Api-Key': process.env.NEW_RELIC_LICENSE_KEY,
          'Content-Encoding': 'gzip',
          'Content-Length': compressedPayload.byteLength,
          'Content-Type': 'application/gzip'
        }
      });

      req.on('response', function (response) {
        if (response.statusCode && [202, 200].includes(response.statusCode)) {
          return;
        } else {
          _this2.internalLog('error', 'Error delivering logs to NR:');

          _this2.internalLog('error', "".concat(response.statusCode, " - ").concat(response.statusMessage));
        }
      });
      req.on('error', function (err) {
        var _err$stack;

        _this2.internalLog('error', (_err$stack = err.stack) !== null && _err$stack !== void 0 ? _err$stack : 'Error writing logs to New Relic');
      });
      req.write(compressedPayload);
      req.end();
    }
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
  }, {
    key: "immediateLogWritablePredicate",
    value: function immediateLogWritablePredicate() {
      if (this.logQueue.length > (this.config.minLogItemsToForce || 100)) {
        return true;
      }

      return false;
    }
  }, {
    key: "logsWritablePredicate",
    value: function logsWritablePredicate() {
      return this.minLogItemsExceeded();
    }
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
        this.internalLog('warn', "Log to send to JSON contains ".concat(Object.getOwnPropertyNames(log), " / ").concat(MAX_ATTRIBUTES_PER_EVENT, " attributes."));
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
            this.internalLog('warn', "NR Log attribute length overflow. Length: ".concat(value.length, "/").concat(MAX_ATTRIBUTE_VALUE_LENGTH));
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
  }, {
    key: "createLogCheckTimeout",
    value: function createLogCheckTimeout() {
      var _this3 = this;

      setTimeout( /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                if (!(_this3.logQueue.length > (_this3.config.minLogItems || 1))) {
                  _context3.next = 4;
                  break;
                }

                _context3.next = 3;
                return _this3.beginWriteLogs();

              case 3:
                _this3.createLogCheckTimeout();

              case 4:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3);
      })), this.config.logPushFrequency);
    }
  }, {
    key: "registerAppDeathLogPush",
    value: function registerAppDeathLogPush() {
      var _this4 = this;

      var finalWritten = false;
      process.on('exit', function () {
        var o = finalWritten;
        finalWritten = true;
        if (o) return;

        _this4.internalLog('info', 'writing final logs');

        _this4.writeLogsSync();
      });
      process.on('SIGINT', function () {
        process.exit(2);
      });
      process.on('uncaughtException', function (e) {
        _this4.internalLog('error', e.stack || '');
      });
      process.on('SIGTERM', function () {
        _this4.writeLogsSync();
      });
    }
  }]);

  return NewRelicLogTransport;
}(_winstonTransport["default"]);

exports.NewRelicLogTransport = NewRelicLogTransport;

_defineProperty(NewRelicLogTransport, "gzipOpts", {});

var createInternalLogger = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
  var _yield$import, withLogger, _ref4, _ref5, level, message;

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
          log = withLogger('NewRelicLogForwarder');

          while (internalLogBuffer.length) {
            _ref4 = internalLogBuffer.shift(), _ref5 = _slicedToArray(_ref4, 2), level = _ref5[0], message = _ref5[1];
            log[level](message);
          }

        case 6:
        case "end":
          return _context4.stop();
      }
    }
  }, _callee4);
}))();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9uZXdSZWxpY0xvZ0ZvcndhcmRlci50cyJdLCJuYW1lcyI6WyJBUElfSE9TVE5BTUUiLCJwcm9jZXNzIiwiZW52IiwiS0xfTlJfTE9HX0hPU1ROQU1FIiwiQVBJX1BBVEgiLCJLTF9OUl9MT0dfUEFUSCIsIk1BWF9QQVlMT0FEX1NJWkUiLCJNQVhfQVRUUklCVVRFU19QRVJfRVZFTlQiLCJNQVhfQVRUUklCVVRFX05BTUVfTEVOR1RIIiwiTUFYX0FUVFJJQlVURV9WQUxVRV9MRU5HVEgiLCJsb2ciLCJpbnRlcm5hbExvZ0J1ZmZlciIsIk5ld1JlbGljTG9nVHJhbnNwb3J0Iiwib3B0cyIsImdsb2JhbEF0dHJpYnV0ZXMiLCJzZXRNYXhMaXN0ZW5lcnMiLCJJbmZpbml0eSIsImludGVybmFsTG9nIiwiY29uZmlnIiwiYnl0ZXNXcml0dGVuVGhyZXNob2xkIiwid2Fybk9uQXR0cmlidXRlTGVuZ3RoT3ZlcmZsb3ciLCJtaW5CeXRlc1dyaXR0ZW4iLCJtaW5Mb2dJdGVtcyIsImxvZ1B1c2hGcmVxdWVuY3kiLCJsb2dDb3VudFRocmVzaG9sZCIsInVuZGVmaW5lZCIsIm1pbkxvZ0l0ZW1zVG9Gb3JjZSIsImludGVybmFsTG9nTGV2ZWwiLCJNYXRoIiwibWluIiwidHJhbnNwb3J0cyIsImZvckVhY2giLCJ0IiwibGV2ZWwiLCJyZWdpc3RlckFwcERlYXRoTG9nUHVzaCIsImNyZWF0ZUxvZ0NoZWNrVGltZW91dCIsIm1lc3NhZ2UiLCJwdXNoIiwiaW5mbyIsImNhbGxiYWNrIiwibG9nVHJhbnNmb3JtIiwibG9nU3RyaW5nIiwiSlNPTiIsInN0cmluZ2lmeSIsImxlbmd0aCIsIkJ1ZmZlciIsImJ5dGVMZW5ndGgiLCJsb2dRdWV1ZSIsImxvZ0xlbmd0aFF1ZXVlIiwidG90YWxMZW5ndGhDb3VudCIsImltbWVkaWF0ZUxvZ1dyaXRhYmxlUHJlZGljYXRlIiwiYmVnaW5Xcml0ZUxvZ3MiLCJsb2dzVG9Xcml0ZSIsInNsaWNlTG9ncyIsInJhd1BheWxvYWQiLCJidWlsZFJhd1Bvc3RCb2R5IiwiY29tcHJlc3NlZFBheWxvYWQiLCJ6bGliIiwiZ3ppcFN5bmMiLCJzZW5kTG9ncyIsImJ1ZmZlciIsImZzIiwid3JpdGVGaWxlU3luYyIsImxvZ3NXcml0dGVuIiwiY29tcHJlc3NQYXlsb2FkIiwicmVxIiwiaHR0cHMiLCJyZXF1ZXN0IiwiaG9zdG5hbWUiLCJwYXRoIiwicG9ydCIsIm1ldGhvZCIsImhlYWRlcnMiLCJORVdfUkVMSUNfTElDRU5TRV9LRVkiLCJvbiIsInJlc3BvbnNlIiwic3RhdHVzQ29kZSIsImluY2x1ZGVzIiwic3RhdHVzTWVzc2FnZSIsImVyciIsInN0YWNrIiwid3JpdGUiLCJlbmQiLCJsb2dzIiwicGF5bG9hZCIsImNvbW1vbiIsImF0dHJpYnV0ZXMiLCJzZXJ2aWNlIiwiTkVXX1JFTElDX0FQUF9OQU1FIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJnemlwIiwiZnJvbSIsImxvZ3NUb1NlbmQiLCJsb2dTaXplIiwibG9nU2xpY2VJbmRleCIsInNsaWNlIiwibWluTG9nSXRlbXNFeGNlZWRlZCIsIk9iamVjdCIsImdldE93blByb3BlcnR5TmFtZXMiLCJrZXlzIiwia2V5IiwidmFsdWUiLCJuZXdLZXkiLCJkZWZpbmVQcm9wZXJ0eSIsImdldE93blByb3BlcnR5RGVzY3JpcHRvciIsInJlcGxhY2VBbGwiLCJzZXRUaW1lb3V0IiwiZmluYWxXcml0dGVuIiwibyIsIndyaXRlTG9nc1N5bmMiLCJleGl0IiwiZSIsIlRyYW5zcG9ydCIsImNyZWF0ZUludGVybmFsTG9nZ2VyIiwid2l0aExvZ2dlciIsInNoaWZ0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFHQSxJQUFNQSxZQUFZLEdBQUdDLE9BQU8sQ0FBQ0MsR0FBUixDQUFZQyxrQkFBWixJQUFrQyx5QkFBdkQ7QUFDQSxJQUFNQyxRQUFRLEdBQUdI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LElBQVcsRUFBckM7QUFDSCxPQUZEO0FBSUEvRSxNQUFBQSxPQUFPLENBQUN5RSxFQUFSLENBQVcsU0FBWCxFQUFzQixZQUFNO0FBQ3hCLFFBQUEsTUFBSSxDQUFDcUMsYUFBTDtBQUNILE9BRkQ7QUFHSDs7OztFQWhRcUNHLDRCOzs7O2dCQUE3QnRHLG9CLGNBQzRDLEU7O0FBa1F6RCxJQUFNdUcsb0JBQW9CLEdBQUUsd0RBQUM7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxtREFDVyxVQURYO0FBQUE7O0FBQUE7QUFBQTtBQUNqQkMsVUFBQUEsVUFEaUIsaUJBQ2pCQSxVQURpQjtBQUV6QjFHLFVBQUFBLEdBQUcsR0FBRzBHLFVBQVUsQ0FBQyxzQkFBRCxDQUFoQjs7QUFDQSxpQkFBTXpHLGlCQUFpQixDQUFDaUMsTUFBeEIsRUFBZ0M7QUFBQSxvQkFDSGpDLGlCQUFpQixDQUFDMEcsS0FBbEIsRUFERyxvQ0FDckJwRixLQURxQixhQUNkRyxPQURjO0FBRTNCMUIsWUFBQUEsR0FBRCxDQUFhdUIsS0FBYixFQUFvQkcsT0FBcEI7QUFDSDs7QUFOd0I7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsQ0FBRCxJQUE1QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBodHRwcyBmcm9tICdodHRwcyc7XG5pbXBvcnQgemxpYiBmcm9tICd6bGliJztcbmltcG9ydCBUcmFuc3BvcnQgZnJvbSAnd2luc3Rvbi10cmFuc3BvcnQnO1xuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCB7IExvZ2dlciB9IGZyb20gJ3dpbnN0b24nO1xuXG5jb25zdCBBUElfSE9TVE5BTUUgPSBwcm9jZXNzLmVudi5LTF9OUl9MT0dfSE9TVE5BTUUgfHwgJ2xvZy1hcGkuZXUubmV3cmVsaWMuY29tJztcbmNvbnN0IEFQSV9QQVRIID0gcHJvY2Vzcy5lbnYuS0xfTlJfTE9HX1BBVEggfHwgJy9sb2cvdjEnO1xuY29uc3QgTUFYX1BBWUxPQURfU0laRSA9IDEwKio2O1xuY29uc3QgTUFYX0FUVFJJQlVURVNfUEVSX0VWRU5UID0gMjU1O1xuY29uc3QgTUFYX0FUVFJJQlVURV9OQU1FX0xFTkdUSCA9IDI1NTtcbmNvbnN0IE1BWF9BVFRSSUJVVEVfVkFMVUVfTEVOR1RIID0gNDA5NjtcbmxldCBsb2c6IExvZ2dlciB8IHVuZGVmaW5lZDtcbmxldCBpbnRlcm5hbExvZ0J1ZmZlcjogQXJyYXk8W3N0cmluZywgc3RyaW5nXT4gPSBbXTtcbmludGVyZmFjZSBVbmlxdWVOZXdSZWxpY0xvZ1RyYW5zcG9ydE9wdGlvbnMge1xuICAgIC8qKlxuICAgICAqIEhvdyBmcmVxdWVudGx5IGNoZWNrcyBzaG91bGQgYmUgcnVuIHRvIHB1c2ggbG9ncyB0byBOUlxuICAgICAqIERlZmF1bHQgaXMgMTAgc2Vjb25kc1xuICAgICAqL1xuICAgIGxvZ1B1c2hGcmVxdWVuY3k/OiBudW1iZXI7XG5cbiAgICAvKipcbiAgICAgKiBNaW5pbXVtIG51bWJlciBvZiBsb2cgc3RhdGVtZW50cyB3cml0dGVuIGJlZm9yZSBsb2dzIGNhbiBiZSBwdXNoZWQgdG8gTlJcbiAgICAgKiBieSBwZXJpb2RpYyBsb2dnZXIuXG4gICAgICogRGVmYXVsdCBpcyAyXG4gICAgICovXG4gICAgbWluTG9nSXRlbXM/OiBudW1iZXI7XG5cblxuICAgIC8qKlxuICAgICAqIE1pbmltdW0gbnVtYmVyIG9mIGxvZyBzdGF0ZW1lbnRzIHRvIGZvcmNlIGFuIGltbWVkaWF0ZSBwdXNoIHRvIE5SLiBVc2VkXG4gICAgICogdG8gZW5zdXJlIHRoYXQgdGhlIGxvZ2dpbmcgc3lzdGVtIGRvZXMgbm90IGdldCBiYWNrZWQgdXAgaWYgYW1vdW50IGJlaW5nXG4gICAgICogbG9nZ2VkIHN1cnBhc3NlcyB0aGUgYmFuZHdpZHRoIG9mIHRoZSBwZXJpb2RpYyBsb2dnZXIuXG4gICAgICogRGVmYXVsdCBpcyAxMDAuXG4gICAgICovXG4gICAgbWluTG9nSXRlbXNUb0ZvcmNlPzogbnVtYmVyO1xuXG4gICAgLyoqXG4gICAgICogTWluaW11bSBudW1iZXIgb2YgbG9nIHN0YXRlbWVudHMgdG8gaW1tZWRpYXRlbHkgdHJpZ2dlciBhIHB1c2ggdG8gTlIuXG4gICAgICogRGVmYXVsdCBpcyB1bmRlZmluZWRcbiAgICAgKi9cbiAgICBsb2dDb3VudFRocmVzaG9sZD86IG51bWJlciB8IHVuZGVmaW5lZDtcblxuICAgIC8qKlxuICAgICAqIE1pbmltdW0gbnVtYmVyIG9mIGJ5dGVzIHdyaXR0ZW4gdG8gY29tcHJlc3Npb24gc3RyZWFtIGJlZm9yZSBwdXNoaW5nIHRvIE5SXG4gICAgICovXG4gICAgbWluQnl0ZXNXcml0dGVuPzogbnVtYmVyO1xuXG4gICAgLyoqXG4gICAgICogVGhyZXNob2xkIGZvciBieXRlcyB3cml0dGVuIGF0IHdoaWNoIHBvaW50IGEgbmV3IHdyaXRlIHRvIE5SIHdpbGwgYmUgYXV0b21hdGljYWxseVxuICAgICAqIHRyaWdnZXJlZC4gRGVmYXVsdHMgdG8gKDQvNSAqIE1BWF9QQVlMT0FEX1NJWkUpXG4gICAgICovXG4gICAgYnl0ZXNXcml0dGVuVGhyZXNob2xkPzogbnVtYmVyO1xuXG4gICAgLyoqXG4gICAgICogUHJvZHVjZSBhIHdhcm5pbmcgd2hlbiBhdHRyaWJ1dGUgdmFsdWVzIG92ZXJmbG93IHRoZSBOUiBtYXhpbXVtIGxlbmd0aCBvZiA0MDk2LlxuICAgICAqIERlZmF1bHQgaXMgZmFsc2UuXG4gICAgICovXG4gICAgd2Fybk9uQXR0cmlidXRlTGVuZ3RoT3ZlcmZsb3c/OiBib29sZWFuO1xuXG4gICAgLyoqXG4gICAgICogTG9nIGxldmVsIG9mIGludGVybmFsIGxvZ2dlciwgcGFzcyB0aGlzIHZhbHVlIGlmIHlvdSB3YW50IHRoZSBsb2dnZXJcbiAgICAgKiB1c2VkIGluIHRoZSBOZXdSZWxpY0xvZ0ZvcndhcmRlciBtb2R1bGUgdG8gYmUgZGlmZmVyZW50IHRoYW4gdGhlIGdsb2JhbFxuICAgICAqIGRlZmF1bHQgbG9nZ2luZyBsZXZlbC5cbiAgICAgKiBEZWZhdWx0IGlzIHVuZGVmaW5lZC5cbiAgICAgKi9cbiAgICBpbnRlcm5hbExvZ0xldmVsPzogJ3NpbGx5JyB8ICdkZWJ1ZycgfCAndmVyYm9zZScgfCAnaHR0cCcgfCAnaW5mbycgfCAnd2FybicgfCAnZXJyb3InIHwgdW5kZWZpbmVkO1xufVxuXG50eXBlIE5ld1JlbGljTG9nVHJhbnNwb3J0T3B0aW9ucyA9IFVuaXF1ZU5ld1JlbGljTG9nVHJhbnNwb3J0T3B0aW9ucyAmIFRyYW5zcG9ydC5UcmFuc3BvcnRTdHJlYW1PcHRpb25zO1xuXG50eXBlIFJlcXVpcmVkS2VlcFVuZGVmaW5lZDxUPiA9IHsgW0sgaW4ga2V5b2YgVF0tPzogW1RbS11dIH0gZXh0ZW5kcyBpbmZlciBVXG4gID8gVSBleHRlbmRzIFJlY29yZDxrZXlvZiBVLCBbYW55XT4gPyB7IFtLIGluIGtleW9mIFVdOiBVW0tdWzBdIH0gOiBuZXZlclxuICA6IG5ldmVyO1xuXG5leHBvcnQgY2xhc3MgTmV3UmVsaWNMb2dUcmFuc3BvcnQgZXh0ZW5kcyBUcmFuc3BvcnQge1xuICAgIHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IGd6aXBPcHRzOiB6bGliLlpsaWJPcHRpb25zID0ge1xuICAgICAgICBcbiAgICB9XG4gICAgcHJpdmF0ZSBjb25maWc6IFJlcXVpcmVkS2VlcFVuZGVmaW5lZDxVbmlxdWVOZXdSZWxpY0xvZ1RyYW5zcG9ydE9wdGlvbnM+ICYgVHJhbnNwb3J0LlRyYW5zcG9ydFN0cmVhbU9wdGlvbnM7XG4gICAgcHJpdmF0ZSBsb2dRdWV1ZTogYW55W10gPSBbXTtcbiAgICBwcml2YXRlIGxvZ0xlbmd0aFF1ZXVlOiBudW1iZXJbXSA9IFtdO1xuICAgIHByaXZhdGUgdG90YWxMZW5ndGhDb3VudCA9IDA7XG4gICAgcHJpdmF0ZSBnbG9iYWxBdHRyaWJ1dGVzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfTtcblxuICAgIFxuICAgIGNvbnN0cnVjdG9yKG9wdHM6IE5ld1JlbGljTG9nVHJhbnNwb3J0T3B0aW9ucywgZ2xvYmFsQXR0cmlidXRlczoge1trZXk6IHN0cmluZ106IHN0cmluZ30pIHtcbiAgICAgICAgc3VwZXIob3B0cyk7XG4gICAgICAgIHRoaXMuc2V0TWF4TGlzdGVuZXJzKEluZmluaXR5KTtcbiAgICAgICAgdGhpcy5pbnRlcm5hbExvZygnaW5mbycsICdjcmVhdGluZyBuZXcgcmVsaWMgdHJhbnNwb3J0Jyk7XG4gICAgICAgIHRoaXMuZ2xvYmFsQXR0cmlidXRlcyA9IGdsb2JhbEF0dHJpYnV0ZXM7XG4gICAgICAgIHRoaXMuY29uZmlnID0ge1xuICAgICAgICAgICAgYnl0ZXNXcml0dGVuVGhyZXNob2xkOiBNQVhfUEFZTE9BRF9TSVpFICogNCAvIDUsXG4gICAgICAgICAgICB3YXJuT25BdHRyaWJ1dGVMZW5ndGhPdmVyZmxvdzogZmFsc2UsXG4gICAgICAgICAgICBtaW5CeXRlc1dyaXR0ZW46IE1BWF9QQVlMT0FEX1NJWkUgKiAxIC8gNSxcbiAgICAgICAgICAgIG1pbkxvZ0l0ZW1zOiAyLFxuICAgICAgICAgICAgbG9nUHVzaEZyZXF1ZW5jeTogNjAwMDAsXG4gICAgICAgICAgICBsb2dDb3VudFRocmVzaG9sZDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgbWluTG9nSXRlbXNUb0ZvcmNlOiAxMDAsXG4gICAgICAgICAgICBpbnRlcm5hbExvZ0xldmVsOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAuLi5vcHRzXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5jb25maWcuYnl0ZXNXcml0dGVuVGhyZXNob2xkID0gTWF0aC5taW4odGhpcy5jb25maWcuYnl0ZXNXcml0dGVuVGhyZXNob2xkIHx8IDAsIE1BWF9QQVlMT0FEX1NJWkUgKiA0IC8gNSk7XG4gICAgICAgIGlmIChsb2cpXG4gICAgICAgIGxvZz8udHJhbnNwb3J0cy5mb3JFYWNoKHQgPT4gdC5sZXZlbCA9IHRoaXMuY29uZmlnLmludGVybmFsTG9nTGV2ZWwpO1xuICAgICAgICB0aGlzLnJlZ2lzdGVyQXBwRGVhdGhMb2dQdXNoKCk7XG4gICAgICAgIHRoaXMuY3JlYXRlTG9nQ2hlY2tUaW1lb3V0KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRnVuY3Rpb24gdG8gd3JpdGUgbG9ncyB0aGF0IGFyZSBpbnRlcm5hbCB0byB0aGlzIG1vZHVsZS5cbiAgICAgKiBCdWZmZXJzIGNhbGxzIHVudGlsIHRoZSBXaW5zdG9uIGxvZ2dlciBjYW4gYmUgYXN5bmMgaW1wb3J0ZFxuICAgICAqIEFmdGVyd29yZHMsIHdyaXRlcyBsb2dzIGRpcmVjdGx5IHRvIHRoZSBsb2dnZXJcbiAgICAgKiBAcGFyYW0gbGV2ZWwgXG4gICAgICogQHBhcmFtIG1lc3NhZ2UgXG4gICAgICovXG4gICAgaW50ZXJuYWxMb2cobGV2ZWw6IHN0cmluZywgbWVzc2FnZTogc3RyaW5nKSB7XG4gICAgICAgIGlmIChsb2cpIHtcbiAgICAgICAgICAgIChsb2cgYXMgYW55KVtsZXZlbF0obWVzc2FnZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpbnRlcm5hbExvZ0J1ZmZlci5wdXNoKFtsZXZlbCwgbWVzc2FnZV0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgbG9nKGluZm86IGFueSwgY2FsbGJhY2s6ICgoKSA9PiB2b2lkKSB8IHVuZGVmaW5lZCkge1xuICAgICAgICB0aGlzLmxvZ1RyYW5zZm9ybShpbmZvKTtcbiAgICAgICAgY29uc3QgbG9nU3RyaW5nID0gSlNPTi5zdHJpbmdpZnkoaW5mbyk7XG4gICAgICAgIGNvbnN0IGxlbmd0aCA9IEJ1ZmZlci5ieXRlTGVuZ3RoKGxvZ1N0cmluZyk7XG4gICAgICAgIHRoaXMubG9nUXVldWUucHVzaChpbmZvKTtcbiAgICAgICAgdGhpcy5sb2dMZW5ndGhRdWV1ZS5wdXNoKGxlbmd0aCk7XG4gICAgICAgIHRoaXMudG90YWxMZW5ndGhDb3VudCArPSBsZW5ndGg7XG5cbiAgICAgICAgaWYgKHRoaXMuaW1tZWRpYXRlTG9nV3JpdGFibGVQcmVkaWNhdGUoKSkge1xuICAgICAgICAgICAgdGhpcy5iZWdpbldyaXRlTG9ncygpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjYWxsYmFjaykgY2FsbGJhY2soKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHdyaXRlTG9nc1N5bmMoKSB7XG4gICAgICAgIGNvbnN0IGxvZ3NUb1dyaXRlID0gdGhpcy5zbGljZUxvZ3MoKTtcbiAgICAgICAgdGhpcy5pbnRlcm5hbExvZygnc2lsbHknLCBgUHJlcGFyaW5nIGZpbmFsIGxvZyBwYXlsb2FkIG9mICR7bG9nc1RvV3JpdGUubGVuZ3RofSBmb3IgTlIgY29sbGVjdG9yYCk7XG4gICAgICAgIGNvbnN0IHJhd1BheWxvYWQgPSB0aGlzLmJ1aWxkUmF3UG9zdEJvZHkobG9nc1RvV3JpdGUpO1xuICAgICAgICBjb25zdCBjb21wcmVzc2VkUGF5bG9hZCA9IHpsaWIuZ3ppcFN5bmMocmF3UGF5bG9hZCk7XG4gICAgICAgIHRoaXMuc2VuZExvZ3MoY29tcHJlc3NlZFBheWxvYWQpO1xuICAgIH1cblxuICAgIHByaXZhdGUgbG9nc1dyaXR0ZW4gPSAwO1xuICAgIHB1YmxpYyB3cml0ZUxvZ3NUb0ZpbGVTeXN0ZW0oYnVmZmVyOiBCdWZmZXIpIHtcbiAgICAgICAgZnMud3JpdGVGaWxlU3luYyhgdGVzdC0ke3RoaXMubG9nc1dyaXR0ZW4rK30uZ3pgLCBidWZmZXIpO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgYmVnaW5Xcml0ZUxvZ3MoKSB7XG4gICAgICAgIGNvbnN0IGxvZ3NUb1dyaXRlID0gdGhpcy5zbGljZUxvZ3MoKTtcblxuICAgICAgICB0aGlzLmludGVybmFsTG9nKCdzaWxseScsIGBQcmVwYXJpbmcgbG9nIHBheWxvYWQgb2YgJHtsb2dzVG9Xcml0ZS5sZW5ndGh9IGZvciBOUiBjb2xsZWN0b3JgKTtcbiAgICAgICAgY29uc3QgcmF3UGF5bG9hZCA9IHRoaXMuYnVpbGRSYXdQb3N0Qm9keShsb2dzVG9Xcml0ZSk7XG4gICAgICAgIGNvbnN0IGNvbXByZXNzZWRQYXlsb2FkOiBCdWZmZXIgPSBhd2FpdCB0aGlzLmNvbXByZXNzUGF5bG9hZChyYXdQYXlsb2FkKTtcbiAgICAgICAgdGhpcy5zZW5kTG9ncyhjb21wcmVzc2VkUGF5bG9hZCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzZW5kTG9ncyhjb21wcmVzc2VkUGF5bG9hZDogQnVmZmVyKSB7XG4gICAgICAgIGNvbnN0IHJlcSA9IGh0dHBzLnJlcXVlc3Qoe1xuICAgICAgICAgICAgaG9zdG5hbWU6IEFQSV9IT1NUTkFNRSxcbiAgICAgICAgICAgIHBhdGg6IEFQSV9QQVRILFxuICAgICAgICAgICAgcG9ydDogNDQzLFxuICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgJ0FjY2VwdCc6ICcqLyonLFxuICAgICAgICAgICAgICAgICdBcGktS2V5JzogcHJvY2Vzcy5lbnYuTkVXX1JFTElDX0xJQ0VOU0VfS0VZLFxuICAgICAgICAgICAgICAgICdDb250ZW50LUVuY29kaW5nJzogJ2d6aXAnLFxuICAgICAgICAgICAgICAgICdDb250ZW50LUxlbmd0aCc6IGNvbXByZXNzZWRQYXlsb2FkLmJ5dGVMZW5ndGgsXG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9nemlwJyxcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmVxLm9uKCdyZXNwb25zZScsIHJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgIGlmKHJlc3BvbnNlLnN0YXR1c0NvZGUgJiYgWzIwMiwgMjAwXS5pbmNsdWRlcyhyZXNwb25zZS5zdGF0dXNDb2RlKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pbnRlcm5hbExvZygnZXJyb3InLCAnRXJyb3IgZGVsaXZlcmluZyBsb2dzIHRvIE5SOicpO1xuICAgICAgICAgICAgICAgIHRoaXMuaW50ZXJuYWxMb2coJ2Vycm9yJywgYCR7cmVzcG9uc2Uuc3RhdHVzQ29kZX0gLSAke3Jlc3BvbnNlLnN0YXR1c01lc3NhZ2V9YClcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmVxLm9uKCdlcnJvcicsIChlcnIpID0+IHtcbiAgICAgICAgICAgIHRoaXMuaW50ZXJuYWxMb2coJ2Vycm9yJywgZXJyLnN0YWNrID8/ICdFcnJvciB3cml0aW5nIGxvZ3MgdG8gTmV3IFJlbGljJylcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmVxLndyaXRlKGNvbXByZXNzZWRQYXlsb2FkKTtcbiAgICAgICAgcmVxLmVuZCgpO1xuICAgIH1cblxuICAgIHByaXZhdGUgYnVpbGRSYXdQb3N0Qm9keShsb2dzOiBhbnlbXSk6IHN0cmluZyB7XG4gICAgICAgIGNvbnN0IHBheWxvYWQgPSBbe1xuICAgICAgICAgICAgY29tbW9uOiB7XG4gICAgICAgICAgICAgICAgYXR0cmlidXRlczoge1xuICAgICAgICAgICAgICAgICAgICAuLi50aGlzLmdsb2JhbEF0dHJpYnV0ZXMsXG4gICAgICAgICAgICAgICAgICAgIHNlcnZpY2U6IHByb2Nlc3MuZW52Lk5FV19SRUxJQ19BUFBfTkFNRVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbG9nczogbG9nc1xuICAgICAgICB9XTtcbiAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHBheWxvYWQpO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgY29tcHJlc3NQYXlsb2FkKHJhd1BheWxvYWQ6IHN0cmluZyk6IFByb21pc2U8QnVmZmVyPiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTxCdWZmZXI+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIHpsaWIuZ3ppcChCdWZmZXIuZnJvbShyYXdQYXlsb2FkLCAndXRmOCcpLCAoZXJyLCBjb21wcmVzc2VkUGF5bG9hZCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgICAgIHJlc29sdmUoY29tcHJlc3NlZFBheWxvYWQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgc2xpY2VMb2dzKCkge1xuICAgICAgICBsZXQgbG9nc1RvU2VuZDtcbiAgICAgICAgXG4gICAgICAgIC8vIElmIHdlIGtub3cgdGhlIHRvdGFsIGxlbmd0aCB3aWxsIG5vdCBleGNlZWQgbWF4aW11bSBsZW5ndGggc2l6ZVxuICAgICAgICBpZiAodGhpcy50b3RhbExlbmd0aENvdW50IDwgTUFYX1BBWUxPQURfU0laRSkge1xuICAgICAgICAgICAgW2xvZ3NUb1NlbmQsIHRoaXMubG9nUXVldWVdID0gW3RoaXMubG9nUXVldWUsIFtdXTtcbiAgICAgICAgICAgIHRoaXMubG9nTGVuZ3RoUXVldWUgPSBbXTtcbiAgICAgICAgICAgIHRoaXMudG90YWxMZW5ndGhDb3VudCA9IDA7XG4gICAgICAgICAgICByZXR1cm4gbG9nc1RvU2VuZDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIG90aGVyd2lzZSwgc2xpY2Ugb2ZmIGEgc2xpY2Ugb2YgbG9ncyB0aGF0IHdpbGwgZml0IGludG8gYSBzaW5nbGUgcmVxdWVzdFxuICAgICAgICBsZXQgbG9nU2l6ZSA9IDA7XG4gICAgICAgIGxldCBsb2dTbGljZUluZGV4ID0gMDtcblxuICAgICAgICB3aGlsZSgodGhpcy5sb2dRdWV1ZS5sZW5ndGggPiAwKSAmJiAobG9nU2l6ZSArIHRoaXMubG9nTGVuZ3RoUXVldWVbMF0gPCBNQVhfUEFZTE9BRF9TSVpFKSkge1xuICAgICAgICAgICAgbG9nU2xpY2VJbmRleCsrO1xuICAgICAgICB9XG5cbiAgICAgICAgbG9nc1RvU2VuZCA9IHRoaXMubG9nUXVldWUuc2xpY2UoMCwgbG9nU2xpY2VJbmRleCk7XG4gICAgICAgIHRoaXMubG9nUXVldWUgPSB0aGlzLmxvZ1F1ZXVlLnNsaWNlKGxvZ1NsaWNlSW5kZXgpO1xuICAgICAgICB0aGlzLmxvZ0xlbmd0aFF1ZXVlID0gdGhpcy5sb2dMZW5ndGhRdWV1ZS5zbGljZShsb2dTbGljZUluZGV4KTtcblxuICAgICAgICByZXR1cm4gbG9nc1RvU2VuZDtcbiAgICB9XG5cbiAgICBwcml2YXRlIGltbWVkaWF0ZUxvZ1dyaXRhYmxlUHJlZGljYXRlKCk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAodGhpcy5sb2dRdWV1ZS5sZW5ndGggPiAodGhpcy5jb25maWcubWluTG9nSXRlbXNUb0ZvcmNlIHx8IDEwMCkpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGxvZ3NXcml0YWJsZVByZWRpY2F0ZSgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWluTG9nSXRlbXNFeGNlZWRlZCgpXG4gICAgfVxuXG4gICAgcHJpdmF0ZSBtaW5Mb2dJdGVtc0V4Y2VlZGVkKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gISEodGhpcy5jb25maWcubWluTG9nSXRlbXMgJiYgKHRoaXMubG9nUXVldWUubGVuZ3RoID4gdGhpcy5jb25maWcubWluTG9nSXRlbXMpKTtcbiAgICB9ICAgIFxuICAgIFxuICAgIC8qKlxuICAgICAqIEZpeGVzIHBvc3NpYmxlIGlzc3VlcyBpbiBsb2cgZm9ybWF0IGNhdXNlZCBieSBsaW1pdGF0aW9ucyBvZiBOUnMgbG9nZ2luZ1xuICAgICAqIHZhbHVlc1xuICAgICAqIEBwYXJhbSBsb2cgXG4gICAgICogQHJldHVybnMgXG4gICAgICovXG4gICAgcHJpdmF0ZSBsb2dUcmFuc2Zvcm0obG9nOiBhbnkpIHtcbiAgICAgICAgaWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGxvZykubGVuZ3RoID4gTUFYX0FUVFJJQlVURVNfUEVSX0VWRU5UKSB7XG4gICAgICAgICAgICB0aGlzLmludGVybmFsTG9nKCd3YXJuJywgYExvZyB0byBzZW5kIHRvIEpTT04gY29udGFpbnMgJHtPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhsb2cpfSAvICR7TUFYX0FUVFJJQlVURVNfUEVSX0VWRU5UfSBhdHRyaWJ1dGVzLmApO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBmb3IgKGxldCBrZXkgb2YgT2JqZWN0LmtleXMobG9nKSkge1xuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBsb2dba2V5XTtcbiAgICAgICAgICAgIC8vIHJlcGxhY2Uga2V5IHdpdGggbGVuZ3RoIHRvbyBoaWdoXG4gICAgICAgICAgICBpZiAoa2V5Lmxlbmd0aCA+IE1BWF9BVFRSSUJVVEVfTkFNRV9MRU5HVEgpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBuZXdLZXkgPSBrZXkuc2xpY2UoMCwgTUFYX0FUVFJJQlVURV9OQU1FX0xFTkdUSCk7XG4gICAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGxvZywga2V5LnNsaWNlKDAsIE1BWF9BVFRSSUJVVEVfTkFNRV9MRU5HVEgpLCBcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihsb2csIGtleSBhcyBQcm9wZXJ0eUtleSkgYXMgUHJvcGVydHlEZXNjcmlwdG9yKTtcbiAgICAgICAgICAgICAgICBkZWxldGUgbG9nLmtleTtcblxuICAgICAgICAgICAgICAgIC8vIFVwZGF0ZSBrZXkgbmFtZSBmb3IgdXNhZ2UgaW4gbGF0ZXIgc3RlcHNcbiAgICAgICAgICAgICAgICBrZXkgPSBuZXdLZXk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIENvbmNhdGVuYXRlIGxvZyBtZXNzYWdlcyB3aXRoIGxlbmd0aCBncmVhdGVyIHRoYW4gTUFYX0FUVFJJQlVURV9WQUxVRV9MRU5HVEhcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmIHZhbHVlLmxlbmd0aCA+IE1BWF9BVFRSSUJVVEVfVkFMVUVfTEVOR1RIKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY29uZmlnPy53YXJuT25BdHRyaWJ1dGVMZW5ndGhPdmVyZmxvdykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmludGVybmFsTG9nKCd3YXJuJywgYE5SIExvZyBhdHRyaWJ1dGUgbGVuZ3RoIG92ZXJmbG93LiBMZW5ndGg6ICR7dmFsdWUubGVuZ3RofS8ke01BWF9BVFRSSUJVVEVfVkFMVUVfTEVOR1RIfWApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBsb2cua2V5ID0gdmFsdWUuc2xpY2UoMCwgTUFYX0FUVFJJQlVURV9WQUxVRV9MRU5HVEgpOyBcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGtleS5pbmNsdWRlcygnICcpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbmV3S2V5ID0ga2V5LnJlcGxhY2VBbGwoJyAnLCAnLicpO1xuICAgICAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShsb2csIGtleS5zbGljZSgwLCBNQVhfQVRUUklCVVRFX05BTUVfTEVOR1RIKSwgXG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IobG9nLCBrZXkgYXMgUHJvcGVydHlLZXkpIGFzIFByb3BlcnR5RGVzY3JpcHRvcik7XG4gICAgICAgICAgICAgICAgZGVsZXRlIGxvZy5rZXk7XG5cbiAgICAgICAgICAgICAgICAvLyBVcGRhdGUga2V5IG5hbWUgZm9yIHVzYWdlIGluIGxhdGVyIHN0ZXBzXG4gICAgICAgICAgICAgICAga2V5ID0gbmV3S2V5O1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgY3JlYXRlTG9nQ2hlY2tUaW1lb3V0KCkge1xuICAgICAgICBzZXRUaW1lb3V0KGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgIGlmICh0aGlzLmxvZ1F1ZXVlLmxlbmd0aCA+ICh0aGlzLmNvbmZpZy5taW5Mb2dJdGVtcyB8fCAxKSkge1xuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuYmVnaW5Xcml0ZUxvZ3MoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZUxvZ0NoZWNrVGltZW91dCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCB0aGlzLmNvbmZpZy5sb2dQdXNoRnJlcXVlbmN5KVxuICAgIH1cblxuICAgIHByaXZhdGUgcmVnaXN0ZXJBcHBEZWF0aExvZ1B1c2goKSB7XG4gICAgICAgIGxldCBmaW5hbFdyaXR0ZW4gPSBmYWxzZTtcbiAgICAgICAgcHJvY2Vzcy5vbignZXhpdCcsICgpID0+IHtcbiAgICAgICAgICAgIGxldCBvID0gZmluYWxXcml0dGVuO1xuICAgICAgICAgICAgZmluYWxXcml0dGVuID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmIChvKSByZXR1cm47XG5cbiAgICAgICAgICAgIHRoaXMuaW50ZXJuYWxMb2coJ2luZm8nLCAnd3JpdGluZyBmaW5hbCBsb2dzJyk7XG4gICAgICAgICAgICB0aGlzLndyaXRlTG9nc1N5bmMoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcHJvY2Vzcy5vbignU0lHSU5UJywgKCkgPT4ge1xuICAgICAgICAgICAgcHJvY2Vzcy5leGl0KDIpO1xuICAgICAgICB9KTtcblxuICAgICAgICBwcm9jZXNzLm9uKCd1bmNhdWdodEV4Y2VwdGlvbicsIChlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmludGVybmFsTG9nKCdlcnJvcicsIGUuc3RhY2sgfHwgJycpO1xuICAgICAgICB9KTtcblxuICAgICAgICBwcm9jZXNzLm9uKCdTSUdURVJNJywgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy53cml0ZUxvZ3NTeW5jKCk7XG4gICAgICAgIH0pXG4gICAgfVxufVxuXG5jb25zdCBjcmVhdGVJbnRlcm5hbExvZ2dlciA9KGFzeW5jICgpID0+IHtcbiAgICBjb25zdCB7IHdpdGhMb2dnZXIgfSA9IGF3YWl0IGltcG9ydCgnLi9sb2dnZXInKTtcbiAgICBsb2cgPSB3aXRoTG9nZ2VyKCdOZXdSZWxpY0xvZ0ZvcndhcmRlcicpO1xuICAgIHdoaWxlKGludGVybmFsTG9nQnVmZmVyLmxlbmd0aCkge1xuICAgICAgICBjb25zdCBbbGV2ZWwsIG1lc3NhZ2VdID0gaW50ZXJuYWxMb2dCdWZmZXIuc2hpZnQoKSBhcyBbc3RyaW5nLCBzdHJpbmddO1xuICAgICAgICAobG9nIGFzIGFueSlbbGV2ZWxdKG1lc3NhZ2UpO1xuICAgIH1cbn0pKCk7XG5cbiJdfQ==