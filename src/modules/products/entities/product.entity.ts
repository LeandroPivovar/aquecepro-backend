import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ProductSegment {
  RESIDENTIAL = 'Residencial',
  COMMERCIAL = 'Comercial',
}

export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  code: string;

  @Column()
  description: string;

  @Column({ name: 'proposal_description' })
  proposalDescription: string;

  @Column({
    type: 'enum',
    enum: ProductSegment,
  })
  segment: ProductSegment;

  @Column({ name: 'category_1' })
  category1: string;

  @Column({ name: 'category_2' })
  category2: string;

  @Column('json', { nullable: true })
  technicalSpecs: Record<string, any>;

  @Column('decimal', { precision: 10, scale: 2 })
  cost: number;

  @Column('decimal', { name: 'sale_value', precision: 10, scale: 2 })
  saleValue: number;

  @Column({
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.ACTIVE,
  })
  status: ProductStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

