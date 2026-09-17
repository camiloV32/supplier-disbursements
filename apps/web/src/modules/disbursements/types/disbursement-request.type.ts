export type DisbursementStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type DecisionType = 'APPROVED' | 'REJECTED';

export type DisbursementRequestSupplierSummary = {
  id: string;
  taxId: string;
  name: string;
};

export type DisbursementRequestDecisionSummary = {
  decision: DecisionType;
  reason: string | null;
  decidedBy: string;
  decidedAt: string;
};

export type DisbursementRequestSummary = {
  id: string;
  externalReference: string;
  supplier: DisbursementRequestSupplierSummary;
  amount: number;
  currency: string;
  concept: string;
  status: DisbursementStatus;
  createdAt: string;
  updatedAt: string;
  decision: DisbursementRequestDecisionSummary | null;
};

export type ListDisbursementRequestsParams = {
  status?: DisbursementStatus;
  search?: string;
  cursor?: string;
  limit?: number;
};

export type ListDisbursementRequestsResponse = {
  items: DisbursementRequestSummary[];
  nextCursor: string | null;
};

export type CreateDisbursementRequestPayload = {
  supplierId: string;
  externalReference: string;
  amount: number;
  currency: string;
  concept: string;
};

export type CreateDisbursementRequestResponse = {
  id: string;
  externalReference: string;
  supplierId: string;
  amount: number;
  currency: string;
  concept: string;
  status: DisbursementStatus;
  createdAt: string;
  updatedAt: string;
};

export type DecideDisbursementRequestPayload = {
  decision: DecisionType;
  reason?: string;
};

export type DecisionResponse = {
  id: string;
  requestId: string;
  decision: DecisionType;
  reason: string | null;
  decidedBy: string;
  decidedAt: string;
};
