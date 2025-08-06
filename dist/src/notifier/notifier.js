"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notifier = void 0;
var messageTypes_1 = require("../utils/messageTypes");
var ws_1 = __importDefault(require("ws"));
var Notifier = /** @class */ (function () {
    function Notifier(publicClients, privateClients, roomClients) {
        this.publicClients = publicClients;
        this.privateClients = privateClients;
        this.roomClients = roomClients;
    }
    Notifier.prototype.send = function (ws, data) {
        if (ws.readyState === ws_1.default.OPEN) {
            ws.send(typeof data === "string" ? data : JSON.stringify(data));
        }
    };
    Notifier.prototype.sendToClient = function (ws, type, data) {
        var message = {
            type: type,
            data: data,
        };
        this.send(ws, JSON.stringify(message));
    };
    Notifier.prototype.sendToRoom = function (type, roomId, data) {
        var roomClients = this.roomClients.get(roomId);
        if (!roomClients)
            return;
        var roomData = {
            type: type,
            data: __assign(__assign({}, data), { _id: roomId }),
        };
        var message = JSON.stringify(roomData);
        for (var _i = 0, _a = Array.from(roomClients); _i < _a.length; _i++) {
            var client = _a[_i];
            this.send(client, message);
        }
    };
    Notifier.prototype.sendToUser = function (type, userId, roomId, data) {
        var _this = this;
        var client = this.privateClients.get(userId);
        if (!client)
            return;
        var clientsData = {
            type: type,
            data: __assign(__assign({}, data), { _id: roomId }),
        };
        var message = JSON.stringify(clientsData);
        client.forEach(function (ws) { return _this.send(ws, message); });
    };
    Notifier.prototype.broadcastToClients = function (type, data) {
        var _this = this;
        var publicData = {
            type: type,
            data: data,
        };
        var message = JSON.stringify(publicData);
        this.privateClients.forEach(function (client) {
            return client.forEach(function (ws) { return _this.send(ws, message); });
        });
        this.publicClients.forEach(function (ws) { return _this.send(ws, message); });
    };
    Notifier.prototype.dispatchRoomChange = function (raw) {
        return __awaiter(this, void 0, void 0, function () {
            var type, userId, data, roomId, isPublic;
            return __generator(this, function (_a) {
                type = raw.type, userId = raw.userId, data = raw.data;
                roomId = data.roomId, isPublic = data.public;
                if (!type || !roomId || !isPublic && !userId)
                    return [2 /*return*/];
                if ([
                    messageTypes_1.MessageType.ADD_ROOM,
                    messageTypes_1.MessageType.REMOVE_ROOM,
                    messageTypes_1.MessageType.UPDATE_ROOM
                ].includes(type)) {
                    if (isPublic)
                        this.broadcastToClients(type, data);
                    else
                        this.sendToUser(type, userId, roomId, data);
                }
                ;
                if (type == messageTypes_1.MessageType.UPDATE_ROOM_STATE) {
                    this.sendToRoom(type, roomId, data);
                }
                ;
                return [2 /*return*/];
            });
        });
    };
    return Notifier;
}());
exports.Notifier = Notifier;
//# sourceMappingURL=notifier.js.map