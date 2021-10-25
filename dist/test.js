"use strict";

require("babel-polyfill");

var _logger = require("./logger");

var label = '????';
console.log(label);
var log = (0, _logger.withLogger)(label);
var count = 100;
var target = 2000;

function doDelayedWrite() {
  setTimeout(function () {
    log.info("count: ".concat(++count));

    if (count < target) {
      doDelayedWrite();
    }
  }, 1000);
}

doDelayedWrite();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy90ZXN0LnRzIl0sIm5hbWVzIjpbImxhYmVsIiwiY29uc29sZSIsImxvZyIsImNvdW50IiwidGFyZ2V0IiwiZG9EZWxheWVkV3JpdGUiLCJzZXRUaW1lb3V0IiwiaW5mbyJdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7QUFDQTs7QUFFQSxJQUFNQSxLQUFLLEdBQUcsTUFBZDtBQUNBQyxPQUFPLENBQUNDLEdBQVIsQ0FBWUYsS0FBWjtBQUNBLElBQU1FLEdBQUcsR0FBRyx3QkFBV0YsS0FBWCxDQUFaO0FBRUEsSUFBSUcsS0FBSyxHQUFHLEdBQVo7QUFDQSxJQUFJQyxNQUFNLEdBQUcsSUFBYjs7QUFFQSxTQUFTQyxjQUFULEdBQTBCO0FBQ3RCQyxFQUFBQSxVQUFVLENBQUMsWUFBTTtBQUNiSixJQUFBQSxHQUFHLENBQUNLLElBQUosa0JBQW1CLEVBQUVKLEtBQXJCOztBQUNBLFFBQUlBLEtBQUssR0FBR0MsTUFBWixFQUFvQjtBQUNoQkMsTUFBQUEsY0FBYztBQUNqQjtBQUNKLEdBTFMsRUFLUCxJQUxPLENBQVY7QUFNSDs7QUFFREEsY0FBYyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBcImJhYmVsLXBvbHlmaWxsXCI7XG5pbXBvcnQgeyB3aXRoTG9nZ2VyIH0gZnJvbSAnLi9sb2dnZXInO1xuXG5jb25zdCBsYWJlbCA9ICc/Pz8/JztcbmNvbnNvbGUubG9nKGxhYmVsKTtcbmNvbnN0IGxvZyA9IHdpdGhMb2dnZXIobGFiZWwpO1xuXG5sZXQgY291bnQgPSAxMDA7XG5sZXQgdGFyZ2V0ID0gMjAwMDtcblxuZnVuY3Rpb24gZG9EZWxheWVkV3JpdGUoKSB7XG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGxvZy5pbmZvKGBjb3VudDogJHsrK2NvdW50fWApO1xuICAgICAgICBpZiAoY291bnQgPCB0YXJnZXQpIHtcbiAgICAgICAgICAgIGRvRGVsYXllZFdyaXRlKCk7XG4gICAgICAgIH1cbiAgICB9LCAxMDAwKTtcbn1cblxuZG9EZWxheWVkV3JpdGUoKTsiXX0=