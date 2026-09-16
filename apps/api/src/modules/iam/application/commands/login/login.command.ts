import { Command } from "@nestjs/cqrs";

export class LoginResult {
    constructor(readonly accessToken: string) {}
}

export class LoginCommand extends Command<LoginResult> {
    constructor(
        readonly email: string,
        readonly password: string,
    ) {
        super();
    }
}
