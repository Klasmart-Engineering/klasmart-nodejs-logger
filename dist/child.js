"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _axios = _interopRequireDefault(require("axios"));

process.on('message', /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(_ref) {
    var path, buffer, key;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            path = _ref.path, buffer = _ref.buffer, key = _ref.key;
            _context.next = 3;
            return sendLogs(path, buffer, key);

          case 3:
            process.exit(0);

          case 4:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function (_x) {
    return _ref2.apply(this, arguments);
  };
}());

var send = process.send || function () {};

function sendLogs(path, key, buffer) {
  return _axios["default"].post("path", buffer, {
    headers: {
      'Accept': '*/*',
      'Api-Key': key,
      'Content-Encoding': 'gzip',
      'Content-Length': '' + buffer.byteLength,
      'Content-Type': 'application/gzip'
    }
  }).then(function (response) {
    if ([200, 202].includes(response.status)) {
      send(['silly', "Log payload accepted by New Relic API. Request ID: ".concat(response.data.requestId)]);
    } else {
      send(['warn', "Unexpected successful response status code from NR: ".concat(response.status)]);
    }
  })["catch"](function (err) {
    send(['error', 'Error sending log payload to New Relic']);
    send(['error', err.stack]);
  });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jaGlsZC50cyJdLCJuYW1lcyI6WyJwcm9jZXNzIiwib24iLCJwYXRoIiwiYnVmZmVyIiwia2V5Iiwic2VuZExvZ3MiLCJleGl0Iiwic2VuZCIsIkF4aW9zIiwicG9zdCIsImhlYWRlcnMiLCJieXRlTGVuZ3RoIiwidGhlbiIsInJlc3BvbnNlIiwiaW5jbHVkZXMiLCJzdGF0dXMiLCJkYXRhIiwicmVxdWVzdElkIiwiZXJyIiwic3RhY2siXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUE7O0FBRUFBLE9BQU8sQ0FBQ0MsRUFBUixDQUFXLFNBQVg7QUFBQSw0RkFBc0I7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQVFDLFlBQUFBLElBQVIsUUFBUUEsSUFBUixFQUFjQyxNQUFkLFFBQWNBLE1BQWQsRUFBc0JDLEdBQXRCLFFBQXNCQSxHQUF0QjtBQUFBO0FBQUEsbUJBQ1pDLFFBQVEsQ0FBQ0gsSUFBRCxFQUFPQyxNQUFQLEVBQWVDLEdBQWYsQ0FESTs7QUFBQTtBQUVsQkosWUFBQUEsT0FBTyxDQUFDTSxJQUFSLENBQWEsQ0FBYjs7QUFGa0I7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsR0FBdEI7O0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBS0EsSUFBTUMsSUFBSSxHQUFHUCxPQUFPLENBQUNPLElBQVIsSUFBaUIsWUFBTSxDQUFFLENBQXRDOztBQUVBLFNBQVNGLFFBQVQsQ0FBa0JILElBQWxCLEVBQWdDRSxHQUFoQyxFQUE2Q0QsTUFBN0MsRUFBNkQ7QUFDekQsU0FBT0ssa0JBQU1DLElBQU4sU0FBbUJOLE1BQW5CLEVBQTJCO0FBQzlCTyxJQUFBQSxPQUFPLEVBQUU7QUFDTCxnQkFBVSxLQURMO0FBRUwsaUJBQVdOLEdBRk47QUFHTCwwQkFBb0IsTUFIZjtBQUlMLHdCQUFrQixLQUFHRCxNQUFNLENBQUNRLFVBSnZCO0FBS0wsc0JBQWdCO0FBTFg7QUFEcUIsR0FBM0IsRUFRSkMsSUFSSSxDQVFDLFVBQUFDLFFBQVEsRUFBSTtBQUNoQixRQUFJLENBQUMsR0FBRCxFQUFNLEdBQU4sRUFBV0MsUUFBWCxDQUFvQkQsUUFBUSxDQUFDRSxNQUE3QixDQUFKLEVBQTBDO0FBQ3RDUixNQUFBQSxJQUFJLENBQUMsQ0FBQyxPQUFELCtEQUFnRU0sUUFBUSxDQUFDRyxJQUFULENBQWNDLFNBQTlFLEVBQUQsQ0FBSjtBQUNILEtBRkQsTUFFTztBQUNIVixNQUFBQSxJQUFJLENBQUMsQ0FBQyxNQUFELGdFQUFnRU0sUUFBUSxDQUFDRSxNQUF6RSxFQUFELENBQUo7QUFDSDtBQUVKLEdBZk0sV0FlRSxVQUFBRyxHQUFHLEVBQUk7QUFDWlgsSUFBQUEsSUFBSSxDQUFDLENBQUMsT0FBRCxFQUFVLHdDQUFWLENBQUQsQ0FBSjtBQUNBQSxJQUFBQSxJQUFJLENBQUMsQ0FBQyxPQUFELEVBQVVXLEdBQUcsQ0FBQ0MsS0FBZCxDQUFELENBQUo7QUFDSCxHQWxCTSxDQUFQO0FBbUJIIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEF4aW9zIGZyb20gJ2F4aW9zJztcblxucHJvY2Vzcy5vbignbWVzc2FnZScsIGFzeW5jICh7cGF0aCwgYnVmZmVyLCBrZXl9KSA9PiB7XG4gICAgYXdhaXQgc2VuZExvZ3MocGF0aCwgYnVmZmVyLCBrZXkpXG4gICAgcHJvY2Vzcy5leGl0KDApO1xufSlcblxuY29uc3Qgc2VuZCA9IHByb2Nlc3Muc2VuZCB8fCAoKCkgPT4ge30pO1xuXG5mdW5jdGlvbiBzZW5kTG9ncyhwYXRoOiBzdHJpbmcsIGtleTogc3RyaW5nLCBidWZmZXI6IEJ1ZmZlcikge1xuICAgIHJldHVybiBBeGlvcy5wb3N0KGBwYXRoYCwgYnVmZmVyLCB7XG4gICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICdBY2NlcHQnOiAnKi8qJyxcbiAgICAgICAgICAgICdBcGktS2V5Jzoga2V5LFxuICAgICAgICAgICAgJ0NvbnRlbnQtRW5jb2RpbmcnOiAnZ3ppcCcsXG4gICAgICAgICAgICAnQ29udGVudC1MZW5ndGgnOiAnJytidWZmZXIuYnl0ZUxlbmd0aCxcbiAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vZ3ppcCcsXG4gICAgICAgIH1cbiAgICB9KS50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgICAgaWYgKFsyMDAsIDIwMl0uaW5jbHVkZXMocmVzcG9uc2Uuc3RhdHVzKSkge1xuICAgICAgICAgICAgc2VuZChbJ3NpbGx5JywgYExvZyBwYXlsb2FkIGFjY2VwdGVkIGJ5IE5ldyBSZWxpYyBBUEkuIFJlcXVlc3QgSUQ6ICR7cmVzcG9uc2UuZGF0YS5yZXF1ZXN0SWR9YF0pXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzZW5kKFsnd2FybicsIGBVbmV4cGVjdGVkIHN1Y2Nlc3NmdWwgcmVzcG9uc2Ugc3RhdHVzIGNvZGUgZnJvbSBOUjogJHtyZXNwb25zZS5zdGF0dXN9YF0pXG4gICAgICAgIH1cblxuICAgIH0pLmNhdGNoKGVyciA9PiB7XG4gICAgICAgIHNlbmQoWydlcnJvcicsICdFcnJvciBzZW5kaW5nIGxvZyBwYXlsb2FkIHRvIE5ldyBSZWxpYyddKTtcbiAgICAgICAgc2VuZChbJ2Vycm9yJywgZXJyLnN0YWNrXSlcbiAgICB9KVxufSJdfQ==