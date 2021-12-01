"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DEFAULT_CORRELATION_HEADER = void 0;
exports.correlationMiddleware = correlationMiddleware;
exports.withCorrelation = withCorrelation;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _uuid = require("uuid");

var _async_hooks = require("async_hooks");

var DEFAULT_CORRELATION_HEADER = 'x-correlation-id';
exports.DEFAULT_CORRELATION_HEADER = DEFAULT_CORRELATION_HEADER;
var localStorage = new _async_hooks.AsyncLocalStorage();
/**
 * Creates a middleware function to extract a correlation ID from an incoming request or to create
 * a correlation ID if no such ID exists
 * 
 * @param header -  
 * @returns 
 */

function correlationMiddleware() {
  var header = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : DEFAULT_CORRELATION_HEADER;
  return function (request, response, next) {
    var correlationId = request.headers[header] || generateCorrelationId();
    localStorage.run(correlationId, /*#__PURE__*/(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              next();

            case 1:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    })));
  };
}

var generateCorrelationId = function generateCorrelationId() {
  return (0, _uuid.v4)();
};

function withCorrelation() {
  return localStorage.getStore();
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jb3JyZWxhdGlvbi1taWRkbGV3YXJlLnRzIl0sIm5hbWVzIjpbIkRFRkFVTFRfQ09SUkVMQVRJT05fSEVBREVSIiwibG9jYWxTdG9yYWdlIiwiQXN5bmNMb2NhbFN0b3JhZ2UiLCJjb3JyZWxhdGlvbk1pZGRsZXdhcmUiLCJoZWFkZXIiLCJyZXF1ZXN0IiwicmVzcG9uc2UiLCJuZXh0IiwiY29ycmVsYXRpb25JZCIsImhlYWRlcnMiLCJnZW5lcmF0ZUNvcnJlbGF0aW9uSWQiLCJydW4iLCJ3aXRoQ29ycmVsYXRpb24iLCJnZXRTdG9yZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQ0E7O0FBQ0E7O0FBRU8sSUFBTUEsMEJBQTBCLEdBQUcsa0JBQW5DOztBQUVQLElBQU1DLFlBQVksR0FBRyxJQUFJQyw4QkFBSixFQUFyQjtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUNPLFNBQVNDLHFCQUFULEdBQW9FO0FBQUEsTUFBckNDLE1BQXFDLHVFQUE1QkosMEJBQTRCO0FBQ3ZFLFNBQU8sVUFBQ0ssT0FBRCxFQUFtQkMsUUFBbkIsRUFBdUNDLElBQXZDLEVBQThEO0FBQ2pFLFFBQUlDLGFBQWEsR0FBR0gsT0FBTyxDQUFDSSxPQUFSLENBQWdCTCxNQUFoQixLQUFxQ00scUJBQXFCLEVBQTlFO0FBQ0FULElBQUFBLFlBQVksQ0FBQ1UsR0FBYixDQUFpQkgsYUFBakIsNkZBQWdDO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFDNUJELGNBQUFBLElBQUk7O0FBRHdCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEtBQWhDO0FBR0gsR0FMRDtBQU1IOztBQUVELElBQU1HLHFCQUFxQixHQUFHLFNBQXhCQSxxQkFBd0I7QUFBQSxTQUFNLGVBQU47QUFBQSxDQUE5Qjs7QUFFTyxTQUFTRSxlQUFULEdBQTJCO0FBQzlCLFNBQU9YLFlBQVksQ0FBQ1ksUUFBYixFQUFQO0FBQ0giLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOZXh0RnVuY3Rpb24sIFJlcXVlc3QsIFJlc3BvbnNlIH0gZnJvbSAnZXhwcmVzcyc7XG5pbXBvcnQgeyB2NCBhcyB1dWlkdjQgfSBmcm9tICd1dWlkJztcbmltcG9ydCB7IEFzeW5jTG9jYWxTdG9yYWdlIH0gZnJvbSAnYXN5bmNfaG9va3MnO1xuXG5leHBvcnQgY29uc3QgREVGQVVMVF9DT1JSRUxBVElPTl9IRUFERVIgPSAneC1jb3JyZWxhdGlvbi1pZCdcblxuY29uc3QgbG9jYWxTdG9yYWdlID0gbmV3IEFzeW5jTG9jYWxTdG9yYWdlPHN0cmluZz4oKTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbWlkZGxld2FyZSBmdW5jdGlvbiB0byBleHRyYWN0IGEgY29ycmVsYXRpb24gSUQgZnJvbSBhbiBpbmNvbWluZyByZXF1ZXN0IG9yIHRvIGNyZWF0ZVxuICogYSBjb3JyZWxhdGlvbiBJRCBpZiBubyBzdWNoIElEIGV4aXN0c1xuICogXG4gKiBAcGFyYW0gaGVhZGVyIC0gIFxuICogQHJldHVybnMgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb3JyZWxhdGlvbk1pZGRsZXdhcmUoaGVhZGVyID0gREVGQVVMVF9DT1JSRUxBVElPTl9IRUFERVIpIHtcbiAgICByZXR1cm4gKHJlcXVlc3Q6IFJlcXVlc3QsIHJlc3BvbnNlOiBSZXNwb25zZSwgbmV4dDogTmV4dEZ1bmN0aW9uKSA9PiB7XG4gICAgICAgIGxldCBjb3JyZWxhdGlvbklkID0gcmVxdWVzdC5oZWFkZXJzW2hlYWRlcl0gYXMgc3RyaW5nIHx8IGdlbmVyYXRlQ29ycmVsYXRpb25JZCgpO1xuICAgICAgICBsb2NhbFN0b3JhZ2UucnVuKGNvcnJlbGF0aW9uSWQsIGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgIG5leHQoKTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG5jb25zdCBnZW5lcmF0ZUNvcnJlbGF0aW9uSWQgPSAoKSA9PiB1dWlkdjQoKTtcblxuZXhwb3J0IGZ1bmN0aW9uIHdpdGhDb3JyZWxhdGlvbigpIHtcbiAgICByZXR1cm4gbG9jYWxTdG9yYWdlLmdldFN0b3JlKCk7XG59Il19