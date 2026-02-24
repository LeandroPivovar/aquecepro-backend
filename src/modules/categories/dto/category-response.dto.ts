import { ApiProperty } from '@nestjs/swagger';
import { Category, CategoryType, CategoryStatus } from '../entities/category.entity';

export class CategoryResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: CategoryType })
  type: CategoryType;

  @ApiProperty()
  segment: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ enum: CategoryStatus })
  status: CategoryStatus;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: false })
  parentId?: string;

  @ApiProperty({ required: false })
  parentName?: string;

  @ApiProperty({ required: false })
  productsCount?: number;

  constructor(category: Category, productsCount?: number) {
    this.id = category.id;
    this.name = category.name;
    this.type = category.type;
    this.segment = category.segment;
    this.description = category.description;
    this.status = category.status;
    this.createdAt = category.createdAt;
    this.updatedAt = category.updatedAt;

    if (category.parent) {
      this.parentId = category.parent.id;
      this.parentName = category.parent.name;
    } else if (category.parentId) {
      this.parentId = category.parentId;
    }

    this.productsCount = productsCount;
  }
}

