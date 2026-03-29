"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.roomModel = void 0;
var mongoose_1 = __importDefault(require("mongoose"));
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
exports.roomModel = mongoose_1.default.model('room', roomSchema);
//# sourceMappingURL=Room.js.map