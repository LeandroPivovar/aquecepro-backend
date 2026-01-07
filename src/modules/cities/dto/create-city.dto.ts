import { IsString, IsNotEmpty, IsNumber, IsArray, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Month } from '../entities/city-monthly-data.entity';

export class MonthlyDataDto {
  @ApiProperty({ enum: Month, example: Month.JANUARY })
  @IsString()
  @IsNotEmpty()
  month: Month;

  @ApiProperty({ example: 24.5 })
  @IsNumber()
  @Min(-50)
  @Max(50)
  temperature: number;

  @ApiProperty({ example: 5.2 })
  @IsNumber()
  @Min(0)
  @Max(20)
  solarRadiation: number;

  @ApiProperty({ example: 3.5 })
  @IsNumber()
  @Min(0)
  @Max(50)
  windSpeed: number;
}

export class CreateCityDto {
  @ApiProperty({ example: 'São Paulo' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: -23.550520 })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({ type: [MonthlyDataDto], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MonthlyDataDto)
  monthlyData?: MonthlyDataDto[];
}

