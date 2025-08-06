"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var http_1 = __importDefault(require("http"));
require("dotenv/config");
var mongo_1 = require("./src/database/mongo/connection/mongo");
var bootstrap_1 = require("./src/ws/bootstrap");
var app = (0, express_1.default)();
var server = http_1.default.createServer(app);
app.use(express_1.default.json());
(0, mongo_1.connectToDatabase)();
(0, bootstrap_1.startWebSocketServer)();
var port = process.env.PORT || 3000;
server.listen(port, function () {
    console.log("Server started on port ".concat(port));
});
app.get("/health", function (req, res) {
    res.send("ok");
});
//# sourceMappingURL=index.js.map