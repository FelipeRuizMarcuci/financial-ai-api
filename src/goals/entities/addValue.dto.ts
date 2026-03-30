import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class AddValueDto {
  @ApiPropertyOptional()
  @IsNumber()
  value?: number;
}
