import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Brackets, Repository } from "typeorm";
import { Supplier } from "../../../domain/entities/supplier.entity";
import { SupplierRepository } from "../../../domain/ports/supplier-repository.port";
import { SupplierOrmEntity } from "../entities/supplier.orm-entity";
import { SupplierMapper } from "../mappers/supplier.mapper";
import { toContainsPattern } from "@shared/database/like-pattern.util";

@Injectable()
export class TypeOrmSupplierRepository implements SupplierRepository {
    constructor(
        @InjectRepository(SupplierOrmEntity)
        private readonly ormRepository: Repository<SupplierOrmEntity>,
    ) {}

    async findById(id: string): Promise<Supplier | null> {
        const ormEntity = await this.ormRepository.findOne({ where: { id } });

        return ormEntity ? SupplierMapper.toDomain(ormEntity) : null;
    }

    async search(search: string | undefined, limit: number): Promise<Supplier[]> {
        const query = this.ormRepository.createQueryBuilder("supplier").orderBy("supplier.name", "ASC").take(limit);

        if (search) {
            const pattern = toContainsPattern(search);

            query.andWhere(
                new Brackets((sub) => {
                    sub.where("supplier.name ILIKE :pattern ESCAPE '\\'", { pattern }).orWhere(
                        "supplier.taxId ILIKE :pattern ESCAPE '\\'",
                        { pattern },
                    );
                }),
            );
        }

        const rows = await query.getMany();

        return rows.map((row) => SupplierMapper.toDomain(row));
    }
}
