import { userModel } from "../Entity/User";

export class UserRepository {

    async userExists(userId: string): Promise<boolean> {
        const user = await userModel.exists({ _id: userId });
        return !!user;
    }

    async getUserById(userId: string): Promise<{ _id: string; nickname: string } | null> {
        return await userModel.findById(userId);
    }
}