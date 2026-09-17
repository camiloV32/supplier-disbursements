import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Brackets, Repository } from "typeorm";
import { DisbursementRequestOrmEntity } from "../entities/disbursement-request.orm-entity";
import {
    DisbursementRequestQueryRepository,
    DisbursementRequestSummary,
    ListDisbursementRequestsFilters,
    ListDisbursementRequestsPagination,
    ListDisbursementRequestsResult,
} from "../../../domain/ports/disbursement-request-query.port";
import { decodeKeysetCursor, encodeKeysetCursor } from "../../../../../shared/pagination/keyset-cursor.util";
import { toContainsPattern } from "../../../../../shared/database/like-pattern.util";

@Injectable()
export class TypeOrmDisbursementRequestQueryRepository implements DisbursementRequestQueryRepository {
    constructor(
        @InjectRepository(DisbursementRequestOrmEntity)
        private readonly ormRepository: Repository<DisbursementRequestOrmEntity>,
    ) {}

    async list(
        filters: ListDisbursementRequestsFilters,
        pagination: ListDisbursementRequestsPagination,
    ): Promise<ListDisbursementRequestsResult> {
        const query = this.ormRepository
            .createQueryBuilder("request")
            .innerJoinAndSelect("request.supplier", "supplier")
            .leftJoinAndSelect("request.decision", "decision")
            .orderBy("request.createdAt", "DESC")
            .addOrderBy("request.id", "DESC")
            .take(pagination.limit + 1);

        if (filters.status) {
            query.andWhere("request.status = :status", { status: filters.status });
        }

        if (filters.search) {
            const pattern = toContainsPattern(filters.search);

            query.andWhere(
                new Brackets((sub) => {
                    sub.where("request.externalReference ILIKE :pattern ESCAPE '\\'", { pattern })
                        .orWhere("supplier.name ILIKE :pattern ESCAPE '\\'", { pattern })
                        .orWhere("supplier.taxId ILIKE :pattern ESCAPE '\\'", { pattern });
                }),
            );
        }

        if (pagination.cursor) {
            const cursor = decodeKeysetCursor(pagination.cursor);

            if (!cursor) {
                throw new BadRequestException("Invalid cursor");
            }

            query.andWhere(
                new Brackets((sub) => {
                    sub.where("request.createdAt < :cursorCreatedAt", { cursorCreatedAt: cursor.createdAt }).orWhere(
                        new Brackets((sub2) => {
                            sub2
                                .where("request.createdAt = :cursorCreatedAt", {
                                    cursorCreatedAt: cursor.createdAt,
                                })
                                .andWhere("request.id < :cursorId", { cursorId: cursor.id });
                        }),
                    );
                }),
            );
        }

        const rows = await query.getMany();
        const hasMore = rows.length > pagination.limit;
        const page = hasMore ? rows.slice(0, pagination.limit) : rows;
        const last = page[page.length - 1];

        return {
            items: page.map((row) => this.toSummary(row)),
            nextCursor: hasMore && last ? encodeKeysetCursor({ createdAt: last.createdAt, id: last.id }) : null,
        };
    }

    async findById(id: string): Promise<DisbursementRequestSummary | null> {
        const row = await this.ormRepository.findOne({
            where: { id },
            relations: { supplier: true, decision: true },
        });

        return row ? this.toSummary(row) : null;
    }

    private toSummary(row: DisbursementRequestOrmEntity): DisbursementRequestSummary {
        return {
            id: row.id,
            externalReference: row.externalReference,
            supplier: {
                id: row.supplier.id,
                taxId: row.supplier.taxId,
                name: row.supplier.name,
            },
            amount: row.amount,
            currency: row.currency,
            concept: row.concept,
            status: row.status,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
            decision: row.decision
                ? {
                      decision: row.decision.decision,
                      reason: row.decision.reason,
                      decidedBy: row.decision.decidedBy,
                      decidedAt: row.decision.decidedAt,
                  }
                : null,
        };
    }
}
