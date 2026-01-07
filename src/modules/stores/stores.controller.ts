import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { StoreResponseDto } from './dto/store-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Stores')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma nova loja' })
  @ApiResponse({ status: 201, description: 'Loja criada com sucesso', type: StoreResponseDto })
  @ApiResponse({ status: 409, description: 'Loja já existe' })
  create(@Body() createStoreDto: CreateStoreDto): Promise<StoreResponseDto> {
    return this.storesService.create(createStoreDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as lojas' })
  @ApiResponse({ status: 200, description: 'Lista de lojas', type: [StoreResponseDto] })
  findAll(): Promise<StoreResponseDto[]> {
    return this.storesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar loja por ID' })
  @ApiResponse({ status: 200, description: 'Loja encontrada', type: StoreResponseDto })
  @ApiResponse({ status: 404, description: 'Loja não encontrada' })
  findOne(@Param('id') id: string): Promise<StoreResponseDto> {
    return this.storesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar loja' })
  @ApiResponse({ status: 200, description: 'Loja atualizada', type: StoreResponseDto })
  @ApiResponse({ status: 404, description: 'Loja não encontrada' })
  update(@Param('id') id: string, @Body() updateStoreDto: UpdateStoreDto): Promise<StoreResponseDto> {
    return this.storesService.update(id, updateStoreDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover loja' })
  @ApiResponse({ status: 200, description: 'Loja removida' })
  @ApiResponse({ status: 404, description: 'Loja não encontrada' })
  remove(@Param('id') id: string): Promise<void> {
    return this.storesService.remove(id);
  }
}

