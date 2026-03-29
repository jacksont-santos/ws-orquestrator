import { CustomWebSocket, RoomState } from "../../Interfaces";
import {
  redis,
  notifier,
  roomService,
  roomClients,
  userService,
} from "../../../instances";
import { MessageType } from "../MessageType";
import { timer } from "../../../utils/timer";

export const signin = async (data: any, ws: CustomWebSocket): Promise<void> => {
  const { roomId } = data;

  if (!roomId) throw { type: "error", message: "Invalid signin data" };

  const response = await Promise.allSettled([
    redis.get(roomId, "users") as Promise<RoomState["users"]>,
    roomService.getRoomById(roomId, { active: 1, public: 1, maxUsers: 1 }),
    roomService.getRoomMembers(roomId),
  ]);

  const users = response[0].status === "fulfilled" ? response[0].value : null;
  const room = response[1].status === "fulfilled" ? response[1].value : null;
  const roomMembers =
    response[2].status === "fulfilled" ? response[2].value : null;

  if (!room) throw { type: "error", message: "Room not found" };
  if (!room.active) throw { type: "error", message: "Room is inactive" };
  if (!roomMembers.users.includes(ws.userId!))
    throw { type: "error", message: "User is not a member of the room" };
  if (room.maxUsers <= users?.length!)
    throw { type: "error", message: "Room is full" };

  const connectedUser = users?.find((u) => u.userId === ws.userId);
  if (connectedUser) {
    if (!connectedUser.socketId.includes(ws.socketId)) {
      connectedUser.socketId.push(ws.socketId);
      await redis.set(roomId, "users", users);
    }
  } else {
    var user = {
      userId: ws.userId!,
      socketId: [ws.socketId],
      nickname:
        (await userService.getUserById(ws.userId!))?.nickname || "Unknown",
    };
    redis.set(roomId, "users", [...(users || []), user]);
  }
  const nickname =
    (await userService.getUserById(ws.userId!))?.nickname || "Unknown";
  const updatedRoomState = connectedUser
    ? users
    : [
        ...(users || []),
        { userId: ws.userId!, socketId: [ws.socketId], nickname },
      ];
  await redis.set(roomId, "users", updatedRoomState);

  if (!ws.rooms) ws.rooms = [];
  if (!ws.rooms.includes(roomId)) ws.rooms.push(roomId);

  if (!roomClients.has(roomId)) {
    roomClients.set(roomId, new Set([ws]));
  } else {
    roomClients.get(roomId)!.add(ws);
  }

  notifier.sendToClient(ws, MessageType.SIGNIN_REPLY, {
    _id: roomId,
  });

  if (connectedUser) return;
  await timer(1000);

  notifier.sendToRoom(MessageType.SIGNIN_ROOM, roomId, {
    nickname: user.nickname,
    users: updatedRoomState.length,
  });
  if (room.public) {
    notifier.broadcastToClients(MessageType.UPDATE_ROOM_STATE, {
      _id: roomId,
      users: updatedRoomState.length,
    });
  } else {
    notifier.sendToUser(MessageType.UPDATE_ROOM_STATE, room.ownerId, roomId, {
      users: updatedRoomState.length,
    });
    notifier.sendToRoom(MessageType.UPDATE_ROOM_STATE, roomId, {
      users: updatedRoomState.length,
    });
  }
};
