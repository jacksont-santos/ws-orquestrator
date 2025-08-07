import { Notifier } from "../notifier/notifier";
import { RedisService } from "../redis/redisService";
import { SignRoom } from "../handlers/signRoom";

import { WebSocketServer } from "ws";
import http from "http";
import { chatModel } from "../database/mongo/models";
import { randomUUID } from "crypto";
import { MessageType } from "../utils/messageTypes";
import { CustomWebSocket } from "../utils/customWebSocket";
import { RawMessage } from "../types";
import { setUser, removeUser, isAuthenticated } from "../auth/user";


export class WSService {
  private wss: WebSocketServer;
  private heartbeatInterval = 30000;

  constructor(
    server: http.Server,
    private publicClients: Map<string, CustomWebSocket>,
    private privateClients: Map<string, Set<CustomWebSocket>>,
    private roomClients: Map<string, Set<CustomWebSocket>>,
    private notifier: Notifier,
    private redis: RedisService,
    private signRoom: SignRoom
  ) {
    this.wss = new WebSocketServer({ server});
    this.wss.on("connection", (ws: CustomWebSocket) => {
      ws.isAlive = true;
      ws.rooms = [];
      if (!ws.socketId) ws.socketId = randomUUID();

      ws.on("pong", () => (ws.isAlive = true));
      ws.on("error", (err) => console.error(err));
      ws.on("message", (message: string) => this.onMessage(ws, message));
      ws.on("close", () => this.onClose(ws));
    });

    setInterval(() => {
      this.wss.clients.forEach((ws: CustomWebSocket) => {
        if (!ws.isAlive) return ws.terminate();
        ws.isAlive = false;
        ws.ping();
      });
      this.redis.removeJunkRedisData();
    }, this.heartbeatInterval);
  }

  private async onMessage(ws: CustomWebSocket, message: string) {
    try {
      const raw: RawMessage = JSON.parse(message);
      const { type, authToken, data } = raw;

      switch (type) {
        case MessageType.CONNECTION:
          await this.connect(ws, authToken);
          break;

        case MessageType.ROOMS_STATE:
          await this.redis.getRoomsState(ws);
          break;

        case MessageType.ROOM_STATE:
          await this.redis.getRoomState(ws, data, authToken);
          break;

        case MessageType.SIGNIN_ROOM:
          await this.signRoom.signIn(data, ws);
          break;

        case MessageType.SIGNOUT_ROOM:
          await this.signRoom.signOut(data, ws);
          break;

        case MessageType.SIGN_STATE:
          await this.signRoom.signState(data, ws);
          break;

        case MessageType.ADD_ROOM:
        case MessageType.UPDATE_ROOM:
        case MessageType.REMOVE_ROOM:
          await this.notifier.dispatchRoomChange(raw);
          break;

        case MessageType.CHAT:
          await this.onChatMessage(ws, raw);
          break;

        default:
          this.notifier.send(ws, {
            type: "error",
            message: "Unknown message type",
          });
      }
    } catch (error) {
      this.notifier.send(ws, {
        type: "error",
        data: error,
        message: "Error handling message",
      });
    }
  }

  private async connect(ws: CustomWebSocket, authToken?: string) {
    if (authToken) this.addPrivateClient(ws, authToken);
    else this.addPublicClient(ws);
    this.redis.getRoomsState(ws);
  }
  private async addPrivateClient(ws: CustomWebSocket, authToken: string) {
    await setUser(ws, authToken);
    this.privateClients.set(ws.userId, new Set([ws]));
    this.publicClients.delete(ws.userId);
  }
  private addPublicClient(ws: CustomWebSocket) {
    if (isAuthenticated(ws)) this.removePrivateClient(ws.socketId, ws.userId);
    removeUser(ws);
    this.publicClients.set(ws.socketId, ws);
  }

  private async onChatMessage(ws: CustomWebSocket, raw: RawMessage) {
    try {
      const { roomId, nickname, content, token } = raw.data;
      if (!roomId || !nickname || !content || !token)
        throw { type: "error", message: "Invalid chat data" };

      await this.redis.updateRoomMessageState(roomId, token, ws.socketId);

      const chatId = randomUUID();
      raw.data.id = chatId;
      raw.data.createdAt = new Date();
      this.notifier.sendToRoom(MessageType.CHAT, roomId, raw.data);
      await chatModel.updateOne(
        { roomId },
        {
          $push: {
            chat: {
              $each: [
                {
                  id: chatId,
                  nickname,
                  content,
                  createdAt: raw.data.createdAt,
                },
              ],
              $position: 0,
            },
          },
          $set: { updatedAt: new Date() },
        },
        { upsert: true }
      );
    } catch (err) {
      this.notifier.send(ws, err);
    }
  }

  private async onClose(ws: CustomWebSocket) {
    this.removePublicClient(ws.socketId);
    this.removePrivateClient(ws.socketId, ws.userId);
    await this.removeRoomClient(ws);
  }

  private removePublicClient(socketId: string) {
    this.publicClients.delete(socketId);
  }

  private removePrivateClient(socketId: string, userId: string) {
    if (!userId) return;

    const clients = this.privateClients.get(userId);
    if (!clients) return;

    for (const ws of Array.from(clients)) {
      if (ws.socketId === socketId) {
        clients.delete(ws);
        break;
      }
    }

    if (clients.size === 0) this.privateClients.delete(userId);
  }
  private async removeRoomClient(ws: CustomWebSocket) {
    const socketId = ws.socketId;

    if (!ws.rooms || !ws.rooms.length) return;

    const promises: Promise<void>[] = [];
    for (let roomId of ws.rooms) {
      const clients = this.roomClients.get(roomId);
      if (clients) {
        for (const client of Array.from(clients)) {
          if (client.socketId === socketId) {
            clients.delete(client);
            break;
          }
        }
        if (clients.size === 0) this.roomClients.delete(roomId);
      };

      promises.push(this.redis.liberateRedisMemory(socketId, roomId));
    }
    await Promise.all(promises);
  }
}
