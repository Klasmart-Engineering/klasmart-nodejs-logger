"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "DEFAULT_CORRELATION_HEADER", {
  enumerable: true,
  get: function get() {
    return _correlationMiddleware.DEFAULT_CORRELATION_HEADER;
  }
});
Object.defineProperty(exports, "KLLogger", {
  enumerable: true,
  get: function get() {
    return _logger.KLLogger;
  }
});
Object.defineProperty(exports, "NewRelicLogDeliveryAgent", {
  enumerable: true,
  get: function get() {
    return _LogDeliveryAgent.NewRelicLogDeliveryAgent;
  }
});
Object.defineProperty(exports, "correlationMiddleware", {
  enumerable: true,
  get: function get() {
    return _correlationMiddleware.correlationMiddleware;
  }
});
Object.defineProperty(exports, "withCorrelation", {
  enumerable: true,
  get: function get() {
    return _correlationMiddleware.withCorrelation;
  }
});
Object.defineProperty(exports, "withLogger", {
  enumerable: true,
  get: function get() {
    return _logger.withLogger;
  }
});

require("babel-polyfill");

var _correlationMiddleware = require("./correlation-middleware");

var _logger = require("./logger");

var _LogDeliveryAgent = require("./LogDeliveryAgent");
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7QUFDQTs7QUFDQTs7QUFDQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAnYmFiZWwtcG9seWZpbGwnO1xuaW1wb3J0IHsgY29ycmVsYXRpb25NaWRkbGV3YXJlLCB3aXRoQ29ycmVsYXRpb24sIERFRkFVTFRfQ09SUkVMQVRJT05fSEVBREVSIH0gZnJvbSAnLi9jb3JyZWxhdGlvbi1taWRkbGV3YXJlJztcbmltcG9ydCB7IHdpdGhMb2dnZXIsIEtMTG9nZ2VyIH0gZnJvbSAnLi9sb2dnZXInO1xuaW1wb3J0IHsgTmV3UmVsaWNMb2dEZWxpdmVyeUFnZW50IH0gZnJvbSAnLi9Mb2dEZWxpdmVyeUFnZW50JztcblxuZXhwb3J0IHtcbiAgICBjb3JyZWxhdGlvbk1pZGRsZXdhcmUsXG4gICAgd2l0aENvcnJlbGF0aW9uLFxuICAgIHdpdGhMb2dnZXIsXG4gICAgTmV3UmVsaWNMb2dEZWxpdmVyeUFnZW50LFxuICAgIEtMTG9nZ2VyLFxuICAgIERFRkFVTFRfQ09SUkVMQVRJT05fSEVBREVSXG59O1xuIl19