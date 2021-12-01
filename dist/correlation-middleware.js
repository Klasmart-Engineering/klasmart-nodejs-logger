"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DEFAULT_CORRELATION_HEADER = void 0;
exports.correlationMiddleware = correlationMiddleware;
exports.withCorrelation = withCorrelation;

var _uuid = require("uuid");

var _async_hooks = require("async_hooks");

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

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
    localStorage.run(correlationId, /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
      return regeneratorRuntime.wrap(function _callee$(_context) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jb3JyZWxhdGlvbi1taWRkbGV3YXJlLnRzIl0sIm5hbWVzIjpbIkRFRkFVTFRfQ09SUkVMQVRJT05fSEVBREVSIiwibG9jYWxTdG9yYWdlIiwiQXN5bmNMb2NhbFN0b3JhZ2UiLCJjb3JyZWxhdGlvbk1pZGRsZXdhcmUiLCJoZWFkZXIiLCJyZXF1ZXN0IiwicmVzcG9uc2UiLCJuZXh0IiwiY29ycmVsYXRpb25JZCIsImhlYWRlcnMiLCJnZW5lcmF0ZUNvcnJlbGF0aW9uSWQiLCJydW4iLCJ3aXRoQ29ycmVsYXRpb24iLCJnZXRTdG9yZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQ0E7O0FBQ0E7Ozs7OztBQUVPLElBQU1BLDBCQUEwQixHQUFHLGtCQUFuQzs7QUFFUCxJQUFNQyxZQUFZLEdBQUcsSUFBSUMsOEJBQUosRUFBckI7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFDTyxTQUFTQyxxQkFBVCxHQUFvRTtBQUFBLE1BQXJDQyxNQUFxQyx1RUFBNUJKLDBCQUE0QjtBQUN2RSxTQUFPLFVBQUNLLE9BQUQsRUFBbUJDLFFBQW5CLEVBQXVDQyxJQUF2QyxFQUE4RDtBQUNqRSxRQUFJQyxhQUFhLEdBQUdILE9BQU8sQ0FBQ0ksT0FBUixDQUFnQkwsTUFBaEIsS0FBcUNNLHFCQUFxQixFQUE5RTtBQUNBVCxJQUFBQSxZQUFZLENBQUNVLEdBQWIsQ0FBaUJILGFBQWpCLHVFQUFnQztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQzVCRCxjQUFBQSxJQUFJOztBQUR3QjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxLQUFoQztBQUdILEdBTEQ7QUFNSDs7QUFFRCxJQUFNRyxxQkFBcUIsR0FBRyxTQUF4QkEscUJBQXdCO0FBQUEsU0FBTSxlQUFOO0FBQUEsQ0FBOUI7O0FBRU8sU0FBU0UsZUFBVCxHQUEyQjtBQUM5QixTQUFPWCxZQUFZLENBQUNZLFFBQWIsRUFBUDtBQUNIIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmV4dEZ1bmN0aW9uLCBSZXF1ZXN0LCBSZXNwb25zZSB9IGZyb20gJ2V4cHJlc3MnO1xuaW1wb3J0IHsgdjQgYXMgdXVpZHY0IH0gZnJvbSAndXVpZCc7XG5pbXBvcnQgeyBBc3luY0xvY2FsU3RvcmFnZSB9IGZyb20gJ2FzeW5jX2hvb2tzJztcblxuZXhwb3J0IGNvbnN0IERFRkFVTFRfQ09SUkVMQVRJT05fSEVBREVSID0gJ3gtY29ycmVsYXRpb24taWQnXG5cbmNvbnN0IGxvY2FsU3RvcmFnZSA9IG5ldyBBc3luY0xvY2FsU3RvcmFnZTxzdHJpbmc+KCk7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG1pZGRsZXdhcmUgZnVuY3Rpb24gdG8gZXh0cmFjdCBhIGNvcnJlbGF0aW9uIElEIGZyb20gYW4gaW5jb21pbmcgcmVxdWVzdCBvciB0byBjcmVhdGVcbiAqIGEgY29ycmVsYXRpb24gSUQgaWYgbm8gc3VjaCBJRCBleGlzdHNcbiAqIFxuICogQHBhcmFtIGhlYWRlciAtICBcbiAqIEByZXR1cm5zIFxuICovXG5leHBvcnQgZnVuY3Rpb24gY29ycmVsYXRpb25NaWRkbGV3YXJlKGhlYWRlciA9IERFRkFVTFRfQ09SUkVMQVRJT05fSEVBREVSKSB7XG4gICAgcmV0dXJuIChyZXF1ZXN0OiBSZXF1ZXN0LCByZXNwb25zZTogUmVzcG9uc2UsIG5leHQ6IE5leHRGdW5jdGlvbikgPT4ge1xuICAgICAgICBsZXQgY29ycmVsYXRpb25JZCA9IHJlcXVlc3QuaGVhZGVyc1toZWFkZXJdIGFzIHN0cmluZyB8fCBnZW5lcmF0ZUNvcnJlbGF0aW9uSWQoKTtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnJ1bihjb3JyZWxhdGlvbklkLCBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICBuZXh0KCk7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuY29uc3QgZ2VuZXJhdGVDb3JyZWxhdGlvbklkID0gKCkgPT4gdXVpZHY0KCk7XG5cbmV4cG9ydCBmdW5jdGlvbiB3aXRoQ29ycmVsYXRpb24oKSB7XG4gICAgcmV0dXJuIGxvY2FsU3RvcmFnZS5nZXRTdG9yZSgpO1xufSJdfQ==