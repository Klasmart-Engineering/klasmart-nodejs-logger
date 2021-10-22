"use strict";

var _ = require(".");

var log = (0, _.withLogger)('label');
var count = 0;
var target = 2000;

function doDelayedWrite() {
  setTimeout(function () {
    log.info("count: ".concat(++count));

    if (count < target) {
      doDelayedWrite();
    }
  }, 100);
}

doDelayedWrite(); // setTimeout(() => {
//     for(let x = 0; x < 1; x++) {
//         newrelic.startWebTransaction('somewhere', () => {
//             log.warn(`log ${x}`);
//         })
//     }
// }, 1_000);
// const compressor = zlib.createGzip();
// const output = fs.createWriteStream('x.gz');
// compressor.pipe(output);
// for(let i = 0; i < 100; i++) {
//     compressor.write(`${i}`)
// }
// compressor.flush();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy90ZXN0LnRzIl0sIm5hbWVzIjpbImxvZyIsImNvdW50IiwidGFyZ2V0IiwiZG9EZWxheWVkV3JpdGUiLCJzZXRUaW1lb3V0IiwiaW5mbyJdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7QUFFQSxJQUFNQSxHQUFHLEdBQUcsa0JBQVcsT0FBWCxDQUFaO0FBRUEsSUFBSUMsS0FBSyxHQUFHLENBQVo7QUFDQSxJQUFJQyxNQUFNLEdBQUcsSUFBYjs7QUFFQSxTQUFTQyxjQUFULEdBQTBCO0FBQ3RCQyxFQUFBQSxVQUFVLENBQUMsWUFBTTtBQUNiSixJQUFBQSxHQUFHLENBQUNLLElBQUosa0JBQW1CLEVBQUVKLEtBQXJCOztBQUNBLFFBQUlBLEtBQUssR0FBR0MsTUFBWixFQUFvQjtBQUNoQkMsTUFBQUEsY0FBYztBQUNqQjtBQUNKLEdBTFMsRUFLUCxHQUxPLENBQVY7QUFNSDs7QUFFREEsY0FBYyxHLENBQ2Q7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFFQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHdpdGhMb2dnZXIgfSBmcm9tICcuJztcblxuY29uc3QgbG9nID0gd2l0aExvZ2dlcignbGFiZWwnKTtcblxubGV0IGNvdW50ID0gMDtcbmxldCB0YXJnZXQgPSAyMDAwO1xuXG5mdW5jdGlvbiBkb0RlbGF5ZWRXcml0ZSgpIHtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgbG9nLmluZm8oYGNvdW50OiAkeysrY291bnR9YCk7XG4gICAgICAgIGlmIChjb3VudCA8IHRhcmdldCkge1xuICAgICAgICAgICAgZG9EZWxheWVkV3JpdGUoKTtcbiAgICAgICAgfVxuICAgIH0sIDEwMCk7XG59XG5cbmRvRGVsYXllZFdyaXRlKCk7XG4vLyBzZXRUaW1lb3V0KCgpID0+IHtcbi8vICAgICBmb3IobGV0IHggPSAwOyB4IDwgMTsgeCsrKSB7XG4vLyAgICAgICAgIG5ld3JlbGljLnN0YXJ0V2ViVHJhbnNhY3Rpb24oJ3NvbWV3aGVyZScsICgpID0+IHtcbi8vICAgICAgICAgICAgIGxvZy53YXJuKGBsb2cgJHt4fWApO1xuXG4vLyAgICAgICAgIH0pXG4vLyAgICAgfVxuLy8gfSwgMV8wMDApO1xuXG4vLyBjb25zdCBjb21wcmVzc29yID0gemxpYi5jcmVhdGVHemlwKCk7XG5cbi8vIGNvbnN0IG91dHB1dCA9IGZzLmNyZWF0ZVdyaXRlU3RyZWFtKCd4Lmd6Jyk7XG4vLyBjb21wcmVzc29yLnBpcGUob3V0cHV0KTtcbi8vIGZvcihsZXQgaSA9IDA7IGkgPCAxMDA7IGkrKykge1xuLy8gICAgIGNvbXByZXNzb3Iud3JpdGUoYCR7aX1gKVxuLy8gfVxuLy8gY29tcHJlc3Nvci5mbHVzaCgpOyJdfQ==