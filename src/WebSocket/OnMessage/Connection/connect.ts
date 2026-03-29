import { CustomWebSocket } from "../../Interfaces";
import { clients, redis, authUserService } from "../../../instances";

export const connect = async (ws: CustomWebSocket, authToken: string) => {
    await authUserService.setUser(ws, authToken);
    if (clients.has(ws.userId)) clients.get(ws.userId)?.add(ws);
    else clients.set(ws.userId, new Set([ws]));
    redis.getRoomsState(ws);
  }