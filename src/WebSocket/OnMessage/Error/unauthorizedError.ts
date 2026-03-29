import { CustomWebSocket } from "../../Interfaces";
import { notifier } from "../../../instances";

export const unauthorizedError = (ws: CustomWebSocket): void => {
    notifier.send(ws, {
        type: "error",
        message: "Unauthorized",
    });
}