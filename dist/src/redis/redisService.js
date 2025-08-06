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
exports.RedisService = void 0;
var redisClient_1 = require("./redisClient");
var models_1 = require("../database/mongo/models");
var messageTypes_1 = require("../utils/messageTypes");
var user_1 = require("../auth/user");
var RedisService = /** @class */ (function () {
    function RedisService(notifier, roomClients, redis) {
        if (redis === void 0) { redis = new redisClient_1.RedisClient(); }
        this.notifier = notifier;
        this.roomClients = roomClients;
        this.redis = redis;
    }
    RedisService.prototype.get = function (key, field) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.redis.get(key, field)];
            });
        });
    };
    RedisService.prototype.set = function (key, field, value) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.redis.set(key, field, value)];
            });
        });
    };
    RedisService.prototype.del = function (key, field) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.redis.del(key, field)];
            });
        });
    };
    RedisService.prototype.keys = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.redis.keys()];
            });
        });
    };
    RedisService.prototype.getItems = function (keys, field) {
        return __awaiter(this, void 0, void 0, function () {
            var queries, response;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        queries = keys.map(function (key) { return __awaiter(_this, void 0, void 0, function () {
                            var _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        _a = {
                                            key: key
                                        };
                                        return [4 /*yield*/, this.redis.get(key, field)];
                                    case 1: return [2 /*return*/, (_a.value = _b.sent(),
                                            _a)];
                                }
                            });
                        }); });
                        return [4 /*yield*/, Promise.allSettled(queries)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response
                                .map(function (res) { return (res.status === "fulfilled" ? res.value : null); })
                                .filter(function (doc) { return doc !== null; })];
                }
            });
        });
    };
    RedisService.prototype.getRoomsState = function (ws) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, publicRooms, privateRooms, roomIds, allRoomsState, data, message;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, Promise.all([
                            models_1.roomModel.find({ public: true, active: true }, { _id: 1 }),
                            ws.userId
                                ? models_1.roomModel.find({ public: false, active: true, ownerId: ws.userId }, { _id: 1 })
                                : [],
                        ])];
                    case 1:
                        _a = _b.sent(), publicRooms = _a[0], privateRooms = _a[1];
                        roomIds = __spreadArray(__spreadArray([], publicRooms, true), privateRooms, true).map(function (room) { return room._id; });
                        return [4 /*yield*/, this.getItems(roomIds, "users")];
                    case 2:
                        allRoomsState = _b.sent();
                        data = allRoomsState.map(function (item) { return ({
                            roomId: item.key,
                            users: item.value ? item.value.length : 0,
                        }); });
                        message = {
                            type: messageTypes_1.MessageType.ROOMS_STATE,
                            data: { rooms: data },
                        };
                        this.notifier.send(ws, JSON.stringify(message));
                        return [2 /*return*/];
                }
            });
        });
    };
    RedisService.prototype.getRoomState = function (ws, data, authToken) {
        return __awaiter(this, void 0, void 0, function () {
            var roomId, room, userId, message_1, roomState, users, message;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        roomId = data.roomId;
                        return [4 /*yield*/, models_1.roomModel.findById(roomId, {
                                _id: 1,
                                public: 1,
                                ownerId: 1,
                            })];
                    case 1:
                        room = _a.sent();
                        if (!room)
                            throw { type: "error", message: "Room not found" };
                        if (!room.public) {
                            userId = (0, user_1.getUserId)(authToken);
                            if (room.ownerId !== userId) {
                                message_1 = {
                                    type: messageTypes_1.MessageType.ROOM_STATE,
                                    data: { _id: roomId, users: 0 },
                                };
                                this.notifier.send(ws, JSON.stringify(message_1));
                                return [2 /*return*/];
                            }
                        }
                        return [4 /*yield*/, this.redis.get(roomId, "users")];
                    case 2:
                        roomState = (_a.sent());
                        users = !roomState ? 0 : roomState === null || roomState === void 0 ? void 0 : roomState.length;
                        message = {
                            type: messageTypes_1.MessageType.ROOM_STATE,
                            data: { _id: roomId, users: users },
                        };
                        this.notifier.send(ws, JSON.stringify(message));
                        return [2 /*return*/];
                }
            });
        });
    };
    RedisService.prototype.updateRoomMessageState = function (roomId, token, socketId) {
        return __awaiter(this, void 0, void 0, function () {
            var users, user, limit, cutoff, filtered;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!roomId || !token)
                            throw { type: "error", message: "Invalid room data" };
                        return [4 /*yield*/, this.redis.get(roomId, "users")];
                    case 1:
                        users = (_a.sent());
                        user = users === null || users === void 0 ? void 0 : users.find(function (u) { return u.token === token; });
                        if (!user || !user.socketId.includes(socketId))
                            throw { type: "error", message: "You are not in this room" };
                        user.lastMessage = new Date();
                        limit = Number(process.env.MINUTES_LIMIT_BETWEEN_MESSAGES) || 30;
                        cutoff = Date.now() - limit * 60 * 1000;
                        filtered = users === null || users === void 0 ? void 0 : users.filter(function (u) {
                            return u.nickname == user.nickname ||
                                !u.lastMessage ||
                                u.lastMessage.getTime() > cutoff;
                        });
                        return [4 /*yield*/, this.redis.set(roomId, "users", filtered)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    RedisService.prototype.liberateRedisMemory = function (socketId, roomId) {
        return __awaiter(this, void 0, void 0, function () {
            var roomState, user, filtered, room;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.redis.get(roomId, "users")];
                    case 1:
                        roomState = (_a.sent());
                        if (!roomState || !roomState.length)
                            return [2 /*return*/];
                        user = roomState === null || roomState === void 0 ? void 0 : roomState.find(function (u) { return u.socketId.includes(socketId); });
                        if (!(roomState && user)) return [3 /*break*/, 7];
                        user.socketId = user.socketId.filter(function (id) { return id !== socketId; });
                        filtered = roomState.filter(function (u) { return u.socketId.length > 0; });
                        if (!(filtered.length === 0)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.redis.del(roomId, "users")];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, this.redis.set(roomId, "users", filtered)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        if (user.socketId.length > 0)
                            return [2 /*return*/];
                        this.notifier.sendToRoom(messageTypes_1.MessageType.SIGNOUT_ROOM, roomId, {
                            nickname: user.nickname,
                            users: filtered.length,
                        });
                        return [4 /*yield*/, models_1.roomModel.findById(roomId, { public: 1, ownerId: 1 })];
                    case 6:
                        room = _a.sent();
                        if (room.public) {
                            this.notifier.broadcastToClients(messageTypes_1.MessageType.UPDATE_ROOM_STATE, {
                                _id: roomId,
                                users: filtered.length,
                            });
                        }
                        else {
                            this.notifier.sendToUser(messageTypes_1.MessageType.UPDATE_ROOM_STATE, room.ownerId, roomId, { users: filtered.length });
                        }
                        _a.label = 7;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    RedisService.prototype.removeJunkRedisData = function () {
        return __awaiter(this, void 0, void 0, function () {
            var redisKeys, _loop_1, this_1, _i, redisKeys_1, key;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.redis.keys()];
                    case 1:
                        redisKeys = _a.sent();
                        _loop_1 = function (key) {
                            var roomClient, ativeClients, roomState;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        roomClient = this_1.roomClients.get(key);
                                        ativeClients = roomClient
                                            ? Array.from(roomClient.values()).map(function (client) { return client.socketId; })
                                            : [];
                                        return [4 /*yield*/, this_1.redis.get(key, "users")];
                                    case 1:
                                        roomState = (_b.sent());
                                        if (!roomState || !roomState.length) {
                                            return [2 /*return*/, "continue"];
                                        }
                                        roomState = roomState
                                            .map(function (user) {
                                            if (!user.socketId)
                                                return undefined;
                                            user.socketId = user.socketId.filter(function (id) {
                                                return ativeClients.includes(id);
                                            });
                                            if (user.socketId.length === 0)
                                                return undefined;
                                            return user;
                                        })
                                            .filter(function (user) { return user; });
                                        if (!(roomState.length === 0)) return [3 /*break*/, 3];
                                        return [4 /*yield*/, this_1.redis.del(key, "users")];
                                    case 2:
                                        _b.sent();
                                        return [3 /*break*/, 5];
                                    case 3: return [4 /*yield*/, this_1.redis.set(key, "users", roomState)];
                                    case 4:
                                        _b.sent();
                                        _b.label = 5;
                                    case 5: return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        _i = 0, redisKeys_1 = redisKeys;
                        _a.label = 2;
                    case 2:
                        if (!(_i < redisKeys_1.length)) return [3 /*break*/, 5];
                        key = redisKeys_1[_i];
                        return [5 /*yield**/, _loop_1(key)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    return RedisService;
}());
exports.RedisService = RedisService;
//# sourceMappingURL=redisService.js.map