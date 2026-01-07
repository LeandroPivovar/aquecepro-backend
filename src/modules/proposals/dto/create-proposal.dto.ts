import { IsEnum, IsOptional, IsString, IsObject, IsBoolean, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ProposalSegment } from '../entities/proposal.entity';

class ClientDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  isNew?: boolean;
}

export class CreateProposalDto {
  @ApiProperty({ enum: ProposalSegment, example: ProposalSegment.RESIDENTIAL })
  @IsEnum(ProposalSegment)
  segment: ProposalSegment;

  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => ClientDto)
  client?: ClientDto;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ description: 'Dados específicos do segmento (piscina ou residencial)' })
  @IsObject()
  data: Record<string, any>;
}


