"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NewRelicLogTransport = void 0;

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
    value: function sendLogs(compressedPayload) {// const req = https.request({
      //     hostname: API_HOSTNAME,
      //     path: API_PATH,
      //     port: 443,
      //     method: 'POST',
      //     headers: {
      //         'Content-Type': 'application/gzip',
      //         'X-License-Key': process.env.NEW_RELIC_LICENSE_KEY,
      //         'Accept': '*/*',
      //         'Content-Length': compressedPayload.byteLength
      //     }
      // });
      // req.on('connect', () => {
      //     req.write(compressedPayload);
      // });
      // req.on('response', response => {
      //     if(response.statusCode === 200) {
      //         return;
      //     } else {
      //         this.internalLog('error', 'Error delivering logs to NR:');
      //         this.internalLog('error', `${response.statusCode} - ${response.statusMessage}`)
      //     }
      // });
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
      var _this2 = this;

      setTimeout( /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                if (!(_this2.logQueue.length > 0)) {
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
  }, {
    key: "registerAppDeathLogPush",
    value: function registerAppDeathLogPush() {
      var _this3 = this;

      var finalWritten = false;
      process.on('exit', function () {
        var o = finalWritten;
        finalWritten = true;
        if (o) return;

        _this3.internalLog('info', 'writing final logs');

        _this3.writeLogsSync();
      });
      process.on('SIGINT', function () {
        process.exit(2);
      });
      process.on('uncaughtException', function (e) {
        _this3.internalLog('error', e.stack || '');
      });
      process.on('SIGTERM', function () {
        _this3.writeLogsSync();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9uZXdSZWxpY0xvZ0ZvcndhcmRlci50cyJdLCJuYW1lcyI6WyJBUElfSE9TVE5BTUUiLCJwcm9jZXNzIiwiZW52IiwiS0xfTlJfTE9HX0hPU1ROQU1FIiwiQVBJX1BBVEgiLCJLTF9OUl9MT0dfUEFUSCIsIk1BWF9QQVlMT0FEX1NJWkUiLCJNQVhfQVRUUklCVVRFU19QRVJfRVZFTlQiLCJNQVhfQVRUUklCVVRFX05BTUVfTEVOR1RIIiwiTUFYX0FUVFJJQlVURV9WQUxVRV9MRU5HVEgiLCJsb2ciLCJpbnRlcm5hbExvZ0J1ZmZlciIsIk5ld1JlbGljTG9nVHJhbnNwb3J0Iiwib3B0cyIsImdsb2JhbEF0dHJpYnV0ZXMiLCJpbnRlcm5hbExvZyIsImNvbmZpZyIsImJ5dGVzV3JpdHRlblRocmVzaG9sZCIsIndhcm5PbkF0dHJpYnV0ZUxlbmd0aE92ZXJmbG93IiwibWluQnl0ZXNXcml0dGVuIiwibWluTG9nSXRlbXMiLCJsb2dQdXNoRnJlcXVlbmN5IiwibG9nQ291bnRUaHJlc2hvbGQiLCJ1bmRlZmluZWQiLCJNYXRoIiwibWluIiwicmVnaXN0ZXJBcHBEZWF0aExvZ1B1c2giLCJjcmVhdGVMb2dDaGVja1RpbWVvdXQiLCJsZXZlbCIsIm1lc3NhZ2UiLCJwdXNoIiwiaW5mbyIsImNhbGxiYWNrIiwibG9nVHJhbnNmb3JtIiwibG9nU3RyaW5nIiwiSlNPTiIsInN0cmluZ2lmeSIsImxlbmd0aCIsIkJ1ZmZlciIsImJ5dGVMZW5ndGgiLCJsb2dRdWV1ZSIsImxvZ0xlbmd0aFF1ZXVlIiwidG90YWxMZW5ndGhDb3VudCIsImxvZ3NUb1dyaXRlIiwic2xpY2VMb2dzIiwicmF3UGF5bG9hZCIsImJ1aWxkUmF3UG9zdEJvZHkiLCJjb21wcmVzc2VkUGF5bG9hZCIsInpsaWIiLCJnemlwU3luYyIsInNlbmRMb2dzIiwiYnVmZmVyIiwiZnMiLCJ3cml0ZUZpbGVTeW5jIiwibG9nc1dyaXR0ZW4iLCJjb21wcmVzc1BheWxvYWQiLCJsb2dzIiwiY29tbW9uIiwiYXR0cmlidXRlcyIsInNlcnZpY2UiLCJORVdfUkVMSUNfQVBQX05BTUUiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsImd6aXAiLCJmcm9tIiwiZXJyIiwibG9nc1RvU2VuZCIsImxvZ1NpemUiLCJsb2dTbGljZUluZGV4Iiwic2xpY2UiLCJtaW5Mb2dJdGVtc0V4Y2VlZGVkIiwiT2JqZWN0IiwiZ2V0T3duUHJvcGVydHlOYW1lcyIsImtleXMiLCJrZXkiLCJ2YWx1ZSIsIm5ld0tleSIsImRlZmluZVByb3BlcnR5IiwiZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yIiwiaW5jbHVkZXMiLCJyZXBsYWNlQWxsIiwic2V0VGltZW91dCIsImJlZ2luV3JpdGVMb2dzIiwiZmluYWxXcml0dGVuIiwib24iLCJvIiwid3JpdGVMb2dzU3luYyIsImV4aXQiLCJlIiwic3RhY2siLCJUcmFuc3BvcnQiLCJ3aXRoTG9nZ2VyIiwic2hpZnQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUNBOztBQUNBOztBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUdBLElBQU1BLFlBQVksR0FBR0MsT0FBTyxDQUFDQyxHQUFSLENBQVlDLGtCQUFaLElBQWtDLHlCQUF2RDtBQUNBLElBQU1DLFFBQVEsR0FBR0gsT0FBTyxDQUFDQyxHQUFSLENBQVlHLGNBQVosSUFBOEIsU0FBL0M7QUFDQSxJQUFNQyxnQkFBZ0IsWUFBRyxFQUFILEVBQU8sQ0FBUCxDQUF0QjtBQUNBLElBQU1DLHdCQUF3QixHQUFHLEdBQWpDO0FBQ0EsSUFBTUMseUJBQXlCLEdBQUcsR0FBbEM7QUFDQSxJQUFNQywwQkFBMEIsR0FBRyxJQUFuQztBQUNBLElBQUlDLEdBQUo7QUFDQSxJQUFJQyxpQkFBMEMsR0FBRyxFQUFqRDs7SUE0Q2FDLG9COzs7OztBQVdULGdDQUFZQyxJQUFaLEVBQStDQyxnQkFBL0MsRUFBMEY7QUFBQTs7QUFBQTs7QUFDdEYsOEJBQU1ELElBQU47O0FBRHNGOztBQUFBLCtE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cUIsWUFBTTtBQUN2QnBGLFFBQUFBLE9BQU8sQ0FBQ3VGLElBQVIsQ0FBYSxDQUFiO0FBQ0gsT0FGRDtBQUlBdkYsTUFBQUEsT0FBTyxDQUFDb0YsRUFBUixDQUFXLG1CQUFYLEVBQWdDLFVBQUNJLENBQUQsRUFBTztBQUNuQyxRQUFBLE1BQUksQ0FBQzFFLFdBQUwsQ0FBaUIsT0FBakIsRUFBMEIwRSxDQUFDLENBQUNDLEtBQUYsSUFBVyxFQUFyQztBQUNILE9BRkQ7QUFJQXpGLE1BQUFBLE9BQU8sQ0FBQ29GLEVBQVIsQ0FBVyxTQUFYLEVBQXNCLFlBQU07QUFDeEIsUUFBQSxNQUFJLENBQUNFLGFBQUw7QUFDSCxPQUZEO0FBR0g7Ozs7RUFqUHFDSSw0Qjs7OztnQkFBN0IvRSxvQixjQUM0QyxFOztBQW1QekQsd0RBQUM7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxtREFDdUMsVUFEdkM7QUFBQTs7QUFBQTtBQUFBO0FBQ1dnRixVQUFBQSxVQURYLGlCQUNXQSxVQURYO0FBRUdsRixVQUFBQSxHQUFHLEdBQUdrRixVQUFVLENBQUMsc0JBQUQsQ0FBaEI7O0FBQ0EsaUJBQU1qRixpQkFBaUIsQ0FBQzBCLE1BQXhCLEVBQWdDO0FBQUEsb0JBQ0gxQixpQkFBaUIsQ0FBQ2tGLEtBQWxCLEVBREcsb0NBQ3JCakUsS0FEcUIsYUFDZEMsT0FEYztBQUUzQm5CLFlBQUFBLEdBQUQsQ0FBYWtCLEtBQWIsRUFBb0JDLE9BQXBCO0FBQ0g7O0FBTko7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsQ0FBRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBodHRwcyBmcm9tICdodHRwcyc7XG5pbXBvcnQgemxpYiBmcm9tICd6bGliJztcbmltcG9ydCBUcmFuc3BvcnQgZnJvbSAnd2luc3Rvbi10cmFuc3BvcnQnO1xuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCB7IExvZ2dlciB9IGZyb20gJ3dpbnN0b24nO1xuXG5jb25zdCBBUElfSE9TVE5BTUUgPSBwcm9jZXNzLmVudi5LTF9OUl9MT0dfSE9TVE5BTUUgfHwgJ2xvZy1hcGkuZXUubmV3cmVsaWMuY29tJztcbmNvbnN0IEFQSV9QQVRIID0gcHJvY2Vzcy5lbnYuS0xfTlJfTE9HX1BBVEggfHwgJy9sb2cvdjEnO1xuY29uc3QgTUFYX1BBWUxPQURfU0laRSA9IDEwKio2O1xuY29uc3QgTUFYX0FUVFJJQlVURVNfUEVSX0VWRU5UID0gMjU1O1xuY29uc3QgTUFYX0FUVFJJQlVURV9OQU1FX0xFTkdUSCA9IDI1NTtcbmNvbnN0IE1BWF9BVFRSSUJVVEVfVkFMVUVfTEVOR1RIID0gNDA5NjtcbmxldCBsb2c6IExvZ2dlciB8IHVuZGVmaW5lZDtcbmxldCBpbnRlcm5hbExvZ0J1ZmZlcjogQXJyYXk8W3N0cmluZywgc3RyaW5nXT4gPSBbXTtcbmludGVyZmFjZSBVbmlxdWVOZXdSZWxpY0xvZ1RyYW5zcG9ydE9wdGlvbnMge1xuICAgIC8qKlxuICAgICAqIEhvdyBmcmVxdWVudGx5IGNoZWNrcyBzaG91bGQgYmUgcnVuIHRvIHB1c2ggbG9ncyB0byBOUlxuICAgICAqIERlZmF1bHQgaXMgMTAgc2Vjb25kc1xuICAgICAqL1xuICAgIGxvZ1B1c2hGcmVxdWVuY3k/OiBudW1iZXI7XG5cbiAgICAvKipcbiAgICAgKiBNaW5pbXVtIG51bWJlciBvZiBsb2cgc3RhdGVtZW50cyB3cml0dGVuIGJlZm9yZSBsb2dzIGNhbiBiZSBwdXNoZWQgdG8gTlIuXG4gICAgICogRGVmYXVsdCBpcyB1bmRlZmluZWRcbiAgICAgKi9cbiAgICBtaW5Mb2dJdGVtcz86IG51bWJlcjtcblxuICAgIC8qKlxuICAgICAqIE1pbmltdW0gbnVtYmVyIG9mIGxvZyBzdGF0ZW1lbnRzIHRvIGltbWVkaWF0ZWx5IHRyaWdnZXIgYSBwdXNoIHRvIE5SLlxuICAgICAqIERlZmF1bHQgaXMgdW5kZWZpbmVkXG4gICAgICovXG4gICAgbG9nQ291bnRUaHJlc2hvbGQ/OiBudW1iZXIgfCB1bmRlZmluZWQ7XG5cbiAgICAvKipcbiAgICAgKiBNaW5pbXVtIG51bWJlciBvZiBieXRlcyB3cml0dGVuIHRvIGNvbXByZXNzaW9uIHN0cmVhbSBiZWZvcmUgcHVzaGluZyB0byBOUlxuICAgICAqL1xuICAgIG1pbkJ5dGVzV3JpdHRlbj86IG51bWJlcjtcblxuICAgIC8qKlxuICAgICAqIFRocmVzaG9sZCBmb3IgYnl0ZXMgd3JpdHRlbiBhdCB3aGljaCBwb2ludCBhIG5ldyB3cml0ZSB0byBOUiB3aWxsIGJlIGF1dG9tYXRpY2FsbHlcbiAgICAgKiB0cmlnZ2VyZWQuIERlZmF1bHRzIHRvICg0LzUgKiBNQVhfUEFZTE9BRF9TSVpFKVxuICAgICAqL1xuICAgIGJ5dGVzV3JpdHRlblRocmVzaG9sZD86IG51bWJlcjtcblxuICAgIC8qKlxuICAgICAqIFByb2R1Y2UgYSB3YXJuaW5nIHdoZW4gYXR0cmlidXRlIHZhbHVlcyBvdmVyZmxvdyB0aGUgTlIgbWF4aW11bSBsZW5ndGggb2YgNDA5Ni5cbiAgICAgKiBEZWZhdWx0IGlzIGZhbHNlLlxuICAgICAqL1xuICAgIHdhcm5PbkF0dHJpYnV0ZUxlbmd0aE92ZXJmbG93PzogYm9vbGVhbjtcbn1cblxudHlwZSBOZXdSZWxpY0xvZ1RyYW5zcG9ydE9wdGlvbnMgPSBVbmlxdWVOZXdSZWxpY0xvZ1RyYW5zcG9ydE9wdGlvbnMgJiBUcmFuc3BvcnQuVHJhbnNwb3J0U3RyZWFtT3B0aW9ucztcblxudHlwZSBSZXF1aXJlZEtlZXBVbmRlZmluZWQ8VD4gPSB7IFtLIGluIGtleW9mIFRdLT86IFtUW0tdXSB9IGV4dGVuZHMgaW5mZXIgVVxuICA/IFUgZXh0ZW5kcyBSZWNvcmQ8a2V5b2YgVSwgW2FueV0+ID8geyBbSyBpbiBrZXlvZiBVXTogVVtLXVswXSB9IDogbmV2ZXJcbiAgOiBuZXZlcjtcblxuZXhwb3J0IGNsYXNzIE5ld1JlbGljTG9nVHJhbnNwb3J0IGV4dGVuZHMgVHJhbnNwb3J0IHtcbiAgICBwcml2YXRlIHN0YXRpYyByZWFkb25seSBnemlwT3B0czogemxpYi5abGliT3B0aW9ucyA9IHtcbiAgICAgICAgXG4gICAgfVxuICAgIHByaXZhdGUgY29uZmlnOiBSZXF1aXJlZEtlZXBVbmRlZmluZWQ8VW5pcXVlTmV3UmVsaWNMb2dUcmFuc3BvcnRPcHRpb25zPiAmIFRyYW5zcG9ydC5UcmFuc3BvcnRTdHJlYW1PcHRpb25zO1xuICAgIHByaXZhdGUgbG9nUXVldWU6IGFueVtdID0gW107XG4gICAgcHJpdmF0ZSBsb2dMZW5ndGhRdWV1ZTogbnVtYmVyW10gPSBbXTtcbiAgICBwcml2YXRlIHRvdGFsTGVuZ3RoQ291bnQgPSAwO1xuICAgIHByaXZhdGUgZ2xvYmFsQXR0cmlidXRlczoge1trZXk6IHN0cmluZ106IHN0cmluZ307XG5cbiAgICBcbiAgICBjb25zdHJ1Y3RvcihvcHRzOiBOZXdSZWxpY0xvZ1RyYW5zcG9ydE9wdGlvbnMsIGdsb2JhbEF0dHJpYnV0ZXM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9KSB7XG4gICAgICAgIHN1cGVyKG9wdHMpO1xuICAgICAgICB0aGlzLmludGVybmFsTG9nKCdpbmZvJywgJ2NyZWF0aW5nIG5ldyByZWxpYyB0cmFuc3BvcnQnKTtcbiAgICAgICAgdGhpcy5nbG9iYWxBdHRyaWJ1dGVzID0gZ2xvYmFsQXR0cmlidXRlcztcbiAgICAgICAgdGhpcy5jb25maWcgPSB7XG4gICAgICAgICAgICBieXRlc1dyaXR0ZW5UaHJlc2hvbGQ6IE1BWF9QQVlMT0FEX1NJWkUgKiA0IC8gNSxcbiAgICAgICAgICAgIHdhcm5PbkF0dHJpYnV0ZUxlbmd0aE92ZXJmbG93OiBmYWxzZSxcbiAgICAgICAgICAgIG1pbkJ5dGVzV3JpdHRlbjogTUFYX1BBWUxPQURfU0laRSAqIDEgLyA1LFxuICAgICAgICAgICAgbWluTG9nSXRlbXM6IDEwLFxuICAgICAgICAgICAgbG9nUHVzaEZyZXF1ZW5jeTogMTAwMDAsXG4gICAgICAgICAgICBsb2dDb3VudFRocmVzaG9sZDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgLi4ub3B0c1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuY29uZmlnLmJ5dGVzV3JpdHRlblRocmVzaG9sZCA9IE1hdGgubWluKHRoaXMuY29uZmlnLmJ5dGVzV3JpdHRlblRocmVzaG9sZCB8fCAwLCBNQVhfUEFZTE9BRF9TSVpFICogNCAvIDUpO1xuXG4gICAgICAgIHRoaXMucmVnaXN0ZXJBcHBEZWF0aExvZ1B1c2goKTtcbiAgICAgICAgdGhpcy5jcmVhdGVMb2dDaGVja1RpbWVvdXQoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiB0byB3cml0ZSBsb2dzIHRoYXQgYXJlIGludGVybmFsIHRvIHRoaXMgbW9kdWxlLlxuICAgICAqIEJ1ZmZlcnMgY2FsbHMgdW50aWwgdGhlIFdpbnN0b24gbG9nZ2VyIGNhbiBiZSBhc3luYyBpbXBvcnRkXG4gICAgICogQWZ0ZXJ3b3Jkcywgd3JpdGVzIGxvZ3MgZGlyZWN0bHkgdG8gdGhlIGxvZ2dlclxuICAgICAqIEBwYXJhbSBsZXZlbCBcbiAgICAgKiBAcGFyYW0gbWVzc2FnZSBcbiAgICAgKi9cbiAgICBpbnRlcm5hbExvZyhsZXZlbDogc3RyaW5nLCBtZXNzYWdlOiBzdHJpbmcpIHtcbiAgICAgICAgaWYgKGxvZykge1xuICAgICAgICAgICAgKGxvZyBhcyBhbnkpW2xldmVsXShtZXNzYWdlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGludGVybmFsTG9nQnVmZmVyLnB1c2goW2xldmVsLCBtZXNzYWdlXSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBsb2coaW5mbzogYW55LCBjYWxsYmFjazogKCgpID0+IHZvaWQpIHwgdW5kZWZpbmVkKSB7XG4gICAgICAgIHRoaXMubG9nVHJhbnNmb3JtKGluZm8pO1xuICAgICAgICBjb25zdCBsb2dTdHJpbmcgPSBKU09OLnN0cmluZ2lmeShpbmZvKTtcbiAgICAgICAgY29uc3QgbGVuZ3RoID0gQnVmZmVyLmJ5dGVMZW5ndGgobG9nU3RyaW5nKTtcbiAgICAgICAgdGhpcy5sb2dRdWV1ZS5wdXNoKGluZm8pO1xuICAgICAgICB0aGlzLmxvZ0xlbmd0aFF1ZXVlLnB1c2gobGVuZ3RoKTtcbiAgICAgICAgdGhpcy50b3RhbExlbmd0aENvdW50ICs9IGxlbmd0aDtcblxuICAgICAgICAvLyBpZiAodGhpcy5sb2dzV3JpdGFibGVQcmVkaWNhdGUoKSkge1xuICAgICAgICAvLyAgICAgdGhpcy5iZWdpbldyaXRlTG9ncygpO1xuICAgICAgICAvLyB9XG4gICAgICAgIGlmIChjYWxsYmFjaykgY2FsbGJhY2soKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHdyaXRlTG9nc1N5bmMoKSB7XG4gICAgICAgIGNvbnN0IGxvZ3NUb1dyaXRlID0gdGhpcy5zbGljZUxvZ3MoKTtcbiAgICAgICAgdGhpcy5pbnRlcm5hbExvZygnc2lsbHknLCAnUHJlcGFyaW5nIGZpbmFsIGxvZyBwYXlsb2FkIGZvciBOUiBjb2xsZWN0b3InKTtcbiAgICAgICAgY29uc3QgcmF3UGF5bG9hZCA9IHRoaXMuYnVpbGRSYXdQb3N0Qm9keShsb2dzVG9Xcml0ZSk7XG4gICAgICAgIGNvbnN0IGNvbXByZXNzZWRQYXlsb2FkID0gemxpYi5nemlwU3luYyhyYXdQYXlsb2FkKTtcbiAgICAgICAgdGhpcy5zZW5kTG9ncyhjb21wcmVzc2VkUGF5bG9hZCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBsb2dzV3JpdHRlbiA9IDA7XG4gICAgcHVibGljIHdyaXRlTG9nc1RvRmlsZVN5c3RlbShidWZmZXI6IEJ1ZmZlcikge1xuICAgICAgICBmcy53cml0ZUZpbGVTeW5jKGB0ZXN0LSR7dGhpcy5sb2dzV3JpdHRlbisrfS5nemAsIGJ1ZmZlcik7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBiZWdpbldyaXRlTG9ncygpIHtcbiAgICAgICAgY29uc3QgbG9nc1RvV3JpdGUgPSB0aGlzLnNsaWNlTG9ncygpO1xuXG4gICAgICAgIHRoaXMuaW50ZXJuYWxMb2coJ3NpbGx5JywgJ1ByZXBhcmluZyBsb2cgcGF5bG9hZCBmb3IgTlIgY29sbGVjdG9yJyk7XG4gICAgICAgIGNvbnN0IHJhd1BheWxvYWQgPSB0aGlzLmJ1aWxkUmF3UG9zdEJvZHkobG9nc1RvV3JpdGUpO1xuICAgICAgICBjb25zdCBjb21wcmVzc2VkUGF5bG9hZDogQnVmZmVyID0gYXdhaXQgdGhpcy5jb21wcmVzc1BheWxvYWQocmF3UGF5bG9hZCk7XG4gICAgICAgIHRoaXMuc2VuZExvZ3MoY29tcHJlc3NlZFBheWxvYWQpO1xuICAgIH1cblxuICAgIHByaXZhdGUgc2VuZExvZ3MoY29tcHJlc3NlZFBheWxvYWQ6IEJ1ZmZlcikge1xuICAgICAgICAvLyBjb25zdCByZXEgPSBodHRwcy5yZXF1ZXN0KHtcbiAgICAgICAgLy8gICAgIGhvc3RuYW1lOiBBUElfSE9TVE5BTUUsXG4gICAgICAgIC8vICAgICBwYXRoOiBBUElfUEFUSCxcbiAgICAgICAgLy8gICAgIHBvcnQ6IDQ0MyxcbiAgICAgICAgLy8gICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAvLyAgICAgaGVhZGVyczoge1xuICAgICAgICAvLyAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vZ3ppcCcsXG4gICAgICAgIC8vICAgICAgICAgJ1gtTGljZW5zZS1LZXknOiBwcm9jZXNzLmVudi5ORVdfUkVMSUNfTElDRU5TRV9LRVksXG4gICAgICAgIC8vICAgICAgICAgJ0FjY2VwdCc6ICcqLyonLFxuICAgICAgICAvLyAgICAgICAgICdDb250ZW50LUxlbmd0aCc6IGNvbXByZXNzZWRQYXlsb2FkLmJ5dGVMZW5ndGhcbiAgICAgICAgLy8gICAgIH1cbiAgICAgICAgLy8gfSk7XG5cbiAgICAgICAgLy8gcmVxLm9uKCdjb25uZWN0JywgKCkgPT4ge1xuICAgICAgICAvLyAgICAgcmVxLndyaXRlKGNvbXByZXNzZWRQYXlsb2FkKTtcbiAgICAgICAgLy8gfSk7XG5cbiAgICAgICAgLy8gcmVxLm9uKCdyZXNwb25zZScsIHJlc3BvbnNlID0+IHtcbiAgICAgICAgLy8gICAgIGlmKHJlc3BvbnNlLnN0YXR1c0NvZGUgPT09IDIwMCkge1xuICAgICAgICAvLyAgICAgICAgIHJldHVybjtcbiAgICAgICAgLy8gICAgIH0gZWxzZSB7XG4gICAgICAgIC8vICAgICAgICAgdGhpcy5pbnRlcm5hbExvZygnZXJyb3InLCAnRXJyb3IgZGVsaXZlcmluZyBsb2dzIHRvIE5SOicpO1xuICAgICAgICAvLyAgICAgICAgIHRoaXMuaW50ZXJuYWxMb2coJ2Vycm9yJywgYCR7cmVzcG9uc2Uuc3RhdHVzQ29kZX0gLSAke3Jlc3BvbnNlLnN0YXR1c01lc3NhZ2V9YClcbiAgICAgICAgLy8gICAgIH1cbiAgICAgICAgLy8gfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBidWlsZFJhd1Bvc3RCb2R5KGxvZ3M6IGFueVtdKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KFt7XG4gICAgICAgICAgICBjb21tb246IHtcbiAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzOiB7XG4gICAgICAgICAgICAgICAgICAgIC4uLnRoaXMuZ2xvYmFsQXR0cmlidXRlcyxcbiAgICAgICAgICAgICAgICAgICAgc2VydmljZTogcHJvY2Vzcy5lbnYuTkVXX1JFTElDX0FQUF9OQU1FXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBsb2dzOiBsb2dzXG4gICAgICAgICAgICB9XG4gICAgICAgIH1dKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIGNvbXByZXNzUGF5bG9hZChyYXdQYXlsb2FkOiBzdHJpbmcpOiBQcm9taXNlPEJ1ZmZlcj4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8QnVmZmVyPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICB6bGliLmd6aXAoQnVmZmVyLmZyb20ocmF3UGF5bG9hZCwgJ3V0ZjgnKSwgKGVyciwgY29tcHJlc3NlZFBheWxvYWQpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSByZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgICByZXNvbHZlKGNvbXByZXNzZWRQYXlsb2FkKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHNsaWNlTG9ncygpIHtcbiAgICAgICAgbGV0IGxvZ3NUb1NlbmQ7XG4gICAgICAgIFxuICAgICAgICAvLyBJZiB3ZSBrbm93IHRoZSB0b3RhbCBsZW5ndGggd2lsbCBub3QgZXhjZWVkIG1heGltdW0gbGVuZ3RoIHNpemVcbiAgICAgICAgaWYgKHRoaXMudG90YWxMZW5ndGhDb3VudCA8IE1BWF9QQVlMT0FEX1NJWkUpIHtcbiAgICAgICAgICAgIFtsb2dzVG9TZW5kLCB0aGlzLmxvZ1F1ZXVlXSA9IFt0aGlzLmxvZ1F1ZXVlLCBbXV07XG4gICAgICAgICAgICB0aGlzLmxvZ0xlbmd0aFF1ZXVlID0gW107XG4gICAgICAgICAgICB0aGlzLnRvdGFsTGVuZ3RoQ291bnQgPSAwO1xuICAgICAgICAgICAgcmV0dXJuIGxvZ3NUb1NlbmQ7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBvdGhlcndpc2UsIHNsaWNlIG9mZiBhIHNsaWNlIG9mIGxvZ3MgdGhhdCB3aWxsIGZpdCBpbnRvIGEgc2luZ2xlIHJlcXVlc3RcbiAgICAgICAgbGV0IGxvZ1NpemUgPSAwO1xuICAgICAgICBsZXQgbG9nU2xpY2VJbmRleCA9IDA7XG5cbiAgICAgICAgd2hpbGUoKHRoaXMubG9nUXVldWUubGVuZ3RoID4gMCkgJiYgKGxvZ1NpemUgKyB0aGlzLmxvZ0xlbmd0aFF1ZXVlWzBdIDwgTUFYX1BBWUxPQURfU0laRSkpIHtcbiAgICAgICAgICAgIGxvZ1NsaWNlSW5kZXgrKztcbiAgICAgICAgfVxuXG4gICAgICAgIGxvZ3NUb1NlbmQgPSB0aGlzLmxvZ1F1ZXVlLnNsaWNlKDAsIGxvZ1NsaWNlSW5kZXgpO1xuICAgICAgICB0aGlzLmxvZ1F1ZXVlID0gdGhpcy5sb2dRdWV1ZS5zbGljZShsb2dTbGljZUluZGV4KTtcbiAgICAgICAgdGhpcy5sb2dMZW5ndGhRdWV1ZSA9IHRoaXMubG9nTGVuZ3RoUXVldWUuc2xpY2UobG9nU2xpY2VJbmRleCk7XG5cbiAgICAgICAgcmV0dXJuIGxvZ3NUb1NlbmQ7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBsb2dzV3JpdGFibGVQcmVkaWNhdGUoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLm1pbkxvZ0l0ZW1zRXhjZWVkZWQoKVxuICAgIH1cblxuICAgIHByaXZhdGUgbWluTG9nSXRlbXNFeGNlZWRlZCgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuICEhKHRoaXMuY29uZmlnLm1pbkxvZ0l0ZW1zICYmICh0aGlzLmxvZ1F1ZXVlLmxlbmd0aCA+IHRoaXMuY29uZmlnLm1pbkxvZ0l0ZW1zKSk7XG4gICAgfSAgICBcbiAgICBcbiAgICAvKipcbiAgICAgKiBGaXhlcyBwb3NzaWJsZSBpc3N1ZXMgaW4gbG9nIGZvcm1hdCBjYXVzZWQgYnkgbGltaXRhdGlvbnMgb2YgTlJzIGxvZ2dpbmdcbiAgICAgKiB2YWx1ZXNcbiAgICAgKiBAcGFyYW0gbG9nIFxuICAgICAqIEByZXR1cm5zIFxuICAgICAqL1xuICAgIHByaXZhdGUgbG9nVHJhbnNmb3JtKGxvZzogYW55KSB7XG5cbiAgICAgICAgaWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGxvZykubGVuZ3RoID4gTUFYX0FUVFJJQlVURVNfUEVSX0VWRU5UKSB7XG4gICAgICAgICAgICB0aGlzLmludGVybmFsTG9nKCd3YXJuJywgYExvZyB0byBzZW5kIHRvIEpTT04gY29udGFpbnMgJHtPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhsb2cpfSAvICR7TUFYX0FUVFJJQlVURVNfUEVSX0VWRU5UfSBhdHRyaWJ1dGVzLmApO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBmb3IgKGxldCBrZXkgb2YgT2JqZWN0LmtleXMobG9nKSkge1xuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBsb2dba2V5XTtcbiAgICAgICAgICAgIC8vIHJlcGxhY2Uga2V5IHdpdGggbGVuZ3RoIHRvbyBoaWdoXG4gICAgICAgICAgICBpZiAoa2V5Lmxlbmd0aCA+IE1BWF9BVFRSSUJVVEVfTkFNRV9MRU5HVEgpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBuZXdLZXkgPSBrZXkuc2xpY2UoMCwgTUFYX0FUVFJJQlVURV9OQU1FX0xFTkdUSCk7XG4gICAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGxvZywga2V5LnNsaWNlKDAsIE1BWF9BVFRSSUJVVEVfTkFNRV9MRU5HVEgpLCBcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihsb2csIGtleSBhcyBQcm9wZXJ0eUtleSkgYXMgUHJvcGVydHlEZXNjcmlwdG9yKTtcbiAgICAgICAgICAgICAgICBkZWxldGUgbG9nLmtleTtcblxuICAgICAgICAgICAgICAgIC8vIFVwZGF0ZSBrZXkgbmFtZSBmb3IgdXNhZ2UgaW4gbGF0ZXIgc3RlcHNcbiAgICAgICAgICAgICAgICBrZXkgPSBuZXdLZXk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIENvbmNhdGVuYXRlIGxvZyBtZXNzYWdlcyB3aXRoIGxlbmd0aCBncmVhdGVyIHRoYW4gTUFYX0FUVFJJQlVURV9WQUxVRV9MRU5HVEhcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmIHZhbHVlLmxlbmd0aCA+IE1BWF9BVFRSSUJVVEVfVkFMVUVfTEVOR1RIKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY29uZmlnPy53YXJuT25BdHRyaWJ1dGVMZW5ndGhPdmVyZmxvdykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmludGVybmFsTG9nKCd3YXJuJywgYE5SIExvZyBhdHRyaWJ1dGUgbGVuZ3RoIG92ZXJmbG93LiBMZW5ndGg6ICR7dmFsdWUubGVuZ3RofS8ke01BWF9BVFRSSUJVVEVfVkFMVUVfTEVOR1RIfWApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBsb2cua2V5ID0gdmFsdWUuc2xpY2UoMCwgTUFYX0FUVFJJQlVURV9WQUxVRV9MRU5HVEgpOyBcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGtleS5pbmNsdWRlcygnICcpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbmV3S2V5ID0ga2V5LnJlcGxhY2VBbGwoJyAnLCAnLicpO1xuICAgICAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShsb2csIGtleS5zbGljZSgwLCBNQVhfQVRUUklCVVRFX05BTUVfTEVOR1RIKSwgXG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IobG9nLCBrZXkgYXMgUHJvcGVydHlLZXkpIGFzIFByb3BlcnR5RGVzY3JpcHRvcik7XG4gICAgICAgICAgICAgICAgZGVsZXRlIGxvZy5rZXk7XG5cbiAgICAgICAgICAgICAgICAvLyBVcGRhdGUga2V5IG5hbWUgZm9yIHVzYWdlIGluIGxhdGVyIHN0ZXBzXG4gICAgICAgICAgICAgICAga2V5ID0gbmV3S2V5O1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgY3JlYXRlTG9nQ2hlY2tUaW1lb3V0KCkge1xuICAgICAgICBzZXRUaW1lb3V0KGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgIGlmICh0aGlzLmxvZ1F1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLmJlZ2luV3JpdGVMb2dzKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5jcmVhdGVMb2dDaGVja1RpbWVvdXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdGhpcy5jb25maWcubG9nUHVzaEZyZXF1ZW5jeSlcbiAgICB9XG5cbiAgICBwcml2YXRlIHJlZ2lzdGVyQXBwRGVhdGhMb2dQdXNoKCkge1xuICAgICAgICBsZXQgZmluYWxXcml0dGVuID0gZmFsc2U7XG4gICAgICAgIHByb2Nlc3Mub24oJ2V4aXQnLCAoKSA9PiB7XG4gICAgICAgICAgICBsZXQgbyA9IGZpbmFsV3JpdHRlbjtcbiAgICAgICAgICAgIGZpbmFsV3JpdHRlbiA9IHRydWU7XG4gICAgICAgICAgICBpZiAobykgcmV0dXJuO1xuXG4gICAgICAgICAgICB0aGlzLmludGVybmFsTG9nKCdpbmZvJywgJ3dyaXRpbmcgZmluYWwgbG9ncycpO1xuICAgICAgICAgICAgdGhpcy53cml0ZUxvZ3NTeW5jKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHByb2Nlc3Mub24oJ1NJR0lOVCcsICgpID0+IHtcbiAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgyKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcHJvY2Vzcy5vbigndW5jYXVnaHRFeGNlcHRpb24nLCAoZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5pbnRlcm5hbExvZygnZXJyb3InLCBlLnN0YWNrIHx8ICcnKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcHJvY2Vzcy5vbignU0lHVEVSTScsICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMud3JpdGVMb2dzU3luYygpO1xuICAgICAgICB9KVxuICAgIH1cbn1cblxuKGFzeW5jICgpID0+IHtcbiAgICBjb25zdCB7IHdpdGhMb2dnZXIgfSA9IGF3YWl0IGltcG9ydCgnLi9sb2dnZXInKTtcbiAgICBsb2cgPSB3aXRoTG9nZ2VyKCdOZXdSZWxpY0xvZ0ZvcndhcmRlcicpO1xuICAgIHdoaWxlKGludGVybmFsTG9nQnVmZmVyLmxlbmd0aCkge1xuICAgICAgICBjb25zdCBbbGV2ZWwsIG1lc3NhZ2VdID0gaW50ZXJuYWxMb2dCdWZmZXIuc2hpZnQoKSBhcyBbc3RyaW5nLCBzdHJpbmddO1xuICAgICAgICAobG9nIGFzIGFueSlbbGV2ZWxdKG1lc3NhZ2UpO1xuICAgIH1cbn0pKCk7XG5cbiJdfQ==