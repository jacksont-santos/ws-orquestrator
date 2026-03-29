"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startWebSocketServer = startWebSocketServer;
var WSService_1 = require("./WSService");
function startWebSocketServer(server) {
    new WSService_1.WSService(server);
}
//# sourceMappingURL=Bootstrap.js.map