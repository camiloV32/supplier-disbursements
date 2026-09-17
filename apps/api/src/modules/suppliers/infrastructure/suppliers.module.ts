import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SupplierOrmEntity } from "./persistence/entities/supplier.orm-entity";
import { SupplierRepository } from "../domain/ports/supplier-repository.port";
import { TypeOrmSupplierRepository } from "./persistence/repositories/supplier.repository";
import { SearchSuppliersHandler } from "../application/queries/search-suppliers/search-suppliers.handler";
import { SuppliersController } from "./http/suppliers.controller";

@Module({
    imports: [TypeOrmModule.forFeature([SupplierOrmEntity]), CqrsModule],
    controllers: [SuppliersController],
    providers: [
        {
            provide: SupplierRepository,
            useClass: TypeOrmSupplierRepository,
        },
        SearchSuppliersHandler,
    ],
    exports: [SupplierRepository],
})
export class SuppliersModule {}
