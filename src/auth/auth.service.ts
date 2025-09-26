import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { hash, compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginDto, RegisterDto } from './dtos/auth.dto';
import { omit } from 'lodash';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}

  register = async (data: RegisterDto): Promise<any> => {
    const user = await this.prismaService.user.findUnique({
      where: { phone: data.phone },
    });

    if (user) {
      throw new HttpException(
        { message: 'Số điện thoại đã được đăng ký' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const new_user = await this.prismaService.user.create({
      data: {
        ...data,
        password: await hash(data.password, 10),
      },
    });

    return {
      message: 'Đăng ký tài khoản thành công',
      data: new_user,
    };
  };

  login = async (data: LoginDto): Promise<any> => {
    const user = await this.prismaService.user.findUnique({
      where: { phone: data.phone },
    });

    if (!user) {
      throw new HttpException(
        { message: 'Tài khoản hoặc mật khẩu không hợp lệ!' },
        HttpStatus.UNAUTHORIZED,
      );
    }

    const verify = await compare(data.password, user.password);

    if (!verify) {
      throw new HttpException(
        { message: 'Tài khoản hoặc mật khẩu không hợp lệ!' },
        HttpStatus.UNAUTHORIZED,
      );
    }

    const payload = {
        id: user.id,
        name: user.name,
        phone: user.phone,
      },
      accessToken = await this.jwtService.signAsync(payload, {
        secret: process.env.ACCESS_TOKEN_KEY,
        expiresIn: '30m',
      }),
      refreshToken = await this.jwtService.signAsync(payload, {
        secret: process.env.REFRESH_TOKEN_KEY,
        expiresIn: '7d',
      });

    return {
      token: accessToken,
      user: omit(user, ['password']),
    };
  };
}
