import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { AuthenticateDTO } from './dtos/authenticate.dto';
import { RecoveryDTO } from './dtos/recovery.dto';
import { ChangePasswordDTO } from './dtos/change.password.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() authenticateDto: AuthenticateDTO) {
    return this.authService.signIn(authenticateDto);
  }

  @Post('request-change-password')
  async requestChangePassword(@Body() data: RecoveryDTO) {
    return await this.authService.requestChangePassword(data);
  }

  @Post('change-password')
  async changePassword(@Body() data: ChangePasswordDTO) {
    return await this.authService.changePassword(data);
  }
}
