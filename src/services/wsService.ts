import { WebSocketServer, WebSocket } from "ws";
import { chatModel, roomModel, userModel } from "../database/mongo/models";
import Redis from "../redis/redisClient";
import { verifyPassword, signJWT } from "../utils/jwt";
import { randomUUID } from "crypto";
import { MessageType } from "../utils/messageTypes";
import { CustomWebSocket } from "../utils/customWebSocket";
import {
  OutMessage,
  RawMessage,
  RoomState,
} from "../types";
import { timer } from "../utils/timer";

export class WSService {
  private wss = new WebSocketServer({ port: Number(process.env.WS_PORT) });
  private heartbeatInterval = 30000;

  private publicClients = new Set<CustomWebSocket>();
  private privateClients = new Map<string, { ws: CustomWebSocket }>();
  private roomClients = new Map<string, Set<CustomWebSocket>>();
  private socketIdMap = new Map<string, CustomWebSocket>();

  private redis = new Redis();

  constructor() {
    this.wss.on("connection", (ws: CustomWebSocket) => {
      ws.isAlive = true;
      ws.socketId = randomUUID();
      this.socketIdMap.set(ws.socketId, ws);

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
    }, this.heartbeatInterval);
  }

  private async onMessage(ws: CustomWebSocket, message: string) {
    try {
      const raw: RawMessage = JSON.parse(message);
      const { type, userId, data } = raw;

      switch (type) {
        case MessageType.PUBLIC:
          this.setPublicClient(ws);
          break;

        case MessageType.PRIVATE:
          this.setPrivateClient(ws, userId);
          break;

        case MessageType.SIGNIN_ROOM:
          await this.signinRoom(data, ws, userId);
          break;
          
        case MessageType.SIGNOUT_ROOM:
          await this.signoutRoom(data, ws);
          break;

        case MessageType.ADD_ROOM:
        case MessageType.UPDATE_ROOM:
        case MessageType.REMOVE_ROOM:
          await this.notifyRoomUpdate(userId, raw);
          break;

        case MessageType.CHAT:
          await this.onChatMessage(ws, raw);
          break;

        case MessageType.ROOM_STATE:
          await this.getRoomState(ws, data);
          break;

        case MessageType.ROOMS_STATE:
          await this.getRoomsState(ws, userId);
          break;

        default:
          this.send(ws, { type: "error", message: "Unknown message type" });
      }
    } catch (error) {
      this.send(ws, {
        type: "error",
        data: error,
        message: "Error handling message",
      });
    }
  }

  private async getRoomState(
    ws: CustomWebSocket,
    data: any
  ): Promise<any> {
    const { roomId } = data;
    const roomState = (await this.redis.get(
      roomId,
      "users"
    )) as RoomState["users"];
    const users = !roomState ? 0 : roomState?.length;

    const message: OutMessage = {
      type: MessageType.ROOM_STATE,
      data: { users },
    };
    this.send(ws, JSON.stringify(message));
  }

  private async getRoomsState(
    ws: CustomWebSocket,
    userId?: string
  ): Promise<any> {
    const [publicRooms, privateRooms] = await Promise.all([
      roomModel.find({ public: true, active: true }, { _id: 1 }),
      userId
        ? roomModel.find(
            { public: false, active: true, ownerId: userId },
            { _id: 1 }
          )
        : [],
    ]);
    const roomIds = [...publicRooms, ...privateRooms].map((room) => room._id);
    const allRoomsState = await this.redis.getItems(roomIds, "users");
    const data = allRoomsState.map((item) => ({
      roomId: item.key,
      users: item.value ? item.value.length : 0,
    }));
    const message: OutMessage = {
      type: MessageType.ROOMS_STATE,
      data: { rooms: data },
    };
    this.send(ws, JSON.stringify(message));
  }

