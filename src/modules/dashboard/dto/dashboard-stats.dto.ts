import { ApiProperty } from '@nestjs/swagger';

export class ConversionRateDto {
  @ApiProperty({ description: 'Taxa de conversão atual' })
  current: number;

  @ApiProperty({ description: 'Taxa de conversão do período anterior' })
  previous: number;

  @ApiProperty({ description: 'Variação percentual' })
  change: number;

  @ApiProperty({ description: 'Se a variação é positiva' })
  isPositive: boolean;
}

export class ProposalStatsDto {
  @ApiProperty({ description: 'Total de propostas emitidas no período atual' })
  current: number;

  @ApiProperty({ description: 'Total de propostas emitidas no período anterior' })
  previous: number;

  @ApiProperty({ description: 'Variação percentual' })
  change: number;

  @ApiProperty({ description: 'Se a variação é positiva' })
  isPositive: boolean;
}

export class UpcomingAppointmentDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  clientName: string;

  @ApiProperty()
  storeName: string;

  @ApiProperty()
  sellerName: string;

  @ApiProperty()
  date: string;

  @ApiProperty()
  time: string;
}

export class SellerRankingDto {
  @ApiProperty()
  sellerId: string;

  @ApiProperty()
  sellerName: string;

  @ApiProperty()
  appointments: number;

  @ApiProperty()
  proposals: number;

  @ApiProperty()
  closed: number;

  @ApiProperty()
  conversionRate: number;
}

export class DashboardStatsDto {
  @ApiProperty({ type: ConversionRateDto })
  conversionRate: ConversionRateDto;

  @ApiProperty({ type: ProposalStatsDto })
  proposalsIssued: ProposalStatsDto;

  @ApiProperty({ type: ProposalStatsDto })
  proposalsClosed: ProposalStatsDto;

  @ApiProperty({ type: ProposalStatsDto })
  proposalsCancelled: ProposalStatsDto;

  @ApiProperty({ type: [UpcomingAppointmentDto] })
  upcomingAppointments: UpcomingAppointmentDto[];

  @ApiProperty({ type: [SellerRankingDto] })
  sellerRanking: SellerRankingDto[];
}


