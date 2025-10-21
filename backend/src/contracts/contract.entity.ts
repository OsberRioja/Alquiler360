import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Property } from '../properties/property.entity';
import { Installment } from '../installments/installment.entity';
import { Expense } from './expense.entity';
import { Document } from './document.entity';

export enum ContractStatus {
  ACTIVO = 'ACTIVO',
  FINALIZADO = 'FINALIZADO',
  CANCELADO = 'CANCELADO',
}

@Entity('contracts')
export class Contract {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'property_id' })
  propertyId: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'contract_number', unique: true, length: 50 })
  contractNumber: string;

  @Column({ name: 'start_date', type: 'date' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date' })
  endDate: Date;

  @Column({ name: 'monthly_rent', type: 'decimal', precision: 10, scale: 2 })
  monthlyRent: number;

  @Column({ name: 'security_deposit', type: 'decimal', precision: 10, scale: 2 })
  securityDeposit: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  commission: number;

  @Column({ name: 'special_clauses', type: 'text', nullable: true })
  specialClauses: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: ContractStatus.ACTIVO,
    enum: ContractStatus,
  })
  status: ContractStatus;

  @Column({ name: 'contract_document_url', type: 'text', nullable: true })
  contractDocumentUrl: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relaciones
  @ManyToOne(() => Property, (property) => property.contracts)
  @JoinColumn({ name: 'property_id' })
  property: Property;

  @ManyToOne(() => User, (user) => user.contracts)
  @JoinColumn({ name: 'tenant_id' })
  tenant: User;

  @OneToMany(() => Installment, (installment) => installment.contract)
  installments: Installment[];

  @OneToMany(() => Expense, (expense) => expense.contract)
  expenses: Expense[];

  @OneToMany(() => Document, (document) => document.contract)
  documents: Document[];
}