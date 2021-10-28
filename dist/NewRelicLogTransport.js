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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9OZXdSZWxpY0xvZ1RyYW5zcG9ydC50cyJdLCJuYW1lcyI6WyJOZXdSZWxpY0xvZ1RyYW5zcG9ydCIsImxvZ1RvQWdlbnRDYWxsYmFjayIsInNlbmRMb2dzVG9BZ2VudCIsImluZm8iLCJjYWxsYmFjayIsIlRyYW5zcG9ydCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBRWFBLG9COzs7OztBQUdULGdDQUFZQyxrQkFBWixFQUEwRTtBQUFBOztBQUFBOztBQUN0RTs7QUFEc0U7O0FBRXRFLFVBQUtDLGVBQUwsR0FBdUJELGtCQUF2QjtBQUZzRTtBQUd6RTs7OztXQUVELGlCQUFRO0FBQ0osV0FBS0MsZUFBTCxHQUF1QixZQUFNLENBQUUsQ0FBL0I7QUFDSDs7O1dBRUQsYUFBSUMsSUFBSixFQUFlQyxRQUFmLEVBQXFDO0FBQ2pDLFdBQUtGLGVBQUwsQ0FBcUJDLElBQXJCLEVBQTJCQyxRQUEzQjtBQUNIOzs7O0VBZHFDQyw0QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBUcmFuc3BvcnQgZnJvbSAnd2luc3Rvbi10cmFuc3BvcnQnO1xuXG5leHBvcnQgY2xhc3MgTmV3UmVsaWNMb2dUcmFuc3BvcnQgZXh0ZW5kcyBUcmFuc3BvcnQge1xuICAgIHByaXZhdGUgc2VuZExvZ3NUb0FnZW50OiAobG9nOiBhbnksIGNhbGxiYWNrOiAoKSA9PiB2b2lkKSA9PiB2b2lkO1xuXG4gICAgY29uc3RydWN0b3IobG9nVG9BZ2VudENhbGxiYWNrOiAobG9nOiBhbnksIGNhbGxiYWNrOiAoKSA9PiB2b2lkKSA9PiB2b2lkKSB7XG4gICAgICAgIHN1cGVyKClcbiAgICAgICAgdGhpcy5zZW5kTG9nc1RvQWdlbnQgPSBsb2dUb0FnZW50Q2FsbGJhY2s7XG4gICAgfVxuXG4gICAgY2xvc2UoKSB7XG4gICAgICAgIHRoaXMuc2VuZExvZ3NUb0FnZW50ID0gKCkgPT4ge307XG4gICAgfVxuXG4gICAgbG9nKGluZm86IGFueSwgY2FsbGJhY2s6ICgpID0+IHZvaWQpIHtcbiAgICAgICAgdGhpcy5zZW5kTG9nc1RvQWdlbnQoaW5mbywgY2FsbGJhY2spO1xuICAgIH1cbn1cblxuIl19