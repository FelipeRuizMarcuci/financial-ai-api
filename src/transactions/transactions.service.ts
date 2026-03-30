/* eslint-disable prettier/prettier */
/* eslint-disable prettier/prettier */

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { PaginationDTO } from 'src/shared/pagination';
import { TransactionDto } from './entities/transactions.dto';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(adminId: number, query: PaginationDTO) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 30);
    const skip = (page - 1) * limit;
    const q = query.q?.trim();

    const where: Prisma.transactionsWhereInput = {
      deleted: 0,
      userId: adminId,
      ...(q
        ? {
            OR: [
              { title: { contains: q } },
              // { type: { contains: q } },
              // { value: { contains: q } },
              // { date: { contains: q } },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.transactions.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          type: true,
          value: true,
          date: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.transactions.count({ where }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: number, adminId: number) {
    const transactions = await this.prisma.transactions.findFirst({
      where: {
        id,
        deleted: 0,
        userId: adminId,
      },
      select: {
        id: true,
        type: true,
        value: true,
        date: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!transactions) {
      throw new NotFoundException('TRANSACTION_NOT_FOUND');
    }

    return transactions;
  }

  async create(adminId: number, data: TransactionDto) {
    const admin = await this.prisma.user.findFirst({
      where: {
        id: adminId,
      },
    });

    if (!admin) {
      throw new NotFoundException('USER_NOT_FOUND');
    }

    if (!data.title || !data.type || !data.value || !data.date) {
      throw new BadRequestException('DATA_ERROR');
    }

    return this.prisma.transactions.create({
      data: {
        userId: adminId,
        title: data.title,
        type: data.type,
        value: data.value,
        date: this.normalizeDate(data.date), // ✅ AQUI
      },
    });
  }

  async update(id: number, adminId: number, data: TransactionDto) {
    const existingUser = await this.prisma.transactions.findFirst({
      where: {
        id,
        userId: adminId,
      },
    });

    if (!existingUser) {
      throw new NotFoundException('TRANSACTION_NOT_FOUND');
    }

    if (!data.date) {
      throw new BadRequestException('ERROR_DATE');
    }

    return this.prisma.transactions.update({
      where: { id },
      data: {
        title: data.title,
        type: data.type,
        value: data.value,
        date: this.normalizeDate(data.date), // ✅ AQUI
      },
      select: {
        id: true,
        type: true,
        value: true,
        date: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async softDelete(id: number, adminId: number) {
    const existingUser = await this.prisma.transactions.findFirst({
      where: {
        id,
        deleted: 0,
        userId: adminId,
      },
    });

    if (!existingUser) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    return this.prisma.transactions.update({
      where: { id },
      data: {
        deleted: 1,
      },
      select: {
        id: true,
        type: true,
        value: true,
        date: true,
        deleted: true,
      },
    });
  }

  private normalizeDate(date: string | Date): Date {
    const d = new Date(date);

    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
  }
}
