import { CustomWebSocket, RoomState } from "../../Interfaces";
import { MessageType } from "../MessageType";
import { redis, notifier, roomClients, roomService, userService } from "../../../instances";
import { comparePasswords } from "../../../utils/crypto";
import { timer } from "../../../utils/timer";


export const firstSignIn = async (data: any, ws: CustomWebSocket): Promise<void> => {
    const { roomId, password } = data;

    if (!roomId)
      throw { type: "error", message: "Invalid signin data" };

    const response = await Promise.allSettled([
      redis.get(roomId, "users") as Promise<RoomState["users"]>,
      roomService.getRoomById(roomId),
    ]);
    const users = response[0].status === "fulfilled" ? response[0].value : null;
    const room = response[1].status === "fulfilled" ? response[1].value : null;

    if (!room) throw { type: "error", message: "Room not found" };
    if (!room.active) throw { type: "error", message: "Inactive room" };
    if (users?.length >= room.maxUsers) throw { type: "error", message: "Room is full" };
    if (!room.public && ws.userId !== room.ownerId) {
      if (!password) throw { type: "error", message: "Password required" };
      const authenticated = comparePasswords(password, room.password);
      if (!authenticated) throw { type: "error", message: "Invalid password" };
    };

    const nickname = (await userService.getUserById(ws.userId!))?.nickname || "Unknown";
    let user: RoomState["users"][0] = {
      userId: ws.userId!,
      socketId: [ws.socketId],
      nickname,
    }
    const updatedRoomState = [...(users || []), user];
    await redis.set(roomId, "users", updatedRoomState);
    await roomService.setRoomMember(roomId, ws.userId!);

    if (!ws.rooms) ws.rooms = [];
    if (!ws.rooms.includes(roomId)) ws.rooms.push(roomId);

    if (!roomClients.has(roomId)) {
      roomClients.set(roomId, new Set([ws]));
    } else {
      roomClients.get(roomId)!.add(ws);
    }

    notifier.sendToClient(ws, MessageType.SIGNIN_REPLY, {
      _id: roomId
    });
    await timer(1000);

    notifier.sendToRoom(
      MessageType.SIGNIN_ROOM,
      roomId,
      {
        nickname,
        users: updatedRoomState.length,
      }
    );
    if (room.public) {
      notifier.broadcastToClients(
        MessageType.UPDATE_ROOM_STATE,
        {
          _id: roomId,
          users: updatedRoomState.length,
        }
      );
    } else {
      notifier.sendToUser(
        MessageType.UPDATE_ROOM_STATE,
        room.ownerId,
        roomId,
        { users: updatedRoomState.length }
      );
      notifier.sendToRoom(
        MessageType.UPDATE_ROOM_STATE,
        roomId,
        { users: updatedRoomState.length }
      );
    }
  }