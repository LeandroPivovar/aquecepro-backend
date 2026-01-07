import { ApiProperty } from '@nestjs/swagger';
import { Category, CategorySegment, CategoryStatus } from '../entities/category.entity';

export class CategoryResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: CategorySegment })
  segment: CategorySegment;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ enum: CategoryStatus })
  status: CategoryStatus;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: false })
  productsCount?: number;

  constructor(category: Category, productsCount?: number) {
    this.id = category.id;
    this.name = category.name;
    this.segment = category.segment;
    this.description = category.description;
    this.status = category.status;
    this.createdAt = category.createdAt;
    this.updatedAt = category.updatedAt;
    this.productsCount = productsCount;
  }
}

