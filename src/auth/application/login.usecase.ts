import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { okResponse } from '@/common/models/apiResponse.model';
import { IUserRepository } from '../domain/interface/user.repository.interface';
import { UserToken } from '../domain/token/user.repository.token';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(UserToken.USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);

    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    return okResponse(
      {
        user: payload,
        accessToken: this.jwtService.sign(payload),
      },
      'Login successfully',
    );
  }
}
