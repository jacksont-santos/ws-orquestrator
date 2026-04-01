"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomRepository = void 0;
var Room_1 = require("../Entity/Room");
var RoomMembers_1 = require("../Entity/RoomMembers");
var RoomRepository = /** @class */ (function () {
    function RoomRepository() {
    }
    RoomRepository.prototype.findRoom = function (id, projection) {
        if (projection === void 0) { projection = {}; }
        return Room_1.roomModel.findById(id, projection);
    };
    RoomRepository.prototype.findRooms = function (filter, projection) {
        if (filter === void 0) { filter = {}; }
        if (projection === void 0) { projection = {}; }
        return Room_1.roomModel.find(filter, projection);
    };
    RoomRepository.prototype.findRoomMembers = function (roomId) {
        return RoomMembers_1.roomMembersModel.findOne({ roomId: roomId }, { users: 1, _id: 0 });
    };
    RoomRepository.prototype.setRoomMember = function (roomId, userId) {
        return RoomMembers_1.roomMembersModel.findOneAndUpdate({ roomId: roomId }, {
            $addToSet: { users: userId },
            $set: { updatedAt: new Date() },
        }, {
            upsert: true,
            setDefaultsOnInsert: true,
        });
    };
    return RoomRepository;
}());
exports.RoomRepository = RoomRepository;
//# sourceMappingURL=RoomRepository.js.map