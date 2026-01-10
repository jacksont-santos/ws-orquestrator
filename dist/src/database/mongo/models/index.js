"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userModel = exports.roomHistoryModel = exports.roomModel = exports.chatModel = void 0;
var mongoose_1 = __importDefault(require("mongoose"));
var crypto_1 = require("crypto");
var chatSchema = new mongoose_1.default.Schema({
    _id: { type: String },
    roomId: { type: String, required: true },
    chat: { type: (Array), default: [], required: true },
    createdAt: { type: Date, default: Date.now(), required: true },
    updatedAt: { type: Date, default: Date.now(), required: true },
});
var chatModel = mongoose_1.default.model('chat', chatSchema);
exports.chatModel = chatModel;
var roomSchema = new mongoose_1.default.Schema({
    _id: { type: String },
    ownerId: { type: String, required: true },
    name: { type: String, required: true, validate: function (value) { return value.length >= 4 && value.length <= 30; } },
    maxUsers: { type: Number, required: true, validate: function (value) { return value >= 2 && value <= 10; } },
    password: { type: String, required: false, validate: function (value) { return value.length > 30; } },
    public: { type: Boolean, required: true, default: true },
    active: { type: Boolean, required: true, default: true },
    createdAt: { type: Date, default: Date.now(), required: true },
    updatedAt: { type: Date, default: Date.now(), required: true },
});
var roomModel = mongoose_1.default.model('room', roomSchema);
exports.roomModel = roomModel;
var roomHistorySchema = new mongoose_1.default.Schema({
    _id: { type: String, default: function () { return (0, crypto_1.randomUUID)(); } },
    roomId: { type: String, required: true },
    users: { type: (Array), default: [], required: true },
    createdAt: { type: Date, default: new Date(), required: true },
    updatedAt: { type: Date, default: new Date(), required: true },
});
var roomHistoryModel = mongoose_1.default.model('roomHistory', roomHistorySchema);
exports.roomHistoryModel = roomHistoryModel;
var userSchema = new mongoose_1.default.Schema({
    _id: { type: String },
    username: { type: String, unique: true, required: true, validate: function (value) { return value.length >= 4 && value.length <= 16; } },
    password: { type: String, required: true, validate: function (value) { return value.length > 30; } },
});
var userModel = mongoose_1.default.model('user', userSchema);
exports.userModel = userModel;
//# sourceMappingURL=index.js.map