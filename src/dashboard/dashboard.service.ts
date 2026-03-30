import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

type RangeType = 'current_month' | 'last_month' | 'last_6_months';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  // 📅 Range
  private getDateRange(range: RangeType) {
    const now = new Date();

    switch (range) {
      case 'last_month':
        return {
          start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
          end: new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59),
        };

      case 'last_6_months':
        return {
          start: new Date(now.getFullYear(), now.getMonth() - 5, 1),
          end: now,
        };

      case 'current_month':
      default:
        return {
          start: new Date(now.getFullYear(), now.getMonth(), 1),
          end: now,
        };
    }
  }

  // 💰 Summary
  private async getSummary(userId: number, start: Date, end: Date) {
    const transactions = await this.prisma.transactions.findMany({
      where: {
        userId,
        date: {
          gte: start,
          lte: end,
        },
      },
    });

    const income = transactions
      .filter((t) => t.type === 'REVENUE')
      .reduce((acc, t) => acc + Number(t.value), 0);

    const expense = transactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((acc, t) => acc + Number(t.value), 0);

    const balance = income - expense;

    const savingsRate = income > 0 ? (balance / income) * 100 : 0;

    return {
      income,
      expense,
      balance,
      savingsRate,
    };
  }

  // 🏆 Top transações
  private async getTopTransactions(userId: number, start: Date, end: Date) {
    const [topIncome, topExpense] = await Promise.all([
      this.prisma.transactions.findFirst({
        where: {
          userId,
          type: 'REVENUE',
          date: { gte: start, lte: end },
        },
        orderBy: { value: 'desc' },
      }),

      this.prisma.transactions.findFirst({
        where: {
          userId,
          type: 'EXPENSE',
          date: { gte: start, lte: end },
        },
        orderBy: { value: 'desc' },
      }),
    ]);

    return {
      topIncome,
      topExpense,
    };
  }

  // 🕓 Recentes
  private async getRecentTransactions(userId: number) {
    return this.prisma.transactions.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 4,
    });
  }

  // 📊 Gráfico (diário)
  private async getDailyBalance(userId: number, start: Date, end: Date) {
    const transactions = await this.prisma.transactions.findMany({
      where: {
        userId,
        date: {
          gte: start,
          lte: end,
        },
      },
    });

    const grouped: Record<string, { income: number; expense: number }> = {};

    transactions.forEach((t) => {
      const date = t.date.toISOString().split('T')[0];

      if (!grouped[date]) {
        grouped[date] = { income: 0, expense: 0 };
      }

      if (t.type === 'REVENUE') {
        grouped[date].income += Number(t.value);
      } else {
        grouped[date].expense += Number(t.value);
      }
    });

    return Object.entries(grouped).map(([date, values]) => ({
      date,
      income: values.income,
      expense: values.expense,
      balance: values.income - values.expense,
    }));
  }

  // 🚀 Dashboard completo
  async getDashboard(userId: number, range: RangeType) {
    const { start, end } = this.getDateRange(range);

    const [summary, topTransactions, recentTransactions, dailyBalance] =
      await Promise.all([
        this.getSummary(userId, start, end),
        this.getTopTransactions(userId, start, end),
        this.getRecentTransactions(userId),
        this.getDailyBalance(userId, start, end),
      ]);

    return {
      summary,
      topTransactions,
      recentTransactions,
      chart: dailyBalance,
    };
  }
}
