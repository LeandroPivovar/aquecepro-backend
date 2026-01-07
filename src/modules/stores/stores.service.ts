import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store, StoreStatus } from './entities/store.entity';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { StoreResponseDto } from './dto/store-response.dto';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(Store)
    private storesRepository: Repository<Store>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  async create(createStoreDto: CreateStoreDto): Promise<StoreResponseDto> {
    // Verificar se já existe loja com o mesmo nome
    const existingStore = await this.storesRepository.findOne({
      where: { name: createStoreDto.name },
    });

    if (existingStore) {
      throw new ConflictException(`Já existe uma loja com o nome "${createStoreDto.name}"`);
    }

    // Verificar se o gerente existe (se fornecido)
    if (createStoreDto.managerId) {
      const manager = await this.usersRepository.findOne({
        where: { id: createStoreDto.managerId },
      });

      if (!manager) {
        throw new NotFoundException(`Usuário com ID ${createStoreDto.managerId} não encontrado`);
      }
    }

    const store = this.storesRepository.create({
      ...createStoreDto,
      status: createStoreDto.status || StoreStatus.ACTIVE,
    });

    const savedStore = await this.storesRepository.save(store);
    const storeWithManager = await this.storesRepository.findOne({
      where: { id: savedStore.id },
      relations: ['manager'],
    });

    if (!storeWithManager) {
      throw new NotFoundException('Erro ao criar loja');
    }

    const productsCount = await this.getProductsCount(savedStore.id);
    return new StoreResponseDto(storeWithManager, productsCount);
  }

  async findAll(): Promise<StoreResponseDto[]> {
    const stores = await this.storesRepository.find({
      relations: ['manager'],
      order: { createdAt: 'DESC' },
    });

    // Buscar contagem de produtos para cada loja
    const storesWithCount = await Promise.all(
      stores.map(async (store) => {
        const productsCount = await this.getProductsCount(store.id);
        return new StoreResponseDto(store, productsCount);
      }),
    );

    return storesWithCount;
  }

  async findOne(id: string): Promise<StoreResponseDto> {
    const store = await this.storesRepository.findOne({
      where: { id },
      relations: ['manager'],
    });

    if (!store) {
      throw new NotFoundException(`Loja com ID ${id} não encontrada`);
    }

    const productsCount = await this.getProductsCount(id);
    return new StoreResponseDto(store, productsCount);
  }

  async update(id: string, updateStoreDto: UpdateStoreDto): Promise<StoreResponseDto> {
    const store = await this.storesRepository.findOne({
      where: { id },
      relations: ['manager'],
    });

    if (!store) {
      throw new NotFoundException(`Loja com ID ${id} não encontrada`);
    }

    // Verificar se o nome está sendo alterado e se já existe
    if (updateStoreDto.name && updateStoreDto.name !== store.name) {
      const existingStore = await this.storesRepository.findOne({
        where: { name: updateStoreDto.name },
      });

      if (existingStore && existingStore.id !== id) {
        throw new ConflictException(`Já existe uma loja com o nome "${updateStoreDto.name}"`);
      }
    }

    // Verificar se o gerente existe (se fornecido)
    if (updateStoreDto.managerId && updateStoreDto.managerId !== store.managerId) {
      const manager = await this.usersRepository.findOne({
        where: { id: updateStoreDto.managerId },
      });

      if (!manager) {
        throw new NotFoundException(`Usuário com ID ${updateStoreDto.managerId} não encontrado`);
      }
    }

    Object.assign(store, updateStoreDto);
    const updatedStore = await this.storesRepository.save(store);
    const storeWithManager = await this.storesRepository.findOne({
      where: { id: updatedStore.id },
      relations: ['manager'],
    });

    if (!storeWithManager) {
      throw new NotFoundException('Erro ao atualizar loja');
    }

    const productsCount = await this.getProductsCount(id);
    return new StoreResponseDto(storeWithManager, productsCount);
  }

  async remove(id: string): Promise<void> {
    const store = await this.storesRepository.findOne({ where: { id } });

    if (!store) {
      throw new NotFoundException(`Loja com ID ${id} não encontrada`);
    }

    // Verificar se há produtos associados (se necessário no futuro)
    // Por enquanto, apenas remove
    await this.storesRepository.remove(store);
  }

  private async getProductsCount(storeId: string): Promise<number> {
    // Por enquanto, retorna 0. No futuro, pode contar produtos associados à loja
    // quando houver relacionamento entre produtos e lojas
    return 0;
  }
}

