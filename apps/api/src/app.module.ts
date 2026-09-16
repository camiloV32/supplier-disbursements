import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppConfigModule } from './config/app-config.module';
import { DatabaseModule } from './config/database.module';
import { SuppliersModule } from './modules/suppliers/infrastructure/suppliers.module';
import { DisbursementsModule } from './modules/disbursements/infrastructure/disbursements.module';
import { IamModule } from './modules/iam/infrastructure/iam.module';
import { JwtAuthGuard } from './modules/iam/infrastructure/http/guards/jwt-auth.guard';
import { RolesGuard } from './modules/iam/infrastructure/http/guards/roles.guard';

@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    IamModule,
    SuppliersModule,
    DisbursementsModule
  ],
  controllers: [],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
