import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { LoginUseCase } from './application/login.usecase';
import { SignUpUseCase } from './application/signUp.usecase';
import { AuthController } from './auth.controller';
import { jwtConstants } from './constants/jwt.constants';
import { UserToken } from './domain/token/user.repository.token';
import { JwtAuthGuard } from './guards/jwtAuth.guard';
import { UserRepository } from './infrastructure/user.repository';

@Module({
  imports: [
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    LoginUseCase,
    SignUpUseCase,
    JwtAuthGuard,
    {
      provide: UserToken.USER_REPOSITORY,
      useClass: UserRepository,
    },
  ],
  exports: [LoginUseCase, SignUpUseCase, JwtAuthGuard, JwtModule],
})
export class AuthModule {}
