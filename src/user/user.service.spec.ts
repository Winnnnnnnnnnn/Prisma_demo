import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from 'src/prisma.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { omit } from 'lodash';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('UserService', () => {
  let service: UserService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
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
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('getAll', async () => {
    (prismaService.user.findMany as jest.Mock).mockResolvedValue(users);
    const result = await service.getAll();

    expect(result).toEqual(users);

    expect(prismaService.user.findMany).toHaveBeenCalledTimes(1);
  });

  describe('getList', () => {
    it('Trả về danh sách phân trang (truyền đủ param)', async () => {
      (prismaService.user.findMany as jest.Mock).mockImplementation(
        ({ take, skip }) => {
          return Promise.resolve(users.slice(skip, skip + take));
        },
      );
      (prismaService.user.count as jest.Mock).mockResolvedValue(users.length);
      const fillters = { page: 2, items_per_page: 4, search: '' };
      const result = await service.getList(fillters);

      expect(result).toEqual({
        data: users.slice(fillters.items_per_page * (fillters.page - 1), fillters.items_per_page * fillters.page ),
        total: users.length,
        current_page: fillters.page,
        items_per_page: fillters.items_per_page,
      });

      expect(prismaService.user.findMany).toHaveBeenCalledTimes(1);
      expect(prismaService.user.count).toHaveBeenCalledTimes(1);
    });

    it('Trả về danh sách phân trang (không truyền param, dùng default)', async () => {
      (prismaService.user.findMany as jest.Mock).mockResolvedValue(users.slice(0, 10));
      (prismaService.user.count as jest.Mock).mockResolvedValue(users.length);

      const result = await service.getList({} as any);

      expect(result).toEqual({
        data: users.slice(0, 10),
        total: users.length,
        current_page: 1,
        items_per_page: 10,
      })

      expect(prismaService.user.findMany).toHaveBeenCalledTimes(1);
      expect(prismaService.user.count).toHaveBeenCalledTimes(1);
    });
  });

  describe('getDetail', () => {
    it('Đối tượng có tồn tại', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(users[0]); 

      const result = await service.getDetail(users[0].id);

      expect(result).toEqual(users[0]);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: users[0].id },
      });
    });

    it('Đối tượng không tồn tại', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.getDetail(1000)).rejects.toMatchObject(
        new HttpException('Không tìm thấy người dùng!', HttpStatus.NOT_FOUND),
      );

      expect(prismaService.user.findUnique).toHaveBeenCalledTimes(1);
    });
  });

  describe('create', () => {
    const data = { id: 7, name: 'Win đây', phone: '0358625365' };
    const hashedPassword = 'hashedPassword';
    it('Tạo thành công', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      (prismaService.user.create as jest.Mock).mockResolvedValue({...data, password: hashedPassword});
      const result = await service.create(omit(data, 'id'));

      expect(result).toEqual({
        message: 'Đã tạo tài khoản thành công.',
        data: {...data, password: hashedPassword},
      });

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { phone: data.phone },
      });
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: omit({...data, password: hashedPassword}, 'id'),
      });
      expect(bcrypt.hash).toHaveBeenCalledTimes(1);
    });

    it('Tạo thất bại', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(data);

      await expect(service.create(omit({...data, password: hashedPassword}, 'id'))).rejects.toMatchObject(
        new HttpException(
          'Số điện thoại đã được đăng ký',
          HttpStatus.BAD_REQUEST,
        ),
      );

      expect(prismaService.user.findUnique).toHaveBeenCalledTimes(1);
    });
  })
});
