import { ApiProperty } from '@nestjs/swagger';
import { Product, ProductSegment, ProductStatus } from '../entities/product.entity';

export class ProductResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  proposalDescription: string;

  @ApiProperty({ enum: ProductSegment })
  segment: ProductSegment;

  @ApiProperty()
  category1: string;

  @ApiProperty()
  category2: string;

  @ApiProperty({ required: false })
  technicalSpecs?: Record<string, any>;

  @ApiProperty()
  cost: number;

  @ApiProperty()
  saleValue: number;

  @ApiProperty({ enum: ProductStatus })
  status: ProductStatus;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(product: Product) {
    this.id = product.id;
    this.code = product.code;
    this.description = product.description;
    this.proposalDescription = product.proposalDescription;
    this.segment = product.segment;
    this.category1 = product.category1;
    this.category2 = product.category2;
    this.technicalSpecs = product.technicalSpecs;
    this.cost = product.cost;
    this.saleValue = product.saleValue;
    this.status = product.status;
    this.createdAt = product.createdAt;
    this.updatedAt = product.updatedAt;
  }
}

