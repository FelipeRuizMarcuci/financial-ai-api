import {
  BadRequestException,
  Controller,
  Get,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/authguard/auth.guard';
import { DashboardService } from './dashboard.service';

@ApiBearerAuth()
@UseGuards(AuthGuard)
@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  async getDashboard(
    @Req() req: any,
    @Query('range') range: string = 'current_month',
  ) {
    if (!req.user?.id) {
      throw new BadRequestException(
        'Usuário autenticado não encontrado na requisição.',
      );
    }

    return this.dashboardService.getDashboard(req.user.id, range as any);
  }
}
