import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsStrongPassword } from 'class-validator';

export class AuthenticateDTO {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  @IsStrongPassword()
  password: string;
}
