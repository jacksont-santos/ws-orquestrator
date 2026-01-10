import { Notifier } from "../notifier/notifier";
import { RedisService } from "../redis/redisService";
import { SignRoom } from "../handlers/signRoom";
import { CustomWebSocket } from "../utils/customWebSocket";

export const clients = new Map<string, Set<CustomWebSocket>>();
export const roomClients = new Map<string, Set<CustomWebSocket>>();

export const notifier = new Notifier(clients, roomClients);
export const redis = new RedisService(notifier, roomClients);
export const signRoom = new SignRoom(notifier, redis, roomClients);
