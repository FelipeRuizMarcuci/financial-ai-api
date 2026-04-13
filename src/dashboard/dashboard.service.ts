/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { AiService } from 'src/ai-service/ai.service';

type RangeType = 'current_month' | 'last_month' | 'last_6_months';

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

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
      orderBy: { date: 'asc' },
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

  private async getMonthlyBalance(userId: number, start: Date, end: Date) {
    const transactions = await this.prisma.transactions.findMany({
      where: {
        userId,
        date: {
          gte: start,
          lte: end,
        },
      },
      orderBy: { date: 'asc' },
    });

    const grouped: Record<string, { income: number; expense: number }> = {};

    transactions.forEach((t) => {
      const d = new Date(t.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

      if (!grouped[key]) {
        grouped[key] = { income: 0, expense: 0 };
      }

      if (t.type === 'REVENUE') {
        grouped[key].income += Number(t.value);
      } else {
        grouped[key].expense += Number(t.value);
      }
    });

    // gerar todos os meses no intervalo
    const result: {
      month: string;
      income: number;
      expense: number;
      balance: number;
    }[] = [];
    const current = new Date(start);

    while (current <= end) {
      const key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;

      const values = grouped[key] || { income: 0, expense: 0 };

      result.push({
        month: key,
        income: values.income,
        expense: values.expense,
        balance: values.income - values.expense,
      });

      current.setMonth(current.getMonth() + 1);
    }

    return result;
  }

  // 🚀 Dashboard completo
  async getDashboard(userId: number, range: RangeType) {
    const { start, end } = this.getDateRange(range);

    const allTransactions = await this.prisma.transactions.findMany({
      where: { userId },
      orderBy: { date: 'asc' },
    });

    const formattedTransactions = allTransactions.map((t) => ({
      amount: t.value,
      category: t.category ?? 'OTHERS',
      date: t.date,
      description: t.title ?? '',
      type: t.type,
    }));

    const [
      summary,
      topTransactions,
      recentTransactions,
      dailyBalance,
      monthlyBalance,
    ] = await Promise.all([
      this.getSummary(userId, start, end),
      this.getTopTransactions(userId, start, end),
      this.getRecentTransactions(userId),
      this.getDailyBalance(userId, start, end),
      this.getMonthlyBalance(userId, start, end),
    ]);

    const [insightsResponse, forecast] = await Promise.all([
      this.aiService.getInsights(formattedTransactions),
      this.aiService.getForecast({
        transactions: formattedTransactions,
        balance: summary.balance,
      }),
    ]);

    return {
      summary,
      topTransactions,
      recentTransactions,
      chartDaily: dailyBalance,
      chartMonthly: monthlyBalance,
      insightsResponse,
      forecast,
    };
  }
}
