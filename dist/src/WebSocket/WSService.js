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
var crypto_1 = require("crypto");
var instances_1 = require("../instances");
var OnMessage_1 = require("./OnMessage/OnMessage");
var WSService = /** @class */ (function () {
    function WSService(server) {
        var _this = this;
        this.heartbeatInterval = 30000;
        this.wss = new ws_1.WebSocketServer({ server: server });
        this.wss.on("connection", function (ws) {
            ws.isAlive = true;
            ws.rooms = [];
            if (!ws.socketId)
                ws.socketId = (0, crypto_1.randomUUID)();
            ws.on("pong", function () { return (ws.isAlive = true); });
            ws.on("error", function (err) { return console.error(err); });
            ws.on("message", function (message) { return (0, OnMessage_1.onMessage)(ws, message); });
            ws.on("close", function () { return _this.onClose(ws); });
        });
        setInterval(function () {
            _this.wss.clients.forEach(function (ws) {
                if (!ws.isAlive)
                    return ws.terminate();
                ws.isAlive = false;
                ws.ping();
            });
            instances_1.redis.removeJunkRedisData();
        }, this.heartbeatInterval);
    }
    WSService.prototype.onClose = function (ws) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.removeClient(ws.socketId, ws.userId);
                        return [4 /*yield*/, this.removeRoomClient(ws)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    WSService.prototype.removeClient = function (socketId, userId) {
        var clientConections = instances_1.clients.get(userId);
        if (!clientConections)
            return;
        for (var _i = 0, _a = Array.from(clientConections); _i < _a.length; _i++) {
            var ws = _a[_i];
            if (ws.socketId === socketId) {
                clientConections.delete(ws);
                break;
            }
        }
        if (clientConections.size === 0)
            instances_1.clients.delete(userId);
    };
    WSService.prototype.removeRoomClient = function (ws) {
        return __awaiter(this, void 0, void 0, function () {
            var socketId, promises, _i, _a, roomId, clients_1, _b, _c, client;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        socketId = ws.socketId;
                        if (!ws.rooms || !ws.rooms.length)
                            return [2 /*return*/];
                        promises = [];
                        for (_i = 0, _a = ws.rooms; _i < _a.length; _i++) {
                            roomId = _a[_i];
                            clients_1 = instances_1.roomClients.get(roomId);
                            if (clients_1) {
                                for (_b = 0, _c = Array.from(clients_1); _b < _c.length; _b++) {
                                    client = _c[_b];
                                    if (client.socketId === socketId) {
                                        clients_1.delete(client);
                                        break;
                                    }
                                }
                                if (clients_1.size === 0)
                                    instances_1.roomClients.delete(roomId);
                            }
                            ;
                            promises.push(instances_1.redis.liberateRedisMemory(socketId, roomId));
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
//# sourceMappingURL=WSService.js.map