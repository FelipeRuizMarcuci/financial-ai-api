import * as bcrypt from 'bcrypt';
import { PrismaService } from 'prisma/prisma.service';
import { SignupDTO } from './dtos/signup.dto';
import { AuthService } from 'src/auth/auth.service';
import { RdStationService } from 'src/shared/rdstation/rdstation.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SignupService {
  constructor(
    private prismaService: PrismaService,
    private rdStationService: RdStationService,
    private authService: AuthService,
  ) {}

  async create(data: SignupDTO): Promise<{ data: boolean; token: string }> {
    delete data.confirmPassword;

    let { password } = data;
    const hashedPassword: string = await bcrypt.hash(password, 10);

    await this.prismaService.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });
    const token: string = await this.authService.signInOut(
      data.email,
      password,
    );

    return { data: true, token };
  }
}
