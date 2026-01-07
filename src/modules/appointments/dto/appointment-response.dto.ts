import { ApiProperty } from '@nestjs/swagger';
import { Appointment, AppointmentStatus, AppointmentChannel } from '../entities/appointment.entity';

export class AppointmentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  date: Date;

  @ApiProperty()
  time: string;

  @ApiProperty()
  storeId: string;

  @ApiProperty({ required: false })
  storeName?: string;

  @ApiProperty({ required: false })
  sellerId?: string;

  @ApiProperty({ required: false })
  sellerName?: string;

  @ApiProperty()
  clientId: string;

  @ApiProperty()
  clientName: string;

  @ApiProperty()
  address: string;

  @ApiProperty()
  duration: number;

  @ApiProperty({ enum: AppointmentStatus })
  status: AppointmentStatus;

  @ApiProperty({ enum: AppointmentChannel })
  channel: AppointmentChannel;

  @ApiProperty()
  autoAssign: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(appointment: Appointment) {
    this.id = appointment.id;
    this.date = appointment.date;
    this.time = appointment.time;
    this.storeId = appointment.storeId;
    this.storeName = appointment.store?.name;
    this.sellerId = appointment.sellerId;
    this.sellerName = appointment.seller?.name;
    this.clientId = appointment.clientId;
    this.clientName = appointment.client?.name;
    this.address = appointment.address;
    this.duration = appointment.duration;
    this.status = appointment.status;
    this.channel = appointment.channel;
    this.autoAssign = appointment.autoAssign;
    this.createdAt = appointment.createdAt;
    this.updatedAt = appointment.updatedAt;
  }
}

