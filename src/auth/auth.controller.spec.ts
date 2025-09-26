import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { LoginDto, RegisterDto } from './dtos/auth.dto';
import { omit } from 'lodash';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    login: jest.fn(),
    register: jest.fn(),
  };

  const userData = {
    id: 1,
    phone: '0358624125',
    name: 'Lê Hoàng Win',
    password: '123456',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  describe('register', () => {
    it('Đăng ký thành công', async () => {
      (mockAuthService.register as jest.Mock).mockResolvedValue({
        message: 'Đăng ký tài khoản thành công',
        data: userData,
      });

      const dto: RegisterDto = userData;
      const result = await controller.register(dto);

      expect(result).toEqual({
        message: 'Đăng ký tài khoản thành công',
        data: userData,
      });

      expect(mockAuthService.register).toHaveBeenCalledWith(dto);
    });

    it('Số điện thoại đã được đăng ký', async () => {
      (mockAuthService.register as jest.Mock).mockRejectedValue(
        new HttpException(
          'Số điện thoại đã được đăng ký',
          HttpStatus.BAD_REQUEST,
        ),
      );

      const dto: RegisterDto = userData;

      await expect(controller.register(dto)).rejects.toMatchObject(
        new HttpException(
          { message: 'Số điện thoại đã được đăng ký' },
          HttpStatus.BAD_REQUEST,
        ),
      );

      expect(mockAuthService.register).toHaveBeenCalledWith(dto);
    });
  });

  describe('login', () => {
    it('Đăng nhập thành công', async () => {
      (mockAuthService.login as jest.Mock).mockResolvedValue({
        token: 'token',
        user: userData,
      });

      const dto: LoginDto = {
        phone: userData.phone,
        password: userData.password,
      };
      const result = await controller.login(dto);

      expect(result).toEqual({
        token: 'token',
        user: userData,
      });

      expect(mockAuthService.login).toHaveBeenCalledWith(dto);
    });

    it('Đăng nhập sai số điện thoại', async () => {
      (mockAuthService.login as jest.Mock).mockRejectedValue(
        new HttpException( { message: 'Tài khoản hoặc mật từ không hợp lệ!' },
          HttpStatus.UNAUTHORIZED,
        ),
      );

      const dto: LoginDto = {
        phone: '0358624126',
        password: userData.password,
      };
      const result = await controller.login(dto);

      await expect(result).rejects.toMatchObject(
        new HttpException(
          { message: 'Tài khoản hoặc mật từ không hợp lệ!' },
          HttpStatus.UNAUTHORIZED,
        ),
      );

      expect(mockAuthService.login).toHaveBeenCalledWith(dto);
    });

    it('Đăng nhập sai mật khẩu', async () => {
      (mockAuthService.login as jest.Mock).mockRejectedValue(
        new HttpException(
          'Tài khoản hoặc mật khẩu không hợp lệ!',
          HttpStatus.UNAUTHORIZED,
        ),
      );

      const dto: LoginDto = { phone: userData.phone, password: 'matkhausai' };

      await expect(controller.login(dto)).rejects.toThrow(HttpException);
      await expect(controller.login(dto)).rejects.toMatchObject({
        message: 'Tài khoản hoặc mật khẩu không hợp lệ!',
        status: HttpStatus.UNAUTHORIZED,
      });

      expect(mockAuthService.login).toHaveBeenCalledWith(dto);
    });
  });
});
