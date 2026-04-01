"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userModel = void 0;
var mongoose_1 = __importDefault(require("mongoose"));
var userSchema = new mongoose_1.default.Schema({
    _id: { type: String },
    username: { type: String, unique: true, required: true, validate: function (value) { return value.length >= 6 && value.length <= 24; } },
    password: { type: String, selected: false, required: true, validate: function (value) { return value.length > 30; } },
    nickname: {
        type: String,
        unique: true,
        required: true,
        validate: function (value) { return value.length >= 4 && value.length <= 24; },
    }
});
exports.userModel = mongoose_1.default.model('user', userSchema);
//# sourceMappingURL=User.js.map