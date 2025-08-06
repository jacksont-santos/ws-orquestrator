"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signRoom = exports.redis = exports.notifier = exports.roomClients = exports.privateClients = exports.publicClients = void 0;
var notifier_1 = require("../notifier/notifier");
var redisService_1 = require("../redis/redisService");
var signRoom_1 = require("../handlers/signRoom");
exports.publicClients = new Map();
exports.privateClients = new Map();
exports.roomClients = new Map();
exports.notifier = new notifier_1.Notifier(exports.publicClients, exports.privateClients, exports.roomClients);
exports.redis = new redisService_1.RedisService(exports.notifier, exports.roomClients);
exports.signRoom = new signRoom_1.SignRoom(exports.notifier, exports.redis, exports.roomClients);
//# sourceMappingURL=index.js.map