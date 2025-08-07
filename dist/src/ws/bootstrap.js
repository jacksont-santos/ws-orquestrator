"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startWebSocketServer = startWebSocketServer;
var wsService_1 = require("./wsService");
var instances_1 = require("../instances");
function startWebSocketServer(server) {
    new wsService_1.WSService(server, instances_1.publicClients, instances_1.privateClients, instances_1.roomClients, instances_1.notifier, instances_1.redis, instances_1.signRoom);
}
//# sourceMappingURL=bootstrap.js.map