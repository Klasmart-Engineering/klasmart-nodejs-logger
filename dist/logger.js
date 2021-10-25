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

var correlationIdFormat = _winston["default"].format(function (info) {
  info.correlationId = (0, _correlationMiddleware.withCorrelation)();
  return info;
});

var getNewRelicLogTransport = function () {
  var newRelicLogTransport;
  return function () {
    if (!newRelicLogTransport) {
      newRelicLogTransport = new _newRelicLogForwarder.NewRelicLogTransport({
        logPushFrequency: 5000
      }, {});
    }

    return newRelicLogTransport;
  };
}();

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
  var transports = [new _winston["default"].transports.Console()];

  if (process.env.NEW_RELIC_LICENSE_KEY) {
    transports.push(getNewRelicLogTransport());
  }

  return _winston["default"].loggers.add(label, {
    level: level !== null && level !== void 0 ? level : defaultLoggingLevel,
    format: _winston["default"].format.combine(correlationIdFormat(), _winston["default"].format.label({
      label: label
    }), _winston["default"].format.timestamp(), (0, _winstonEnricher["default"])()),
    transports: transports
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9sb2dnZXIudHMiXSwibmFtZXMiOlsibG9nU3R5bGVzIiwiZGVmYXVsdExvZ1N0eWxlIiwic3Rkb3V0Rm9ybWF0Iiwid2luc3RvbiIsImZvcm1hdCIsInByaW50ZiIsImxldmVsIiwibWVzc2FnZSIsImxhYmVsIiwidGltZXN0YW1wIiwiY29ycmVsYXRpb25JZEZvcm1hdCIsImluZm8iLCJjb3JyZWxhdGlvbklkIiwiZ2V0TmV3UmVsaWNMb2dUcmFuc3BvcnQiLCJuZXdSZWxpY0xvZ1RyYW5zcG9ydCIsIk5ld1JlbGljTG9nVHJhbnNwb3J0IiwibG9nUHVzaEZyZXF1ZW5jeSIsImdldExvZ1N0eWxlT3B0aW9uIiwicHJvY2VzcyIsImVudiIsIkxPR19TVFlMRSIsImluY2x1ZGVzIiwidG9VcHBlckNhc2UiLCJ0cmltIiwiZGVmYXVsdExvZ2dpbmdMZXZlbCIsIkxPR19MRVZFTCIsIkxFVkVMIiwibG9nU3R5bGUiLCJ3aXRoTG9nZ2VyIiwiY3JlYXRlSnNvbkxvZ2dlciIsImNyZWF0ZVN0cmluZ0xvZ2dlciIsImNyZWF0ZUNvbG9yU3RyaW5nTG9nZ2VyIiwiY3JlYXRlU2lsZW50TG9nZ2VyIiwidHJhbnNwb3J0cyIsIkNvbnNvbGUiLCJORVdfUkVMSUNfTElDRU5TRV9LRVkiLCJwdXNoIiwibG9nZ2VycyIsImFkZCIsImNvbWJpbmUiLCJjb2xvcml6ZSIsInNpbGVudCIsImxvZyJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFLQSxJQUFNQSxTQUFxQixHQUFHLENBQUMsY0FBRCxFQUFpQixRQUFqQixFQUEyQixNQUEzQixFQUFtQyxRQUFuQyxDQUE5QjtBQUNBLElBQU1DLGVBQXlCLEdBQUdELFNBQVMsQ0FBQyxDQUFELENBQTNDOztBQUVBLElBQU1FLFlBQVksR0FBR0Msb0JBQVFDLE1BQVIsQ0FBZUMsTUFBZixDQUFzQixnQkFBMEM7QUFBQSxNQUF2Q0MsS0FBdUMsUUFBdkNB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b20gJ0BuZXdyZWxpYy93aW5zdG9uLWVucmljaGVyJztcbmltcG9ydCB3aW5zdG9uLCB7IExvZ2dlciB9IGZyb20gJ3dpbnN0b24nO1xuaW1wb3J0IHsgd2l0aENvcnJlbGF0aW9uIH0gZnJvbSAnLi9jb3JyZWxhdGlvbk1pZGRsZXdhcmUnO1xuaW1wb3J0IHsgTmV3UmVsaWNMb2dUcmFuc3BvcnQgfSBmcm9tICcuL25ld1JlbGljTG9nRm9yd2FyZGVyJztcblxudHlwZSBOUE1Mb2dnaW5nTGV2ZWxzID0gJ3NpbGx5JyB8ICdkZWJ1ZycgfCAndmVyYm9zZScgfCAnaHR0cCcgfCAnaW5mbycgfCAnd2FybicgfCAnZXJyb3InO1xudHlwZSBMb2dTdHlsZSA9ICdTVFJJTkdfQ09MT1InIHwgJ1NUUklORycgfCAnSlNPTicgfCAnU0lMRU5UJztcblxuY29uc3QgbG9nU3R5bGVzOiBMb2dTdHlsZVtdID0gWydTVFJJTkdfQ09MT1InLCAnU1RSSU5HJywgJ0pTT04nLCAnU0lMRU5UJ107XG5jb25zdCBkZWZhdWx0TG9nU3R5bGU6IExvZ1N0eWxlID0gbG9nU3R5bGVzWzBdO1xuXG5jb25zdCBzdGRvdXRGb3JtYXQgPSB3aW5zdG9uLmZvcm1hdC5wcmludGYoKHsgbGV2ZWwsIG1lc3NhZ2UsIGxhYmVsLCB0aW1lc3RhbXAgfSkgPT4ge1xuICAgIHJldHVybiBgJHt0aW1lc3RhbXB9IFske2xhYmVsfV0gJHtsZXZlbH06ICR7bWVzc2FnZX1gXG59KVxuXG5jb25zdCBjb3JyZWxhdGlvbklkRm9ybWF0ID0gd2luc3Rvbi5mb3JtYXQoaW5mbyA9PiB7XG4gICAgaW5mby5jb3JyZWxhdGlvbklkID0gd2l0aENvcnJlbGF0aW9uKCk7XG4gICAgcmV0dXJuIGluZm87XG59KTtcblxuY29uc3QgZ2V0TmV3UmVsaWNMb2dUcmFuc3BvcnQ6ICgpID0+IE5ld1JlbGljTG9nVHJhbnNwb3J0ID0gKCgpID0+IHtcbiAgICBsZXQgbmV3UmVsaWNMb2dUcmFuc3BvcnQ6IHVuZGVmaW5lZCB8IE5ld1JlbGljTG9nVHJhbnNwb3J0O1xuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgIGlmKCFuZXdSZWxpY0xvZ1RyYW5zcG9ydCkge1xuICAgICAgICAgICAgbmV3UmVsaWNMb2dUcmFuc3BvcnQgPSBuZXcgTmV3UmVsaWNMb2dUcmFuc3BvcnQoe1xuICAgICAgICAgICAgICAgIGxvZ1B1c2hGcmVxdWVuY3k6IDUwMDBcbiAgICAgICAgICAgIH0se30pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXdSZWxpY0xvZ1RyYW5zcG9ydDtcbiAgICB9XG5cbn0pKCk7XG5cbmNvbnN0IGdldExvZ1N0eWxlT3B0aW9uID0gKCk6IFtMb2dTdHlsZSwgc3RyaW5nXSA9PiB7XG4gICAgaWYgKCFwcm9jZXNzLmVudi5MT0dfU1RZTEUpIHtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIGRlZmF1bHRMb2dTdHlsZSxcbiAgICAgICAgICAgIGBVc2luZyBkZWZhdWx0IGxvZyBzdHlsZTogJHtkZWZhdWx0TG9nU3R5bGV9LiBPdmVycmlkZSB0aGlzIHVzaW5nIHRoZSBMT0dfU1RZTEUgZW52aXJvbm1lbnQgdmFyaWFibGUuIFZhbGlkIHZhbHVlcyBhcmU6ICR7bG9nU3R5bGVzfS5gXVxuICAgIH1cblxuICAgIGlmIChsb2dTdHlsZXMuaW5jbHVkZXMocHJvY2Vzcy5lbnYuTE9HX1NUWUxFLnRvVXBwZXJDYXNlKCkudHJpbSgpIGFzIExvZ1N0eWxlKSkge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgcHJvY2Vzcy5lbnYuTE9HX1NUWUxFIGFzIExvZ1N0eWxlLFxuICAgICAgICAgICAgYFVzaW5nIGxvZyBzdHlsZTogJHtwcm9jZXNzLmVudi5MT0dfU1RZTEV9YFxuICAgICAgICBdO1xuICAgIH1cblxuICAgIHJldHVybiBbXG4gICAgICAgIGRlZmF1bHRMb2dTdHlsZSxcbiAgICAgICAgYFVucmVjb2duaXplZCBsb2cgc3R5bGU6ICR7cHJvY2Vzcy5lbnYuTE9HX1NUWUxFfS4gVXNpbmcgZGVmYXVsdCBsb2cgc3R5bGU6ICR7ZGVmYXVsdExvZ1N0eWxlfS4gVmFsaWQgbG9nIHN0eWxlcyBhcmU6ICR7bG9nU3R5bGVzfWBcbiAgICBdXG59XG5cbmNvbnN0IGRlZmF1bHRMb2dnaW5nTGV2ZWwgPSBwcm9jZXNzLmVudi5MT0dfTEVWRUwgPz8gcHJvY2Vzcy5lbnYuTEVWRUwgPz8gJ2RlYnVnJztcbmNvbnN0IFtsb2dTdHlsZSwgbWVzc2FnZV0gPSBnZXRMb2dTdHlsZU9wdGlvbigpO1xuXG5leHBvcnQgY29uc3Qgd2l0aExvZ2dlciA9IChsYWJlbDogc3RyaW5nLCBsZXZlbD86IE5QTUxvZ2dpbmdMZXZlbHMpOiBMb2dnZXIgPT4ge1xuICAgIHN3aXRjaChsb2dTdHlsZSkge1xuICAgICAgICBjYXNlICdKU09OJzogcmV0dXJuIGNyZWF0ZUpzb25Mb2dnZXIobGFiZWwsIGxldmVsKTtcbiAgICAgICAgY2FzZSAnU1RSSU5HJzogcmV0dXJuIGNyZWF0ZVN0cmluZ0xvZ2dlcihsYWJlbCwgbGV2ZWwpO1xuICAgICAgICBjYXNlICdTVFJJTkdfQ09MT1InOiByZXR1cm4gY3JlYXRlQ29sb3JTdHJpbmdMb2dnZXIobGFiZWwsIGxldmVsKTtcbiAgICAgICAgY2FzZSAnU0lMRU5UJzogcmV0dXJuIGNyZWF0ZVNpbGVudExvZ2dlcihsYWJlbCwgbGV2ZWwpO1xuICAgIH1cbn1cblxuY29uc3QgY3JlYXRlSnNvbkxvZ2dlciA9IChsYWJlbDogc3RyaW5nLCBsZXZlbD86IE5QTUxvZ2dpbmdMZXZlbHMpID0+IHtcbiAgICBjb25zdCB0cmFuc3BvcnRzOiB3aW5zdG9uLnRyYW5zcG9ydFtdID0gWyBuZXcgd2luc3Rvbi50cmFuc3BvcnRzLkNvbnNvbGUoKSBdXG4gICAgaWYgKHByb2Nlc3MuZW52Lk5FV19SRUxJQ19MSUNFTlNFX0tFWSkge1xuICAgICAgICB0cmFuc3BvcnRzLnB1c2goZ2V0TmV3UmVsaWNMb2dUcmFuc3BvcnQoKSk7XG4gICAgfVxuICAgIFxuICAgIHJldHVybiB3aW5zdG9uLmxvZ2dlcnMuYWRkKGxhYmVsLCB7XG4gICAgICAgIGxldmVsOiBsZXZlbCA/PyBkZWZhdWx0TG9nZ2luZ0xldmVsLFxuICAgICAgICBmb3JtYXQ6IHdpbnN0b24uZm9ybWF0LmNvbWJpbmUoXG4gICAgICAgICAgICBjb3JyZWxhdGlvbklkRm9ybWF0KCksXG4gICAgICAgICAgICB3aW5zdG9uLmZvcm1hdC5sYWJlbCh7IGxhYmVsIH0pLFxuICAgICAgICAgICAgd2luc3Rvbi5mb3JtYXQudGltZXN0YW1wKCksXG4gICAgICAgICAgICBuZXdyZWxpY0Zvcm1hdHRlcigpXG4gICAgICAgICksXG4gICAgICAgIHRyYW5zcG9ydHNcbiAgICB9KTtcbn1cblxuY29uc3QgY3JlYXRlU3RyaW5nTG9nZ2VyID0gKGxhYmVsOiBzdHJpbmcsIGxldmVsPzogTlBNTG9nZ2luZ0xldmVscykgPT4ge1xuICAgIHJldHVybiB3aW5zdG9uLmxvZ2dlcnMuYWRkKGxhYmVsLCB7XG4gICAgICAgIGxldmVsOiBsZXZlbCA/PyBkZWZhdWx0TG9nZ2luZ0xldmVsLFxuICAgICAgICBmb3JtYXQ6IHdpbnN0b24uZm9ybWF0LmNvbWJpbmUoXG4gICAgICAgICAgICBjb3JyZWxhdGlvbklkRm9ybWF0KCksXG4gICAgICAgICAgICB3aW5zdG9uLmZvcm1hdC5sYWJlbCh7IGxhYmVsIH0pLFxuICAgICAgICAgICAgd2luc3Rvbi5mb3JtYXQudGltZXN0YW1wKCksXG4gICAgICAgICAgICBzdGRvdXRGb3JtYXRcbiAgICAgICAgKSxcbiAgICAgICAgdHJhbnNwb3J0czogW1xuICAgICAgICAgICAgbmV3IHdpbnN0b24udHJhbnNwb3J0cy5Db25zb2xlKClcbiAgICAgICAgXVxuICAgIH0pO1xufVxuXG5jb25zdCBjcmVhdGVDb2xvclN0cmluZ0xvZ2dlciA9IChsYWJlbDogc3RyaW5nLCBsZXZlbD86IE5QTUxvZ2dpbmdMZXZlbHMpID0+IHtcbiAgICByZXR1cm4gd2luc3Rvbi5sb2dnZXJzLmFkZChsYWJlbCwge1xuICAgICAgICBsZXZlbDogbGV2ZWwgPz8gZGVmYXVsdExvZ2dpbmdMZXZlbCxcbiAgICAgICAgZm9ybWF0OiB3aW5zdG9uLmZvcm1hdC5jb21iaW5lKFxuICAgICAgICAgICAgY29ycmVsYXRpb25JZEZvcm1hdCgpLFxuICAgICAgICAgICAgd2luc3Rvbi5mb3JtYXQubGFiZWwoeyBsYWJlbCB9KSxcbiAgICAgICAgICAgIHdpbnN0b24uZm9ybWF0LnRpbWVzdGFtcCgpLFxuICAgICAgICAgICAgd2luc3Rvbi5mb3JtYXQuY29sb3JpemUoKSxcbiAgICAgICAgICAgIHN0ZG91dEZvcm1hdFxuICAgICAgICApLFxuICAgICAgICB0cmFuc3BvcnRzOiBbXG4gICAgICAgICAgICBuZXcgd2luc3Rvbi50cmFuc3BvcnRzLkNvbnNvbGUoKVxuICAgICAgICBdXG4gICAgfSk7XG59XG5cbmNvbnN0IGNyZWF0ZVNpbGVudExvZ2dlciA9IChsYWJlbDogc3RyaW5nLCBsZXZlbD86IE5QTUxvZ2dpbmdMZXZlbHMpID0+IHtcbiAgICByZXR1cm4gd2luc3Rvbi5sb2dnZXJzLmFkZChsYWJlbCwge1xuICAgICAgICBzaWxlbnQ6IHRydWUsXG4gICAgICAgIGxldmVsOiBsZXZlbCA/PyBkZWZhdWx0TG9nZ2luZ0xldmVsLFxuICAgICAgICB0cmFuc3BvcnRzOiBbXG4gICAgICAgICAgICBuZXcgd2luc3Rvbi50cmFuc3BvcnRzLkNvbnNvbGUoKVxuICAgICAgICBdXG4gICAgfSk7XG59XG5cbmNvbnN0IGxvZyA9IHdpdGhMb2dnZXIoJ2xvZ2dlcicpO1xubG9nLmluZm8obWVzc2FnZSk7XG53aW5zdG9uIl19