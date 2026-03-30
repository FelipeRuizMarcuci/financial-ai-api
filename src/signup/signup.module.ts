import { Module } from '@nestjs/common';
import { SignupController } from './signup.controller';
import { SignupService } from './signup.service';
import { PrismaService } from 'prisma/prisma.service';
import { AuthService } from 'src/auth/auth.service';
import { RdStationService } from 'src/shared/rdstation/rdstation.service';

@Module({
  imports: [],
  controllers: [SignupController],
  providers: [SignupService, PrismaService, AuthService, RdStationService],
  exports: [SignupService, RdStationService],
})
export class SignupModule {}
