import mongoose from 'mongoose';

type Chat = {
  id: string;
  userId: string;
  nickname: string;
  content: string;
  createdAt: Date;
}

const chatSchema = new mongoose.Schema({
  _id: { type: String },
  roomId: { type: String, required: true },
  chat: { type: Array<Chat>, default: [], required: true },
  createdAt: { type: Date, default: Date.now(), required: true },
  updatedAt: { type: Date, default: Date.now(), required: true },
});

export const chatModel = mongoose.model('chat', chatSchema);