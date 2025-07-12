import express from "express";
import http from "http";
import 'dotenv/config';
import { WSService } from "./src/ws/wsService";
import { connectToDatabase } from "./src/database/mongo/connection/mongo";
// import { router } from './src/routes/index';

const app = express();
const server = http.createServer(app);

app.use(express.json());
// app.use('/room', router);

(async () => {
  await connectToDatabase();
})();
const wsService = new WSService();

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

app.get("/health", (req, res) => {
  res.send("ok");
});

