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
import { TransactionDto } from './entities/transactions.dto';
import { AuthGuard } from 'src/auth/authguard/auth.guard';
import { TransactionsService } from './transactions.service';

@ApiBearerAuth()
@UseGuards(AuthGuard)
@ApiTags('Transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  async findAll(@Req() req: any, @Query() query: PaginationDTO) {
    if (!req.user?.id) {
      throw new BadRequestException(
        'Usuário autenticado não encontrado na requisição.',
      );
    }

    return this.transactionsService.findAll(req.user.id, query);
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    if (!req.user?.id) {
      throw new BadRequestException(
        'Usuário autenticado não encontrado na requisição.',
      );
    }

    return this.transactionsService.findById(id, req.user.id);
  }

  @Post()
  async create(@Req() req: any, @Body() body: TransactionDto) {
    if (!req.user?.id) {
      throw new BadRequestException(
        'Usuário autenticado não encontrado na requisição.',
      );
    }

    return this.transactionsService.create(req.user.id, body);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
    @Body() body: TransactionDto,
  ) {
    if (!req.user?.id) {
      throw new BadRequestException(
        'Usuário autenticado não encontrado na requisição.',
      );
    }

    return this.transactionsService.update(id, req.user.id, body);
  }

  @Delete(':id')
  async softDelete(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    if (!req.user?.id) {
      throw new BadRequestException(
        'Usuário autenticado não encontrado na requisição.',
      );
    }

    return this.transactionsService.softDelete(id, req.user.id);
  }
}
