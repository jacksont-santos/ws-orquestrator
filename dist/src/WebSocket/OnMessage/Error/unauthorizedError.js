"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unauthorizedError = void 0;
var instances_1 = require("../../../instances");
var unauthorizedError = function (ws) {
    instances_1.notifier.send(ws, {
        type: "error",
        message: "Unauthorized",
    });
};
exports.unauthorizedError = unauthorizedError;
//# sourceMappingURL=unauthorizedError.js.map