// @nestjs/terminus ships as an ESM-only package, which ts-jest (CommonJS) can't
// require() directly. Both classes are fully mocked in these tests anyway, so
// replace the module before it's ever loaded instead of fighting Jest/ESM interop.
jest.mock("@nestjs/terminus", () => ({
    HealthCheckService: jest.fn(),
    TypeOrmHealthIndicator: jest.fn(),
    HealthCheck: () => () => {},
}));
import { HealthCheckService, TypeOrmHealthIndicator } from "@nestjs/terminus";
import { HealthController } from "./health.controller";

describe("HealthController", () => {
    let health: jest.Mocked<HealthCheckService>;
    let db: jest.Mocked<TypeOrmHealthIndicator>;
    let controller: HealthController;

    beforeEach(() => {
        health = { check: jest.fn() } as unknown as jest.Mocked<HealthCheckService>;
        db = { pingCheck: jest.fn() } as unknown as jest.Mocked<TypeOrmHealthIndicator>;
        controller = new HealthController(health, db);
    });

    it("live() answers ok without touching the database", () => {
        const result = controller.live();

        expect(result).toEqual({ status: "ok" });
        expect(db.pingCheck).not.toHaveBeenCalled();
        expect(health.check).not.toHaveBeenCalled();
    });

    it("ready() delegates to a database ping check", () => {
        health.check.mockResolvedValue({ status: "ok", info: {}, error: {}, details: {} });

        controller.ready();

        expect(health.check).toHaveBeenCalledTimes(1);
        const checks = health.check.mock.calls[0][0];
        expect(checks).toHaveLength(1);

        // Exercise the check function itself to confirm it's wired to the db indicator.
        (checks[0] as () => unknown)();
        expect(db.pingCheck).toHaveBeenCalledWith("database");
    });
});
