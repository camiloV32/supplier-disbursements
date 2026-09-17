import { DisbursementRequest } from "../../../domain/entities/disbursement-request.entity";
import { DisbursementRequestOrmEntity } from "../entities/disbursement-request.orm-entity";

export class DisbursementRequestMapper {
    static toDomain(ormEntity: DisbursementRequestOrmEntity): DisbursementRequest {
        return new DisbursementRequest(
            ormEntity.id,
            ormEntity.externalReference,
            ormEntity.supplierId,
            ormEntity.amount,
            ormEntity.currency,
            ormEntity.concept,
            ormEntity.status,
            ormEntity.createdAt,
            ormEntity.updatedAt,
        );
    }
}
