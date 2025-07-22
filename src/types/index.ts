import { MessageType } from "../utils/messageTypes";

export interface RawMessage {
  type: MessageType;
  userId?: string;
  authToken?: string;
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
    socketId?: Array<string>;
    lastMessage?: Date;
  }>;
}