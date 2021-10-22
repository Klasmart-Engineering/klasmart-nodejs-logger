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
  console.log(label);

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
  console.log(label);
  return _winston["default"].loggers.add(label, {
    level: level !== null && level !== void 0 ? level : defaultLoggingLevel,
    format: _winston["default"].format.combine(correlationIdFormat(), _winston["default"].format.label({
      label: label
    }), _winston["default"].format.timestamp(), (0, _winstonEnricher["default"])()),
    transports: [new _winston["default"].transports.Console(), new _newRelicLogForwarder.NewRelicLogTransport({}, {})]
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9sb2dnZXIudHMiXSwibmFtZXMiOlsibG9nU3R5bGVzIiwiZGVmYXVsdExvZ1N0eWxlIiwic3Rkb3V0Rm9ybWF0Iiwid2luc3RvbiIsImZvcm1hdCIsInByaW50ZiIsImxldmVsIiwibWVzc2FnZSIsImxhYmVsIiwidGltZXN0YW1wIiwiY29ycmVsYXRpb25JZEZvcm1hdCIsImluZm8iLCJjb3JyZWxhdGlvbklkIiwiZ2V0TG9nU3R5bGVPcHRpb24iLCJwcm9jZXNzIiwiZW52IiwiTE9HX1NUWUxFIiwiaW5jbHVkZXMiLCJ0b1VwcGVyQ2FzZSIsInRyaW0iLCJkZWZhdWx0TG9nZ2luZ0xldmVsIiwiTE9HX0xFVkVMIiwiTEVWRUwiLCJsb2dTdHlsZSIsIndpdGhMb2dnZXIiLCJjb25zb2xlIiwibG9nIiwiY3JlYXRlSnNvbkxvZ2dlciIsImNyZWF0ZVN0cmluZ0xvZ2dlciIsImNyZWF0ZUNvbG9yU3RyaW5nTG9nZ2VyIiwiY3JlYXRlU2lsZW50TG9nZ2VyIiwibG9nZ2VycyIsImFkZCIsImNvbWJpbmUiLCJ0cmFuc3BvcnRzIiwiQ29uc29sZSIsIk5ld1JlbGljTG9nVHJhbnNwb3J0IiwiY29sb3JpemUiLCJzaWxlbnQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBS0EsSUFBTUEsU0FBcUIsR0FBRyxDQUFDLGNBQUQsRUFBaUIsUUFBakIsRUFBMkIsTUFBM0IsRUFBbUMsUUFBbkMsQ0FBOUI7QUFDQSxJQUFNQyxlQUF5QixHQUFHRCxTQUFTLENBQUMsQ0FBRCxDQUEzQzs7QUFFQSxJQUFNRSxZQUFZLEdBQUdDLG9CQUFRQyxNQUFSLENBQWVDLE1BQWYsQ0FBc0IsZ0JBQTBDO0FBQUEsTUFBdkNDLEtBQXVDLFFBQXZDQSxLQUF1QztBQUFBLE1BQWhDQyxPQUFnQyxRQUFoQ0EsT0FBZ0M7QUFBQSxNQUF2QkMsS0FBdUIsUUFBdkJBLEtBQXVCO0FBQUEsTUFBaEJDLFNBQWdCLFFB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c0I7QUFTOUJnQyxJQUFBQSxVQUFVLEVBQUUsQ0FDUixJQUFJL0Isb0JBQVErQixVQUFSLENBQW1CQyxPQUF2QixFQURRO0FBVGtCLEdBQTNCLENBQVA7QUFhSCxDQWREOztBQWdCQSxJQUFNTCxrQkFBa0IsR0FBRyxTQUFyQkEsa0JBQXFCLENBQUN0QixLQUFELEVBQWdCRixLQUFoQixFQUE2QztBQUNwRSxTQUFPSCxvQkFBUTRCLE9BQVIsQ0FBZ0JDLEdBQWhCLENBQW9CeEIsS0FBcEIsRUFBMkI7QUFDOUI4QixJQUFBQSxNQUFNLEVBQUUsSUFEc0I7QUFFOUJoQyxJQUFBQSxLQUFLLEVBQUVBLEtBQUYsYUFBRUEsS0FBRixjQUFFQSxLQUFGLEdBQVdjLG1CQUZjO0FBRzlCYyxJQUFBQSxVQUFVLEVBQUUsQ0FDUixJQUFJL0Isb0JBQVErQixVQUFSLENBQW1CQyxPQUF2QixFQURRO0FBSGtCLEdBQTNCLENBQVA7QUFPSCxDQVJEOztBQVVBLElBQU1ULEdBQUcsR0FBR0YsVUFBVSxDQUFDLFFBQUQsQ0FBdEI7QUFDQUUsR0FBRyxDQUFDZixJQUFKLENBQVNKLE9BQVQ7QUFDQUoiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBAdHMtaWdub3JlXG5pbXBvcnQgbmV3cmVsaWNGb3JtYXR0ZXIgZnJvbSAnQG5ld3JlbGljL3dpbnN0b24tZW5yaWNoZXInO1xuaW1wb3J0IHdpbnN0b24sIHsgTG9nZ2VyIH0gZnJvbSAnd2luc3Rvbic7XG5pbXBvcnQgeyB3aXRoQ29ycmVsYXRpb24gfSBmcm9tICcuL2NvcnJlbGF0aW9uTWlkZGxld2FyZSc7XG5pbXBvcnQgeyBOZXdSZWxpY0xvZ1RyYW5zcG9ydCB9IGZyb20gJy4vbmV3UmVsaWNMb2dGb3J3YXJkZXInO1xuXG50eXBlIE5QTUxvZ2dpbmdMZXZlbHMgPSAnc2lsbHknIHwgJ2RlYnVnJyB8ICd2ZXJib3NlJyB8ICdodHRwJyB8ICdpbmZvJyB8ICd3YXJuJyB8ICdlcnJvcic7XG50eXBlIExvZ1N0eWxlID0gJ1NUUklOR19DT0xPUicgfCAnU1RSSU5HJyB8ICdKU09OJyB8ICdTSUxFTlQnO1xuXG5jb25zdCBsb2dTdHlsZXM6IExvZ1N0eWxlW10gPSBbJ1NUUklOR19DT0xPUicsICdTVFJJTkcnLCAnSlNPTicsICdTSUxFTlQnXTtcbmNvbnN0IGRlZmF1bHRMb2dTdHlsZTogTG9nU3R5bGUgPSBsb2dTdHlsZXNbMF07XG5cbmNvbnN0IHN0ZG91dEZvcm1hdCA9IHdpbnN0b24uZm9ybWF0LnByaW50ZigoeyBsZXZlbCwgbWVzc2FnZSwgbGFiZWwsIHRpbWVzdGFtcCB9KSA9PiB7XG4gICAgcmV0dXJuIGAke3RpbWVzdGFtcH0gWyR7bGFiZWx9XSAke2xldmVsfTogJHttZXNzYWdlfWBcbn0pXG5cbmNvbnN0IGNvcnJlbGF0aW9uSWRGb3JtYXQgPSB3aW5zdG9uLmZvcm1hdChpbmZvID0+IHtcbiAgICBpbmZvLmNvcnJlbGF0aW9uSWQgPSB3aXRoQ29ycmVsYXRpb24oKTtcbiAgICByZXR1cm4gaW5mbztcbn0pO1xuXG5jb25zdCBnZXRMb2dTdHlsZU9wdGlvbiA9ICgpOiBbTG9nU3R5bGUsIHN0cmluZ10gPT4ge1xuICAgIGlmICghcHJvY2Vzcy5lbnYuTE9HX1NUWUxFKSB7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICBkZWZhdWx0TG9nU3R5bGUsXG4gICAgICAgICAgICBgVXNpbmcgZGVmYXVsdCBsb2cgc3R5bGU6ICR7ZGVmYXVsdExvZ1N0eWxlfS4gT3ZlcnJpZGUgdGhpcyB1c2luZyB0aGUgTE9HX1NUWUxFIGVudmlyb25tZW50IHZhcmlhYmxlLiBWYWxpZCB2YWx1ZXMgYXJlOiAke2xvZ1N0eWxlc30uYF1cbiAgICB9XG5cbiAgICBpZiAobG9nU3R5bGVzLmluY2x1ZGVzKHByb2Nlc3MuZW52LkxPR19TVFlMRS50b1VwcGVyQ2FzZSgpLnRyaW0oKSBhcyBMb2dTdHlsZSkpIHtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIHByb2Nlc3MuZW52LkxPR19TVFlMRSBhcyBMb2dTdHlsZSxcbiAgICAgICAgICAgIGBVc2luZyBsb2cgc3R5bGU6ICR7cHJvY2Vzcy5lbnYuTE9HX1NUWUxFfWBcbiAgICAgICAgXTtcbiAgICB9XG5cbiAgICByZXR1cm4gW1xuICAgICAgICBkZWZhdWx0TG9nU3R5bGUsXG4gICAgICAgIGBVbnJlY29nbml6ZWQgbG9nIHN0eWxlOiAke3Byb2Nlc3MuZW52LkxPR19TVFlMRX0uIFVzaW5nIGRlZmF1bHQgbG9nIHN0eWxlOiAke2RlZmF1bHRMb2dTdHlsZX0uIFZhbGlkIGxvZyBzdHlsZXMgYXJlOiAke2xvZ1N0eWxlc31gXG4gICAgXVxufVxuXG5jb25zdCBkZWZhdWx0TG9nZ2luZ0xldmVsID0gcHJvY2Vzcy5lbnYuTE9HX0xFVkVMID8/IHByb2Nlc3MuZW52LkxFVkVMID8/ICdkZWJ1Zyc7XG5jb25zdCBbbG9nU3R5bGUsIG1lc3NhZ2VdID0gZ2V0TG9nU3R5bGVPcHRpb24oKTtcblxuZXhwb3J0IGNvbnN0IHdpdGhMb2dnZXIgPSAobGFiZWw6IHN0cmluZywgbGV2ZWw/OiBOUE1Mb2dnaW5nTGV2ZWxzKTogTG9nZ2VyID0+IHtcbiAgICBjb25zb2xlLmxvZyhsYWJlbCk7XG4gICAgc3dpdGNoKGxvZ1N0eWxlKSB7XG4gICAgICAgIGNhc2UgJ0pTT04nOiByZXR1cm4gY3JlYXRlSnNvbkxvZ2dlcihsYWJlbCwgbGV2ZWwpO1xuICAgICAgICBjYXNlICdTVFJJTkcnOiByZXR1cm4gY3JlYXRlU3RyaW5nTG9nZ2VyKGxhYmVsLCBsZXZlbCk7XG4gICAgICAgIGNhc2UgJ1NUUklOR19DT0xPUic6IHJldHVybiBjcmVhdGVDb2xvclN0cmluZ0xvZ2dlcihsYWJlbCwgbGV2ZWwpO1xuICAgICAgICBjYXNlICdTSUxFTlQnOiByZXR1cm4gY3JlYXRlU2lsZW50TG9nZ2VyKGxhYmVsLCBsZXZlbCk7XG4gICAgfVxufVxuXG5jb25zdCBjcmVhdGVKc29uTG9nZ2VyID0gKGxhYmVsOiBzdHJpbmcsIGxldmVsPzogTlBNTG9nZ2luZ0xldmVscykgPT4ge1xuICAgIGNvbnNvbGUubG9nKGxhYmVsKTtcbiAgICByZXR1cm4gd2luc3Rvbi5sb2dnZXJzLmFkZChsYWJlbCwge1xuICAgICAgICBsZXZlbDogbGV2ZWwgPz8gZGVmYXVsdExvZ2dpbmdMZXZlbCxcbiAgICAgICAgZm9ybWF0OiB3aW5zdG9uLmZvcm1hdC5jb21iaW5lKFxuICAgICAgICAgICAgY29ycmVsYXRpb25JZEZvcm1hdCgpLFxuICAgICAgICAgICAgd2luc3Rvbi5mb3JtYXQubGFiZWwoeyBsYWJlbCB9KSxcbiAgICAgICAgICAgIHdpbnN0b24uZm9ybWF0LnRpbWVzdGFtcCgpLFxuICAgICAgICAgICAgbmV3cmVsaWNGb3JtYXR0ZXIoKVxuICAgICAgICApLFxuICAgICAgICBcbiAgICAgICAgdHJhbnNwb3J0czogW1xuICAgICAgICAgICAgbmV3IHdpbnN0b24udHJhbnNwb3J0cy5Db25zb2xlKCksXG4gICAgICAgICAgICBuZXcgTmV3UmVsaWNMb2dUcmFuc3BvcnQoe30sIHt9KVxuICAgICAgICBdXG4gICAgfSk7XG59XG5cbmNvbnN0IGNyZWF0ZVN0cmluZ0xvZ2dlciA9IChsYWJlbDogc3RyaW5nLCBsZXZlbD86IE5QTUxvZ2dpbmdMZXZlbHMpID0+IHtcbiAgICByZXR1cm4gd2luc3Rvbi5sb2dnZXJzLmFkZChsYWJlbCwge1xuICAgICAgICBsZXZlbDogbGV2ZWwgPz8gZGVmYXVsdExvZ2dpbmdMZXZlbCxcbiAgICAgICAgZm9ybWF0OiB3aW5zdG9uLmZvcm1hdC5jb21iaW5lKFxuICAgICAgICAgICAgY29ycmVsYXRpb25JZEZvcm1hdCgpLFxuICAgICAgICAgICAgd2luc3Rvbi5mb3JtYXQubGFiZWwoeyBsYWJlbCB9KSxcbiAgICAgICAgICAgIHdpbnN0b24uZm9ybWF0LnRpbWVzdGFtcCgpLFxuICAgICAgICAgICAgc3Rkb3V0Rm9ybWF0XG4gICAgICAgICksXG4gICAgICAgIHRyYW5zcG9ydHM6IFtcbiAgICAgICAgICAgIG5ldyB3aW5zdG9uLnRyYW5zcG9ydHMuQ29uc29sZSgpXG4gICAgICAgIF1cbiAgICB9KTtcbn1cblxuY29uc3QgY3JlYXRlQ29sb3JTdHJpbmdMb2dnZXIgPSAobGFiZWw6IHN0cmluZywgbGV2ZWw/OiBOUE1Mb2dnaW5nTGV2ZWxzKSA9PiB7XG4gICAgcmV0dXJuIHdpbnN0b24ubG9nZ2Vycy5hZGQobGFiZWwsIHtcbiAgICAgICAgbGV2ZWw6IGxldmVsID8/IGRlZmF1bHRMb2dnaW5nTGV2ZWwsXG4gICAgICAgIGZvcm1hdDogd2luc3Rvbi5mb3JtYXQuY29tYmluZShcbiAgICAgICAgICAgIGNvcnJlbGF0aW9uSWRGb3JtYXQoKSxcbiAgICAgICAgICAgIHdpbnN0b24uZm9ybWF0LmxhYmVsKHsgbGFiZWwgfSksXG4gICAgICAgICAgICB3aW5zdG9uLmZvcm1hdC50aW1lc3RhbXAoKSxcbiAgICAgICAgICAgIHdpbnN0b24uZm9ybWF0LmNvbG9yaXplKCksXG4gICAgICAgICAgICBzdGRvdXRGb3JtYXRcbiAgICAgICAgKSxcbiAgICAgICAgdHJhbnNwb3J0czogW1xuICAgICAgICAgICAgbmV3IHdpbnN0b24udHJhbnNwb3J0cy5Db25zb2xlKClcbiAgICAgICAgXVxuICAgIH0pO1xufVxuXG5jb25zdCBjcmVhdGVTaWxlbnRMb2dnZXIgPSAobGFiZWw6IHN0cmluZywgbGV2ZWw/OiBOUE1Mb2dnaW5nTGV2ZWxzKSA9PiB7XG4gICAgcmV0dXJuIHdpbnN0b24ubG9nZ2Vycy5hZGQobGFiZWwsIHtcbiAgICAgICAgc2lsZW50OiB0cnVlLFxuICAgICAgICBsZXZlbDogbGV2ZWwgPz8gZGVmYXVsdExvZ2dpbmdMZXZlbCxcbiAgICAgICAgdHJhbnNwb3J0czogW1xuICAgICAgICAgICAgbmV3IHdpbnN0b24udHJhbnNwb3J0cy5Db25zb2xlKClcbiAgICAgICAgXVxuICAgIH0pO1xufVxuXG5jb25zdCBsb2cgPSB3aXRoTG9nZ2VyKCdsb2dnZXInKTtcbmxvZy5pbmZvKG1lc3NhZ2UpO1xud2luc3RvbiJdfQ==