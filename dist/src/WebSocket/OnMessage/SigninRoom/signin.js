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
exports.signin = void 0;
var instances_1 = require("../../../instances");
var MessageType_1 = require("../MessageType");
var timer_1 = require("../../../utils/timer");
var signin = function (data, ws) { return __awaiter(void 0, void 0, void 0, function () {
    var roomId, response, users, room, roomMembers, connectedUser, user, nickname, updatedRoomState;
    var _a;
    var _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                roomId = data.roomId;
                if (!roomId)
                    throw { type: "error", message: "Invalid signin data" };
                return [4 /*yield*/, Promise.allSettled([
                        instances_1.redis.get(roomId, "users"),
                        instances_1.roomService.getRoomById(roomId, { active: 1, public: 1, maxUsers: 1 }),
                        instances_1.roomService.getRoomMembers(roomId),
                    ])];
            case 1:
                response = _d.sent();
                users = response[0].status === "fulfilled" ? response[0].value : null;
                room = response[1].status === "fulfilled" ? response[1].value : null;
                roomMembers = response[2].status === "fulfilled" ? response[2].value : null;
                if (!room)
                    throw { type: "error", message: "Room not found" };
                if (!room.active)
                    throw { type: "error", message: "Room is inactive" };
                if (!roomMembers.users.includes(ws.userId))
                    throw { type: "error", message: "User is not a member of the room" };
                if (room.maxUsers <= (users === null || users === void 0 ? void 0 : users.length))
                    throw { type: "error", message: "Room is full" };
                connectedUser = users === null || users === void 0 ? void 0 : users.find(function (u) { return u.userId === ws.userId; });
                if (!connectedUser) return [3 /*break*/, 4];
                if (!!connectedUser.socketId.includes(ws.socketId)) return [3 /*break*/, 3];
                connectedUser.socketId.push(ws.socketId);
                return [4 /*yield*/, instances_1.redis.set(roomId, "users", users)];
            case 2:
                _d.sent();
                _d.label = 3;
            case 3: return [3 /*break*/, 6];
            case 4:
                _a = {
                    userId: ws.userId,
                    socketId: [ws.socketId]
                };
                return [4 /*yield*/, instances_1.userService.getUserById(ws.userId)];
            case 5:
                user = (_a.nickname = ((_b = (_d.sent())) === null || _b === void 0 ? void 0 : _b.nickname) || "Unknown",
                    _a);
                instances_1.redis.set(roomId, "users", __spreadArray(__spreadArray([], (users || []), true), [user], false));
                _d.label = 6;
            case 6: return [4 /*yield*/, instances_1.userService.getUserById(ws.userId)];
            case 7:
                nickname = ((_c = (_d.sent())) === null || _c === void 0 ? void 0 : _c.nickname) || "Unknown";
                updatedRoomState = connectedUser
                    ? users
                    : __spreadArray(__spreadArray([], (users || []), true), [
                        { userId: ws.userId, socketId: [ws.socketId], nickname: nickname },
                    ], false);
                return [4 /*yield*/, instances_1.redis.set(roomId, "users", updatedRoomState)];
            case 8:
                _d.sent();
                if (!ws.rooms)
                    ws.rooms = [];
                if (!ws.rooms.includes(roomId))
                    ws.rooms.push(roomId);
                if (!instances_1.roomClients.has(roomId)) {
                    instances_1.roomClients.set(roomId, new Set([ws]));
                }
                else {
                    instances_1.roomClients.get(roomId).add(ws);
                }
                instances_1.notifier.sendToClient(ws, MessageType_1.MessageType.SIGNIN_REPLY, {
                    _id: roomId,
                });
                if (connectedUser)
                    return [2 /*return*/];
                return [4 /*yield*/, (0, timer_1.timer)(1000)];
            case 9:
                _d.sent();
                instances_1.notifier.sendToRoom(MessageType_1.MessageType.SIGNIN_ROOM, roomId, {
                    nickname: user.nickname,
                    users: updatedRoomState.length,
                });
                if (room.public) {
                    instances_1.notifier.broadcastToClients(MessageType_1.MessageType.UPDATE_ROOM_STATE, {
                        _id: roomId,
                        users: updatedRoomState.length,
                    });
                }
                else {
                    instances_1.notifier.sendToUser(MessageType_1.MessageType.UPDATE_ROOM_STATE, room.ownerId, roomId, {
                        users: updatedRoomState.length,
                    });
                    instances_1.notifier.sendToRoom(MessageType_1.MessageType.UPDATE_ROOM_STATE, roomId, {
                        users: updatedRoomState.length,
                    });
                }
                return [2 /*return*/];
        }
    });
}); };
exports.signin = signin;
//# sourceMappingURL=signin.js.map