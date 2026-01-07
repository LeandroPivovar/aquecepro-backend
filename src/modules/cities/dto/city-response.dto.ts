import { ApiProperty } from '@nestjs/swagger';
import { City } from '../entities/city.entity';
import { CityMonthlyData } from '../entities/city-monthly-data.entity';

export class MonthlyDataResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  month: string;

  @ApiProperty()
  temperature: number;

  @ApiProperty()
  solarRadiation: number;

  @ApiProperty()
  windSpeed: number;

  constructor(data: CityMonthlyData) {
    this.id = data.id;
    this.month = data.month;
    this.temperature = data.temperature;
    this.solarRadiation = data.solarRadiation;
    this.windSpeed = data.windSpeed;
  }
}

export class CityResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  latitude: number;

  @ApiProperty({ type: [MonthlyDataResponseDto] })
  monthlyData: MonthlyDataResponseDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(city: City) {
    this.id = city.id;
    this.name = city.name;
    this.latitude = city.latitude;
    this.monthlyData = city.monthlyData
      ? city.monthlyData.map((data) => new MonthlyDataResponseDto(data))
      : [];
    this.createdAt = city.createdAt;
    this.updatedAt = city.updatedAt;
  }
}

