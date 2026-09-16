import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/app-config.module';
import { DatabaseModule } from './config/database.module';
import { SuppliersModule } from './modules/suppliers/infrastructure/suppliers.module';
import { DisbursementsModule } from './modules/disbursements/infrastructure/disbursements.module';
import { IamModule } from './modules/iam/infrastructure/iam.module';

@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    IamModule,
    SuppliersModule,
    DisbursementsModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
