import { ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { RolesGuard } from "./roles.guard";
import { UserRole } from "../../../domain/entities/user.entity";

describe("RolesGuard", () => {
    const createContext = (user?: { userId: string; role: UserRole }): ExecutionContext => {
        return {
            getHandler: () => ({}),
            getClass: () => ({}),
            switchToHttp: () => ({
                getRequest: () => ({ user }),
            }),
        } as unknown as ExecutionContext;
    };

    it("allows the request when the route has no @Roles() metadata", () => {
        const reflector = { getAllAndOverride: jest.fn().mockReturnValue(undefined) } as unknown as Reflector;
        const guard = new RolesGuard(reflector);

        expect(guard.canActivate(createContext({ userId: "1", role: UserRole.ANALYST }))).toBe(true);
    });

    it("allows the request when the user's role is in the required roles", () => {
        const reflector = {
            getAllAndOverride: jest.fn().mockReturnValue([UserRole.SUPERVISOR]),
        } as unknown as Reflector;
        const guard = new RolesGuard(reflector);

        expect(guard.canActivate(createContext({ userId: "1", role: UserRole.SUPERVISOR }))).toBe(true);
    });

    it("throws ForbiddenException when the user's role is not in the required roles", () => {
        const reflector = {
            getAllAndOverride: jest.fn().mockReturnValue([UserRole.SUPERVISOR]),
        } as unknown as Reflector;
        const guard = new RolesGuard(reflector);

        expect(() => guard.canActivate(createContext({ userId: "1", role: UserRole.ANALYST }))).toThrow(
            ForbiddenException,
        );
    });

    it("throws ForbiddenException when there is no authenticated user", () => {
        const reflector = {
            getAllAndOverride: jest.fn().mockReturnValue([UserRole.SUPERVISOR]),
        } as unknown as Reflector;
        const guard = new RolesGuard(reflector);

        expect(() => guard.canActivate(createContext(undefined))).toThrow(ForbiddenException);
    });
});
