import { CustomWebSocket } from "../../Interfaces";
import { notifier } from "../../../instances";

export const messageError = (ws: CustomWebSocket, error: any): void => {
    notifier.send(ws, {
        type: "error",
        message: "Error handling message",
        data: error,
    });
}