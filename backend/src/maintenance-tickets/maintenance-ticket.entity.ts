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
import { Property } from '../properties/property.entity';
import { User } from '../users/user.entity';
import { TicketAttachment } from './ticket-attachment.entity';

export enum TicketPriority {
  BAJA = 'BAJA',
  MEDIA = 'MEDIA',
  ALTA = 'ALTA',
  URGENTE = 'URGENTE',
}

export enum TicketStatus {
  PENDIENTE = 'PENDIENTE',
  EN_PROCESO = 'EN_PROCESO',
  RESUELTO = 'RESUELTO',
  CANCELADO = 'CANCELADO',
}

@Entity('maintenance_tickets')
export class MaintenanceTicket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'property_id' })
  propertyId: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'assigned_to', nullable: true })
  assignedTo: string;

  @Column({ name: 'ticket_number', unique: true, length: 50 })
  ticketNumber: string;

  @Column({ length: 200 })
  title: string;

  @Column('text')
  description: string;

  @Column({ length: 50 })
  category: string; // basura, desperfecto, limpieza, etc.

  @Column({
    type: 'varchar',
    length: 20,
    default: TicketPriority.MEDIA,
    enum: TicketPriority,
  })
  priority: TicketPriority;

  @Column({
    type: 'varchar',
    length: 20,
    default: TicketStatus.PENDIENTE,
    enum: TicketStatus,
  })
  status: TicketStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  cost: number;

  @Column({ name: 'reported_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  reportedAt: Date;

  @Column({ name: 'started_at', type: 'timestamp', nullable: true })
  startedAt: Date;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ name: 'resolution_notes', type: 'text', nullable: true })
  resolutionNotes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relaciones
  @ManyToOne(() => Property, (property) => property.maintenanceTickets)
  @JoinColumn({ name: 'property_id' })
  property: Property;

  @ManyToOne(() => User, (user) => user.reportedTickets)
  @JoinColumn({ name: 'tenant_id' })
  tenant: User;

  @ManyToOne(() => User, (user) => user.assignedTickets, { nullable: true })
  @JoinColumn({ name: 'assigned_to' })
  technician: User;

  @OneToMany(() => TicketAttachment, (attachment) => attachment.ticket)
  attachments: TicketAttachment[];
}