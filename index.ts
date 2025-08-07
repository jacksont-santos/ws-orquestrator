import express from "express";
import http from "http";
import 'dotenv/config';
import { connectToDatabase } from "./src/database/mongo/connection/mongo";
import { startWebSocketServer } from "./src/ws/bootstrap";

const app = express();
const server = http.createServer(app);

app.use(express.json());

connectToDatabase()
startWebSocketServer(server);

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

app.get("/health", (req, res) => {
  res.send("ok");
});

