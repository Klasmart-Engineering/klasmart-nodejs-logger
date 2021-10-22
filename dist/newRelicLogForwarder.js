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
                this.internalLog('silly', 'Preparing log payload for NR collector');
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9uZXdSZWxpY0xvZ0ZvcndhcmRlci50cyJdLCJuYW1lcyI6WyJBUElfSE9TVE5BTUUiLCJwcm9jZXNzIiwiZW52IiwiS0xfTlJfTE9HX0hPU1ROQU1FIiwiQVBJX1BBVEgiLCJLTF9OUl9MT0dfUEFUSCIsIk1BWF9QQVlMT0FEX1NJWkUiLCJNQVhfQVRUUklCVVRFU19QRVJfRVZFTlQiLCJNQVhfQVRUUklCVVRFX05BTUVfTEVOR1RIIiwiTUFYX0FUVFJJQlVURV9WQUxVRV9MRU5HVEgiLCJsb2ciLCJpbnRlcm5hbExvZ0J1ZmZlciIsIk5ld1JlbGljTG9nVHJhbnNwb3J0Iiwib3B0cyIsImdsb2JhbEF0dHJpYnV0ZXMiLCJpbnRlcm5hbExvZyIsImNvbmZpZyIsImJ5dGVzV3JpdHRlblRocmVzaG9sZCIsIndhcm5PbkF0dHJpYnV0ZUxlbmd0aE92ZXJmbG93IiwibWluQnl0ZXNXcml0dGVuIiwibWluTG9nSXRlbXMiLCJsb2dQdXNoRnJlcXVlbmN5IiwibG9nQ291bnRUaHJlc2hvbGQiLCJ1bmRlZmluZWQiLCJNYXRoIiwibWluIiwicmVnaXN0ZXJBcHBEZWF0aExvZ1B1c2giLCJjcmVhdGVMb2dDaGVja1RpbWVvdXQiLCJsZXZlbCIsIm1lc3NhZ2UiLCJwdXNoIiwiaW5mbyIsImNhbGxiYWNrIiwibG9nVHJhbnNmb3JtIiwibG9nU3RyaW5nIiwiSlNPTiIsInN0cmluZ2lmeSIsImxlbmd0aCIsIkJ1ZmZlciIsImJ5dGVMZW5ndGgiLCJsb2dRdWV1ZSIsImxvZ0xlbmd0aFF1ZXVlIiwidG90YWxMZW5ndGhDb3VudCIsImxvZ3NUb1dyaXRlIiwic2xpY2VMb2dzIiwicmF3UGF5bG9hZCIsImJ1aWxkUmF3UG9zdEJvZHkiLCJjb21wcmVzc2VkUGF5bG9hZCIsInpsaWIiLCJnemlwU3luYyIsInNlbmRMb2dzIiwiYnVmZmVyIiwiZnMiLCJ3cml0ZUZpbGVTeW5jIiwibG9nc1dyaXR0ZW4iLCJjb21wcmVzc1BheWxvYWQiLCJyZXEiLCJodHRwcyIsInJlcXVlc3QiLCJob3N0bmFtZSIsInBhdGgiLCJwb3J0IiwibWV0aG9kIiwiaGVhZGVycyIsIk5FV19SRUxJQ19MSUNFTlNFX0tFWSIsIm9uIiwid3JpdGUiLCJyZXNwb25zZSIsInN0YXR1c0NvZGUiLCJzdGF0dXNNZXNzYWdlIiwibG9ncyIsImNvbW1vbiIsImF0dHJpYnV0ZXMiLCJzZXJ2aWNlIiwiTkVXX1JFTElDX0FQUF9OQU1FIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJnemlwIiwiZnJvbSIsImVyciIsImxvZ3NUb1NlbmQiLCJsb2dTaXplIiwibG9nU2xpY2VJbmRleCIsInNsaWNlIiwibWluTG9nSXRlbXNFeGNlZWRlZCIsIk9iamVjdCIsImdldE93blByb3BlcnR5TmFtZXMiLCJrZXlzIiwia2V5IiwidmFsdWUiLCJuZXdLZXkiLCJkZWZpbmVQcm9wZXJ0eSIsImdldE93blByb3BlcnR5RGVzY3JpcHRvciIsImluY2x1ZGVzIiwicmVwbGFjZUFsbCIsInNldFRpbWVvdXQiLCJiZWdpbldyaXRlTG9ncyIsImZpbmFsV3JpdHRlbiIsIm8iLCJ3cml0ZUxvZ3NTeW5jIiwiZXhpdCIsImUiLCJzdGFjayIsIlRyYW5zcG9ydCIsIndpdGhMb2dnZXIiLCJzaGlmdCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBR0EsSUFBTUEsWUFBWSxHQUFHQyxPQUFPLENBQUNDLEdBQVIsQ0FBWUMsa0JBQVosSUFBa0MseUJBQXZEO0FBQ0EsSUFBTUMsUUFBUSxHQUFHSCxPQUFPLENBQUNDLEdBQVIsQ0FBWUcsY0FBWixJQUE4QixTQUEvQztBQUNBLElBQU1DLGdCQUFnQixZQUFHLEVBQUgsRUFBTyxDQUFQLENBQXRCO0FBQ0EsSUFBTUMsd0JBQXdCLEdBQUcsR0FBakM7QUFDQSxJQUFNQyx5QkFBeUIsR0FBRyxHQUFsQztBQUNBLElBQU1DLDBCQUEwQixHQUFHLElB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QTBCdUYsQ0FBQyxDQUFDQyxLQUFGLElBQVcsRUFBckM7QUFDSCxPQUZEO0FBSUF0RyxNQUFBQSxPQUFPLENBQUNnRSxFQUFSLENBQVcsU0FBWCxFQUFzQixZQUFNO0FBQ3hCLFFBQUEsTUFBSSxDQUFDbUMsYUFBTDtBQUNILE9BRkQ7QUFHSDs7OztFQWpQcUNJLDRCOzs7O2dCQUE3QjVGLG9CLGNBQzRDLEU7O0FBbVB6RCx3REFBQztBQUFBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLG1EQUN1QyxVQUR2QztBQUFBOztBQUFBO0FBQUE7QUFDVzZGLFVBQUFBLFVBRFgsaUJBQ1dBLFVBRFg7QUFFRy9GLFVBQUFBLEdBQUcsR0FBRytGLFVBQVUsQ0FBQyxNQUFELENBQWhCOztBQUNBLGlCQUFNOUYsaUJBQWlCLENBQUMwQixNQUF4QixFQUFnQztBQUFBLG9CQUNIMUIsaUJBQWlCLENBQUMrRixLQUFsQixFQURHLG9DQUNyQjlFLEtBRHFCLGFBQ2RDLE9BRGM7QUFFM0JuQixZQUFBQSxHQUFELENBQWFrQixLQUFiLEVBQW9CQyxPQUFwQjtBQUNIOztBQU5KO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLENBQUQiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgaHR0cHMgZnJvbSAnaHR0cHMnO1xuaW1wb3J0IHpsaWIgZnJvbSAnemxpYic7XG5pbXBvcnQgVHJhbnNwb3J0IGZyb20gJ3dpbnN0b24tdHJhbnNwb3J0JztcbmltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgeyBMb2dnZXIgfSBmcm9tICd3aW5zdG9uJztcblxuY29uc3QgQVBJX0hPU1ROQU1FID0gcHJvY2Vzcy5lbnYuS0xfTlJfTE9HX0hPU1ROQU1FIHx8ICdsb2ctYXBpLmV1Lm5ld3JlbGljLmNvbSc7XG5jb25zdCBBUElfUEFUSCA9IHByb2Nlc3MuZW52LktMX05SX0xPR19QQVRIIHx8ICcvbG9nL3YxJztcbmNvbnN0IE1BWF9QQVlMT0FEX1NJWkUgPSAxMCoqNjtcbmNvbnN0IE1BWF9BVFRSSUJVVEVTX1BFUl9FVkVOVCA9IDI1NTtcbmNvbnN0IE1BWF9BVFRSSUJVVEVfTkFNRV9MRU5HVEggPSAyNTU7XG5jb25zdCBNQVhfQVRUUklCVVRFX1ZBTFVFX0xFTkdUSCA9IDQwOTY7XG5sZXQgbG9nOiBMb2dnZXIgfCB1bmRlZmluZWQ7XG5sZXQgaW50ZXJuYWxMb2dCdWZmZXI6IEFycmF5PFtzdHJpbmcsIHN0cmluZ10+ID0gW107XG5pbnRlcmZhY2UgVW5pcXVlTmV3UmVsaWNMb2dUcmFuc3BvcnRPcHRpb25zIHtcbiAgICAvKipcbiAgICAgKiBIb3cgZnJlcXVlbnRseSBjaGVja3Mgc2hvdWxkIGJlIHJ1biB0byBwdXNoIGxvZ3MgdG8gTlJcbiAgICAgKiBEZWZhdWx0IGlzIDEwIHNlY29uZHNcbiAgICAgKi9cbiAgICBsb2dQdXNoRnJlcXVlbmN5PzogbnVtYmVyO1xuXG4gICAgLyoqXG4gICAgICogTWluaW11bSBudW1iZXIgb2YgbG9nIHN0YXRlbWVudHMgd3JpdHRlbiBiZWZvcmUgbG9ncyBjYW4gYmUgcHVzaGVkIHRvIE5SLlxuICAgICAqIERlZmF1bHQgaXMgdW5kZWZpbmVkXG4gICAgICovXG4gICAgbWluTG9nSXRlbXM/OiBudW1iZXI7XG5cbiAgICAvKipcbiAgICAgKiBNaW5pbXVtIG51bWJlciBvZiBsb2cgc3RhdGVtZW50cyB0byBpbW1lZGlhdGVseSB0cmlnZ2VyIGEgcHVzaCB0byBOUi5cbiAgICAgKiBEZWZhdWx0IGlzIHVuZGVmaW5lZFxuICAgICAqL1xuICAgIGxvZ0NvdW50VGhyZXNob2xkPzogbnVtYmVyIHwgdW5kZWZpbmVkO1xuXG4gICAgLyoqXG4gICAgICogTWluaW11bSBudW1iZXIgb2YgYnl0ZXMgd3JpdHRlbiB0byBjb21wcmVzc2lvbiBzdHJlYW0gYmVmb3JlIHB1c2hpbmcgdG8gTlJcbiAgICAgKi9cbiAgICBtaW5CeXRlc1dyaXR0ZW4/OiBudW1iZXI7XG5cbiAgICAvKipcbiAgICAgKiBUaHJlc2hvbGQgZm9yIGJ5dGVzIHdyaXR0ZW4gYXQgd2hpY2ggcG9pbnQgYSBuZXcgd3JpdGUgdG8gTlIgd2lsbCBiZSBhdXRvbWF0aWNhbGx5XG4gICAgICogdHJpZ2dlcmVkLiBEZWZhdWx0cyB0byAoNC81ICogTUFYX1BBWUxPQURfU0laRSlcbiAgICAgKi9cbiAgICBieXRlc1dyaXR0ZW5UaHJlc2hvbGQ/OiBudW1iZXI7XG5cbiAgICAvKipcbiAgICAgKiBQcm9kdWNlIGEgd2FybmluZyB3aGVuIGF0dHJpYnV0ZSB2YWx1ZXMgb3ZlcmZsb3cgdGhlIE5SIG1heGltdW0gbGVuZ3RoIG9mIDQwOTYuXG4gICAgICogRGVmYXVsdCBpcyBmYWxzZS5cbiAgICAgKi9cbiAgICB3YXJuT25BdHRyaWJ1dGVMZW5ndGhPdmVyZmxvdz86IGJvb2xlYW47XG59XG5cbnR5cGUgTmV3UmVsaWNMb2dUcmFuc3BvcnRPcHRpb25zID0gVW5pcXVlTmV3UmVsaWNMb2dUcmFuc3BvcnRPcHRpb25zICYgVHJhbnNwb3J0LlRyYW5zcG9ydFN0cmVhbU9wdGlvbnM7XG5cbnR5cGUgUmVxdWlyZWRLZWVwVW5kZWZpbmVkPFQ+ID0geyBbSyBpbiBrZXlvZiBUXS0/OiBbVFtLXV0gfSBleHRlbmRzIGluZmVyIFVcbiAgPyBVIGV4dGVuZHMgUmVjb3JkPGtleW9mIFUsIFthbnldPiA/IHsgW0sgaW4ga2V5b2YgVV06IFVbS11bMF0gfSA6IG5ldmVyXG4gIDogbmV2ZXI7XG5cbmV4cG9ydCBjbGFzcyBOZXdSZWxpY0xvZ1RyYW5zcG9ydCBleHRlbmRzIFRyYW5zcG9ydCB7XG4gICAgcHJpdmF0ZSBzdGF0aWMgcmVhZG9ubHkgZ3ppcE9wdHM6IHpsaWIuWmxpYk9wdGlvbnMgPSB7XG4gICAgICAgIFxuICAgIH1cbiAgICBwcml2YXRlIGNvbmZpZzogUmVxdWlyZWRLZWVwVW5kZWZpbmVkPFVuaXF1ZU5ld1JlbGljTG9nVHJhbnNwb3J0T3B0aW9ucz4gJiBUcmFuc3BvcnQuVHJhbnNwb3J0U3RyZWFtT3B0aW9ucztcbiAgICBwcml2YXRlIGxvZ1F1ZXVlOiBhbnlbXSA9IFtdO1xuICAgIHByaXZhdGUgbG9nTGVuZ3RoUXVldWU6IG51bWJlcltdID0gW107XG4gICAgcHJpdmF0ZSB0b3RhbExlbmd0aENvdW50ID0gMDtcbiAgICBwcml2YXRlIGdsb2JhbEF0dHJpYnV0ZXM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9O1xuXG4gICAgXG4gICAgY29uc3RydWN0b3Iob3B0czogTmV3UmVsaWNMb2dUcmFuc3BvcnRPcHRpb25zLCBnbG9iYWxBdHRyaWJ1dGVzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSkge1xuICAgICAgICBzdXBlcihvcHRzKTtcbiAgICAgICAgdGhpcy5pbnRlcm5hbExvZygnaW5mbycsICdjcmVhdGluZyBuZXcgcmVsaWMgdHJhbnNwb3J0Jyk7XG4gICAgICAgIHRoaXMuZ2xvYmFsQXR0cmlidXRlcyA9IGdsb2JhbEF0dHJpYnV0ZXM7XG4gICAgICAgIHRoaXMuY29uZmlnID0ge1xuICAgICAgICAgICAgYnl0ZXNXcml0dGVuVGhyZXNob2xkOiBNQVhfUEFZTE9BRF9TSVpFICogNCAvIDUsXG4gICAgICAgICAgICB3YXJuT25BdHRyaWJ1dGVMZW5ndGhPdmVyZmxvdzogZmFsc2UsXG4gICAgICAgICAgICBtaW5CeXRlc1dyaXR0ZW46IE1BWF9QQVlMT0FEX1NJWkUgKiAxIC8gNSxcbiAgICAgICAgICAgIG1pbkxvZ0l0ZW1zOiAxMCxcbiAgICAgICAgICAgIGxvZ1B1c2hGcmVxdWVuY3k6IDEwMDAwLFxuICAgICAgICAgICAgbG9nQ291bnRUaHJlc2hvbGQ6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIC4uLm9wdHNcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmNvbmZpZy5ieXRlc1dyaXR0ZW5UaHJlc2hvbGQgPSBNYXRoLm1pbih0aGlzLmNvbmZpZy5ieXRlc1dyaXR0ZW5UaHJlc2hvbGQgfHwgMCwgTUFYX1BBWUxPQURfU0laRSAqIDQgLyA1KTtcblxuICAgICAgICB0aGlzLnJlZ2lzdGVyQXBwRGVhdGhMb2dQdXNoKCk7XG4gICAgICAgIHRoaXMuY3JlYXRlTG9nQ2hlY2tUaW1lb3V0KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRnVuY3Rpb24gdG8gd3JpdGUgbG9ncyB0aGF0IGFyZSBpbnRlcm5hbCB0byB0aGlzIG1vZHVsZS5cbiAgICAgKiBCdWZmZXJzIGNhbGxzIHVudGlsIHRoZSBXaW5zdG9uIGxvZ2dlciBjYW4gYmUgYXN5bmMgaW1wb3J0ZFxuICAgICAqIEFmdGVyd29yZHMsIHdyaXRlcyBsb2dzIGRpcmVjdGx5IHRvIHRoZSBsb2dnZXJcbiAgICAgKiBAcGFyYW0gbGV2ZWwgXG4gICAgICogQHBhcmFtIG1lc3NhZ2UgXG4gICAgICovXG4gICAgaW50ZXJuYWxMb2cobGV2ZWw6IHN0cmluZywgbWVzc2FnZTogc3RyaW5nKSB7XG4gICAgICAgIGlmIChsb2cpIHtcbiAgICAgICAgICAgIChsb2cgYXMgYW55KVtsZXZlbF0obWVzc2FnZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpbnRlcm5hbExvZ0J1ZmZlci5wdXNoKFtsZXZlbCwgbWVzc2FnZV0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgbG9nKGluZm86IGFueSwgY2FsbGJhY2s6ICgoKSA9PiB2b2lkKSB8IHVuZGVmaW5lZCkge1xuICAgICAgICB0aGlzLmxvZ1RyYW5zZm9ybShpbmZvKTtcbiAgICAgICAgY29uc3QgbG9nU3RyaW5nID0gSlNPTi5zdHJpbmdpZnkoaW5mbyk7XG4gICAgICAgIGNvbnN0IGxlbmd0aCA9IEJ1ZmZlci5ieXRlTGVuZ3RoKGxvZ1N0cmluZyk7XG4gICAgICAgIHRoaXMubG9nUXVldWUucHVzaChpbmZvKTtcbiAgICAgICAgdGhpcy5sb2dMZW5ndGhRdWV1ZS5wdXNoKGxlbmd0aCk7XG4gICAgICAgIHRoaXMudG90YWxMZW5ndGhDb3VudCArPSBsZW5ndGg7XG5cbiAgICAgICAgLy8gaWYgKHRoaXMubG9nc1dyaXRhYmxlUHJlZGljYXRlKCkpIHtcbiAgICAgICAgLy8gICAgIHRoaXMuYmVnaW5Xcml0ZUxvZ3MoKTtcbiAgICAgICAgLy8gfVxuICAgICAgICBpZiAoY2FsbGJhY2spIGNhbGxiYWNrKCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB3cml0ZUxvZ3NTeW5jKCkge1xuICAgICAgICBjb25zdCBsb2dzVG9Xcml0ZSA9IHRoaXMuc2xpY2VMb2dzKCk7XG4gICAgICAgIHRoaXMuaW50ZXJuYWxMb2coJ3NpbGx5JywgJ1ByZXBhcmluZyBmaW5hbCBsb2cgcGF5bG9hZCBmb3IgTlIgY29sbGVjdG9yJyk7XG4gICAgICAgIGNvbnN0IHJhd1BheWxvYWQgPSB0aGlzLmJ1aWxkUmF3UG9zdEJvZHkobG9nc1RvV3JpdGUpO1xuICAgICAgICBjb25zdCBjb21wcmVzc2VkUGF5bG9hZCA9IHpsaWIuZ3ppcFN5bmMocmF3UGF5bG9hZCk7XG4gICAgICAgIHRoaXMuc2VuZExvZ3MoY29tcHJlc3NlZFBheWxvYWQpO1xuICAgIH1cblxuICAgIHByaXZhdGUgbG9nc1dyaXR0ZW4gPSAwO1xuICAgIHB1YmxpYyB3cml0ZUxvZ3NUb0ZpbGVTeXN0ZW0oYnVmZmVyOiBCdWZmZXIpIHtcbiAgICAgICAgZnMud3JpdGVGaWxlU3luYyhgdGVzdC0ke3RoaXMubG9nc1dyaXR0ZW4rK30uZ3pgLCBidWZmZXIpO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgYmVnaW5Xcml0ZUxvZ3MoKSB7XG4gICAgICAgIGNvbnN0IGxvZ3NUb1dyaXRlID0gdGhpcy5zbGljZUxvZ3MoKTtcblxuICAgICAgICB0aGlzLmludGVybmFsTG9nKCdzaWxseScsICdQcmVwYXJpbmcgbG9nIHBheWxvYWQgZm9yIE5SIGNvbGxlY3RvcicpO1xuICAgICAgICBjb25zdCByYXdQYXlsb2FkID0gdGhpcy5idWlsZFJhd1Bvc3RCb2R5KGxvZ3NUb1dyaXRlKTtcbiAgICAgICAgY29uc3QgY29tcHJlc3NlZFBheWxvYWQ6IEJ1ZmZlciA9IGF3YWl0IHRoaXMuY29tcHJlc3NQYXlsb2FkKHJhd1BheWxvYWQpO1xuICAgICAgICB0aGlzLnNlbmRMb2dzKGNvbXByZXNzZWRQYXlsb2FkKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHNlbmRMb2dzKGNvbXByZXNzZWRQYXlsb2FkOiBCdWZmZXIpIHtcbiAgICAgICAgY29uc3QgcmVxID0gaHR0cHMucmVxdWVzdCh7XG4gICAgICAgICAgICBob3N0bmFtZTogQVBJX0hPU1ROQU1FLFxuICAgICAgICAgICAgcGF0aDogQVBJX1BBVEgsXG4gICAgICAgICAgICBwb3J0OiA0NDMsXG4gICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2d6aXAnLFxuICAgICAgICAgICAgICAgICdYLUxpY2Vuc2UtS2V5JzogcHJvY2Vzcy5lbnYuTkVXX1JFTElDX0xJQ0VOU0VfS0VZLFxuICAgICAgICAgICAgICAgICdBY2NlcHQnOiAnKi8qJyxcbiAgICAgICAgICAgICAgICAnQ29udGVudC1MZW5ndGgnOiBjb21wcmVzc2VkUGF5bG9hZC5ieXRlTGVuZ3RoXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJlcS5vbignY29ubmVjdCcsICgpID0+IHtcbiAgICAgICAgICAgIHJlcS53cml0ZShjb21wcmVzc2VkUGF5bG9hZCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJlcS5vbigncmVzcG9uc2UnLCByZXNwb25zZSA9PiB7XG4gICAgICAgICAgICBpZihyZXNwb25zZS5zdGF0dXNDb2RlID09PSAyMDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuaW50ZXJuYWxMb2coJ2Vycm9yJywgJ0Vycm9yIGRlbGl2ZXJpbmcgbG9ncyB0byBOUjonKTtcbiAgICAgICAgICAgICAgICB0aGlzLmludGVybmFsTG9nKCdlcnJvcicsIGAke3Jlc3BvbnNlLnN0YXR1c0NvZGV9IC0gJHtyZXNwb25zZS5zdGF0dXNNZXNzYWdlfWApXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgYnVpbGRSYXdQb3N0Qm9keShsb2dzOiBhbnlbXSk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShbe1xuICAgICAgICAgICAgY29tbW9uOiB7XG4gICAgICAgICAgICAgICAgYXR0cmlidXRlczoge1xuICAgICAgICAgICAgICAgICAgICAuLi50aGlzLmdsb2JhbEF0dHJpYnV0ZXMsXG4gICAgICAgICAgICAgICAgICAgIHNlcnZpY2U6IHByb2Nlc3MuZW52Lk5FV19SRUxJQ19BUFBfTkFNRVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgbG9nczogbG9nc1xuICAgICAgICAgICAgfVxuICAgICAgICB9XSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBjb21wcmVzc1BheWxvYWQocmF3UGF5bG9hZDogc3RyaW5nKTogUHJvbWlzZTxCdWZmZXI+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPEJ1ZmZlcj4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgemxpYi5nemlwKEJ1ZmZlci5mcm9tKHJhd1BheWxvYWQsICd1dGY4JyksIChlcnIsIGNvbXByZXNzZWRQYXlsb2FkKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikgcmVqZWN0KGVycik7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShjb21wcmVzc2VkUGF5bG9hZCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzbGljZUxvZ3MoKSB7XG4gICAgICAgIGxldCBsb2dzVG9TZW5kO1xuICAgICAgICBcbiAgICAgICAgLy8gSWYgd2Uga25vdyB0aGUgdG90YWwgbGVuZ3RoIHdpbGwgbm90IGV4Y2VlZCBtYXhpbXVtIGxlbmd0aCBzaXplXG4gICAgICAgIGlmICh0aGlzLnRvdGFsTGVuZ3RoQ291bnQgPCBNQVhfUEFZTE9BRF9TSVpFKSB7XG4gICAgICAgICAgICBbbG9nc1RvU2VuZCwgdGhpcy5sb2dRdWV1ZV0gPSBbdGhpcy5sb2dRdWV1ZSwgW11dO1xuICAgICAgICAgICAgdGhpcy5sb2dMZW5ndGhRdWV1ZSA9IFtdO1xuICAgICAgICAgICAgdGhpcy50b3RhbExlbmd0aENvdW50ID0gMDtcbiAgICAgICAgICAgIHJldHVybiBsb2dzVG9TZW5kO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gb3RoZXJ3aXNlLCBzbGljZSBvZmYgYSBzbGljZSBvZiBsb2dzIHRoYXQgd2lsbCBmaXQgaW50byBhIHNpbmdsZSByZXF1ZXN0XG4gICAgICAgIGxldCBsb2dTaXplID0gMDtcbiAgICAgICAgbGV0IGxvZ1NsaWNlSW5kZXggPSAwO1xuXG4gICAgICAgIHdoaWxlKCh0aGlzLmxvZ1F1ZXVlLmxlbmd0aCA+IDApICYmIChsb2dTaXplICsgdGhpcy5sb2dMZW5ndGhRdWV1ZVswXSA8IE1BWF9QQVlMT0FEX1NJWkUpKSB7XG4gICAgICAgICAgICBsb2dTbGljZUluZGV4Kys7XG4gICAgICAgIH1cblxuICAgICAgICBsb2dzVG9TZW5kID0gdGhpcy5sb2dRdWV1ZS5zbGljZSgwLCBsb2dTbGljZUluZGV4KTtcbiAgICAgICAgdGhpcy5sb2dRdWV1ZSA9IHRoaXMubG9nUXVldWUuc2xpY2UobG9nU2xpY2VJbmRleCk7XG4gICAgICAgIHRoaXMubG9nTGVuZ3RoUXVldWUgPSB0aGlzLmxvZ0xlbmd0aFF1ZXVlLnNsaWNlKGxvZ1NsaWNlSW5kZXgpO1xuXG4gICAgICAgIHJldHVybiBsb2dzVG9TZW5kO1xuICAgIH1cblxuICAgIHByaXZhdGUgbG9nc1dyaXRhYmxlUHJlZGljYXRlKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5taW5Mb2dJdGVtc0V4Y2VlZGVkKClcbiAgICB9XG5cbiAgICBwcml2YXRlIG1pbkxvZ0l0ZW1zRXhjZWVkZWQoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiAhISh0aGlzLmNvbmZpZy5taW5Mb2dJdGVtcyAmJiAodGhpcy5sb2dRdWV1ZS5sZW5ndGggPiB0aGlzLmNvbmZpZy5taW5Mb2dJdGVtcykpO1xuICAgIH0gICAgXG4gICAgXG4gICAgLyoqXG4gICAgICogRml4ZXMgcG9zc2libGUgaXNzdWVzIGluIGxvZyBmb3JtYXQgY2F1c2VkIGJ5IGxpbWl0YXRpb25zIG9mIE5ScyBsb2dnaW5nXG4gICAgICogdmFsdWVzXG4gICAgICogQHBhcmFtIGxvZyBcbiAgICAgKiBAcmV0dXJucyBcbiAgICAgKi9cbiAgICBwcml2YXRlIGxvZ1RyYW5zZm9ybShsb2c6IGFueSkge1xuXG4gICAgICAgIGlmIChPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhsb2cpLmxlbmd0aCA+IE1BWF9BVFRSSUJVVEVTX1BFUl9FVkVOVCkge1xuICAgICAgICAgICAgdGhpcy5pbnRlcm5hbExvZygnd2FybicsIGBMb2cgdG8gc2VuZCB0byBKU09OIGNvbnRhaW5zICR7T2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMobG9nKX0gLyAke01BWF9BVFRSSUJVVEVTX1BFUl9FVkVOVH0gYXR0cmlidXRlcy5gKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgZm9yIChsZXQga2V5IG9mIE9iamVjdC5rZXlzKGxvZykpIHtcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gbG9nW2tleV07XG4gICAgICAgICAgICAvLyByZXBsYWNlIGtleSB3aXRoIGxlbmd0aCB0b28gaGlnaFxuICAgICAgICAgICAgaWYgKGtleS5sZW5ndGggPiBNQVhfQVRUUklCVVRFX05BTUVfTEVOR1RIKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbmV3S2V5ID0ga2V5LnNsaWNlKDAsIE1BWF9BVFRSSUJVVEVfTkFNRV9MRU5HVEgpO1xuICAgICAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShsb2csIGtleS5zbGljZSgwLCBNQVhfQVRUUklCVVRFX05BTUVfTEVOR1RIKSwgXG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IobG9nLCBrZXkgYXMgUHJvcGVydHlLZXkpIGFzIFByb3BlcnR5RGVzY3JpcHRvcik7XG4gICAgICAgICAgICAgICAgZGVsZXRlIGxvZy5rZXk7XG5cbiAgICAgICAgICAgICAgICAvLyBVcGRhdGUga2V5IG5hbWUgZm9yIHVzYWdlIGluIGxhdGVyIHN0ZXBzXG4gICAgICAgICAgICAgICAga2V5ID0gbmV3S2V5O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBDb25jYXRlbmF0ZSBsb2cgbWVzc2FnZXMgd2l0aCBsZW5ndGggZ3JlYXRlciB0aGFuIE1BWF9BVFRSSUJVVEVfVkFMVUVfTEVOR1RIXG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiB2YWx1ZS5sZW5ndGggPiBNQVhfQVRUUklCVVRFX1ZBTFVFX0xFTkdUSCkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNvbmZpZz8ud2Fybk9uQXR0cmlidXRlTGVuZ3RoT3ZlcmZsb3cpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnRlcm5hbExvZygnd2FybicsIGBOUiBMb2cgYXR0cmlidXRlIGxlbmd0aCBvdmVyZmxvdy4gTGVuZ3RoOiAke3ZhbHVlLmxlbmd0aH0vJHtNQVhfQVRUUklCVVRFX1ZBTFVFX0xFTkdUSH1gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbG9nLmtleSA9IHZhbHVlLnNsaWNlKDAsIE1BWF9BVFRSSUJVVEVfVkFMVUVfTEVOR1RIKTsgXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChrZXkuaW5jbHVkZXMoJyAnKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG5ld0tleSA9IGtleS5yZXBsYWNlQWxsKCcgJywgJy4nKTtcbiAgICAgICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobG9nLCBrZXkuc2xpY2UoMCwgTUFYX0FUVFJJQlVURV9OQU1FX0xFTkdUSCksIFxuICAgICAgICAgICAgICAgICAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGxvZywga2V5IGFzIFByb3BlcnR5S2V5KSBhcyBQcm9wZXJ0eURlc2NyaXB0b3IpO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBsb2cua2V5O1xuXG4gICAgICAgICAgICAgICAgLy8gVXBkYXRlIGtleSBuYW1lIGZvciB1c2FnZSBpbiBsYXRlciBzdGVwc1xuICAgICAgICAgICAgICAgIGtleSA9IG5ld0tleTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGNyZWF0ZUxvZ0NoZWNrVGltZW91dCgpIHtcbiAgICAgICAgc2V0VGltZW91dChhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy5sb2dRdWV1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5iZWdpbldyaXRlTG9ncygpO1xuICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRlTG9nQ2hlY2tUaW1lb3V0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHRoaXMuY29uZmlnLmxvZ1B1c2hGcmVxdWVuY3kpXG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZWdpc3RlckFwcERlYXRoTG9nUHVzaCgpIHtcbiAgICAgICAgbGV0IGZpbmFsV3JpdHRlbiA9IGZhbHNlO1xuICAgICAgICBwcm9jZXNzLm9uKCdleGl0JywgKCkgPT4ge1xuICAgICAgICAgICAgbGV0IG8gPSBmaW5hbFdyaXR0ZW47XG4gICAgICAgICAgICBmaW5hbFdyaXR0ZW4gPSB0cnVlO1xuICAgICAgICAgICAgaWYgKG8pIHJldHVybjtcblxuICAgICAgICAgICAgdGhpcy5pbnRlcm5hbExvZygnaW5mbycsICd3cml0aW5nIGZpbmFsIGxvZ3MnKTtcbiAgICAgICAgICAgIHRoaXMud3JpdGVMb2dzU3luYygpO1xuICAgICAgICB9KTtcblxuICAgICAgICBwcm9jZXNzLm9uKCdTSUdJTlQnLCAoKSA9PiB7XG4gICAgICAgICAgICBwcm9jZXNzLmV4aXQoMik7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHByb2Nlc3Mub24oJ3VuY2F1Z2h0RXhjZXB0aW9uJywgKGUpID0+IHtcbiAgICAgICAgICAgIHRoaXMuaW50ZXJuYWxMb2coJ2Vycm9yJywgZS5zdGFjayB8fCAnJyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHByb2Nlc3Mub24oJ1NJR1RFUk0nLCAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLndyaXRlTG9nc1N5bmMoKTtcbiAgICAgICAgfSlcbiAgICB9XG59XG5cbihhc3luYyAoKSA9PiB7XG4gICAgY29uc3QgeyB3aXRoTG9nZ2VyIH0gPSBhd2FpdCBpbXBvcnQoJy4vbG9nZ2VyJyk7XG4gICAgbG9nID0gd2l0aExvZ2dlcigndGVzdCcpO1xuICAgIHdoaWxlKGludGVybmFsTG9nQnVmZmVyLmxlbmd0aCkge1xuICAgICAgICBjb25zdCBbbGV2ZWwsIG1lc3NhZ2VdID0gaW50ZXJuYWxMb2dCdWZmZXIuc2hpZnQoKSBhcyBbc3RyaW5nLCBzdHJpbmddO1xuICAgICAgICAobG9nIGFzIGFueSlbbGV2ZWxdKG1lc3NhZ2UpO1xuICAgIH1cbn0pKCk7XG5cbiJdfQ==