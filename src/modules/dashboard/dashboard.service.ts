import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual } from 'typeorm';
import { Proposal } from '../proposals/entities/proposal.entity';
import { Appointment, AppointmentStatus } from '../appointments/entities/appointment.entity';
import { User, UserRole } from '../users/entities/user.entity';
import {
  DashboardStatsDto,
  ConversionRateDto,
  ProposalStatsDto,
  UpcomingAppointmentDto,
  SellerRankingDto,
} from './dto/dashboard-stats.dto';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Proposal)
    private proposalsRepository: Repository<Proposal>,
    @InjectRepository(Appointment)
    private appointmentsRepository: Repository<Appointment>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async getStats(): Promise<DashboardStatsDto> {
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixtyDaysAgo = new Date(now);
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    // Propostas emitidas (este mês)
    const proposalsIssuedCurrent = await this.proposalsRepository.count({
      where: {
        createdAt: MoreThanOrEqual(startOfCurrentMonth),
      },
    });

    const proposalsIssuedPrevious = await this.proposalsRepository.count({
      where: {
        createdAt: Between(startOfPreviousMonth, endOfPreviousMonth),
      },
    });

    // Propostas fechadas (status: approved ou completed)
    const proposalsClosedCurrent = await this.proposalsRepository.count({
      where: [
        { status: 'approved', updatedAt: MoreThanOrEqual(startOfCurrentMonth) },
        { status: 'completed', updatedAt: MoreThanOrEqual(startOfCurrentMonth) },
      ],
    });

    const proposalsClosedPrevious = await this.proposalsRepository.count({
      where: [
        { status: 'approved', updatedAt: Between(startOfPreviousMonth, endOfPreviousMonth) },
        { status: 'completed', updatedAt: Between(startOfPreviousMonth, endOfPreviousMonth) },
      ],
    });

    // Propostas canceladas
    const proposalsCancelledCurrent = await this.proposalsRepository.count({
      where: {
        status: 'cancelled',
        updatedAt: MoreThanOrEqual(startOfCurrentMonth),
      },
    });

    const proposalsCancelledPrevious = await this.proposalsRepository.count({
      where: {
        status: 'cancelled',
        updatedAt: Between(startOfPreviousMonth, endOfPreviousMonth),
      },
    });

    // Taxa de conversão (últimos 30 dias)
    const proposalsLast30Days = await this.proposalsRepository.count({
      where: {
        createdAt: MoreThanOrEqual(thirtyDaysAgo),
      },
    });

    const closedLast30Days = await this.proposalsRepository.count({
      where: [
        { status: 'approved', updatedAt: MoreThanOrEqual(thirtyDaysAgo) },
        { status: 'completed', updatedAt: MoreThanOrEqual(thirtyDaysAgo) },
      ],
    });

    const conversionRateCurrent = proposalsLast30Days > 0 
      ? (closedLast30Days / proposalsLast30Days) * 100 
      : 0;

    const proposalsPrevious30Days = await this.proposalsRepository.count({
      where: {
        createdAt: Between(sixtyDaysAgo, thirtyDaysAgo),
      },
    });

    const closedPrevious30Days = await this.proposalsRepository.count({
      where: [
        { status: 'approved', updatedAt: Between(sixtyDaysAgo, thirtyDaysAgo) },
        { status: 'completed', updatedAt: Between(sixtyDaysAgo, thirtyDaysAgo) },
      ],
    });

    const conversionRatePrevious = proposalsPrevious30Days > 0
      ? (closedPrevious30Days / proposalsPrevious30Days) * 100
      : 0;

    // Próximos agendamentos (próximos 4)
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const upcomingAppointments = await this.appointmentsRepository.find({
      where: {
        date: MoreThanOrEqual(today),
        status: AppointmentStatus.SCHEDULED,
      },
      relations: ['store', 'seller', 'client'],
      order: { date: 'ASC', time: 'ASC' },
      take: 4,
    });

    // Ranking de vendedores
    const sellers = await this.usersRepository.find({
      where: {
        role: UserRole.SELLER,
        isActive: true,
      },
    });

    const sellerRankingPromises = sellers.map(async (seller) => {
      const appointments = await this.appointmentsRepository.count({
        where: {
          sellerId: seller.id,
        },
      });

      const proposals = await this.proposalsRepository.count({
        where: {
          userId: seller.id,
        },
      });

      const closed = await this.proposalsRepository.count({
        where: [
          { userId: seller.id, status: 'approved' },
          { userId: seller.id, status: 'completed' },
        ],
      });

      const conversionRate = proposals > 0 ? (closed / proposals) * 100 : 0;

      return {
        sellerId: seller.id,
        sellerName: seller.name,
        appointments,
        proposals,
        closed,
        conversionRate: Math.round(conversionRate * 10) / 10, // Arredondar para 1 casa decimal
      };
    });

    const sellerRanking = await Promise.all(sellerRankingPromises);
    sellerRanking.sort((a, b) => b.conversionRate - a.conversionRate);

    // Calcular variações
    const calculateChange = (current: number, previous: number): { change: number; isPositive: boolean } => {
      if (previous === 0) {
        return { change: current > 0 ? 100 : 0, isPositive: current > 0 };
      }
      const change = ((current - previous) / previous) * 100;
      return { change: Math.round(change * 10) / 10, isPositive: change >= 0 };
    };

    const conversionRateChange = calculateChange(conversionRateCurrent, conversionRatePrevious);
    const proposalsIssuedChange = calculateChange(proposalsIssuedCurrent, proposalsIssuedPrevious);
    const proposalsClosedChange = calculateChange(proposalsClosedCurrent, proposalsClosedPrevious);
    const proposalsCancelledChange = calculateChange(proposalsCancelledCurrent, proposalsCancelledPrevious);

    return {
      conversionRate: {
        current: Math.round(conversionRateCurrent * 10) / 10,
        previous: Math.round(conversionRatePrevious * 10) / 10,
        ...conversionRateChange,
      },
      proposalsIssued: {
        current: proposalsIssuedCurrent,
        previous: proposalsIssuedPrevious,
        ...proposalsIssuedChange,
      },
      proposalsClosed: {
        current: proposalsClosedCurrent,
        previous: proposalsClosedPrevious,
        ...proposalsClosedChange,
      },
      proposalsCancelled: {
        current: proposalsCancelledCurrent,
        previous: proposalsCancelledPrevious,
        ...proposalsCancelledChange,
      },
      upcomingAppointments: upcomingAppointments.map((apt) => ({
        id: apt.id,
        clientName: apt.client?.name || 'Cliente não informado',
        storeName: apt.store?.name || 'Loja não informada',
        sellerName: apt.seller?.name || 'Vendedor não informado',
        date: apt.date.toISOString().split('T')[0],
        time: apt.time,
      })),
      sellerRanking: sellerRanking.slice(0, 5).map((seller) => ({
        sellerId: seller.sellerId,
        sellerName: seller.sellerName,
        appointments: seller.appointments,
        proposals: seller.proposals,
        closed: seller.closed,
        conversionRate: seller.conversionRate,
      })),
    };
  }
}

