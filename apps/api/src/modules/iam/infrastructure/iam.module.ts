import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CqrsModule } from "@nestjs/cqrs";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { AuthenticationController } from "./http/authentication/authentication.controller";
import { UserRepository } from "../domain/ports/user-repository.port";
import { TypeOrmUserRepository } from "./persistence/repositories/user.repository";
import { UserOrmEntity } from "./persistence/entities/user.orm-entity";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { LoginHandler } from "../application/commands/login/login.handler";
import { GetUserHandler } from "../application/queries/get-user/get-user.handler";

@Module({
    imports: [
        TypeOrmModule.forFeature([UserOrmEntity]),
        CqrsModule,
        PassportModule.register({ defaultStrategy: "jwt" }),
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                secret: config.getOrThrow("app.jwt.secret"),
                signOptions: { expiresIn: config.getOrThrow("app.jwt.expiresIn") },
            }),
        }),
    ],
    controllers: [
        AuthenticationController
    ],
    providers: [
        {
            provide: UserRepository,
            useClass: TypeOrmUserRepository
        },
        JwtStrategy,
        LoginHandler,
        GetUserHandler,
    ]
})
export class IamModule {}
