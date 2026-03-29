import { redis } from "../../../instances";

export const getRoomsState = async (ws: any) => {
    await redis.getRoomsState(ws);
}