import { CustomWebSocket, RoomState } from "../../Interfaces";
import { redis, roomClients, notifier, roomService } from "../../../instances";
import { MessageType } from "../MessageType";

export const signOut = async (data: any, ws: CustomWebSocket): Promise<void> => {
    const { roomId } = data;
    if (!roomId)
      throw { type: "error", message: "Invalid signout data" };

    const response = await Promise.allSettled([
      redis.get(roomId, "users") as Promise<RoomState["users"]>,
      roomService.getRoomById(roomId, { ownerId: 1, public: 1 }),
    ]);
    const users = response[0].status === "fulfilled" ? response[0].value : null;
    const room = response[1].status === "fulfilled" ? response[1].value : null;

    if (!room) throw { type: "error", message: "Room not found" };

    const clients = roomClients.get(roomId);
    if (clients) {
      clients.forEach((client) => {
        if (client.socketId === ws.socketId) clients.delete(client);
      });
    }
    if (clients?.size === 0) roomClients.delete(roomId);

    const user = users.find((u) => u.userId === ws.userId);
    user.socketId = user.socketId.filter((id) => id !== ws.socketId);
    const updatedUsers = users.filter(
      (u) => u.socketId.length > 0
    ) as RoomState["users"];

    if (updatedUsers?.length === 0) await redis.del(roomId, "users");
    else await redis.set(roomId, "users", updatedUsers);

    ws.rooms = ws.rooms?.filter((id) => id !== roomId);

    notifier.sendToClient(ws, MessageType.SIGNOUT_REPLY, {
      _id: roomId,
      users: updatedUsers.length,
    });

    if (user.socketId.length > 0) return;

    notifier.sendToRoom(MessageType.SIGNOUT_ROOM, roomId, {
      nickname: user.nickname,
      users: updatedUsers.length,
    });
    if (room.public) {
      notifier.broadcastToClients(MessageType.UPDATE_ROOM_STATE, {
        _id: roomId,
        users: updatedUsers.length,
      });
    } else {
      notifier.sendToUser(
        MessageType.UPDATE_ROOM_STATE,
        room.ownerId,
        roomId,
        { users: updatedUsers.length }
      );
      notifier.sendToRoom(
        MessageType.UPDATE_ROOM_STATE,
        roomId,
        { users: updatedUsers.length }
      );
    }
  }