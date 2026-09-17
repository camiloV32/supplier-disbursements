import { Decision } from "../../../domain/entities/decision.entity";
import { DecisionOrmEntity } from "../entities/decision.orm-entity";

export class DecisionMapper {
    static toDomain(ormEntity: DecisionOrmEntity): Decision {
        return new Decision(
            ormEntity.id,
            ormEntity.requestId,
            ormEntity.decision,
            ormEntity.reason,
            ormEntity.decidedBy,
            ormEntity.decidedAt,
        );
    }
}
