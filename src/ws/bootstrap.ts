import { WSService } from "./wsService";
import {
  publicClients,
  privateClients,
  roomClients,
  notifier,
  redis,
  signRoom,
} from "../instances";

export function startWebSocketServer() {
  new WSService(
    publicClients,
    privateClients,
    roomClients,
    notifier,
    redis,
    signRoom
  );
}
