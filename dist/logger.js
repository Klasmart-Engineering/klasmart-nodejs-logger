"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.withLogger = void 0;

var _winstonEnricher = _interopRequireDefault(require("@newrelic/winston-enricher"));

var _winston = _interopRequireDefault(require("winston"));

var _correlationMiddleware = require("./correlation-middleware");

var _LogDeliveryAgent = require("./LogDeliveryAgent");

var _ref2, _process$env$LOG_LEVE;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

// Queue for logs prior to logger creation
var logStyles = ['STRING_COLOR', 'STRING', 'JSON', 'SILENT', 'NEW_RELIC'];
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

var getNewRelicLogTransport = function getNewRelicLogTransport() {
  var _NewRelicLogDeliveryA;

  messages.push(['silly', 'Attempting retrieval of NewRelicLogDeliveryAgent instance']);

  var instance = _LogDeliveryAgent.NewRelicLogDeliveryAgent.getInstance();

  if (instance) {
    return instance.getLogTransport();
  }

  messages.push(['debug', 'No NewRelicLogDeliveryAgent defined, initializing instance']);
  var transport = (_NewRelicLogDeliveryA = _LogDeliveryAgent.NewRelicLogDeliveryAgent.initialize()) === null || _NewRelicLogDeliveryA === void 0 ? void 0 : _NewRelicLogDeliveryA.getLogTransport();
  transport === null || transport === void 0 ? void 0 : transport.setMaxListeners(Infinity);
  messages.push(['silly', "Transport created"]);
  return transport;
};

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
var messages = [];

var _getLogStyleOption = getLogStyleOption(),
    _getLogStyleOption2 = _slicedToArray(_getLogStyleOption, 2),
    logStyle = _getLogStyleOption2[0],
    message = _getLogStyleOption2[1];

messages.push(['info', message]);

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

    case 'NEW_RELIC':
      return createNewRelicLogger(label, level);
  }
};

exports.withLogger = withLogger;

var createNewRelicLogger = function createNewRelicLogger(label, level) {
  if (!process.env.NEW_RELIC_LICENSE_KEY) {
    messages.push(['warn', 'NEW_RELIC logging style configured but NEW_RELIC_LICENSE_KEY is not defined! Falling back to JSON logger.']);
    return createJsonLogger(label, level);
  }

  return _winston["default"].loggers.add(label, {
    level: level !== null && level !== void 0 ? level : defaultLoggingLevel,
    format: _winston["default"].format.combine(correlationIdFormat(), _winston["default"].format.label({
      label: label
    }), _winston["default"].format.timestamp(), (0, _winstonEnricher["default"])()),
    transports: [getNewRelicLogTransport()]
  });
};

