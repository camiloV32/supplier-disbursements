import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../../../domain/entities/user.entity";
import { UserRepository } from "../../../domain/ports/user-repository.port";
import { UserOrmEntity } from "../entities/user.orm-entity";
import { UserMapper } from "../mappers/user.mapper";

@Injectable()
export class TypeOrmUserRepository implements UserRepository {
    constructor(
        @InjectRepository(UserOrmEntity)
        private readonly ormRepository: Repository<UserOrmEntity>,
    ) {}

    async findById(id: string): Promise<User | null> {
        const ormEntity = await this.ormRepository.findOne({ where: { id } });

        return ormEntity ? UserMapper.toDomain(ormEntity) : null;
    }
}
