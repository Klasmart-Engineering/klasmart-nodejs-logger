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

var API_HOSTNAME = process.env.KL_NR_LOG_HOSTNAME || 'https://log-api.eu.newrelic.com';
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
    var _this;

    _classCallCheck(this, NewRelicLogTransport);

    _this = _super.call(this, opts);

    _defineProperty(_assertThisInitialized(_this), "config", void 0);

    _defineProperty(_assertThisInitialized(_this), "logQueue", []);

    _defineProperty(_assertThisInitialized(_this), "logLengthQueue", []);

    _defineProperty(_assertThisInitialized(_this), "totalLengthCount", 0);

    _defineProperty(_assertThisInitialized(_this), "globalAttributes", void 0);

    _defineProperty(_assertThisInitialized(_this), "logsWritten", 0);

    _this.internalLog('info', 'creating new relic transport');

    _this.globalAttributes = globalAttributes;
    _this.config = _objectSpread({
      bytesWrittenThreshold: MAX_PAYLOAD_SIZE * 4 / 5,
      warnOnAttributeLengthOverflow: false,
      minBytesWritten: MAX_PAYLOAD_SIZE * 1 / 5,
      minLogItems: 10,
      logPushFrequency: 10000,
      logCountThreshold: undefined
    }, opts);
    _this.config.bytesWrittenThreshold = Math.min(_this.config.bytesWrittenThreshold || 0, MAX_PAYLOAD_SIZE * 4 / 5);

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
      this.totalLengthCount += length; // if (this.logsWritablePredicate()) {
      //     this.beginWriteLogs();
      // }

      if (callback) callback();
    }
  }, {
    key: "writeLogsSync",
    value: function writeLogsSync() {
      var logsToWrite = this.sliceLogs();
      this.internalLog('silly', 'Preparing final log payload for NR collector');
      var rawPayload = this.buildRawPostBody(logsToWrite);

      var compressedPayload = _zlib["default"].gzipSync(rawPayload); // this.sendLogs(compressedPayload);


      this.writeLogsToFileSystem(compressedPayload);
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
                this.internalLog('silly', 'Preparing log payload for NR collector');
                rawPayload = this.buildRawPostBody(logsToWrite);
                _context.next = 5;
                return this.compressPayload(rawPayload);

              case 5:
                compressedPayload = _context.sent;
                // this.sendLogs(compressedPayload);
                this.writeLogsToFileSystem(compressedPayload);

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
          'X-License-Key': process.env.NEW_RELIC_LICENSE_KEY,
          'Accept': '*/*',
          'Content-Length': compressedPayload.byteLength
        }
      });

      req.on('connect', function () {
        req.write(compressedPayload);
      });
      req.on('response', function (response) {
        if (response.statusCode === 200) {
          return;
        } else {
          _this2.internalLog('error', 'Error delivering logs to NR:');

          _this2.internalLog('error', "".concat(response.statusCode, " - ").concat(response.statusMessage));
        }
      });
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
                if (!(_this3.logQueue.length > 0)) {
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

        process.exit(99);
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

_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
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
          log = withLogger('test');

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9uZXdSZWxpY0xvZ0ZvcndhcmRlci50cyJdLCJuYW1lcyI6WyJBUElfSE9TVE5BTUUiLCJwcm9jZXNzIiwiZW52IiwiS0xfTlJfTE9HX0hPU1ROQU1FIiwiQVBJX1BBVEgiLCJLTF9OUl9MT0dfUEFUSCIsIk1BWF9QQVlMT0FEX1NJWkUiLCJNQVhfQVRUUklCVVRFU19QRVJfRVZFTlQiLCJNQVhfQVRUUklCVVRFX05BTUVfTEVOR1RIIiwiTUFYX0FUVFJJQlVURV9WQUxVRV9MRU5HVEgiLCJsb2ciLCJpbnRlcm5hbExvZ0J1ZmZlciIsIk5ld1JlbGljTG9nVHJhbnNwb3J0Iiwib3B0cyIsImdsb2JhbEF0dHJpYnV0ZXMiLCJpbnRlcm5hbExvZyIsImNvbmZpZyIsImJ5dGVzV3JpdHRlblRocmVzaG9sZCIsIndhcm5PbkF0dHJpYnV0ZUxlbmd0aE92ZXJmbG93IiwibWluQnl0ZXNXcml0dGVuIiwibWluTG9nSXRlbXMiLCJsb2dQdXNoRnJlcXVlbmN5IiwibG9nQ291bnRUaHJlc2hvbGQiLCJ1bmRlZmluZWQiLCJNYXRoIiwibWluIiwicmVnaXN0ZXJBcHBEZWF0aExvZ1B1c2giLCJjcmVhdGVMb2dDaGVja1RpbWVvdXQiLCJsZXZlbCIsIm1lc3NhZ2UiLCJwdXNoIiwiaW5mbyIsImNhbGxiYWNrIiwibG9nVHJhbnNmb3JtIiwibG9nU3RyaW5nIiwiSlNPTiIsInN0cmluZ2lmeSIsImxlbmd0aCIsIkJ1ZmZlciIsImJ5dGVMZW5ndGgiLCJsb2dRdWV1ZSIsImxvZ0xlbmd0aFF1ZXVlIiwidG90YWxMZW5ndGhDb3VudCIsImxvZ3NUb1dyaXRlIiwic2xpY2VMb2dzIiwicmF3UGF5bG9hZCIsImJ1aWxkUmF3UG9zdEJvZHkiLCJjb21wcmVzc2VkUGF5bG9hZCIsInpsaWIiLCJnemlwU3luYyIsIndyaXRlTG9nc1RvRmlsZVN5c3RlbSIsImJ1ZmZlciIsImZzIiwid3JpdGVGaWxlU3luYyIsImxvZ3NXcml0dGVuIiwiY29tcHJlc3NQYXlsb2FkIiwicmVxIiwiaHR0cHMiLCJyZXF1ZXN0IiwiaG9zdG5hbWUiLCJwYXRoIiwicG9ydCIsIm1ldGhvZCIsImhlYWRlcnMiLCJORVdfUkVMSUNfTElDRU5TRV9LRVkiLCJvbiIsIndyaXRlIiwicmVzcG9uc2UiLCJzdGF0dXNDb2RlIiwic3RhdHVzTWVzc2FnZSIsImxvZ3MiLCJjb21tb24iLCJhdHRyaWJ1dGVzIiwic2VydmljZSIsIk5FV19SRUxJQ19BUFBfTkFNRSIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwiZ3ppcCIsImZyb20iLCJlcnIiLCJsb2dzVG9TZW5kIiwibG9nU2l6ZSIsImxvZ1NsaWNlSW5kZXgiLCJzbGljZSIsIm1pbkxvZ0l0ZW1zRXhjZWVkZWQiLCJPYmplY3QiLCJnZXRPd25Qcm9wZXJ0eU5hbWVzIiwia2V5cyIsImtleSIsInZhbHVlIiwibmV3S2V5IiwiZGVmaW5lUHJvcGVydHkiLCJnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IiLCJpbmNsdWRlcyIsInJlcGxhY2VBbGwiLCJzZXRUaW1lb3V0IiwiYmVnaW5Xcml0ZUxvZ3MiLCJmaW5hbFdyaXR0ZW4iLCJvIiwid3JpdGVMb2dzU3luYyIsImV4aXQiLCJlIiwic3RhY2siLCJUcmFuc3BvcnQiLCJ3aXRoTG9nZ2VyIiwic2hpZnQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUdBLElBQU1BLFlBQVksR0FBR0MsT0FBTyxDQUFDQyxHQUFSLENBQVlDLGtCQUFaLElBQWtDLGlDQUF2RDtBQUNBLElBQU1DLFFBQVEsR0FBR0gsT0FBTyxDQUFDQyxHQUFSLENBQVlHLGNBQVosSUFBOEIsU0FBL0M7QUFDQSxJQUFNQyxnQkFBZ0IsWUFBRyxFQUFILEVBQU8sQ0FBUCxDQUF0QjtBQUNBLElBQU1DLHdCQUF3QixHQUFHLEdBQWpDO0FBQ0EsSUFBTUMseUJBQXlCLEdBQUcsR0FBbEM7QUFDQSxJQUFNQywwQkFBMEIsR0FBRyxJQUFuQztBQUNBLElBQUlDLEdBQUo7QUFDQSxJQUFJQyxpQkFBMEMsR0FBRyxFQUFqRDs7SUE0Q2FDLG9COzs7OztBQVdULGdDQUFZQyxJQUFaLEVBQStDQyxnQkFBL0MsRUFBMEY7QUFBQTs7QUFBQTs7QUFDdEYsOEJBQU1ELElBQU47O0FBRHNGOztBQUFBLCtEQU5oRSxFQU1nRTs7QUFBQSxxRUFMdkQsRUFLdUQ7O0FBQUEsdUVBSi9ELENBSStEOztBQUFBOztBQUFBLGtFQTBEcEUsQ0ExRG9FOztBQUV0RixVQUFLRSxXQUFMLENBQWlCLE1BQWpCLEVBQXlCLDhCQUF6Qjs7QUFDQSxVQUFLRCxnQkFBTCxHQUF3QkEsZ0JBQXhCO0FBQ0EsVUFBS0UsTUFBTDtBQUNJQyxNQUFBQSxxQkFBcUIsRUFBRVgsZ0JBQWdCLEdBQUcsQ0FBbkIsR0FBdUIsQ0FEbEQ7QUFFSVksTUFBQUEsNkJBQTZCLEVBQUUsS0FGbkM7QUFHSUMsTUFBQUEsZUFBZSxFQUFFYixnQkFBZ0IsR0FBRyxDQUFuQixHQUF1QixDQUg1QztBQUlJYyxNQUFBQSxXQUFXLEVBQUUsRUFKakI7QUFLSUMsTUFBQUEsZ0JBQWdCLEVBQUUsS0FMdEI7QUFNSUMsTUFBQUEsaUJBQWlCLEVBQUVDO0FBTnZCLE9BT09WLElBUFA7QUFVQSxVQUFLRyxNQUFMLENBQVlDLHFCQUFaLEdBQW9DTyxJQUFJLENBQUNDLEdBQUwsQ0FBUyxNQUFLVCxNQUFMLENBQVlDLHFCQUFaLElBQXFDLENBQTlDLEVBQWlEWCxnQkFBZ0IsR0FBRyxDQUFuQixHQUF1QixDQUF4RSxDQUFwQzs7QUFFQSxVQUFLb0IsdUJBQUw7O0FBQ0EsVUFBS0MscUJBQUw7O0FBakJzRjtBQWtCekY7QUFFRDtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7V0FDSSxxQkFBWUMsS0FBWixFQUEyQkMsT0FBM0IsRUFBNEM7QUFDeEMsVUFBSW5CLEdBQUosRUFBUztBQUNKQSxRQUFBQSxHQUFELENBQWFrQixLQUFiLEVBQW9CQyxPQUFwQjtBQUNILE9BRkQsTUFFTztBQUNIbEIsUUFBQUEsaUJBQWlCLENBQUNtQixJQUFsQixDQUF1QixDQUFDRixLQUFELEVBQVFDLE9BQVIsQ0FBdkI7QUFDSDtBQUNKOzs7V0FFRCxhQUFJRSxJQUFKLEVBQWVDLFFBQWYsRUFBbUQ7QUFDL0MsV0FBS0MsWUFBTCxDQUFrQkYsSUFBbEI7QUFDQSxVQUFNRyxTQUFTLEdBQUdDLElBQUksQ0FBQ0MsU0FBTCxDQUFlTCxJQUFmLENBQWxCO0FBQ0EsVUFBTU0sTUFBTSxHQUFHQyxNQUFNLENBQUNDLFVBQVAsQ0FBa0JMLFNBQWxCLENBQWY7QUFDQSxXQUFLTSxRQUFMLENBQWNWLElBQWQsQ0FBbUJDLElBQW5CO0FBQ0EsV0FBS1UsY0FBTCxDQUFvQlgsSUFBcEIsQ0FBeUJPLE1BQXpCO0FBQ0EsV0FBS0ssZ0JBQUwsSUFBeUJMLE1BQXpCLENBTitDLENBUS9DO0FBQ0E7QUFDQTs7QUFDQSxVQUFJTCxRQUFKLEVBQWNBLFFBQVE7QUFDekI7OztXQUVELHlCQUF3QjtBQUNwQixVQUFNVyxXQUFXLEdBQUcsS0FBS0MsU0FBTCxFQUFwQjtBQUNBLFdBQUs3QixXQUFMLENBQWlCLE9BQWpCLEVBQTBCLDhDQUExQjtBQUNBLFVBQU04QixVQUFVLEdBQUcsS0FBS0MsZ0JBQUwsQ0FBc0JILFdBQXRCLENBQW5COztBQUNBLFVBQU1JLGlCQUFpQixHQUFHQyxpQkFBS0MsUUFBTCxDQUFjSixVQUFkLENBQTFCLENBSm9CLENBS3BCOzs7QUFDQSxXQUFLSyxxQkFBTCxDQUEyQkgsaUJBQTNCO0FBQ0g7OztXQUdELCtCQUE2QkksTUFBN0IsRUFBNkM7QUFDekNDLHFCQUFHQyxhQUFILGdCQUF5QixLQUFLQyxXQUFMLEVBQXpCLFVBQWtESCxNQUFsRDtBQUNIOzs7O29GQUVEO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUNVUixnQkFBQUEsV0FEVixHQUN3QixLQUFLQyxTQUFMLEVBRHhCO0FBR0kscUJBQUs3QixXQUFMLENBQWlCLE9BQWpCLEVBQTBCLHdDQUExQjtBQUNNOEIsZ0JBQUFBLFVBSlYsR0FJdUIsS0FBS0MsZ0JBQUwsQ0FBc0JILFdBQXRCLENBSnZCO0FBQUE7QUFBQSx1QkFLNEMsS0FBS1ksZUFBTCxDQUFxQlYsVUFBckIsQ0FMNUM7O0FBQUE7QUFLVUUsZ0JBQUFBLGlCQUxWO0FBTUk7QUFDQSxxQkFBS0cscUJBQUwsQ0FBMkJILGlCQUEzQjs7QUFQSjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxPOzs7Ozs7Ozs7O1dBVUEsa0JBQWlCQSxpQkFBakIsRUFBNEM7QUFBQTs7QUFDeEMsVUFBTVMsR0FBRyxHQUFHQyxrQkFBTUMsT0FBTixDQUFjO0FBQ3RCQyxRQUFBQSxRQUFRLEVBQUUzRCxZQURZO0FBRXRCNEQsUUFBQUEsSUFBSSxFQUFFeEQsUUFGZ0I7QUFHdEJ5RCxRQUFBQSxJQUFJLEVBQUUsR0FIZ0I7QUFJdEJDLFFBQUFBLE1BQU0sRUFBRSxNQUpjO0FBS3RCQyxRQUFBQSxPQUFPLEVBQUU7QUFDTCwwQkFBZ0Isa0JBRFg7QUFFTCwyQkFBaUI5RCxPQUFPLENBQUNDLEdBQVIsQ0FBWThELHFCQUZ4QjtBQUdMLG9CQUFVLEtBSEw7QUFJTCw0QkFBa0JqQixpQkFBaUIsQ0FBQ1I7QUFKL0I7QUFMYSxPQUFkLENBQVo7O0FBYUFpQixNQUFBQSxHQUFHLENBQUNTLEVBQUosQ0FBTyxTQUFQLEVBQWtCLFlBQU07QUFDcEJULFFBQUFBLEdBQUcsQ0FBQ1UsS0FBSixDQUFVbkIsaUJBQVY7QUFDSCxPQUZEO0FBSUFTLE1BQUFBLEdBQUcsQ0FBQ1MsRUFBSixDQUFPLFVBQVAsRUFBbUIsVUFBQUUsUUFBUSxFQUFJO0FBQzNCLFlBQUdBLFFBQVEsQ0FBQ0MsVUFBVCxLQUF3QixHQUEzQixFQUFnQztBQUM1QjtBQUNILFNBRkQsTUFFTztBQUNILFVBQUEsTUFBSSxDQUFDckQsV0FBTCxDQUFpQixPQUFqQixFQUEwQiw4QkFBMUI7O0FBQ0EsVUFBQSxNQUFJLENBQUNBLFdBQUwsQ0FBaUIsT0FBakIsWUFBNkJvRCxRQUFRLENBQUNDLFVBQXRDLGdCQUFzREQsUUFBUSxDQUFDRSxhQUEvRDtBQUNIO0FBQ0osT0FQRDtBQVFIOzs7V0FFRCwwQkFBeUJDLElBQXpCLEVBQThDO0FBQzFDLGFBQU9uQyxJQUFJLENBQUNDLFNBQUwsQ0FBZSxDQUFDO0FBQ25CbUMsUUFBQUEsTUFBTSxFQUFFO0FBQ0pDLFVBQUFBLFVBQVUsa0NBQ0gsS0FBSzFELGdCQURGO0FBRU4yRCxZQUFBQSxPQUFPLEVBQUV4RSxPQUFPLENBQUNDLEdBQVIsQ0FBWXdFO0FBRmYsWUFETjtBQUtKSixVQUFBQSxJQUFJLEVBQUVBO0FBTEY7QUFEVyxPQUFELENBQWYsQ0FBUDtBQVNIOzs7O3FGQUVELGtCQUE4QnpCLFVBQTlCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxrREFDVyxJQUFJOEIsT0FBSixDQUFvQixVQUFDQyxPQUFELEVBQVVDLE1BQVYsRUFBcUI7QUFDNUM3QixtQ0FBSzhCLElBQUwsQ0FBVXhDLE1BQU0sQ0FBQ3lDLElBQVAsQ0FBWWxDLFVBQVosRUFBd0IsTUFBeEIsQ0FBVixFQUEyQyxVQUFDbUMsR0FBRCxFQUFNakMsaUJBQU4sRUFBNEI7QUFDbkUsd0JBQUlpQyxHQUFKLEVBQVNILE1BQU0sQ0FBQ0csR0FBRCxDQUFOO0FBQ1RKLG9CQUFBQSxPQUFPLENBQUM3QixpQkFBRCxDQUFQO0FBQ0gsbUJBSEQ7QUFJSCxpQkFMTSxDQURYOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE87Ozs7Ozs7Ozs7V0FTQSxxQkFBb0I7QUFDaEIsVUFBSWtDLFVBQUosQ0FEZ0IsQ0FHaEI7O0FBQ0EsVUFBSSxLQUFLdkMsZ0JBQUwsR0FBd0JwQyxnQkFBNUIsRUFBOEM7QUFBQSxtQkFDWixDQUFDLEtBQUtrQyxRQUFOLEVBQWdCLEVBQWhCLENBRFk7QUFDekN5QyxRQUFBQSxVQUR5QztBQUM3QixhQUFLekMsUUFEd0I7QUFFMUMsYUFBS0MsY0FBTCxHQUFzQixFQUF0QjtBQUNBLGFBQUtDLGdCQUFMLEdBQXdCLENBQXhCO0FBQ0EsZUFBT3VDLFVBQVA7QUFDSCxPQVRlLENBV2hCOzs7QUFDQSxVQUFJQyxPQUFPLEdBQUcsQ0FBZDtBQUNBLFVBQUlDLGFBQWEsR0FBRyxDQUFwQjs7QUFFQSxhQUFPLEtBQUszQyxRQUFMLENBQWNILE1BQWQsR0FBdUIsQ0FBeEIsSUFBK0I2QyxPQUFPLEdBQUcsS0FBS3pDLGNBQUwsQ0FBb0IsQ0FBcEIsQ0FBVixHQUFtQ25DLGdCQUF4RSxFQUEyRjtBQUN2RjZFLFFBQUFBLGFBQWE7QUFDaEI7O0FBRURGLE1BQUFBLFVBQVUsR0FBRyxLQUFLekMsUUFBTCxDQUFjNEMsS0FBZCxDQUFvQixDQUFwQixFQUF1QkQsYUFBdkIsQ0FBYjtBQUNBLFdBQUszQyxRQUFMLEdBQWdCLEtBQUtBLFFBQUwsQ0FBYzRDLEtBQWQsQ0FBb0JELGFBQXBCLENBQWhCO0FBQ0EsV0FBSzFDLGNBQUwsR0FBc0IsS0FBS0EsY0FBTCxDQUFvQjJDLEtBQXBCLENBQTBCRCxhQUExQixDQUF0QjtBQUVBLGFBQU9GLFVBQVA7QUFDSDs7O1dBRUQsaUNBQXlDO0FBQ3JDLGFBQU8sS0FBS0ksbUJBQUwsRUFBUDtBQUNIOzs7V0FFRCwrQkFBdUM7QUFDbkMsYUFBTyxDQUFDLEVBQUUsS0FBS3JFLE1BQUwsQ0FBWUksV0FBWixJQUE0QixLQUFLb0IsUUFBTCxDQUFjSCxNQUFkLEdBQXVCLEtBQUtyQixNQUFMLENBQVlJLFdBQWpFLENBQVI7QUFDSDtBQUVEO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztXQUNJLHNCQUFxQlYsR0FBckIsRUFBK0I7QUFFM0IsVUFBSTRFLE1BQU0sQ0FBQ0MsbUJBQVAsQ0FBMkI3RSxHQUEzQixFQUFnQzJCLE1BQWhDLEdBQXlDOUIsd0JBQTdDLEVBQXVFO0FBQ25FLGFBQUtRLFdBQUwsQ0FBaUIsTUFBakIseUNBQXlEdUUsTUFBTSxDQUFDQyxtQkFBUCxDQUEyQjdFLEdBQTNCLENBQXpELGdCQUE4Rkgsd0JBQTlGO0FBQ0g7O0FBRUQsc0NBQWdCK0UsTUFBTSxDQUFDRSxJQUFQLENBQVk5RSxHQUFaLENBQWhCLGtDQUFrQztBQUE3QixZQUFJK0UsSUFBRyxtQkFBUDtBQUNELFlBQU1DLEtBQUssR0FBR2hGLEdBQUcsQ0FBQytFLElBQUQsQ0FBakIsQ0FEOEIsQ0FFOUI7O0FBQ0EsWUFBSUEsSUFBRyxDQUFDcEQsTUFBSixHQUFhN0IseUJBQWpCLEVBQTRDO0FBQ3hDLGNBQU1tRixNQUFNLEdBQUdGLElBQUcsQ0FBQ0wsS0FBSixDQUFVLENBQVYsRUFBYTVFLHlCQUFiLENBQWY7O0FBQ0E4RSxVQUFBQSxNQUFNLENBQUNNLGNBQVAsQ0FBc0JsRixHQUF0QixFQUEyQitFLElBQUcsQ0FBQ0wsS0FBSixDQUFVLENBQVYsRUFBYTVFLHlCQUFiLENBQTNCLEVBQ0k4RSxNQUFNLENBQUNPLHdCQUFQLENBQWdDbkYsR0FBaEMsRUFBcUMrRSxJQUFyQyxDQURKO0FBRUEsaUJBQU8vRSxHQUFHLENBQUMrRSxHQUFYLENBSndDLENBTXhDOztBQUNBQSxVQUFBQSxJQUFHLEdBQUdFLE1BQU47QUFDSCxTQVg2QixDQWE5Qjs7O0FBQ0EsWUFBSSxPQUFPRCxLQUFQLEtBQWlCLFFBQWpCLElBQTZCQSxLQUFLLENBQUNyRCxNQUFOLEdBQWU1QiwwQkFBaEQsRUFBNEU7QUFBQTs7QUFDeEUsOEJBQUksS0FBS08sTUFBVCx5Q0FBSSxhQUFhRSw2QkFBakIsRUFBZ0Q7QUFDNUMsaUJBQUtILFdBQUwsQ0FBaUIsTUFBakIsc0RBQXNFMkUsS0FBSyxDQUFDckQsTUFBNUUsY0FBc0Y1QiwwQkFBdEY7QUFDSDs7QUFDREMsVUFBQUEsR0FBRyxDQUFDK0UsR0FBSixHQUFVQyxLQUFLLENBQUNOLEtBQU4sQ0FBWSxDQUFaLEVBQWUzRSwwQkFBZixDQUFWO0FBQ0g7O0FBRUQsWUFBSWdGLElBQUcsQ0FBQ0ssUUFBSixDQUFhLEdBQWIsQ0FBSixFQUF1QjtBQUNuQixjQUFNSCxPQUFNLEdBQUdGLElBQUcsQ0FBQ00sVUFBSixDQUFlLEdBQWYsRUFBb0IsR0FBcEIsQ0FBZjs7QUFDQVQsVUFBQUEsTUFBTSxDQUFDTSxjQUFQLENBQXNCbEYsR0FBdEIsRUFBMkIrRSxJQUFHLENBQUNMLEtBQUosQ0FBVSxDQUFWLEVBQWE1RSx5QkFBYixDQUEzQixFQUNJOEUsTUFBTSxDQUFDTyx3QkFBUCxDQUFnQ25GLEdBQWhDLEVBQXFDK0UsSUFBckMsQ0FESjtBQUVBLGlCQUFPL0UsR0FBRyxDQUFDK0UsR0FBWCxDQUptQixDQU1uQjs7QUFDQUEsVUFBQUEsSUFBRyxHQUFHRSxPQUFOO0FBQ0g7O0FBQUE7QUFDSjtBQUNKOzs7V0FFRCxpQ0FBZ0M7QUFBQTs7QUFDNUJLLE1BQUFBLFVBQVUsdUVBQUM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLHNCQUNILE1BQUksQ0FBQ3hELFFBQUwsQ0FBY0gsTUFBZCxHQUF1QixDQURwQjtBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBLHVCQUVHLE1BQUksQ0FBQzRELGNBQUwsRUFGSDs7QUFBQTtBQUdILGdCQUFBLE1BQUksQ0FBQ3RFLHFCQUFMOztBQUhHO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE9BQUQsSUFLUCxLQUFLWCxNQUFMLENBQVlLLGdCQUxMLENBQVY7QUFNSDs7O1dBRUQsbUNBQWtDO0FBQUE7O0FBQzlCLFVBQUk2RSxZQUFZLEdBQUcsS0FBbkI7QUFDQWpHLE1BQUFBLE9BQU8sQ0FBQ2dFLEVBQVIsQ0FBVyxNQUFYLEVBQW1CLFlBQU07QUFDckIsWUFBSWtDLENBQUMsR0FBR0QsWUFBUjtBQUNBQSxRQUFBQSxZQUFZLEdBQUcsSUFBZjtBQUNBLFlBQUlDLENBQUosRUFBTzs7QUFFUCxRQUFBLE1BQUksQ0FBQ3BGLFdBQUwsQ0FBaUIsTUFBakIsRUFBeUIsb0JBQXpCOztBQUNBLFFBQUEsTUFBSSxDQUFDcUYsYUFBTDtBQUNILE9BUEQ7QUFTQW5HLE1BQUFBLE9BQU8sQ0FBQ2dFLEVBQVIsQ0FBVyxRQUFYLEVBQXFCLFlBQU07QUFDdkJoRSxRQUFBQSxPQUFPLENBQUNvRyxJQUFSLENBQWEsQ0FBYjtBQUNILE9BRkQ7QUFJQXBHLE1BQUFBLE9BQU8sQ0FBQ2dFLEVBQVIsQ0FBVyxtQkFBWCxFQUFnQyxVQUFDcUMsQ0FBRCxFQUFPO0FBQ25DLFFBQUEsTUFBSSxDQUFDdkYsV0FBTCxDQUFpQixPQUFqQixFQUEwQnVGLENBQUMsQ0FBQ0MsS0FBRixJQUFXLEVBQXJDOztBQUNBdEcsUUFBQUEsT0FBTyxDQUFDb0csSUFBUixDQUFhLEVBQWI7QUFDSCxPQUhEO0FBS0FwRyxNQUFBQSxPQUFPLENBQUNnRSxFQUFSLENBQVcsU0FBWCxFQUFzQixZQUFNO0FBQ3hCLFFBQUEsTUFBSSxDQUFDbUMsYUFBTDtBQUNILE9BRkQ7QUFHSDs7OztFQXBQcUNJLDRCOzs7O2dCQUE3QjVGLG9CLGNBQzRDLEU7O0FBc1B6RCx3REFBQztBQUFBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLG1EQUN1QyxVQUR2QztBQUFBOztBQUFBO0FBQUE7QUFDVzZGLFVBQUFBLFVBRFgsaUJBQ1dBLFVBRFg7QUFFRy9GLFVBQUFBLEdBQUcsR0FBRytGLFVBQVUsQ0FBQyxNQUFELENBQWhCOztBQUNBLGlCQUFNOUYsaUJBQWlCLENBQUMwQixNQUF4QixFQUFnQztBQUFBLG9CQUNIMUIsaUJBQWlCLENBQUMrRixLQUFsQixFQURHLG9DQUNyQjlFLEtBRHFCLGFBQ2RDLE9BRGM7QUFFM0JuQixZQUFBQSxHQUFELENBQWFrQixLQUFiLEVBQW9CQyxPQUFwQjtBQUNIOztBQU5KO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLENBQUQiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgaHR0cHMgZnJvbSAnaHR0cHMnO1xuaW1wb3J0IHpsaWIgZnJvbSAnemxpYic7XG5pbXBvcnQgVHJhbnNwb3J0IGZyb20gJ3dpbnN0b24tdHJhbnNwb3J0JztcbmltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgeyBMb2dnZXIgfSBmcm9tICd3aW5zdG9uJztcblxuY29uc3QgQVBJX0hPU1ROQU1FID0gcHJvY2Vzcy5lbnYuS0xfTlJfTE9HX0hPU1ROQU1FIHx8ICdodHRwczovL2xvZy1hcGkuZXUubmV3cmVsaWMuY29tJztcbmNvbnN0IEFQSV9QQVRIID0gcHJvY2Vzcy5lbnYuS0xfTlJfTE9HX1BBVEggfHwgJy9sb2cvdjEnO1xuY29uc3QgTUFYX1BBWUxPQURfU0laRSA9IDEwKio2O1xuY29uc3QgTUFYX0FUVFJJQlVURVNfUEVSX0VWRU5UID0gMjU1O1xuY29uc3QgTUFYX0FUVFJJQlVURV9OQU1FX0xFTkdUSCA9IDI1NTtcbmNvbnN0IE1BWF9BVFRSSUJVVEVfVkFMVUVfTEVOR1RIID0gNDA5NjtcbmxldCBsb2c6IExvZ2dlciB8IHVuZGVmaW5lZDtcbmxldCBpbnRlcm5hbExvZ0J1ZmZlcjogQXJyYXk8W3N0cmluZywgc3RyaW5nXT4gPSBbXTtcbmludGVyZmFjZSBVbmlxdWVOZXdSZWxpY0xvZ1RyYW5zcG9ydE9wdGlvbnMge1xuICAgIC8qKlxuICAgICAqIEhvdyBmcmVxdWVudGx5IGNoZWNrcyBzaG91bGQgYmUgcnVuIHRvIHB1c2ggbG9ncyB0byBOUlxuICAgICAqIERlZmF1bHQgaXMgMTAgc2Vjb25kc1xuICAgICAqL1xuICAgIGxvZ1B1c2hGcmVxdWVuY3k/OiBudW1iZXI7XG5cbiAgICAvKipcbiAgICAgKiBNaW5pbXVtIG51bWJlciBvZiBsb2cgc3RhdGVtZW50cyB3cml0dGVuIGJlZm9yZSBsb2dzIGNhbiBiZSBwdXNoZWQgdG8gTlIuXG4gICAgICogRGVmYXVsdCBpcyB1bmRlZmluZWRcbiAgICAgKi9cbiAgICBtaW5Mb2dJdGVtcz86IG51bWJlcjtcblxuICAgIC8qKlxuICAgICAqIE1pbmltdW0gbnVtYmVyIG9mIGxvZyBzdGF0ZW1lbnRzIHRvIGltbWVkaWF0ZWx5IHRyaWdnZXIgYSBwdXNoIHRvIE5SLlxuICAgICAqIERlZmF1bHQgaXMgdW5kZWZpbmVkXG4gICAgICovXG4gICAgbG9nQ291bnRUaHJlc2hvbGQ/OiBudW1iZXIgfCB1bmRlZmluZWQ7XG5cbiAgICAvKipcbiAgICAgKiBNaW5pbXVtIG51bWJlciBvZiBieXRlcyB3cml0dGVuIHRvIGNvbXByZXNzaW9uIHN0cmVhbSBiZWZvcmUgcHVzaGluZyB0byBOUlxuICAgICAqL1xuICAgIG1pbkJ5dGVzV3JpdHRlbj86IG51bWJlcjtcblxuICAgIC8qKlxuICAgICAqIFRocmVzaG9sZCBmb3IgYnl0ZXMgd3JpdHRlbiBhdCB3aGljaCBwb2ludCBhIG5ldyB3cml0ZSB0byBOUiB3aWxsIGJlIGF1dG9tYXRpY2FsbHlcbiAgICAgKiB0cmlnZ2VyZWQuIERlZmF1bHRzIHRvICg0LzUgKiBNQVhfUEFZTE9BRF9TSVpFKVxuICAgICAqL1xuICAgIGJ5dGVzV3JpdHRlblRocmVzaG9sZD86IG51bWJlcjtcblxuICAgIC8qKlxuICAgICAqIFByb2R1Y2UgYSB3YXJuaW5nIHdoZW4gYXR0cmlidXRlIHZhbHVlcyBvdmVyZmxvdyB0aGUgTlIgbWF4aW11bSBsZW5ndGggb2YgNDA5Ni5cbiAgICAgKiBEZWZhdWx0IGlzIGZhbHNlLlxuICAgICAqL1xuICAgIHdhcm5PbkF0dHJpYnV0ZUxlbmd0aE92ZXJmbG93PzogYm9vbGVhbjtcbn1cblxudHlwZSBOZXdSZWxpY0xvZ1RyYW5zcG9ydE9wdGlvbnMgPSBVbmlxdWVOZXdSZWxpY0xvZ1RyYW5zcG9ydE9wdGlvbnMgJiBUcmFuc3BvcnQuVHJhbnNwb3J0U3RyZWFtT3B0aW9ucztcblxudHlwZSBSZXF1aXJlZEtlZXBVbmRlZmluZWQ8VD4gPSB7IFtLIGluIGtleW9mIFRdLT86IFtUW0tdXSB9IGV4dGVuZHMgaW5mZXIgVVxuICA/IFUgZXh0ZW5kcyBSZWNvcmQ8a2V5b2YgVSwgW2FueV0+ID8geyBbSyBpbiBrZXlvZiBVXTogVVtLXVswXSB9IDogbmV2ZXJcbiAgOiBuZXZlcjtcblxuZXhwb3J0IGNsYXNzIE5ld1JlbGljTG9nVHJhbnNwb3J0IGV4dGVuZHMgVHJhbnNwb3J0IHtcbiAgICBwcml2YXRlIHN0YXRpYyByZWFkb25seSBnemlwT3B0czogemxpYi5abGliT3B0aW9ucyA9IHtcbiAgICAgICAgXG4gICAgfVxuICAgIHByaXZhdGUgY29uZmlnOiBSZXF1aXJlZEtlZXBVbmRlZmluZWQ8VW5pcXVlTmV3UmVsaWNMb2dUcmFuc3BvcnRPcHRpb25zPiAmIFRyYW5zcG9ydC5UcmFuc3BvcnRTdHJlYW1PcHRpb25zO1xuICAgIHByaXZhdGUgbG9nUXVldWU6IGFueVtdID0gW107XG4gICAgcHJpdmF0ZSBsb2dMZW5ndGhRdWV1ZTogbnVtYmVyW10gPSBbXTtcbiAgICBwcml2YXRlIHRvdGFsTGVuZ3RoQ291bnQgPSAwO1xuICAgIHByaXZhdGUgZ2xvYmFsQXR0cmlidXRlczoge1trZXk6IHN0cmluZ106IHN0cmluZ307XG5cbiAgICBcbiAgICBjb25zdHJ1Y3RvcihvcHRzOiBOZXdSZWxpY0xvZ1RyYW5zcG9ydE9wdGlvbnMsIGdsb2JhbEF0dHJpYnV0ZXM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9KSB7XG4gICAgICAgIHN1cGVyKG9wdHMpO1xuICAgICAgICB0aGlzLmludGVybmFsTG9nKCdpbmZvJywgJ2NyZWF0aW5nIG5ldyByZWxpYyB0cmFuc3BvcnQnKTtcbiAgICAgICAgdGhpcy5nbG9iYWxBdHRyaWJ1dGVzID0gZ2xvYmFsQXR0cmlidXRlcztcbiAgICAgICAgdGhpcy5jb25maWcgPSB7XG4gICAgICAgICAgICBieXRlc1dyaXR0ZW5UaHJlc2hvbGQ6IE1BWF9QQVlMT0FEX1NJWkUgKiA0IC8gNSxcbiAgICAgICAgICAgIHdhcm5PbkF0dHJpYnV0ZUxlbmd0aE92ZXJmbG93OiBmYWxzZSxcbiAgICAgICAgICAgIG1pbkJ5dGVzV3JpdHRlbjogTUFYX1BBWUxPQURfU0laRSAqIDEgLyA1LFxuICAgICAgICAgICAgbWluTG9nSXRlbXM6IDEwLFxuICAgICAgICAgICAgbG9nUHVzaEZyZXF1ZW5jeTogMTAwMDAsXG4gICAgICAgICAgICBsb2dDb3VudFRocmVzaG9sZDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgLi4ub3B0c1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuY29uZmlnLmJ5dGVzV3JpdHRlblRocmVzaG9sZCA9IE1hdGgubWluKHRoaXMuY29uZmlnLmJ5dGVzV3JpdHRlblRocmVzaG9sZCB8fCAwLCBNQVhfUEFZTE9BRF9TSVpFICogNCAvIDUpO1xuXG4gICAgICAgIHRoaXMucmVnaXN0ZXJBcHBEZWF0aExvZ1B1c2goKTtcbiAgICAgICAgdGhpcy5jcmVhdGVMb2dDaGVja1RpbWVvdXQoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiB0byB3cml0ZSBsb2dzIHRoYXQgYXJlIGludGVybmFsIHRvIHRoaXMgbW9kdWxlLlxuICAgICAqIEJ1ZmZlcnMgY2FsbHMgdW50aWwgdGhlIFdpbnN0b24gbG9nZ2VyIGNhbiBiZSBhc3luYyBpbXBvcnRkXG4gICAgICogQWZ0ZXJ3b3Jkcywgd3JpdGVzIGxvZ3MgZGlyZWN0bHkgdG8gdGhlIGxvZ2dlclxuICAgICAqIEBwYXJhbSBsZXZlbCBcbiAgICAgKiBAcGFyYW0gbWVzc2FnZSBcbiAgICAgKi9cbiAgICBpbnRlcm5hbExvZyhsZXZlbDogc3RyaW5nLCBtZXNzYWdlOiBzdHJpbmcpIHtcbiAgICAgICAgaWYgKGxvZykge1xuICAgICAgICAgICAgKGxvZyBhcyBhbnkpW2xldmVsXShtZXNzYWdlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGludGVybmFsTG9nQnVmZmVyLnB1c2goW2xldmVsLCBtZXNzYWdlXSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBsb2coaW5mbzogYW55LCBjYWxsYmFjazogKCgpID0+IHZvaWQpIHwgdW5kZWZpbmVkKSB7XG4gICAgICAgIHRoaXMubG9nVHJhbnNmb3JtKGluZm8pO1xuICAgICAgICBjb25zdCBsb2dTdHJpbmcgPSBKU09OLnN0cmluZ2lmeShpbmZvKTtcbiAgICAgICAgY29uc3QgbGVuZ3RoID0gQnVmZmVyLmJ5dGVMZW5ndGgobG9nU3RyaW5nKTtcbiAgICAgICAgdGhpcy5sb2dRdWV1ZS5wdXNoKGluZm8pO1xuICAgICAgICB0aGlzLmxvZ0xlbmd0aFF1ZXVlLnB1c2gobGVuZ3RoKTtcbiAgICAgICAgdGhpcy50b3RhbExlbmd0aENvdW50ICs9IGxlbmd0aDtcblxuICAgICAgICAvLyBpZiAodGhpcy5sb2dzV3JpdGFibGVQcmVkaWNhdGUoKSkge1xuICAgICAgICAvLyAgICAgdGhpcy5iZWdpbldyaXRlTG9ncygpO1xuICAgICAgICAvLyB9XG4gICAgICAgIGlmIChjYWxsYmFjaykgY2FsbGJhY2soKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHdyaXRlTG9nc1N5bmMoKSB7XG4gICAgICAgIGNvbnN0IGxvZ3NUb1dyaXRlID0gdGhpcy5zbGljZUxvZ3MoKTtcbiAgICAgICAgdGhpcy5pbnRlcm5hbExvZygnc2lsbHknLCAnUHJlcGFyaW5nIGZpbmFsIGxvZyBwYXlsb2FkIGZvciBOUiBjb2xsZWN0b3InKTtcbiAgICAgICAgY29uc3QgcmF3UGF5bG9hZCA9IHRoaXMuYnVpbGRSYXdQb3N0Qm9keShsb2dzVG9Xcml0ZSk7XG4gICAgICAgIGNvbnN0IGNvbXByZXNzZWRQYXlsb2FkID0gemxpYi5nemlwU3luYyhyYXdQYXlsb2FkKTtcbiAgICAgICAgLy8gdGhpcy5zZW5kTG9ncyhjb21wcmVzc2VkUGF5bG9hZCk7XG4gICAgICAgIHRoaXMud3JpdGVMb2dzVG9GaWxlU3lzdGVtKGNvbXByZXNzZWRQYXlsb2FkKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGxvZ3NXcml0dGVuID0gMDtcbiAgICBwdWJsaWMgd3JpdGVMb2dzVG9GaWxlU3lzdGVtKGJ1ZmZlcjogQnVmZmVyKSB7XG4gICAgICAgIGZzLndyaXRlRmlsZVN5bmMoYHRlc3QtJHt0aGlzLmxvZ3NXcml0dGVuKyt9Lmd6YCwgYnVmZmVyKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIGJlZ2luV3JpdGVMb2dzKCkge1xuICAgICAgICBjb25zdCBsb2dzVG9Xcml0ZSA9IHRoaXMuc2xpY2VMb2dzKCk7XG5cbiAgICAgICAgdGhpcy5pbnRlcm5hbExvZygnc2lsbHknLCAnUHJlcGFyaW5nIGxvZyBwYXlsb2FkIGZvciBOUiBjb2xsZWN0b3InKTtcbiAgICAgICAgY29uc3QgcmF3UGF5bG9hZCA9IHRoaXMuYnVpbGRSYXdQb3N0Qm9keShsb2dzVG9Xcml0ZSk7XG4gICAgICAgIGNvbnN0IGNvbXByZXNzZWRQYXlsb2FkOiBCdWZmZXIgPSBhd2FpdCB0aGlzLmNvbXByZXNzUGF5bG9hZChyYXdQYXlsb2FkKTtcbiAgICAgICAgLy8gdGhpcy5zZW5kTG9ncyhjb21wcmVzc2VkUGF5bG9hZCk7XG4gICAgICAgIHRoaXMud3JpdGVMb2dzVG9GaWxlU3lzdGVtKGNvbXByZXNzZWRQYXlsb2FkKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHNlbmRMb2dzKGNvbXByZXNzZWRQYXlsb2FkOiBCdWZmZXIpIHtcbiAgICAgICAgY29uc3QgcmVxID0gaHR0cHMucmVxdWVzdCh7XG4gICAgICAgICAgICBob3N0bmFtZTogQVBJX0hPU1ROQU1FLFxuICAgICAgICAgICAgcGF0aDogQVBJX1BBVEgsXG4gICAgICAgICAgICBwb3J0OiA0NDMsXG4gICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2d6aXAnLFxuICAgICAgICAgICAgICAgICdYLUxpY2Vuc2UtS2V5JzogcHJvY2Vzcy5lbnYuTkVXX1JFTElDX0xJQ0VOU0VfS0VZLFxuICAgICAgICAgICAgICAgICdBY2NlcHQnOiAnKi8qJyxcbiAgICAgICAgICAgICAgICAnQ29udGVudC1MZW5ndGgnOiBjb21wcmVzc2VkUGF5bG9hZC5ieXRlTGVuZ3RoXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJlcS5vbignY29ubmVjdCcsICgpID0+IHtcbiAgICAgICAgICAgIHJlcS53cml0ZShjb21wcmVzc2VkUGF5bG9hZCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJlcS5vbigncmVzcG9uc2UnLCByZXNwb25zZSA9PiB7XG4gICAgICAgICAgICBpZihyZXNwb25zZS5zdGF0dXNDb2RlID09PSAyMDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuaW50ZXJuYWxMb2coJ2Vycm9yJywgJ0Vycm9yIGRlbGl2ZXJpbmcgbG9ncyB0byBOUjonKTtcbiAgICAgICAgICAgICAgICB0aGlzLmludGVybmFsTG9nKCdlcnJvcicsIGAke3Jlc3BvbnNlLnN0YXR1c0NvZGV9IC0gJHtyZXNwb25zZS5zdGF0dXNNZXNzYWdlfWApXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgYnVpbGRSYXdQb3N0Qm9keShsb2dzOiBhbnlbXSk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShbe1xuICAgICAgICAgICAgY29tbW9uOiB7XG4gICAgICAgICAgICAgICAgYXR0cmlidXRlczoge1xuICAgICAgICAgICAgICAgICAgICAuLi50aGlzLmdsb2JhbEF0dHJpYnV0ZXMsXG4gICAgICAgICAgICAgICAgICAgIHNlcnZpY2U6IHByb2Nlc3MuZW52Lk5FV19SRUxJQ19BUFBfTkFNRVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgbG9nczogbG9nc1xuICAgICAgICAgICAgfVxuICAgICAgICB9XSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBjb21wcmVzc1BheWxvYWQocmF3UGF5bG9hZDogc3RyaW5nKTogUHJvbWlzZTxCdWZmZXI+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPEJ1ZmZlcj4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgemxpYi5nemlwKEJ1ZmZlci5mcm9tKHJhd1BheWxvYWQsICd1dGY4JyksIChlcnIsIGNvbXByZXNzZWRQYXlsb2FkKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikgcmVqZWN0KGVycik7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShjb21wcmVzc2VkUGF5bG9hZCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzbGljZUxvZ3MoKSB7XG4gICAgICAgIGxldCBsb2dzVG9TZW5kO1xuICAgICAgICBcbiAgICAgICAgLy8gSWYgd2Uga25vdyB0aGUgdG90YWwgbGVuZ3RoIHdpbGwgbm90IGV4Y2VlZCBtYXhpbXVtIGxlbmd0aCBzaXplXG4gICAgICAgIGlmICh0aGlzLnRvdGFsTGVuZ3RoQ291bnQgPCBNQVhfUEFZTE9BRF9TSVpFKSB7XG4gICAgICAgICAgICBbbG9nc1RvU2VuZCwgdGhpcy5sb2dRdWV1ZV0gPSBbdGhpcy5sb2dRdWV1ZSwgW11dO1xuICAgICAgICAgICAgdGhpcy5sb2dMZW5ndGhRdWV1ZSA9IFtdO1xuICAgICAgICAgICAgdGhpcy50b3RhbExlbmd0aENvdW50ID0gMDtcbiAgICAgICAgICAgIHJldHVybiBsb2dzVG9TZW5kO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gb3RoZXJ3aXNlLCBzbGljZSBvZmYgYSBzbGljZSBvZiBsb2dzIHRoYXQgd2lsbCBmaXQgaW50byBhIHNpbmdsZSByZXF1ZXN0XG4gICAgICAgIGxldCBsb2dTaXplID0gMDtcbiAgICAgICAgbGV0IGxvZ1NsaWNlSW5kZXggPSAwO1xuXG4gICAgICAgIHdoaWxlKCh0aGlzLmxvZ1F1ZXVlLmxlbmd0aCA+IDApICYmIChsb2dTaXplICsgdGhpcy5sb2dMZW5ndGhRdWV1ZVswXSA8IE1BWF9QQVlMT0FEX1NJWkUpKSB7XG4gICAgICAgICAgICBsb2dTbGljZUluZGV4Kys7XG4gICAgICAgIH1cblxuICAgICAgICBsb2dzVG9TZW5kID0gdGhpcy5sb2dRdWV1ZS5zbGljZSgwLCBsb2dTbGljZUluZGV4KTtcbiAgICAgICAgdGhpcy5sb2dRdWV1ZSA9IHRoaXMubG9nUXVldWUuc2xpY2UobG9nU2xpY2VJbmRleCk7XG4gICAgICAgIHRoaXMubG9nTGVuZ3RoUXVldWUgPSB0aGlzLmxvZ0xlbmd0aFF1ZXVlLnNsaWNlKGxvZ1NsaWNlSW5kZXgpO1xuXG4gICAgICAgIHJldHVybiBsb2dzVG9TZW5kO1xuICAgIH1cblxuICAgIHByaXZhdGUgbG9nc1dyaXRhYmxlUHJlZGljYXRlKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5taW5Mb2dJdGVtc0V4Y2VlZGVkKClcbiAgICB9XG5cbiAgICBwcml2YXRlIG1pbkxvZ0l0ZW1zRXhjZWVkZWQoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiAhISh0aGlzLmNvbmZpZy5taW5Mb2dJdGVtcyAmJiAodGhpcy5sb2dRdWV1ZS5sZW5ndGggPiB0aGlzLmNvbmZpZy5taW5Mb2dJdGVtcykpO1xuICAgIH0gICAgXG4gICAgXG4gICAgLyoqXG4gICAgICogRml4ZXMgcG9zc2libGUgaXNzdWVzIGluIGxvZyBmb3JtYXQgY2F1c2VkIGJ5IGxpbWl0YXRpb25zIG9mIE5ScyBsb2dnaW5nXG4gICAgICogdmFsdWVzXG4gICAgICogQHBhcmFtIGxvZyBcbiAgICAgKiBAcmV0dXJucyBcbiAgICAgKi9cbiAgICBwcml2YXRlIGxvZ1RyYW5zZm9ybShsb2c6IGFueSkge1xuXG4gICAgICAgIGlmIChPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhsb2cpLmxlbmd0aCA+IE1BWF9BVFRSSUJVVEVTX1BFUl9FVkVOVCkge1xuICAgICAgICAgICAgdGhpcy5pbnRlcm5hbExvZygnd2FybicsIGBMb2cgdG8gc2VuZCB0byBKU09OIGNvbnRhaW5zICR7T2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMobG9nKX0gLyAke01BWF9BVFRSSUJVVEVTX1BFUl9FVkVOVH0gYXR0cmlidXRlcy5gKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgZm9yIChsZXQga2V5IG9mIE9iamVjdC5rZXlzKGxvZykpIHtcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gbG9nW2tleV07XG4gICAgICAgICAgICAvLyByZXBsYWNlIGtleSB3aXRoIGxlbmd0aCB0b28gaGlnaFxuICAgICAgICAgICAgaWYgKGtleS5sZW5ndGggPiBNQVhfQVRUUklCVVRFX05BTUVfTEVOR1RIKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbmV3S2V5ID0ga2V5LnNsaWNlKDAsIE1BWF9BVFRSSUJVVEVfTkFNRV9MRU5HVEgpO1xuICAgICAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShsb2csIGtleS5zbGljZSgwLCBNQVhfQVRUUklCVVRFX05BTUVfTEVOR1RIKSwgXG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IobG9nLCBrZXkgYXMgUHJvcGVydHlLZXkpIGFzIFByb3BlcnR5RGVzY3JpcHRvcik7XG4gICAgICAgICAgICAgICAgZGVsZXRlIGxvZy5rZXk7XG5cbiAgICAgICAgICAgICAgICAvLyBVcGRhdGUga2V5IG5hbWUgZm9yIHVzYWdlIGluIGxhdGVyIHN0ZXBzXG4gICAgICAgICAgICAgICAga2V5ID0gbmV3S2V5O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBDb25jYXRlbmF0ZSBsb2cgbWVzc2FnZXMgd2l0aCBsZW5ndGggZ3JlYXRlciB0aGFuIE1BWF9BVFRSSUJVVEVfVkFMVUVfTEVOR1RIXG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiB2YWx1ZS5sZW5ndGggPiBNQVhfQVRUUklCVVRFX1ZBTFVFX0xFTkdUSCkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNvbmZpZz8ud2Fybk9uQXR0cmlidXRlTGVuZ3RoT3ZlcmZsb3cpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnRlcm5hbExvZygnd2FybicsIGBOUiBMb2cgYXR0cmlidXRlIGxlbmd0aCBvdmVyZmxvdy4gTGVuZ3RoOiAke3ZhbHVlLmxlbmd0aH0vJHtNQVhfQVRUUklCVVRFX1ZBTFVFX0xFTkdUSH1gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbG9nLmtleSA9IHZhbHVlLnNsaWNlKDAsIE1BWF9BVFRSSUJVVEVfVkFMVUVfTEVOR1RIKTsgXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChrZXkuaW5jbHVkZXMoJyAnKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG5ld0tleSA9IGtleS5yZXBsYWNlQWxsKCcgJywgJy4nKTtcbiAgICAgICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobG9nLCBrZXkuc2xpY2UoMCwgTUFYX0FUVFJJQlVURV9OQU1FX0xFTkdUSCksIFxuICAgICAgICAgICAgICAgICAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGxvZywga2V5IGFzIFByb3BlcnR5S2V5KSBhcyBQcm9wZXJ0eURlc2NyaXB0b3IpO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBsb2cua2V5O1xuXG4gICAgICAgICAgICAgICAgLy8gVXBkYXRlIGtleSBuYW1lIGZvciB1c2FnZSBpbiBsYXRlciBzdGVwc1xuICAgICAgICAgICAgICAgIGtleSA9IG5ld0tleTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGNyZWF0ZUxvZ0NoZWNrVGltZW91dCgpIHtcbiAgICAgICAgc2V0VGltZW91dChhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy5sb2dRdWV1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5iZWdpbldyaXRlTG9ncygpO1xuICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRlTG9nQ2hlY2tUaW1lb3V0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHRoaXMuY29uZmlnLmxvZ1B1c2hGcmVxdWVuY3kpXG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZWdpc3RlckFwcERlYXRoTG9nUHVzaCgpIHtcbiAgICAgICAgbGV0IGZpbmFsV3JpdHRlbiA9IGZhbHNlO1xuICAgICAgICBwcm9jZXNzLm9uKCdleGl0JywgKCkgPT4ge1xuICAgICAgICAgICAgbGV0IG8gPSBmaW5hbFdyaXR0ZW47XG4gICAgICAgICAgICBmaW5hbFdyaXR0ZW4gPSB0cnVlO1xuICAgICAgICAgICAgaWYgKG8pIHJldHVybjtcblxuICAgICAgICAgICAgdGhpcy5pbnRlcm5hbExvZygnaW5mbycsICd3cml0aW5nIGZpbmFsIGxvZ3MnKTtcbiAgICAgICAgICAgIHRoaXMud3JpdGVMb2dzU3luYygpO1xuICAgICAgICB9KTtcblxuICAgICAgICBwcm9jZXNzLm9uKCdTSUdJTlQnLCAoKSA9PiB7XG4gICAgICAgICAgICBwcm9jZXNzLmV4aXQoMik7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHByb2Nlc3Mub24oJ3VuY2F1Z2h0RXhjZXB0aW9uJywgKGUpID0+IHtcbiAgICAgICAgICAgIHRoaXMuaW50ZXJuYWxMb2coJ2Vycm9yJywgZS5zdGFjayB8fCAnJyk7XG4gICAgICAgICAgICBwcm9jZXNzLmV4aXQoOTkpO1xuICAgICAgICB9KTtcblxuICAgICAgICBwcm9jZXNzLm9uKCdTSUdURVJNJywgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy53cml0ZUxvZ3NTeW5jKCk7XG4gICAgICAgIH0pXG4gICAgfVxufVxuXG4oYXN5bmMgKCkgPT4ge1xuICAgIGNvbnN0IHsgd2l0aExvZ2dlciB9ID0gYXdhaXQgaW1wb3J0KCcuL2xvZ2dlcicpO1xuICAgIGxvZyA9IHdpdGhMb2dnZXIoJ3Rlc3QnKTtcbiAgICB3aGlsZShpbnRlcm5hbExvZ0J1ZmZlci5sZW5ndGgpIHtcbiAgICAgICAgY29uc3QgW2xldmVsLCBtZXNzYWdlXSA9IGludGVybmFsTG9nQnVmZmVyLnNoaWZ0KCkgYXMgW3N0cmluZywgc3RyaW5nXTtcbiAgICAgICAgKGxvZyBhcyBhbnkpW2xldmVsXShtZXNzYWdlKTtcbiAgICB9XG59KSgpO1xuXG4iXX0=