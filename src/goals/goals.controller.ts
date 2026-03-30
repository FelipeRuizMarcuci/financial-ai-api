import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PaginationDTO } from 'src/shared/pagination';
import { GoalDto } from './entities/goals.dto';
import { AuthGuard } from 'src/auth/authguard/auth.guard';
import { GoalsService } from './goals.service';
import { AddValueDto } from './entities/addValue.dto';

@ApiBearerAuth()
@UseGuards(AuthGuard)
@ApiTags('Goals')
@Controller('goals')
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Get()
  async findAll(@Req() req: any, @Query() query: PaginationDTO) {
    if (!req.user?.id) {
      throw new BadRequestException(
        'Usuário autenticado não encontrado na requisição.',
      );
    }

    return this.goalsService.findAll(req.user.id, query);
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    if (!req.user?.id) {
      throw new BadRequestException(
        'Usuário autenticado não encontrado na requisição.',
      );
    }

    return this.goalsService.findById(id, req.user.id);
  }

  @Post()
  async create(@Req() req: any, @Body() body: GoalDto) {
    if (!req.user?.id) {
      throw new BadRequestException(
        'Usuário autenticado não encontrado na requisição.',
      );
    }

    return this.goalsService.create(req.user.id, body);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
    @Body() body: GoalDto,
  ) {
    if (!req.user?.id) {
      throw new BadRequestException(
        'Usuário autenticado não encontrado na requisição.',
      );
    }

    return this.goalsService.update(id, req.user.id, body);
  }

  @Delete(':id')
  async softDelete(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    if (!req.user?.id) {
      throw new BadRequestException(
        'Usuário autenticado não encontrado na requisição.',
      );
    }

    return this.goalsService.softDelete(id, req.user.id);
  }

  @Patch('addvalue/:id')
  async addValue(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
    @Body() body: AddValueDto,
  ) {
    if (!req.user?.id) {
      throw new BadRequestException(
        'Usuário autenticado não encontrado na requisição.',
      );
    }

    return this.goalsService.addValue(id, req.user.id, body);
  }
}
