import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { ProposalsService } from './proposals.service';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { UpdateProposalDto } from './dto/update-proposal.dto';
import { ProposalResponseDto } from './dto/proposal-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Proposals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('proposals')
export class ProposalsController {
  constructor(private readonly proposalsService: ProposalsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma nova proposta' })
  @ApiResponse({ status: 201, description: 'Proposta criada com sucesso', type: ProposalResponseDto })
  create(@Body() createProposalDto: CreateProposalDto, @Request() req): Promise<ProposalResponseDto> {
    const userId = req.user?.id;
    return this.proposalsService.create(createProposalDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as propostas' })
  @ApiResponse({ status: 200, description: 'Lista de propostas', type: [ProposalResponseDto] })
  findAll(@Request() req): Promise<ProposalResponseDto[]> {
    const userId = req.user?.id;
    // Se for admin ou manager, retorna todas. Caso contrário, retorna apenas as do usuário
    const isAdminOrManager = req.user?.role === 'admin' || req.user?.role === 'manager';
    return this.proposalsService.findAll(isAdminOrManager ? undefined : userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar proposta por ID' })
  @ApiResponse({ status: 200, description: 'Proposta encontrada', type: ProposalResponseDto })
  @ApiResponse({ status: 404, description: 'Proposta não encontrada' })
  findOne(@Param('id') id: string): Promise<ProposalResponseDto> {
    return this.proposalsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar proposta' })
  @ApiResponse({ status: 200, description: 'Proposta atualizada', type: ProposalResponseDto })
  @ApiResponse({ status: 404, description: 'Proposta não encontrada' })
  update(@Param('id') id: string, @Body() updateProposalDto: UpdateProposalDto): Promise<ProposalResponseDto> {
    return this.proposalsService.update(id, updateProposalDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover proposta' })
  @ApiResponse({ status: 200, description: 'Proposta removida' })
  @ApiResponse({ status: 404, description: 'Proposta não encontrada' })
  remove(@Param('id') id: string): Promise<void> {
    return this.proposalsService.remove(id);
  }

  @Patch(':id/close')
  @ApiOperation({ summary: 'Fechar proposta (requer agendamento relacionado)' })
  @ApiResponse({ status: 200, description: 'Proposta fechada com sucesso', type: ProposalResponseDto })
  @ApiResponse({ status: 404, description: 'Proposta não encontrada' })
  @ApiResponse({ status: 400, description: 'Proposta não possui agendamento relacionado' })
  close(@Param('id') id: string): Promise<ProposalResponseDto> {
    return this.proposalsService.close(id);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancelar proposta' })
  @ApiResponse({ status: 200, description: 'Proposta cancelada com sucesso', type: ProposalResponseDto })
  @ApiResponse({ status: 404, description: 'Proposta não encontrada' })
  @ApiResponse({ status: 400, description: 'Proposta já está cancelada' })
  cancel(@Param('id') id: string): Promise<ProposalResponseDto> {
    return this.proposalsService.cancel(id);
  }
}

