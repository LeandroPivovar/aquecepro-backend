import { PartialType } from '@nestjs/swagger';
import { CreateProposalDto } from './create-proposal.dto';
import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProposalDto extends PartialType(CreateProposalDto) {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  status?: string;
}


