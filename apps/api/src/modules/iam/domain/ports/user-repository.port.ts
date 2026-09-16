import { User } from "../entities/user.entity";

export abstract class UserRepository {
    abstract findById(id: string): Promise<User | null>;
}
