import { ConflictException, NotFoundException } from "@nestjs/common";
import { CreateDisbursementRequestHandler } from "./create-disbursement-request.handler";
import { CreateDisbursementRequestCommand } from "./create-disbursement-request.command";
import { DisbursementRequestRepository } from "../../../domain/ports/disbursement-request-repository.port";
import { DuplicateExternalReferenceError } from "../../../domain/errors/duplicate-external-reference.error";
import { DisbursementRequest, DisbursementStatus } from "../../../domain/entities/disbursement-request.entity";
import { SupplierRepository } from "../../../../suppliers/domain/ports/supplier-repository.port";
import { Supplier } from "../../../../suppliers/domain/entities/supplier.entity";

describe("CreateDisbursementRequestHandler", () => {
    const supplierId = "b1f2c3d4-0000-4000-8000-000000000001";
    const supplier = new Supplier(supplierId, "900123456", "Acme Corp", new Date());

    const buildCommand = (overrides: Partial<{ amount: number; currency: string; concept: string }> = {}) =>
        new CreateDisbursementRequestCommand({
            externalReference: "REF-1",
            supplierId,
            amount: overrides.amount ?? 100,
            currency: overrides.currency ?? "USD",
            concept: overrides.concept ?? "Invoice 1",
        });

    const buildExisting = (overrides: Partial<{ amount: number; currency: string; concept: string }> = {}) =>
        new DisbursementRequest(
            "existing-id",
            "REF-1",
            supplierId,
            overrides.amount ?? 100,
            overrides.currency ?? "USD",
            overrides.concept ?? "Invoice 1",
            DisbursementStatus.PENDING,
            new Date(),
            new Date(),
        );

    let disbursementRequestRepository: jest.Mocked<DisbursementRequestRepository>;
    let supplierRepository: jest.Mocked<SupplierRepository>;
    let handler: CreateDisbursementRequestHandler;

    beforeEach(() => {
        disbursementRequestRepository = {
            create: jest.fn(),
            findBySupplierAndExternalReference: jest.fn(),
        } as unknown as jest.Mocked<DisbursementRequestRepository>;
        supplierRepository = {
            findById: jest.fn().mockResolvedValue(supplier),
        } as unknown as jest.Mocked<SupplierRepository>;
        handler = new CreateDisbursementRequestHandler(disbursementRequestRepository, supplierRepository);
    });

    it("creates a new request when none exists yet", async () => {
        const created = buildExisting();
        disbursementRequestRepository.create.mockResolvedValue(created);

        const result = await handler.execute(buildCommand());

        expect(result).toBe(created);
    });

    it("throws NotFoundException when the supplier does not exist", async () => {
        supplierRepository.findById.mockResolvedValue(null);

        await expect(handler.execute(buildCommand())).rejects.toThrow(NotFoundException);
        expect(disbursementRequestRepository.create).not.toHaveBeenCalled();
    });

    it("returns the existing request instead of creating a duplicate on a retried payload", async () => {
        const existing = buildExisting();
        disbursementRequestRepository.create.mockRejectedValue(
            new DuplicateExternalReferenceError(supplierId, "REF-1"),
        );
        disbursementRequestRepository.findBySupplierAndExternalReference.mockResolvedValue(existing);

        const result = await handler.execute(buildCommand());

        expect(result).toBe(existing);
    });

    it("throws ConflictException when the reused externalReference carries different data", async () => {
        const existing = buildExisting({ amount: 100 });
        disbursementRequestRepository.create.mockRejectedValue(
            new DuplicateExternalReferenceError(supplierId, "REF-1"),
        );
        disbursementRequestRepository.findBySupplierAndExternalReference.mockResolvedValue(existing);

        await expect(handler.execute(buildCommand({ amount: 999 }))).rejects.toThrow(ConflictException);
    });

    it("propagates unrelated repository errors untouched", async () => {
        disbursementRequestRepository.create.mockRejectedValue(new Error("connection lost"));

        await expect(handler.execute(buildCommand())).rejects.toThrow("connection lost");
    });
});
