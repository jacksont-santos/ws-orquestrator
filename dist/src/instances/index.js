"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signRoom = exports.redis = exports.notifier = exports.roomClients = exports.clients = void 0;
var notifier_1 = require("../notifier/notifier");
var redisService_1 = require("../redis/redisService");
var signRoom_1 = require("../handlers/signRoom");
exports.clients = new Map();
exports.roomClients = new Map();
exports.notifier = new notifier_1.Notifier(exports.clients, exports.roomClients);
exports.redis = new redisService_1.RedisService(exports.notifier, exports.roomClients);
exports.signRoom = new signRoom_1.SignRoom(exports.notifier, exports.redis, exports.roomClients);
//# sourceMappingURL=index.js.map