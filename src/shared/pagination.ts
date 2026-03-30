import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, Min } from 'class-validator';

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

  @ApiPropertyOptional()
  @IsOptional()
  q?: string;
}
