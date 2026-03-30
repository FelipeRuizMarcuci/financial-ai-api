import { Body, Controller, Post } from '@nestjs/common';
import { SignupService } from './signup.service';
import { ApiTags } from '@nestjs/swagger';
import { SignupDTO } from './dtos/signup.dto';

@ApiTags('Signup')
@Controller('signup')
export class SignupController {
  constructor(private readonly signupService: SignupService) {}

  @Post()
  async signup(@Body() data: SignupDTO) {
    return await this.signupService.create(data);
  }
}
