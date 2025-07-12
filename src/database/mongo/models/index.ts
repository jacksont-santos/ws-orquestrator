import mongoose from 'mongoose';
import { randomUUID } from 'crypto';

interface chat  {
  nickname: string,
  content: string,
}

const chatSchema = new mongoose.Schema({
  _id: { type: String, default: () => randomUUID(), unique: true },
  roomId: { type: String, required: true },
  chat: { type: Array, default: [], required: true },
  createdAt: { type: Date, default: Date.now(), required: true },
  updatedAt: { type: Date, default: Date.now(), required: true },
});
const chatModel = mongoose.model('chat', chatSchema);

const roomSchema = new mongoose.Schema({
  _id: { type: String, default: () => randomUUID(), unique: true },
  ownerId: { type: String, required: true },
  name: { type: String, required: true, validate: (value) => value.length >= 4 && value.length <= 30 },
  maxUsers: { type: Number, required: true, validate: (value) => value >= 2 && value <= 10 },
  password: { type: String, required: false, validate: (value) => value.length > 30 },
  public: { type: Boolean, required: true, default: true },
  active: { type: Boolean, required: true, default: true },
  createdAt: { type: Date, default: Date.now(), required: true },
  updatedAt: { type: Date, default: Date.now(), required: true },
});
const roomModel = mongoose.model('room', roomSchema);

const userSchema = new mongoose.Schema({
  _id: { type: String, default: () => randomUUID(), unique: true },
  username: { type: String, unique: true, required: true, validate: (value) => value.length >= 4 && value.length <= 16 },
  password: { type: String, required: true, validate: (value) => value.length > 30 },
});
const userModel = mongoose.model('user', userSchema);

export { chatModel, roomModel, userModel };

export interface Message {
  _id: string;
  roomId: string;
  nickname: string;
  content: string;
  createdAt: Date;
}