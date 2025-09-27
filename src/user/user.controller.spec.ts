import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { HttpException, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  const mockUserService = {
    getAll: jest.fn(),
    getList: jest.fn(),
    getDetail: jest.fn(),
  };
  const users = [
    { id: 1, name: 'Lê Hoàng Win', phone: '0358624125' },
    { id: 2, name: 'Win ne', phone: '0358624126' },
    { id: 3, name: 'Tui nè', phone: '0358624127' },
    { id: 4, name: 'Win đây', phone: '0358624128' },
    { id: 5, name: 'Tui đây', phone: '0358624129' },
    { id: 6, name: 'Lê Hoàng Thắng', phone: '0358624130' },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);

    jest.clearAllMocks();
  });

  it('getAll', async () => {
    (userService.getAll as jest.Mock).mockResolvedValueOnce(users);

    const result = await controller.getAll();

    expect(result).toEqual(users);

    expect(userService.getAll).toHaveBeenCalledTimes(1);
  });

  describe('getList', () => {
    it('Trả về danh sách phân trang (truyền đủ param)', async () => {
      (userService.getList as jest.Mock).mockImplementation(
        async ({ page, items_per_page }) => {
          const skip = (page - 1) * items_per_page;
          const take = items_per_page;
          return {
            data: users.slice(skip, skip + take),
            total: users.length,
            current_page: page,
            items_per_page,
          };
        },
      );
      const fillters = { page: 2, items_per_page: 4, search: '' };
      const result = await controller.getList(fillters);

      expect(result).toEqual({
        data: users.slice(
          fillters.items_per_page * (fillters.page - 1),
          fillters.items_per_page * fillters.page,
        ),
        total: users.length,
        current_page: fillters.page,
        items_per_page: fillters.items_per_page,
      });

      expect(userService.getList).toHaveBeenCalledTimes(1);
    });

    it('Trả về danh sách phân trang (không truyền param, dùng default)', async () => {
      (userService.getList as jest.Mock).mockResolvedValue({
        data: users.slice(0, 10),
        total: users.length,
        current_page: 1,
        items_per_page: 10,
      });
      const result = await controller.getList({} as any);

      expect(result).toEqual({
        data: users.slice(0, 10),
        total: users.length,
        current_page: 1,
        items_per_page: 10,
      });

      expect(userService.getList).toHaveBeenCalledTimes(1);
    });
  });

  describe('getDetail', () => {
    it('Đối tượng có tồn tại', async () => {
      (userService.getDetail as jest.Mock).mockResolvedValueOnce(users[0]);

      const result = await controller.getDetail(users[0].id);

      expect(result).toEqual(users[0]);

      expect(userService.getDetail).toHaveBeenCalledWith(users[0].id);
    });

    it('Đối tượng không tồn tại', async () => {
      (userService.getDetail as jest.Mock).mockRejectedValueOnce(
        new HttpException('Không tìm thấy người dùng!', HttpStatus.NOT_FOUND),
      );

      await expect(controller.getDetail(1000)).rejects.toMatchObject(
        new HttpException('Không tìm thấy người dùng!', HttpStatus.NOT_FOUND),
      );

      expect(userService.getDetail).toHaveBeenCalledTimes(1);
    });
  });
});
