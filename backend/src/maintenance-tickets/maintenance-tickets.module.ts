import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaintenanceTicketsService } from './maintenance-tickets.service';
import { MaintenanceTicketsController } from './maintenance-tickets.controller';
import { MaintenanceTicket } from './maintenance-ticket.entity';
import { TicketAttachment } from './ticket-attachment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MaintenanceTicket, TicketAttachment])],
  controllers: [MaintenanceTicketsController],
  providers: [MaintenanceTicketsService],
  exports: [MaintenanceTicketsService],
})
export class MaintenanceTicketsModule {}