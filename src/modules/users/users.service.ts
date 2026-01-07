import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserType } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { Store } from '../stores/entities/store.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Store)
    private storesRepository: Repository<Store>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email já está em uso');
    }

    // Verificar se a loja existe (se fornecida)
    if (createUserDto.storeId) {
      const store = await this.storesRepository.findOne({
        where: { id: createUserDto.storeId },
      });

      if (!store) {
        throw new NotFoundException(`Loja com ID ${createUserDto.storeId} não encontrada`);
      }
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
      type: createUserDto.type || UserType.USER,
      isActive: createUserDto.isActive !== undefined ? createUserDto.isActive : true,
    });

    const savedUser = await this.usersRepository.save(user);
    const userWithStore = await this.usersRepository.findOne({
      where: { id: savedUser.id },
      relations: ['store'],
    });

    if (!userWithStore) {
      throw new NotFoundException('Erro ao criar usuário');
    }

    return new UserResponseDto(userWithStore);
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.usersRepository.find({
      relations: ['store'],
      order: { createdAt: 'DESC' },
    });
    return users.map((user) => new UserResponseDto(user));
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['store'],
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }

    return new UserResponseDto(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['store'],
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.usersRepository.findOne({
        where: { email: updateUserDto.email },
      });

      if (existingUser) {
        throw new ConflictException('Email já está em uso');
      }
    }

    // Verificar se a loja existe (se fornecida)
    if (updateUserDto.storeId && updateUserDto.storeId !== user.storeId) {
      const store = await this.storesRepository.findOne({
        where: { id: updateUserDto.storeId },
      });

      if (!store) {
        throw new NotFoundException(`Loja com ID ${updateUserDto.storeId} não encontrada`);
      }
    }

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    Object.assign(user, updateUserDto);
    const updatedUser = await this.usersRepository.save(user);
    const userWithStore = await this.usersRepository.findOne({
      where: { id: updatedUser.id },
      relations: ['store'],
    });

    if (!userWithStore) {
      throw new NotFoundException('Erro ao atualizar usuário');
    }

    return new UserResponseDto(userWithStore);
  }

  async remove(id: string): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }

    await this.usersRepository.remove(user);
  }
}

