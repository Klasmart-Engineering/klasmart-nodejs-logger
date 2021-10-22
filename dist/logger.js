"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.withLogger = void 0;

var _winstonEnricher = _interopRequireDefault(require("@newrelic/winston-enricher"));

var _winston = _interopRequireDefault(require("winston"));

var _correlationMiddleware = require("./correlationMiddleware");

var _newRelicLogForwarder = require("./newRelicLogForwarder");

var _ref2, _process$env$LOG_LEVE;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var logStyles = ['STRING_COLOR', 'STRING', 'JSON', 'SILENT'];
var defaultLogStyle = logStyles[0];

var stdoutFormat = _winston["default"].format.printf(function (_ref) {
  var level = _ref.level,
      message = _ref.message,
      label = _ref.label,
      timestamp = _ref.timestamp;
  return "".concat(timestamp, " [").concat(label, "] ").concat(level, ": ").concat(message);
});

var newRelicTransport;

var correlationIdFormat = _winston["default"].format(function (info) {
  info.correlationId = (0, _correlationMiddleware.withCorrelation)();
  return info;
});

var getLogStyleOption = function getLogStyleOption() {
  if (!process.env.LOG_STYLE) {
    return [defaultLogStyle, "Using default log style: ".concat(defaultLogStyle, ". Override this using the LOG_STYLE environment variable. Valid values are: ").concat(logStyles, ".")];
  }

  if (logStyles.includes(process.env.LOG_STYLE.toUpperCase().trim())) {
    return [process.env.LOG_STYLE, "Using log style: ".concat(process.env.LOG_STYLE)];
  }

  return [defaultLogStyle, "Unrecognized log style: ".concat(process.env.LOG_STYLE, ". Using default log style: ").concat(defaultLogStyle, ". Valid log styles are: ").concat(logStyles)];
};

var defaultLoggingLevel = (_ref2 = (_process$env$LOG_LEVE = process.env.LOG_LEVEL) !== null && _process$env$LOG_LEVE !== void 0 ? _process$env$LOG_LEVE : process.env.LEVEL) !== null && _ref2 !== void 0 ? _ref2 : 'debug';

var _getLogStyleOption = getLogStyleOption(),
    _getLogStyleOption2 = _slicedToArray(_getLogStyleOption, 2),
    logStyle = _getLogStyleOption2[0],
    message = _getLogStyleOption2[1];

var withLogger = function withLogger(label, level) {
  switch (logStyle) {
    case 'JSON':
      return createJsonLogger(label, level);

    case 'STRING':
      return createStringLogger(label, level);

    case 'STRING_COLOR':
      return createColorStringLogger(label, level);

    case 'SILENT':
      return createSilentLogger(label, level);
  }
};

exports.withLogger = withLogger;

var createJsonLogger = function createJsonLogger(label, level) {
  console.log("creating logger with label: ".concat(label));
  if (!newRelicTransport) newRelicTransport = new _newRelicLogForwarder.NewRelicLogTransport({}, {});
  return _winston["default"].loggers.add(label, {
    level: level !== null && level !== void 0 ? level : defaultLoggingLevel,
    format: _winston["default"].format.combine(correlationIdFormat(), _winston["default"].format.label({
      label: label
    }), _winston["default"].format.timestamp(), // process.env.NEW_RELIC_LICENSE_KEY 
    (0, _winstonEnricher["default"])() // : winston.format.json()
    ),
    transports: [new _winston["default"].transports.Console(), newRelicTransport]
  });
};

var createStringLogger = function createStringLogger(label, level) {
  return _winston["default"].loggers.add(label, {
    level: level !== null && level !== void 0 ? level : defaultLoggingLevel,
    format: _winston["default"].format.combine(correlationIdFormat(), _winston["default"].format.label({
      label: label
    }), _winston["default"].format.timestamp(), stdoutFormat),
    transports: [new _winston["default"].transports.Console()]
  });
};

var createColorStringLogger = function createColorStringLogger(label, level) {
  return _winston["default"].loggers.add(label, {
    level: level !== null && level !== void 0 ? level : defaultLoggingLevel,
    format: _winston["default"].format.combine(correlationIdFormat(), _winston["default"].format.label({
      label: label
    }), _winston["default"].format.timestamp(), _winston["default"].format.colorize(), stdoutFormat),
    transports: [new _winston["default"].transports.Console()]
  });
};

