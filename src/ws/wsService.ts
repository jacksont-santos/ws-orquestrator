// Versão revisada do seu WSService com melhorias, correções e suporte a reconexão (ping/pong)

import { WebSocketServer, WebSocket } from "ws";
import { randomUUID } from "crypto";
import { chatModel, roomModel, userModel, Message } from "../database/mongo/models";
import Redis from "../database/redis/connection/redisClient";

// Tipos de mensagens recebidas
enum MessageType {
  PUBLIC = 'public',
  PRIVATE = 'private',
  ADD_ROOM = 'addRoom',
  UPDATE_ROOM = 'updateRoom',
  REMOVE_ROOM = 'removeRoom',
  SIGNIN_ROOM = 'signinRoom',
  SIGNOUT_ROOM = 'signoutRoom',
  CHAT = 'chat',
}

interface RawMessage {
  type: MessageType;
  userId?: string;
  data?: any;
}

interface OutMessage {
  type: string;
  data?: any;
  message?: string;
}

interface RoomState {
  users: Array<{ nickname: string; lastMessage?: Date }>;
}

export class WSService {
  private publicClients = new Set<WebSocket>();
  private privateClients = new Map<string, { ws: WebSocket }>();
  private roomClients = new Map<string, Set<WebSocket>>();
  private wss = new WebSocketServer({ port: Number(process.env.WS_PORT) });
  private redis = new Redis();
  private heartbeatInterval = 30000; // 30 segundos

  constructor() {
    this.wss.on("connection", (ws: WebSocket) => {
      console.log("Client connected");
      (ws as any).isAlive = true;

      ws.on("pong", () => (ws as any).isAlive = true);
      ws.on("error", (err) => console.error(err));
      ws.on("message", (message: string) => this.onMessage(ws, message));
      ws.on("close", () => this.onClose(ws));
    });

    // Setup ping/pong
    setInterval(() => {
      this.wss.clients.forEach((ws) => {
        if (!(ws as any).isAlive) return ws.terminate();
        (ws as any).isAlive = false;
        ws.ping();
      });
    }, this.heartbeatInterval);
  }

  private async onMessage(ws: WebSocket, message: string) {
    try {
      const raw: RawMessage = JSON.parse(message);
      const { type, userId, data } = raw;
      if (!type || !data) return;

      switch (type) {
        case MessageType.PUBLIC:
          this.publicClients.add(ws);
          break;

        case MessageType.PRIVATE:
          if (userId) {
            const user = await userModel.findById(userId);
            if (user) this.privateClients.set(userId, { ws });
          }
          break;

        case MessageType.SIGNIN_ROOM:
        case MessageType.SIGNOUT_ROOM:
          await this.signRoom(type, userId, data, ws);
          break;

        case MessageType.ADD_ROOM:
        case MessageType.UPDATE_ROOM:
        case MessageType.REMOVE_ROOM:
          await this.notifyRoomUpdate(userId, raw);
          break;

        case MessageType.CHAT:
          await this.onChatMessage(ws, raw);
          break;

        default:
          this.send(ws, { type: "error", message: "Unknown message type" });
      }
    } catch (error) {
      this.send(ws, { type: "error", message: "Error handling message" });
    }
  }

  private async signRoom(type: MessageType, userId: string, data: any, ws: WebSocket) {
    const { roomId, nickname, public: isPublic } = data;
    let message: OutMessage;

    try {
      message = await (type === MessageType.SIGNIN_ROOM
        ? this.signinRoom(roomId, nickname, ws)
        : this.signoutRoom(roomId, nickname, ws));
    } catch (err) {
      message = err;
    }

    this.notifyClients(JSON.stringify(message), isPublic, roomId, userId);
  }

