import mongoose from 'mongoose';
import { randomUUID } from 'crypto';

const roomMembersSchema = new mongoose.Schema({
  _id: { type: String, default: () => randomUUID() },
  ownerId: { type: String, required: true },
  roomId: { type: String, required: true },
  users: { type: Array<String>, default: [], required: true },
  createdAt: { type: Date, default: new Date(), required: true },
  updatedAt: { type: Date, default: new Date(), required: true },
});

export const roomMembersModel = mongoose.model('roomMembers', roomMembersSchema);