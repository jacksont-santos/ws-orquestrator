"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.comparePasswords = void 0;
var bcrypt_1 = __importDefault(require("bcrypt"));
var comparePasswords = function (password, hash) {
    return bcrypt_1.default.compareSync(password, hash);
};
exports.comparePasswords = comparePasswords;
//# sourceMappingURL=crypto.js.map