  private async signinRoom(
    data: any,
    ws: CustomWebSocket,
    userId?: string
  ): Promise<void> {
    const { roomId, nickname, password, token } = data;

    if (!roomId || !nickname)
      throw { type: "error", message: "Invalid signin data" };

    const response = await Promise.allSettled([
      this.redis.get(roomId, "users") as Promise<RoomState["users"]>,
      roomModel.findById(roomId, {
        _id: 1,
        ownerId: 1,
        maxUsers: 1,
        active: 1,
        public: 1,
        password: 1,
      }),
    ]);
    const users = response[0].status === "fulfilled" ? response[0].value : null;
    const room = response[1].status === "fulfilled" ? response[1].value : null;

    const connectedUser = users?.find((u) => u.nickname === nickname);
    if (connectedUser && token != connectedUser.token) return;

    if (!room) throw { type: "error", message: "Room not found" };
    if (!room.active) throw { type: "error", message: "Inactive room" };
    if (!connectedUser && users?.length >= room.maxUsers)
      throw { type: "error", message: "Room is full" };

    if (!room.public && userId !== room.ownerId) {
      if (!password) throw { type: "error", message: "Password required" };
      const decodedPassword = verifyPassword(password);
      if (!decodedPassword || decodedPassword !== password)
        throw { type: "error", message: "Invalid password" };
    };

    this.publicClients.delete(ws);
    this.removePrivateClient(ws);
    if (this.roomClients.has(roomId)) this.roomClients.get(roomId)!.add(ws);
    else this.roomClients.set(roomId, new Set([ws]));

    const state = {
      nickname,
      token: signJWT({ roomId, nickname, date: new Date() }),
      socketId: ws.socketId,
    };
    const updatedRoomState = connectedUser ? users : [...(users || []), state];

    await this.redis.set(roomId, "users", updatedRoomState);

    const userMessage: OutMessage = {
      type: MessageType.SIGNIN_REPLY,
      data: { _id: roomId, token: state.token },
    };
    this.send(ws, JSON.stringify(userMessage));

    if (connectedUser) return;
    await timer(1000);

    const roomMessage: OutMessage = {
      type: MessageType.SIGNIN_ROOM,
      data: { _id: roomId, nickname },
    };
    this.notifyClients(JSON.stringify(roomMessage), roomId);

    const clientsMessage: OutMessage = {
      type: MessageType.UPDATE_ROOM_STATE,
      data: { _id: roomId, users: updatedRoomState.length },
    };
    this.notifyClients(
      JSON.stringify(clientsMessage),
      undefined,
      room.public ? undefined : room.ownerId
    );
  }

  private async signoutRoom(
    data: any,
    ws: CustomWebSocket,
  ): Promise<void> {
    const { roomId, nickname, token } = data;
    if (!roomId || !nickname || !token)
      throw { type: "error", message: "Invalid signout data" };

    const response = await Promise.allSettled([
      this.redis.get(roomId, "users") as Promise<RoomState["users"]>,
      roomModel.findById(roomId, {
        ownerId: 1,
        public: 1,
      }),
    ]);
    const users = response[0].status === "fulfilled" ? response[0].value : null;
    const room = response[1].status === "fulfilled" ? response[1].value : null;

    const connectedUser = users?.find((u) => u.token === token);
    if (!connectedUser) return;
    if (!room) throw { type: "error", message: "Room not found" };

    this.roomClients.get(roomId)?.delete(ws);
    if (this.roomClients.get(roomId)?.size === 0)
      this.roomClients.delete(roomId);

    const updatedUsers = users?.filter((u) => u.token != token);
    if (updatedUsers?.length === 0) await this.redis.del(roomId, "users");
    else await this.redis.set(roomId, "users", updatedUsers);

    const roomMessage: OutMessage = {
      type: MessageType.SIGNOUT_ROOM,
      data: {
        _id: roomId,
        nickname: connectedUser.nickname,
        users: updatedUsers.length,
      },
    };
    this.notifyClients(JSON.stringify(roomMessage), roomId);

    const clientsMessage: OutMessage = {
      type: MessageType.UPDATE_ROOM_STATE,
      data: { _id: roomId, users: updatedUsers.length },
    };
    this.notifyClients(
      JSON.stringify(clientsMessage),
      undefined,
      room.public ? undefined : room.ownerId
    );
  }

  private notifyClients(
    message: string,
    roomId?: string,
    userId?: string
  ) {
    if (roomId && this.roomClients.has(roomId)) {
      this.roomClients
        .get(roomId)!
        .forEach((client) => this.send(client, message));
    };

    if (!roomId && !userId) {
      this.publicClients.forEach((client) => this.send(client, message));
      this.privateClients.forEach((client) => this.send(client.ws, message));
    };

    if (!roomId && userId && this.privateClients.has(userId)) {
      this.send(this.privateClients.get(userId)!.ws, message);
    };

  }

