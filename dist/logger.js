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
      newRelicLogTransport = new _newRelicLogForwarder.NewRelicLogTransport({}, {});
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
  return _winston["default"].loggers.add(label, {
    level: level !== null && level !== void 0 ? level : defaultLoggingLevel,
    format: _winston["default"].format.combine(correlationIdFormat(), _winston["default"].format.label({
      label: label
    }), _winston["default"].format.timestamp(), (0, _winstonEnricher["default"])()),
    transports: [new _winston["default"].transports.Console(), getNewRelicLogTransport()]
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9sb2dnZXIudHMiXSwibmFtZXMiOlsibG9nU3R5bGVzIiwiZGVmYXVsdExvZ1N0eWxlIiwic3Rkb3V0Rm9ybWF0Iiwid2luc3RvbiIsImZvcm1hdCIsInByaW50ZiIsImxldmVsIiwibWVzc2FnZSIsImxhYmVsIiwidGltZXN0YW1wIiwiY29ycmVsYXRpb25JZEZvcm1hdCIsImluZm8iLCJjb3JyZWxhdGlvbklkIiwiZ2V0TmV3UmVsaWNMb2dUcmFuc3BvcnQiLCJuZXdSZWxpY0xvZ1RyYW5zcG9ydCIsIk5ld1JlbGljTG9nVHJhbnNwb3J0IiwiZ2V0TG9nU3R5bGVPcHRpb24iLCJwcm9jZXNzIiwiZW52IiwiTE9HX1NUWUxFIiwiaW5jbHVkZXMiLCJ0b1VwcGVyQ2FzZSIsInRyaW0iLCJkZWZhdWx0TG9nZ2luZ0xldmVsIiwiTE9HX0xFVkVMIiwiTEVWRUwiLCJsb2dTdHlsZSIsIndpdGhMb2dnZXIiLCJjcmVhdGVKc29uTG9nZ2VyIiwiY3JlYXRlU3RyaW5nTG9nZ2VyIiwiY3JlYXRlQ29sb3JTdHJpbmdMb2dnZXIiLCJjcmVhdGVTaWxlbnRMb2dnZXIiLCJsb2dnZXJzIiwiYWRkIiwiY29tYmluZSIsInRyYW5zcG9ydHMiLCJDb25zb2xlIiwiY29sb3JpemUiLCJzaWxlbnQiLCJsb2ciXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBS0EsSUFBTUEsU0FBcUIsR0FBRyxDQUFDLGNBQUQsRUFBaUIsUUFBakIsRUFBMkIsTUFBM0IsRUFBbUMsUUFBbkMsQ0FBOUI7QUFDQSxJQUFNQyxlQUF5QixHQUFHRCxTQUFTLENBQUMsQ0FBRCxDQUEzQzs7QUFFQSxJQUFNRSxZQUFZLEdBQUdDLG9CQUFRQyxNQUFSLENBQWVDLE1BQWYsQ0FBc0IsZ0JBQTBDO0FBQUEsTUFBdkNDLEtBQXVDLFFBQXZDQSxLQUF1QztBQUFBLE1BQWhDQyxPQUFnQyxRQUFoQ0EsT0FBZ0M7QUFBQSxNQUF2QkMs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QUFSLENBQWVJLEtBQWYsQ0FBcUI7QUFBRUEsTUFBQUEsS0FBSyxFQUFMQTtBQUFGLEtBQXJCLENBRkksRUFHSkwsb0JBQVFDLE1BQVIsQ0FBZUssU0FBZixFQUhJLEVBSUpOLG9CQUFRQyxNQUFSLENBQWVpQyxRQUFmLEVBSkksRUFLSm5DLFlBTEksQ0FGc0I7QUFTOUJpQyxJQUFBQSxVQUFVLEVBQUUsQ0FDUixJQUFJaEMsb0JBQVFnQyxVQUFSLENBQW1CQyxPQUF2QixFQURRO0FBVGtCLEdBQTNCLENBQVA7QUFhSCxDQWREOztBQWdCQSxJQUFNTCxrQkFBa0IsR0FBRyxTQUFyQkEsa0JBQXFCLENBQUN2QixLQUFELEVBQWdCRixLQUFoQixFQUE2QztBQUNwRSxTQUFPSCxvQkFBUTZCLE9BQVIsQ0FBZ0JDLEdBQWhCLENBQW9CekIsS0FBcEIsRUFBMkI7QUFDOUI4QixJQUFBQSxNQUFNLEVBQUUsSUFEc0I7QUFFOUJoQyxJQUFBQSxLQUFLLEVBQUVBLEtBQUYsYUFBRUEsS0FBRixjQUFFQSxLQUFGLEdBQVdpQixtQkFGYztBQUc5QlksSUFBQUEsVUFBVSxFQUFFLENBQ1IsSUFBSWhDLG9CQUFRZ0MsVUFBUixDQUFtQkMsT0FBdkIsRUFEUTtBQUhrQixHQUEzQixDQUFQO0FBT0gsQ0FSRDs7QUFVQSxJQUFNRyxHQUFHLEdBQUdaLFVBQVUsQ0FBQyxRQUFELENBQXRCO0FBQ0FZLEdBQUcsQ0FBQzVCLElBQUosQ0FBU0osT0FBVDtBQUNBSiIsInNvdXJjZXNDb250ZW50IjpbIi8vIEB0cy1pZ25vcmVcbmltcG9ydCBuZXdyZWxpY0Zvcm1hdHRlciBmcm9tICdAbmV3cmVsaWMvd2luc3Rvbi1lbnJpY2hlcic7XG5pbXBvcnQgd2luc3RvbiwgeyBMb2dnZXIgfSBmcm9tICd3aW5zdG9uJztcbmltcG9ydCB7IHdpdGhDb3JyZWxhdGlvbiB9IGZyb20gJy4vY29ycmVsYXRpb25NaWRkbGV3YXJlJztcbmltcG9ydCB7IE5ld1JlbGljTG9nVHJhbnNwb3J0IH0gZnJvbSAnLi9uZXdSZWxpY0xvZ0ZvcndhcmRlcic7XG5cbnR5cGUgTlBNTG9nZ2luZ0xldmVscyA9ICdzaWxseScgfCAnZGVidWcnIHwgJ3ZlcmJvc2UnIHwgJ2h0dHAnIHwgJ2luZm8nIHwgJ3dhcm4nIHwgJ2Vycm9yJztcbnR5cGUgTG9nU3R5bGUgPSAnU1RSSU5HX0NPTE9SJyB8ICdTVFJJTkcnIHwgJ0pTT04nIHwgJ1NJTEVOVCc7XG5cbmNvbnN0IGxvZ1N0eWxlczogTG9nU3R5bGVbXSA9IFsnU1RSSU5HX0NPTE9SJywgJ1NUUklORycsICdKU09OJywgJ1NJTEVOVCddO1xuY29uc3QgZGVmYXVsdExvZ1N0eWxlOiBMb2dTdHlsZSA9IGxvZ1N0eWxlc1swXTtcblxuY29uc3Qgc3Rkb3V0Rm9ybWF0ID0gd2luc3Rvbi5mb3JtYXQucHJpbnRmKCh7IGxldmVsLCBtZXNzYWdlLCBsYWJlbCwgdGltZXN0YW1wIH0pID0+IHtcbiAgICByZXR1cm4gYCR7dGltZXN0YW1wfSBbJHtsYWJlbH1dICR7bGV2ZWx9OiAke21lc3NhZ2V9YFxufSlcblxuY29uc3QgY29ycmVsYXRpb25JZEZvcm1hdCA9IHdpbnN0b24uZm9ybWF0KGluZm8gPT4ge1xuICAgIGluZm8uY29ycmVsYXRpb25JZCA9IHdpdGhDb3JyZWxhdGlvbigpO1xuICAgIHJldHVybiBpbmZvO1xufSk7XG5cbmNvbnN0IGdldE5ld1JlbGljTG9nVHJhbnNwb3J0OiAoKSA9PiBOZXdSZWxpY0xvZ1RyYW5zcG9ydCA9ICgoKSA9PiB7XG4gICAgbGV0IG5ld1JlbGljTG9nVHJhbnNwb3J0OiB1bmRlZmluZWQgfCBOZXdSZWxpY0xvZ1RyYW5zcG9ydDtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICBpZighbmV3UmVsaWNMb2dUcmFuc3BvcnQpIHtcbiAgICAgICAgICAgIG5ld1JlbGljTG9nVHJhbnNwb3J0ID0gbmV3IE5ld1JlbGljTG9nVHJhbnNwb3J0KHt9LHt9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3UmVsaWNMb2dUcmFuc3BvcnQ7XG4gICAgfVxuXG59KSgpO1xuXG5jb25zdCBnZXRMb2dTdHlsZU9wdGlvbiA9ICgpOiBbTG9nU3R5bGUsIHN0cmluZ10gPT4ge1xuICAgIGlmICghcHJvY2Vzcy5lbnYuTE9HX1NUWUxFKSB7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICBkZWZhdWx0TG9nU3R5bGUsXG4gICAgICAgICAgICBgVXNpbmcgZGVmYXVsdCBsb2cgc3R5bGU6ICR7ZGVmYXVsdExvZ1N0eWxlfS4gT3ZlcnJpZGUgdGhpcyB1c2luZyB0aGUgTE9HX1NUWUxFIGVudmlyb25tZW50IHZhcmlhYmxlLiBWYWxpZCB2YWx1ZXMgYXJlOiAke2xvZ1N0eWxlc30uYF1cbiAgICB9XG5cbiAgICBpZiAobG9nU3R5bGVzLmluY2x1ZGVzKHByb2Nlc3MuZW52LkxPR19TVFlMRS50b1VwcGVyQ2FzZSgpLnRyaW0oKSBhcyBMb2dTdHlsZSkpIHtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIHByb2Nlc3MuZW52LkxPR19TVFlMRSBhcyBMb2dTdHlsZSxcbiAgICAgICAgICAgIGBVc2luZyBsb2cgc3R5bGU6ICR7cHJvY2Vzcy5lbnYuTE9HX1NUWUxFfWBcbiAgICAgICAgXTtcbiAgICB9XG5cbiAgICByZXR1cm4gW1xuICAgICAgICBkZWZhdWx0TG9nU3R5bGUsXG4gICAgICAgIGBVbnJlY29nbml6ZWQgbG9nIHN0eWxlOiAke3Byb2Nlc3MuZW52LkxPR19TVFlMRX0uIFVzaW5nIGRlZmF1bHQgbG9nIHN0eWxlOiAke2RlZmF1bHRMb2dTdHlsZX0uIFZhbGlkIGxvZyBzdHlsZXMgYXJlOiAke2xvZ1N0eWxlc31gXG4gICAgXVxufVxuXG5jb25zdCBkZWZhdWx0TG9nZ2luZ0xldmVsID0gcHJvY2Vzcy5lbnYuTE9HX0xFVkVMID8/IHByb2Nlc3MuZW52LkxFVkVMID8/ICdkZWJ1Zyc7XG5jb25zdCBbbG9nU3R5bGUsIG1lc3NhZ2VdID0gZ2V0TG9nU3R5bGVPcHRpb24oKTtcblxuZXhwb3J0IGNvbnN0IHdpdGhMb2dnZXIgPSAobGFiZWw6IHN0cmluZywgbGV2ZWw/OiBOUE1Mb2dnaW5nTGV2ZWxzKTogTG9nZ2VyID0+IHtcbiAgICBzd2l0Y2gobG9nU3R5bGUpIHtcbiAgICAgICAgY2FzZSAnSlNPTic6IHJldHVybiBjcmVhdGVKc29uTG9nZ2VyKGxhYmVsLCBsZXZlbCk7XG4gICAgICAgIGNhc2UgJ1NUUklORyc6IHJldHVybiBjcmVhdGVTdHJpbmdMb2dnZXIobGFiZWwsIGxldmVsKTtcbiAgICAgICAgY2FzZSAnU1RSSU5HX0NPTE9SJzogcmV0dXJuIGNyZWF0ZUNvbG9yU3RyaW5nTG9nZ2VyKGxhYmVsLCBsZXZlbCk7XG4gICAgICAgIGNhc2UgJ1NJTEVOVCc6IHJldHVybiBjcmVhdGVTaWxlbnRMb2dnZXIobGFiZWwsIGxldmVsKTtcbiAgICB9XG59XG5cbmNvbnN0IGNyZWF0ZUpzb25Mb2dnZXIgPSAobGFiZWw6IHN0cmluZywgbGV2ZWw/OiBOUE1Mb2dnaW5nTGV2ZWxzKSA9PiB7XG4gICAgcmV0dXJuIHdpbnN0b24ubG9nZ2Vycy5hZGQobGFiZWwsIHtcbiAgICAgICAgbGV2ZWw6IGxldmVsID8/IGRlZmF1bHRMb2dnaW5nTGV2ZWwsXG4gICAgICAgIGZvcm1hdDogd2luc3Rvbi5mb3JtYXQuY29tYmluZShcbiAgICAgICAgICAgIGNvcnJlbGF0aW9uSWRGb3JtYXQoKSxcbiAgICAgICAgICAgIHdpbnN0b24uZm9ybWF0LmxhYmVsKHsgbGFiZWwgfSksXG4gICAgICAgICAgICB3aW5zdG9uLmZvcm1hdC50aW1lc3RhbXAoKSxcbiAgICAgICAgICAgIG5ld3JlbGljRm9ybWF0dGVyKClcbiAgICAgICAgKSxcbiAgICAgICAgXG4gICAgICAgIHRyYW5zcG9ydHM6IFtcbiAgICAgICAgICAgIG5ldyB3aW5zdG9uLnRyYW5zcG9ydHMuQ29uc29sZSgpLFxuICAgICAgICAgICAgZ2V0TmV3UmVsaWNMb2dUcmFuc3BvcnQoKVxuICAgICAgICBdXG4gICAgfSk7XG59XG5cbmNvbnN0IGNyZWF0ZVN0cmluZ0xvZ2dlciA9IChsYWJlbDogc3RyaW5nLCBsZXZlbD86IE5QTUxvZ2dpbmdMZXZlbHMpID0+IHtcbiAgICByZXR1cm4gd2luc3Rvbi5sb2dnZXJzLmFkZChsYWJlbCwge1xuICAgICAgICBsZXZlbDogbGV2ZWwgPz8gZGVmYXVsdExvZ2dpbmdMZXZlbCxcbiAgICAgICAgZm9ybWF0OiB3aW5zdG9uLmZvcm1hdC5jb21iaW5lKFxuICAgICAgICAgICAgY29ycmVsYXRpb25JZEZvcm1hdCgpLFxuICAgICAgICAgICAgd2luc3Rvbi5mb3JtYXQubGFiZWwoeyBsYWJlbCB9KSxcbiAgICAgICAgICAgIHdpbnN0b24uZm9ybWF0LnRpbWVzdGFtcCgpLFxuICAgICAgICAgICAgc3Rkb3V0Rm9ybWF0XG4gICAgICAgICksXG4gICAgICAgIHRyYW5zcG9ydHM6IFtcbiAgICAgICAgICAgIG5ldyB3aW5zdG9uLnRyYW5zcG9ydHMuQ29uc29sZSgpXG4gICAgICAgIF1cbiAgICB9KTtcbn1cblxuY29uc3QgY3JlYXRlQ29sb3JTdHJpbmdMb2dnZXIgPSAobGFiZWw6IHN0cmluZywgbGV2ZWw/OiBOUE1Mb2dnaW5nTGV2ZWxzKSA9PiB7XG4gICAgcmV0dXJuIHdpbnN0b24ubG9nZ2Vycy5hZGQobGFiZWwsIHtcbiAgICAgICAgbGV2ZWw6IGxldmVsID8/IGRlZmF1bHRMb2dnaW5nTGV2ZWwsXG4gICAgICAgIGZvcm1hdDogd2luc3Rvbi5mb3JtYXQuY29tYmluZShcbiAgICAgICAgICAgIGNvcnJlbGF0aW9uSWRGb3JtYXQoKSxcbiAgICAgICAgICAgIHdpbnN0b24uZm9ybWF0LmxhYmVsKHsgbGFiZWwgfSksXG4gICAgICAgICAgICB3aW5zdG9uLmZvcm1hdC50aW1lc3RhbXAoKSxcbiAgICAgICAgICAgIHdpbnN0b24uZm9ybWF0LmNvbG9yaXplKCksXG4gICAgICAgICAgICBzdGRvdXRGb3JtYXRcbiAgICAgICAgKSxcbiAgICAgICAgdHJhbnNwb3J0czogW1xuICAgICAgICAgICAgbmV3IHdpbnN0b24udHJhbnNwb3J0cy5Db25zb2xlKClcbiAgICAgICAgXVxuICAgIH0pO1xufVxuXG5jb25zdCBjcmVhdGVTaWxlbnRMb2dnZXIgPSAobGFiZWw6IHN0cmluZywgbGV2ZWw/OiBOUE1Mb2dnaW5nTGV2ZWxzKSA9PiB7XG4gICAgcmV0dXJuIHdpbnN0b24ubG9nZ2Vycy5hZGQobGFiZWwsIHtcbiAgICAgICAgc2lsZW50OiB0cnVlLFxuICAgICAgICBsZXZlbDogbGV2ZWwgPz8gZGVmYXVsdExvZ2dpbmdMZXZlbCxcbiAgICAgICAgdHJhbnNwb3J0czogW1xuICAgICAgICAgICAgbmV3IHdpbnN0b24udHJhbnNwb3J0cy5Db25zb2xlKClcbiAgICAgICAgXVxuICAgIH0pO1xufVxuXG5jb25zdCBsb2cgPSB3aXRoTG9nZ2VyKCdsb2dnZXInKTtcbmxvZy5pbmZvKG1lc3NhZ2UpO1xud2luc3RvbiJdfQ==