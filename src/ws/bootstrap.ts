import { WSService } from "./wsService";
import http from "http";
import {
  roomClients,
  notifier,
  redis,
  signRoom,
  clients,
} from "../instances";

export function startWebSocketServer(server: http.Server) {
  new WSService(
    server,
    clients,
    roomClients,
    notifier,
    redis,
    signRoom
  );
}
