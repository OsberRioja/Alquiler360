import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContractsService } from './contracts.service';
import { ContractsController } from './contracts.controller';
import { Contract } from './contract.entity';
import { Expense } from './expense.entity';
import { Document } from './document.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Contract, Expense, Document])],
  controllers: [ContractsController],
  providers: [ContractsService],
  exports: [ContractsService],
})
export class ContractsModule {}