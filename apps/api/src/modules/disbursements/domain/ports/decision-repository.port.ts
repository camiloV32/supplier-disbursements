import { Decision, DecisionType } from "../entities/decision.entity";

export type DecideDisbursementRequestData = {
    requestId: string;
    decision: DecisionType;
    reason: string | null;
    decidedBy: string;
};

export abstract class DecisionRepository {
    // Performs the whole "decide" operation atomically: transitions the request's status
    // (only if it's still PENDING) and records the Decision row, in one transaction.
    // Throws RequestAlreadyDecidedError if the request wasn't PENDING anymore.
    abstract decide(data: DecideDisbursementRequestData): Promise<Decision>;
}
