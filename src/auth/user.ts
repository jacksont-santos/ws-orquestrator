import { CustomWebSocket } from "../utils/customWebSocket";
import { verifyToken } from "../utils/jwt";
import { userModel } from "../database/mongo/models";

export const getUserId = (authToken: string) => {
    const userId = verifyToken(authToken)?._id;
    return userId;
}

export const setUser = async (ws: CustomWebSocket, authToken: string) => {
    const userId = getUserId(authToken);
    if (!userId) throw { type: "error", message: "Invalid auth token" };
    const user = await userModel.exists({ _id: userId });
    if (!user) throw { type: "error", message: "User not found" };
    ws.userId = userId;
}

export const isAuthenticated = (ws: CustomWebSocket): boolean => {
    return !!ws.userId;
}

export const removeUser = (ws: CustomWebSocket) => {
    delete ws.userId;
}