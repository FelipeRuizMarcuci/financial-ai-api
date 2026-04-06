/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
/* eslint-disable prettier/prettier */

import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getFullReport(userId: number, start: Date, end: Date) {
    const [
      summary,
      topExpenses,
      topCategory,
      count,
      expensesByCategory,
      dailyBalance,
    ] = await Promise.all([
      this.getSummary(userId, start, end),
      this.getTopExpenses(userId, start, end),
      this.getTopCategory(userId, start, end),
      this.getTransactionCount(userId, start, end),
      this.getExpensesByCategory(userId, start, end),
      this.getDailyBalance(userId, start, end),
    ]);

    return {
      summary,
      topExpenses,
      insights: {
        topCategory,
        transactionCount: count,
        balance: summary.balance,
      },
      charts: {
        expensesByCategory,
        dailyBalance,
      },
    };
  }

  async getSummary(userId: number, start: Date, end: Date) {
    const transactions = await this.prisma.transactions.findMany({
      where: {
        userId,
        deleted: 0,
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

    return {
      income,
      expense,
      balance: income - expense,
    };
  }

  async getTopExpenses(userId: number, start: Date, end: Date) {
    return await this.prisma.transactions.findMany({
      where: {
        userId,
        deleted: 0,
        type: 'EXPENSE',
        date: {
          gte: start,
          lte: end,
        },
      },
      orderBy: {
        value: 'desc',
      },
      take: 10,
      select: {
        id: true,
        title: true,
        type: true,
        value: true,
        date: true,
        category: true,
      },
    });
  }

  async getTopCategory(userId: number, start: Date, end: Date) {
    const result = await this.prisma.transactions.groupBy({
      by: ['category'],
      where: {
        userId,
        deleted: 0,
        type: 'EXPENSE',
        date: {
          gte: start,
          lte: end,
        },
      },
      _sum: {
        value: true,
      },
      orderBy: {
        _sum: {
          value: 'desc',
        },
      },
      take: 1,
    });

    if (!result.length) return null;

    return result.map((r) => ({
      category: r.category,
      total: Number(r._sum?.value || 0),
    }));
  }

  async getTransactionCount(userId: number, start: Date, end: Date) {
    return this.prisma.transactions.count({
      where: {
        userId,
        deleted: 0,
        date: {
          gte: start,
          lte: end,
        },
      },
    });
  }

  async getExpensesByCategory(userId: number, start: Date, end: Date) {
    const result = await this.prisma.transactions.groupBy({
      by: ['category'],
      where: {
        userId,
        deleted: 0,
        type: 'EXPENSE',
        date: {
          gte: start,
          lte: end,
        },
      },
      _sum: {
        value: true,
      },
      orderBy: {
        _sum: {
          value: 'desc',
        },
      },
    });

    return result.map((r) => ({
      category: r.category,
      total: Number(r._sum?.value || 0),
    }));
  }

  async getDailyBalance(userId: number, start: Date, end: Date) {
    const transactions = await this.prisma.transactions.findMany({
      where: {
        userId,
        deleted: 0,
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
}
