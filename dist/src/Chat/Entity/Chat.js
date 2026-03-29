"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatModel = void 0;
var mongoose_1 = __importDefault(require("mongoose"));
var chatSchema = new mongoose_1.default.Schema({
    _id: { type: String },
    roomId: { type: String, required: true },
    chat: { type: (Array), default: [], required: true },
    createdAt: { type: Date, default: Date.now(), required: true },
    updatedAt: { type: Date, default: Date.now(), required: true },
});
exports.chatModel = mongoose_1.default.model('chat', chatSchema);
//# sourceMappingURL=Chat.js.map