var createSilentLogger = function createSilentLogger(label, level) {
  return _winston["default"].loggers.add(label, {
    silent: true,
    level: level !== null && level !== void 0 ? level : defaultLoggingLevel,
    transports: [new _winston["default"].transports.Console()]
  });
};

var log = withLogger('logger');
log.info(message);
_winston["default"];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9sb2dnZXIudHMiXSwibmFtZXMiOlsibG9nU3R5bGVzIiwiZGVmYXVsdExvZ1N0eWxlIiwic3Rkb3V0Rm9ybWF0Iiwid2luc3RvbiIsImZvcm1hdCIsInByaW50ZiIsImxldmVsIiwibWVzc2FnZSIsImxhYmVsIiwidGltZXN0YW1wIiwibmV3UmVsaWNUcmFuc3BvcnQiLCJjb3JyZWxhdGlvbklkRm9ybWF0IiwiaW5mbyIsImNvcnJlbGF0aW9uSWQiLCJnZXRMb2dTdHlsZU9wdGlvbiIsInByb2Nlc3MiLCJlbnYiLCJMT0dfU1RZTEUiLCJpbmNsdWRlcyIsInRvVXBwZXJDYXNlIiwidHJpbSIsImRlZmF1bHRMb2dnaW5nTGV2ZWwiLCJMT0dfTEVWRUwiLCJMRVZFTCIsImxvZ1N0eWxlIiwid2l0aExvZ2dlciIsImNyZWF0ZUpzb25Mb2dnZXIiLCJjcmVhdGVTdHJpbmdMb2dnZXIiLCJjcmVhdGVDb2xvclN0cmluZ0xvZ2dlciIsImNyZWF0ZVNpbGVudExvZ2dlciIsImNvbnNvbGUiLCJsb2ciLCJOZXdSZWxpY0xvZ1RyYW5zcG9ydCIsImxvZ2dlcnMiLCJhZGQiLCJjb21iaW5lIiwidHJhbnNwb3J0cyIsIkNvbnNvbGUiLCJjb2xvcml6ZSIsInNpbGVudCJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFLQSxJQUFNQSxTQUFxQixHQUFHLENBQUMsY0FBRCxFQUFpQixRQUFqQixFQUEyQixNQUEzQixFQUFtQyxRQUFuQyxDQUE5QjtBQUNBLElBQU1DLGVBQXlCLEdBQUdELFNBQVMsQ0FBQyxDQUFELENBQTNDOztBQUVBLElBQU1FLFlBQVksR0FBR0Msb0JBQVFDLE1BQVIsQ0FBZUMsTUFBZixDQUFzQixnQkFBMEM7QUFBQSxNQUF2Q0MsS0FBdUMsUUFBdkNBLEtBQXVDO0FBQUEsTUFBaENDLE9BQWdDLFFBQWhDQSxPQUFnQztBQUFBLE1BQXZCQyxLQUF1QixRQUF2QkEsS0FBdUI7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QyxNQUFSLENBQWVLLFNBQWYsRUFISSxFQUlKTixvQkFBUUMsTUFBUixDQUFla0MsUUFBZixFQUpJLEVBS0pwQyxZQUxJLENBRnNCO0FBUzlCa0MsSUFBQUEsVUFBVSxFQUFFLENBQ1IsSUFBSWpDLG9CQUFRaUMsVUFBUixDQUFtQkMsT0FBdkIsRUFEUTtBQVRrQixHQUEzQixDQUFQO0FBYUgsQ0FkRDs7QUFnQkEsSUFBTVIsa0JBQWtCLEdBQUcsU0FBckJBLGtCQUFxQixDQUFDckIsS0FBRCxFQUFnQkYsS0FBaEIsRUFBNkM7QUFDcEUsU0FBT0gsb0JBQVE4QixPQUFSLENBQWdCQyxHQUFoQixDQUFvQjFCLEtBQXBCLEVBQTJCO0FBQzlCK0IsSUFBQUEsTUFBTSxFQUFFLElBRHNCO0FBRTlCakMsSUFBQUEsS0FBSyxFQUFFQSxLQUFGLGFBQUVBLEtBQUYsY0FBRUEsS0FBRixHQUFXZSxtQkFGYztBQUc5QmUsSUFBQUEsVUFBVSxFQUFFLENBQ1IsSUFBSWpDLG9CQUFRaUMsVUFBUixDQUFtQkMsT0FBdkIsRUFEUTtBQUhrQixHQUEzQixDQUFQO0FBT0gsQ0FSRDs7QUFVQSxJQUFNTixHQUFHLEdBQUdOLFVBQVUsQ0FBQyxRQUFELENBQXRCO0FBQ0FNLEdBQUcsQ0FBQ25CLElBQUosQ0FBU0wsT0FBVDtBQUNBSiIsInNvdXJjZXNDb250ZW50IjpbIi8vIEB0cy1pZ25vcmVcbmltcG9ydCBuZXdyZWxpY0Zvcm1hdHRlciBmcm9tICdAbmV3cmVsaWMvd2luc3Rvbi1lbnJpY2hlcic7XG5pbXBvcnQgd2luc3RvbiwgeyBMb2dnZXIgfSBmcm9tICd3aW5zdG9uJztcbmltcG9ydCB7IHdpdGhDb3JyZWxhdGlvbiB9IGZyb20gJy4vY29ycmVsYXRpb25NaWRkbGV3YXJlJztcbmltcG9ydCB7IE5ld1JlbGljTG9nVHJhbnNwb3J0IH0gZnJvbSAnLi9uZXdSZWxpY0xvZ0ZvcndhcmRlcic7XG5cbnR5cGUgTlBNTG9nZ2luZ0xldmVscyA9ICdzaWxseScgfCAnZGVidWcnIHwgJ3ZlcmJvc2UnIHwgJ2h0dHAnIHwgJ2luZm8nIHwgJ3dhcm4nIHwgJ2Vycm9yJztcbnR5cGUgTG9nU3R5bGUgPSAnU1RSSU5HX0NPTE9SJyB8ICdTVFJJTkcnIHwgJ0pTT04nIHwgJ1NJTEVOVCc7XG5cbmNvbnN0IGxvZ1N0eWxlczogTG9nU3R5bGVbXSA9IFsnU1RSSU5HX0NPTE9SJywgJ1NUUklORycsICdKU09OJywgJ1NJTEVOVCddO1xuY29uc3QgZGVmYXVsdExvZ1N0eWxlOiBMb2dTdHlsZSA9IGxvZ1N0eWxlc1swXTtcblxuY29uc3Qgc3Rkb3V0Rm9ybWF0ID0gd2luc3Rvbi5mb3JtYXQucHJpbnRmKCh7IGxldmVsLCBtZXNzYWdlLCBsYWJlbCwgdGltZXN0YW1wIH0pID0+IHtcbiAgICByZXR1cm4gYCR7dGltZXN0YW1wfSBbJHtsYWJlbH1dICR7bGV2ZWx9OiAke21lc3NhZ2V9YFxufSlcblxubGV0IG5ld1JlbGljVHJhbnNwb3J0OiB3aW5zdG9uLnRyYW5zcG9ydDtcblxuY29uc3QgY29ycmVsYXRpb25JZEZvcm1hdCA9IHdpbnN0b24uZm9ybWF0KGluZm8gPT4ge1xuICAgIGluZm8uY29ycmVsYXRpb25JZCA9IHdpdGhDb3JyZWxhdGlvbigpO1xuICAgIHJldHVybiBpbmZvO1xufSk7XG5cbmNvbnN0IGdldExvZ1N0eWxlT3B0aW9uID0gKCk6IFtMb2dTdHlsZSwgc3RyaW5nXSA9PiB7XG4gICAgaWYgKCFwcm9jZXNzLmVudi5MT0dfU1RZTEUpIHtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIGRlZmF1bHRMb2dTdHlsZSxcbiAgICAgICAgICAgIGBVc2luZyBkZWZhdWx0IGxvZyBzdHlsZTogJHtkZWZhdWx0TG9nU3R5bGV9LiBPdmVycmlkZSB0aGlzIHVzaW5nIHRoZSBMT0dfU1RZTEUgZW52aXJvbm1lbnQgdmFyaWFibGUuIFZhbGlkIHZhbHVlcyBhcmU6ICR7bG9nU3R5bGVzfS5gXVxuICAgIH1cblxuICAgIGlmIChsb2dTdHlsZXMuaW5jbHVkZXMocHJvY2Vzcy5lbnYuTE9HX1NUWUxFLnRvVXBwZXJDYXNlKCkudHJpbSgpIGFzIExvZ1N0eWxlKSkge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgcHJvY2Vzcy5lbnYuTE9HX1NUWUxFIGFzIExvZ1N0eWxlLFxuICAgICAgICAgICAgYFVzaW5nIGxvZyBzdHlsZTogJHtwcm9jZXNzLmVudi5MT0dfU1RZTEV9YFxuICAgICAgICBdO1xuICAgIH1cblxuICAgIHJldHVybiBbXG4gICAgICAgIGRlZmF1bHRMb2dTdHlsZSxcbiAgICAgICAgYFVucmVjb2duaXplZCBsb2cgc3R5bGU6ICR7cHJvY2Vzcy5lbnYuTE9HX1NUWUxFfS4gVXNpbmcgZGVmYXVsdCBsb2cgc3R5bGU6ICR7ZGVmYXVsdExvZ1N0eWxlfS4gVmFsaWQgbG9nIHN0eWxlcyBhcmU6ICR7bG9nU3R5bGVzfWBcbiAgICBdXG59XG5cbmNvbnN0IGRlZmF1bHRMb2dnaW5nTGV2ZWwgPSBwcm9jZXNzLmVudi5MT0dfTEVWRUwgPz8gcHJvY2Vzcy5lbnYuTEVWRUwgPz8gJ2RlYnVnJztcbmNvbnN0IFtsb2dTdHlsZSwgbWVzc2FnZV0gPSBnZXRMb2dTdHlsZU9wdGlvbigpO1xuXG5leHBvcnQgY29uc3Qgd2l0aExvZ2dlciA9IChsYWJlbDogc3RyaW5nLCBsZXZlbD86IE5QTUxvZ2dpbmdMZXZlbHMpOiBMb2dnZXIgPT4ge1xuICAgIHN3aXRjaChsb2dTdHlsZSkge1xuICAgICAgICBjYXNlICdKU09OJzogcmV0dXJuIGNyZWF0ZUpzb25Mb2dnZXIobGFiZWwsIGxldmVsKTtcbiAgICAgICAgY2FzZSAnU1RSSU5HJzogcmV0dXJuIGNyZWF0ZVN0cmluZ0xvZ2dlcihsYWJlbCwgbGV2ZWwpO1xuICAgICAgICBjYXNlICdTVFJJTkdfQ09MT1InOiByZXR1cm4gY3JlYXRlQ29sb3JTdHJpbmdMb2dnZXIobGFiZWwsIGxldmVsKTtcbiAgICAgICAgY2FzZSAnU0lMRU5UJzogcmV0dXJuIGNyZWF0ZVNpbGVudExvZ2dlcihsYWJlbCwgbGV2ZWwpO1xuICAgIH1cbn1cblxuY29uc3QgY3JlYXRlSnNvbkxvZ2dlciA9IChsYWJlbDogc3RyaW5nLCBsZXZlbD86IE5QTUxvZ2dpbmdMZXZlbHMpID0+IHtcbiAgICBjb25zb2xlLmxvZyhgY3JlYXRpbmcgbG9nZ2VyIHdpdGggbGFiZWw6ICR7bGFiZWx9YClcbiAgICBcbiAgICBpZiAoIW5ld1JlbGljVHJhbnNwb3J0KSBuZXdSZWxpY1RyYW5zcG9ydCA9IG5ldyBOZXdSZWxpY0xvZ1RyYW5zcG9ydCh7fSwge30pO1xuICAgIFxuICAgIHJldHVybiB3aW5zdG9uLmxvZ2dlcnMuYWRkKGxhYmVsLCB7XG4gICAgICAgIGxldmVsOiBsZXZlbCA/PyBkZWZhdWx0TG9nZ2luZ0xldmVsLFxuICAgICAgICBmb3JtYXQ6IHdpbnN0b24uZm9ybWF0LmNvbWJpbmUoXG4gICAgICAgICAgICBjb3JyZWxhdGlvbklkRm9ybWF0KCksXG4gICAgICAgICAgICB3aW5zdG9uLmZvcm1hdC5sYWJlbCh7IGxhYmVsIH0pLFxuICAgICAgICAgICAgd2luc3Rvbi5mb3JtYXQudGltZXN0YW1wKCksXG4gICAgICAgICAgICAvLyBwcm9jZXNzLmVudi5ORVdfUkVMSUNfTElDRU5TRV9LRVkgXG4gICAgICAgICAgICAgICAgbmV3cmVsaWNGb3JtYXR0ZXIoKVxuICAgICAgICAgICAgICAgIC8vIDogd2luc3Rvbi5mb3JtYXQuanNvbigpXG4gICAgICAgICksXG5cbiAgICAgICAgdHJhbnNwb3J0czogW1xuICAgICAgICAgICAgbmV3IHdpbnN0b24udHJhbnNwb3J0cy5Db25zb2xlKCksXG4gICAgICAgICAgICBuZXdSZWxpY1RyYW5zcG9ydFxuICAgICAgICBdXG4gICAgfSk7XG59XG5cbmNvbnN0IGNyZWF0ZVN0cmluZ0xvZ2dlciA9IChsYWJlbDogc3RyaW5nLCBsZXZlbD86IE5QTUxvZ2dpbmdMZXZlbHMpID0+IHtcbiAgICByZXR1cm4gd2luc3Rvbi5sb2dnZXJzLmFkZChsYWJlbCwge1xuICAgICAgICBsZXZlbDogbGV2ZWwgPz8gZGVmYXVsdExvZ2dpbmdMZXZlbCxcbiAgICAgICAgZm9ybWF0OiB3aW5zdG9uLmZvcm1hdC5jb21iaW5lKFxuICAgICAgICAgICAgY29ycmVsYXRpb25JZEZvcm1hdCgpLFxuICAgICAgICAgICAgd2luc3Rvbi5mb3JtYXQubGFiZWwoeyBsYWJlbCB9KSxcbiAgICAgICAgICAgIHdpbnN0b24uZm9ybWF0LnRpbWVzdGFtcCgpLFxuICAgICAgICAgICAgc3Rkb3V0Rm9ybWF0XG4gICAgICAgICksXG4gICAgICAgIHRyYW5zcG9ydHM6IFtcbiAgICAgICAgICAgIG5ldyB3aW5zdG9uLnRyYW5zcG9ydHMuQ29uc29sZSgpXG4gICAgICAgIF1cbiAgICB9KTtcbn1cblxuY29uc3QgY3JlYXRlQ29sb3JTdHJpbmdMb2dnZXIgPSAobGFiZWw6IHN0cmluZywgbGV2ZWw/OiBOUE1Mb2dnaW5nTGV2ZWxzKSA9PiB7XG4gICAgcmV0dXJuIHdpbnN0b24ubG9nZ2Vycy5hZGQobGFiZWwsIHtcbiAgICAgICAgbGV2ZWw6IGxldmVsID8/IGRlZmF1bHRMb2dnaW5nTGV2ZWwsXG4gICAgICAgIGZvcm1hdDogd2luc3Rvbi5mb3JtYXQuY29tYmluZShcbiAgICAgICAgICAgIGNvcnJlbGF0aW9uSWRGb3JtYXQoKSxcbiAgICAgICAgICAgIHdpbnN0b24uZm9ybWF0LmxhYmVsKHsgbGFiZWwgfSksXG4gICAgICAgICAgICB3aW5zdG9uLmZvcm1hdC50aW1lc3RhbXAoKSxcbiAgICAgICAgICAgIHdpbnN0b24uZm9ybWF0LmNvbG9yaXplKCksXG4gICAgICAgICAgICBzdGRvdXRGb3JtYXRcbiAgICAgICAgKSxcbiAgICAgICAgdHJhbnNwb3J0czogW1xuICAgICAgICAgICAgbmV3IHdpbnN0b24udHJhbnNwb3J0cy5Db25zb2xlKClcbiAgICAgICAgXVxuICAgIH0pO1xufVxuXG5jb25zdCBjcmVhdGVTaWxlbnRMb2dnZXIgPSAobGFiZWw6IHN0cmluZywgbGV2ZWw/OiBOUE1Mb2dnaW5nTGV2ZWxzKSA9PiB7XG4gICAgcmV0dXJuIHdpbnN0b24ubG9nZ2Vycy5hZGQobGFiZWwsIHtcbiAgICAgICAgc2lsZW50OiB0cnVlLFxuICAgICAgICBsZXZlbDogbGV2ZWwgPz8gZGVmYXVsdExvZ2dpbmdMZXZlbCxcbiAgICAgICAgdHJhbnNwb3J0czogW1xuICAgICAgICAgICAgbmV3IHdpbnN0b24udHJhbnNwb3J0cy5Db25zb2xlKClcbiAgICAgICAgXVxuICAgIH0pO1xufVxuXG5jb25zdCBsb2cgPSB3aXRoTG9nZ2VyKCdsb2dnZXInKTtcbmxvZy5pbmZvKG1lc3NhZ2UpO1xud2luc3RvbiJdfQ==