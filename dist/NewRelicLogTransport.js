"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NewRelicLogTransport = void 0;

var _winstonTransport = _interopRequireDefault(require("winston-transport"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var NewRelicLogTransport = /*#__PURE__*/function (_Transport) {
  _inherits(NewRelicLogTransport, _Transport);

  var _super = _createSuper(NewRelicLogTransport);

  function NewRelicLogTransport(logToAgentCallback) {
    var _this;

    _classCallCheck(this, NewRelicLogTransport);

    _this = _super.call(this);

    _defineProperty(_assertThisInitialized(_this), "sendLogsToAgent", void 0);

    _this.setMaxListeners(Infinity);

    _this.sendLogsToAgent = logToAgentCallback;
    return _this;
  }

  _createClass(NewRelicLogTransport, [{
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9OZXdSZWxpY0xvZ1RyYW5zcG9ydC50cyJdLCJuYW1lcyI6WyJOZXdSZWxpY0xvZ1RyYW5zcG9ydCIsImxvZ1RvQWdlbnRDYWxsYmFjayIsInNldE1heExpc3RlbmVycyIsIkluZmluaXR5Iiwic2VuZExvZ3NUb0FnZW50IiwiaW5mbyIsImNhbGxiYWNrIiwiVHJhbnNwb3J0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFFYUEsb0I7Ozs7O0FBR1QsZ0NBQVlDLGtCQUFaLEVBQTBFO0FBQUE7O0FBQUE7O0FBQ3RFOztBQURzRTs7QUFFdEUsVUFBS0MsZUFBTCxDQUFxQkMsUUFBckI7O0FBQ0EsVUFBS0MsZUFBTCxHQUF1Qkgsa0JBQXZCO0FBSHNFO0FBSXpFOzs7O1dBRUQsaUJBQVE7QUFDSixXQUFLRyxlQUFMLEdBQXVCLFlBQU0sQ0FBRSxDQUEvQjtBQUNIOzs7V0FFRCxhQUFJQyxJQUFKLEVBQWVDLFFBQWYsRUFBcUM7QUFDakMsV0FBS0YsZUFBTCxDQUFxQkMsSUFBckIsRUFBMkJDLFFBQTNCO0FBQ0g7Ozs7RUFmcUNDLDRCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFRyYW5zcG9ydCBmcm9tICd3aW5zdG9uLXRyYW5zcG9ydCc7XG5cbmV4cG9ydCBjbGFzcyBOZXdSZWxpY0xvZ1RyYW5zcG9ydCBleHRlbmRzIFRyYW5zcG9ydCB7XG4gICAgcHJpdmF0ZSBzZW5kTG9nc1RvQWdlbnQ6IChsb2c6IGFueSwgY2FsbGJhY2s6ICgpID0+IHZvaWQpID0+IHZvaWQ7XG5cbiAgICBjb25zdHJ1Y3Rvcihsb2dUb0FnZW50Q2FsbGJhY2s6IChsb2c6IGFueSwgY2FsbGJhY2s6ICgpID0+IHZvaWQpID0+IHZvaWQpIHtcbiAgICAgICAgc3VwZXIoKVxuICAgICAgICB0aGlzLnNldE1heExpc3RlbmVycyhJbmZpbml0eSk7XG4gICAgICAgIHRoaXMuc2VuZExvZ3NUb0FnZW50ID0gbG9nVG9BZ2VudENhbGxiYWNrO1xuICAgIH1cblxuICAgIGNsb3NlKCkge1xuICAgICAgICB0aGlzLnNlbmRMb2dzVG9BZ2VudCA9ICgpID0+IHt9O1xuICAgIH1cblxuICAgIGxvZyhpbmZvOiBhbnksIGNhbGxiYWNrOiAoKSA9PiB2b2lkKSB7XG4gICAgICAgIHRoaXMuc2VuZExvZ3NUb0FnZW50KGluZm8sIGNhbGxiYWNrKTtcbiAgICB9XG59XG5cbiJdfQ==