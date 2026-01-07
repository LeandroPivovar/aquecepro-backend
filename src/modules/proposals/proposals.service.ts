import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proposal } from './entities/proposal.entity';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { UpdateProposalDto } from './dto/update-proposal.dto';
import { ProposalResponseDto } from './dto/proposal-response.dto';
import { Appointment } from '../appointments/entities/appointment.entity';

@Injectable()
export class ProposalsService {
  constructor(
    @InjectRepository(Proposal)
    private proposalsRepository: Repository<Proposal>,
    @InjectRepository(Appointment)
    private appointmentsRepository: Repository<Appointment>,
  ) {}

  async create(createProposalDto: CreateProposalDto, userId?: string): Promise<ProposalResponseDto> {
    const proposal = this.proposalsRepository.create({
      ...createProposalDto,
      userId: userId || null,
      clientId: createProposalDto.client?.id || null,
      clientName: createProposalDto.client?.name || null,
      clientPhone: createProposalDto.client?.phone || null,
      isNewClient: createProposalDto.client?.isNew || false,
      city: createProposalDto.city || null,
      data: createProposalDto.data || {},
      status: 'draft',
    });

    const savedProposal = await this.proposalsRepository.save(proposal);
    return new ProposalResponseDto(savedProposal);
  }

  async findAll(userId?: string): Promise<ProposalResponseDto[]> {
    const where: any = {};
    if (userId) {
      where.userId = userId;
    }

    const proposals = await this.proposalsRepository.find({
      where,
      order: { createdAt: 'DESC' },
      relations: ['user'],
    });

    return proposals.map((proposal) => new ProposalResponseDto(proposal));
  }

  async findOne(id: string): Promise<ProposalResponseDto> {
    const proposal = await this.proposalsRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!proposal) {
      throw new NotFoundException(`Proposta com ID ${id} não encontrada`);
    }

    return new ProposalResponseDto(proposal);
  }

  async update(id: string, updateProposalDto: UpdateProposalDto): Promise<ProposalResponseDto> {
    const proposal = await this.proposalsRepository.findOne({ where: { id } });

    if (!proposal) {
      throw new NotFoundException(`Proposta com ID ${id} não encontrada`);
    }

    // Atualizar campos do cliente se fornecidos
    if (updateProposalDto.client) {
      proposal.clientId = updateProposalDto.client.id || proposal.clientId;
      proposal.clientName = updateProposalDto.client.name || proposal.clientName;
      proposal.clientPhone = updateProposalDto.client.phone || proposal.clientPhone;
      proposal.isNewClient = updateProposalDto.client.isNew ?? proposal.isNewClient;
    }

    if (updateProposalDto.city !== undefined) {
      proposal.city = updateProposalDto.city;
    }

    if (updateProposalDto.data) {
      proposal.data = { ...proposal.data, ...updateProposalDto.data };
    }

    if (updateProposalDto.status) {
      proposal.status = updateProposalDto.status;
    }

    const updatedProposal = await this.proposalsRepository.save(proposal);
    return new ProposalResponseDto(updatedProposal);
  }

  async remove(id: string): Promise<void> {
    const proposal = await this.proposalsRepository.findOne({ where: { id } });

    if (!proposal) {
      throw new NotFoundException(`Proposta com ID ${id} não encontrada`);
    }

    await this.proposalsRepository.remove(proposal);
  }

  async close(id: string): Promise<ProposalResponseDto> {
    const proposal = await this.proposalsRepository.findOne({
      where: { id },
      relations: ['appointment'],
    });

    if (!proposal) {
      throw new NotFoundException(`Proposta com ID ${id} não encontrada`);
    }

    if (!proposal.appointmentId) {
      throw new BadRequestException('Não é possível fechar uma proposta sem agendamento relacionado');
    }

    // Verificar se o agendamento existe
    const appointment = await this.appointmentsRepository.findOne({
      where: { id: proposal.appointmentId },
    });

    if (!appointment) {
      throw new NotFoundException('Agendamento relacionado não encontrado');
    }

    proposal.status = 'approved';
    const updatedProposal = await this.proposalsRepository.save(proposal);
    return new ProposalResponseDto(updatedProposal);
  }

  async cancel(id: string): Promise<ProposalResponseDto> {
    const proposal = await this.proposalsRepository.findOne({ where: { id } });

    if (!proposal) {
      throw new NotFoundException(`Proposta com ID ${id} não encontrada`);
    }

    if (proposal.status === 'cancelled') {
      throw new BadRequestException('Proposta já está cancelada');
    }

    proposal.status = 'cancelled';
    const updatedProposal = await this.proposalsRepository.save(proposal);
    return new ProposalResponseDto(updatedProposal);
  }
}

