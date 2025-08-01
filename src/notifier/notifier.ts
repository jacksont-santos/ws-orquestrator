import { CustomWebSocket } from "../utils/customWebSocket";
import { MessageType } from "../utils/messageTypes";
import { OutMessage } from "../types";
import { RawMessage } from "../types";
import WebSocket from "ws";

export class Notifier {
  constructor(
    private publicClients: Map<string, CustomWebSocket>,
    private privateClients: Map<string, Set<CustomWebSocket>>,
    private roomClients: Map<string, Set<CustomWebSocket>>
  ) {}

  send(ws: CustomWebSocket, data: any) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(typeof data === "string" ? data : JSON.stringify(data));
    }
  }

  sendToClient( ws: CustomWebSocket, type: MessageType, data: object) {
    const message: OutMessage = {
      type,
      data,
    };
    this.send(ws, JSON.stringify(message));
  }

  sendToRoom(type: MessageType, roomId: string, data: object) {
    const roomClients = this.roomClients.get(roomId);
    if (!roomClients) return;

    const roomData: OutMessage = {
      type,
      data: { ...data, _id: roomId },
    };
    const message = JSON.stringify(roomData);
    for (const client of Array.from(roomClients)) this.send(client, message);
  }

  sendToUser(
    type: MessageType,
    userId: string,
    roomId: string,
    data: object
  ) {
    const client = this.privateClients.get(userId);
    if (!client) return;

    const clientsData: OutMessage = {
      type,
      data: { ...data, _id: roomId },
    };
    const message = JSON.stringify(clientsData);
    client.forEach((ws) => this.send(ws, message));
  }

  broadcastToClients(type: MessageType, data: any, includePublic: boolean = true) {
    const publicData: OutMessage = {
      type,
      data,
    };
    const message = JSON.stringify(publicData);
    this.privateClients.forEach((client) =>
      client.forEach((ws) => this.send(ws, message))
    );
    if (includePublic) this.publicClients.forEach((ws) => this.send(ws, message));
  }

  async dispatchRoomChange(raw: RawMessage) {
    const { type, userId, data } = raw;
    const { roomId, public: isPublic } = data;
    if (!type || !roomId || !isPublic && !userId) return;

    this.sendToRoom(type, roomId, data);
    if (isPublic) this.broadcastToClients(type, data);
    else this.sendToUser(type, userId, roomId, data);
  }
}
