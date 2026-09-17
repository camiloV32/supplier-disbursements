import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { AppConfigModule } from './config/app-config.module';
import { DatabaseModule } from './config/database.module';
import { SuppliersModule } from './modules/suppliers/infrastructure/suppliers.module';
import { DisbursementsModule } from './modules/disbursements/infrastructure/disbursements.module';
import { IamModule } from './modules/iam/infrastructure/iam.module';
import { HealthModule } from './modules/health/health.module';
import { JwtAuthGuard } from './modules/iam/infrastructure/http/guards/jwt-auth.guard';
import { RolesGuard } from './modules/iam/infrastructure/http/guards/roles.guard';
import { AllExceptionsFilter } from '@shared/filters/all-exceptions.filter';

@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    IamModule,
    SuppliersModule,
    DisbursementsModule,
    HealthModule
  ],
  controllers: [],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
