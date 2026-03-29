import { CustomWebSocket } from "../WebSocket/Interfaces";
import { Notifier } from "../Notifier/Notifier";
import { RedisService } from "../Redis/Service";
import { ChatService } from "../Chat/Service/ChatService";
import { AuthUserService } from "../User/Services/AuthService";
import { UserService } from "../User/Services/UserService";
import { RoomService } from "../Room/Service/RoomService";

export const clients = new Map<string, Set<CustomWebSocket>>();
export const roomClients = new Map<string, Set<CustomWebSocket>>();

export const notifier = new Notifier();
export const redis = new RedisService();
export const chatService = new ChatService();
export const authUserService = new AuthUserService();
export const userService = new UserService();
export const roomService = new RoomService();
