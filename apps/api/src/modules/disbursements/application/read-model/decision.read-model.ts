import { Decision, DecisionType } from "../../domain/entities/decision.entity";

export class DecisionReadModel {
    constructor(
        readonly id: string,
        readonly requestId: string,
        readonly decision: DecisionType,
        readonly reason: string | null,
        readonly decidedBy: string,
        readonly decidedAt: Date,
    ) {}

    static fromEntity(entity: Decision): DecisionReadModel {
        return new DecisionReadModel(
            entity.id,
            entity.requestId,
            entity.decision,
            entity.reason,
            entity.decidedBy,
            entity.decidedAt,
        );
    }
}
