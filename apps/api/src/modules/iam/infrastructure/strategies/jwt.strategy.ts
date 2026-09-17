import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Request } from "express";
import { AuthenticatedUser } from "../../../../shared/types/authenticated-user.type";
import { AUTH_COOKIE_NAME } from "../http/authentication/auth-cookie.constants";

const extractFromCookie = (request: Request): string | null => {
    return request?.cookies?.[AUTH_COOKIE_NAME] ?? null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(@Inject(ConfigService) config: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                extractFromCookie,
                ExtractJwt.fromAuthHeaderAsBearerToken(),
            ]),
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
