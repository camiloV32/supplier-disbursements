import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { Decision } from "../../../domain/entities/decision.entity";
import { DisbursementStatus } from "../../../domain/entities/disbursement-request.entity";
import {
    DecideDisbursementRequestData,
    DecisionRepository,
} from "../../../domain/ports/decision-repository.port";
import { RequestAlreadyDecidedError } from "../../../domain/errors/request-already-decided.error";
import { DecisionOrmEntity } from "../entities/decision.orm-entity";
import { DisbursementRequestOrmEntity } from "../entities/disbursement-request.orm-entity";
import { DecisionMapper } from "../mappers/decision.mapper";
import { isUniqueViolation } from "@shared/database/postgres-error.util";

const RESULT_STATUS_BY_DECISION: Record<Decision["decision"], DisbursementStatus> = {
    APPROVED: DisbursementStatus.APPROVED,
    REJECTED: DisbursementStatus.REJECTED,
};

@Injectable()
export class TypeOrmDecisionRepository implements DecisionRepository {
    constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

    async decide(data: DecideDisbursementRequestData): Promise<Decision> {
        return this.dataSource.transaction(async (manager) => {
            // RF4 + RF6: transition the request's status only if it's still PENDING. Postgres
            // locks the row for the duration of this UPDATE, so if two supervisors decide the
            // same request at nearly the same instant, one transaction blocks until the other
            // commits, then re-evaluates this WHERE clause against the now-updated row and
            // affects 0 rows — that's how the loser is detected, deterministically.
            const updateResult = await manager.update(
                DisbursementRequestOrmEntity,
                { id: data.requestId, status: DisbursementStatus.PENDING },
                { status: RESULT_STATUS_BY_DECISION[data.decision] },
            );

            if (updateResult.affected === 0) {
                throw new RequestAlreadyDecidedError(data.requestId);
            }

            try {
                const ormEntity = manager.create(DecisionOrmEntity, {
                    requestId: data.requestId,
                    decision: data.decision,
                    reason: data.reason,
                    decidedBy: data.decidedBy,
                });
                const saved = await manager.save(ormEntity);

                return DecisionMapper.toDomain(saved);
            } catch (error) {
                // Defense in depth: the unique index on decisions.request_id means even a
                // second write path that bypassed the status check above couldn't persist a
                // second, contradictory decision for the same request.
                if (isUniqueViolation(error)) {
                    throw new RequestAlreadyDecidedError(data.requestId);
                }

                throw error;
            }
        });
    }
}
