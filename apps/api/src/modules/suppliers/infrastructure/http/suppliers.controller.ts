import { Controller, Get, Query } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import { SUPPLIERS_ROUTE } from "./route.constants";
import { SearchSuppliersDto } from "./dto/search-suppliers.dto";
import { SearchSuppliersQuery } from "../../application/queries/search-suppliers/search-suppliers.query";
import { SupplierReadModel } from "../../application/read-model/supplier.read-model";

@Controller({
    path: SUPPLIERS_ROUTE,
    version: "1",
})
export class SuppliersController {
    constructor(private readonly queryBus: QueryBus) {}

    @Get()
    search(@Query() query: SearchSuppliersDto): Promise<SupplierReadModel[]> {
        return this.queryBus.execute(new SearchSuppliersQuery(query.search, query.limit));
    }
}
