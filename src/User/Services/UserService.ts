import { UserRepository } from "../Repository/UserRepository";

export class UserService {
    private userRepository: UserRepository;

    constructor() {
        this.userRepository = new UserRepository();
    }

    async getUserById(userId: string): Promise<{ _id: string; nickname: string } | null> {
        return await this.userRepository.getUserById(userId);
    }

}