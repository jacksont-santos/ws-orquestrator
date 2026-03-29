import { CustomWebSocket } from "../WebSocket/Interfaces";
import { MessageType } from "../WebSocket/OnMessage/MessageType";
import { OutMessage, RawMessage } from "../WebSocket/Interfaces";
import WebSocket from "ws";
import { clients, roomClients } from "../instances";

export class Notifier {

  constructor() {}

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
    const roomConnectedClients = roomClients.get(roomId);
    if (!roomConnectedClients) return;

    const roomData: OutMessage = {
      type,
      data: { ...data, roomId },
    };
    const message = JSON.stringify(roomData);
    for (const client of Array.from(roomConnectedClients)) this.send(client, message);
  }

  sendToUser(
    type: MessageType,
    userId: string,
    roomId: string,
    data: object
  ) {
    const client = clients.get(userId);
    if (!client) return;

    const clientsData: OutMessage = {
      type,
      data: { ...data, _id: roomId },
    };
    const message = JSON.stringify(clientsData);
    client.forEach((ws) => this.send(ws, message));
  }

  broadcastToClients(type: MessageType, data: any) {
    const publicData: OutMessage = {
      type,
      data,
    };
    const message = JSON.stringify(publicData);
    clients.forEach((client) =>
      client.forEach((ws) => this.send(ws, message))
    );
  }

  async dispatchRoomChange(raw: RawMessage) {
    const { type, userId, data } = raw;
    const { roomId, public: isPublic } = data;
    if (!type || !roomId || !isPublic && !userId) return;

    if (
      [
        MessageType.ADD_ROOM,
        MessageType.REMOVE_ROOM,
        MessageType.UPDATE_ROOM
      ].includes(type)
    ) {
      this.broadcastToClients(type, data);
    };

    if (type == MessageType.UPDATE_ROOM_STATE) {
      this.sendToRoom(type, roomId, data);
    };
  }
}
