import { CustomWebSocket } from "../../WebSocket/Interfaces";
import { verifyToken } from "../../utils/jwt";
import { UserRepository } from "../Repository/UserRepository";

export class AuthUserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  getUserId = (authToken: string) => {
    const userId = verifyToken(authToken)?._id;
    return userId;
  };

  setUser = async (ws: CustomWebSocket, authToken: string) => {
    const userId = this.getUserId(authToken);
    if (!userId) throw { type: "error", message: "Invalid auth token" };
    const user = await this.userRepository.userExists(userId);
    if (!user) throw { type: "error", message: "User not found" };
    ws.userId = userId;
  };

  isAuthenticated = (ws: CustomWebSocket): boolean => {
    return !!ws.userId;
  };

  removeUser = (ws: CustomWebSocket) => {
    delete ws.userId;
  };
}
