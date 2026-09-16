import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { envVarsSchema } from "./env-schema";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: [".env"],
            validationSchema: envVarsSchema
        })
    ],
})
export class AppConfigModule {}