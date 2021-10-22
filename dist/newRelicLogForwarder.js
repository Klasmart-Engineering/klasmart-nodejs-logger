"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NewRelicLogForwarderTransport = NewRelicLogForwarderTransport;

var _nodeStream = require("node:stream");

var _https = _interopRequireDefault(require("https"));

var _zlib = _interopRequireDefault(require("zlib"));

var _fs = _interopRequireDefault(require("fs"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var API_ENDPOINT = process.env.KL_NR_LOG_ENDPOINT || 'https://log-api.eu.newrelic.com/log/v1';
var MAX_PAYLOAD_SIZE = Math.pow(10, 6);
var MAX_ATTRIBUTES_PER_EVENT = 255;
var MAX_ATTRIBUTE_NAME_LENGTH = 255;
var MAX_ATTRIBUTE_VALUE_LENGTH = 4096;
var buffer = [];

function NewRelicLogForwarderTransport(config) {
  var stream = new _nodeStream.PassThrough();
  var minLogItems = (config === null || config === void 0 ? void 0 : config.minLogItems) || 1;
  var timeoutId;
  var compressorConfig = {};

  var compressor = _zlib["default"].createGzip(compressorConfig);

  stream.on('data', function (log) {
    log = patchLog(log);
    compressor.write(log);

    if (compressor.bytesWritten > ((config === null || config === void 0 ? void 0 : config.bytesWrittenThreshold) || 10000)) {
      pushLogs();
    }
  });
  /**
   * Fixes possible issues in log format caused by limitations of NRs logging
   * values
   * @param log 
   * @returns 
   */

  function patchLog(log) {
    // Object form of log message
    var obj = JSON.parse(log); // Track whether modifications are made

    var modified = false;

    if (Object.getOwnPropertyNames(obj).length > MAX_ATTRIBUTES_PER_EVENT) {
      console.warn("Log to send to JSON contains ".concat(Object.getOwnPropertyNames(obj), " / ").concat(MAX_ATTRIBUTES_PER_EVENT, " attributes."));
    }

    for (var _i = 0, _Object$keys = Object.keys(obj); _i < _Object$keys.length; _i++) {
      var key = _Object$keys[_i];
      var value = obj[key]; // replace key with length too high

      if (key.length > MAX_ATTRIBUTE_NAME_LENGTH) {
        var newKey = key.slice(0, MAX_ATTRIBUTE_NAME_LENGTH);
        Object.defineProperty(obj, key.slice(0, MAX_ATTRIBUTE_NAME_LENGTH), Object.getOwnPropertyDescriptor(obj, key));
        delete obj.key; // Update key name for usage in later steps

        key = newKey;
        modified = true;
      } // Concatenate log messages with length greater than MAX_ATTRIBUTE_VALUE_LENGTH


      if (typeof value === 'string' && value.length > MAX_ATTRIBUTE_VALUE_LENGTH) {
        if (config !== null && config !== void 0 && config.warnOnAttributeLengthOverflow) {
          console.warn("NR Log attribute length overflow. Length: ".concat(value.length, "/").concat(MAX_ATTRIBUTE_VALUE_LENGTH));
        }

        obj.key = value.slice(0, MAX_ATTRIBUTE_VALUE_LENGTH);
        modified = true;
      }

      if (key.includes(' ')) {
        var _newKey = key.replaceAll(' ', '.');

        Object.defineProperty(obj, key.slice(0, MAX_ATTRIBUTE_NAME_LENGTH), Object.getOwnPropertyDescriptor(obj, key));
        delete obj.key; // Update key name for usage in later steps

        key = _newKey;
        modified = true;
      }

      ;
    } // If we made changes stringify the new object data, otherwise return the original log


    return modified ? JSON.stringify(obj) : log;
  }

  function pushLogsTimeout() {
    var frequency = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 10000;
    setTimeout( /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (!logsPushable()) {
                _context.next = 4;
                break;
              }

              _context.next = 3;
              return pushLogs();

            case 3:
              timeoutId = pushLogsTimeout();

            case 4:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    })), frequency);
  }

  function logsPushable() {
    if (buffer.length < minLogItems) return false;
    return true;
  }

  var pushLogs = /*#__PURE__*/function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
      var options, req;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              options = {
                hostname: API_ENDPOINT,
                method: 'POST',
                headers: {
                  'Content-Type': 'application/gzip'
                }
              };
              req = _https["default"].request(options, function (res) {});
              compressor.pipe(req);

            case 3:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2);
    }));

    return function pushLogs() {
      return _ref2.apply(this, arguments);
    };
  }();

  var localWriteLogs = /*#__PURE__*/function () {
    var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
      var output;
      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              output = _fs["default"].createWriteStream('./test.log', {
                flags: 'a',
                autoClose: true
              });
              output.on('close', function () {
                compressor.unpipe();
              });
              compressor.pipe(output);

            case 3:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3);
    }));

    return function localWriteLogs() {
      return _ref3.apply(this, arguments);
    };
  }();

  var getPushableData = function getPushableData() {
    var sendableData = [];
    var totalSize = 0;

    while (buffer.length !== 0) {
      if (totalSize + totalSize <= MAX_PAYLOAD_SIZE) {
        var message = buffer.shift();
        totalSize += message.length;
        sendableData.push(message);
      } else break;
    }

    return sendableData;
  }; // Start timeouts to check


  timeoutId = pushLogsTimeout();
  return stream;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9uZXdSZWxpY0xvZ0ZvcndhcmRlci50cyJdLCJuYW1lcyI6WyJBUElfRU5EUE9JTlQiLCJwcm9jZXNzIiwiZW52IiwiS0xfTlJfTE9HX0VORFBPSU5UIiwiTUFYX1BBWUxPQURfU0laRSIsIk1BWF9BVFRSSUJVVEVTX1BFUl9FVkVOVCIsIk1BWF9BVFRSSUJVVEVfTkFNRV9MRU5HVEgiLCJNQVhfQVRUUklCVVRFX1ZBTFVFX0xFTkdUSCIsImJ1ZmZlciIsIk5ld1JlbGljTG9nRm9yd2FyZGVyVHJhbnNwb3J0IiwiY29uZmlnIiwic3RyZWFtIiwiUGFzc1Rocm91Z2giLCJtaW5Mb2dJdGVtcyIsInRpbWVvdXRJZCIsImNvbXByZXNzb3JDb25maWciLCJjb21wcmVzc29yIiwiemxpYiIsImNyZWF0ZUd6aXAiLCJvbiIsImxvZyIsInBhdGNoTG9nIiwid3JpdGUiLCJieXRlc1dyaXR0ZW4iLCJieXRlc1dyaXR0ZW5UaHJlc2hvbGQiLCJwdXNoTG9ncyIsIm9iaiIsIkpTT04iLCJwYXJzZSIsIm1vZGlmaWVkIiwiT2JqZWN0IiwiZ2V0T3duUHJvcGVydHlOYW1lcyIsImxlbmd0aCIsImNvbnNvbGUiLCJ3YXJuIiwia2V5cyIsImtleSIsInZhbHVlIiwibmV3S2V5Iiwic2xpY2UiLCJkZWZpbmVQcm9wZXJ0eSIsImdldE93blByb3BlcnR5RGVzY3JpcHRvciIsIndhcm5PbkF0dHJpYnV0ZUxlbmd0aE92ZXJmbG93IiwiaW5jbHVkZXMiLCJyZXBsYWNlQWxsIiwic3RyaW5naWZ5IiwicHVzaExvZ3NUaW1lb3V0IiwiZnJlcXVlbmN5Iiwic2V0VGltZW91dCIsImxvZ3NQdXNoYWJsZSIsIm9wdGlvbnMiLCJob3N0bmFtZSIsIm1ldGhvZCIsImhlYWRlcnMiLCJyZXEiLCJodHRwcyIsInJlcXVlc3QiLCJyZXMiLCJwaXBlIiwibG9jYWxXcml0ZUxvZ3MiLCJvdXRwdXQiLCJmcyIsImNyZWF0ZVdyaXRlU3RyZWFtIiwiZmxhZ3MiLCJhdXRvQ2xvc2UiLCJ1bnBpcGUiLCJnZXRQdXNoYWJsZURhdGEiLCJzZW5kYWJsZURhdGEiLCJ0b3RhbFNpemUiLCJtZXNzYWdlIiwic2hpZnQiLCJwdXNoIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7Ozs7O0FBRUEsSUFBTUEsWUFBWSxHQUFHQyxPQUFPLENBQUNDLEdBQVIsQ0FBWUMsa0JBQVosSUFBa0Msd0NBQXZEO0FBQ0EsSUFBTUMsZ0JBQWdCLFlBQUcsRUFBSCxFQUFPLENBQVAsQ0FBdEI7QUFDQSxJQUFNQyx3QkFBd0IsR0FBRyxHQUFqQztBQUNBLElBQU1DLHlCQUF5QixHQUFHLEdBQWxDO0FBQ0EsSUFBTUMsMEJBQTBCLEdBQUcsSUFBbkM7QUFFQSxJQUFNQyxNQUFnQixHQUFHLEVBQXpCOztBQStCTyxTQUFTQyw2QkFBVCxDQUF1Q0MsTUFBdkMsRUFBd0c7QUFFM0csTUFBTUMsTUFBTSxHQUFHLElBQUlDLHVCQUFKLEVBQWY7QUFDQSxNQUFNQyxXQUFXLEdBQUcsQ0FBQUgsTUFBTSxTQUFOLElBQUFBLE1BQU0sV0FBTixZQUFBQSxNQUFNLENBQUVHLFdBQVIsS0FBdUIsQ0FBM0M7QUFDQSxNQUFJQyxTQUFKO0FBQ0EsTUFBTUMsZ0JBQWtDLEdBQUcsRUFBM0M7O0FBSUEsTUFBTUMsVUFBVSxHQUFHQyxpQkFBS0MsVUFBTCxDQUFnQkgsZ0JBQWhCLENBQW5COztBQUVBSixFQUFBQSxNQUFNLENBQUNRLEVBQVAsQ0FBVSxNQUFWLEVBQWtCLFVBQUFDLEdBQUcsRUFBSTtBQUNyQkEsSUFBQUEsR0FBRyxHQUFHQyxRQUFRLENBQUNELEdBQUQsQ0FBZDtBQUNBSixJQUFBQSxVQUFVLENBQUNNLEtBQVgsQ0FBaUJGLEdBQWpCOztBQUVBLFFBQUlKLFVBQVUsQ0FBQ08sWUFBWCxJQUEyQixDQUFBYixNQUFNLFNBQU4sSUFBQUEsTUFBTSxXQUFOLFlBQUFBLE1BQU0sQ0FBRWMscUJBQVIsS0FBaUMsS0FBNUQsQ0FBSixFQUF3RTtBQUNwRUMsTUFBQUEsUUFBUTtBQUNYO0FBRUos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Z0JFLE1BQWhCOztBQUxtQjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxLQUFIOztBQUFBLG9CQUFkRCxjQUFjO0FBQUE7QUFBQTtBQUFBLEtBQXBCOztBQVFBLE1BQU1PLGVBQWUsR0FBRyxTQUFsQkEsZUFBa0IsR0FBTTtBQUMxQixRQUFNQyxZQUFZLEdBQUcsRUFBckI7QUFDQSxRQUFJQyxTQUFTLEdBQUcsQ0FBaEI7O0FBQ0EsV0FBTTVELE1BQU0sQ0FBQ3dCLE1BQVAsS0FBa0IsQ0FBeEIsRUFBMkI7QUFDdkIsVUFBSW9DLFNBQVMsR0FBR0EsU0FBWixJQUF5QmhFLGdCQUE3QixFQUErQztBQUMzQyxZQUFNaUUsT0FBTyxHQUFHN0QsTUFBTSxDQUFDOEQsS0FBUCxFQUFoQjtBQUNBRixRQUFBQSxTQUFTLElBQUlDLE9BQU8sQ0FBQ3JDLE1BQXJCO0FBQ0FtQyxRQUFBQSxZQUFZLENBQUNJLElBQWIsQ0FBa0JGLE9BQWxCO0FBQ0gsT0FKRCxNQUlPO0FBQ1Y7O0FBRUQsV0FBT0YsWUFBUDtBQUNILEdBWkQsQ0F0SDJHLENBb0kzRzs7O0FBQ0FyRCxFQUFBQSxTQUFTLEdBQUdnQyxlQUFlLEVBQTNCO0FBRUEsU0FBT25DLE1BQVA7QUFDSCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB3aW5zdG9uIGZyb20gJ3dpbnN0b24nO1xuaW1wb3J0IHsgUGFzc1Rocm91Z2ggfSBmcm9tICdub2RlOnN0cmVhbSc7XG5pbXBvcnQgaHR0cHMgZnJvbSAnaHR0cHMnO1xuaW1wb3J0IHpsaWIgZnJvbSAnemxpYic7XG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuXG5jb25zdCBBUElfRU5EUE9JTlQgPSBwcm9jZXNzLmVudi5LTF9OUl9MT0dfRU5EUE9JTlQgfHwgJ2h0dHBzOi8vbG9nLWFwaS5ldS5uZXdyZWxpYy5jb20vbG9nL3YxJztcbmNvbnN0IE1BWF9QQVlMT0FEX1NJWkUgPSAxMCoqNjtcbmNvbnN0IE1BWF9BVFRSSUJVVEVTX1BFUl9FVkVOVCA9IDI1NTtcbmNvbnN0IE1BWF9BVFRSSUJVVEVfTkFNRV9MRU5HVEggPSAyNTU7XG5jb25zdCBNQVhfQVRUUklCVVRFX1ZBTFVFX0xFTkdUSCA9IDQwOTY7XG5cbmNvbnN0IGJ1ZmZlcjogU3RyaW5nW10gPSBbXTtcblxuaW50ZXJmYWNlIE5ld1JlbGljTG9nRm9yd2FyZGVyVHJhbnNwb3J0Q29uZmlnIHtcbiAgICAvKipcbiAgICAgKiBIb3cgZnJlcXVlbnRseSBjaGVja3Mgc2hvdWxkIGJlIHJ1biB0byBwdXNoIGxvZ3MgdG8gTlJcbiAgICAgKi9cbiAgICBsb2dQdXNoRnJlcXVlbmN5PzogbnVtYmVyO1xuXG4gICAgLyoqXG4gICAgICogTWluaW11bSBudW1iZXIgb2YgbG9nIHN0YXRlbWVudHMgd3JpdHRlbiBiZWZvcmUgbG9ncyBjYW4gYmUgcHVzaGVkIHRvIE5SXG4gICAgICovXG4gICAgbWluTG9nSXRlbXM/OiBudW1iZXI7XG5cbiAgICAvKipcbiAgICAgKiBNaW5pbXVtIG51bWJlciBvZiBieXRlcyB3cml0dGVuIHRvIGNvbXByZXNzaW9uIHN0cmVhbSBiZWZvcmUgcHVzaGluZyB0byBOUlxuICAgICAqL1xuICAgIG1pbkJ5dGVzV3JpdHRlbj86IG51bWJlcjtcblxuICAgIC8qKlxuICAgICAqIFRocmVzaG9sZCBmb3IgYnl0ZXMgd3JpdHRlbiBhdCB3aGljaCBwb2ludCBhIG5ldyB3cml0ZSB0byBOUiB3aWxsIGJlIGF1dG9tYXRpY2FsbHlcbiAgICAgKiB0cmlnZ2VyZWQuIERlZmF1bHRzIHRvICg0LzUgKiBNQVhfUEFZTE9BRF9TSVpFKVxuICAgICAqL1xuICAgIGJ5dGVzV3JpdHRlblRocmVzaG9sZD86IG51bWJlcjtcblxuICAgIC8qKlxuICAgICAqIFByb2R1Y2UgYSB3YXJuaW5nIHdoZW4gYXR0cmlidXRlIHZhbHVlcyBvdmVyZmxvdyB0aGUgTlIgbWF4aW11bSBsZW5ndGggb2YgNDA5Ni5cbiAgICAgKiBEZWZhdWx0IGlzIGZhbHNlLlxuICAgICAqL1xuICAgIHdhcm5PbkF0dHJpYnV0ZUxlbmd0aE92ZXJmbG93PzogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIE5ld1JlbGljTG9nRm9yd2FyZGVyVHJhbnNwb3J0KGNvbmZpZz86IE5ld1JlbGljTG9nRm9yd2FyZGVyVHJhbnNwb3J0Q29uZmlnKTogd2luc3Rvbi50cmFuc3BvcnQge1xuXG4gICAgY29uc3Qgc3RyZWFtID0gbmV3IFBhc3NUaHJvdWdoKCk7XG4gICAgY29uc3QgbWluTG9nSXRlbXMgPSBjb25maWc/Lm1pbkxvZ0l0ZW1zIHx8IDE7XG4gICAgbGV0IHRpbWVvdXRJZDtcbiAgICBjb25zdCBjb21wcmVzc29yQ29uZmlnOiB6bGliLlpsaWJPcHRpb25zID0ge1xuICAgICAgICBcbiAgICB9XG5cbiAgICBjb25zdCBjb21wcmVzc29yID0gemxpYi5jcmVhdGVHemlwKGNvbXByZXNzb3JDb25maWcpO1xuICAgIFxuICAgIHN0cmVhbS5vbignZGF0YScsIGxvZyA9PiB7XG4gICAgICAgIGxvZyA9IHBhdGNoTG9nKGxvZyk7XG4gICAgICAgIGNvbXByZXNzb3Iud3JpdGUobG9nKTtcblxuICAgICAgICBpZiAoY29tcHJlc3Nvci5ieXRlc1dyaXR0ZW4gPiAoY29uZmlnPy5ieXRlc1dyaXR0ZW5UaHJlc2hvbGQgfHwgMTAwMDApKSB7XG4gICAgICAgICAgICBwdXNoTG9ncygpOyAgICAgICAgXG4gICAgICAgIH1cblxuICAgIH0pO1xuXG5cblxuICAgIC8qKlxuICAgICAqIEZpeGVzIHBvc3NpYmxlIGlzc3VlcyBpbiBsb2cgZm9ybWF0IGNhdXNlZCBieSBsaW1pdGF0aW9ucyBvZiBOUnMgbG9nZ2luZ1xuICAgICAqIHZhbHVlc1xuICAgICAqIEBwYXJhbSBsb2cgXG4gICAgICogQHJldHVybnMgXG4gICAgICovXG4gICAgZnVuY3Rpb24gcGF0Y2hMb2cobG9nOiBzdHJpbmcpIHtcblxuICAgICAgICAvLyBPYmplY3QgZm9ybSBvZiBsb2cgbWVzc2FnZVxuICAgICAgICBjb25zdCBvYmogPSBKU09OLnBhcnNlKGxvZyk7XG4gICAgICAgIFxuICAgICAgICAvLyBUcmFjayB3aGV0aGVyIG1vZGlmaWNhdGlvbnMgYXJlIG1hZGVcbiAgICAgICAgbGV0IG1vZGlmaWVkID0gZmFsc2U7XG4gICAgICAgIGlmIChPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhvYmopLmxlbmd0aCA+IE1BWF9BVFRSSUJVVEVTX1BFUl9FVkVOVCkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBMb2cgdG8gc2VuZCB0byBKU09OIGNvbnRhaW5zICR7T2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMob2JqKX0gLyAke01BWF9BVFRSSUJVVEVTX1BFUl9FVkVOVH0gYXR0cmlidXRlcy5gKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgZm9yIChsZXQga2V5IG9mIE9iamVjdC5rZXlzKG9iaikpIHtcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gb2JqW2tleV07XG4gICAgICAgICAgICAvLyByZXBsYWNlIGtleSB3aXRoIGxlbmd0aCB0b28gaGlnaFxuICAgICAgICAgICAgaWYgKGtleS5sZW5ndGggPiBNQVhfQVRUUklCVVRFX05BTUVfTEVOR1RIKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbmV3S2V5ID0ga2V5LnNsaWNlKDAsIE1BWF9BVFRSSUJVVEVfTkFNRV9MRU5HVEgpO1xuICAgICAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIGtleS5zbGljZSgwLCBNQVhfQVRUUklCVVRFX05BTUVfTEVOR1RIKSwgXG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqLCBrZXkgYXMgUHJvcGVydHlLZXkpIGFzIFByb3BlcnR5RGVzY3JpcHRvcik7XG4gICAgICAgICAgICAgICAgZGVsZXRlIG9iai5rZXk7XG5cbiAgICAgICAgICAgICAgICAvLyBVcGRhdGUga2V5IG5hbWUgZm9yIHVzYWdlIGluIGxhdGVyIHN0ZXBzXG4gICAgICAgICAgICAgICAga2V5ID0gbmV3S2V5O1xuICAgICAgICAgICAgICAgIG1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gQ29uY2F0ZW5hdGUgbG9nIG1lc3NhZ2VzIHdpdGggbGVuZ3RoIGdyZWF0ZXIgdGhhbiBNQVhfQVRUUklCVVRFX1ZBTFVFX0xFTkdUSFxuICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgdmFsdWUubGVuZ3RoID4gTUFYX0FUVFJJQlVURV9WQUxVRV9MRU5HVEgpIHtcbiAgICAgICAgICAgICAgICBpZiAoY29uZmlnPy53YXJuT25BdHRyaWJ1dGVMZW5ndGhPdmVyZmxvdykge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYE5SIExvZyBhdHRyaWJ1dGUgbGVuZ3RoIG92ZXJmbG93LiBMZW5ndGg6ICR7dmFsdWUubGVuZ3RofS8ke01BWF9BVFRSSUJVVEVfVkFMVUVfTEVOR1RIfWApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBvYmoua2V5ID0gdmFsdWUuc2xpY2UoMCwgTUFYX0FUVFJJQlVURV9WQUxVRV9MRU5HVEgpOyBcbiAgICAgICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChrZXkuaW5jbHVkZXMoJyAnKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG5ld0tleSA9IGtleS5yZXBsYWNlQWxsKCcgJywgJy4nKTtcbiAgICAgICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBrZXkuc2xpY2UoMCwgTUFYX0FUVFJJQlVURV9OQU1FX0xFTkdUSCksIFxuICAgICAgICAgICAgICAgICAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iaiwga2V5IGFzIFByb3BlcnR5S2V5KSBhcyBQcm9wZXJ0eURlc2NyaXB0b3IpO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBvYmoua2V5O1xuXG4gICAgICAgICAgICAgICAgLy8gVXBkYXRlIGtleSBuYW1lIGZvciB1c2FnZSBpbiBsYXRlciBzdGVwc1xuICAgICAgICAgICAgICAgIGtleSA9IG5ld0tleTtcbiAgICAgICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSWYgd2UgbWFkZSBjaGFuZ2VzIHN0cmluZ2lmeSB0aGUgbmV3IG9iamVjdCBkYXRhLCBvdGhlcndpc2UgcmV0dXJuIHRoZSBvcmlnaW5hbCBsb2dcbiAgICAgICAgcmV0dXJuIG1vZGlmaWVkIFxuICAgICAgICAgICAgPyBKU09OLnN0cmluZ2lmeShvYmopXG4gICAgICAgICAgICA6IGxvZztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwdXNoTG9nc1RpbWVvdXQoZnJlcXVlbmN5ID0gMTBfMDAwKSB7XG4gICAgICAgIHNldFRpbWVvdXQoYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgaWYgKGxvZ3NQdXNoYWJsZSgpKSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgcHVzaExvZ3MoKTtcbiAgICAgICAgICAgICAgICB0aW1lb3V0SWQgPSBwdXNoTG9nc1RpbWVvdXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgZnJlcXVlbmN5KTtcbiAgICB9XG4gICAgXG4gICAgZnVuY3Rpb24gbG9nc1B1c2hhYmxlKCk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAoYnVmZmVyLmxlbmd0aCA8IG1pbkxvZ0l0ZW1zKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGNvbnN0IHB1c2hMb2dzID0gYXN5bmMgKCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgICAgICBjb25zdCBvcHRpb25zID0ge1xuICAgICAgICAgICAgaG9zdG5hbWU6IEFQSV9FTkRQT0lOVCxcbiAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vZ3ppcCcsXG4gICAgICAgICAgICB9ICAgICAgICAgICAgXG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IHJlcSA9IGh0dHBzLnJlcXVlc3Qob3B0aW9ucywgcmVzID0+IHtcbiAgICAgICAgfSlcblxuICAgICAgICBjb21wcmVzc29yLnBpcGUocmVxKTtcblxuICAgIH1cblxuICAgIGNvbnN0IGxvY2FsV3JpdGVMb2dzID0gYXN5bmMgKCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgICAgICBjb25zdCBvdXRwdXQgPSBmcy5jcmVhdGVXcml0ZVN0cmVhbSgnLi90ZXN0LmxvZycsIHsgZmxhZ3M6ICdhJywgYXV0b0Nsb3NlOiB0cnVlIH0pO1xuICAgICAgICBvdXRwdXQub24oJ2Nsb3NlJywgKCkgPT4ge1xuICAgICAgICAgICAgY29tcHJlc3Nvci51bnBpcGUoKTtcbiAgICAgICAgfSlcbiAgICAgICAgY29tcHJlc3Nvci5waXBlKG91dHB1dCk7XG4gICAgfVxuXG4gICAgY29uc3QgZ2V0UHVzaGFibGVEYXRhID0gKCkgPT4ge1xuICAgICAgICBjb25zdCBzZW5kYWJsZURhdGEgPSBbXTtcbiAgICAgICAgbGV0IHRvdGFsU2l6ZSA9IDA7XG4gICAgICAgIHdoaWxlKGJ1ZmZlci5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICAgIGlmICh0b3RhbFNpemUgKyB0b3RhbFNpemUgPD0gTUFYX1BBWUxPQURfU0laRSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBidWZmZXIuc2hpZnQoKSBhcyBzdHJpbmc7XG4gICAgICAgICAgICAgICAgdG90YWxTaXplICs9IG1lc3NhZ2UubGVuZ3RoO1xuICAgICAgICAgICAgICAgIHNlbmRhYmxlRGF0YS5wdXNoKG1lc3NhZ2UpO1xuICAgICAgICAgICAgfSBlbHNlIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHNlbmRhYmxlRGF0YTtcbiAgICB9XG5cbiAgICAvLyBTdGFydCB0aW1lb3V0cyB0byBjaGVja1xuICAgIHRpbWVvdXRJZCA9IHB1c2hMb2dzVGltZW91dCgpO1xuXG4gICAgcmV0dXJuIHN0cmVhbTtcbn1cblxuIl19