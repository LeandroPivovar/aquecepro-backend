import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Appointment, AppointmentStatus, AppointmentChannel } from './entities/appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { AppointmentResponseDto } from './dto/appointment-response.dto';
import { Store } from '../stores/entities/store.entity';
import { User, UserRole } from '../users/entities/user.entity';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentsRepository: Repository<Appointment>,
    @InjectRepository(Store)
    private storesRepository: Repository<Store>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createAppointmentDto: CreateAppointmentDto): Promise<AppointmentResponseDto> {
    // Verificar se a loja existe
    const store = await this.storesRepository.findOne({
      where: { id: createAppointmentDto.storeId },
    });

    if (!store) {
      throw new NotFoundException(`Loja com ID ${createAppointmentDto.storeId} não encontrada`);
    }

    // Verificar se o cliente existe
    const client = await this.usersRepository.findOne({
      where: { id: createAppointmentDto.clientId },
    });

    if (!client) {
      throw new NotFoundException(`Cliente com ID ${createAppointmentDto.clientId} não encontrado`);
    }

    // Verificar se o vendedor existe (se fornecido)
    if (createAppointmentDto.sellerId) {
      const seller = await this.usersRepository.findOne({
        where: { id: createAppointmentDto.sellerId },
      });

      if (!seller) {
        throw new NotFoundException(`Vendedor com ID ${createAppointmentDto.sellerId} não encontrado`);
      }
    }

    // Se autoAssign estiver ativo, buscar vendedor disponível da loja
    let sellerId = createAppointmentDto.sellerId;
    if (createAppointmentDto.autoAssign && !sellerId) {
      const availableSeller = await this.findAvailableSeller(createAppointmentDto.storeId, createAppointmentDto.date, createAppointmentDto.time);
      sellerId = availableSeller?.id;
    }

    const appointment = this.appointmentsRepository.create({
      ...createAppointmentDto,
      date: new Date(createAppointmentDto.date),
      sellerId,
      status: createAppointmentDto.status || AppointmentStatus.SCHEDULED,
      channel: createAppointmentDto.channel || AppointmentChannel.PRESENCIAL,
      duration: createAppointmentDto.duration || 60,
      autoAssign: createAppointmentDto.autoAssign || false,
    });

    const savedAppointment = await this.appointmentsRepository.save(appointment);
    const appointmentWithRelations = await this.appointmentsRepository.findOne({
      where: { id: savedAppointment.id },
      relations: ['store', 'seller', 'client'],
    });

    if (!appointmentWithRelations) {
      throw new NotFoundException('Erro ao criar agendamento');
    }

    return new AppointmentResponseDto(appointmentWithRelations);
  }

  async findAll(): Promise<AppointmentResponseDto[]> {
    const appointments = await this.appointmentsRepository.find({
      relations: ['store', 'seller', 'client'],
      order: { date: 'ASC', time: 'ASC' },
    });

    return appointments.map((appointment) => new AppointmentResponseDto(appointment));
  }

  async findOne(id: string): Promise<AppointmentResponseDto> {
    const appointment = await this.appointmentsRepository.findOne({
      where: { id },
      relations: ['store', 'seller', 'client'],
    });

    if (!appointment) {
      throw new NotFoundException(`Agendamento com ID ${id} não encontrado`);
    }

    return new AppointmentResponseDto(appointment);
  }

  async update(id: string, updateAppointmentDto: UpdateAppointmentDto): Promise<AppointmentResponseDto> {
    const appointment = await this.appointmentsRepository.findOne({
      where: { id },
      relations: ['store', 'seller', 'client'],
    });

    if (!appointment) {
      throw new NotFoundException(`Agendamento com ID ${id} não encontrado`);
    }

    // Verificar se a loja existe (se fornecida)
    if (updateAppointmentDto.storeId && updateAppointmentDto.storeId !== appointment.storeId) {
      const store = await this.storesRepository.findOne({
        where: { id: updateAppointmentDto.storeId },
      });

      if (!store) {
        throw new NotFoundException(`Loja com ID ${updateAppointmentDto.storeId} não encontrada`);
      }
    }

    // Verificar se o cliente existe (se fornecido)
    if (updateAppointmentDto.clientId && updateAppointmentDto.clientId !== appointment.clientId) {
      const client = await this.usersRepository.findOne({
        where: { id: updateAppointmentDto.clientId },
      });

      if (!client) {
        throw new NotFoundException(`Cliente com ID ${updateAppointmentDto.clientId} não encontrado`);
      }
    }

    // Verificar se o vendedor existe (se fornecido)
    if (updateAppointmentDto.sellerId && updateAppointmentDto.sellerId !== appointment.sellerId) {
      const seller = await this.usersRepository.findOne({
        where: { id: updateAppointmentDto.sellerId },
      });

      if (!seller) {
        throw new NotFoundException(`Vendedor com ID ${updateAppointmentDto.sellerId} não encontrado`);
      }
    }

    // Se autoAssign estiver ativo e não houver sellerId, buscar vendedor disponível
    if (updateAppointmentDto.autoAssign && !updateAppointmentDto.sellerId) {
      const date = updateAppointmentDto.date ? new Date(updateAppointmentDto.date) : appointment.date;
      const time = updateAppointmentDto.time || appointment.time;
      const storeId = updateAppointmentDto.storeId || appointment.storeId;
      const availableSeller = await this.findAvailableSeller(storeId, date, time);
      updateAppointmentDto.sellerId = availableSeller?.id;
    }

    if (updateAppointmentDto.date) {
      appointment.date = new Date(updateAppointmentDto.date);
    }

    Object.assign(appointment, {
      ...updateAppointmentDto,
      date: updateAppointmentDto.date ? new Date(updateAppointmentDto.date) : appointment.date,
    });

    const updatedAppointment = await this.appointmentsRepository.save(appointment);
    const appointmentWithRelations = await this.appointmentsRepository.findOne({
      where: { id: updatedAppointment.id },
      relations: ['store', 'seller', 'client'],
    });

    if (!appointmentWithRelations) {
      throw new NotFoundException('Erro ao atualizar agendamento');
    }

    return new AppointmentResponseDto(appointmentWithRelations);
  }

  async remove(id: string): Promise<void> {
    const appointment = await this.appointmentsRepository.findOne({ where: { id } });

    if (!appointment) {
      throw new NotFoundException(`Agendamento com ID ${id} não encontrado`);
    }

    await this.appointmentsRepository.remove(appointment);
  }

  private async findAvailableSeller(
    storeId: string,
    date: Date | string,
    time: string,
  ): Promise<User | null> {
    // Buscar vendedores da loja
    const sellers = await this.usersRepository.find({
      where: {
        storeId,
        role: UserRole.SELLER,
        isActive: true,
      },
    });

    if (sellers.length === 0) {
      return null;
    }

    // Por enquanto, retornar o primeiro vendedor disponível
    // No futuro, pode implementar lógica de rodízio baseada em agendamentos existentes
    // Verificar se há agendamentos no mesmo horário para evitar conflitos
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const sellerIds = sellers.map(s => s.id);
    const existingAppointments = await this.appointmentsRepository.find({
      where: {
        date: dateObj,
        time,
        sellerId: In(sellerIds),
      },
    });

    // Filtrar vendedores que já têm agendamento no mesmo horário
    const busySellerIds = existingAppointments.map(a => a.sellerId).filter(Boolean);
    const availableSellers = sellers.filter(s => !busySellerIds.includes(s.id));

    // Retornar o primeiro vendedor disponível, ou o primeiro se todos estiverem ocupados
    return availableSellers.length > 0 ? availableSellers[0] : sellers[0];
  }
}

