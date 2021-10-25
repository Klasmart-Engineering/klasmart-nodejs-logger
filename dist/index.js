"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
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

var _correlationMiddleware = require("./correlationMiddleware");

var _logger = require("./logger");
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7QUFDQTs7QUFDQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAnYmFiZWwtcG9seWZpbGwnO1xuaW1wb3J0IHsgY29ycmVsYXRpb25NaWRkbGV3YXJlLCB3aXRoQ29ycmVsYXRpb24gfSBmcm9tICcuL2NvcnJlbGF0aW9uTWlkZGxld2FyZSc7XG5pbXBvcnQgeyB3aXRoTG9nZ2VyIH0gZnJvbSAnLi9sb2dnZXInO1xuXG5leHBvcnQge1xuICAgIGNvcnJlbGF0aW9uTWlkZGxld2FyZSxcbiAgICB3aXRoQ29ycmVsYXRpb24sXG4gICAgd2l0aExvZ2dlclxufTsiXX0=