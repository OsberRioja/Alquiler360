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
import { Contract } from '../contracts/contract.entity';
import { MaintenanceTicket } from '../maintenance-tickets/maintenance-ticket.entity';

export enum PropertyStatus {
  DISPONIBLE = 'DISPONIBLE',
  ALQUILADO = 'ALQUILADO',
  MANTENIMIENTO = 'MANTENIMIENTO',
}

@Entity('properties')
export class Property {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'owner_id' })
  ownerId: string;

  @Column({ length: 150 })
  name: string;

  @Column('text')
  address: string;

  @Column({ name: 'property_type', length: 50 })
  propertyType: string; // casa, departamento, local, etc.

  @Column({ name: 'size_m2', type: 'decimal', precision: 10, scale: 2, nullable: true })
  sizeM2: number;

  @Column({ type: 'int', nullable: true })
  bedrooms: number;

  @Column({ type: 'int', nullable: true })
  bathrooms: number;

  @Column('text', { nullable: true })
  description: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: PropertyStatus.DISPONIBLE,
    enum: PropertyStatus,
  })
  status: PropertyStatus;

  @Column({ name: 'electricity_meter', length: 50, nullable: true })
  electricityMeter: string;

  @Column({ name: 'water_meter', length: 50, nullable: true })
  waterMeter: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relaciones
  @ManyToOne(() => User, (user) => user.properties)
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @OneToMany(() => Contract, (contract) => contract.property)
  contracts: Contract[];

  @OneToMany(() => MaintenanceTicket, (ticket) => ticket.property)
  maintenanceTickets: MaintenanceTicket[];
}