import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { isEmpty, isUndefined } from 'lodash';
import { okResponse } from '@/common/models/apiResponse.model';
import { User } from '../domain/entity/user.entity';
import { IUserRepository } from '../domain/interface/user.repository.interface';
import { UserToken } from '../domain/token/user.repository.token';
import { SignUpDto } from '../dto/signUp.dto';

@Injectable()
export class SignUpUseCase {
  constructor(
    @Inject(UserToken.USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(signUpInfo: SignUpDto) {
    if (isUndefined(signUpInfo.email) || isUndefined(signUpInfo.password)) {
      throw new BadRequestException(
        'Thông tin email hoặc mật khẩu đang không xác định',
      );
    } else if (isEmpty(signUpInfo.email) || isEmpty(signUpInfo.password)) {
      throw new BadRequestException(
        'Thông tin email hoặc mật khẩu không để trống',
      );
    } else {
      const user = await this.userRepository.findByEmail(
        signUpInfo.email,
      );

      if (user) {
        throw new BadRequestException('Email đã tồn tại');
      }

      const passwordHashed = await bcrypt.hash(signUpInfo.password, 10);

      const newUser = new User(
        randomUUID(),
        signUpInfo.email,
        passwordHashed,
        'admin',
      );

      const savedUser = await this.userRepository.createUser(newUser);

      const payload = {
        id: savedUser.id,
        email: savedUser.email,
        role: savedUser.role,
      };

      return okResponse(
        {
          user: payload,
          accessToken: this.jwtService.sign(payload),
        },
        'Sign up successfully',
      );
    }
  }
}
