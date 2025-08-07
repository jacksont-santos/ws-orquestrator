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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WSService = void 0;
var ws_1 = require("ws");
var models_1 = require("../database/mongo/models");
var crypto_1 = require("crypto");
var messageTypes_1 = require("../utils/messageTypes");
var user_1 = require("../auth/user");
var WSService = /** @class */ (function () {
    function WSService(server, publicClients, privateClients, roomClients, notifier, redis, signRoom) {
        var _this = this;
        this.publicClients = publicClients;
        this.privateClients = privateClients;
        this.roomClients = roomClients;
        this.notifier = notifier;
        this.redis = redis;
        this.signRoom = signRoom;
        this.heartbeatInterval = 30000;
        this.wss = new ws_1.WebSocketServer({ server: server });
        this.wss.on("connection", function (ws) {
            ws.isAlive = true;
            ws.rooms = [];
            if (!ws.socketId)
                ws.socketId = (0, crypto_1.randomUUID)();
            ws.on("pong", function () { return (ws.isAlive = true); });
            ws.on("error", function (err) { return console.error(err); });
            ws.on("message", function (message) { return _this.onMessage(ws, message); });
            ws.on("close", function () { return _this.onClose(ws); });
        });
        setInterval(function () {
            _this.wss.clients.forEach(function (ws) {
                if (!ws.isAlive)
                    return ws.terminate();
                ws.isAlive = false;
                ws.ping();
            });
            _this.redis.removeJunkRedisData();
        }, this.heartbeatInterval);
    }
    WSService.prototype.onMessage = function (ws, message) {
        return __awaiter(this, void 0, void 0, function () {
            var raw, type, authToken, data, _a, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 19, , 20]);
                        raw = JSON.parse(message);
                        type = raw.type, authToken = raw.authToken, data = raw.data;
                        _a = type;
                        switch (_a) {
                            case messageTypes_1.MessageType.CONNECTION: return [3 /*break*/, 1];
                            case messageTypes_1.MessageType.ROOMS_STATE: return [3 /*break*/, 3];
                            case messageTypes_1.MessageType.ROOM_STATE: return [3 /*break*/, 5];
                            case messageTypes_1.MessageType.SIGNIN_ROOM: return [3 /*break*/, 7];
                            case messageTypes_1.MessageType.SIGNOUT_ROOM: return [3 /*break*/, 9];
                            case messageTypes_1.MessageType.SIGN_STATE: return [3 /*break*/, 11];
                            case messageTypes_1.MessageType.ADD_ROOM: return [3 /*break*/, 13];
                            case messageTypes_1.MessageType.UPDATE_ROOM: return [3 /*break*/, 13];
                            case messageTypes_1.MessageType.REMOVE_ROOM: return [3 /*break*/, 13];
                            case messageTypes_1.MessageType.CHAT: return [3 /*break*/, 15];
                        }
                        return [3 /*break*/, 17];
                    case 1: return [4 /*yield*/, this.connect(ws, authToken)];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 18];
                    case 3: return [4 /*yield*/, this.redis.getRoomsState(ws)];
                    case 4:
                        _b.sent();
                        return [3 /*break*/, 18];
                    case 5: return [4 /*yield*/, this.redis.getRoomState(ws, data, authToken)];
                    case 6:
                        _b.sent();
                        return [3 /*break*/, 18];
                    case 7: return [4 /*yield*/, this.signRoom.signIn(data, ws)];
                    case 8:
                        _b.sent();
                        return [3 /*break*/, 18];
                    case 9: return [4 /*yield*/, this.signRoom.signOut(data, ws)];
                    case 10:
                        _b.sent();
                        return [3 /*break*/, 18];
                    case 11: return [4 /*yield*/, this.signRoom.signState(data, ws)];
                    case 12:
                        _b.sent();
                        return [3 /*break*/, 18];
                    case 13: return [4 /*yield*/, this.notifier.dispatchRoomChange(raw)];
                    case 14:
                        _b.sent();
                        return [3 /*break*/, 18];
                    case 15: return [4 /*yield*/, this.onChatMessage(ws, raw)];
                    case 16:
                        _b.sent();
                        return [3 /*break*/, 18];
                    case 17:
                        this.notifier.send(ws, {
                            type: "error",
                            message: "Unknown message type",
                        });
                        _b.label = 18;
                    case 18: return [3 /*break*/, 20];
                    case 19:
                        error_1 = _b.sent();
                        this.notifier.send(ws, {
                            type: "error",
                            data: error_1,
                            message: "Error handling message",
                        });
                        return [3 /*break*/, 20];
                    case 20: return [2 /*return*/];
                }
            });
        });
    };
    WSService.prototype.connect = function (ws, authToken) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (authToken)
                    this.addPrivateClient(ws, authToken);
                else
                    this.addPublicClient(ws);
                this.redis.getRoomsState(ws);
                return [2 /*return*/];
            });
        });
    };
    WSService.prototype.addPrivateClient = function (ws, authToken) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, user_1.setUser)(ws, authToken)];
                    case 1:
                        _a.sent();
                        this.privateClients.set(ws.userId, new Set([ws]));
                        this.publicClients.delete(ws.userId);
                        return [2 /*return*/];
                }
            });
        });
    };
    WSService.prototype.addPublicClient = function (ws) {
        if ((0, user_1.isAuthenticated)(ws))
            this.removePrivateClient(ws.socketId, ws.userId);
        (0, user_1.removeUser)(ws);
        this.publicClients.set(ws.socketId, ws);
    };
    WSService.prototype.onChatMessage = function (ws, raw) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, roomId, nickname, content, token, chatId, err_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        _a = raw.data, roomId = _a.roomId, nickname = _a.nickname, content = _a.content, token = _a.token;
                        if (!roomId || !nickname || !content || !token)
                            throw { type: "error", message: "Invalid chat data" };
                        return [4 /*yield*/, this.redis.updateRoomMessageState(roomId, token, ws.socketId)];
                    case 1:
                        _b.sent();
                        chatId = (0, crypto_1.randomUUID)();
                        raw.data.Id = chatId;
                        raw.data.createdAt = new Date();
                        this.notifier.sendToRoom(messageTypes_1.MessageType.CHAT, roomId, raw.data);
                        return [4 /*yield*/, models_1.chatModel.updateOne({ roomId: roomId }, {
                                $push: {
                                    chat: {
                                        $each: [
                                            {
                                                id: chatId,
                                                nickname: nickname,
                                                content: content,
                                                createdAt: raw.data.createdAt,
                                            },
                                        ],
                                        $position: 0,
                                    },
                                },
                                $set: { updatedAt: new Date() },
                            }, { upsert: true })];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        err_1 = _b.sent();
                        this.notifier.send(ws, err_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    WSService.prototype.onClose = function (ws) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.removePublicClient(ws.socketId);
                        this.removePrivateClient(ws.socketId, ws.userId);
                        return [4 /*yield*/, this.removeRoomClient(ws)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    WSService.prototype.removePublicClient = function (socketId) {
        this.publicClients.delete(socketId);
    };
    WSService.prototype.removePrivateClient = function (socketId, userId) {
        if (!userId)
            return;
        var clients = this.privateClients.get(userId);
        if (!clients)
            return;
        for (var _i = 0, _a = Array.from(clients); _i < _a.length; _i++) {
            var ws = _a[_i];
            if (ws.socketId === socketId) {
                clients.delete(ws);
                break;
            }
        }
        if (clients.size === 0)
            this.privateClients.delete(userId);
    };
    WSService.prototype.removeRoomClient = function (ws) {
        return __awaiter(this, void 0, void 0, function () {
            var socketId, promises, _i, _a, roomId, clients, _b, _c, client;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        socketId = ws.socketId;
                        if (!ws.rooms || !ws.rooms.length)
                            return [2 /*return*/];
                        promises = [];
                        for (_i = 0, _a = ws.rooms; _i < _a.length; _i++) {
                            roomId = _a[_i];
                            clients = this.roomClients.get(roomId);
                            if (clients) {
                                for (_b = 0, _c = Array.from(clients); _b < _c.length; _b++) {
                                    client = _c[_b];
                                    if (client.socketId === socketId) {
                                        clients.delete(client);
                                        break;
                                    }
                                }
                                if (clients.size === 0)
                                    this.roomClients.delete(roomId);
                            }
                            ;
                            promises.push(this.redis.liberateRedisMemory(socketId, roomId));
                        }
                        return [4 /*yield*/, Promise.all(promises)];
                    case 1:
                        _d.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return WSService;
}());
exports.WSService = WSService;
//# sourceMappingURL=wsService.js.map