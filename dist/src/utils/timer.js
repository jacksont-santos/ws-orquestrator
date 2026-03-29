"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.timer = void 0;
var timer = function (ms) {
    return new Promise(function (resolve) { return setTimeout(resolve, ms); });
};
exports.timer = timer;
//# sourceMappingURL=timer.js.map