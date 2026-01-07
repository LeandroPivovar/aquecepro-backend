import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { UserResponseDto } from '../users/dto/user-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any): Promise<AuthResponseDto> {
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Usuário inativo ou inválido');
    }

    const payload = { email: user.email, sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return new AuthResponseDto(accessToken, new UserResponseDto(user));
  }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    // Criar usuário através do UsersService
    await this.usersService.create({
      ...registerDto,
      role: UserRole.USER, // Usuários registrados começam como 'user'
    });

    // Buscar o usuário completo para fazer login
    const user = await this.usersService.findByEmail(registerDto.email);
    if (!user) {
      throw new UnauthorizedException('Erro ao criar usuário');
    }

    // Fazer login automaticamente após registro
    const { password: _, ...userWithoutPassword } = user;
    return this.login(userWithoutPassword);
  }

  async getProfile(userId: string): Promise<UserResponseDto> {
    return this.usersService.findOne(userId);
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<UserResponseDto> {
    return this.usersService.update(userId, updateProfileDto);
  }

  async updatePassword(userId: string, updatePasswordDto: UpdatePasswordDto): Promise<{ message: string }> {
    // Buscar usuário completo (com senha) para validação
    const userProfile = await this.usersService.findOne(userId);
    const user = await this.usersService.findByEmail(userProfile.email);

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    // Verificar senha atual
    const isPasswordValid = await bcrypt.compare(
      updatePasswordDto.currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Senha atual incorreta');
    }

    // Atualizar senha
    await this.usersService.update(userId, {
      password: updatePasswordDto.newPassword,
    });

    return { message: 'Senha alterada com sucesso' };
  }
}

