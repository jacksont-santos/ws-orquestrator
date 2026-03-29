import { CustomWebSocket, RawMessage } from "../Interfaces";
import { MessageType } from "./MessageType";
import * as MessageAction from "./index";

export const onMessage = async (ws: CustomWebSocket, message: string) => {
    try {
      const raw: RawMessage = JSON.parse(message);
      const { type, authToken, data } = raw;

      if (type != MessageType.CONNECTION && !ws.userId && !raw.notification) {
        MessageAction.unauthorizedError(ws);
        return;
      };

      switch (type) {
        case MessageType.CONNECTION:
          await MessageAction.connect(ws, authToken);
          break;

        case MessageType.ROOMS_STATE:
          await MessageAction.getRoomsState(ws);
          break;

        case MessageType.ROOM_STATE:
          await MessageAction.getRoomState(ws, data);
          break;

        case MessageType.FIRST_SIGNIN_ROOM:
          await MessageAction.firstSignIn(data, ws);
          break;

        case MessageType.SIGNIN_ROOM:
          await MessageAction.signin(data, ws);
          break;

        case MessageType.SIGNOUT_ROOM:
          await MessageAction.signOut(data, ws);
          break;

        case MessageType.ADD_ROOM:
        case MessageType.UPDATE_ROOM:
        case MessageType.REMOVE_ROOM:
          await MessageAction.notifierChanges(raw);
          break;

        case MessageType.CHAT:
          await MessageAction.onChatMessage(ws, raw);
          break;

        default:
          MessageAction.messageTypeError(ws);
      }
    } catch (error) {
      MessageAction.messageError(ws, error);
    }
  }