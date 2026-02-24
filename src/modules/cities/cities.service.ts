import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import * as xlsx from 'xlsx';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { City } from './entities/city.entity';
import { CityMonthlyData, Month } from './entities/city-monthly-data.entity';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import { CityResponseDto } from './dto/city-response.dto';

@Injectable()
export class CitiesService {
  constructor(
    @InjectRepository(City)
    private citiesRepository: Repository<City>,
    @InjectRepository(CityMonthlyData)
    private monthlyDataRepository: Repository<CityMonthlyData>,
  ) { }

  async create(createCityDto: CreateCityDto): Promise<CityResponseDto> {
    // Verificar se já existe cidade com o mesmo nome
    const existingCity = await this.citiesRepository.findOne({
      where: { name: createCityDto.name },
    });

    if (existingCity) {
      throw new ConflictException(`Já existe uma cidade com o nome "${createCityDto.name}"`);
    }

    const city = this.citiesRepository.create({
      name: createCityDto.name,
      latitude: createCityDto.latitude,
    });

    const savedCity = await this.citiesRepository.save(city);

    // Criar dados mensais se fornecidos
    if (createCityDto.monthlyData && createCityDto.monthlyData.length > 0) {
      const monthlyData = createCityDto.monthlyData.map((data) =>
        this.monthlyDataRepository.create({
          cityId: savedCity.id,
          month: data.month,
          temperature: data.temperature,
          solarRadiation: data.solarRadiation,
          windSpeed: data.windSpeed,
        }),
      );

      await this.monthlyDataRepository.save(monthlyData);
    }

    // Buscar cidade completa com dados mensais
    const cityWithData = await this.citiesRepository.findOne({
      where: { id: savedCity.id },
      relations: ['monthlyData'],
    });

    if (!cityWithData) {
      throw new NotFoundException('Erro ao criar cidade');
    }

    return new CityResponseDto(cityWithData);
  }

  async findAll(): Promise<CityResponseDto[]> {
    const cities = await this.citiesRepository.find({
      relations: ['monthlyData'],
      order: { createdAt: 'DESC' },
    });

    return cities.map((city) => new CityResponseDto(city));
  }

  async findOne(id: string): Promise<CityResponseDto> {
    const city = await this.citiesRepository.findOne({
      where: { id },
      relations: ['monthlyData'],
    });

    if (!city) {
      throw new NotFoundException(`Cidade com ID ${id} não encontrada`);
    }

    return new CityResponseDto(city);
  }

  async update(id: string, updateCityDto: UpdateCityDto): Promise<CityResponseDto> {
    const city = await this.citiesRepository.findOne({
      where: { id },
      relations: ['monthlyData'],
    });

    if (!city) {
      throw new NotFoundException(`Cidade com ID ${id} não encontrada`);
    }

    // Verificar se o nome está sendo alterado e se já existe
    if (updateCityDto.name && updateCityDto.name !== city.name) {
      const existingCity = await this.citiesRepository.findOne({
        where: { name: updateCityDto.name },
      });

      if (existingCity && existingCity.id !== id) {
        throw new ConflictException(`Já existe uma cidade com o nome "${updateCityDto.name}"`);
      }
    }

    // Atualizar dados básicos da cidade
    if (updateCityDto.name) city.name = updateCityDto.name;
    if (updateCityDto.latitude !== undefined) city.latitude = updateCityDto.latitude;

    await this.citiesRepository.save(city);

    // Atualizar dados mensais se fornecidos
    if (updateCityDto.monthlyData) {
      // Remover dados mensais existentes
      await this.monthlyDataRepository.delete({ cityId: id });

      // Criar novos dados mensais
      if (updateCityDto.monthlyData.length > 0) {
        const monthlyData = updateCityDto.monthlyData.map((data) =>
          this.monthlyDataRepository.create({
            cityId: id,
            month: data.month,
            temperature: data.temperature,
            solarRadiation: data.solarRadiation,
            windSpeed: data.windSpeed,
          }),
        );

        await this.monthlyDataRepository.save(monthlyData);
      }
    }

    // Buscar cidade atualizada
    const updatedCity = await this.citiesRepository.findOne({
      where: { id },
      relations: ['monthlyData'],
    });

    if (!updatedCity) {
      throw new NotFoundException('Erro ao atualizar cidade');
    }

    return new CityResponseDto(updatedCity);
  }

  async remove(id: string): Promise<void> {
    const city = await this.citiesRepository.findOne({ where: { id } });

    if (!city) {
      throw new NotFoundException(`Cidade com ID ${id} não encontrada`);
    }

    // Os dados mensais serão removidos automaticamente devido ao cascade
    await this.citiesRepository.remove(city);
  }

  async importCities(file: Express.Multer.File): Promise<{ message: string, importedCount: number }> {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado');
    }

    const workbook = xlsx.read(file.buffer, { type: 'buffer' });
    const sheetName = 'DadosClimaticos';
    const sheet = workbook.Sheets[sheetName];

    if (!sheet) {
      throw new BadRequestException(`Aba "${sheetName}" não encontrada na planilha`);
    }

    const rows: any[] = xlsx.utils.sheet_to_json(sheet);
    const cityDataMap = new Map<string, any[]>();

    const monthMap: Record<string, Month> = {
      'janeiro': Month.JANUARY,
      'fevereiro': Month.FEBRUARY,
      'março': Month.MARCH,
      'abril': Month.APRIL,
      'maio': Month.MAY,
      'junho': Month.JUNE,
      'julho': Month.JULY,
      'agosto': Month.AUGUST,
      'setembro': Month.SEPTEMBER,
      'outubro': Month.OCTOBER,
      'novembro': Month.NOVEMBER,
      'dezembro': Month.DECEMBER,
    };

    for (const row of rows) {
      const cityName = row['Cidade'];
      if (!cityName) continue;

      if (!cityDataMap.has(cityName)) {
        cityDataMap.set(cityName, []);
      }

      const monthStr = row['Mês'];
      const mappedMonth = monthMap[(monthStr || '').toLowerCase().trim()];

      if (!mappedMonth) continue;

      // Ensure valid numbers or default to 0
      const temperature = parseFloat(row['Temperatura °C']) || 0;
      const solarRadiation = parseFloat(row['Radiação solar horizontal kWh/m²/d']) || 0;
      const windSpeed = parseFloat(row['velocidade vento km/h']) || 0;
      const latitude = parseFloat(row['Latitude °N']) || 0;

      cityDataMap.get(cityName).push({
        month: mappedMonth,
        temperature,
        solarRadiation,
        windSpeed,
        latitude,
      });
    }

    let importedCount = 0;

    for (const [cityName, monthlyDataRaw] of cityDataMap.entries()) {
      const existingCity = await this.citiesRepository.findOne({ where: { name: cityName } });

      const cityLatitude = monthlyDataRaw[0]?.latitude || 0;
      const monthlyData = monthlyDataRaw.map(({ latitude, ...rest }) => rest);

      if (existingCity) {
        await this.update(existingCity.id, {
          latitude: cityLatitude !== 0 ? cityLatitude : existingCity.latitude,
          monthlyData
        });
      } else {
        await this.create({
          name: cityName,
          latitude: cityLatitude,
          monthlyData,
        });
      }
      importedCount++;
    }

    return {
      message: `${importedCount} cidades importadas com sucesso!`,
      importedCount,
    };
  }
}

