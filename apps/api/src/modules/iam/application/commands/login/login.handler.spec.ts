import { UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcryptjs";

// @nestjs/jwt ships as an ESM-only package, which ts-jest (CommonJS) can't
// require() directly. It's fully mocked in these tests anyway, so replace
// the module before it's ever loaded instead of fighting Jest/ESM interop.
jest.mock("@nestjs/jwt", () => ({
    JwtService: jest.fn(),
}));
import { JwtService } from "@nestjs/jwt";
import { LoginHandler } from "./login.handler";
import { LoginCommand } from "./login.command";
import { UserRepository } from "../../../domain/ports/user-repository.port";
import { User, UserRole } from "../../../domain/entities/user.entity";

describe("LoginHandler", () => {
    const email = "analyst@supplier-disbursements.local";
    const password = "correct-password";
    let passwordHash: string;
    let userRepository: jest.Mocked<UserRepository>;
    let jwtService: jest.Mocked<JwtService>;
    let handler: LoginHandler;

    beforeAll(() => {
        passwordHash = bcrypt.hashSync(password, 10);
    });

    beforeEach(() => {
        userRepository = {
            findById: jest.fn(),
            findByEmail: jest.fn(),
        } as unknown as jest.Mocked<UserRepository>;
        jwtService = {
            signAsync: jest.fn().mockResolvedValue("signed-token"),
        } as unknown as jest.Mocked<JwtService>;
        handler = new LoginHandler(userRepository, jwtService);
    });

    it("returns an access token when the credentials are correct", async () => {
        userRepository.findByEmail.mockResolvedValue(
            new User("user-1", email, passwordHash, UserRole.ANALYST, new Date()),
        );

        const result = await handler.execute(new LoginCommand(email, password));

        expect(result.accessToken).toBe("signed-token");
        expect(jwtService.signAsync).toHaveBeenCalledWith({ sub: "user-1", role: UserRole.ANALYST });
    });

    it("throws UnauthorizedException when the password is wrong", async () => {
        userRepository.findByEmail.mockResolvedValue(
            new User("user-1", email, passwordHash, UserRole.ANALYST, new Date()),
        );

        await expect(handler.execute(new LoginCommand(email, "wrong-password"))).rejects.toThrow(
            UnauthorizedException,
        );
    });

    it("throws UnauthorizedException when the user does not exist", async () => {
        userRepository.findByEmail.mockResolvedValue(null);

        await expect(handler.execute(new LoginCommand(email, password))).rejects.toThrow(
            UnauthorizedException,
        );
    });
});
