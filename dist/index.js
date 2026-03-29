"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var http_1 = __importDefault(require("http"));
require("dotenv/config");
var connectToMongo_1 = require("./src/Mongo/connectToMongo");
var Bootstrap_1 = require("./src/WebSocket/Bootstrap");
var app = (0, express_1.default)();
var server = http_1.default.createServer(app);
app.use(express_1.default.json());
(0, connectToMongo_1.connectToMongo)();
(0, Bootstrap_1.startWebSocketServer)(server);
var port = process.env.PORT || 3000;
server.listen(port, function () {
    console.log("Server started on port ".concat(port));
});
app.get("/health", function (req, res) {
    res.send("ok");
});
//# sourceMappingURL=index.js.map