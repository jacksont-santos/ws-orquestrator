import { Notifier } from "../notifier/notifier";
import { RedisService } from "../redis/redisService";
import { CustomWebSocket } from "../utils/customWebSocket";
import { signJWT } from "../utils/jwt";
import { MessageType } from "../utils/messageTypes";
import { OutMessage, RoomState } from "../types";
import { roomModel } from "../database/mongo/models";
import { timer } from "../utils/timer";
import { verifyToken } from "../utils/jwt";

export class SignRoom {
  constructor(
    private notifier: Notifier,
    private redis: RedisService,
    private roomClients: Map<string, Set<CustomWebSocket>>
  ) {}

  async signIn(data: any, ws: CustomWebSocket): Promise<void> {
    const { roomId, nickname, password, roomToken } = data;

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
    let users = response[0].status === "fulfilled" ? response[0].value : null;
    const room = response[1].status === "fulfilled" ? response[1].value : null;

    if (roomToken) {
      const tokenData = verifyToken(roomToken);
      if (!tokenData) throw { type: "error", message: "Invalid room token" };
      if (tokenData.roomId !== roomId)
        throw { type: "error", message: "Invalid room token" };

      const connectedUser = users?.find((u) => u.token === roomToken);
      if (!connectedUser) {
        this.notifier.sendToClient(ws, MessageType.SIGNIN_REPLY, {
          _id: roomId,
        });
        return;
      }

      if (!ws.rooms || !ws.rooms.includes(roomId))
        ws.rooms = ws?.rooms ? [...(ws.rooms || []), roomId] : [roomId];

      if (!this.roomClients.has(roomId)) {
        this.roomClients.set(roomId, new Set([ws]));
      } else {
        this.roomClients.get(roomId)!.add(ws);
      }

      this.notifier.sendToClient(ws, MessageType.SIGNIN_REPLY, {
        _id: roomId,
        token: roomToken,
      });

      connectedUser.socketId = connectedUser.socketId.includes(ws.socketId)
        ? connectedUser.socketId
        : [...connectedUser.socketId, ws.socketId];

      await this.redis.set(roomId, "users", users);

      return;
    }

    const invalidNickname = users?.find((u) => u.nickname === nickname);
    if (invalidNickname) return;

    if (!room) throw { type: "error", message: "Room not found" };
    if (!room.active) throw { type: "error", message: "Inactive room" };
    if (users?.length >= room.maxUsers)
      throw { type: "error", message: "Room is full" };

    if (!room.public && ws.userId !== room.ownerId) {
      if (!password) throw { type: "error", message: "Password required" };
      const decoded = verifyToken(password);
      if (!decoded || decoded.password !== password)
        throw { type: "error", message: "Invalid password" };
    }

    let user = {
      nickname,
      token: signJWT({ roomId, nickname, date: new Date() }),
      socketId: [ws.socketId],
    };
    const updatedRoomState = [...(users || []), user];
    await this.redis.set(roomId, "users", updatedRoomState);

    if (!ws.rooms) ws.rooms = [];
    if (!ws.rooms.includes(roomId)) ws.rooms.push(roomId);

    if (!this.roomClients.has(roomId)) {
      this.roomClients.set(roomId, new Set([ws]));
    } else {
      this.roomClients.get(roomId)!.add(ws);
    }

    this.notifier.sendToClient(ws, MessageType.SIGNIN_REPLY, {
      _id: roomId,
      token: user.token,
    });
    await timer(1000);

    this.notifier.sendToRoom(MessageType.SIGNIN_ROOM, roomId, {
      nickname,
      users: updatedRoomState.length,
    });
    if (room.public) {
      this.notifier.broadcastToClients(MessageType.UPDATE_ROOM_STATE, {
        _id: roomId,
        users: updatedRoomState.length,
      });
    } else {
      this.notifier.sendToUser(
        MessageType.UPDATE_ROOM_STATE,
        ws.userId,
        roomId,
        { users: updatedRoomState.length }
      );
    }
  }

  async signOut(data: any, ws: CustomWebSocket): Promise<void> {
    const { roomId, nickname, roomToken } = data;
    if (!roomId || !nickname || !roomToken)
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

    if (!room) throw { type: "error", message: "Room not found" };

    const clients = this.roomClients.get(roomId);
    if (clients) {
      clients.forEach((client) => {
        if (client.socketId === ws.socketId) clients.delete(client);
      });
    }
    if (clients?.size === 0) this.roomClients.delete(roomId);

    const user = users?.find((u) => u.token === roomToken);
    user.socketId = user.socketId.filter((id) => id !== ws.socketId);
    const updatedUsers = users.filter(
      (u) => u.socketId.length > 0
    ) as RoomState["users"];

    if (updatedUsers?.length === 0) await this.redis.del(roomId, "users");
    else await this.redis.set(roomId, "users", updatedUsers);

    ws.rooms = ws.rooms?.filter((id) => id !== roomId);

    this.notifier.sendToClient(ws, MessageType.SIGNOUT_REPLY, {
      _id: roomId,
      users: updatedUsers.length,
    });

    if (user.socketId.length > 0) return;

    this.notifier.sendToRoom(MessageType.SIGNOUT_ROOM, roomId, {
      nickname,
      users: updatedUsers.length,
    });
    if (room.public) {
      this.notifier.broadcastToClients(MessageType.UPDATE_ROOM_STATE, {
        _id: roomId,
        users: updatedUsers.length,
      });
    } else {
      this.notifier.sendToUser(
        MessageType.UPDATE_ROOM_STATE,
        ws.userId,
        roomId,
        { users: updatedUsers.length }
      );
    }
  }

  async signState(data: any, ws: CustomWebSocket): Promise<void> {

    const { _id: roomId, roomToken } = data;
    if (!roomToken || !roomId)
      throw { type: "error", message: "Invalid sign state data" };

    const tokenId = verifyToken(roomToken)?.roomId;
    if (roomId !== tokenId) {
      this.notifier.sendToClient(ws, MessageType.SIGN_STATE, {
        _id: roomId,
        authenticated: false,
      });
      return;
    };

    const users = await this.redis.get(roomId, "users") as RoomState["users"];
    const user = users?.find((u) => u.token === roomToken);
    if (!user) {
      this.notifier.sendToClient(ws, MessageType.SIGN_STATE, {
        _id: roomId,
        authenticated: false,
      });
      return;
    };

    this.notifier.sendToClient(ws, MessageType.SIGN_STATE, {
      _id: roomId,
      authenticated: true,
    });
  }
}
