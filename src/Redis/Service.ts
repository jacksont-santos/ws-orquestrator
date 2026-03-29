import { RedisClient } from "./Client";
import { CustomWebSocket, OutMessage, RoomState } from "../WebSocket/Interfaces";
import { MessageType } from "../WebSocket/OnMessage/MessageType";
import { notifier, roomClients, roomService } from "../instances";

export class RedisService {

  constructor(
    private redis = new RedisClient(),
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
      roomService.getPublicRooms(),
      roomService.getPrivateRooms(ws.userId),
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
    notifier.send(ws, JSON.stringify(message));
  }

  async getRoomState(
    ws: CustomWebSocket,
    data: any,
  ): Promise<any> {
    const { roomId } = data;
    const room = await roomService.getRoomById(roomId, {
      _id: 1,
      public: 1,
      ownerId: 1,
    });
    if (!room) throw { type: "error", message: "Room not found" };

    if (!room.public) {
      if (room.ownerId !== ws.userId) {
        const message: OutMessage = {
          type: MessageType.ROOM_STATE,
          data: { _id: roomId, users: 0 },
        };
        notifier.send(ws, JSON.stringify(message));
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
    notifier.send(ws, JSON.stringify(message));
  }

  async verifyRoomState(
    roomId: string,
    userId: string
  ): Promise<void> {
    const users = (await this.redis.get(roomId, "users")) as RoomState["users"];
    if (!users.find((u) => u.userId === userId))
      throw { type: "error", message: "You are not in this room" };
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

      notifier.sendToRoom(MessageType.SIGNOUT_ROOM, roomId, {
        nickname: user.nickname,
        users: filtered.length,
      });

      const room = await roomService.getRoomById(roomId, { ownerId: 1, public: 1 });
      if (room.public) {
        notifier.broadcastToClients(MessageType.UPDATE_ROOM_STATE, {
          _id: roomId,
          users: filtered.length,
        });
      } else {
        notifier.sendToUser(
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
    if (!redisKeys || !redisKeys.length) return;

    for (const key of redisKeys) {
      const roomClient = roomClients.get(key);
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
