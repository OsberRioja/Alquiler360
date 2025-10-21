import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Property } from '../properties/property.entity';
import { Contract } from '../contracts/contract.entity';
import { MaintenanceTicket } from '../maintenance-tickets/maintenance-ticket.entity';

export enum UserRole {
  ADMIN = 'ADMIN',
  PROPIETARIO = 'PROPIETARIO',
  INQUILINO = 'INQUILINO',
  TECNICO = 'TECNICO',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  username: string;

  @Column({ unique: true, length: 100 })
  email: string;

  @Column({ name: 'password_hash' })
  @Exclude() // No exponer en las respuestas JSON
  passwordHash: string;

  @Column({ name: 'full_name', length: 150 })
  fullName: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({
    type: 'varchar',
    length: 20,
    enum: UserRole,
  })
  role: UserRole;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relaciones
  @OneToMany(() => Property, (property) => property.owner)
  properties: Property[];

  @OneToMany(() => Contract, (contract) => contract.tenant)
  contracts: Contract[];

  @OneToMany(() => MaintenanceTicket, (ticket) => ticket.tenant)
  reportedTickets: MaintenanceTicket[];

  @OneToMany(() => MaintenanceTicket, (ticket) => ticket.assignedTo)
  assignedTickets: MaintenanceTicket[];
}