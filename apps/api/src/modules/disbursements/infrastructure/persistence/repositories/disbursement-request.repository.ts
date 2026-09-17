import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { DisbursementRequest, DisbursementStatus } from "../../../domain/entities/disbursement-request.entity";
import {
    CreateDisbursementRequestData,
    DisbursementRequestRepository,
} from "../../../domain/ports/disbursement-request-repository.port";
import { DuplicateExternalReferenceError } from "../../../domain/errors/duplicate-external-reference.error";
import { DisbursementRequestOrmEntity } from "../entities/disbursement-request.orm-entity";
import { DisbursementRequestMapper } from "../mappers/disbursement-request.mapper";
import { isUniqueViolation } from "@shared/database/postgres-error.util";

@Injectable()
export class TypeOrmDisbursementRequestRepository implements DisbursementRequestRepository {
    constructor(
        @InjectRepository(DisbursementRequestOrmEntity)
        private readonly ormRepository: Repository<DisbursementRequestOrmEntity>,
    ) {}

    async create(data: CreateDisbursementRequestData): Promise<DisbursementRequest> {
        const ormEntity = this.ormRepository.create({
            externalReference: data.externalReference,
            supplierId: data.supplierId,
            amount: data.amount,
            currency: data.currency,
            concept: data.concept,
            status: DisbursementStatus.PENDING,
        });

        try {
            const saved = await this.ormRepository.save(ormEntity);

            return DisbursementRequestMapper.toDomain(saved);
        } catch (error) {
            if (isUniqueViolation(error)) {
                throw new DuplicateExternalReferenceError(data.supplierId, data.externalReference);
            }

            throw error;
        }
    }

    async findBySupplierAndExternalReference(
        supplierId: string,
        externalReference: string,
    ): Promise<DisbursementRequest | null> {
        const ormEntity = await this.ormRepository.findOne({ where: { supplierId, externalReference } });

        return ormEntity ? DisbursementRequestMapper.toDomain(ormEntity) : null;
    }
}
