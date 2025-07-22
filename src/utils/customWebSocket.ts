import { WebSocket } from "ws";

export interface CustomWebSocket extends WebSocket {
  isAlive: boolean;
  socketId: string;
}