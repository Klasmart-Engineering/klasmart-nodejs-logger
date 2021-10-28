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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9sb2dnZXIudHMiXSwibmFtZXMiOlsibG9nU3R5bGVzIiwiZGVmYXVsdExvZ1N0eWxlIiwic3Rkb3V0Rm9ybWF0Iiwid2luc3RvbiIsImZvcm1hdCIsInByaW50ZiIsImxldmVsIiwibWVzc2FnZSIsImxhYmVsIiwidGltZXN0YW1wIiwiY29ycmVsYXRpb25JZEZvcm1hdCIsImluZm8iLCJjb3JyZWxhdGlvbklkIiwiZ2V0TmV3UmVsaWNMb2dUcmFuc3BvcnQiLCJtZXNzYWdlcyIsInB1c2giLCJpbnN0YW5jZSIsIk5ld1JlbGljTG9nRGVsaXZlcnlBZ2VudCIsImdldEluc3RhbmNlIiwiZ2V0TG9nVHJhbnNwb3J0IiwidHJhbnNwb3J0IiwiaW5pdGlhbGl6ZSIsImdldExvZ1N0eWxlT3B0aW9uIiwicHJvY2VzcyIsImVudiIsIkxPR19TVFlMRSIsImluY2x1ZGVzIiwidG9VcHBlckNhc2UiLCJ0cmltIiwiZGVmYXVsdExvZ2dpbmdMZXZlbCIsIkxPR19MRVZFTCIsIkxFVkVMIiwibG9nU3R5bGUiLCJ3aXRoTG9nZ2VyIiwiY3JlYXRlSnNvbkxvZ2dlciIsImNyZWF0ZVN0cmluZ0xvZ2dlciIsImNyZWF0ZUNvbG9yU3RyaW5nTG9nZ2VyIiwiY3JlYXRlU2lsZW50TG9nZ2VyIiwiY3JlYXRlTmV3UmVsaWNMb2dnZXIiLCJORVdfUkVMSUNfTElDRU5TRV9LRVkiLCJsb2dnZXJzIiwiYWRkIiwiY29tYmluZSIsInRyYW5zcG9ydHMiLCJDb25zb2xlIiwiY29sb3JpemUiLCJzaWxlbnQiLCJsb2ciLCJsZW5ndGgiLCJzaGlmdCJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUNBOztBQUNBOztBQUNBOztBQUVBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFLQTtBQUNBLElBQU1BLFNBQXFCLEdBQUcsQ0FBQyxjQUFELEVBQWlCLFFBQWpCLEVBQTJCLE1BQTNCLEVBQW1DLFFBQW5DLEVBQTZDLFdBQTdDLENBQTlCO0FBQ0EsSUFBTUMsZUFBeUIsR0FBR0QsU0FBUyxDQUFDLENBQUQsQ0FBM0M7O0FBRUEsSUFBTUUsWUFBWSxHQUFHQyxvQkFBUUMsTUFBUixDQUFlQyxNQUFmLENBQXNCLGdCQUEwQztBQUFBLE1BQXZDQyxLQUF1QyxRQUF2Q0EsS0FBdUM7QUFBQSxNQUFoQ0MsT0FBZ0MsUUFBaENBLE9BQWdDO0FBQUEsTUFBdkJDLEtBQXVCLFFBQXZCQSxLQUF1QjtBQUFBLE1BQWhCQyxTQUFnQixRQUFoQkEsU0FBZ0I7QUFDakYsbUJBQVVBLFNBQVYsZUFBd0JELEtBQXhCLGVBQWtDRixLQUFsQyxlQUE0Q0MsT0FBNUM7QUFDSCxDQUZvQixDQUFyQjs7QUFJQSxJQUFNRyxtQkFBbUIsR0FBR1Asb0JBQVFDLE1BQVIsQ0FBZSxVQUFBTyxJQUFJLEVBQUk7QUFDL0NBLEVBQUFBLElBQUksQ0FBQ0MsYUFBTCxHQUFxQiw2Q0FBckI7QUFDQSxTQUFPRCxJQUFQO0FBQ0gsQ0FIMkIsQ0FBNUI7O0FBS0EsSUFBTUUsdUJBQStELEdBQUcsU0FBbEVBLHVCQUFrRSxHQUFNO0FBQUE7O0FBQzFFQyxFQUFBQSxRQUFRLENBQUNDLElBQVQsQ0FBYyxDQUFDLE9BQUQsRUFBVSwyREFBVixDQUFkOztBQUNBLE1BQUlDLFFBQVEsR0FBR0MsMkNBQXlCQyxXQUF6QixFQUFmOztBQUNBLE1BQUlGLFFBQUosRUFBYztBQUNWLFdBQU9BLFFBQVEsQ0FBQ0csZUFBVCxFQUFQO0FBQ0g7O0FBQ0RMLEVBQUFBLFFBQVEsQ0FBQ0MsSUFBVCxDQUFjLENBQUMsT0FBRCxFQUFVLDREQUFWLENBQWQ7QUFDQSxNQUFNSyxTQUFTLDRCQUFHSCwyQ0FBeUJJLFVBQXpCLEVBQUgsMERBQUcsc0JBQXVDRixlQUF2QyxFQUFsQjtBQUNBTCxFQUFBQSxRQUFRLENBQUNDLElBQVQsQ0FBYyxDQUFDLE9BQUQsc0JBQWQ7QUFDQSxTQUFPSyxTQUFQO0FBQ0gsQ0FWRDs7QUFZQSxJQUFNRSxpQkFBaUIsR0FBRyxTQUFwQkEsaUJBQW9CLEdBQTBCO0FBQ2hELE1BQUksQ0FBQ0MsT0FBTyxDQUFDQyxHQUFSLENBQVlDLFNBQWpCLEVBQTRCO0FBQ3hCLFdBQU8sQ0FDSHhCLGVBREcscUNBRXlCQSxlQUZ6Qix5RkFFdUhELFNBRnZILE9BQVA7QUFHSDs7QUFFRCxNQUFJQSxTQUFTLENBQUMwQixRQUFWLENBQW1CSCxPQUFPLENBQUNDLEdBQVIsQ0FBWUMsU0FBWixDQUFzQkUsV0FBdEIsR0FBb0NDLElBQXBDLEVBQW5CLENBQUosRUFBZ0Y7QUFDNUUsV0FBTyxDQUNITCxPQUFPLENBQUNDLEdBQVIsQ0FBWUMsU0FEVCw2QkFFaUJGLE9BQU8sQ0FBQ0MsR0FBUixDQUFZQyxTQUY3QixFQUFQO0FBSUg7O0FBRUQsU0FBTyxDQUNIeEIsZUFERyxvQ0FFd0JzQixPQUFPLENBQUNDLEdBQVIsQ0FBWUMsU0FGcEMsd0NBRTJFeEIsZUFGM0UscUNBRXFIRCxTQUZySCxFQUFQO0FBSUgsQ0FsQkQ7O0FBb0JBLElBQU02QixtQkFBbUIscUNBQUdOLE9BQU8sQ0FBQ0MsR0FBUixDQUFZTSxTQUFmLHlFQUE0QlAsT0FBTyxDQUFDQyxHQUFSLENBQVlPLEtBQXhDLHlDQUFpRCxPQUExRTtBQUNBLElBQU1qQixRQUFzQyxHQUFHLEVBQS9DOztBQUNBLHlCQUE0QlEsaUJBQWlCLEVBQTdDO0FBQUE7QUFBQSxJQUFPVSxRQUFQO0FBQUEsSUFBaUJ6QixPQUFqQjs7QUFDQU8sUUFBUSxDQUFDQyxJQUFULENBQWMsQ0FBQyxNQUFELEVBQVNSLE9BQVQsQ0FBZDs7QUFDTyxJQUFNMEIsVUFBVSxHQUFHLFNBQWJBLFVBQWEsQ0FBQ3pCLEtBQUQsRUFBZ0JGLEtBQWhCLEVBQXFEO0FBQzNFLFVBQU8wQixRQUFQO0FBQ0ksU0FBSyxNQUFMO0FBQXdCLGFBQU9FLGdCQUFnQixDQUFDMUIsS0FBRCxFQUFRRixLQUFSLENBQXZCOztBQUN4QixTQUFLLFFBQUw7QUFBd0IsYUFBTzZCLGtCQUFrQixDQUFDM0IsS0FBRCxFQUFRRixLQUFSLENBQXpCOztBQUN4QixTQUFLLGNBQUw7QUFBd0IsYUFBTzhCLHVCQUF1QixDQUFDNUIsS0FBRCxFQUFRRixLQUFSLENBQTlCOztBQUN4QixTQUFLLFFBQUw7QUFBd0IsYUFBTytCLGtCQUFrQixDQUFDN0IsS0FBRCxFQUFRRixLQUFSLENBQXpCOztBQUN4QixTQUFLLFdBQUw7QUFBd0IsYUFBT2dDLG9CQUFvQixDQUFDOUIsS0FBRCxFQUFRRixLQUFSLENBQTNCO0FBTDVCO0FBT0gsQ0FSTTs7OztBQVVQLElBQU1nQyxvQkFBb0IsR0FBRyxTQUF2QkEsb0JBQXVCLENBQUM5QixLQUFELEVBQWdCRixLQUFoQixFQUE2QztBQUN0RSxNQUFJLENBQUNpQixPQUFPLENBQUNDLEdBQVIsQ0FBWWUscUJBQWpCLEVBQXdDO0FBQ3BDekIsSUFBQUEsUUFBUSxDQUFDQyxJQUFULENBQWMsQ0FBQyxNQUFELEVBQVMsMkdBQVQsQ0FBZDtBQUNBLFdBQU9tQixnQkFBZ0IsQ0FBQzFCLEtBQUQsRUFBT0YsS0FBUCxDQUF2QjtBQUNIOztBQUVELFNBQU9ILG9CQUFRcUMsT0FBUixDQUFnQkMsR0FBaEIsQ0FBb0JqQyxLQUFwQixFQUEyQjtBQUM5QkYsSUFBQUEsS0FBSyxFQUFFQSxLQUFGLGFBQUVBLEtBQUYsY0FBRUEsS0FBRixHQUFXdUIsbUJBRGM7QUFFOUJ6QixJQUFBQSxNQUFNLEVBQUVELG9CQUFRQyxNQUFSLENBQWVzQyxPQUFmLENBQ0poQyxtQkFBbUIsRUFEZixFQUVKUCxvQkFBUUMsTUFBUixDQUFlSSxLQUFmLENBQXFCO0FBQUVBLE1BQUFBLEtBQUssRUFBTEE7QUFBRixLQUFyQixDQUZJLEVBR0pMLG9CQUFRQyxNQUFSLENBQWVLLFNBQWYsRUFISSxFQUlKLGtDQUpJLENBRnNCO0FBUTlCa0MsSUFBQUEsVUFBVSxFQUFFLENBQUU5Qix1QkFBdUIsRUFBekI7QUFSa0IsR0FBM0IsQ0FBUDtBQVVILENBaEJEOztBQW1CQSxJQUFNcUIsZ0JBQWdCLEdBQUcsU0FBbkJBLGdCQUFtQixDQUFDMUIsS0FBRCxFQUFnQkYsS0FBaEIsRUFBNkM7QUFFbEUsU0FBT0gsb0JBQVFxQyxPQUFSLENBQWdCQyxHQUFoQixDQUFvQmpDLEtBQXBCLEVBQTJCO0FBQzlCRixJQUFBQSxLQUFLLEVBQUVBLEtBQUYsYUFBRUEsS0FBRixjQUFFQSxLQUFGLEdBQVd1QixtQkFEYztBQUU5QnpCLElBQUFBLE1BQU0sRUFBRUQsb0JBQVFDLE1BQVIsQ0FBZXNDLE9BQWYsQ0FDSmhDLG1CQUFtQixFQURmLEVBRUpQLG9CQUFRQyxNQUFSLENBQWVJLEtBQWYsQ0FBcUI7QUFBRUEsTUFBQUEsS0FBSyxFQUFMQTtBQUFGLEtBQXJCLENBRkksRUFHSkwsb0JBQVFDLE1BQVIsQ0FBZUssU0FBZixFQUhJLEVBSUosa0NBSkksQ0FGc0I7QUFROUJrQyxJQUFBQSxVQUFVLEVBQUUsQ0FBRSxJQUFJeEMsb0JBQVF3QyxVQUFSLENBQW1CQyxPQUF2QixFQUFGO0FBUmtCLEdBQTNCLENBQVA7QUFVSCxDQVpEOztBQWNBLElBQU1ULGtCQUFrQixHQUFHLFNBQXJCQSxrQkFBcUIsQ0FBQzNCLEtBQUQsRUFBZ0JGLEtBQWhCLEVBQTZDO0FBQ3BFLFNBQU9ILG9CQUFRcUMsT0FBUixDQUFnQkMsR0FBaEIsQ0FBb0JqQyxLQUFwQixFQUEyQjtBQUM5QkYsSUFBQUEsS0FBSyxFQUFFQSxLQUFGLGFBQUVBLEtBQUYsY0FBRUEsS0FBRixHQUFXdUIsbUJBRGM7QUFFOUJ6QixJQUFBQSxNQUFNLEVBQUVELG9CQUFRQyxNQUFSLENBQWVzQyxPQUFmLENBQ0poQyxtQkFBbUIsRUFEZixFQUVKUCxvQkFBUUMsTUFBUixDQUFlSSxLQUFmLENBQXFCO0FBQUVBLE1BQUFBLEtBQUssRUFBTEE7QUFBRixLQUFyQixDQUZJLEVBR0pMLG9CQUFRQyxNQUFSLENBQWVLLFNBQWYsRUFISSxFQUlKUCxZQUpJLENBRnNCO0FBUTlCeUMsSUFBQUEsVUFBVSxFQUFFLENBQ1IsSUFBSXhDLG9CQUFRd0MsVUFBUixDQUFtQkMsT0FBdkIsRUFEUTtBQVJrQixHQUEzQixDQUFQO0FBWUgsQ0FiRDs7QUFlQSxJQUFNUix1QkFBdUIsR0FBRyxTQUExQkEsdUJBQTBCLENBQUM1QixLQUFELEVBQWdCRixLQUFoQixFQUE2QztBQUN6RSxTQUFPSCxvQkFBUXFDLE9BQVIsQ0FBZ0JDLEdBQWhCLENBQW9CakMsS0FBcEIsRUFBMkI7QUFDOUJGLElBQUFBLEtBQUssRUFBRUEsS0FBRixhQUFFQSxLQUFGLGNBQUVBLEtBQUYsR0FBV3VCLG1CQURjO0FBRTlCekIsSUFBQUEsTUFBTSxFQUFFRCxvQkFBUUMsTUFBUixDQUFlc0MsT0FBZixDQUNKaEMsbUJBQW1CLEVBRGYsRUFFSlAsb0JBQVFDLE1BQVIsQ0FBZUksS0FBZixDQUFxQjtBQUFFQSxNQUFBQSxLQUFLLEVBQUxBO0FBQUYsS0FBckIsQ0FGSSxFQUdKTCxvQkFBUUMsTUFBUixDQUFlSyxTQUFmLEVBSEksRUFJSk4sb0JBQVFDLE1BQVIsQ0FBZXlDLFFBQWYsRUFKSSxFQUtKM0MsWUFMSSxDQUZzQjtBQVM5QnlDLElBQUFBLFVBQVUsRUFBRSxDQUNSLElBQUl4QyxvQkFBUXdDLFVBQVIsQ0FBbUJDLE9BQXZCLEVBRFE7QUFUa0IsR0FBM0IsQ0FBUDtBQWFILENBZEQ7O0FBZ0JBLElBQU1QLGtCQUFrQixHQUFHLFNBQXJCQSxrQkFBcUIsQ0FBQzdCLEtBQUQsRUFBZ0JGLEtBQWhCLEVBQTZDO0FBQ3BFLFNBQU9ILG9CQUFRcUMsT0FBUixDQUFnQkMsR0FBaEIsQ0FBb0JqQyxLQUFwQixFQUEyQjtBQUM5QnNDLElBQUFBLE1BQU0sRUFBRSxJQURzQjtBQUU5QnhDLElBQUFBLEtBQUssRUFBRUEsS0FBRixhQUFFQSxLQUFGLGNBQUVBLEtBQUYsR0FBV3VCLG1CQUZjO0FBRzlCYyxJQUFBQSxVQUFVLEVBQUUsQ0FDUixJQUFJeEMsb0JBQVF3QyxVQUFSLENBQW1CQyxPQUF2QixFQURRO0FBSGtCLEdBQTNCLENBQVA7QUFPSCxDQVJEOztBQVVBLElBQU1HLEdBQUcsR0FBR2QsVUFBVSxDQUFDLFFBQUQsQ0FBdEI7QUFDQW5CLFFBQVEsQ0FBQ0MsSUFBVCxDQUFjLENBQUMsT0FBRCxFQUFVLDZCQUFWLENBQWQ7O0FBQ0EsT0FBTUQsUUFBUSxDQUFDa0MsTUFBVCxHQUFrQixDQUF4QixFQUEyQjtBQUN2QixjQUF5QmxDLFFBQVEsQ0FBQ21DLEtBQVQsRUFBekI7QUFBQTtBQUFBLE1BQU8zQyxLQUFQO0FBQUEsTUFBY0MsUUFBZDs7QUFDQXdDLEVBQUFBLEdBQUcsQ0FBQ3pDLEtBQUQsQ0FBSCxDQUFXQyxRQUFYO0FBQ0giLCJzb3VyY2VzQ29udGVudCI6WyIvLyBAdHMtaWdub3JlXG5pbXBvcnQgbmV3cmVsaWNGb3JtYXR0ZXIgZnJvbSAnQG5ld3JlbGljL3dpbnN0b24tZW5yaWNoZXInO1xuaW1wb3J0IHdpbnN0b24sIHsgTG9nZ2VyIH0gZnJvbSAnd2luc3Rvbic7XG5pbXBvcnQgeyB3aXRoQ29ycmVsYXRpb24gfSBmcm9tICcuL2NvcnJlbGF0aW9uLW1pZGRsZXdhcmUnO1xuaW1wb3J0IHsgTmV3UmVsaWNMb2dUcmFuc3BvcnQgfSBmcm9tICcuL05ld1JlbGljTG9nVHJhbnNwb3J0JztcbmltcG9ydCB7IE5ld1JlbGljTG9nRGVsaXZlcnlBZ2VudCB9IGZyb20gJy4vTG9nRGVsaXZlcnlBZ2VudCc7XG5cbmV4cG9ydCB0eXBlIE5QTUxvZ2dpbmdMZXZlbHMgPSAnc2lsbHknIHwgJ2RlYnVnJyB8ICd2ZXJib3NlJyB8ICdodHRwJyB8ICdpbmZvJyB8ICd3YXJuJyB8ICdlcnJvcic7XG50eXBlIExvZ1N0eWxlID0gJ1NUUklOR19DT0xPUicgfCAnU1RSSU5HJyB8ICdKU09OJyB8ICdTSUxFTlQnIHwgJ05FV19SRUxJQyc7XG5cbi8vIFF1ZXVlIGZvciBsb2dzIHByaW9yIHRvIGxvZ2dlciBjcmVhdGlvblxuY29uc3QgbG9nU3R5bGVzOiBMb2dTdHlsZVtdID0gWydTVFJJTkdfQ09MT1InLCAnU1RSSU5HJywgJ0pTT04nLCAnU0lMRU5UJywgJ05FV19SRUxJQyddO1xuY29uc3QgZGVmYXVsdExvZ1N0eWxlOiBMb2dTdHlsZSA9IGxvZ1N0eWxlc1swXTtcblxuY29uc3Qgc3Rkb3V0Rm9ybWF0ID0gd2luc3Rvbi5mb3JtYXQucHJpbnRmKCh7IGxldmVsLCBtZXNzYWdlLCBsYWJlbCwgdGltZXN0YW1wIH0pID0+IHtcbiAgICByZXR1cm4gYCR7dGltZXN0YW1wfSBbJHtsYWJlbH1dICR7bGV2ZWx9OiAke21lc3NhZ2V9YFxufSk7XG5cbmNvbnN0IGNvcnJlbGF0aW9uSWRGb3JtYXQgPSB3aW5zdG9uLmZvcm1hdChpbmZvID0+IHtcbiAgICBpbmZvLmNvcnJlbGF0aW9uSWQgPSB3aXRoQ29ycmVsYXRpb24oKTtcbiAgICByZXR1cm4gaW5mbztcbn0pO1xuXG5jb25zdCBnZXROZXdSZWxpY0xvZ1RyYW5zcG9ydDogKCkgPT4gTmV3UmVsaWNMb2dUcmFuc3BvcnQgfCB1bmRlZmluZWQgPSAoKSA9PiB7XG4gICAgbWVzc2FnZXMucHVzaChbJ3NpbGx5JywgJ0F0dGVtcHRpbmcgcmV0cmlldmFsIG9mIE5ld1JlbGljTG9nRGVsaXZlcnlBZ2VudCBpbnN0YW5jZSddKTtcbiAgICBsZXQgaW5zdGFuY2UgPSBOZXdSZWxpY0xvZ0RlbGl2ZXJ5QWdlbnQuZ2V0SW5zdGFuY2UoKTtcbiAgICBpZiAoaW5zdGFuY2UpIHtcbiAgICAgICAgcmV0dXJuIGluc3RhbmNlLmdldExvZ1RyYW5zcG9ydCgpO1xuICAgIH1cbiAgICBtZXNzYWdlcy5wdXNoKFsnZGVidWcnLCAnTm8gTmV3UmVsaWNMb2dEZWxpdmVyeUFnZW50IGRlZmluZWQsIGluaXRpYWxpemluZyBpbnN0YW5jZSddKTtcbiAgICBjb25zdCB0cmFuc3BvcnQgPSBOZXdSZWxpY0xvZ0RlbGl2ZXJ5QWdlbnQuaW5pdGlhbGl6ZSgpPy5nZXRMb2dUcmFuc3BvcnQoKTtcbiAgICBtZXNzYWdlcy5wdXNoKFsnc2lsbHknLCBgVHJhbnNwb3J0IGNyZWF0ZWRgXSk7XG4gICAgcmV0dXJuIHRyYW5zcG9ydDtcbn1cblxuY29uc3QgZ2V0TG9nU3R5bGVPcHRpb24gPSAoKTogW0xvZ1N0eWxlLCBzdHJpbmddID0+IHtcbiAgICBpZiAoIXByb2Nlc3MuZW52LkxPR19TVFlMRSkge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgZGVmYXVsdExvZ1N0eWxlLFxuICAgICAgICAgICAgYFVzaW5nIGRlZmF1bHQgbG9nIHN0eWxlOiAke2RlZmF1bHRMb2dTdHlsZX0uIE92ZXJyaWRlIHRoaXMgdXNpbmcgdGhlIExPR19TVFlMRSBlbnZpcm9ubWVudCB2YXJpYWJsZS4gVmFsaWQgdmFsdWVzIGFyZTogJHtsb2dTdHlsZXN9LmBdXG4gICAgfVxuXG4gICAgaWYgKGxvZ1N0eWxlcy5pbmNsdWRlcyhwcm9jZXNzLmVudi5MT0dfU1RZTEUudG9VcHBlckNhc2UoKS50cmltKCkgYXMgTG9nU3R5bGUpKSB7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICBwcm9jZXNzLmVudi5MT0dfU1RZTEUgYXMgTG9nU3R5bGUsXG4gICAgICAgICAgICBgVXNpbmcgbG9nIHN0eWxlOiAke3Byb2Nlc3MuZW52LkxPR19TVFlMRX1gXG4gICAgICAgIF07XG4gICAgfVxuXG4gICAgcmV0dXJuIFtcbiAgICAgICAgZGVmYXVsdExvZ1N0eWxlLFxuICAgICAgICBgVW5yZWNvZ25pemVkIGxvZyBzdHlsZTogJHtwcm9jZXNzLmVudi5MT0dfU1RZTEV9LiBVc2luZyBkZWZhdWx0IGxvZyBzdHlsZTogJHtkZWZhdWx0TG9nU3R5bGV9LiBWYWxpZCBsb2cgc3R5bGVzIGFyZTogJHtsb2dTdHlsZXN9YFxuICAgIF1cbn1cblxuY29uc3QgZGVmYXVsdExvZ2dpbmdMZXZlbCA9IHByb2Nlc3MuZW52LkxPR19MRVZFTCA/PyBwcm9jZXNzLmVudi5MRVZFTCA/PyAnZGVidWcnO1xuY29uc3QgbWVzc2FnZXM6IFtOUE1Mb2dnaW5nTGV2ZWxzLCBzdHJpbmddW10gPSBbXTtcbmNvbnN0IFtsb2dTdHlsZSwgbWVzc2FnZV0gPSBnZXRMb2dTdHlsZU9wdGlvbigpO1xubWVzc2FnZXMucHVzaChbJ2luZm8nLCBtZXNzYWdlXSk7XG5leHBvcnQgY29uc3Qgd2l0aExvZ2dlciA9IChsYWJlbDogc3RyaW5nLCBsZXZlbD86IE5QTUxvZ2dpbmdMZXZlbHMpOiBMb2dnZXIgPT4ge1xuICAgIHN3aXRjaChsb2dTdHlsZSkge1xuICAgICAgICBjYXNlICdKU09OJzogICAgICAgICAgICByZXR1cm4gY3JlYXRlSnNvbkxvZ2dlcihsYWJlbCwgbGV2ZWwpO1xuICAgICAgICBjYXNlICdTVFJJTkcnOiAgICAgICAgICByZXR1cm4gY3JlYXRlU3RyaW5nTG9nZ2VyKGxhYmVsLCBsZXZlbCk7XG4gICAgICAgIGNhc2UgJ1NUUklOR19DT0xPUic6ICAgIHJldHVybiBjcmVhdGVDb2xvclN0cmluZ0xvZ2dlcihsYWJlbCwgbGV2ZWwpO1xuICAgICAgICBjYXNlICdTSUxFTlQnOiAgICAgICAgICByZXR1cm4gY3JlYXRlU2lsZW50TG9nZ2VyKGxhYmVsLCBsZXZlbCk7XG4gICAgICAgIGNhc2UgJ05FV19SRUxJQyc6ICAgICAgIHJldHVybiBjcmVhdGVOZXdSZWxpY0xvZ2dlcihsYWJlbCwgbGV2ZWwpO1xuICAgIH1cbn1cblxuY29uc3QgY3JlYXRlTmV3UmVsaWNMb2dnZXIgPSAobGFiZWw6IHN0cmluZywgbGV2ZWw/OiBOUE1Mb2dnaW5nTGV2ZWxzKSA9PiB7XG4gICAgaWYgKCFwcm9jZXNzLmVudi5ORVdfUkVMSUNfTElDRU5TRV9LRVkpIHtcbiAgICAgICAgbWVzc2FnZXMucHVzaChbJ3dhcm4nLCAnTkVXX1JFTElDIGxvZ2dpbmcgc3R5bGUgY29uZmlndXJlZCBidXQgTkVXX1JFTElDX0xJQ0VOU0VfS0VZIGlzIG5vdCBkZWZpbmVkISBGYWxsaW5nIGJhY2sgdG8gSlNPTiBsb2dnZXIuJ10pO1xuICAgICAgICByZXR1cm4gY3JlYXRlSnNvbkxvZ2dlcihsYWJlbCxsZXZlbCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHdpbnN0b24ubG9nZ2Vycy5hZGQobGFiZWwsIHtcbiAgICAgICAgbGV2ZWw6IGxldmVsID8/IGRlZmF1bHRMb2dnaW5nTGV2ZWwsXG4gICAgICAgIGZvcm1hdDogd2luc3Rvbi5mb3JtYXQuY29tYmluZShcbiAgICAgICAgICAgIGNvcnJlbGF0aW9uSWRGb3JtYXQoKSxcbiAgICAgICAgICAgIHdpbnN0b24uZm9ybWF0LmxhYmVsKHsgbGFiZWwgfSksXG4gICAgICAgICAgICB3aW5zdG9uLmZvcm1hdC50aW1lc3RhbXAoKSxcbiAgICAgICAgICAgIG5ld3JlbGljRm9ybWF0dGVyKClcbiAgICAgICAgKSxcbiAgICAgICAgdHJhbnNwb3J0czogWyBnZXROZXdSZWxpY0xvZ1RyYW5zcG9ydCgpIGFzIHdpbnN0b24udHJhbnNwb3J0IF1cbiAgICB9KTtcbn1cblxuXG5jb25zdCBjcmVhdGVKc29uTG9nZ2VyID0gKGxhYmVsOiBzdHJpbmcsIGxldmVsPzogTlBNTG9nZ2luZ0xldmVscykgPT4ge1xuICAgIFxuICAgIHJldHVybiB3aW5zdG9uLmxvZ2dlcnMuYWRkKGxhYmVsLCB7XG4gICAgICAgIGxldmVsOiBsZXZlbCA/PyBkZWZhdWx0TG9nZ2luZ0xldmVsLFxuICAgICAgICBmb3JtYXQ6IHdpbnN0b24uZm9ybWF0LmNvbWJpbmUoXG4gICAgICAgICAgICBjb3JyZWxhdGlvbklkRm9ybWF0KCksXG4gICAgICAgICAgICB3aW5zdG9uLmZvcm1hdC5sYWJlbCh7IGxhYmVsIH0pLFxuICAgICAgICAgICAgd2luc3Rvbi5mb3JtYXQudGltZXN0YW1wKCksXG4gICAgICAgICAgICBuZXdyZWxpY0Zvcm1hdHRlcigpXG4gICAgICAgICksXG4gICAgICAgIHRyYW5zcG9ydHM6IFsgbmV3IHdpbnN0b24udHJhbnNwb3J0cy5Db25zb2xlKCkgXVxuICAgIH0pO1xufVxuXG5jb25zdCBjcmVhdGVTdHJpbmdMb2dnZXIgPSAobGFiZWw6IHN0cmluZywgbGV2ZWw/OiBOUE1Mb2dnaW5nTGV2ZWxzKSA9PiB7XG4gICAgcmV0dXJuIHdpbnN0b24ubG9nZ2Vycy5hZGQobGFiZWwsIHtcbiAgICAgICAgbGV2ZWw6IGxldmVsID8/IGRlZmF1bHRMb2dnaW5nTGV2ZWwsXG4gICAgICAgIGZvcm1hdDogd2luc3Rvbi5mb3JtYXQuY29tYmluZShcbiAgICAgICAgICAgIGNvcnJlbGF0aW9uSWRGb3JtYXQoKSxcbiAgICAgICAgICAgIHdpbnN0b24uZm9ybWF0LmxhYmVsKHsgbGFiZWwgfSksXG4gICAgICAgICAgICB3aW5zdG9uLmZvcm1hdC50aW1lc3RhbXAoKSxcbiAgICAgICAgICAgIHN0ZG91dEZvcm1hdFxuICAgICAgICApLFxuICAgICAgICB0cmFuc3BvcnRzOiBbXG4gICAgICAgICAgICBuZXcgd2luc3Rvbi50cmFuc3BvcnRzLkNvbnNvbGUoKVxuICAgICAgICBdXG4gICAgfSk7XG59XG5cbmNvbnN0IGNyZWF0ZUNvbG9yU3RyaW5nTG9nZ2VyID0gKGxhYmVsOiBzdHJpbmcsIGxldmVsPzogTlBNTG9nZ2luZ0xldmVscykgPT4ge1xuICAgIHJldHVybiB3aW5zdG9uLmxvZ2dlcnMuYWRkKGxhYmVsLCB7XG4gICAgICAgIGxldmVsOiBsZXZlbCA/PyBkZWZhdWx0TG9nZ2luZ0xldmVsLFxuICAgICAgICBmb3JtYXQ6IHdpbnN0b24uZm9ybWF0LmNvbWJpbmUoXG4gICAgICAgICAgICBjb3JyZWxhdGlvbklkRm9ybWF0KCksXG4gICAgICAgICAgICB3aW5zdG9uLmZvcm1hdC5sYWJlbCh7IGxhYmVsIH0pLFxuICAgICAgICAgICAgd2luc3Rvbi5mb3JtYXQudGltZXN0YW1wKCksXG4gICAgICAgICAgICB3aW5zdG9uLmZvcm1hdC5jb2xvcml6ZSgpLFxuICAgICAgICAgICAgc3Rkb3V0Rm9ybWF0XG4gICAgICAgICksXG4gICAgICAgIHRyYW5zcG9ydHM6IFtcbiAgICAgICAgICAgIG5ldyB3aW5zdG9uLnRyYW5zcG9ydHMuQ29uc29sZSgpXG4gICAgICAgIF1cbiAgICB9KTtcbn1cblxuY29uc3QgY3JlYXRlU2lsZW50TG9nZ2VyID0gKGxhYmVsOiBzdHJpbmcsIGxldmVsPzogTlBNTG9nZ2luZ0xldmVscykgPT4ge1xuICAgIHJldHVybiB3aW5zdG9uLmxvZ2dlcnMuYWRkKGxhYmVsLCB7XG4gICAgICAgIHNpbGVudDogdHJ1ZSxcbiAgICAgICAgbGV2ZWw6IGxldmVsID8/IGRlZmF1bHRMb2dnaW5nTGV2ZWwsXG4gICAgICAgIHRyYW5zcG9ydHM6IFtcbiAgICAgICAgICAgIG5ldyB3aW5zdG9uLnRyYW5zcG9ydHMuQ29uc29sZSgpXG4gICAgICAgIF1cbiAgICB9KTtcbn1cblxuY29uc3QgbG9nID0gd2l0aExvZ2dlcignbG9nZ2VyJyk7XG5tZXNzYWdlcy5wdXNoKFsnZGVidWcnLCAnSW50ZXJuYWwgbG9nZ2VyIGluaXRpYWxpemVkJ10pO1xud2hpbGUobWVzc2FnZXMubGVuZ3RoID4gMCkge1xuICAgIGNvbnN0IFtsZXZlbCwgbWVzc2FnZV0gPSBtZXNzYWdlcy5zaGlmdCgpIGFzIFtOUE1Mb2dnaW5nTGV2ZWxzLCBzdHJpbmddO1xuICAgIGxvZ1tsZXZlbF0obWVzc2FnZSk7XG59XG4iXX0=