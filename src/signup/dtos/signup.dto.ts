import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsStrongPassword,
  IsNumber,
} from 'class-validator';
import { IsCpfValid } from 'src/shared/validators/cpf.cnpj.validator';
import { IsEqual } from 'src/shared/validators/is-equal';

export class SignupDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  @IsStrongPassword()
  password: string;

  @ApiProperty()
  @IsString()
  @IsEqual('password')
  confirmPassword?: string;
}
