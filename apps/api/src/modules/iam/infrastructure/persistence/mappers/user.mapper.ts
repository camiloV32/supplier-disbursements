import { User } from "../../../domain/entities/user.entity";
import { UserOrmEntity } from "../entities/user.orm-entity";

export class UserMapper {
    static toDomain(ormEntity: UserOrmEntity): User {
        return new User(
            ormEntity.id,
            ormEntity.email,
            ormEntity.passwordHash,
            ormEntity.role,
            ormEntity.createdAt,
        );
    }

    static toOrmEntity(user: User): UserOrmEntity {
        const ormEntity = new UserOrmEntity();
        ormEntity.id = user.id;
        ormEntity.email = user.email;
        ormEntity.passwordHash = user.passwordHash;
        ormEntity.role = user.role;
        ormEntity.createdAt = user.createdAt;
        return ormEntity;
    }
}