var createJsonLogger = function createJsonLogger(label, level) {
  return _winston["default"].loggers.add(label, {
    level: level !== null && level !== void 0 ? level : defaultLoggingLevel,
    format: _winston["default"].format.combine(correlationIdFormat(), _winston["default"].format.label({
      label: label
    }), _winston["default"].format.timestamp(), (0, _winstonEnricher["default"])()),
    transports: [new _winston["default"].transports.Console()]
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
messages.push(['debug', 'Internal logger initialized']);

while (messages.length > 0) {
  var _ref3 = messages.shift(),
      _ref4 = _slicedToArray(_ref3, 2),
      level = _ref4[0],
      _message = _ref4[1];

  log[level](_message);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9sb2dnZXIudHMiXSwibmFtZXMiOlsibG9nU3R5bGVzIiwiZGVmYXVsdExvZ1N0eWxlIiwic3Rkb3V0Rm9ybWF0Iiwid2luc3RvbiIsImZvcm1hdCIsInByaW50ZiIsImxldmVsIiwibWVzc2FnZSIsImxhYmVsIiwidGltZXN0YW1wIiwiY29ycmVsYXRpb25JZEZvcm1hdCIsImluZm8iLCJjb3JyZWxhdGlvbklkIiwiZ2V0TmV3UmVsaWNMb2dUcmFuc3BvcnQiLCJtZXNzYWdlcyIsInB1c2giLCJpbnN0YW5jZSIsIk5ld1JlbGljTG9nRGVsaXZlcnlBZ2VudCIsImdldEluc3RhbmNlIiwiZ2V0TG9nVHJhbnNwb3J0IiwidHJhbnNwb3J0IiwiaW5pdGlhbGl6ZSIsInNldE1heExpc3RlbmVycyIsIkluZmluaXR5IiwiZ2V0TG9nU3R5bGVPcHRpb24iLCJwcm9jZXNzIiwiZW52IiwiTE9HX1NUWUxFIiwiaW5jbHVkZXMiLCJ0b1VwcGVyQ2FzZSIsInRyaW0iLCJkZWZhdWx0TG9nZ2luZ0xldmVsIiwiTE9HX0xFVkVMIiwiTEVWRUwiLCJsb2dTdHlsZSIsIndpdGhMb2dnZXIiLCJjcmVhdGVKc29uTG9nZ2VyIiwiY3JlYXRlU3RyaW5nTG9nZ2VyIiwiY3JlYXRlQ29sb3JTdHJpbmdMb2dnZXIiLCJjcmVhdGVTaWxlbnRMb2dnZXIiLCJjcmVhdGVOZXdSZWxpY0xvZ2dlciIsIk5FV19SRUxJQ19MSUNFTlNFX0tFWSIsImxvZ2dlcnMiLCJhZGQiLCJjb21iaW5lIiwidHJhbnNwb3J0cyIsIkNvbnNvbGUiLCJjb2xvcml6ZSIsInNpbGVudCIsImxvZyIsImxlbmd0aCIsInNoaWZ0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUtBO0FBQ0EsSUFBTUEsU0FBcUIsR0FBRyxDQUFDLGNBQUQsRUFBaUIsUUFBakIsRUFBMkIsTUFBM0IsRUFBbUMsUUFBbkMsRUFBNkMsV0FBN0MsQ0FBOUI7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QUFDLFFBQUQsQ0FBdEI7QUFDQXJCLFFBQVEsQ0FBQ0MsSUFBVCxDQUFjLENBQUMsT0FBRCxFQUFVLDZCQUFWLENBQWQ7O0FBQ0EsT0FBTUQsUUFBUSxDQUFDb0MsTUFBVCxHQUFrQixDQUF4QixFQUEyQjtBQUN2QixjQUF5QnBDLFFBQVEsQ0FBQ3FDLEtBQVQsRUFBekI7QUFBQTtBQUFBLE1BQU83QyxLQUFQO0FBQUEsTUFBY0MsUUFBZDs7QUFDQTBDLEVBQUFBLEdBQUcsQ0FBQzNDLEtBQUQsQ0FBSCxDQUFXQyxRQUFYO0FBQ0giLCJzb3VyY2VzQ29udGVudCI6WyIvLyBAdHMtaWdub3JlXG5pbXBvcnQgbmV3cmVsaWNGb3JtYXR0ZXIgZnJvbSAnQG5ld3JlbGljL3dpbnN0b24tZW5yaWNoZXInO1xuaW1wb3J0IHdpbnN0b24sIHsgTG9nZ2VyIH0gZnJvbSAnd2luc3Rvbic7XG5pbXBvcnQgeyB3aXRoQ29ycmVsYXRpb24gfSBmcm9tICcuL2NvcnJlbGF0aW9uLW1pZGRsZXdhcmUnO1xuaW1wb3J0IHsgTmV3UmVsaWNMb2dUcmFuc3BvcnQgfSBmcm9tICcuL05ld1JlbGljTG9nVHJhbnNwb3J0JztcbmltcG9ydCB7IE5ld1JlbGljTG9nRGVsaXZlcnlBZ2VudCB9IGZyb20gJy4vTG9nRGVsaXZlcnlBZ2VudCc7XG5cbmV4cG9ydCB0eXBlIE5QTUxvZ2dpbmdMZXZlbHMgPSAnc2lsbHknIHwgJ2RlYnVnJyB8ICd2ZXJib3NlJyB8ICdodHRwJyB8ICdpbmZvJyB8ICd3YXJuJyB8ICdlcnJvcic7XG50eXBlIExvZ1N0eWxlID0gJ1NUUklOR19DT0xPUicgfCAnU1RSSU5HJyB8ICdKU09OJyB8ICdTSUxFTlQnIHwgJ05FV19SRUxJQyc7XG5cbi8vIFF1ZXVlIGZvciBsb2dzIHByaW9yIHRvIGxvZ2dlciBjcmVhdGlvblxuY29uc3QgbG9nU3R5bGVzOiBMb2dTdHlsZVtdID0gWydTVFJJTkdfQ09MT1InLCAnU1RSSU5HJywgJ0pTT04nLCAnU0lMRU5UJywgJ05FV19SRUxJQyddO1xuY29uc3QgZGVmYXVsdExvZ1N0eWxlOiBMb2dTdHlsZSA9IGxvZ1N0eWxlc1swXTtcblxuY29uc3Qgc3Rkb3V0Rm9ybWF0ID0gd2luc3Rvbi5mb3JtYXQucHJpbnRmKCh7IGxldmVsLCBtZXNzYWdlLCBsYWJlbCwgdGltZXN0YW1wIH0pID0+IHtcbiAgICByZXR1cm4gYCR7dGltZXN0YW1wfSBbJHtsYWJlbH1dICR7bGV2ZWx9OiAke21lc3NhZ2V9YFxufSk7XG5cbmNvbnN0IGNvcnJlbGF0aW9uSWRGb3JtYXQgPSB3aW5zdG9uLmZvcm1hdChpbmZvID0+IHtcbiAgICBpbmZvLmNvcnJlbGF0aW9uSWQgPSB3aXRoQ29ycmVsYXRpb24oKTtcbiAgICByZXR1cm4gaW5mbztcbn0pO1xuXG5jb25zdCBnZXROZXdSZWxpY0xvZ1RyYW5zcG9ydDogKCkgPT4gTmV3UmVsaWNMb2dUcmFuc3BvcnQgfCB1bmRlZmluZWQgPSAoKSA9PiB7XG4gICAgbWVzc2FnZXMucHVzaChbJ3NpbGx5JywgJ0F0dGVtcHRpbmcgcmV0cmlldmFsIG9mIE5ld1JlbGljTG9nRGVsaXZlcnlBZ2VudCBpbnN0YW5jZSddKTtcbiAgICBsZXQgaW5zdGFuY2UgPSBOZXdSZWxpY0xvZ0RlbGl2ZXJ5QWdlbnQuZ2V0SW5zdGFuY2UoKTtcbiAgICBpZiAoaW5zdGFuY2UpIHtcbiAgICAgICAgcmV0dXJuIGluc3RhbmNlLmdldExvZ1RyYW5zcG9ydCgpO1xuICAgIH1cbiAgICBtZXNzYWdlcy5wdXNoKFsnZGVidWcnLCAnTm8gTmV3UmVsaWNMb2dEZWxpdmVyeUFnZW50IGRlZmluZWQsIGluaXRpYWxpemluZyBpbnN0YW5jZSddKTtcbiAgICBjb25zdCB0cmFuc3BvcnQgPSBOZXdSZWxpY0xvZ0RlbGl2ZXJ5QWdlbnQuaW5pdGlhbGl6ZSgpPy5nZXRMb2dUcmFuc3BvcnQoKTtcbiAgICB0cmFuc3BvcnQ/LnNldE1heExpc3RlbmVycyhJbmZpbml0eSk7XG4gICAgbWVzc2FnZXMucHVzaChbJ3NpbGx5JywgYFRyYW5zcG9ydCBjcmVhdGVkYF0pO1xuICAgIHJldHVybiB0cmFuc3BvcnQ7XG59XG5cbmNvbnN0IGdldExvZ1N0eWxlT3B0aW9uID0gKCk6IFtMb2dTdHlsZSwgc3RyaW5nXSA9PiB7XG4gICAgaWYgKCFwcm9jZXNzLmVudi5MT0dfU1RZTEUpIHtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIGRlZmF1bHRMb2dTdHlsZSxcbiAgICAgICAgICAgIGBVc2luZyBkZWZhdWx0IGxvZyBzdHlsZTogJHtkZWZhdWx0TG9nU3R5bGV9LiBPdmVycmlkZSB0aGlzIHVzaW5nIHRoZSBMT0dfU1RZTEUgZW52aXJvbm1lbnQgdmFyaWFibGUuIFZhbGlkIHZhbHVlcyBhcmU6ICR7bG9nU3R5bGVzfS5gXVxuICAgIH1cblxuICAgIGlmIChsb2dTdHlsZXMuaW5jbHVkZXMocHJvY2Vzcy5lbnYuTE9HX1NUWUxFLnRvVXBwZXJDYXNlKCkudHJpbSgpIGFzIExvZ1N0eWxlKSkge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgcHJvY2Vzcy5lbnYuTE9HX1NUWUxFIGFzIExvZ1N0eWxlLFxuICAgICAgICAgICAgYFVzaW5nIGxvZyBzdHlsZTogJHtwcm9jZXNzLmVudi5MT0dfU1RZTEV9YFxuICAgICAgICBdO1xuICAgIH1cblxuICAgIHJldHVybiBbXG4gICAgICAgIGRlZmF1bHRMb2dTdHlsZSxcbiAgICAgICAgYFVucmVjb2duaXplZCBsb2cgc3R5bGU6ICR7cHJvY2Vzcy5lbnYuTE9HX1NUWUxFfS4gVXNpbmcgZGVmYXVsdCBsb2cgc3R5bGU6ICR7ZGVmYXVsdExvZ1N0eWxlfS4gVmFsaWQgbG9nIHN0eWxlcyBhcmU6ICR7bG9nU3R5bGVzfWBcbiAgICBdXG59XG5cbmNvbnN0IGRlZmF1bHRMb2dnaW5nTGV2ZWwgPSBwcm9jZXNzLmVudi5MT0dfTEVWRUwgPz8gcHJvY2Vzcy5lbnYuTEVWRUwgPz8gJ2RlYnVnJztcbmNvbnN0IG1lc3NhZ2VzOiBbTlBNTG9nZ2luZ0xldmVscywgc3RyaW5nXVtdID0gW107XG5jb25zdCBbbG9nU3R5bGUsIG1lc3NhZ2VdID0gZ2V0TG9nU3R5bGVPcHRpb24oKTtcbm1lc3NhZ2VzLnB1c2goWydpbmZvJywgbWVzc2FnZV0pO1xuZXhwb3J0IGNvbnN0IHdpdGhMb2dnZXIgPSAobGFiZWw6IHN0cmluZywgbGV2ZWw/OiBOUE1Mb2dnaW5nTGV2ZWxzKTogTG9nZ2VyID0+IHtcbiAgICBzd2l0Y2gobG9nU3R5bGUpIHtcbiAgICAgICAgY2FzZSAnSlNPTic6ICAgICAgICAgICAgcmV0dXJuIGNyZWF0ZUpzb25Mb2dnZXIobGFiZWwsIGxldmVsKTtcbiAgICAgICAgY2FzZSAnU1RSSU5HJzogICAgICAgICAgcmV0dXJuIGNyZWF0ZVN0cmluZ0xvZ2dlcihsYWJlbCwgbGV2ZWwpO1xuICAgICAgICBjYXNlICdTVFJJTkdfQ09MT1InOiAgICByZXR1cm4gY3JlYXRlQ29sb3JTdHJpbmdMb2dnZXIobGFiZWwsIGxldmVsKTtcbiAgICAgICAgY2FzZSAnU0lMRU5UJzogICAgICAgICAgcmV0dXJuIGNyZWF0ZVNpbGVudExvZ2dlcihsYWJlbCwgbGV2ZWwpO1xuICAgICAgICBjYXNlICdORVdfUkVMSUMnOiAgICAgICByZXR1cm4gY3JlYXRlTmV3UmVsaWNMb2dnZXIobGFiZWwsIGxldmVsKTtcbiAgICB9XG59XG5cbmNvbnN0IGNyZWF0ZU5ld1JlbGljTG9nZ2VyID0gKGxhYmVsOiBzdHJpbmcsIGxldmVsPzogTlBNTG9nZ2luZ0xldmVscykgPT4ge1xuICAgIGlmICghcHJvY2Vzcy5lbnYuTkVXX1JFTElDX0xJQ0VOU0VfS0VZKSB7XG4gICAgICAgIG1lc3NhZ2VzLnB1c2goWyd3YXJuJywgJ05FV19SRUxJQyBsb2dnaW5nIHN0eWxlIGNvbmZpZ3VyZWQgYnV0IE5FV19SRUxJQ19MSUNFTlNFX0tFWSBpcyBub3QgZGVmaW5lZCEgRmFsbGluZyBiYWNrIHRvIEpTT04gbG9nZ2VyLiddKTtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZUpzb25Mb2dnZXIobGFiZWwsbGV2ZWwpO1xuICAgIH1cblxuICAgIHJldHVybiB3aW5zdG9uLmxvZ2dlcnMuYWRkKGxhYmVsLCB7XG4gICAgICAgIGxldmVsOiBsZXZlbCA/PyBkZWZhdWx0TG9nZ2luZ0xldmVsLFxuICAgICAgICBmb3JtYXQ6IHdpbnN0b24uZm9ybWF0LmNvbWJpbmUoXG4gICAgICAgICAgICBjb3JyZWxhdGlvbklkRm9ybWF0KCksXG4gICAgICAgICAgICB3aW5zdG9uLmZvcm1hdC5sYWJlbCh7IGxhYmVsIH0pLFxuICAgICAgICAgICAgd2luc3Rvbi5mb3JtYXQudGltZXN0YW1wKCksXG4gICAgICAgICAgICBuZXdyZWxpY0Zvcm1hdHRlcigpXG4gICAgICAgICksXG4gICAgICAgIHRyYW5zcG9ydHM6IFsgZ2V0TmV3UmVsaWNMb2dUcmFuc3BvcnQoKSBhcyB3aW5zdG9uLnRyYW5zcG9ydCBdXG4gICAgfSk7XG59XG5cblxuY29uc3QgY3JlYXRlSnNvbkxvZ2dlciA9IChsYWJlbDogc3RyaW5nLCBsZXZlbD86IE5QTUxvZ2dpbmdMZXZlbHMpID0+IHtcbiAgICBcbiAgICByZXR1cm4gd2luc3Rvbi5sb2dnZXJzLmFkZChsYWJlbCwge1xuICAgICAgICBsZXZlbDogbGV2ZWwgPz8gZGVmYXVsdExvZ2dpbmdMZXZlbCxcbiAgICAgICAgZm9ybWF0OiB3aW5zdG9uLmZvcm1hdC5jb21iaW5lKFxuICAgICAgICAgICAgY29ycmVsYXRpb25JZEZvcm1hdCgpLFxuICAgICAgICAgICAgd2luc3Rvbi5mb3JtYXQubGFiZWwoeyBsYWJlbCB9KSxcbiAgICAgICAgICAgIHdpbnN0b24uZm9ybWF0LnRpbWVzdGFtcCgpLFxuICAgICAgICAgICAgbmV3cmVsaWNGb3JtYXR0ZXIoKVxuICAgICAgICApLFxuICAgICAgICB0cmFuc3BvcnRzOiBbIG5ldyB3aW5zdG9uLnRyYW5zcG9ydHMuQ29uc29sZSgpIF1cbiAgICB9KTtcbn1cblxuY29uc3QgY3JlYXRlU3RyaW5nTG9nZ2VyID0gKGxhYmVsOiBzdHJpbmcsIGxldmVsPzogTlBNTG9nZ2luZ0xldmVscykgPT4ge1xuICAgIHJldHVybiB3aW5zdG9uLmxvZ2dlcnMuYWRkKGxhYmVsLCB7XG4gICAgICAgIGxldmVsOiBsZXZlbCA/PyBkZWZhdWx0TG9nZ2luZ0xldmVsLFxuICAgICAgICBmb3JtYXQ6IHdpbnN0b24uZm9ybWF0LmNvbWJpbmUoXG4gICAgICAgICAgICBjb3JyZWxhdGlvbklkRm9ybWF0KCksXG4gICAgICAgICAgICB3aW5zdG9uLmZvcm1hdC5sYWJlbCh7IGxhYmVsIH0pLFxuICAgICAgICAgICAgd2luc3Rvbi5mb3JtYXQudGltZXN0YW1wKCksXG4gICAgICAgICAgICBzdGRvdXRGb3JtYXRcbiAgICAgICAgKSxcbiAgICAgICAgdHJhbnNwb3J0czogW1xuICAgICAgICAgICAgbmV3IHdpbnN0b24udHJhbnNwb3J0cy5Db25zb2xlKClcbiAgICAgICAgXVxuICAgIH0pO1xufVxuXG5jb25zdCBjcmVhdGVDb2xvclN0cmluZ0xvZ2dlciA9IChsYWJlbDogc3RyaW5nLCBsZXZlbD86IE5QTUxvZ2dpbmdMZXZlbHMpID0+IHtcbiAgICByZXR1cm4gd2luc3Rvbi5sb2dnZXJzLmFkZChsYWJlbCwge1xuICAgICAgICBsZXZlbDogbGV2ZWwgPz8gZGVmYXVsdExvZ2dpbmdMZXZlbCxcbiAgICAgICAgZm9ybWF0OiB3aW5zdG9uLmZvcm1hdC5jb21iaW5lKFxuICAgICAgICAgICAgY29ycmVsYXRpb25JZEZvcm1hdCgpLFxuICAgICAgICAgICAgd2luc3Rvbi5mb3JtYXQubGFiZWwoeyBsYWJlbCB9KSxcbiAgICAgICAgICAgIHdpbnN0b24uZm9ybWF0LnRpbWVzdGFtcCgpLFxuICAgICAgICAgICAgd2luc3Rvbi5mb3JtYXQuY29sb3JpemUoKSxcbiAgICAgICAgICAgIHN0ZG91dEZvcm1hdFxuICAgICAgICApLFxuICAgICAgICB0cmFuc3BvcnRzOiBbXG4gICAgICAgICAgICBuZXcgd2luc3Rvbi50cmFuc3BvcnRzLkNvbnNvbGUoKVxuICAgICAgICBdXG4gICAgfSk7XG59XG5cbmNvbnN0IGNyZWF0ZVNpbGVudExvZ2dlciA9IChsYWJlbDogc3RyaW5nLCBsZXZlbD86IE5QTUxvZ2dpbmdMZXZlbHMpID0+IHtcbiAgICByZXR1cm4gd2luc3Rvbi5sb2dnZXJzLmFkZChsYWJlbCwge1xuICAgICAgICBzaWxlbnQ6IHRydWUsXG4gICAgICAgIGxldmVsOiBsZXZlbCA/PyBkZWZhdWx0TG9nZ2luZ0xldmVsLFxuICAgICAgICB0cmFuc3BvcnRzOiBbXG4gICAgICAgICAgICBuZXcgd2luc3Rvbi50cmFuc3BvcnRzLkNvbnNvbGUoKVxuICAgICAgICBdXG4gICAgfSk7XG59XG5cbmNvbnN0IGxvZyA9IHdpdGhMb2dnZXIoJ2xvZ2dlcicpO1xubWVzc2FnZXMucHVzaChbJ2RlYnVnJywgJ0ludGVybmFsIGxvZ2dlciBpbml0aWFsaXplZCddKTtcbndoaWxlKG1lc3NhZ2VzLmxlbmd0aCA+IDApIHtcbiAgICBjb25zdCBbbGV2ZWwsIG1lc3NhZ2VdID0gbWVzc2FnZXMuc2hpZnQoKSBhcyBbTlBNTG9nZ2luZ0xldmVscywgc3RyaW5nXTtcbiAgICBsb2dbbGV2ZWxdKG1lc3NhZ2UpO1xufVxuIl19