import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category, CategoryStatus } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryResponseDto } from './dto/category-response.dto';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<CategoryResponseDto> {
    // Verificar se já existe categoria com o mesmo nome no mesmo segmento
    const existingCategory = await this.categoriesRepository.findOne({
      where: {
        name: createCategoryDto.name,
        segment: createCategoryDto.segment,
      },
    });

    if (existingCategory) {
      throw new ConflictException(
        `Já existe uma categoria com o nome "${createCategoryDto.name}" no segmento ${createCategoryDto.segment}`,
      );
    }

    const category = this.categoriesRepository.create({
      ...createCategoryDto,
      status: createCategoryDto.status || CategoryStatus.ACTIVE,
    });

    const savedCategory = await this.categoriesRepository.save(category);
    const productsCount = await this.getProductsCount(savedCategory.id);

    return new CategoryResponseDto(savedCategory, productsCount);
  }

  async findAll(): Promise<CategoryResponseDto[]> {
    const categories = await this.categoriesRepository.find({
      order: { createdAt: 'DESC' },
    });

    // Buscar contagem de produtos para cada categoria
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const productsCount = await this.getProductsCount(category.id);
        return new CategoryResponseDto(category, productsCount);
      }),
    );

    return categoriesWithCount;
  }

  async findOne(id: string): Promise<CategoryResponseDto> {
    const category = await this.categoriesRepository.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Categoria com ID ${id} não encontrada`);
    }

    const productsCount = await this.getProductsCount(id);
    return new CategoryResponseDto(category, productsCount);
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<CategoryResponseDto> {
    const category = await this.categoriesRepository.findOne({ where: { id } });

    if (!category) {
      throw new NotFoundException(`Categoria com ID ${id} não encontrada`);
    }

    // Verificar se o nome está sendo alterado e se já existe no mesmo segmento
    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      const segment = updateCategoryDto.segment || category.segment;
      const existingCategory = await this.categoriesRepository.findOne({
        where: {
          name: updateCategoryDto.name,
          segment: segment,
        },
      });

      if (existingCategory && existingCategory.id !== id) {
        throw new ConflictException(
          `Já existe uma categoria com o nome "${updateCategoryDto.name}" no segmento ${segment}`,
        );
      }
    }

    Object.assign(category, updateCategoryDto);
    const updatedCategory = await this.categoriesRepository.save(category);
    const productsCount = await this.getProductsCount(id);

    return new CategoryResponseDto(updatedCategory, productsCount);
  }

  async remove(id: string): Promise<void> {
    const category = await this.categoriesRepository.findOne({ where: { id } });

    if (!category) {
      throw new NotFoundException(`Categoria com ID ${id} não encontrada`);
    }

    // Verificar se há produtos associados
    const productsCount = await this.getProductsCount(id);
    if (productsCount > 0) {
      throw new ConflictException(
        `Não é possível remover a categoria. Existem ${productsCount} produto(s) associado(s).`,
      );
    }

    await this.categoriesRepository.remove(category);
  }

  private async getProductsCount(categoryId: string): Promise<number> {
    // Buscar a categoria para obter o nome
    const category = await this.categoriesRepository.findOne({
      where: { id: categoryId },
    });

    if (!category) {
      return 0;
    }

    // Contar produtos que usam esta categoria como category1 ou category2 (por nome)
    const count = await this.productsRepository
      .createQueryBuilder('product')
      .where('product.category1 = :name OR product.category2 = :name', { name: category.name })
      .getCount();

    return count;
  }
}

