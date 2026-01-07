import { ApiProperty } from '@nestjs/swagger';
import { Store, StoreStatus } from '../entities/store.entity';

export class StoreResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  city: string;

  @ApiProperty()
  street: string;

  @ApiProperty()
  number: string;

  @ApiProperty({ required: false })
  complement?: string;

  @ApiProperty()
  neighborhood: string;

  @ApiProperty()
  zipCode: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  openingHours: string;

  @ApiProperty({ required: false })
  managerId?: string;

  @ApiProperty({ required: false })
  managerName?: string;

  @ApiProperty({ enum: StoreStatus })
  status: StoreStatus;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: false })
  productsCount?: number;

  constructor(store: Store, productsCount?: number) {
    this.id = store.id;
    this.name = store.name;
    this.city = store.city;
    this.street = store.street;
    this.number = store.number;
    this.complement = store.complement;
    this.neighborhood = store.neighborhood;
    this.zipCode = store.zipCode;
    this.phone = store.phone;
    this.email = store.email;
    this.openingHours = store.openingHours;
    this.managerId = store.managerId;
    this.managerName = store.manager?.name;
    this.status = store.status;
    this.createdAt = store.createdAt;
    this.updatedAt = store.updatedAt;
    this.productsCount = productsCount;
  }
}

