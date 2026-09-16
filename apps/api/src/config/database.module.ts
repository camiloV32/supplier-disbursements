import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                type: "postgres",
                host: config.getOrThrow("database.host"),
                port: config.getOrThrow("database.port"),
                username: config.getOrThrow("database.username"),
                password: config.getOrThrow("database.password"),
                database: config.getOrThrow("database.name"),
                autoLoadEntities: true,
                synchronize: config.getOrThrow("database.sync"),
                logging: config.getOrThrow("database.logging"),
            }),
        }),
    ],
})
export class DatabaseModule {}
