import { CustomWebSocket, RawMessage } from "../../Interfaces";
import { randomUUID } from "crypto";
import { MessageType } from "../MessageType";
import { redis, notifier, chatService } from "../../../instances";

export const onChatMessage = async (ws: CustomWebSocket, raw: RawMessage) => {
    try {
      const { roomId, nickname, content } = raw.data;
      if (!roomId || !nickname || !content)
        throw { type: "error", message: "Invalid chat data" };

      await redis.verifyRoomState(roomId, ws.userId);
      const data = {
        id: randomUUID(),
        roomId,
        userId: ws.userId,
        nickname,
        content,
        createdAt: new Date(),
      }
      notifier.sendToRoom(MessageType.CHAT, roomId, data);
      await chatService.addNewChatMessage(roomId, data);
    } catch (err) {
      notifier.send(ws, err);
    }
  }