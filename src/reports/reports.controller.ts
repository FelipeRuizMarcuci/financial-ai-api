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
import { ReportsService } from './reports.service';

@ApiBearerAuth()
@UseGuards(AuthGuard)
@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  async getFullReport(
    @Req() req: any,
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    const userId = req.user.id;

    const startDate = start ? this.parseDate(start) : this.getStartOfMonth();

    const endDate = end ? this.endOfDay(this.parseDate(end)) : new Date();

    return this.reportsService.getFullReport(userId, startDate, endDate);
  }

  @Get('summary')
  async getSummary(
    @Req() req: any,
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    const userId = req.user.id;

    const startDate = start ? new Date(start) : this.getStartOfMonth();
    const endDate = end ? this.endOfDay(new Date(end)) : new Date();

    return this.reportsService.getSummary(userId, startDate, endDate);
  }

  @Get('top-expenses')
  async getTopExpenses(
    @Req() req: any,
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    const userId = req.user.id;

    const startDate = start ? new Date(start) : this.getStartOfMonth();
    const endDate = end ? this.endOfDay(new Date(end)) : new Date();

    return this.reportsService.getTopExpenses(userId, startDate, endDate);
  }

  @Get('expenses-by-category')
  async getExpensesByCategory(
    @Req() req: any,
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    const userId = req.user.id;

    const startDate = start ? new Date(start) : this.getStartOfMonth();
    const endDate = end ? this.endOfDay(new Date(end)) : new Date();

    return this.reportsService.getExpensesByCategory(
      userId,
      startDate,
      endDate,
    );
  }

  @Get('daily-balance')
  async getDailyBalance(
    @Req() req: any,
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    const userId = req.user.id;

    const startDate = start ? new Date(start) : this.getStartOfMonth();
    const endDate = end ? this.endOfDay(new Date(end)) : new Date();

    return this.reportsService.getDailyBalance(userId, startDate, endDate);
  }

  @Get('insights')
  async getInsights(
    @Req() req: any,
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    const userId = req.user.id;

    const startDate = start ? new Date(start) : this.getStartOfMonth();
    const endDate = end ? this.endOfDay(new Date(end)) : new Date();

    const [topCategory, count, summary] = await Promise.all([
      this.reportsService.getTopCategory(userId, startDate, endDate),
      this.reportsService.getTransactionCount(userId, startDate, endDate),
      this.reportsService.getSummary(userId, startDate, endDate),
    ]);

    return {
      topCategory,
      transactionCount: count,
      balance: summary.balance,
    };
  }

  private getStartOfMonth(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }

  private parseDate(date: string): Date {
    const [year, month, day] = date.split('-').map(Number);

    return new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
  }

  private endOfDay(date: Date): Date {
    return new Date(
      Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        23,
        59,
        59,
        999,
      ),
    );
  }
}
