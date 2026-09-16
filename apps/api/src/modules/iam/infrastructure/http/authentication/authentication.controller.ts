import { Body, Controller, Get, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { AUTHENTICATION_ROUTE } from "../route.constants";
import { LoginCommand, LoginResult } from "../../../application/commands/login/login.command";
import { GetUserQuery } from "../../../application/queries/get-user/get-user.query";
import { UserReadModel } from "../../../application/read-model/user.read-model";
import { LoginDto } from "./dto/login.dto";
import { Public } from "../../../../../shared/decorators/public.decorator";
import { CurrentUser } from "../../../../../shared/decorators/current-user.decorator";

@Controller({
    path: AUTHENTICATION_ROUTE,
    version: "1"
})
export class AuthenticationController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
    ) {}

    @Public()
    @Post("login")
    @HttpCode(HttpStatus.OK)
    login(@Body() dto: LoginDto): Promise<LoginResult> {
        return this.commandBus.execute(new LoginCommand(dto.email, dto.password));
    }

    @Get("me")
    me(@CurrentUser("userId") userId: string): Promise<UserReadModel> {
        return this.queryBus.execute(new GetUserQuery(userId));
    }
}
