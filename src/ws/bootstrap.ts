import { WSService } from "./wsService";
import http from "http";
import {
  publicClients,
  privateClients,
  roomClients,
  notifier,
  redis,
  signRoom,
} from "../instances";

export function startWebSocketServer(server: http.Server) {
  new WSService(
    server,
    publicClients,
    privateClients,
    roomClients,
    notifier,
    redis,
    signRoom
  );
}
