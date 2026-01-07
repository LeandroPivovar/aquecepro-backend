import { IsString, IsNotEmpty, IsEnum, IsNumber, IsOptional, IsBoolean, IsDateString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AppointmentStatus, AppointmentChannel } from '../entities/appointment.entity';

export class CreateAppointmentDto {
  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ example: '10:00' })
  @IsString()
  @IsNotEmpty()
  time: string;

  @ApiProperty({ example: 'uuid-da-loja' })
  @IsString()
  @IsNotEmpty()
  storeId: string;

  @ApiProperty({ example: 'uuid-do-vendedor', required: false })
  @IsOptional()
  @IsString()
  sellerId?: string;

  @ApiProperty({ example: 'uuid-do-cliente' })
  @IsString()
  @IsNotEmpty()
  clientId: string;

  @ApiProperty({ example: 'Rua A, 100, Bairro, Cidade' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: 60, required: false, default: 60 })
  @IsOptional()
  @IsNumber()
  @Min(15)
  duration?: number;

  @ApiProperty({ enum: AppointmentStatus, required: false, default: AppointmentStatus.SCHEDULED })
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @ApiProperty({ enum: AppointmentChannel, required: false, default: AppointmentChannel.PRESENCIAL })
  @IsOptional()
  @IsEnum(AppointmentChannel)
  channel?: AppointmentChannel;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  autoAssign?: boolean;
}

