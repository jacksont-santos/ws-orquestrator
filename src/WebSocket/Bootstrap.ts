import { WSService } from "./WSService";
import http from "http";

export function startWebSocketServer(server: http.Server) {
  new WSService(server);
}
