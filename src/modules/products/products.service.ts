import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product, ProductStatus } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import * as xlsx from 'xlsx';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) { }

  async create(createProductDto: CreateProductDto): Promise<ProductResponseDto> {
    // Verificar se já existe produto com o mesmo código
    const existingProduct = await this.productsRepository.findOne({
      where: { code: createProductDto.code },
    });

    if (existingProduct) {
      throw new ConflictException('Já existe um produto com este código');
    }

    const product = this.productsRepository.create({
      ...createProductDto,
      status: createProductDto.status || ProductStatus.ACTIVE,
    });

    const savedProduct = await this.productsRepository.save(product);
    return new ProductResponseDto(savedProduct);
  }

  async findAll(): Promise<ProductResponseDto[]> {
    const products = await this.productsRepository.find({
      order: { createdAt: 'DESC' },
    });
    return products.map((product) => new ProductResponseDto(product));
  }

  async findOne(id: string): Promise<ProductResponseDto> {
    const product = await this.productsRepository.findOne({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Produto com ID ${id} não encontrado`);
    }

    return new ProductResponseDto(product);
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<ProductResponseDto> {
    const product = await this.productsRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException(`Produto com ID ${id} não encontrado`);
    }

    // Verificar se o código está sendo alterado e se já existe
    if (updateProductDto.code && updateProductDto.code !== product.code) {
      const existingProduct = await this.productsRepository.findOne({
        where: { code: updateProductDto.code },
      });

      if (existingProduct) {
        throw new ConflictException('Já existe um produto com este código');
      }
    }

    Object.assign(product, updateProductDto);
    const updatedProduct = await this.productsRepository.save(product);
    return new ProductResponseDto(updatedProduct);
  }

  async remove(id: string): Promise<void> {
    const product = await this.productsRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException(`Produto com ID ${id} não encontrado`);
    }

    await this.productsRepository.remove(product);
  }

  async importProducts(file: Express.Multer.File): Promise<{ message: string; importedCount: number }> {
    if (!file) {
      throw new NotFoundException('Arquivo não encontrado');
    }

    // Read the file buffer with xlsx
    const workbook = xlsx.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet) as any[];

    let importedCount = 0;

    for (const row of data) {
      // Validate mandatory minimal data
      if (!row['codigo'] || !row['descricao']) {
        continue;
      }

      // Map technical specs by looking for specific column prefixes
      const technicalSpecs: Record<string, any> = {};

      // Known mappings from the spreadsheet
      const colMapping: Record<string, string> = {
        'Caracteristica - capacidade termica p/ codicao de ensaio 26°C (kW)': 'thermalCapacity26',
        'Caracteristica - capacidade termica p/ codicao de ensaio 15°C (kW)': 'thermalCapacity15',
        'Caracteristica - Consumo eletrico  p/ codicao de ensaio 26°C (kW/h)': 'electricConsumption26',
        'Caracteristica - Consumo eletrico  p/ codicao de ensaio 15°C (kW/h)': 'electricConsumption15',
        'Caracteristica - Vazao ideal (m³/h)': 'idealFlowRate',
        'Caracteristica - Area da Placa (m²)': 'collectorArea',
        'Caracteristica - Produção média mensal': 'collectorProduction',
        'Caracteristica - Volume do reservatorio': 'volume',
        'Caracteristica - Potência Termica (kW/h)': 'resistancePower',
        'Caracteristica - potencia nominal kw': 'nominalPower',
        'Caracteristica - rendimento': 'heaterEfficiency',
        'Caracteristica - tipo gás': 'gasType',
        'Caracteristica - vazão de pico a 15 m.c.a. L/min': 'flowAt15mca',
        'Caracteristica - vazão somada (fria e quente) a 20°C': 'simultaneousFlow20C',
      };

      for (const colName in row) {
        if (colMapping[colName] && row[colName] !== undefined && row[colName] !== null) {
          technicalSpecs[colMapping[colName]] = row[colName].toString();
        }
      }

      // Basic extraction
      const code = String(row['codigo']).trim();
      const description = row['descricao'] ? String(row['descricao']).trim() : '';
      const proposalDescription = row['descricao para proposta'] ? String(row['descricao para proposta']).trim() : description;
      let segment = row['segmento'] ? String(row['segmento']).trim() : 'Residencial';

      // Normalizing known segments to match typical DB entries
      if (segment.toLowerCase().includes('piscina')) segment = 'Piscina';
      else if (segment.toLowerCase().includes('comercial')) segment = 'Comercial';
      else segment = 'Residencial';

      const category1 = row['categoria 1'] ? String(row['categoria 1']).trim() : 'Equipamentos';
      const category2 = row['categoria 2'] ? String(row['categoria 2']).trim() : '';

      const cost = Number(row['custo  (R$)']) || 0;
      const saleValue = Number(row['valor de venda (R$)']) || 0;

      const productDto: CreateProductDto = {
        code,
        description,
        proposalDescription,
        segment,
        category1,
        category2,
        technicalSpecs,
        cost,
        saleValue,
        status: ProductStatus.ACTIVE,
      };

      const existingProduct = await this.productsRepository.findOne({ where: { code } });

      if (existingProduct) {
        // Objeto de update
        Object.assign(existingProduct, productDto);
        await this.productsRepository.save(existingProduct);
      } else {
        const product = this.productsRepository.create(productDto);
        await this.productsRepository.save(product);
      }

      importedCount++;
    }

    return { message: 'Importação concluída', importedCount };
  }
}