  private async signinRoom(roomId: string, nickname: string, ws: WebSocket): Promise<OutMessage> {
    this.publicClients.delete(ws);
    if (!this.roomClients.has(roomId)) this.roomClients.set(roomId, new Set());
    this.roomClients.get(roomId)!.add(ws);

    const roomState = await this.redis.get(roomId) as RoomState;
    const room = await roomModel.findById(roomId, { _id: 1, maxUsers: 1, active: 1 });
    if (!room) throw { type: "error", message: "Room not found" };
    if (!room.active) throw { type: "error", message: "Inactive room" };
    if (roomState?.users.length >= room.maxUsers)
      throw { type: "error", message: "Room is full" };

    const alreadyInRoom = roomState?.users.find((u) => u.nickname === nickname);
    if (!alreadyInRoom) {
      const updatedUsers = [...(roomState?.users || []), { nickname }];
      await this.redis.set(roomId, { users: updatedUsers });
    }

    return { type: "joinRoom", data: { roomId, nickname } };
  }

  private async signoutRoom(roomId: string, nickname: string, ws: WebSocket): Promise<OutMessage> {
    this.roomClients.get(roomId)?.delete(ws);
    if (this.roomClients.get(roomId)?.size === 0) this.roomClients.delete(roomId);

    const roomState = await this.redis.get(roomId) as RoomState;
    if (!roomState) throw { type: "error", message: "Room state not found" };

    const updatedUsers = roomState.users.filter((u) => u.nickname !== nickname);
    if (updatedUsers.length === 0) await this.redis.del(roomId);
    else await this.redis.set(roomId, { users: updatedUsers });

    return { type: "leaveRoom", data: { roomId, nickname } };
  }

  private notifyClients(message: string, isPublic?: boolean, roomId?: string, userId?: string) {
    if (roomId && this.roomClients.has(roomId)) {
      this.roomClients.get(roomId)!.forEach((client) => this.send(client, message));
    }

    if (userId && this.privateClients.has(userId)) {
      this.send(this.privateClients.get(userId)!.ws, message);
    }

    if (isPublic) {
      this.publicClients.forEach((client) => this.send(client, message));
    }
  }

  private async notifyRoomUpdate(userId: string, raw: RawMessage) {
    const { roomId, public: isPublic } = raw.data;
    this.notifyClients(JSON.stringify(raw), isPublic, roomId, userId);
  }

  private async onChatMessage(ws: WebSocket, raw: RawMessage) {
    const data = JSON.parse(raw.data);
    const { roomId, nickname } = data;

    try {
      await this.updateRoomMessageState(roomId, nickname);
      this.notifyClients(JSON.stringify(raw), false, roomId);
    } catch (err) {
      this.send(ws, err);
    }
  }

  private async updateRoomMessageState(roomId: string, nickname: string): Promise<void> {
    const state = await this.getRoomState(roomId, nickname);
    const limit = Number(process.env.MINUTES_LIMIT_BETWEEN_MESSAGES) || 2;
    const cutoff = Date.now() - limit * 60 * 1000;

    const filtered = state.users.filter((u) =>
      u.nickname !== nickname && (!u.lastMessage || u.lastMessage.getTime() > cutoff)
    );

    filtered.push({ nickname, lastMessage: new Date() });
    await this.redis.set(roomId, { users: filtered });
  }

  private async getRoomState(roomId: string, nickname: string): Promise<RoomState> {
    const users = await this.redis.get(roomId, 'users') as RoomState['users'];
    if (!users?.find((u) => u.nickname === nickname)) {
      throw { type: "error", message: "You are not in this room" };
    }
    return { users };
  }

  private onClose(ws: WebSocket) {
    console.log("Client disconnected");
    this.publicClients.delete(ws);

    for (const [id, client] of Array.from(this.privateClients.entries())) {
      if (client.ws === ws) this.privateClients.delete(id);
    }

    for (const [roomId, clients] of Array.from(this.roomClients.entries())) {
      clients.delete(ws);
      if (clients.size === 0) this.roomClients.delete(roomId);
    }
  }

  private send(ws: WebSocket, data: any) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(typeof data === 'string' ? data : JSON.stringify(data));
    }
  }
}
