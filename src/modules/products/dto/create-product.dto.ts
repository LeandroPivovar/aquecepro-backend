import { IsString, IsNotEmpty, IsEnum, IsNumber, IsOptional, IsObject, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProductSegment, ProductStatus } from '../entities/product.entity';

export class CreateProductDto {
  @ApiProperty({ example: 'AQS-200-BP' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'Aquecedor Solar 200L' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'Aquecedor Solar 200L - Descrição para proposta' })
  @IsString()
  @IsNotEmpty()
  proposalDescription: string;

  @ApiProperty({ enum: ProductSegment, example: ProductSegment.RESIDENTIAL })
  @IsEnum(ProductSegment)
  segment: ProductSegment;

  @ApiProperty({ example: 'Equipamentos' })
  @IsString()
  @IsNotEmpty()
  category1: string;

  @ApiProperty({ example: 'Aquecedor a gás' })
  @IsString()
  @IsNotEmpty()
  category2: string;

  @ApiProperty({ required: false, description: 'Especificações técnicas do produto' })
  @IsOptional()
  @IsObject()
  technicalSpecs?: Record<string, any>;

  @ApiProperty({ example: 1500.0 })
  @IsNumber()
  @Min(0)
  cost: number;

  @ApiProperty({ example: 2500.0 })
  @IsNumber()
  @Min(0)
  saleValue: number;

  @ApiProperty({ enum: ProductStatus, required: false, default: ProductStatus.ACTIVE })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;
}

