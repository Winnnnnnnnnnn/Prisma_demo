import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from 'src/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { HttpException, HttpStatus } from '@nestjs/common';
import { omit } from 'lodash';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  const userData = {
    id: 1,
    phone: '0358624125',
    password: '123456',
    name: 'Lê Hoàng Win',
    createdAt: new Date(),
  };

  const mockPrismaService = {
    user: {
      create: jest.fn().mockResolvedValue(userData),
      findUnique: jest.fn(),
    },
  };
  const mockJwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  describe('Đăng ký', () => {
    it('Đăng ký thành công', async () => {
      const hashedPassword = 'hashedPassword';
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const result = await service.register(userData);

      expect(result).toEqual({
        message: 'Đăng ký tài khoản thành công',
        data: userData,
      });

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { phone: userData.phone },
      });
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: { ...userData, password: hashedPassword },
      });
      expect(bcrypt.hash).toHaveBeenCalledTimes(1);
    });

    it('Số điện thoại được đăng ký', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(userData);

      const result = service.register(userData);

      await expect(result).rejects.toMatchObject(
        new HttpException(
          { message: 'Số điện thoại đã được đăng ký' },
          HttpStatus.BAD_REQUEST,
        ),
      );

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { phone: userData.phone },
      });
    });
  });

  describe('Đăng nhập', () => {
    it('Đăng nhập thành công', async () => {
      const token = 'token';
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(userData);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwtService.signAsync as jest.Mock).mockResolvedValue(token);

      const result = await service.login(userData);

      expect(result).toEqual({
        token,
        user: omit(userData, ['password']),
      });

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { phone: userData.phone },
      });
      expect(bcrypt.compare).toHaveBeenCalledTimes(1);
      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
    });

    it('Đăng nhập sai số điện thoại', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.login(userData)).rejects.toMatchObject(
        new HttpException(
          { message: 'Tài khoản hoặc mật khẩu không hợp lệ!' },
          HttpStatus.UNAUTHORIZED,
        ),
      );

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { phone: '0358624125' },
      });
    });

    it('Đăng nhập sai mật khẩu', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(userData);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(userData)).rejects.toMatchObject(
        new HttpException(
          { message: 'Tài khoản hoặc mật khẩu không hợp lệ!' },
          HttpStatus.UNAUTHORIZED,
        ),
      );

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { phone: '0358624125' },
      });
      expect(bcrypt.compare).toHaveBeenCalledTimes(1);
    });
  });
});
