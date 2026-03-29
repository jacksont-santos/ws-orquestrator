import { redis } from "../../../instances";

export const getRoomState = async (ws: any, data: any) => {
    await redis.getRoomState(ws, data);
}