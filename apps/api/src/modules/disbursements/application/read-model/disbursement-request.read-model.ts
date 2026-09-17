import { DisbursementRequest, DisbursementStatus } from "../../domain/entities/disbursement-request.entity";

export class DisbursementRequestReadModel {
    constructor(
        readonly id: string,
        readonly externalReference: string,
        readonly supplierId: string,
        readonly amount: number,
        readonly currency: string,
        readonly concept: string,
        readonly status: DisbursementStatus,
        readonly createdAt: Date,
        readonly updatedAt: Date,
    ) {}

    static fromEntity(entity: DisbursementRequest): DisbursementRequestReadModel {
        return new DisbursementRequestReadModel(
            entity.id,
            entity.externalReference,
            entity.supplierId,
            entity.amount,
            entity.currency,
            entity.concept,
            entity.status,
            entity.createdAt,
            entity.updatedAt,
        );
    }
}
