"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageError = void 0;
var instances_1 = require("../../../instances");
var messageError = function (ws, error) {
    instances_1.notifier.send(ws, {
        type: "error",
        message: "Error handling message",
        data: error,
    });
};
exports.messageError = messageError;
//# sourceMappingURL=messageError.js.map