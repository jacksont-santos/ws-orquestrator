import { MessageType } from "../utils/messageTypes";

export interface RawMessage {
  type: MessageType;
  userId?: string;
  data?: any;
}

export interface OutMessage {
  type: MessageType;
  data?: any;
  message?: string;
}

export interface RoomState {
  users: Array<{
    nickname: string;
    token: string;
    socketId?: string;
    lastMessage?: Date;
  }>;
}