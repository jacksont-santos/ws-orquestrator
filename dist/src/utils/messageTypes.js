"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageType = void 0;
var MessageType;
(function (MessageType) {
    MessageType["CONNECTION"] = "connection";
    MessageType["ADD_ROOM"] = "addRoom";
    MessageType["UPDATE_ROOM"] = "updateRoom";
    MessageType["REMOVE_ROOM"] = "removeRoom";
    MessageType["SIGNIN_ROOM"] = "signinRoom";
    MessageType["SIGNOUT_ROOM"] = "signoutRoom";
    MessageType["SIGNIN_REPLY"] = "signinReply";
    MessageType["SIGNOUT_REPLY"] = "signoutReply";
    MessageType["SIGN_STATE"] = "signState";
    MessageType["UPDATE_ROOM_STATE"] = "updateRoomState";
    MessageType["ROOM_STATE"] = "roomState";
    MessageType["ROOMS_STATE"] = "roomsState";
    MessageType["CHAT"] = "chat";
})(MessageType || (exports.MessageType = MessageType = {}));
//# sourceMappingURL=messageTypes.js.map