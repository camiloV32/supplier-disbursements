import { Body, Controller, Get, HttpCode, HttpStatus, Post, Res } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { ConfigService } from "@nestjs/config";
import type { Response } from "express";
import { AUTHENTICATION_ROUTE } from "../route.constants";
import { LoginCommand } from "../../../application/commands/login/login.command";
import { GetUserQuery } from "../../../application/queries/get-user/get-user.query";
import { UserReadModel } from "../../../application/read-model/user.read-model";
import { LoginDto } from "./dto/login.dto";
import { Public } from "@shared/decorators/public.decorator";
import { CurrentUser } from "@shared/decorators/current-user.decorator";
import { AUTH_COOKIE_NAME } from "./auth-cookie.constants";

@Controller({
    path: AUTHENTICATION_ROUTE,
    version: "1"
})
export class AuthenticationController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
        private readonly configService: ConfigService,
    ) {}

    @Public()
    @Post("login")
    @HttpCode(HttpStatus.OK)
    async login(
        @Body() dto: LoginDto,
        @Res({ passthrough: true }) response: Response,
    ): Promise<{ message: string }> {
        const result = await this.commandBus.execute(new LoginCommand(dto.email, dto.password));

        response.cookie(AUTH_COOKIE_NAME, result.accessToken, {
            httpOnly: true,
            secure: this.configService.getOrThrow<boolean>("app.isProduction"),
            sameSite: "lax",
            path: "/",
        });

        return { message: "Logged in" };
    }

    @Public()
    @Post("logout")
    @HttpCode(HttpStatus.OK)
    logout(@Res({ passthrough: true }) response: Response): { message: string } {
        response.clearCookie(AUTH_COOKIE_NAME, { path: "/" });

        return { message: "Logged out" };
    }

    @Get("me")
    me(@CurrentUser("userId") userId: string): Promise<UserReadModel> {
        return this.queryBus.execute(new GetUserQuery(userId));
    }
}
