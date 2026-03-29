
import { WebSocketServer } from "ws";
import http from "http";
import { randomUUID } from "crypto";
import { CustomWebSocket } from "./Interfaces";
import { clients, roomClients, redis, } from "../instances";
import { onMessage } from "./OnMessage/OnMessage";


export class WSService {
  private wss: WebSocketServer;
  private heartbeatInterval = 30000;

  constructor(server: http.Server) {
    this.wss = new WebSocketServer({ server});
    this.wss.on("connection", (ws: CustomWebSocket) => {
      ws.isAlive = true;
      ws.rooms = [];
      if (!ws.socketId) ws.socketId = randomUUID();

      ws.on("pong", () => (ws.isAlive = true));
      ws.on("error", (err) => console.error(err));
      ws.on("message", (message: string) => onMessage(ws, message));
      ws.on("close", () => this.onClose(ws));
    });

    setInterval(() => {
      this.wss.clients.forEach((ws: CustomWebSocket) => {
        if (!ws.isAlive) return ws.terminate();
        ws.isAlive = false;
        ws.ping();
      });
      redis.removeJunkRedisData();
    }, this.heartbeatInterval);
  }

  private async onClose(ws: CustomWebSocket) {
    this.removeClient(ws.socketId, ws.userId);
    await this.removeRoomClient(ws);
  }



  private removeClient(socketId: string, userId: string) {
    const clientConections = clients.get(userId);
    if (!clientConections) return;

    for (const ws of Array.from(clientConections)) {
      if (ws.socketId === socketId) {
        clientConections.delete(ws);
        break;
      }
    }

    if (clientConections.size === 0) clients.delete(userId);
  }

  private async removeRoomClient(ws: CustomWebSocket) {
    const socketId = ws.socketId;

    if (!ws.rooms || !ws.rooms.length) return;

    const promises: Promise<void>[] = [];
    for (let roomId of ws.rooms) {
      const clients = roomClients.get(roomId);
      if (clients) {
        for (const client of Array.from(clients)) {
          if (client.socketId === socketId) {
            clients.delete(client);
            break;
          }
        }
        if (clients.size === 0) roomClients.delete(roomId);
      };

      promises.push(redis.liberateRedisMemory(socketId, roomId));
    }
    await Promise.all(promises);
  }
}
