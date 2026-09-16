import { Inject, UnauthorizedException } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { UserRepository } from "../../../domain/ports/user-repository.port";
import { LoginCommand, LoginResult } from "./login.command";

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
    constructor(
        @Inject(UserRepository) private readonly userRepository: UserRepository,
        private readonly jwtService: JwtService,
    ) {}

    async execute(command: LoginCommand): Promise<LoginResult> {
        const user = await this.userRepository.findByEmail(command.email);

        const isValidPassword = user
            ? await bcrypt.compare(command.password, user.passwordHash)
            : false;

        if (!user || !isValidPassword) {
            throw new UnauthorizedException("Invalid credentials");
        }

        const accessToken = await this.jwtService.signAsync({
            sub: user.id,
            role: user.role,
        });

        return new LoginResult(accessToken);
    }
}
