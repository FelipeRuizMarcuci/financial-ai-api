import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class RecoveryDTO {
  @ApiProperty()
  @IsEmail()
  email: string;
}
