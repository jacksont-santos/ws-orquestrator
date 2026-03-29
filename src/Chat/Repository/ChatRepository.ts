import { chatModel } from "../Entity/Chat";

export interface ChatData {
  id: string;
  roomId: string;
  userId: string;
  nickname: string;
  content: string;
  createdAt: Date;
}

export class ChatRepository {

  async addChat(
    roomId: string,
    { id, userId, nickname, content, createdAt }: ChatData,
  ): Promise<void> {
    await chatModel.updateOne(
      { roomId },
      {
        $push: {
          chat: {
            $each: [
              { id, userId, nickname, content, createdAt },
            ],
            $position: 0,
          },
        },
        $set: { updatedAt: new Date() },
      },
      { upsert: true },
    );
  }
}
