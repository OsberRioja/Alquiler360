import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstallmentsService } from './installments.service';
import { Installment } from './installment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Installment])],
  providers: [InstallmentsService],
  exports: [InstallmentsService],
})
export class InstallmentsModule {}