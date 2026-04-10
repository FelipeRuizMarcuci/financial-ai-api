import { Module } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { AiModule } from 'src/ai-service/ai.module';

@Module({
  imports: [AiModule],
  controllers: [DashboardController],
  providers: [DashboardService, PrismaService],
  exports: [DashboardService],
})
export class DashboardModule {}
