/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthenticateDTO } from './dtos/authenticate.dto';
import { PrismaService } from 'prisma/prisma.service';
import { User } from 'src/user/entities/user';
import { ChangePasswordDTO } from './dtos/change.password.dto';
import { RecoveryDTO } from './dtos/recovery.dto';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prismaService: PrismaService,
  ) {}

  async signIn(authenticateDto: AuthenticateDTO): Promise<any> {
    const { email, password } = authenticateDto;
    const user = await this.prismaService.user.findFirst({
      where: { email },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException();
    }

    const payload = await this.getPayload(user);

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async getPayload(user: User) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      active: false,
    };
  }

  async signInOut(email: string, password: string): Promise<any> {
    const user = await this.prismaService.user.findFirst({
      where: { email },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException();
    }

    const payload = await this.getPayload(user);

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async requestChangePassword(data: RecoveryDTO) {
    const user = await this.prismaService.user.findFirst({
      where: { email: data.email },
    });

    if (!user) {
      throw new NotFoundException('USER_NOT_FOUND');
    }

    const token = this.generateToken();

    await this.prismaService.user.update({
      where: { id: user.id },
      data: {
        token,
        tokenExpireAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });
  }

  async changePassword(data: ChangePasswordDTO) {
    const user = await this.prismaService.user.findFirst({
      where: { email: data.email },
    });

    if (!user) {
      throw new NotFoundException('USER_NOT_FOUND');
    }

    if (!user.token || user.token != data.resetToken) {
      throw new BadRequestException('INVALID_TOKEN');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    await this.prismaService.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, token: null, tokenExpireAt: null },
    });

    return { message: 'Senha alterada com sucesso' };
  }

  generateToken(length = 6): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const bytes = crypto.randomBytes(length);

    let token = '';

    for (let i = 0; i < length; i++) {
      token += chars[bytes[i] % chars.length];
    }

    return token;
  }
}
