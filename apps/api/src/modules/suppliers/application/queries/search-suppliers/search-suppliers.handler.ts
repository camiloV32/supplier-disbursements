import { Inject } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { SupplierRepository } from "../../../domain/ports/supplier-repository.port";
import { SupplierReadModel } from "../../read-model/supplier.read-model";
import { SearchSuppliersQuery } from "./search-suppliers.query";

@QueryHandler(SearchSuppliersQuery)
export class SearchSuppliersHandler implements IQueryHandler<SearchSuppliersQuery> {
    constructor(
        @Inject(SupplierRepository)
        private readonly supplierRepository: SupplierRepository,
    ) {}

    async execute(query: SearchSuppliersQuery): Promise<SupplierReadModel[]> {
        const suppliers = await this.supplierRepository.search(query.search, query.limit);

        return suppliers.map((supplier) => SupplierReadModel.fromEntity(supplier));
    }
}
