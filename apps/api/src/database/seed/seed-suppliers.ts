import { NestFactory } from "@nestjs/core";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AppModule } from "../../app.module";
import { SupplierOrmEntity } from "../../modules/suppliers/infrastructure/persistence/entities/supplier.orm-entity";

const SEED_SUPPLIERS = [
    { taxId: "900123456-7", name: "Proveedor de Prueba S.A.S" },
    { taxId: "900234567-8", name: "Suministros Andinos S.A." },
    { taxId: "900345678-9", name: "Logística del Pacífico Ltda." },
];

async function seed() {
    const app = await NestFactory.createApplicationContext(AppModule);

    const repository = app.get<Repository<SupplierOrmEntity>>(getRepositoryToken(SupplierOrmEntity));

    for (const seedSupplier of SEED_SUPPLIERS) {
        const existing = await repository.findOne({ where: { taxId: seedSupplier.taxId } });

        if (existing) {
            console.log(`Skipping ${seedSupplier.name}, already exists`);
            continue;
        }

        await repository.save(repository.create(seedSupplier));
        console.log(`Seeded supplier ${seedSupplier.name} (${seedSupplier.taxId})`);
    }

    await app.close();
}

seed()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
