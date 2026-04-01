import express from "express";
import http from "http";
import 'dotenv/config';
import { connectToMongo } from "./src/Mongo/connectToMongo";
import { startWebSocketServer } from "./src/WebSocket/Bootstrap";

const app = express();
const server = http.createServer(app);

app.use(express.json());

connectToMongo();
startWebSocketServer(server);

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

app.get("/health", (req, res) => {
  res.send("orquestrator ok");
});

