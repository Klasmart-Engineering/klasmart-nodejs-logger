"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DEFAULT_CORRELATION_HEADER = void 0;
exports.correlationContextWrapper = correlationContextWrapper;
exports.correlationMiddleware = correlationMiddleware;
exports.withCorrelation = withCorrelation;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _uuid = require("uuid");

var _async_hooks = require("async_hooks");

var _http = _interopRequireDefault(require("http"));

var _https = _interopRequireDefault(require("https"));

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
    response.setHeader(header, correlationId);
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
/**
 * Utility function to provide access to correlation ID tracking in the
 * wrapped async context. Consumers may manually supply the correlation ID or
 * this function will generate a correlation ID as a v4 UUID.
 */


function correlationContextWrapper(_x, _x2) {
  return _correlationContextWrapper.apply(this, arguments);
}

function _correlationContextWrapper() {
  _correlationContextWrapper = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(a, b) {
    var correlationId, callback;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            /* Determine which overload is being called and assign variables appropriately */
            if (typeof a === 'string') {
              correlationId = a;
            } else {
              correlationId = generateCorrelationId();
            }

            if (!(a instanceof Function)) {
              _context3.next = 5;
              break;
            }

            callback = a;
            _context3.next = 10;
            break;

          case 5:
            if (!(b instanceof Function)) {
              _context3.next = 9;
              break;
            }

            callback = b;
            _context3.next = 10;
            break;

          case 9:
            throw Error("Invalid parameters: A callback function must be provided.");

          case 10:
            _context3.next = 12;
            return localStorage.run(correlationId, /*#__PURE__*/(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
              var result;
              return _regenerator["default"].wrap(function _callee2$(_context2) {
                while (1) {
                  switch (_context2.prev = _context2.next) {
                    case 0:
                      result = callback();

                      if (!(result instanceof Promise)) {
                        _context2.next = 4;
                        break;
                      }

                      _context2.next = 4;
                      return result;

                    case 4:
                    case "end":
                      return _context2.stop();
                  }
                }
              }, _callee2);
            })));

          case 12:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));
  return _correlationContextWrapper.apply(this, arguments);
}

var generateCorrelationId = function generateCorrelationId() {
  return (0, _uuid.v4)();
};

function withCorrelation() {
  return localStorage.getStore();
}
/**
 * Adds hooks to http/https modules to automatically attach a correlation
 * ID to outgoing requests
 */


function attachCorrelationIDHook(module) {
  var actualCall = module.request;

  function request(url, options, callback) {
    var _actualOptions, _actualOptions2;

    // Logic around painful overloading
    var actualUrl;
    var actualOptions;
    var actualCallback;
    ;

    if (url instanceof URL || typeof url === 'string') {
      actualUrl = url;
      actualOptions = options || {};
      actualCallback = callback;
    } else {
      actualOptions = url || {};
      actualCallback = options;
    } // Get correlation ID


    var correlationId = withCorrelation(); // Case: Headers object is present but no correlationID provided

    if (correlationId && (_actualOptions = actualOptions) !== null && _actualOptions !== void 0 && _actualOptions.headers && !actualOptions.headers[DEFAULT_CORRELATION_HEADER]) {
      actualOptions.headers[DEFAULT_CORRELATION_HEADER] = correlationId;
    } // Case: Headers option was not passed, add both headers option and correlationID


    if (correlationId && !((_actualOptions2 = actualOptions) !== null && _actualOptions2 !== void 0 && _actualOptions2.headers)) {
      actualOptions.headers = {};
      actualOptions.headers[DEFAULT_CORRELATION_HEADER] = correlationId;
    } // Delegate to wrapped request call


    return actualCall(actualOptions, actualCallback);
  }

  module.request = request;
}

