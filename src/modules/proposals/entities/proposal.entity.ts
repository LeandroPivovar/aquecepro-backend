import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Appointment } from '../../appointments/entities/appointment.entity';

export enum ProposalSegment {
  POOL = 'piscina',
  RESIDENTIAL = 'residencial',
}

@Entity('proposals')
export class Proposal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ProposalSegment,
  })
  segment: ProposalSegment;

  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Cliente (pode ser novo ou existente)
  @Column({ name: 'client_id', nullable: true })
  clientId: string;

  @Column({ name: 'client_name', nullable: true })
  clientName: string;

  @Column({ name: 'client_phone', nullable: true })
  clientPhone: string;

  @Column({ name: 'is_new_client', default: false })
  isNewClient: boolean;

  // Cidade
  @Column({ nullable: true })
  city: string;

  // Dados específicos por segmento (JSON)
  @Column('json', { nullable: true })
  data: Record<string, any>;

  // Status da proposta
  @Column({ default: 'draft' })
  status: string;

  // Relação com agendamento (opcional)
  @Column({ name: 'appointment_id', nullable: true })
  appointmentId: string;

  @ManyToOne(() => Appointment, { nullable: true })
  @JoinColumn({ name: 'appointment_id' })
  appointment: Appointment;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

