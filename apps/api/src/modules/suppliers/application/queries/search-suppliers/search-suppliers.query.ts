import { Query } from "@nestjs/cqrs";
import { SupplierReadModel } from "../../read-model/supplier.read-model";

export class SearchSuppliersQuery extends Query<SupplierReadModel[]> {
    constructor(
        readonly search: string | undefined,
        readonly limit: number,
    ) {
        super();
    }
}
