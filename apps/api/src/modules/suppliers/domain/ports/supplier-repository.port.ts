import { Supplier } from "../entities/supplier.entity";

export abstract class SupplierRepository {
    abstract findById(id: string): Promise<Supplier | null>;
    abstract search(search: string | undefined, limit: number): Promise<Supplier[]>;
}