attachCorrelationIDHook(_http["default"]);
attachCorrelationIDHook(_https["default"]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jb3JyZWxhdGlvbi1taWRkbGV3YXJlLnRzIl0sIm5hbWVzIjpbIkRFRkFVTFRfQ09SUkVMQVRJT05fSEVBREVSIiwibG9jYWxTdG9yYWdlIiwiQXN5bmNMb2NhbFN0b3JhZ2UiLCJjb3JyZWxhdGlvbk1pZGRsZXdhcmUiLCJoZWFkZXIiLCJyZXF1ZXN0IiwicmVzcG9uc2UiLCJuZXh0IiwiY29ycmVsYXRpb25JZCIsImhlYWRlcnMiLCJnZW5lcmF0ZUNvcnJlbGF0aW9uSWQiLCJzZXRIZWFkZXIiLCJydW4iLCJjb3JyZWxhdGlvbkNvbnRleHRXcmFwcGVyIiwiYSIsImIiLCJGdW5jdGlvbiIsImNhbGxiYWNrIiwiRXJyb3IiLCJyZXN1bHQiLCJQcm9taXNlIiwid2l0aENvcnJlbGF0aW9uIiwiZ2V0U3RvcmUiLCJhdHRhY2hDb3JyZWxhdGlvbklESG9vayIsIm1vZHVsZSIsImFjdHVhbENhbGwiLCJ1cmwiLCJvcHRpb25zIiwiYWN0dWFsVXJsIiwiYWN0dWFsT3B0aW9ucyIsImFjdHVhbENhbGxiYWNrIiwiVVJMIiwiaHR0cCIsImh0dHBzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRU8sSUFBTUEsMEJBQTBCLEdBQUcsa0JBQW5DOztBQUVQLElBQU1DLFlBQVksR0FBRyxJQUFJQyw4QkFBSixFQUFyQjtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUNPLFNBQVNDLHFCQUFULEdBQW9FO0FBQUEsTUFBckNDLE1BQXFDLHVFQUE1QkosMEJBQTRCO0FBQ3ZFLFNBQU8sVUFBQ0ssT0FBRCxFQUFtQkMsUUFBbkIsRUFBdUNDLElBQXZDLEVBQThEO0FBQ2pFLFFBQUlDLGFBQWEsR0FBR0gsT0FBTyxDQUFDSSxPQUFSLENBQWdCTCxNQUFoQixLQUFxQ00scUJBQXFCLEVBQTlFO0FBQ0FKLElBQUFBLFFBQVEsQ0FBQ0ssU0FBVCxDQUFtQlAsTUFBbkIsRUFBMkJJLGFBQTNC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QXhCO0FBQ0FvQixNQUFBQSxhQUFhLENBQUNwQixPQUFkLENBQXNCVCwwQkFBdEIsSUFBb0RRLGFBQXBEO0FBQ0gsS0EzQkgsQ0E2QkU7OztBQUNBLFdBQU9pQixVQUFVLENBQUNJLGFBQUQsRUFBZ0JDLGNBQWhCLENBQWpCO0FBQ0g7O0FBQ0ROLEVBQUFBLE1BQU0sQ0FBQ25CLE9BQVAsR0FBaUJBLE9BQWpCO0FBQ0g7O0FBRURrQix1QkFBdUIsQ0FBQ1MsZ0JBQUQsQ0FBdkI7QUFDQVQsdUJBQXVCLENBQUNVLGlCQUFELENBQXZCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmV4dEZ1bmN0aW9uLCBSZXF1ZXN0LCBSZXNwb25zZSB9IGZyb20gJ2V4cHJlc3MnO1xuaW1wb3J0IHsgdjQgYXMgdXVpZHY0IH0gZnJvbSAndXVpZCc7XG5pbXBvcnQgeyBBc3luY0xvY2FsU3RvcmFnZSB9IGZyb20gJ2FzeW5jX2hvb2tzJztcbmltcG9ydCBodHRwLCB7IEluY29taW5nTWVzc2FnZSB9IGZyb20gJ2h0dHAnO1xuaW1wb3J0IGh0dHBzLCB7IFJlcXVlc3RPcHRpb25zIH0gZnJvbSAnaHR0cHMnO1xuXG5leHBvcnQgY29uc3QgREVGQVVMVF9DT1JSRUxBVElPTl9IRUFERVIgPSAneC1jb3JyZWxhdGlvbi1pZCdcblxuY29uc3QgbG9jYWxTdG9yYWdlID0gbmV3IEFzeW5jTG9jYWxTdG9yYWdlPHN0cmluZz4oKTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbWlkZGxld2FyZSBmdW5jdGlvbiB0byBleHRyYWN0IGEgY29ycmVsYXRpb24gSUQgZnJvbSBhbiBpbmNvbWluZyByZXF1ZXN0IG9yIHRvIGNyZWF0ZVxuICogYSBjb3JyZWxhdGlvbiBJRCBpZiBubyBzdWNoIElEIGV4aXN0c1xuICogXG4gKiBAcGFyYW0gaGVhZGVyIC0gIFxuICogQHJldHVybnMgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb3JyZWxhdGlvbk1pZGRsZXdhcmUoaGVhZGVyID0gREVGQVVMVF9DT1JSRUxBVElPTl9IRUFERVIpIHtcbiAgICByZXR1cm4gKHJlcXVlc3Q6IFJlcXVlc3QsIHJlc3BvbnNlOiBSZXNwb25zZSwgbmV4dDogTmV4dEZ1bmN0aW9uKSA9PiB7XG4gICAgICAgIGxldCBjb3JyZWxhdGlvbklkID0gcmVxdWVzdC5oZWFkZXJzW2hlYWRlcl0gYXMgc3RyaW5nIHx8IGdlbmVyYXRlQ29ycmVsYXRpb25JZCgpO1xuICAgICAgICByZXNwb25zZS5zZXRIZWFkZXIoaGVhZGVyLCBjb3JyZWxhdGlvbklkKTtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnJ1bihjb3JyZWxhdGlvbklkLCBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICBuZXh0KCk7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuLyoqXG4gKiBVdGlsaXR5IGZ1bmN0aW9uIHRvIHByb3ZpZGUgYWNjZXNzIHRvIGNvcnJlbGF0aW9uIElEIHRyYWNraW5nIGluIHRoZVxuICogd3JhcHBlZCBhc3luYyBjb250ZXh0LiBDb25zdW1lcnMgbWF5IG1hbnVhbGx5IHN1cHBseSB0aGUgY29ycmVsYXRpb24gSUQgb3JcbiAqIHRoaXMgZnVuY3Rpb24gd2lsbCBnZW5lcmF0ZSBhIGNvcnJlbGF0aW9uIElEIGFzIGEgdjQgVVVJRC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNvcnJlbGF0aW9uQ29udGV4dFdyYXBwZXIoY29ycmVsYXRpb25JZDogc3RyaW5nLCBjYWxsYmFjazogKCkgPT4gYW55KTogUHJvbWlzZTx2b2lkPjtcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjb3JyZWxhdGlvbkNvbnRleHRXcmFwcGVyKGNhbGxiYWNrOiAoKSA9PiBhbnkpOiBQcm9taXNlPHZvaWQ+O1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNvcnJlbGF0aW9uQ29udGV4dFdyYXBwZXIoYTogc3RyaW5nIHwgKCgpID0+IHZvaWQpLCBiPzogKCgpID0+IGFueSkpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBsZXQgY29ycmVsYXRpb25JZDogc3RyaW5nO1xuICAgIGxldCBjYWxsYmFjazogKCkgPT4gYW55O1xuICAgIFxuICAgIC8qIERldGVybWluZSB3aGljaCBvdmVybG9hZCBpcyBiZWluZyBjYWxsZWQgYW5kIGFzc2lnbiB2YXJpYWJsZXMgYXBwcm9wcmlhdGVseSAqL1xuICAgIGlmICh0eXBlb2YgYSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgY29ycmVsYXRpb25JZCA9IGE7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgY29ycmVsYXRpb25JZCA9IGdlbmVyYXRlQ29ycmVsYXRpb25JZCgpO1xuICAgIH1cblxuICAgIGlmIChhIGluc3RhbmNlb2YgRnVuY3Rpb24pIHtcbiAgICAgICAgY2FsbGJhY2sgPSBhO1xuICAgIH0gZWxzZSBpZiAoYiBpbnN0YW5jZW9mIEZ1bmN0aW9uKSB7XG4gICAgICAgIGNhbGxiYWNrID0gYjtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBFcnJvcihgSW52YWxpZCBwYXJhbWV0ZXJzOiBBIGNhbGxiYWNrIGZ1bmN0aW9uIG11c3QgYmUgcHJvdmlkZWQuYClcbiAgICB9XG5cbiAgICAvKiBSdW4gY2FsbGJhY2sgd2l0aGluIGxvY2FsIHN0b3JhZ2UgY29udGV4dCovXG4gICAgYXdhaXQgbG9jYWxTdG9yYWdlLnJ1bihjb3JyZWxhdGlvbklkLCBhc3luYyAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGNhbGxiYWNrKCk7XG4gICAgICAgIGlmIChyZXN1bHQgaW5zdGFuY2VvZiBQcm9taXNlKSB7XG4gICAgICAgICAgICBhd2FpdCByZXN1bHQ7XG4gICAgICAgIH1cbiAgICB9KVxufVxuXG5jb25zdCBnZW5lcmF0ZUNvcnJlbGF0aW9uSWQgPSAoKSA9PiB1dWlkdjQoKTtcblxuZXhwb3J0IGZ1bmN0aW9uIHdpdGhDb3JyZWxhdGlvbigpIHtcbiAgICByZXR1cm4gbG9jYWxTdG9yYWdlLmdldFN0b3JlKCk7XG59XG5cbi8qKlxuICogQWRkcyBob29rcyB0byBodHRwL2h0dHBzIG1vZHVsZXMgdG8gYXV0b21hdGljYWxseSBhdHRhY2ggYSBjb3JyZWxhdGlvblxuICogSUQgdG8gb3V0Z29pbmcgcmVxdWVzdHNcbiAqL1xuZnVuY3Rpb24gYXR0YWNoQ29ycmVsYXRpb25JREhvb2sobW9kdWxlOiB0eXBlb2YgaHR0cCB8IHR5cGVvZiBodHRwcykge1xuICAgIGxldCBhY3R1YWxDYWxsID0gbW9kdWxlLnJlcXVlc3Q7XG5cbiAgICBmdW5jdGlvbiByZXF1ZXN0KG9wdGlvbnM6IFJlcXVlc3RPcHRpb25zIHwgc3RyaW5nIHwgVVJMLCBjYWxsYmFjaz86IChyZXM6IGh0dHAuSW5jb21pbmdNZXNzYWdlKSA9PiB2b2lkKTogaHR0cC5DbGllbnRSZXF1ZXN0O1xuICAgIGZ1bmN0aW9uIHJlcXVlc3QodXJsOiBzdHJpbmcgfCBVUkwsIG9wdGlvbnM6IFJlcXVlc3RPcHRpb25zLCBjYWxsYmFjaz86IChyZXM6IGh0dHAuSW5jb21pbmdNZXNzYWdlKSA9PiB2b2lkKTogaHR0cC5DbGllbnRSZXF1ZXN0O1xuICAgIGZ1bmN0aW9uIHJlcXVlc3QoXG4gICAgICAgIHVybDogc3RyaW5nIHwgVVJMIHwgUmVxdWVzdE9wdGlvbnMsIFxuICAgICAgICBvcHRpb25zOiBSZXF1ZXN0T3B0aW9ucyB8ICgocmVzOiBodHRwLkluY29taW5nTWVzc2FnZSkgPT4gdm9pZCkgfCB1bmRlZmluZWQsXG4gICAgICAgIGNhbGxiYWNrPzogKHJlczogaHR0cC5JbmNvbWluZ01lc3NhZ2UpID0+IHZvaWQgfCB1bmRlZmluZWRcbiAgICApIHtcbiAgICAgICAgLy8gTG9naWMgYXJvdW5kIHBhaW5mdWwgb3ZlcmxvYWRpbmdcbiAgICAgICAgbGV0IGFjdHVhbFVybDogc3RyaW5nIHwgVVJMO1xuICAgICAgICBsZXQgYWN0dWFsT3B0aW9uczogUmVxdWVzdE9wdGlvbnM7XG4gICAgICAgIGxldCBhY3R1YWxDYWxsYmFjazogKChyZXM6IGh0dHAuSW5jb21pbmdNZXNzYWdlKSA9PiB2b2lkKSB8IHVuZGVmaW5lZDs7XG4gICAgICAgIFxuICAgICAgICBpZiAodXJsIGluc3RhbmNlb2YgVVJMIHx8IHR5cGVvZiB1cmwgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBhY3R1YWxVcmwgPSB1cmw7XG4gICAgICAgICAgICBhY3R1YWxPcHRpb25zID0gb3B0aW9ucyBhcyBSZXF1ZXN0T3B0aW9ucyB8fCB7fTtcbiAgICAgICAgICAgIGFjdHVhbENhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhY3R1YWxPcHRpb25zID0gdXJsIHx8IHt9O1xuICAgICAgICAgICAgYWN0dWFsQ2FsbGJhY2sgPSBvcHRpb25zIGFzIChyZXM6IGh0dHAuSW5jb21pbmdNZXNzYWdlKSA9PiB2b2lkO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gR2V0IGNvcnJlbGF0aW9uIElEXG4gICAgICAgIGNvbnN0IGNvcnJlbGF0aW9uSWQgPSB3aXRoQ29ycmVsYXRpb24oKTtcblxuICAgICAgICAvLyBDYXNlOiBIZWFkZXJzIG9iamVjdCBpcyBwcmVzZW50IGJ1dCBubyBjb3JyZWxhdGlvbklEIHByb3ZpZGVkXG4gICAgICAgIGlmIChjb3JyZWxhdGlvbklkICYmIGFjdHVhbE9wdGlvbnM/LmhlYWRlcnMgJiYgIWFjdHVhbE9wdGlvbnMuaGVhZGVyc1tERUZBVUxUX0NPUlJFTEFUSU9OX0hFQURFUl0pIHtcbiAgICAgICAgICAgIGFjdHVhbE9wdGlvbnMuaGVhZGVyc1tERUZBVUxUX0NPUlJFTEFUSU9OX0hFQURFUl0gPSBjb3JyZWxhdGlvbklkO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2FzZTogSGVhZGVycyBvcHRpb24gd2FzIG5vdCBwYXNzZWQsIGFkZCBib3RoIGhlYWRlcnMgb3B0aW9uIGFuZCBjb3JyZWxhdGlvbklEXG4gICAgICAgIGlmIChjb3JyZWxhdGlvbklkICYmICFhY3R1YWxPcHRpb25zPy5oZWFkZXJzKSB7XG4gICAgICAgICAgICBhY3R1YWxPcHRpb25zLmhlYWRlcnMgPSB7fTtcbiAgICAgICAgICAgIGFjdHVhbE9wdGlvbnMuaGVhZGVyc1tERUZBVUxUX0NPUlJFTEFUSU9OX0hFQURFUl0gPSBjb3JyZWxhdGlvbklkO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRGVsZWdhdGUgdG8gd3JhcHBlZCByZXF1ZXN0IGNhbGxcbiAgICAgICAgcmV0dXJuIGFjdHVhbENhbGwoYWN0dWFsT3B0aW9ucywgYWN0dWFsQ2FsbGJhY2spXG4gICAgfVxuICAgIG1vZHVsZS5yZXF1ZXN0ID0gcmVxdWVzdDtcbn1cblxuYXR0YWNoQ29ycmVsYXRpb25JREhvb2soaHR0cCk7XG5hdHRhY2hDb3JyZWxhdGlvbklESG9vayhodHRwcyk7Il19