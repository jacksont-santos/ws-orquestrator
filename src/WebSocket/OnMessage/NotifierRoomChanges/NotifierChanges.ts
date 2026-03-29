import { RawMessage } from "../../Interfaces";
import { notifier } from "../../../instances";

export const notifierChanges = async (message: RawMessage): Promise<void> => {
    notifier.dispatchRoomChange(message);
}