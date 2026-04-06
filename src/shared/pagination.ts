import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsOptional, IsString, Matches, Min } from 'class-validator';

export class PaginationDTO {
  @ApiPropertyOptional({
    description: 'Número da página (começa em 1)',
    default: 1,
  })
  @IsOptional()
  @Min(1)
  @Transform(({ value }) => Number(value))
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Número de itens por página',
    default: 30,
  })
  @IsOptional()
  @Min(1)
  @Transform(({ value }) => Number(value))
  limit?: number = 30;

  @ApiPropertyOptional({
    description: 'Busca por título',
  })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({
    description: 'Tipo da transação',
    enum: ['REVENUE', 'EXPENSE'],
  })
  @IsOptional()
  @IsIn(['REVENUE', 'EXPENSE'])
  type?: 'REVENUE' | 'EXPENSE';

  @ApiPropertyOptional({
    description: 'Filtro por mês (formato YYYY-MM)',
    example: '2026-04',
  })
  @IsOptional()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
    message: 'month deve estar no formato YYYY-MM',
  })
  month?: string;
}
