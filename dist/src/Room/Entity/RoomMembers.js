"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.roomMembersModel = void 0;
var mongoose_1 = __importDefault(require("mongoose"));
var crypto_1 = require("crypto");
var roomMembersSchema = new mongoose_1.default.Schema({
    _id: { type: String, default: function () { return (0, crypto_1.randomUUID)(); } },
    ownerId: { type: String, required: true },
    roomId: { type: String, required: true },
    users: { type: (Array), default: [], required: true },
    createdAt: { type: Date, default: new Date(), required: true },
    updatedAt: { type: Date, default: new Date(), required: true },
});
exports.roomMembersModel = mongoose_1.default.model('roomMembers', roomMembersSchema);
//# sourceMappingURL=RoomMembers.js.map