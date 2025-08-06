"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignRoom = void 0;
var jwt_1 = require("../utils/jwt");
var messageTypes_1 = require("../utils/messageTypes");
var models_1 = require("../database/mongo/models");
var timer_1 = require("../utils/timer");
var jwt_2 = require("../utils/jwt");
var crypto_1 = require("../utils/crypto");
var SignRoom = /** @class */ (function () {
    function SignRoom(notifier, redis, roomClients) {
        this.notifier = notifier;
        this.redis = redis;
        this.roomClients = roomClients;
    }
    SignRoom.prototype.signIn = function (data, ws) {
        return __awaiter(this, void 0, void 0, function () {
            var roomId, nickname, password, roomToken, response, users, room, tokenData, connectedUser, invalidNickname, authenticated, user, updatedRoomState;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        roomId = data.roomId, nickname = data.nickname, password = data.password, roomToken = data.roomToken;
                        if (!roomId || !nickname)
                            throw { type: "error", message: "Invalid signin data" };
                        return [4 /*yield*/, Promise.allSettled([
                                this.redis.get(roomId, "users"),
                                models_1.roomModel.findById(roomId, {
                                    _id: 1,
                                    ownerId: 1,
                                    maxUsers: 1,
                                    active: 1,
                                    public: 1,
                                    password: 1,
                                }),
                            ])];
                    case 1:
                        response = _a.sent();
                        users = response[0].status === "fulfilled" ? response[0].value : null;
                        room = response[1].status === "fulfilled" ? response[1].value : null;
                        if (!roomToken) return [3 /*break*/, 3];
                        tokenData = (0, jwt_2.verifyToken)(roomToken);
                        if (!tokenData)
                            throw { type: "error", message: "Invalid room token" };
                        if (tokenData.roomId !== roomId)
                            throw { type: "error", message: "Invalid room token" };
                        connectedUser = users === null || users === void 0 ? void 0 : users.find(function (u) { return u.token === roomToken; });
                        if (!connectedUser) {
                            this.notifier.sendToClient(ws, messageTypes_1.MessageType.SIGNIN_REPLY, {
                                _id: roomId,
                            });
                            return [2 /*return*/];
                        }
                        if (!ws.rooms || !ws.rooms.includes(roomId))
                            ws.rooms = (ws === null || ws === void 0 ? void 0 : ws.rooms) ? __spreadArray(__spreadArray([], (ws.rooms || []), true), [roomId], false) : [roomId];
                        if (!this.roomClients.has(roomId)) {
                            this.roomClients.set(roomId, new Set([ws]));
                        }
                        else {
                            this.roomClients.get(roomId).add(ws);
                        }
                        this.notifier.sendToClient(ws, messageTypes_1.MessageType.SIGNIN_REPLY, {
                            _id: roomId,
                            token: roomToken,
                        });
                        connectedUser.socketId = connectedUser.socketId.includes(ws.socketId)
                            ? connectedUser.socketId
                            : __spreadArray(__spreadArray([], connectedUser.socketId, true), [ws.socketId], false);
                        return [4 /*yield*/, this.redis.set(roomId, "users", users)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                    case 3:
                        invalidNickname = users === null || users === void 0 ? void 0 : users.find(function (u) { return u.nickname === nickname; });
                        if (invalidNickname)
                            return [2 /*return*/];
                        if (!room)
                            throw { type: "error", message: "Room not found" };
                        if (!room.active)
                            throw { type: "error", message: "Inactive room" };
                        if ((users === null || users === void 0 ? void 0 : users.length) >= room.maxUsers)
                            throw { type: "error", message: "Room is full" };
                        if (!room.public && ws.userId !== room.ownerId) {
                            if (!password)
                                throw { type: "error", message: "Password required" };
                            authenticated = (0, crypto_1.comparePasswords)(password, room.password);
                            if (!authenticated)
                                throw { type: "error", message: "Invalid password" };
                        }
                        user = {
                            nickname: nickname,
                            token: (0, jwt_1.signJWT)({ roomId: roomId, nickname: nickname, date: new Date() }),
                            socketId: [ws.socketId],
                        };
                        updatedRoomState = __spreadArray(__spreadArray([], (users || []), true), [user], false);
                        return [4 /*yield*/, this.redis.set(roomId, "users", updatedRoomState)];
                    case 4:
                        _a.sent();
                        if (!ws.rooms)
                            ws.rooms = [];
                        if (!ws.rooms.includes(roomId))
                            ws.rooms.push(roomId);
                        if (!this.roomClients.has(roomId)) {
                            this.roomClients.set(roomId, new Set([ws]));
                        }
                        else {
                            this.roomClients.get(roomId).add(ws);
                        }
                        this.notifier.sendToClient(ws, messageTypes_1.MessageType.SIGNIN_REPLY, {
                            _id: roomId,
                            token: user.token,
                        });
                        return [4 /*yield*/, (0, timer_1.timer)(1000)];
                    case 5:
                        _a.sent();
                        this.notifier.sendToRoom(messageTypes_1.MessageType.SIGNIN_ROOM, roomId, {
                            nickname: nickname,
                            users: updatedRoomState.length,
                        });
                        if (room.public) {
                            this.notifier.broadcastToClients(messageTypes_1.MessageType.UPDATE_ROOM_STATE, {
                                _id: roomId,
                                users: updatedRoomState.length,
                            });
                        }
                        else {
                            this.notifier.sendToUser(messageTypes_1.MessageType.UPDATE_ROOM_STATE, room.ownerId, roomId, { users: updatedRoomState.length });
                            this.notifier.sendToRoom(messageTypes_1.MessageType.UPDATE_ROOM_STATE, roomId, { users: updatedRoomState.length });
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    SignRoom.prototype.signOut = function (data, ws) {
        return __awaiter(this, void 0, void 0, function () {
            var roomId, nickname, roomToken, response, users, room, clients, user, updatedUsers;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        roomId = data.roomId, nickname = data.nickname, roomToken = data.roomToken;
                        if (!roomId || !nickname || !roomToken)
                            throw { type: "error", message: "Invalid signout data" };
                        return [4 /*yield*/, Promise.allSettled([
                                this.redis.get(roomId, "users"),
                                models_1.roomModel.findById(roomId, {
                                    ownerId: 1,
                                    public: 1,
                                }),
                            ])];
                    case 1:
                        response = _b.sent();
                        users = response[0].status === "fulfilled" ? response[0].value : null;
                        room = response[1].status === "fulfilled" ? response[1].value : null;
                        if (!room)
                            throw { type: "error", message: "Room not found" };
                        clients = this.roomClients.get(roomId);
                        if (clients) {
                            clients.forEach(function (client) {
                                if (client.socketId === ws.socketId)
                                    clients.delete(client);
                            });
                        }
                        if ((clients === null || clients === void 0 ? void 0 : clients.size) === 0)
                            this.roomClients.delete(roomId);
                        user = users === null || users === void 0 ? void 0 : users.find(function (u) { return u.token === roomToken; });
                        user.socketId = user.socketId.filter(function (id) { return id !== ws.socketId; });
                        updatedUsers = users.filter(function (u) { return u.socketId.length > 0; });
                        if (!((updatedUsers === null || updatedUsers === void 0 ? void 0 : updatedUsers.length) === 0)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.redis.del(roomId, "users")];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, this.redis.set(roomId, "users", updatedUsers)];
                    case 4:
                        _b.sent();
                        _b.label = 5;
                    case 5:
                        ws.rooms = (_a = ws.rooms) === null || _a === void 0 ? void 0 : _a.filter(function (id) { return id !== roomId; });
                        this.notifier.sendToClient(ws, messageTypes_1.MessageType.SIGNOUT_REPLY, {
                            _id: roomId,
                            users: updatedUsers.length,
                        });
                        if (user.socketId.length > 0)
                            return [2 /*return*/];
                        this.notifier.sendToRoom(messageTypes_1.MessageType.SIGNOUT_ROOM, roomId, {
                            nickname: nickname,
                            users: updatedUsers.length,
                        });
                        if (room.public) {
                            this.notifier.broadcastToClients(messageTypes_1.MessageType.UPDATE_ROOM_STATE, {
                                _id: roomId,
                                users: updatedUsers.length,
                            });
                        }
                        else {
                            this.notifier.sendToUser(messageTypes_1.MessageType.UPDATE_ROOM_STATE, room.ownerId, roomId, { users: updatedUsers.length });
                            this.notifier.sendToRoom(messageTypes_1.MessageType.UPDATE_ROOM_STATE, roomId, { users: updatedUsers.length });
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    SignRoom.prototype.signState = function (data, ws) {
        return __awaiter(this, void 0, void 0, function () {
            var roomId, roomToken, tokenId, users, user;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        roomId = data._id, roomToken = data.roomToken;
                        if (!roomToken || !roomId)
                            throw { type: "error", message: "Invalid sign state data" };
                        tokenId = (_a = (0, jwt_2.verifyToken)(roomToken)) === null || _a === void 0 ? void 0 : _a.roomId;
                        if (roomId !== tokenId) {
                            this.notifier.sendToClient(ws, messageTypes_1.MessageType.SIGN_STATE, {
                                _id: roomId,
                                authenticated: false,
                            });
                            return [2 /*return*/];
                        }
                        ;
                        return [4 /*yield*/, this.redis.get(roomId, "users")];
                    case 1:
                        users = _b.sent();
                        user = users === null || users === void 0 ? void 0 : users.find(function (u) { return u.token === roomToken; });
                        if (!user) {
                            this.notifier.sendToClient(ws, messageTypes_1.MessageType.SIGN_STATE, {
                                _id: roomId,
                                authenticated: false,
                            });
                            return [2 /*return*/];
                        }
                        ;
                        this.notifier.sendToClient(ws, messageTypes_1.MessageType.SIGN_STATE, {
                            _id: roomId,
                            authenticated: true,
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    return SignRoom;
}());
exports.SignRoom = SignRoom;
//# sourceMappingURL=signRoom.js.map