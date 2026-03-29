"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageTypeError = void 0;
var instances_1 = require("../../../instances");
var messageTypeError = function (ws) {
    instances_1.notifier.send(ws, {
        type: "error",
        message: "Unknown message type",
    });
};
exports.messageTypeError = messageTypeError;
//# sourceMappingURL=messageTypeError.js.map