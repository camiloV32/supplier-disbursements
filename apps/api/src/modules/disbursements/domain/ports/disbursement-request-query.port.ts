import { DisbursementStatus } from "../entities/disbursement-request.entity";
import { DecisionType } from "../entities/decision.entity";

export type DisbursementRequestSupplierSummary = {
    id: string;
    taxId: string;
    name: string;
};

export type DisbursementRequestDecisionSummary = {
    decision: DecisionType;
    reason: string | null;
    decidedBy: string;
    decidedAt: Date;
};

export type DisbursementRequestSummary = {
    id: string;
    externalReference: string;
    supplier: DisbursementRequestSupplierSummary;
    amount: number;
    currency: string;
    concept: string;
    status: DisbursementStatus;
    createdAt: Date;
    updatedAt: Date;
    decision: DisbursementRequestDecisionSummary | null;
};

export type ListDisbursementRequestsFilters = {
    status?: DisbursementStatus;
    search?: string;
};

export type ListDisbursementRequestsPagination = {
    cursor?: string;
    limit: number;
};

export type ListDisbursementRequestsResult = {
    items: DisbursementRequestSummary[];
    nextCursor: string | null;
};

export abstract class DisbursementRequestQueryRepository {
    abstract list(
        filters: ListDisbursementRequestsFilters,
        pagination: ListDisbursementRequestsPagination,
    ): Promise<ListDisbursementRequestsResult>;

    abstract findById(id: string): Promise<DisbursementRequestSummary | null>;
}
