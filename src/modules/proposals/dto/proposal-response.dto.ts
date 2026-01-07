import { ApiProperty } from '@nestjs/swagger';
import { Proposal, ProposalSegment } from '../entities/proposal.entity';

export class ProposalResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: ProposalSegment })
  segment: ProposalSegment;

  @ApiProperty({ required: false })
  userId?: string;

  @ApiProperty({ required: false })
  clientId?: string;

  @ApiProperty({ required: false })
  clientName?: string;

  @ApiProperty({ required: false })
  clientPhone?: string;

  @ApiProperty()
  isNewClient: boolean;

  @ApiProperty({ required: false })
  city?: string;

  @ApiProperty()
  data: Record<string, any>;

  @ApiProperty()
  status: string;

  @ApiProperty({ required: false })
  appointmentId?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(proposal: Proposal) {
    this.id = proposal.id;
    this.segment = proposal.segment;
    this.userId = proposal.userId;
    this.clientId = proposal.clientId;
    this.clientName = proposal.clientName;
    this.clientPhone = proposal.clientPhone;
    this.isNewClient = proposal.isNewClient;
    this.city = proposal.city;
    this.data = proposal.data;
    this.status = proposal.status;
    this.appointmentId = proposal.appointmentId;
    this.createdAt = proposal.createdAt;
    this.updatedAt = proposal.updatedAt;
  }
}

