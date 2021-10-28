"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.correlationMiddleware = correlationMiddleware;
exports.withCorrelation = withCorrelation;

var _uuid = require("uuid");

var _async_hooks = require("async_hooks");

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var localStorage = new _async_hooks.AsyncLocalStorage();
/**
 * Creates a middleware function to extract a correlation ID from an incoming request or to create
 * a correlation ID if no such ID exists
 * 
 * @param header -  
 * @returns 
 */

function correlationMiddleware() {
  var header = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'x-correlation-id';
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jb3JyZWxhdGlvbi1taWRkbGV3YXJlLnRzIl0sIm5hbWVzIjpbImxvY2FsU3RvcmFnZSIsIkFzeW5jTG9jYWxTdG9yYWdlIiwiY29ycmVsYXRpb25NaWRkbGV3YXJlIiwiaGVhZGVyIiwicmVxdWVzdCIsInJlc3BvbnNlIiwibmV4dCIsImNvcnJlbGF0aW9uSWQiLCJoZWFkZXJzIiwiZ2VuZXJhdGVDb3JyZWxhdGlvbklkIiwicnVuIiwid2l0aENvcnJlbGF0aW9uIiwiZ2V0U3RvcmUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQ0E7O0FBQ0E7Ozs7OztBQUVBLElBQU1BLFlBQVksR0FBRyxJQUFJQyw4QkFBSixFQUFyQjtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUNPLFNBQVNDLHFCQUFULEdBQTREO0FBQUEsTUFBN0JDLE1BQTZCLHVFQUFwQixrQkFBb0I7QUFDL0QsU0FBTyxVQUFDQyxPQUFELEVBQW1CQyxRQUFuQixFQUF1Q0MsSUFBdkMsRUFBOEQ7QUFDakUsUUFBSUMsYUFBYSxHQUFHSCxPQUFPLENBQUNJLE9BQVIsQ0FBZ0JMLE1BQWhCLEtBQXFDTSxxQkFBcUIsRUFBOUU7QUFDQVQsSUFBQUEsWUFBWSxDQUFDVSxHQUFiLENBQWlCSCxhQUFqQix1RUFBZ0M7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUM1QkQsY0FBQUEsSUFBSTs7QUFEd0I7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsS0FBaEM7QUFHSCxHQUxEO0FBTUg7O0FBRUQsSUFBTUcscUJBQXFCLEdBQUcsU0FBeEJBLHFCQUF3QjtBQUFBLFNBQU0sZUFBTjtBQUFBLENBQTlCOztBQUVPLFNBQVNFLGVBQVQsR0FBMkI7QUFDOUIsU0FBT1gsWUFBWSxDQUFDWSxRQUFiLEVBQVA7QUFDSCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5leHRGdW5jdGlvbiwgUmVxdWVzdCwgUmVzcG9uc2UgfSBmcm9tICdleHByZXNzJztcbmltcG9ydCB7IHY0IGFzIHV1aWR2NCB9IGZyb20gJ3V1aWQnO1xuaW1wb3J0IHsgQXN5bmNMb2NhbFN0b3JhZ2UgfSBmcm9tICdhc3luY19ob29rcyc7XG5cbmNvbnN0IGxvY2FsU3RvcmFnZSA9IG5ldyBBc3luY0xvY2FsU3RvcmFnZTxzdHJpbmc+KCk7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG1pZGRsZXdhcmUgZnVuY3Rpb24gdG8gZXh0cmFjdCBhIGNvcnJlbGF0aW9uIElEIGZyb20gYW4gaW5jb21pbmcgcmVxdWVzdCBvciB0byBjcmVhdGVcbiAqIGEgY29ycmVsYXRpb24gSUQgaWYgbm8gc3VjaCBJRCBleGlzdHNcbiAqIFxuICogQHBhcmFtIGhlYWRlciAtICBcbiAqIEByZXR1cm5zIFxuICovXG5leHBvcnQgZnVuY3Rpb24gY29ycmVsYXRpb25NaWRkbGV3YXJlKGhlYWRlciA9ICd4LWNvcnJlbGF0aW9uLWlkJykge1xuICAgIHJldHVybiAocmVxdWVzdDogUmVxdWVzdCwgcmVzcG9uc2U6IFJlc3BvbnNlLCBuZXh0OiBOZXh0RnVuY3Rpb24pID0+IHtcbiAgICAgICAgbGV0IGNvcnJlbGF0aW9uSWQgPSByZXF1ZXN0LmhlYWRlcnNbaGVhZGVyXSBhcyBzdHJpbmcgfHwgZ2VuZXJhdGVDb3JyZWxhdGlvbklkKCk7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5ydW4oY29ycmVsYXRpb25JZCwgYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgbmV4dCgpO1xuICAgICAgICB9KTtcbiAgICB9XG59XG5cbmNvbnN0IGdlbmVyYXRlQ29ycmVsYXRpb25JZCA9ICgpID0+IHV1aWR2NCgpO1xuXG5leHBvcnQgZnVuY3Rpb24gd2l0aENvcnJlbGF0aW9uKCkge1xuICAgIHJldHVybiBsb2NhbFN0b3JhZ2UuZ2V0U3RvcmUoKTtcbn0iXX0=