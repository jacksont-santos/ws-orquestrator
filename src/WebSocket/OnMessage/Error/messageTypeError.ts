import { CustomWebSocket } from "../../Interfaces";
import { notifier } from "../../../instances";

export const messageTypeError = (ws: CustomWebSocket): void => {
    notifier.send(ws, {
        type: "error",
        message: "Unknown message type",
    });
}