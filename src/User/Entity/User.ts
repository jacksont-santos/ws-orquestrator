import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  _id: { type: String  },
  username: { type: String, unique: true, required: true, validate: (value) => value.length >= 6 && value.length <= 24 },
  password: { type: String, selected: false, required: true, validate: (value) => value.length > 30 },
  nickname: {
    type: String,
    unique: true,
    required: true,
    validate: (value) => value.length >= 4 && value.length <= 24,
  }
});
export const userModel = mongoose.model('user', userSchema);