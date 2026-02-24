import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CategoryType, CategoryStatus } from '../entities/category.entity';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Aquecedores Solares' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: CategoryType, example: CategoryType.CATEGORIA_1, required: false, default: CategoryType.CATEGORIA_1 })
  @IsOptional()
  @IsEnum(CategoryType)
  type?: CategoryType;

  @ApiProperty({ example: 'Residencial' })
  @IsString()
  @IsNotEmpty()
  segment: string;

  @ApiProperty({ example: 'Sistemas completos de aquecimento solar', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'uuid-of-parent-category', required: false })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiProperty({ enum: CategoryStatus, required: false, default: CategoryStatus.ACTIVE })
  @IsOptional()
  @IsEnum(CategoryStatus)
  status?: CategoryStatus;
}

