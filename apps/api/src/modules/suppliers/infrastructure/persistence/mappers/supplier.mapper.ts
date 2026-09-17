import { Supplier } from "../../../domain/entities/supplier.entity";
import { SupplierOrmEntity } from "../entities/supplier.orm-entity";

export class SupplierMapper {
    static toDomain(ormEntity: SupplierOrmEntity): Supplier {
        return new Supplier(ormEntity.id, ormEntity.taxId, ormEntity.name, ormEntity.createdAt);
    }
}
