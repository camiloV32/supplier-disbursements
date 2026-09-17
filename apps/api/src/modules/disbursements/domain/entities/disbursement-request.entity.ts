export enum DisbursementStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
}

export class DisbursementRequest {
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
}
