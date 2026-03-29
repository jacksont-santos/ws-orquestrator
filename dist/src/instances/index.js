"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roomService = exports.userService = exports.authUserService = exports.chatService = exports.redis = exports.notifier = exports.roomClients = exports.clients = void 0;
var Notifier_1 = require("../Notifier/Notifier");
var Service_1 = require("../Redis/Service");
var ChatService_1 = require("../Chat/Service/ChatService");
var AuthService_1 = require("../User/Services/AuthService");
var UserService_1 = require("../User/Services/UserService");
var RoomService_1 = require("../Room/Service/RoomService");
exports.clients = new Map();
exports.roomClients = new Map();
exports.notifier = new Notifier_1.Notifier();
exports.redis = new Service_1.RedisService();
exports.chatService = new ChatService_1.ChatService();
exports.authUserService = new AuthService_1.AuthUserService();
exports.userService = new UserService_1.UserService();
exports.roomService = new RoomService_1.RoomService();
//# sourceMappingURL=index.js.map