import { RoomRepository } from "../Repository/RoomRepository";

export class RoomService {
  private roomRepository: RoomRepository;
  
  constructor() {
    this.roomRepository = new RoomRepository();
  }

  async getPublicRooms() {
    return await this.roomRepository.findRooms({ public: true, active: true }, { _id: 1 });
  }

  async getPrivateRooms(ownerId: string) {
    return await this.roomRepository.findRooms(
      { public: false, active: true, ownerId },
      { _id: 1 }
    );  
  }

  async getRoomById(roomId: string, projection?: object) {
    return await this.roomRepository.findRoom(roomId, projection);
  }

  async getRoomMembers(roomId: string) {
    return await this.roomRepository.findRoomMembers(roomId);
  }

  async setRoomMember(roomId: string, userId: string) {
    return await this.roomRepository.setRoomMember(roomId, userId);
  }
}