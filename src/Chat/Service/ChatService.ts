import { ChatRepository, ChatData } from "../Repository/ChatRepository";

export class ChatService {

    private chatRepository: ChatRepository;

    constructor() {
      this.chatRepository = new ChatRepository();
    }

    async addNewChatMessage(roomId: string, data: ChatData): Promise<void> {
      await this.chatRepository.addChat(roomId, data );
    }
  
}