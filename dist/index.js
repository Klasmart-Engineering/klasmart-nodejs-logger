"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7QUFDQTs7QUFDQTs7QUFDQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAnYmFiZWwtcG9seWZpbGwnO1xuaW1wb3J0IHsgY29ycmVsYXRpb25NaWRkbGV3YXJlLCB3aXRoQ29ycmVsYXRpb24gfSBmcm9tICcuL2NvcnJlbGF0aW9uLW1pZGRsZXdhcmUnO1xuaW1wb3J0IHsgd2l0aExvZ2dlciB9IGZyb20gJy4vbG9nZ2VyJztcbmltcG9ydCB7IE5ld1JlbGljTG9nRGVsaXZlcnlBZ2VudCB9IGZyb20gJy4vTG9nRGVsaXZlcnlBZ2VudCc7XG5cbmV4cG9ydCB7XG4gICAgY29ycmVsYXRpb25NaWRkbGV3YXJlLFxuICAgIHdpdGhDb3JyZWxhdGlvbixcbiAgICB3aXRoTG9nZ2VyLFxuICAgIE5ld1JlbGljTG9nRGVsaXZlcnlBZ2VudFxufTtcbiJdfQ==