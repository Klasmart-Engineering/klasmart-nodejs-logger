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
          'Content-Type': 'application/gzip',
          'Api-Key': process.env.NEW_RELIC_LICENSE_KEY,
          'Accept': '*/*',
          'Content-Length': compressedPayload.byteLength
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
      return JSON.stringify([{
        common: {
          attributes: _objectSpread(_objectSpread({}, this.globalAttributes), {}, {
            service: process.env.NEW_RELIC_APP_NAME
          }),
          logs: logs
        }
      }]);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9uZXdSZWxpY0xvZ0ZvcndhcmRlci50cyJdLCJuYW1lcyI6WyJBUElfSE9TVE5BTUUiLCJwcm9jZXNzIiwiZW52IiwiS0xfTlJfTE9HX0hPU1ROQU1FIiwiQVBJX1BBVEgiLCJLTF9OUl9MT0dfUEFUSCIsIk1BWF9QQVlMT0FEX1NJWkUiLCJNQVhfQVRUUklCVVRFU19QRVJfRVZFTlQiLCJNQVhfQVRUUklCVVRFX05BTUVfTEVOR1RIIiwiTUFYX0FUVFJJQlVURV9WQUxVRV9MRU5HVEgiLCJsb2ciLCJpbnRlcm5hbExvZ0J1ZmZlciIsIk5ld1JlbGljTG9nVHJhbnNwb3J0Iiwib3B0cyIsImdsb2JhbEF0dHJpYnV0ZXMiLCJzZXRNYXhMaXN0ZW5lcnMiLCJJbmZpbml0eSIsImludGVybmFsTG9nIiwiY29uZmlnIiwiYnl0ZXNXcml0dGVuVGhyZXNob2xkIiwid2Fybk9uQXR0cmlidXRlTGVuZ3RoT3ZlcmZsb3ciLCJtaW5CeXRlc1dyaXR0ZW4iLCJtaW5Mb2dJdGVtcyIsImxvZ1B1c2hGcmVxdWVuY3kiLCJsb2dDb3VudFRocmVzaG9sZCIsInVuZGVmaW5lZCIsIm1pbkxvZ0l0ZW1zVG9Gb3JjZSIsImludGVybmFsTG9nTGV2ZWwiLCJNYXRoIiwibWluIiwidHJhbnNwb3J0cyIsImZvckVhY2giLCJ0IiwibGV2ZWwiLCJyZWdpc3RlckFwcERlYXRoTG9nUHVzaCIsImNyZWF0ZUxvZ0NoZWNrVGltZW91dCIsIm1lc3NhZ2UiLCJwdXNoIiwiaW5mbyIsImNhbGxiYWNrIiwibG9nVHJhbnNmb3JtIiwibG9nU3RyaW5nIiwiSlNPTiIsInN0cmluZ2lmeSIsImxlbmd0aCIsIkJ1ZmZlciIsImJ5dGVMZW5ndGgiLCJsb2dRdWV1ZSIsImxvZ0xlbmd0aFF1ZXVlIiwidG90YWxMZW5ndGhDb3VudCIsImltbWVkaWF0ZUxvZ1dyaXRhYmxlUHJlZGljYXRlIiwiYmVnaW5Xcml0ZUxvZ3MiLCJsb2dzVG9Xcml0ZSIsInNsaWNlTG9ncyIsInJhd1BheWxvYWQiLCJidWlsZFJhd1Bvc3RCb2R5IiwiY29tcHJlc3NlZFBheWxvYWQiLCJ6bGliIiwiZ3ppcFN5bmMiLCJzZW5kTG9ncyIsImJ1ZmZlciIsImZzIiwid3JpdGVGaWxlU3luYyIsImxvZ3NXcml0dGVuIiwiY29tcHJlc3NQYXlsb2FkIiwicmVxIiwiaHR0cHMiLCJyZXF1ZXN0IiwiaG9zdG5hbWUiLCJwYXRoIiwicG9ydCIsIm1ldGhvZCIsImhlYWRlcnMiLCJORVdfUkVMSUNfTElDRU5TRV9LRVkiLCJvbiIsInJlc3BvbnNlIiwic3RhdHVzQ29kZSIsImluY2x1ZGVzIiwic3RhdHVzTWVzc2FnZSIsImVyciIsInN0YWNrIiwid3JpdGUiLCJlbmQiLCJsb2dzIiwiY29tbW9uIiwiYXR0cmlidXRlcyIsInNlcnZpY2UiLCJORVdfUkVMSUNfQVBQX05BTUUiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsImd6aXAiLCJmcm9tIiwibG9nc1RvU2VuZCIsImxvZ1NpemUiLCJsb2dTbGljZUluZGV4Iiwic2xpY2UiLCJtaW5Mb2dJdGVtc0V4Y2VlZGVkIiwiT2JqZWN0IiwiZ2V0T3duUHJvcGVydHlOYW1lcyIsImtleXMiLCJrZXkiLCJ2YWx1ZSIsIm5ld0tleSIsImRlZmluZVByb3BlcnR5IiwiZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yIiwicmVwbGFjZUFsbCIsInNldFRpbWVvdXQiLCJmaW5hbFdyaXR0ZW4iLCJvIiwid3JpdGVMb2dzU3luYyIsImV4aXQiLCJlIiwiVHJhbnNwb3J0IiwiY3JlYXRlSW50ZXJuYWxMb2dnZXIiLCJ3aXRoTG9nZ2VyIiwic2hpZnQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUdBLElBQU1BLFlBQVksR0FBR0MsT0FBTyxDQUFDQyxHQUFSLENBQVlDLGtCQUFaLElBQWtDLHlCQUF2RDtBQUNBLElBQU1DLFFBQVEsR0FBR0gsT0FBTyxDQUFD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QUFXLFNBQVgsRUFBc0IsWUFBTTtBQUN4QixRQUFBLE1BQUksQ0FBQ29DLGFBQUw7QUFDSCxPQUZEO0FBR0g7Ozs7RUEvUHFDRyw0Qjs7OztnQkFBN0JyRyxvQixjQUM0QyxFOztBQWlRekQsSUFBTXNHLG9CQUFvQixHQUFFLHdEQUFDO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsbURBQ1csVUFEWDtBQUFBOztBQUFBO0FBQUE7QUFDakJDLFVBQUFBLFVBRGlCLGlCQUNqQkEsVUFEaUI7QUFFekJ6RyxVQUFBQSxHQUFHLEdBQUd5RyxVQUFVLENBQUMsc0JBQUQsQ0FBaEI7O0FBQ0EsaUJBQU14RyxpQkFBaUIsQ0FBQ2lDLE1BQXhCLEVBQWdDO0FBQUEsb0JBQ0hqQyxpQkFBaUIsQ0FBQ3lHLEtBQWxCLEVBREcsb0NBQ3JCbkYsS0FEcUIsYUFDZEcsT0FEYztBQUUzQjFCLFlBQUFBLEdBQUQsQ0FBYXVCLEtBQWIsRUFBb0JHLE9BQXBCO0FBQ0g7O0FBTndCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLENBQUQsSUFBNUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgaHR0cHMgZnJvbSAnaHR0cHMnO1xuaW1wb3J0IHpsaWIgZnJvbSAnemxpYic7XG5pbXBvcnQgVHJhbnNwb3J0IGZyb20gJ3dpbnN0b24tdHJhbnNwb3J0JztcbmltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgeyBMb2dnZXIgfSBmcm9tICd3aW5zdG9uJztcblxuY29uc3QgQVBJX0hPU1ROQU1FID0gcHJvY2Vzcy5lbnYuS0xfTlJfTE9HX0hPU1ROQU1FIHx8ICdsb2ctYXBpLmV1Lm5ld3JlbGljLmNvbSc7XG5jb25zdCBBUElfUEFUSCA9IHByb2Nlc3MuZW52LktMX05SX0xPR19QQVRIIHx8ICcvbG9nL3YxJztcbmNvbnN0IE1BWF9QQVlMT0FEX1NJWkUgPSAxMCoqNjtcbmNvbnN0IE1BWF9BVFRSSUJVVEVTX1BFUl9FVkVOVCA9IDI1NTtcbmNvbnN0IE1BWF9BVFRSSUJVVEVfTkFNRV9MRU5HVEggPSAyNTU7XG5jb25zdCBNQVhfQVRUUklCVVRFX1ZBTFVFX0xFTkdUSCA9IDQwOTY7XG5sZXQgbG9nOiBMb2dnZXIgfCB1bmRlZmluZWQ7XG5sZXQgaW50ZXJuYWxMb2dCdWZmZXI6IEFycmF5PFtzdHJpbmcsIHN0cmluZ10+ID0gW107XG5pbnRlcmZhY2UgVW5pcXVlTmV3UmVsaWNMb2dUcmFuc3BvcnRPcHRpb25zIHtcbiAgICAvKipcbiAgICAgKiBIb3cgZnJlcXVlbnRseSBjaGVja3Mgc2hvdWxkIGJlIHJ1biB0byBwdXNoIGxvZ3MgdG8gTlJcbiAgICAgKiBEZWZhdWx0IGlzIDEwIHNlY29uZHNcbiAgICAgKi9cbiAgICBsb2dQdXNoRnJlcXVlbmN5PzogbnVtYmVyO1xuXG4gICAgLyoqXG4gICAgICogTWluaW11bSBudW1iZXIgb2YgbG9nIHN0YXRlbWVudHMgd3JpdHRlbiBiZWZvcmUgbG9ncyBjYW4gYmUgcHVzaGVkIHRvIE5SXG4gICAgICogYnkgcGVyaW9kaWMgbG9nZ2VyLlxuICAgICAqIERlZmF1bHQgaXMgMlxuICAgICAqL1xuICAgIG1pbkxvZ0l0ZW1zPzogbnVtYmVyO1xuXG5cbiAgICAvKipcbiAgICAgKiBNaW5pbXVtIG51bWJlciBvZiBsb2cgc3RhdGVtZW50cyB0byBmb3JjZSBhbiBpbW1lZGlhdGUgcHVzaCB0byBOUi4gVXNlZFxuICAgICAqIHRvIGVuc3VyZSB0aGF0IHRoZSBsb2dnaW5nIHN5c3RlbSBkb2VzIG5vdCBnZXQgYmFja2VkIHVwIGlmIGFtb3VudCBiZWluZ1xuICAgICAqIGxvZ2dlZCBzdXJwYXNzZXMgdGhlIGJhbmR3aWR0aCBvZiB0aGUgcGVyaW9kaWMgbG9nZ2VyLlxuICAgICAqIERlZmF1bHQgaXMgMTAwLlxuICAgICAqL1xuICAgIG1pbkxvZ0l0ZW1zVG9Gb3JjZT86IG51bWJlcjtcblxuICAgIC8qKlxuICAgICAqIE1pbmltdW0gbnVtYmVyIG9mIGxvZyBzdGF0ZW1lbnRzIHRvIGltbWVkaWF0ZWx5IHRyaWdnZXIgYSBwdXNoIHRvIE5SLlxuICAgICAqIERlZmF1bHQgaXMgdW5kZWZpbmVkXG4gICAgICovXG4gICAgbG9nQ291bnRUaHJlc2hvbGQ/OiBudW1iZXIgfCB1bmRlZmluZWQ7XG5cbiAgICAvKipcbiAgICAgKiBNaW5pbXVtIG51bWJlciBvZiBieXRlcyB3cml0dGVuIHRvIGNvbXByZXNzaW9uIHN0cmVhbSBiZWZvcmUgcHVzaGluZyB0byBOUlxuICAgICAqL1xuICAgIG1pbkJ5dGVzV3JpdHRlbj86IG51bWJlcjtcblxuICAgIC8qKlxuICAgICAqIFRocmVzaG9sZCBmb3IgYnl0ZXMgd3JpdHRlbiBhdCB3aGljaCBwb2ludCBhIG5ldyB3cml0ZSB0byBOUiB3aWxsIGJlIGF1dG9tYXRpY2FsbHlcbiAgICAgKiB0cmlnZ2VyZWQuIERlZmF1bHRzIHRvICg0LzUgKiBNQVhfUEFZTE9BRF9TSVpFKVxuICAgICAqL1xuICAgIGJ5dGVzV3JpdHRlblRocmVzaG9sZD86IG51bWJlcjtcblxuICAgIC8qKlxuICAgICAqIFByb2R1Y2UgYSB3YXJuaW5nIHdoZW4gYXR0cmlidXRlIHZhbHVlcyBvdmVyZmxvdyB0aGUgTlIgbWF4aW11bSBsZW5ndGggb2YgNDA5Ni5cbiAgICAgKiBEZWZhdWx0IGlzIGZhbHNlLlxuICAgICAqL1xuICAgIHdhcm5PbkF0dHJpYnV0ZUxlbmd0aE92ZXJmbG93PzogYm9vbGVhbjtcblxuICAgIC8qKlxuICAgICAqIExvZyBsZXZlbCBvZiBpbnRlcm5hbCBsb2dnZXIsIHBhc3MgdGhpcyB2YWx1ZSBpZiB5b3Ugd2FudCB0aGUgbG9nZ2VyXG4gICAgICogdXNlZCBpbiB0aGUgTmV3UmVsaWNMb2dGb3J3YXJkZXIgbW9kdWxlIHRvIGJlIGRpZmZlcmVudCB0aGFuIHRoZSBnbG9iYWxcbiAgICAgKiBkZWZhdWx0IGxvZ2dpbmcgbGV2ZWwuXG4gICAgICogRGVmYXVsdCBpcyB1bmRlZmluZWQuXG4gICAgICovXG4gICAgaW50ZXJuYWxMb2dMZXZlbD86ICdzaWxseScgfCAnZGVidWcnIHwgJ3ZlcmJvc2UnIHwgJ2h0dHAnIHwgJ2luZm8nIHwgJ3dhcm4nIHwgJ2Vycm9yJyB8IHVuZGVmaW5lZDtcbn1cblxudHlwZSBOZXdSZWxpY0xvZ1RyYW5zcG9ydE9wdGlvbnMgPSBVbmlxdWVOZXdSZWxpY0xvZ1RyYW5zcG9ydE9wdGlvbnMgJiBUcmFuc3BvcnQuVHJhbnNwb3J0U3RyZWFtT3B0aW9ucztcblxudHlwZSBSZXF1aXJlZEtlZXBVbmRlZmluZWQ8VD4gPSB7IFtLIGluIGtleW9mIFRdLT86IFtUW0tdXSB9IGV4dGVuZHMgaW5mZXIgVVxuICA/IFUgZXh0ZW5kcyBSZWNvcmQ8a2V5b2YgVSwgW2FueV0+ID8geyBbSyBpbiBrZXlvZiBVXTogVVtLXVswXSB9IDogbmV2ZXJcbiAgOiBuZXZlcjtcblxuZXhwb3J0IGNsYXNzIE5ld1JlbGljTG9nVHJhbnNwb3J0IGV4dGVuZHMgVHJhbnNwb3J0IHtcbiAgICBwcml2YXRlIHN0YXRpYyByZWFkb25seSBnemlwT3B0czogemxpYi5abGliT3B0aW9ucyA9IHtcbiAgICAgICAgXG4gICAgfVxuICAgIHByaXZhdGUgY29uZmlnOiBSZXF1aXJlZEtlZXBVbmRlZmluZWQ8VW5pcXVlTmV3UmVsaWNMb2dUcmFuc3BvcnRPcHRpb25zPiAmIFRyYW5zcG9ydC5UcmFuc3BvcnRTdHJlYW1PcHRpb25zO1xuICAgIHByaXZhdGUgbG9nUXVldWU6IGFueVtdID0gW107XG4gICAgcHJpdmF0ZSBsb2dMZW5ndGhRdWV1ZTogbnVtYmVyW10gPSBbXTtcbiAgICBwcml2YXRlIHRvdGFsTGVuZ3RoQ291bnQgPSAwO1xuICAgIHByaXZhdGUgZ2xvYmFsQXR0cmlidXRlczoge1trZXk6IHN0cmluZ106IHN0cmluZ307XG5cbiAgICBcbiAgICBjb25zdHJ1Y3RvcihvcHRzOiBOZXdSZWxpY0xvZ1RyYW5zcG9ydE9wdGlvbnMsIGdsb2JhbEF0dHJpYnV0ZXM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9KSB7XG4gICAgICAgIHN1cGVyKG9wdHMpO1xuICAgICAgICB0aGlzLnNldE1heExpc3RlbmVycyhJbmZpbml0eSk7XG4gICAgICAgIHRoaXMuaW50ZXJuYWxMb2coJ2luZm8nLCAnY3JlYXRpbmcgbmV3IHJlbGljIHRyYW5zcG9ydCcpO1xuICAgICAgICB0aGlzLmdsb2JhbEF0dHJpYnV0ZXMgPSBnbG9iYWxBdHRyaWJ1dGVzO1xuICAgICAgICB0aGlzLmNvbmZpZyA9IHtcbiAgICAgICAgICAgIGJ5dGVzV3JpdHRlblRocmVzaG9sZDogTUFYX1BBWUxPQURfU0laRSAqIDQgLyA1LFxuICAgICAgICAgICAgd2Fybk9uQXR0cmlidXRlTGVuZ3RoT3ZlcmZsb3c6IGZhbHNlLFxuICAgICAgICAgICAgbWluQnl0ZXNXcml0dGVuOiBNQVhfUEFZTE9BRF9TSVpFICogMSAvIDUsXG4gICAgICAgICAgICBtaW5Mb2dJdGVtczogMixcbiAgICAgICAgICAgIGxvZ1B1c2hGcmVxdWVuY3k6IDYwMDAwLFxuICAgICAgICAgICAgbG9nQ291bnRUaHJlc2hvbGQ6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIG1pbkxvZ0l0ZW1zVG9Gb3JjZTogMTAwLFxuICAgICAgICAgICAgaW50ZXJuYWxMb2dMZXZlbDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgLi4ub3B0c1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuY29uZmlnLmJ5dGVzV3JpdHRlblRocmVzaG9sZCA9IE1hdGgubWluKHRoaXMuY29uZmlnLmJ5dGVzV3JpdHRlblRocmVzaG9sZCB8fCAwLCBNQVhfUEFZTE9BRF9TSVpFICogNCAvIDUpO1xuICAgICAgICBpZiAobG9nKVxuICAgICAgICBsb2c/LnRyYW5zcG9ydHMuZm9yRWFjaCh0ID0+IHQubGV2ZWwgPSB0aGlzLmNvbmZpZy5pbnRlcm5hbExvZ0xldmVsKTtcbiAgICAgICAgdGhpcy5yZWdpc3RlckFwcERlYXRoTG9nUHVzaCgpO1xuICAgICAgICB0aGlzLmNyZWF0ZUxvZ0NoZWNrVGltZW91dCgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZ1bmN0aW9uIHRvIHdyaXRlIGxvZ3MgdGhhdCBhcmUgaW50ZXJuYWwgdG8gdGhpcyBtb2R1bGUuXG4gICAgICogQnVmZmVycyBjYWxscyB1bnRpbCB0aGUgV2luc3RvbiBsb2dnZXIgY2FuIGJlIGFzeW5jIGltcG9ydGRcbiAgICAgKiBBZnRlcndvcmRzLCB3cml0ZXMgbG9ncyBkaXJlY3RseSB0byB0aGUgbG9nZ2VyXG4gICAgICogQHBhcmFtIGxldmVsIFxuICAgICAqIEBwYXJhbSBtZXNzYWdlIFxuICAgICAqL1xuICAgIGludGVybmFsTG9nKGxldmVsOiBzdHJpbmcsIG1lc3NhZ2U6IHN0cmluZykge1xuICAgICAgICBpZiAobG9nKSB7XG4gICAgICAgICAgICAobG9nIGFzIGFueSlbbGV2ZWxdKG1lc3NhZ2UpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaW50ZXJuYWxMb2dCdWZmZXIucHVzaChbbGV2ZWwsIG1lc3NhZ2VdKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGxvZyhpbmZvOiBhbnksIGNhbGxiYWNrOiAoKCkgPT4gdm9pZCkgfCB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhpcy5sb2dUcmFuc2Zvcm0oaW5mbyk7XG4gICAgICAgIGNvbnN0IGxvZ1N0cmluZyA9IEpTT04uc3RyaW5naWZ5KGluZm8pO1xuICAgICAgICBjb25zdCBsZW5ndGggPSBCdWZmZXIuYnl0ZUxlbmd0aChsb2dTdHJpbmcpO1xuICAgICAgICB0aGlzLmxvZ1F1ZXVlLnB1c2goaW5mbyk7XG4gICAgICAgIHRoaXMubG9nTGVuZ3RoUXVldWUucHVzaChsZW5ndGgpO1xuICAgICAgICB0aGlzLnRvdGFsTGVuZ3RoQ291bnQgKz0gbGVuZ3RoO1xuXG4gICAgICAgIGlmICh0aGlzLmltbWVkaWF0ZUxvZ1dyaXRhYmxlUHJlZGljYXRlKCkpIHtcbiAgICAgICAgICAgIHRoaXMuYmVnaW5Xcml0ZUxvZ3MoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY2FsbGJhY2spIGNhbGxiYWNrKCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB3cml0ZUxvZ3NTeW5jKCkge1xuICAgICAgICBjb25zdCBsb2dzVG9Xcml0ZSA9IHRoaXMuc2xpY2VMb2dzKCk7XG4gICAgICAgIHRoaXMuaW50ZXJuYWxMb2coJ3NpbGx5JywgYFByZXBhcmluZyBmaW5hbCBsb2cgcGF5bG9hZCBvZiAke2xvZ3NUb1dyaXRlLmxlbmd0aH0gZm9yIE5SIGNvbGxlY3RvcmApO1xuICAgICAgICBjb25zdCByYXdQYXlsb2FkID0gdGhpcy5idWlsZFJhd1Bvc3RCb2R5KGxvZ3NUb1dyaXRlKTtcbiAgICAgICAgY29uc3QgY29tcHJlc3NlZFBheWxvYWQgPSB6bGliLmd6aXBTeW5jKHJhd1BheWxvYWQpO1xuICAgICAgICB0aGlzLnNlbmRMb2dzKGNvbXByZXNzZWRQYXlsb2FkKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGxvZ3NXcml0dGVuID0gMDtcbiAgICBwdWJsaWMgd3JpdGVMb2dzVG9GaWxlU3lzdGVtKGJ1ZmZlcjogQnVmZmVyKSB7XG4gICAgICAgIGZzLndyaXRlRmlsZVN5bmMoYHRlc3QtJHt0aGlzLmxvZ3NXcml0dGVuKyt9Lmd6YCwgYnVmZmVyKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIGJlZ2luV3JpdGVMb2dzKCkge1xuICAgICAgICBjb25zdCBsb2dzVG9Xcml0ZSA9IHRoaXMuc2xpY2VMb2dzKCk7XG5cbiAgICAgICAgdGhpcy5pbnRlcm5hbExvZygnc2lsbHknLCBgUHJlcGFyaW5nIGxvZyBwYXlsb2FkIG9mICR7bG9nc1RvV3JpdGUubGVuZ3RofSBmb3IgTlIgY29sbGVjdG9yYCk7XG4gICAgICAgIGNvbnN0IHJhd1BheWxvYWQgPSB0aGlzLmJ1aWxkUmF3UG9zdEJvZHkobG9nc1RvV3JpdGUpO1xuICAgICAgICBjb25zdCBjb21wcmVzc2VkUGF5bG9hZDogQnVmZmVyID0gYXdhaXQgdGhpcy5jb21wcmVzc1BheWxvYWQocmF3UGF5bG9hZCk7XG4gICAgICAgIHRoaXMuc2VuZExvZ3MoY29tcHJlc3NlZFBheWxvYWQpO1xuICAgIH1cblxuICAgIHByaXZhdGUgc2VuZExvZ3MoY29tcHJlc3NlZFBheWxvYWQ6IEJ1ZmZlcikge1xuICAgICAgICBjb25zdCByZXEgPSBodHRwcy5yZXF1ZXN0KHtcbiAgICAgICAgICAgIGhvc3RuYW1lOiBBUElfSE9TVE5BTUUsXG4gICAgICAgICAgICBwYXRoOiBBUElfUEFUSCxcbiAgICAgICAgICAgIHBvcnQ6IDQ0MyxcbiAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vZ3ppcCcsXG4gICAgICAgICAgICAgICAgJ0FwaS1LZXknOiBwcm9jZXNzLmVudi5ORVdfUkVMSUNfTElDRU5TRV9LRVksXG4gICAgICAgICAgICAgICAgJ0FjY2VwdCc6ICcqLyonLFxuICAgICAgICAgICAgICAgICdDb250ZW50LUxlbmd0aCc6IGNvbXByZXNzZWRQYXlsb2FkLmJ5dGVMZW5ndGhcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmVxLm9uKCdyZXNwb25zZScsIHJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgIGlmKHJlc3BvbnNlLnN0YXR1c0NvZGUgJiYgWzIwMiwgMjAwXS5pbmNsdWRlcyhyZXNwb25zZS5zdGF0dXNDb2RlKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pbnRlcm5hbExvZygnZXJyb3InLCAnRXJyb3IgZGVsaXZlcmluZyBsb2dzIHRvIE5SOicpO1xuICAgICAgICAgICAgICAgIHRoaXMuaW50ZXJuYWxMb2coJ2Vycm9yJywgYCR7cmVzcG9uc2Uuc3RhdHVzQ29kZX0gLSAke3Jlc3BvbnNlLnN0YXR1c01lc3NhZ2V9YClcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmVxLm9uKCdlcnJvcicsIChlcnIpID0+IHtcbiAgICAgICAgICAgIHRoaXMuaW50ZXJuYWxMb2coJ2Vycm9yJywgZXJyLnN0YWNrID8/ICdFcnJvciB3cml0aW5nIGxvZ3MgdG8gTmV3IFJlbGljJylcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmVxLndyaXRlKGNvbXByZXNzZWRQYXlsb2FkKTtcbiAgICAgICAgcmVxLmVuZCgpO1xuICAgIH1cblxuICAgIHByaXZhdGUgYnVpbGRSYXdQb3N0Qm9keShsb2dzOiBhbnlbXSk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShbe1xuICAgICAgICAgICAgY29tbW9uOiB7XG4gICAgICAgICAgICAgICAgYXR0cmlidXRlczoge1xuICAgICAgICAgICAgICAgICAgICAuLi50aGlzLmdsb2JhbEF0dHJpYnV0ZXMsXG4gICAgICAgICAgICAgICAgICAgIHNlcnZpY2U6IHByb2Nlc3MuZW52Lk5FV19SRUxJQ19BUFBfTkFNRVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgbG9nczogbG9nc1xuICAgICAgICAgICAgfVxuICAgICAgICB9XSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBjb21wcmVzc1BheWxvYWQocmF3UGF5bG9hZDogc3RyaW5nKTogUHJvbWlzZTxCdWZmZXI+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPEJ1ZmZlcj4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgemxpYi5nemlwKEJ1ZmZlci5mcm9tKHJhd1BheWxvYWQsICd1dGY4JyksIChlcnIsIGNvbXByZXNzZWRQYXlsb2FkKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikgcmVqZWN0KGVycik7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShjb21wcmVzc2VkUGF5bG9hZCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzbGljZUxvZ3MoKSB7XG4gICAgICAgIGxldCBsb2dzVG9TZW5kO1xuICAgICAgICBcbiAgICAgICAgLy8gSWYgd2Uga25vdyB0aGUgdG90YWwgbGVuZ3RoIHdpbGwgbm90IGV4Y2VlZCBtYXhpbXVtIGxlbmd0aCBzaXplXG4gICAgICAgIGlmICh0aGlzLnRvdGFsTGVuZ3RoQ291bnQgPCBNQVhfUEFZTE9BRF9TSVpFKSB7XG4gICAgICAgICAgICBbbG9nc1RvU2VuZCwgdGhpcy5sb2dRdWV1ZV0gPSBbdGhpcy5sb2dRdWV1ZSwgW11dO1xuICAgICAgICAgICAgdGhpcy5sb2dMZW5ndGhRdWV1ZSA9IFtdO1xuICAgICAgICAgICAgdGhpcy50b3RhbExlbmd0aENvdW50ID0gMDtcbiAgICAgICAgICAgIHJldHVybiBsb2dzVG9TZW5kO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gb3RoZXJ3aXNlLCBzbGljZSBvZmYgYSBzbGljZSBvZiBsb2dzIHRoYXQgd2lsbCBmaXQgaW50byBhIHNpbmdsZSByZXF1ZXN0XG4gICAgICAgIGxldCBsb2dTaXplID0gMDtcbiAgICAgICAgbGV0IGxvZ1NsaWNlSW5kZXggPSAwO1xuXG4gICAgICAgIHdoaWxlKCh0aGlzLmxvZ1F1ZXVlLmxlbmd0aCA+IDApICYmIChsb2dTaXplICsgdGhpcy5sb2dMZW5ndGhRdWV1ZVswXSA8IE1BWF9QQVlMT0FEX1NJWkUpKSB7XG4gICAgICAgICAgICBsb2dTbGljZUluZGV4Kys7XG4gICAgICAgIH1cblxuICAgICAgICBsb2dzVG9TZW5kID0gdGhpcy5sb2dRdWV1ZS5zbGljZSgwLCBsb2dTbGljZUluZGV4KTtcbiAgICAgICAgdGhpcy5sb2dRdWV1ZSA9IHRoaXMubG9nUXVldWUuc2xpY2UobG9nU2xpY2VJbmRleCk7XG4gICAgICAgIHRoaXMubG9nTGVuZ3RoUXVldWUgPSB0aGlzLmxvZ0xlbmd0aFF1ZXVlLnNsaWNlKGxvZ1NsaWNlSW5kZXgpO1xuXG4gICAgICAgIHJldHVybiBsb2dzVG9TZW5kO1xuICAgIH1cblxuICAgIHByaXZhdGUgaW1tZWRpYXRlTG9nV3JpdGFibGVQcmVkaWNhdGUoKTogYm9vbGVhbiB7XG4gICAgICAgIGlmICh0aGlzLmxvZ1F1ZXVlLmxlbmd0aCA+ICh0aGlzLmNvbmZpZy5taW5Mb2dJdGVtc1RvRm9yY2UgfHwgMTAwKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHByaXZhdGUgbG9nc1dyaXRhYmxlUHJlZGljYXRlKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5taW5Mb2dJdGVtc0V4Y2VlZGVkKClcbiAgICB9XG5cbiAgICBwcml2YXRlIG1pbkxvZ0l0ZW1zRXhjZWVkZWQoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiAhISh0aGlzLmNvbmZpZy5taW5Mb2dJdGVtcyAmJiAodGhpcy5sb2dRdWV1ZS5sZW5ndGggPiB0aGlzLmNvbmZpZy5taW5Mb2dJdGVtcykpO1xuICAgIH0gICAgXG4gICAgXG4gICAgLyoqXG4gICAgICogRml4ZXMgcG9zc2libGUgaXNzdWVzIGluIGxvZyBmb3JtYXQgY2F1c2VkIGJ5IGxpbWl0YXRpb25zIG9mIE5ScyBsb2dnaW5nXG4gICAgICogdmFsdWVzXG4gICAgICogQHBhcmFtIGxvZyBcbiAgICAgKiBAcmV0dXJucyBcbiAgICAgKi9cbiAgICBwcml2YXRlIGxvZ1RyYW5zZm9ybShsb2c6IGFueSkge1xuXG4gICAgICAgIGlmIChPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhsb2cpLmxlbmd0aCA+IE1BWF9BVFRSSUJVVEVTX1BFUl9FVkVOVCkge1xuICAgICAgICAgICAgdGhpcy5pbnRlcm5hbExvZygnd2FybicsIGBMb2cgdG8gc2VuZCB0byBKU09OIGNvbnRhaW5zICR7T2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMobG9nKX0gLyAke01BWF9BVFRSSUJVVEVTX1BFUl9FVkVOVH0gYXR0cmlidXRlcy5gKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgZm9yIChsZXQga2V5IG9mIE9iamVjdC5rZXlzKGxvZykpIHtcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gbG9nW2tleV07XG4gICAgICAgICAgICAvLyByZXBsYWNlIGtleSB3aXRoIGxlbmd0aCB0b28gaGlnaFxuICAgICAgICAgICAgaWYgKGtleS5sZW5ndGggPiBNQVhfQVRUUklCVVRFX05BTUVfTEVOR1RIKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbmV3S2V5ID0ga2V5LnNsaWNlKDAsIE1BWF9BVFRSSUJVVEVfTkFNRV9MRU5HVEgpO1xuICAgICAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShsb2csIGtleS5zbGljZSgwLCBNQVhfQVRUUklCVVRFX05BTUVfTEVOR1RIKSwgXG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IobG9nLCBrZXkgYXMgUHJvcGVydHlLZXkpIGFzIFByb3BlcnR5RGVzY3JpcHRvcik7XG4gICAgICAgICAgICAgICAgZGVsZXRlIGxvZy5rZXk7XG5cbiAgICAgICAgICAgICAgICAvLyBVcGRhdGUga2V5IG5hbWUgZm9yIHVzYWdlIGluIGxhdGVyIHN0ZXBzXG4gICAgICAgICAgICAgICAga2V5ID0gbmV3S2V5O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBDb25jYXRlbmF0ZSBsb2cgbWVzc2FnZXMgd2l0aCBsZW5ndGggZ3JlYXRlciB0aGFuIE1BWF9BVFRSSUJVVEVfVkFMVUVfTEVOR1RIXG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiB2YWx1ZS5sZW5ndGggPiBNQVhfQVRUUklCVVRFX1ZBTFVFX0xFTkdUSCkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNvbmZpZz8ud2Fybk9uQXR0cmlidXRlTGVuZ3RoT3ZlcmZsb3cpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnRlcm5hbExvZygnd2FybicsIGBOUiBMb2cgYXR0cmlidXRlIGxlbmd0aCBvdmVyZmxvdy4gTGVuZ3RoOiAke3ZhbHVlLmxlbmd0aH0vJHtNQVhfQVRUUklCVVRFX1ZBTFVFX0xFTkdUSH1gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbG9nLmtleSA9IHZhbHVlLnNsaWNlKDAsIE1BWF9BVFRSSUJVVEVfVkFMVUVfTEVOR1RIKTsgXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChrZXkuaW5jbHVkZXMoJyAnKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG5ld0tleSA9IGtleS5yZXBsYWNlQWxsKCcgJywgJy4nKTtcbiAgICAgICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobG9nLCBrZXkuc2xpY2UoMCwgTUFYX0FUVFJJQlVURV9OQU1FX0xFTkdUSCksIFxuICAgICAgICAgICAgICAgICAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGxvZywga2V5IGFzIFByb3BlcnR5S2V5KSBhcyBQcm9wZXJ0eURlc2NyaXB0b3IpO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBsb2cua2V5O1xuXG4gICAgICAgICAgICAgICAgLy8gVXBkYXRlIGtleSBuYW1lIGZvciB1c2FnZSBpbiBsYXRlciBzdGVwc1xuICAgICAgICAgICAgICAgIGtleSA9IG5ld0tleTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGNyZWF0ZUxvZ0NoZWNrVGltZW91dCgpIHtcbiAgICAgICAgc2V0VGltZW91dChhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy5sb2dRdWV1ZS5sZW5ndGggPiAodGhpcy5jb25maWcubWluTG9nSXRlbXMgfHwgMSkpIHtcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLmJlZ2luV3JpdGVMb2dzKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5jcmVhdGVMb2dDaGVja1RpbWVvdXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdGhpcy5jb25maWcubG9nUHVzaEZyZXF1ZW5jeSlcbiAgICB9XG5cbiAgICBwcml2YXRlIHJlZ2lzdGVyQXBwRGVhdGhMb2dQdXNoKCkge1xuICAgICAgICBsZXQgZmluYWxXcml0dGVuID0gZmFsc2U7XG4gICAgICAgIHByb2Nlc3Mub24oJ2V4aXQnLCAoKSA9PiB7XG4gICAgICAgICAgICBsZXQgbyA9IGZpbmFsV3JpdHRlbjtcbiAgICAgICAgICAgIGZpbmFsV3JpdHRlbiA9IHRydWU7XG4gICAgICAgICAgICBpZiAobykgcmV0dXJuO1xuXG4gICAgICAgICAgICB0aGlzLmludGVybmFsTG9nKCdpbmZvJywgJ3dyaXRpbmcgZmluYWwgbG9ncycpO1xuICAgICAgICAgICAgdGhpcy53cml0ZUxvZ3NTeW5jKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHByb2Nlc3Mub24oJ1NJR0lOVCcsICgpID0+IHtcbiAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgyKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcHJvY2Vzcy5vbigndW5jYXVnaHRFeGNlcHRpb24nLCAoZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5pbnRlcm5hbExvZygnZXJyb3InLCBlLnN0YWNrIHx8ICcnKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcHJvY2Vzcy5vbignU0lHVEVSTScsICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMud3JpdGVMb2dzU3luYygpO1xuICAgICAgICB9KVxuICAgIH1cbn1cblxuY29uc3QgY3JlYXRlSW50ZXJuYWxMb2dnZXIgPShhc3luYyAoKSA9PiB7XG4gICAgY29uc3QgeyB3aXRoTG9nZ2VyIH0gPSBhd2FpdCBpbXBvcnQoJy4vbG9nZ2VyJyk7XG4gICAgbG9nID0gd2l0aExvZ2dlcignTmV3UmVsaWNMb2dGb3J3YXJkZXInKTtcbiAgICB3aGlsZShpbnRlcm5hbExvZ0J1ZmZlci5sZW5ndGgpIHtcbiAgICAgICAgY29uc3QgW2xldmVsLCBtZXNzYWdlXSA9IGludGVybmFsTG9nQnVmZmVyLnNoaWZ0KCkgYXMgW3N0cmluZywgc3RyaW5nXTtcbiAgICAgICAgKGxvZyBhcyBhbnkpW2xldmVsXShtZXNzYWdlKTtcbiAgICB9XG59KSgpO1xuXG4iXX0=