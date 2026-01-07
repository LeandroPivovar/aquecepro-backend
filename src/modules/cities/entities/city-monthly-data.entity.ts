import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { City } from './city.entity';

export enum Month {
  JANUARY = 'Janeiro',
  FEBRUARY = 'Fevereiro',
  MARCH = 'Março',
  APRIL = 'Abril',
  MAY = 'Maio',
  JUNE = 'Junho',
  JULY = 'Julho',
  AUGUST = 'Agosto',
  SEPTEMBER = 'Setembro',
  OCTOBER = 'Outubro',
  NOVEMBER = 'Novembro',
  DECEMBER = 'Dezembro',
}

@Entity('city_monthly_data')
export class CityMonthlyData {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'city_id' })
  cityId: string;

  @ManyToOne(() => City, (city) => city.monthlyData, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'city_id' })
  city: City;

  @Column({
    type: 'enum',
    enum: Month,
  })
  month: Month;

  @Column('decimal', { precision: 5, scale: 2 })
  temperature: number;

  @Column('decimal', { name: 'solar_radiation', precision: 5, scale: 2 })
  solarRadiation: number;

  @Column('decimal', { name: 'wind_speed', precision: 5, scale: 2 })
  windSpeed: number;
}

