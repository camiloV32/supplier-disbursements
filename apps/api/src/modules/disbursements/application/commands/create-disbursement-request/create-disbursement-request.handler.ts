import { ConflictException, Inject, NotFoundException } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DisbursementRequest } from "../../../domain/entities/disbursement-request.entity";
import { DisbursementRequestRepository } from "../../../domain/ports/disbursement-request-repository.port";
import { DuplicateExternalReferenceError } from "../../../domain/errors/duplicate-external-reference.error";
import { SupplierRepository } from "../../../../suppliers/domain/ports/supplier-repository.port";
import { CreateDisbursementRequestCommand } from "./create-disbursement-request.command";

@CommandHandler(CreateDisbursementRequestCommand)
export class CreateDisbursementRequestHandler
    implements ICommandHandler<CreateDisbursementRequestCommand>
{
    constructor(
        @Inject(DisbursementRequestRepository)
        private readonly disbursementRequestRepository: DisbursementRequestRepository,
        @Inject(SupplierRepository)
        private readonly supplierRepository: SupplierRepository,
    ) {}

    async execute(command: CreateDisbursementRequestCommand): Promise<DisbursementRequest> {
        const supplier = await this.supplierRepository.findById(command.supplierId);

        if (!supplier) {
            throw new NotFoundException("Supplier not found");
        }

        try {
            return await this.disbursementRequestRepository.create({
                externalReference: command.externalReference,
                supplierId: command.supplierId,
                amount: command.amount,
                currency: command.currency,
                concept: command.concept,
            });
        } catch (error) {
            if (!(error instanceof DuplicateExternalReferenceError)) {
                throw error;
            }

            return this.resolveIdempotentReplay(command, error);
        }
    }

    // RF5: a retry (same supplierId + externalReference, same payload) must not create a
    // duplicate — it should transparently return the original request instead. If the
    // reused externalReference carries different data, that's a real conflict, not a
    // retry, so it's surfaced as 409 rather than silently returned.
    private async resolveIdempotentReplay(
        command: CreateDisbursementRequestCommand,
        originalError: DuplicateExternalReferenceError,
    ): Promise<DisbursementRequest> {
        const existing = await this.disbursementRequestRepository.findBySupplierAndExternalReference(
            command.supplierId,
            command.externalReference,
        );

        if (!existing) {
            throw originalError;
        }

        const isSamePayload =
            existing.amount === command.amount &&
            existing.currency === command.currency &&
            existing.concept === command.concept;

        if (!isSamePayload) {
            throw new ConflictException(
                `A disbursement request with externalReference '${command.externalReference}' already exists for this supplier with different data`,
            );
        }

        return existing;
    }
}
