import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from '@prisma/client';
import { IsEmail, IsNumber, IsOptional, IsString } from 'class-validator';

export class TransactionDto {
  @ApiPropertyOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  type?: Type;

  @ApiPropertyOptional()
  @IsNumber()
  value?: number;

  @ApiPropertyOptional()
  @IsOptional()
  date?: Date;
}
