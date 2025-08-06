"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.signJWT = void 0;
var jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
var secretKey = process.env.SECRET_KEY;
var signJWT = function (payload) {
    return jsonwebtoken_1.default.sign(payload, secretKey, { expiresIn: '1d' });
};
exports.signJWT = signJWT;
var verifyToken = function (token) {
    try {
        var decoded = jsonwebtoken_1.default.verify(token, secretKey);
        return decoded;
    }
    catch (error) {
        return null;
    }
};
exports.verifyToken = verifyToken;
//# sourceMappingURL=jwt.js.map