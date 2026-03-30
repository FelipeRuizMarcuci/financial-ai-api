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
import { GoalDto } from './entities/goals.dto';
import { AddValueDto } from './entities/addValue.dto';

@Injectable()
export class GoalsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(adminId: number, query: PaginationDTO) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 30);
    const skip = (page - 1) * limit;
    const q = query.q?.trim();

    const where: Prisma.goalsWhereInput = {
      deleted: 0,
      userId: adminId,
      ...(q
        ? {
            OR: [
              { title: { contains: q } },
              { dateDeadline: { contains: q } },
              // { value: { contains: q } },
              // { date: { contains: q } },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.goals.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          targetValue: true,
          value: true,
          dateDeadline: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.goals.count({ where }),
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
    const goals = await this.prisma.goals.findFirst({
      where: {
        id,
        deleted: 0,
        userId: adminId,
      },
      select: {
        id: true,
        targetValue: true,
        value: true,
        dateDeadline: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!goals) {
      throw new NotFoundException('TRANSACTION_NOT_FOUND');
    }

    return goals;
  }

  async create(adminId: number, data: GoalDto) {
    const admin = await this.prisma.user.findFirst({
      where: {
        id: adminId,
      },
    });

    if (!admin) {
      throw new NotFoundException('USER_NOT_FOUND');
    }

    if (!data.title || !data.targetValue || !data.value || !data.dateDeadline) {
      throw new BadRequestException('DATA_ERROR');
    }

    return this.prisma.goals.create({
      data: {
        userId: adminId,
        title: data.title,
        targetValue: data.targetValue,
        value: data.value,
        dateDeadline: data.dateDeadline,
      },
    });
  }

  async update(id: number, adminId: number, data: GoalDto) {
    const existingUser = await this.prisma.goals.findFirst({
      where: {
        id,
        userId: adminId,
      },
    });

    if (!existingUser) {
      throw new NotFoundException('TRANSACTION_NOT_FOUND');
    }

    return this.prisma.goals.update({
      where: { id },
      data: {
        title: data.title,
        targetValue: data.targetValue,
        value: data.value,
        dateDeadline: data.dateDeadline,
      },
      select: {
        id: true,
        targetValue: true,
        value: true,
        dateDeadline: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async softDelete(id: number, adminId: number) {
    const existingUser = await this.prisma.goals.findFirst({
      where: {
        id,
        deleted: 0,
        userId: adminId,
      },
    });

    if (!existingUser) {
      throw new NotFoundException('USER_NOT_FOUND');
    }

    return this.prisma.goals.update({
      where: { id },
      data: {
        deleted: 1,
      },
      select: {
        id: true,
        targetValue: true,
        value: true,
        dateDeadline: true,
        deleted: true,
      },
    });
  }

  async addValue(id: number, adminId: number, data: AddValueDto) {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        id: adminId,
      },
    });

    if (!existingUser) {
      throw new NotFoundException('USER_NOT_FOUND');
    }

    return await this.prisma.goals.update({
      where: { id, userId: existingUser.id },
      data,
    });
  }
}
