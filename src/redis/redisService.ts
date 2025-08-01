import { RedisClient } from "./redisClient";
import { roomModel } from "../database/mongo/models";
import { CustomWebSocket } from "../utils/customWebSocket";
import { MessageType } from "../utils/messageTypes";
import { OutMessage, RoomState } from "../types";
import { getUserId } from "../auth/user";
// import { send } from "../utils/wsSender";
import { Notifier } from "../notifier/notifier";

export class RedisService {
  // private redis: Redis;

  constructor(
    private notifier: Notifier,
    private roomClients: Map<string, Set<CustomWebSocket>>,
    private redis = new RedisClient()
  ) {}

  async get(key: string, field: string): Promise<any> {
    return this.redis.get(key, field);
  }

  async set(key: string, field: string, value: object): Promise<{} | string> {
    return this.redis.set(key, field, value);
  }

  async del(key: string, field: string): Promise<number | string> {
    return this.redis.del(key, field);
  }
  async keys(): Promise<string[]> {
    return this.redis.keys();
  }

  async getItems(keys: string[], field: string) {
    const queries = keys.map(async (key) => ({
      key,
      value: await this.redis.get(key, field),
    }));
    const response = await Promise.allSettled(queries);
    return response
      .map((res) => (res.status === "fulfilled" ? res.value : null))
      .filter((doc) => doc !== null);
  }

  async getRoomsState(ws: CustomWebSocket): Promise<any> {
    const [publicRooms, privateRooms] = await Promise.all([
      roomModel.find({ public: true, active: true }, { _id: 1 }),
      ws.userId
        ? roomModel.find(
            { public: false, active: true, ownerId: ws.userId },
            { _id: 1 }
          )
        : [],
    ]);
    const roomIds = [...publicRooms, ...privateRooms].map((room) => room._id);
    const allRoomsState = await this.getItems(roomIds, "users");
    const data = allRoomsState.map((item) => ({
      roomId: item.key,
      users: item.value ? item.value.length : 0,
    }));
    const message: OutMessage = {
      type: MessageType.ROOMS_STATE,
      data: { rooms: data },
    };
    this.notifier.send(ws, JSON.stringify(message));
  }

  async getRoomState(
    ws: CustomWebSocket,
    data: any,
    authToken?: string
  ): Promise<any> {
    const { roomId } = data;
    const room = await roomModel.findById(roomId, {
      _id: 1,
      public: 1,
      ownerId: 1,
    });
    if (!room) throw { type: "error", message: "Room not found" };

    if (!room.public) {
      const userId = getUserId(authToken);
      if (room.ownerId !== userId) {
        const message: OutMessage = {
          type: MessageType.ROOM_STATE,
          data: { _id: roomId, users: 0 },
        };
        this.notifier.send(ws, JSON.stringify(message));
        return;
      }
    }

    const roomState = (await this.redis.get(
      roomId,
      "users"
    )) as RoomState["users"];
    const users = !roomState ? 0 : roomState?.length;

    const message: OutMessage = {
      type: MessageType.ROOM_STATE,
      data: { _id: roomId, users },
    };
    this.notifier.send(ws, JSON.stringify(message));
  }

  async updateRoomMessageState(
    roomId: string,
    token: string,
    socketId: string
  ): Promise<void> {
    if (!roomId || !token)
      throw { type: "error", message: "Invalid room data" };

    const users = (await this.redis.get(roomId, "users")) as RoomState["users"];
    const user = users?.find((u) => u.token === token);
    if (!user || !user.socketId.includes(socketId))
      throw { type: "error", message: "You are not in this room" };

    user.lastMessage = new Date();

    const limit = Number(process.env.MINUTES_LIMIT_BETWEEN_MESSAGES) || 30;
    const cutoff = Date.now() - limit * 60 * 1000;
    const filtered = users?.filter(
      (u) =>
        u.nickname == user.nickname ||
        !u.lastMessage ||
        u.lastMessage.getTime() > cutoff
    );

    await this.redis.set(roomId, "users", filtered);
  }

  async liberateRedisMemory(socketId: string, roomId: string) {
    let roomState = (await this.redis.get(
      roomId,
      "users"
    )) as RoomState["users"];

    if (!roomState || !roomState.length) return;

    const user = roomState?.find((u) => u.socketId.includes(socketId));
    if (roomState && user) {
      user.socketId = user.socketId.filter((id) => id !== socketId);
      const filtered = roomState.filter((u) => u.socketId.length > 0);

      if (filtered.length === 0) await this.redis.del(roomId, "users");
      else await this.redis.set(roomId, "users", filtered);

      if (user.socketId.length > 0) return;

      this.notifier.sendToRoom(MessageType.SIGNOUT_ROOM, roomId, {
        nickname: user.nickname,
        users: filtered.length,
      });

      const room = await roomModel.findById(roomId, { public: 1, ownerId: 1 });
      if (room.public) {
        this.notifier.broadcastToClients(MessageType.UPDATE_ROOM_STATE, {
          _id: roomId,
          users: filtered.length,
        });
      } else {
        this.notifier.sendToUser(
          MessageType.UPDATE_ROOM_STATE,
          room.ownerId,
          roomId,
          { users: filtered.length }
        );
      }
    }
  }

  async removeJunkRedisData() {
    const redisKeys = await this.redis.keys();
    for (const key of redisKeys) {
      const roomClient = this.roomClients.get(key);
      const ativeClients = roomClient
        ? Array.from(roomClient.values()).map((client) => client.socketId)
        : [];

      let roomState = (await this.redis.get(
        key,
        "users"
      )) as RoomState["users"];
      if (!roomState || !roomState.length) {
        continue;
      }

      roomState = roomState
        .map((user) => {
          if (!user.socketId) return undefined;
          user.socketId = user.socketId.filter((id) =>
            ativeClients.includes(id)
          );
          if (user.socketId.length === 0) return undefined;
          return user;
        })
        .filter((user) => user);

      if (roomState.length === 0) await this.redis.del(key, "users");
      else await this.redis.set(key, "users", roomState);
    }
  }
}
