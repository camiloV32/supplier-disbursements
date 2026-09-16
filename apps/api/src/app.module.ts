import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/app-config.module';
import { SuppliersModule } from './modules/suppliers/infrastructure/suppliers.module';
import { DisbursementsModule } from './modules/disbursements/infrastructure/disbursements.module';

@Module({
  imports: [
    AppConfigModule,
    SuppliersModule,
    DisbursementsModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
