import { WebSocket } from "ws";
import { MessageType } from "../OnMessage/MessageType";

export interface CustomWebSocket extends WebSocket {
  isAlive: boolean;
  socketId: string;
  rooms: Array<string>;
  userId: string;
}

export interface RawMessage {
  type: MessageType;
  userId?: string;
  authToken?: string;
  data?: any;
  notification?: boolean;
}

export interface OutMessage {
  type: MessageType;
  data?: any;
  message?: string;
}

export interface RoomState {
  users: Array<{
    userId: string;
    nickname: string;
    socketId?: Array<string>;
  }>;
}