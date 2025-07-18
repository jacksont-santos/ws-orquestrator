import { WebSocket } from "ws";
import { MessageType } from "./messageTypes";

export interface CustomWebSocket extends WebSocket {
  isAlive: boolean;
  socketId: string;
}