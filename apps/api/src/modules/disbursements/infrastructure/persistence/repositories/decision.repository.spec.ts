import { DataSource, QueryFailedError } from "typeorm";

import { TypeOrmDecisionRepository } from "./decision.repository";

// @nestjs/typeorm ships as an ESM-only package that Jest's default CommonJS transform
// can't require. This test never goes through Nest's DI container (it instantiates the
// repository directly with `new`), so the real @InjectDataSource decorator is never
// needed — only its import must resolve without exploding. jest.mock calls are hoisted
// above imports, so this still applies before "./decision.repository" is loaded.
jest.mock("@nestjs/typeorm", () => ({
    InjectDataSource: () => () => undefined,
}));
import { RequestAlreadyDecidedError } from "../../../domain/errors/request-already-decided.error";
import { DecideDisbursementRequestData } from "../../../domain/ports/decision-repository.port";
import { DecisionType } from "../../../domain/entities/decision.entity";
import { DisbursementStatus } from "../../../domain/entities/disbursement-request.entity";

describe("TypeOrmDecisionRepository", () => {
    const requestId = "b1f2c3d4-0000-4000-8000-000000000002";
    const supervisorId = "b1f2c3d4-0000-4000-8000-000000000009";

    const buildData = (decision: DecisionType = DecisionType.APPROVED): DecideDisbursementRequestData => ({
        requestId,
        decision,
        reason: decision === DecisionType.REJECTED ? "not valid" : null,
        decidedBy: supervisorId,
    });

    let manager: { update: jest.Mock; create: jest.Mock; save: jest.Mock };
    let dataSource: { transaction: jest.Mock };
    let repository: TypeOrmDecisionRepository;

    beforeEach(() => {
        manager = {
            update: jest.fn(),
            create: jest.fn((_entity, data) => data),
            save: jest.fn(),
        };
        dataSource = {
            transaction: jest.fn((work: (manager: unknown) => unknown) => work(manager)),
        };
        repository = new TypeOrmDecisionRepository(dataSource as unknown as DataSource);
    });

    it("transitions the request and persists the decision when the request is still pending", async () => {
        manager.update.mockResolvedValue({ affected: 1 });
        manager.save.mockResolvedValue({
            id: "decision-1",
            requestId,
            decision: DecisionType.APPROVED,
            reason: null,
            decidedBy: supervisorId,
            decidedAt: new Date("2026-01-01T00:00:00Z"),
        });

        const result = await repository.decide(buildData(DecisionType.APPROVED));

        expect(result.id).toBe("decision-1");
        expect(manager.update).toHaveBeenCalledWith(
            expect.anything(),
            { id: requestId, status: DisbursementStatus.PENDING },
            { status: DisbursementStatus.APPROVED },
        );
    });

    it("throws RequestAlreadyDecidedError when the conditional update loses the race (0 rows affected)", async () => {
        manager.update.mockResolvedValue({ affected: 0 });

        await expect(repository.decide(buildData())).rejects.toThrow(RequestAlreadyDecidedError);
        expect(manager.save).not.toHaveBeenCalled();
    });

    it("throws RequestAlreadyDecidedError when the decision insert hits the unique constraint (defense in depth)", async () => {
        manager.update.mockResolvedValue({ affected: 1 });
        manager.save.mockRejectedValue(
            new QueryFailedError("INSERT INTO decisions ...", [], {
                code: "23505",
                message: "duplicate key value violates unique constraint",
            } as unknown as Error),
        );

        await expect(repository.decide(buildData())).rejects.toThrow(RequestAlreadyDecidedError);
    });

    it("propagates unrelated errors from the insert untouched", async () => {
        manager.update.mockResolvedValue({ affected: 1 });
        manager.save.mockRejectedValue(new Error("connection lost"));

        await expect(repository.decide(buildData())).rejects.toThrow("connection lost");
    });
});
