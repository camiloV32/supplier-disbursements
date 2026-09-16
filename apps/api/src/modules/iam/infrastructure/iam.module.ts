import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthenticationController } from "./http/authentication/authentication.controller";
import { UserRepository } from "../domain/ports/user-repository.port";
import { TypeOrmUserRepository } from "./persistence/repositories/user.repository";
import { UserOrmEntity } from "./persistence/entities/user.orm-entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([UserOrmEntity])
    ],
    controllers: [
        AuthenticationController
    ],
    providers: [
        {
            provide: UserRepository,
            useClass: TypeOrmUserRepository
        }
    ]
})
export class IamModule {}