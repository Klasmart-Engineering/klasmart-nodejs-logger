"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.withLogger = void 0;

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _winstonEnricher = _interopRequireDefault(require("@newrelic/winston-enricher"));

var _winston = _interopRequireDefault(require("winston"));

var _correlationMiddleware = require("./correlation-middleware");

var _LogDeliveryAgent = require("./LogDeliveryAgent");

var _ref2, _process$env$LOG_LEVE;

var _excluded = ["level", "message", "label", "timestamp"];
// Queue for logs prior to logger creation
var logStyles = ['STRING_COLOR', 'STRING', 'JSON', 'SILENT', 'NEW_RELIC'];
var defaultLogStyle = logStyles[0];

var stdoutFormat = _winston["default"].format.printf(function (_ref) {
  var level = _ref.level,
      message = _ref.message,
      label = _ref.label,
      timestamp = _ref.timestamp,
      meta = (0, _objectWithoutProperties2["default"])(_ref, _excluded);

  if (message instanceof Object) {
    message = JSON.stringify(message);
  }

  var result = "".concat(timestamp, " [").concat(label, "] ").concat(level, ": ").concat(message);

  if (meta) {
    var metaJson = JSON.stringify(meta); // Don't write metadata if the JSON string was empty due to undefined values, eg: { correlationId: undefined }

    if (metaJson.length > 2) result += " ".concat(metaJson);
  }

  return result;
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
    _getLogStyleOption2 = (0, _slicedToArray2["default"])(_getLogStyleOption, 2),
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
  var _winston$format;

  if (!process.env.NEW_RELIC_LICENSE_KEY) {
    messages.push(['warn', 'NEW_RELIC logging style configured but NEW_RELIC_LICENSE_KEY is not defined! Falling back to JSON logger.']);
    return createJsonLogger(label, level);
  }

  return _winston["default"].loggers.add(label, {
    level: level !== null && level !== void 0 ? level : defaultLoggingLevel,
    format: (_winston$format = _winston["default"].format).combine.apply(_winston$format, (0, _toConsumableArray2["default"])(defaultLoggers(label)).concat([(0, _winstonEnricher["default"])()])),
    transports: [getNewRelicLogTransport()]
  });
};

var createJsonLogger = function createJsonLogger(label, level) {
  var _winston$format2;

  return _winston["default"].loggers.add(label, {
    level: level !== null && level !== void 0 ? level : defaultLoggingLevel,
    format: (_winston$format2 = _winston["default"].format).combine.apply(_winston$format2, (0, _toConsumableArray2["default"])(defaultLoggers(label)).concat([(0, _winstonEnricher["default"])()])),
    transports: [new _winston["default"].transports.Console()]
  });
};

var createStringLogger = function createStringLogger(label, level) {
  var _winston$format3;

  return _winston["default"].loggers.add(label, {
    level: level !== null && level !== void 0 ? level : defaultLoggingLevel,
    format: (_winston$format3 = _winston["default"].format).combine.apply(_winston$format3, (0, _toConsumableArray2["default"])(defaultLoggers(label)).concat([stdoutFormat])),
    transports: [new _winston["default"].transports.Console()]
  });
};

var createColorStringLogger = function createColorStringLogger(label, level) {
  var _winston$format4;

  return _winston["default"].loggers.add(label, {
    level: level !== null && level !== void 0 ? level : defaultLoggingLevel,
    format: (_winston$format4 = _winston["default"].format).combine.apply(_winston$format4, (0, _toConsumableArray2["default"])(defaultLoggers(label)).concat([_winston["default"].format.colorize(), stdoutFormat])),
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

var defaultLoggers = function defaultLoggers(label) {
  return [correlationIdFormat(), _winston["default"].format.label({
    label: label
  }), _winston["default"].format.timestamp(), _winston["default"].format.splat()];
};

var log = withLogger('logger');
messages.push(['debug', 'Internal logger initialized']);

while (messages.length > 0) {
  var _ref3 = messages.shift(),
      _ref4 = (0, _slicedToArray2["default"])(_ref3, 2),
      level = _ref4[0],
      _message = _ref4[1];

  log[level](_message);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9sb2dnZXIudHMiXSwibmFtZXMiOlsibG9nU3R5bGVzIiwiZGVmYXVsdExvZ1N0eWxlIiwic3Rkb3V0Rm9ybWF0Iiwid2luc3RvbiIsImZvcm1hdCIsInByaW50ZiIsImxldmVsIiwibWVzc2FnZSIsImxhYmVsIiwidGltZXN0YW1wIiwibWV0YSIsIk9iamVjdCIsIkpTT04iLCJzdHJpbmdpZnkiLCJyZXN1bHQiLCJtZXRhSnNvbiIsImxlbmd0aCIsImNvcnJlbGF0aW9uSWRGb3JtYXQiLCJpbmZvIiwiY29ycmVsYXRpb25JZCIsImdldE5ld1JlbGljTG9nVHJhbnNwb3J0IiwibWVzc2FnZXMiLCJwdXNoIiwiaW5zdGFuY2UiLCJOZXdSZWxpY0xvZ0RlbGl2ZXJ5QWdlbnQiLCJnZXRJbnN0YW5jZSIsImdldExvZ1RyYW5zcG9ydCIsInRyYW5zcG9ydCIsImluaXRpYWxpemUiLCJzZXRNYXhMaXN0ZW5lcnMiLCJJbmZpbml0eSIsImdldExvZ1N0eWxlT3B0aW9uIiwicHJvY2VzcyIsImVudiIsIkxPR19TVFlMRSIsImluY2x1ZGVzIiwidG9VcHBlckNhc2UiLCJ0cmltIiwiZGVmYXVsdExvZ2dpbmdMZXZlbCIsIkxPR19MRVZFTCIsIkxFVkVMIiwibG9nU3R5bGUiLCJ3aXRoTG9nZ2VyIiwiY3JlYXRlSnNvbkxvZ2dlciIsImNyZWF0ZVN0cmluZ0xvZ2dlciIsImNyZWF0ZUNvbG9yU3RyaW5nTG9nZ2VyIiwiY3JlYXRlU2lsZW50TG9nZ2VyIiwiY3JlYXRlTmV3UmVsaWNMb2dnZXIiLCJORVdfUkVMSUNfTElDRU5TRV9LRVkiLCJsb2dnZXJzIiwiYWRkIiwiY29tYmluZSIsImRlZmF1bHRMb2dnZXJzIiwidHJhbnNwb3J0cyIsIkNvbnNvbGUiLCJjb2xvcml6ZSIsInNpbGVudCIsInNwbGF0IiwibG9nIiwic2hpZnQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUNBOztBQUNBOztBQUNBOztBQUVBOzs7OztBQU1BO0FBQ0EsSUFBTUEs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QUFqQkEsY0FBaUIsQ0FBQzVDLEtBQUQ7QUFBQSxTQUE2QyxDQUNoRVMsbUJBQW1CLEVBRDZDLEVBRWhFZCxvQkFBUUMsTUFBUixDQUFlSSxLQUFmLENBQXFCO0FBQUVBLElBQUFBLEtBQUssRUFBTEE7QUFBRixHQUFyQixDQUZnRSxFQUdoRUwsb0JBQVFDLE1BQVIsQ0FBZUssU0FBZixFQUhnRSxFQUloRU4sb0JBQVFDLE1BQVIsQ0FBZXFELEtBQWYsRUFKZ0UsQ0FBN0M7QUFBQSxDQUF2Qjs7QUFPQSxJQUFNQyxHQUFHLEdBQUdoQixVQUFVLENBQUMsUUFBRCxDQUF0QjtBQUNBckIsUUFBUSxDQUFDQyxJQUFULENBQWMsQ0FBQyxPQUFELEVBQVUsNkJBQVYsQ0FBZDs7QUFDQSxPQUFNRCxRQUFRLENBQUNMLE1BQVQsR0FBa0IsQ0FBeEIsRUFBMkI7QUFDdkIsY0FBeUJLLFFBQVEsQ0FBQ3NDLEtBQVQsRUFBekI7QUFBQTtBQUFBLE1BQU9yRCxLQUFQO0FBQUEsTUFBY0MsUUFBZDs7QUFDQW1ELEVBQUFBLEdBQUcsQ0FBQ3BELEtBQUQsQ0FBSCxDQUFXQyxRQUFYO0FBQ0giLCJzb3VyY2VzQ29udGVudCI6WyIvLyBAdHMtaWdub3JlXG5pbXBvcnQgbmV3cmVsaWNGb3JtYXR0ZXIgZnJvbSAnQG5ld3JlbGljL3dpbnN0b24tZW5yaWNoZXInO1xuaW1wb3J0IHdpbnN0b24sIHsgTG9nZ2VyIH0gZnJvbSAnd2luc3Rvbic7XG5pbXBvcnQgeyB3aXRoQ29ycmVsYXRpb24gfSBmcm9tICcuL2NvcnJlbGF0aW9uLW1pZGRsZXdhcmUnO1xuaW1wb3J0IHsgTmV3UmVsaWNMb2dUcmFuc3BvcnQgfSBmcm9tICcuL05ld1JlbGljTG9nVHJhbnNwb3J0JztcbmltcG9ydCB7IE5ld1JlbGljTG9nRGVsaXZlcnlBZ2VudCB9IGZyb20gJy4vTG9nRGVsaXZlcnlBZ2VudCc7XG5cbmV4cG9ydCB0eXBlIEtMTG9nZ2VyID0gd2luc3Rvbi5Mb2dnZXJcbmV4cG9ydCB0eXBlIE5QTUxvZ2dpbmdMZXZlbHMgPSAnc2lsbHknIHwgJ2RlYnVnJyB8ICd2ZXJib3NlJyB8ICdodHRwJyB8ICdpbmZvJyB8ICd3YXJuJyB8ICdlcnJvcic7XG50eXBlIExvZ1N0eWxlID0gJ1NUUklOR19DT0xPUicgfCAnU1RSSU5HJyB8ICdKU09OJyB8ICdTSUxFTlQnIHwgJ05FV19SRUxJQyc7XG5cbi8vIFF1ZXVlIGZvciBsb2dzIHByaW9yIHRvIGxvZ2dlciBjcmVhdGlvblxuY29uc3QgbG9nU3R5bGVzOiBMb2dTdHlsZVtdID0gWydTVFJJTkdfQ09MT1InLCAnU1RSSU5HJywgJ0pTT04nLCAnU0lMRU5UJywgJ05FV19SRUxJQyddO1xuY29uc3QgZGVmYXVsdExvZ1N0eWxlOiBMb2dTdHlsZSA9IGxvZ1N0eWxlc1swXTtcblxuY29uc3Qgc3Rkb3V0Rm9ybWF0ID0gd2luc3Rvbi5mb3JtYXQucHJpbnRmKCh7IGxldmVsLCBtZXNzYWdlLCBsYWJlbCwgdGltZXN0YW1wLCAuLi5tZXRhIH0pID0+IHtcbiAgICBpZiAobWVzc2FnZSBhcyBhbnkgaW5zdGFuY2VvZiBPYmplY3QpIHtcbiAgICAgICAgbWVzc2FnZSA9IEpTT04uc3RyaW5naWZ5KG1lc3NhZ2UpO1xuICAgIH1cbiAgICBsZXQgcmVzdWx0ID0gYCR7dGltZXN0YW1wfSBbJHtsYWJlbH1dICR7bGV2ZWx9OiAke21lc3NhZ2V9YFxuICAgIGlmIChtZXRhKSB7XG4gICAgICAgIGNvbnN0IG1ldGFKc29uID0gSlNPTi5zdHJpbmdpZnkobWV0YSk7XG5cbiAgICAgICAgLy8gRG9uJ3Qgd3JpdGUgbWV0YWRhdGEgaWYgdGhlIEpTT04gc3RyaW5nIHdhcyBlbXB0eSBkdWUgdG8gdW5kZWZpbmVkIHZhbHVlcywgZWc6IHsgY29ycmVsYXRpb25JZDogdW5kZWZpbmVkIH1cbiAgICAgICAgaWYgKG1ldGFKc29uLmxlbmd0aCA+IDIpIFxuICAgICAgICAgICAgcmVzdWx0ICs9IGAgJHttZXRhSnNvbn1gXG4gICAgfVxuICAgIHJldHVybiByZXN1bHRcbn0pO1xuXG5jb25zdCBjb3JyZWxhdGlvbklkRm9ybWF0ID0gd2luc3Rvbi5mb3JtYXQoaW5mbyA9PiB7XG4gICAgaW5mby5jb3JyZWxhdGlvbklkID0gd2l0aENvcnJlbGF0aW9uKCk7XG4gICAgcmV0dXJuIGluZm87XG59KTtcblxuY29uc3QgZ2V0TmV3UmVsaWNMb2dUcmFuc3BvcnQ6ICgpID0+IE5ld1JlbGljTG9nVHJhbnNwb3J0IHwgdW5kZWZpbmVkID0gKCkgPT4ge1xuICAgIG1lc3NhZ2VzLnB1c2goWydzaWxseScsICdBdHRlbXB0aW5nIHJldHJpZXZhbCBvZiBOZXdSZWxpY0xvZ0RlbGl2ZXJ5QWdlbnQgaW5zdGFuY2UnXSk7XG4gICAgbGV0IGluc3RhbmNlID0gTmV3UmVsaWNMb2dEZWxpdmVyeUFnZW50LmdldEluc3RhbmNlKCk7XG4gICAgaWYgKGluc3RhbmNlKSB7XG4gICAgICAgIHJldHVybiBpbnN0YW5jZS5nZXRMb2dUcmFuc3BvcnQoKTtcbiAgICB9XG4gICAgbWVzc2FnZXMucHVzaChbJ2RlYnVnJywgJ05vIE5ld1JlbGljTG9nRGVsaXZlcnlBZ2VudCBkZWZpbmVkLCBpbml0aWFsaXppbmcgaW5zdGFuY2UnXSk7XG4gICAgY29uc3QgdHJhbnNwb3J0ID0gTmV3UmVsaWNMb2dEZWxpdmVyeUFnZW50LmluaXRpYWxpemUoKT8uZ2V0TG9nVHJhbnNwb3J0KCk7XG4gICAgdHJhbnNwb3J0Py5zZXRNYXhMaXN0ZW5lcnMoSW5maW5pdHkpO1xuICAgIG1lc3NhZ2VzLnB1c2goWydzaWxseScsIGBUcmFuc3BvcnQgY3JlYXRlZGBdKTtcbiAgICByZXR1cm4gdHJhbnNwb3J0O1xufVxuXG5jb25zdCBnZXRMb2dTdHlsZU9wdGlvbiA9ICgpOiBbTG9nU3R5bGUsIHN0cmluZ10gPT4ge1xuICAgIGlmICghcHJvY2Vzcy5lbnYuTE9HX1NUWUxFKSB7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICBkZWZhdWx0TG9nU3R5bGUsXG4gICAgICAgICAgICBgVXNpbmcgZGVmYXVsdCBsb2cgc3R5bGU6ICR7ZGVmYXVsdExvZ1N0eWxlfS4gT3ZlcnJpZGUgdGhpcyB1c2luZyB0aGUgTE9HX1NUWUxFIGVudmlyb25tZW50IHZhcmlhYmxlLiBWYWxpZCB2YWx1ZXMgYXJlOiAke2xvZ1N0eWxlc30uYF1cbiAgICB9XG5cbiAgICBpZiAobG9nU3R5bGVzLmluY2x1ZGVzKHByb2Nlc3MuZW52LkxPR19TVFlMRS50b1VwcGVyQ2FzZSgpLnRyaW0oKSBhcyBMb2dTdHlsZSkpIHtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIHByb2Nlc3MuZW52LkxPR19TVFlMRSBhcyBMb2dTdHlsZSxcbiAgICAgICAgICAgIGBVc2luZyBsb2cgc3R5bGU6ICR7cHJvY2Vzcy5lbnYuTE9HX1NUWUxFfWBcbiAgICAgICAgXTtcbiAgICB9XG5cbiAgICByZXR1cm4gW1xuICAgICAgICBkZWZhdWx0TG9nU3R5bGUsXG4gICAgICAgIGBVbnJlY29nbml6ZWQgbG9nIHN0eWxlOiAke3Byb2Nlc3MuZW52LkxPR19TVFlMRX0uIFVzaW5nIGRlZmF1bHQgbG9nIHN0eWxlOiAke2RlZmF1bHRMb2dTdHlsZX0uIFZhbGlkIGxvZyBzdHlsZXMgYXJlOiAke2xvZ1N0eWxlc31gXG4gICAgXVxufVxuXG5jb25zdCBkZWZhdWx0TG9nZ2luZ0xldmVsID0gcHJvY2Vzcy5lbnYuTE9HX0xFVkVMID8/IHByb2Nlc3MuZW52LkxFVkVMID8/ICdkZWJ1Zyc7XG5jb25zdCBtZXNzYWdlczogW05QTUxvZ2dpbmdMZXZlbHMsIHN0cmluZ11bXSA9IFtdO1xuY29uc3QgW2xvZ1N0eWxlLCBtZXNzYWdlXSA9IGdldExvZ1N0eWxlT3B0aW9uKCk7XG5tZXNzYWdlcy5wdXNoKFsnaW5mbycsIG1lc3NhZ2VdKTtcbmV4cG9ydCBjb25zdCB3aXRoTG9nZ2VyID0gKGxhYmVsOiBzdHJpbmcsIGxldmVsPzogTlBNTG9nZ2luZ0xldmVscyk6IEtMTG9nZ2VyID0+IHtcbiAgICBzd2l0Y2gobG9nU3R5bGUpIHtcbiAgICAgICAgY2FzZSAnSlNPTic6ICAgICAgICAgICAgcmV0dXJuIGNyZWF0ZUpzb25Mb2dnZXIobGFiZWwsIGxldmVsKTtcbiAgICAgICAgY2FzZSAnU1RSSU5HJzogICAgICAgICAgcmV0dXJuIGNyZWF0ZVN0cmluZ0xvZ2dlcihsYWJlbCwgbGV2ZWwpO1xuICAgICAgICBjYXNlICdTVFJJTkdfQ09MT1InOiAgICByZXR1cm4gY3JlYXRlQ29sb3JTdHJpbmdMb2dnZXIobGFiZWwsIGxldmVsKTtcbiAgICAgICAgY2FzZSAnU0lMRU5UJzogICAgICAgICAgcmV0dXJuIGNyZWF0ZVNpbGVudExvZ2dlcihsYWJlbCwgbGV2ZWwpO1xuICAgICAgICBjYXNlICdORVdfUkVMSUMnOiAgICAgICByZXR1cm4gY3JlYXRlTmV3UmVsaWNMb2dnZXIobGFiZWwsIGxldmVsKTtcbiAgICB9XG59XG5cbmNvbnN0IGNyZWF0ZU5ld1JlbGljTG9nZ2VyID0gKGxhYmVsOiBzdHJpbmcsIGxldmVsPzogTlBNTG9nZ2luZ0xldmVscykgPT4ge1xuICAgIGlmICghcHJvY2Vzcy5lbnYuTkVXX1JFTElDX0xJQ0VOU0VfS0VZKSB7XG4gICAgICAgIG1lc3NhZ2VzLnB1c2goWyd3YXJuJywgJ05FV19SRUxJQyBsb2dnaW5nIHN0eWxlIGNvbmZpZ3VyZWQgYnV0IE5FV19SRUxJQ19MSUNFTlNFX0tFWSBpcyBub3QgZGVmaW5lZCEgRmFsbGluZyBiYWNrIHRvIEpTT04gbG9nZ2VyLiddKTtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZUpzb25Mb2dnZXIobGFiZWwsbGV2ZWwpO1xuICAgIH1cblxuICAgIHJldHVybiB3aW5zdG9uLmxvZ2dlcnMuYWRkKGxhYmVsLCB7XG4gICAgICAgIGxldmVsOiBsZXZlbCA/PyBkZWZhdWx0TG9nZ2luZ0xldmVsLFxuICAgICAgICBmb3JtYXQ6IHdpbnN0b24uZm9ybWF0LmNvbWJpbmUoXG4gICAgICAgICAgICAuLi5kZWZhdWx0TG9nZ2VycyhsYWJlbCksXG4gICAgICAgICAgICBuZXdyZWxpY0Zvcm1hdHRlcigpXG4gICAgICAgICksXG4gICAgICAgIHRyYW5zcG9ydHM6IFsgZ2V0TmV3UmVsaWNMb2dUcmFuc3BvcnQoKSBhcyB3aW5zdG9uLnRyYW5zcG9ydCBdXG4gICAgfSk7XG59XG5cblxuY29uc3QgY3JlYXRlSnNvbkxvZ2dlciA9IChsYWJlbDogc3RyaW5nLCBsZXZlbD86IE5QTUxvZ2dpbmdMZXZlbHMpID0+IHtcbiAgICBcbiAgICByZXR1cm4gd2luc3Rvbi5sb2dnZXJzLmFkZChsYWJlbCwge1xuICAgICAgICBsZXZlbDogbGV2ZWwgPz8gZGVmYXVsdExvZ2dpbmdMZXZlbCxcbiAgICAgICAgZm9ybWF0OiB3aW5zdG9uLmZvcm1hdC5jb21iaW5lKFxuICAgICAgICAgICAgLi4uZGVmYXVsdExvZ2dlcnMobGFiZWwpLFxuICAgICAgICAgICAgbmV3cmVsaWNGb3JtYXR0ZXIoKVxuICAgICAgICApLFxuICAgICAgICB0cmFuc3BvcnRzOiBbIG5ldyB3aW5zdG9uLnRyYW5zcG9ydHMuQ29uc29sZSgpIF1cbiAgICB9KTtcbn1cblxuY29uc3QgY3JlYXRlU3RyaW5nTG9nZ2VyID0gKGxhYmVsOiBzdHJpbmcsIGxldmVsPzogTlBNTG9nZ2luZ0xldmVscykgPT4ge1xuICAgIHJldHVybiB3aW5zdG9uLmxvZ2dlcnMuYWRkKGxhYmVsLCB7XG4gICAgICAgIGxldmVsOiBsZXZlbCA/PyBkZWZhdWx0TG9nZ2luZ0xldmVsLFxuICAgICAgICBmb3JtYXQ6IHdpbnN0b24uZm9ybWF0LmNvbWJpbmUoXG4gICAgICAgICAgICAuLi5kZWZhdWx0TG9nZ2VycyhsYWJlbCksXG4gICAgICAgICAgICBzdGRvdXRGb3JtYXRcbiAgICAgICAgKSxcbiAgICAgICAgdHJhbnNwb3J0czogW1xuICAgICAgICAgICAgbmV3IHdpbnN0b24udHJhbnNwb3J0cy5Db25zb2xlKClcbiAgICAgICAgXVxuICAgIH0pO1xufVxuXG5jb25zdCBjcmVhdGVDb2xvclN0cmluZ0xvZ2dlciA9IChsYWJlbDogc3RyaW5nLCBsZXZlbD86IE5QTUxvZ2dpbmdMZXZlbHMpID0+IHtcbiAgICByZXR1cm4gd2luc3Rvbi5sb2dnZXJzLmFkZChsYWJlbCwge1xuICAgICAgICBsZXZlbDogbGV2ZWwgPz8gZGVmYXVsdExvZ2dpbmdMZXZlbCxcbiAgICAgICAgZm9ybWF0OiB3aW5zdG9uLmZvcm1hdC5jb21iaW5lKFxuICAgICAgICAgICAgLi4uZGVmYXVsdExvZ2dlcnMobGFiZWwpLFxuICAgICAgICAgICAgd2luc3Rvbi5mb3JtYXQuY29sb3JpemUoKSxcbiAgICAgICAgICAgIHN0ZG91dEZvcm1hdFxuICAgICAgICApLFxuICAgICAgICB0cmFuc3BvcnRzOiBbXG4gICAgICAgICAgICBuZXcgd2luc3Rvbi50cmFuc3BvcnRzLkNvbnNvbGUoKVxuICAgICAgICBdXG4gICAgfSk7XG59XG5cbmNvbnN0IGNyZWF0ZVNpbGVudExvZ2dlciA9IChsYWJlbDogc3RyaW5nLCBsZXZlbD86IE5QTUxvZ2dpbmdMZXZlbHMpID0+IHtcbiAgICByZXR1cm4gd2luc3Rvbi5sb2dnZXJzLmFkZChsYWJlbCwge1xuICAgICAgICBzaWxlbnQ6IHRydWUsXG4gICAgICAgIGxldmVsOiBsZXZlbCA/PyBkZWZhdWx0TG9nZ2luZ0xldmVsLFxuICAgICAgICB0cmFuc3BvcnRzOiBbXG4gICAgICAgICAgICBuZXcgd2luc3Rvbi50cmFuc3BvcnRzLkNvbnNvbGUoKVxuICAgICAgICBdXG4gICAgfSk7XG59XG5cblxuY29uc3QgZGVmYXVsdExvZ2dlcnMgPSAobGFiZWw6IHN0cmluZyk6IHdpbnN0b24uTG9nZm9ybS5Gb3JtYXRbXSA9PiBbXG4gICAgY29ycmVsYXRpb25JZEZvcm1hdCgpLFxuICAgIHdpbnN0b24uZm9ybWF0LmxhYmVsKHsgbGFiZWwgfSksXG4gICAgd2luc3Rvbi5mb3JtYXQudGltZXN0YW1wKCksXG4gICAgd2luc3Rvbi5mb3JtYXQuc3BsYXQoKSxcbl0gXG5cbmNvbnN0IGxvZyA9IHdpdGhMb2dnZXIoJ2xvZ2dlcicpO1xubWVzc2FnZXMucHVzaChbJ2RlYnVnJywgJ0ludGVybmFsIGxvZ2dlciBpbml0aWFsaXplZCddKTtcbndoaWxlKG1lc3NhZ2VzLmxlbmd0aCA+IDApIHtcbiAgICBjb25zdCBbbGV2ZWwsIG1lc3NhZ2VdID0gbWVzc2FnZXMuc2hpZnQoKSBhcyBbTlBNTG9nZ2luZ0xldmVscywgc3RyaW5nXTtcbiAgICBsb2dbbGV2ZWxdKG1lc3NhZ2UpO1xufVxuIl19