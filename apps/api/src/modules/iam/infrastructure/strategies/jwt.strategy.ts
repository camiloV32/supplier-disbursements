import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AuthenticatedUser } from "../../../../shared/types/authenticated-user.type";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(@Inject(ConfigService) config: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: config.getOrThrow("app.jwt.secret"),
        });
    }

    validate(payload: { sub: string; role: string }): AuthenticatedUser {
        return {
            userId: payload.sub,
            role: payload.role as AuthenticatedUser["role"],
        };
    }
}
