import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  _id: { type: String },
  ownerId: { type: String, required: true },
  name: { type: String, required: true, validate: (value) => value.length >= 4 && value.length <= 30 },
  maxUsers: { type: Number, required: true, validate: (value) => value >= 2 && value <= 10 },
  password: { type: String, required: false, validate: (value) => value.length > 30 },
  public: { type: Boolean, required: true, default: true },
  active: { type: Boolean, required: true, default: true },
  createdAt: { type: Date, default: Date.now(), required: true },
  updatedAt: { type: Date, default: Date.now(), required: true },
});

export const roomModel = mongoose.model('room', roomSchema);