import { IsString, IsNotEmpty, IsEmail, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { StoreStatus } from '../entities/store.entity';

export class CreateStoreDto {
  @ApiProperty({ example: 'Loja Centro' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'São Paulo - SP' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'Av. Paulista' })
  @IsString()
  @IsNotEmpty()
  street: string;

  @ApiProperty({ example: '1000' })
  @IsString()
  @IsNotEmpty()
  number: string;

  @ApiProperty({ example: 'Sala 101', required: false })
  @IsOptional()
  @IsString()
  complement?: string;

  @ApiProperty({ example: 'Bela Vista' })
  @IsString()
  @IsNotEmpty()
  neighborhood: string;

  @ApiProperty({ example: '01310-100' })
  @IsString()
  @IsNotEmpty()
  zipCode: string;

  @ApiProperty({ example: '(11) 3333-4444' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'loja@email.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Seg a Sex 8h-18h, Sáb 8h-12h' })
  @IsString()
  @IsNotEmpty()
  openingHours: string;

  @ApiProperty({ example: 'uuid-do-gerente', required: false })
  @IsOptional()
  @IsString()
  managerId?: string;

  @ApiProperty({ enum: StoreStatus, required: false, default: StoreStatus.ACTIVE })
  @IsOptional()
  @IsEnum(StoreStatus)
  status?: StoreStatus;
}

