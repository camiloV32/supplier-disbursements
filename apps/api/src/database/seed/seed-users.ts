import { NestFactory } from "@nestjs/core";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcryptjs";
import { AppModule } from "../../app.module";
import { UserOrmEntity } from "../../modules/iam/infrastructure/persistence/entities/user.orm-entity";
import { UserRole } from "../../modules/iam/domain/entities/user.entity";

const SEED_USERS = [
    { email: "analyst@supplier-disbursements.local", role: UserRole.ANALYST },
    { email: "supervisor@supplier-disbursements.local", role: UserRole.SUPERVISOR },
];

async function seed() {
    const app = await NestFactory.createApplicationContext(AppModule);

    const password = process.env.SEED_USERS_PASSWORD;
    if (!password) {
        throw new Error("SEED_USERS_PASSWORD is not set");
    }

    const repository = app.get<Repository<UserOrmEntity>>(getRepositoryToken(UserOrmEntity));
    const passwordHash = await bcrypt.hash(password, 10);

    for (const seedUser of SEED_USERS) {
        const existing = await repository.findOne({ where: { email: seedUser.email } });

        if (existing) {
            console.log(`Skipping ${seedUser.email}, already exists`);
            continue;
        }

        await repository.save(
            repository.create({
                email: seedUser.email,
                passwordHash,
                role: seedUser.role,
            }),
        );
        console.log(`Seeded ${seedUser.email} (${seedUser.role})`);
    }

    await app.close();
}

seed()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
