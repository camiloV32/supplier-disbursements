import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { envVarsSchema } from "./env-schema";
import appConfig from './app.config';
import databaseConfig from './database.config';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: [".env"],
            validationSchema: envVarsSchema,
            load: [appConfig, databaseConfig]
        })
    ],
})
export class AppConfigModule {}