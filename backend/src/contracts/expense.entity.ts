import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Contract } from './contract.entity';

export enum ExpenseType {
  LUZ = 'LUZ',
  AGUA = 'AGUA',
  OTROS = 'OTROS',
}

@Entity('expenses')
export class Expense {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'contract_id' })
  contractId: string;

  @Column({
    name: 'expense_type',
    type: 'varchar',
    length: 50,
    enum: ExpenseType,
  })
  expenseType: ExpenseType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ name: 'billing_period', type: 'date' })
  billingPeriod: Date;

  @Column('text', { nullable: true })
  description: string;

  @Column({ name: 'receipt_url', type: 'text', nullable: true })
  receiptUrl: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relaciones
  @ManyToOne(() => Contract, (contract) => contract.expenses)
  @JoinColumn({ name: 'contract_id' })
  contract: Contract;
}