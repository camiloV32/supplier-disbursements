import { Supplier } from "../../domain/entities/supplier.entity";

export class SupplierReadModel {
    constructor(
        readonly id: string,
        readonly taxId: string,
        readonly name: string,
    ) {}

    static fromEntity(supplier: Supplier): SupplierReadModel {
        return new SupplierReadModel(supplier.id, supplier.taxId, supplier.name);
    }
}
