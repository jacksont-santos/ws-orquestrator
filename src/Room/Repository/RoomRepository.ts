import { roomModel } from "../Entity/Room";
import { roomMembersModel } from "../Entity/RoomMembers";

export class RoomRepository {
  findRoom(id: string, projection: any = {}): Promise<any> {
    return roomModel.findById(id, projection);
  }

  findRooms(filter: any = {}, projection: any = {}): Promise<any> {
    return roomModel.find(filter, projection);
  }

  findRoomMembers(roomId: string): Promise<any> {
    return roomMembersModel.findOne({ roomId }, { users: 1, _id: 0 });
  }

  setRoomMember(roomId: string, userId: string) {
    return roomMembersModel.findOneAndUpdate(
      { roomId },
      {
        $addToSet: { users: userId },
        $set: { updatedAt: new Date() },
      },
      {
        upsert: true,
        setDefaultsOnInsert: true,
      },
    );
  }
}
