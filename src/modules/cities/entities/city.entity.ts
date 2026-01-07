import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { CityMonthlyData } from './city-monthly-data.entity';

@Entity('cities')
export class City {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column('decimal', { precision: 10, scale: 7 })
  latitude: number;

  @OneToMany(() => CityMonthlyData, (monthlyData) => monthlyData.city, {
    cascade: true,
    eager: true,
  })
  monthlyData: CityMonthlyData[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

