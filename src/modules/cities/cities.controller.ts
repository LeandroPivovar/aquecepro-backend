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
import { CitiesService } from './cities.service';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import { CityResponseDto } from './dto/city-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Cities')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cities')
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma nova cidade' })
  @ApiResponse({ status: 201, description: 'Cidade criada com sucesso', type: CityResponseDto })
  @ApiResponse({ status: 409, description: 'Cidade já existe' })
  create(@Body() createCityDto: CreateCityDto): Promise<CityResponseDto> {
    return this.citiesService.create(createCityDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as cidades' })
  @ApiResponse({ status: 200, description: 'Lista de cidades', type: [CityResponseDto] })
  findAll(): Promise<CityResponseDto[]> {
    return this.citiesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar cidade por ID' })
  @ApiResponse({ status: 200, description: 'Cidade encontrada', type: CityResponseDto })
  @ApiResponse({ status: 404, description: 'Cidade não encontrada' })
  findOne(@Param('id') id: string): Promise<CityResponseDto> {
    return this.citiesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar cidade' })
  @ApiResponse({ status: 200, description: 'Cidade atualizada', type: CityResponseDto })
  @ApiResponse({ status: 404, description: 'Cidade não encontrada' })
  update(@Param('id') id: string, @Body() updateCityDto: UpdateCityDto): Promise<CityResponseDto> {
    return this.citiesService.update(id, updateCityDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover cidade' })
  @ApiResponse({ status: 200, description: 'Cidade removida' })
  @ApiResponse({ status: 404, description: 'Cidade não encontrada' })
  remove(@Param('id') id: string): Promise<void> {
    return this.citiesService.remove(id);
  }
}

