import { Body, Controller, Post } from '@nestjs/common';
import { LoginUseCase } from './application/login.usecase';
import { SignUpUseCase } from './application/signUp.usecase';
import { LoginDto } from './dto/login.dto';
import { SignUpDto } from './dto/signUp.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly signUpUseCase: SignUpUseCase,
  ) {}

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.loginUseCase.execute(
      dto.email as string,
      dto.password as string,
    );
  }

  @Post('sign-up')
  async signUp(@Body() dto: SignUpDto) {
    return this.signUpUseCase.execute(dto);
  }

  @Post('singUp')
  async signUpBackwardCompatible(@Body() dto: SignUpDto) {
    return this.signUpUseCase.execute(dto);
  }
}
