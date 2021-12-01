"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NewRelicLogTransport = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _winstonTransport = _interopRequireDefault(require("winston-transport"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var NewRelicLogTransport = /*#__PURE__*/function (_Transport) {
  (0, _inherits2["default"])(NewRelicLogTransport, _Transport);

  var _super = _createSuper(NewRelicLogTransport);

  function NewRelicLogTransport(logToAgentCallback) {
    var _this;

    (0, _classCallCheck2["default"])(this, NewRelicLogTransport);
    _this = _super.call(this);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "sendLogsToAgent", void 0);

    _this.setMaxListeners(Infinity);

    _this.sendLogsToAgent = logToAgentCallback;
    return _this;
  }

  (0, _createClass2["default"])(NewRelicLogTransport, [{
    key: "close",
    value: function close() {
      this.sendLogsToAgent = function () {};
    }
  }, {
    key: "log",
    value: function log(info, callback) {
      this.sendLogsToAgent(info, callback);
    }
  }]);
  return NewRelicLogTransport;
}(_winstonTransport["default"]);

exports.NewRelicLogTransport = NewRelicLogTransport;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9OZXdSZWxpY0xvZ1RyYW5zcG9ydC50cyJdLCJuYW1lcyI6WyJOZXdSZWxpY0xvZ1RyYW5zcG9ydCIsImxvZ1RvQWdlbnRDYWxsYmFjayIsInNldE1heExpc3RlbmVycyIsIkluZmluaXR5Iiwic2VuZExvZ3NUb0FnZW50IiwiaW5mbyIsImNhbGxiYWNrIiwiVHJhbnNwb3J0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOzs7Ozs7SUFFYUEsb0I7Ozs7O0FBR1QsZ0NBQVlDLGtCQUFaLEVBQTBFO0FBQUE7O0FBQUE7QUFDdEU7QUFEc0U7O0FBRXRFLFVBQUtDLGVBQUwsQ0FBcUJDLFFBQXJCOztBQUNBLFVBQUtDLGVBQUwsR0FBdUJILGtCQUF2QjtBQUhzRTtBQUl6RTs7OztXQUVELGlCQUFRO0FBQ0osV0FBS0csZUFBTCxHQUF1QixZQUFNLENBQUUsQ0FBL0I7QUFDSDs7O1dBRUQsYUFBSUMsSUFBSixFQUFlQyxRQUFmLEVBQXFDO0FBQ2pDLFdBQUtGLGVBQUwsQ0FBcUJDLElBQXJCLEVBQTJCQyxRQUEzQjtBQUNIOzs7RUFmcUNDLDRCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFRyYW5zcG9ydCBmcm9tICd3aW5zdG9uLXRyYW5zcG9ydCc7XG5cbmV4cG9ydCBjbGFzcyBOZXdSZWxpY0xvZ1RyYW5zcG9ydCBleHRlbmRzIFRyYW5zcG9ydCB7XG4gICAgcHJpdmF0ZSBzZW5kTG9nc1RvQWdlbnQ6IChsb2c6IGFueSwgY2FsbGJhY2s6ICgpID0+IHZvaWQpID0+IHZvaWQ7XG5cbiAgICBjb25zdHJ1Y3Rvcihsb2dUb0FnZW50Q2FsbGJhY2s6IChsb2c6IGFueSwgY2FsbGJhY2s6ICgpID0+IHZvaWQpID0+IHZvaWQpIHtcbiAgICAgICAgc3VwZXIoKVxuICAgICAgICB0aGlzLnNldE1heExpc3RlbmVycyhJbmZpbml0eSk7XG4gICAgICAgIHRoaXMuc2VuZExvZ3NUb0FnZW50ID0gbG9nVG9BZ2VudENhbGxiYWNrO1xuICAgIH1cblxuICAgIGNsb3NlKCkge1xuICAgICAgICB0aGlzLnNlbmRMb2dzVG9BZ2VudCA9ICgpID0+IHt9O1xuICAgIH1cblxuICAgIGxvZyhpbmZvOiBhbnksIGNhbGxiYWNrOiAoKSA9PiB2b2lkKSB7XG4gICAgICAgIHRoaXMuc2VuZExvZ3NUb0FnZW50KGluZm8sIGNhbGxiYWNrKTtcbiAgICB9XG59XG5cbiJdfQ==