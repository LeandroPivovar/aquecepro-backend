import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CategorySegment, CategoryStatus } from '../entities/category.entity';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Aquecedores Solares' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: CategorySegment, example: CategorySegment.RESIDENTIAL })
  @IsEnum(CategorySegment)
  segment: CategorySegment;

  @ApiProperty({ example: 'Sistemas completos de aquecimento solar', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: CategoryStatus, required: false, default: CategoryStatus.ACTIVE })
  @IsOptional()
  @IsEnum(CategoryStatus)
  status?: CategoryStatus;
}

