import { ConflictException, NotFoundException } from "@nestjs/common";
import { DecideDisbursementRequestHandler } from "./decide-disbursement-request.handler";
import { DecideDisbursementRequestCommand } from "./decide-disbursement-request.command";
import { DecisionRepository } from "../../../domain/ports/decision-repository.port";
import {
    DisbursementRequestQueryRepository,
    DisbursementRequestSummary,
} from "../../../domain/ports/disbursement-request-query.port";
import { RequestAlreadyDecidedError } from "../../../domain/errors/request-already-decided.error";
import { Decision, DecisionType } from "../../../domain/entities/decision.entity";
import { DisbursementStatus } from "../../../domain/entities/disbursement-request.entity";

describe("DecideDisbursementRequestHandler", () => {
    const requestId = "b1f2c3d4-0000-4000-8000-000000000002";
    const supervisorId = "b1f2c3d4-0000-4000-8000-000000000009";

    const pendingRequest: DisbursementRequestSummary = {
        id: requestId,
        externalReference: "REF-1",
        supplier: { id: "supplier-1", taxId: "900123456", name: "Acme Corp" },
        amount: 100,
        currency: "USD",
        concept: "Invoice 1",
        status: DisbursementStatus.PENDING,
        decision: null,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const buildCommand = (decision: DecisionType, reason?: string) =>
        new DecideDisbursementRequestCommand({ requestId, decision, reason, decidedBy: supervisorId });

    let decisionRepository: jest.Mocked<DecisionRepository>;
    let queryRepository: jest.Mocked<DisbursementRequestQueryRepository>;
    let handler: DecideDisbursementRequestHandler;

    beforeEach(() => {
        decisionRepository = { decide: jest.fn() } as unknown as jest.Mocked<DecisionRepository>;
        queryRepository = {
            findById: jest.fn().mockResolvedValue(pendingRequest),
            list: jest.fn(),
        } as unknown as jest.Mocked<DisbursementRequestQueryRepository>;
        handler = new DecideDisbursementRequestHandler(decisionRepository, queryRepository);
    });

    it("approves a pending request", async () => {
        const decision = new Decision("d1", requestId, DecisionType.APPROVED, null, supervisorId, new Date());
        decisionRepository.decide.mockResolvedValue(decision);

        const result = await handler.execute(buildCommand(DecisionType.APPROVED));

        expect(result).toBe(decision);
        expect(decisionRepository.decide).toHaveBeenCalledWith({
            requestId,
            decision: DecisionType.APPROVED,
            reason: null,
            decidedBy: supervisorId,
        });
    });

    it("throws NotFoundException when the request does not exist", async () => {
        queryRepository.findById.mockResolvedValue(null);

        await expect(handler.execute(buildCommand(DecisionType.APPROVED))).rejects.toThrow(NotFoundException);
        expect(decisionRepository.decide).not.toHaveBeenCalled();
    });

    it("throws ConflictException when the request was already decided (lost the concurrency race)", async () => {
        decisionRepository.decide.mockRejectedValue(new RequestAlreadyDecidedError(requestId));

        await expect(handler.execute(buildCommand(DecisionType.REJECTED, "duplicate"))).rejects.toThrow(
            ConflictException,
        );
    });

    it("propagates unrelated repository errors untouched", async () => {
        decisionRepository.decide.mockRejectedValue(new Error("connection lost"));

        await expect(handler.execute(buildCommand(DecisionType.APPROVED))).rejects.toThrow("connection lost");
    });
});
