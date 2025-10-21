import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Installment } from '../installments/installment.entity';
import { User } from '../users/user.entity';

export enum PaymentMethod {
  EFECTIVO = 'EFECTIVO',
  TRANSFERENCIA = 'TRANSFERENCIA',
  QR = 'QR',
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'installment_id' })
  installmentId: string;

  @Column({ name: 'payment_number', unique: true, length: 50 })
  paymentNumber: string;

  @Column({ name: 'payment_date', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  paymentDate: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({
    name: 'payment_method',
    type: 'varchar',
    length: 20,
    enum: PaymentMethod,
  })
  paymentMethod: PaymentMethod;

  @Column({ name: 'reference_number', length: 100, nullable: true })
  referenceNumber: string;

  @Column({ name: 'proof_url', type: 'text', nullable: true })
  proofUrl: string;

  @Column('text', { nullable: true })
  notes: string;

  @Column({ name: 'receipt_pdf_url', type: 'text', nullable: true })
  receiptPdfUrl: string;

  @Column({ name: 'created_by', nullable: true })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relaciones
  @ManyToOne(() => Installment, (installment) => installment.payments)
  @JoinColumn({ name: 'installment_id' })
  installment: Installment;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;
}