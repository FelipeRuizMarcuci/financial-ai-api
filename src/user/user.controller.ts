import {
  BadRequestException,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PaginationDTO } from 'src/shared/pagination';
import { UsersService } from './user.service';
import { AuthGuard } from 'src/auth/authguard/auth.guard';

@ApiBearerAuth()
@UseGuards(AuthGuard)
@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(@Req() req: any, @Query() query: PaginationDTO) {
    if (!req.user?.id) {
      throw new BadRequestException(
        'Usuário autenticado não encontrado na requisição.',
      );
    }

    return this.usersService.findAll(req.user.id, query);
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    if (!req.user?.id) {
      throw new BadRequestException(
        'Usuário autenticado não encontrado na requisição.',
      );
    }

    return this.usersService.findById(id);
  }
}