  private async notifyRoomUpdate(userId: string, raw: RawMessage) {
    const { roomId, public: isPublic } = raw.data;
    this.notifyClients(JSON.stringify(raw), roomId);
    this.notifyClients(JSON.stringify(raw), undefined, isPublic ? undefined : userId);
  }

  private async onChatMessage(ws: CustomWebSocket, raw: RawMessage) {
    try {
      const data = JSON.parse(raw.data);
      const { roomId, nickname, content, token } = data;
      if (!roomId || !nickname || !content || !token)
        throw { type: "error", message: "Invalid chat data" };

      await this.updateRoomMessageState(roomId, nickname, token);
      this.notifyClients(JSON.stringify(raw), roomId);
      await chatModel.updateOne(
        { roomId },
        {
          $push: {
            chat: { nickname, content, createdAt: new Date() },
            $position: 0,
          },
          $set: { updatedAt: new Date() },
        },
        { upsert: true }
      );
    } catch (err) {
      this.send(ws, err);
    }
  }

  private async updateRoomMessageState(
    roomId: string,
    nickname: string,
    token: string
  ): Promise<void> {
    const users = (await this.redis.get(roomId, "users")) as RoomState["users"];
    const user = users?.find((u) => u.nickname === nickname);
    if (!user) throw { type: "error", message: "You are not in this room" };
    if (user.token !== token) throw { type: "error", message: "Invalid token" };

    const limit = Number(process.env.MINUTES_LIMIT_BETWEEN_MESSAGES) || 30;
    const cutoff = Date.now() - limit * 60 * 1000;

    const filtered = users?.filter(
      (u) =>
        u.nickname !== nickname &&
        (!u.lastMessage || u.lastMessage.getTime() > cutoff)
    );

    filtered.push({ nickname, token, lastMessage: new Date() });
    await this.redis.set(roomId, "users", filtered);
  }

  private send(ws: CustomWebSocket, data: any) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(typeof data === "string" ? data : JSON.stringify(data));
    }
  }

  private setPublicClient(ws: CustomWebSocket) {
    this.publicClients.add(ws);
    this.removePrivateClient(ws);
    this.removeRoomClient(ws);
  }

  private async setPrivateClient(ws: CustomWebSocket, userId: string) {
    if (userId) {
      const user = await userModel.exists({ _id: userId });
      if (user) {
        await this.removeRoomClient(ws);
        this.publicClients.delete(ws);
        this.privateClients.set(userId, { ws });
      }
    }
  }

  private onClose(ws: CustomWebSocket) {
    this.publicClients.delete(ws);
    this.removePrivateClient(ws);
    this.removeRoomClient(ws);
    this.socketIdMap.delete(ws.socketId);
  }

  private removePrivateClient(ws: WebSocket) {
    for (const [id, client] of Array.from(this.privateClients.entries())) {
      if (client.ws === ws) this.privateClients.delete(id);
    }
  }

  private async removeRoomClient(ws: CustomWebSocket) {
    const socketId = ws.socketId;
    const promises: Promise<void>[] = [];

    for (const [roomId, clients] of Array.from(this.roomClients.entries())) {
      if (clients.has(ws)) {
        clients.delete(ws);
        if (clients.size === 0) {
          this.roomClients.delete(roomId);
        }
        promises.push(this.liberateRedisMemory(socketId, roomId));
      };
    };

    await Promise.all(promises);
  }

  private async liberateRedisMemory(socketId: string, roomId: string) {
    const roomState = (await this.redis.get(
      roomId,
      "users"
    )) as RoomState["users"];

    const nicknameUser = roomState?.find((u) => u.socketId === socketId)?.nickname;
    if (roomState && nicknameUser) {
      const filtered = roomState.filter((u) => u.socketId !== socketId);
      if (filtered.length === 0) await this.redis.del(roomId, "users");
      else await this.redis.set(roomId, "users", filtered);

      this.notifyClients(
        JSON.stringify({
          type: MessageType.SIGNOUT_ROOM,
          data: {
            _id: roomId,
            users: filtered.length,
            nickname: nicknameUser
          },
        }),
        roomId
      );
      const room = await roomModel.findById(roomId, { public: 1, ownerId: 1  });
      this.notifyClients(
        JSON.stringify({
          type: MessageType.UPDATE_ROOM_STATE,
          data: { _id: roomId, users: filtered.length },
        }),
        undefined,
        room.public ? undefined : room.ownerId
      );
    };
  }
}