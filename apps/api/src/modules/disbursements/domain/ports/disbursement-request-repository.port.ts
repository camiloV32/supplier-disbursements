import { DisbursementRequest } from "../entities/disbursement-request.entity";

export type CreateDisbursementRequestData = {
    externalReference: string;
    supplierId: string;
    amount: number;
    currency: string;
    concept: string;
};

export abstract class DisbursementRequestRepository {
    abstract create(data: CreateDisbursementRequestData): Promise<DisbursementRequest>;
    abstract findBySupplierAndExternalReference(
        supplierId: string,
        externalReference: string,
    ): Promise<DisbursementRequest | null>;
}
