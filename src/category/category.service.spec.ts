import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from './category.service';
import { PrismaService } from 'src/prisma.service';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('CategoryService', () => {
  let service: CategoryService;
  let prismaService: PrismaService;

  const categories = [
    { id: 1, name: 'Thể thao' },
    { id: 2, name: 'Thời trang' },
  ];
  const category = { id: 3, name: 'Ẩm thực' };

  const mockPrismaService = {
    category: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('Trả về danh sách danh mục', async () => {
      (prismaService.category.findMany as jest.Mock).mockResolvedValue(
        categories,
      );

      const result = await service.getAll();

      expect(result).toEqual(categories);
      expect(prismaService.category.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('getList', () => {
    it('Trả về danh sách phân trang', async () => {
      (prismaService.category.findMany as jest.Mock).mockResolvedValue(
        categories,
      );
      (prismaService.category.count as jest.Mock).mockResolvedValue(1);

      const result = await service.getList({
        page: 1,
        items_per_page: 10,
        search: '',
      });

      expect(result).toEqual({
        data: categories,
        total: 1,
        current_page: 1,
        items_per_page: 10,
      });
      expect(prismaService.category.findMany).toHaveBeenCalledTimes(1);
      expect(prismaService.category.count).toHaveBeenCalledTimes(1);
    });
  });

  describe('getDetail', () => {
    it('Tìm danh mục có tồn tại', async () => {
      (prismaService.category.findUnique as jest.Mock).mockResolvedValue(
        categories[0],
      );

      const result = await service.getDetail(1);

      expect(result).toEqual(categories[0]);
      expect(prismaService.category.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(prismaService.category.findUnique).toHaveBeenCalledTimes(1);
    });

    it('Tìm danh mục không tồn tại', async () => {
      (prismaService.category.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.getDetail(1)).rejects.toThrow(HttpException);
      await expect(service.getDetail(1)).rejects.toThrow(
        'Không tìm thấy danh mục!',
      );
      expect(prismaService.category.findUnique).toHaveBeenCalledTimes(1);
    });
  });

  describe('create', () => {
    it('Tạo thành công', async () => {
      (prismaService.category.create as jest.Mock).mockResolvedValue(category);

      const result = await service.create({ name: category.name });

      expect(result).toEqual({
        message: `Tạo thành công danh mục ${category.name}`,
        data: category,
      });
      expect(prismaService.category.create).toHaveBeenCalledWith({
        data: { name: category.name },
      });
    });

    it('Tạo thất bại', async () => {
      (prismaService.category.create as jest.Mock).mockRejectedValue(
        new Error('DB error'),
      );

      await expect(service.create({ name: category.name })).rejects.toThrow(
        HttpException,
      );
      await expect(service.create({ name: category.name })).rejects.toThrow(
        'Đã xảy ra lỗi! Vui lòng thử lại sau.',
      );
      expect(prismaService.category.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    const name = 'Tên mới';
    it('Cập nhật thành công', async () => {
      (prismaService.category.update as jest.Mock).mockResolvedValue({
        ...categories[1],
        name,
      });

      const result = await service.update(2, { name });

      expect(result).toEqual({
        message: `Cập nhật thành công danh mục Tên mới`,
        data: { ...categories[1], name },
      });

      expect(prismaService.category.update).toHaveBeenCalledWith({
        where: { id: 2 },
        data: { ...categories[1], name },
      });
      expect(prismaService.category.update).toHaveBeenCalledTimes(1);
    });

    it('Cập nhật thất bại', async () => {
      (prismaService.category.update as jest.Mock).mockRejectedValue(
        new Error('DB error'),
      );

      await expect(service.update(2, { name })).rejects.toThrow(HttpException);
      await expect(service.update(2, { name })).rejects.toThrow(
        'Đã xảy ra lỗi! Vui lòng thử lại sau.',
      );
      expect(prismaService.category.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('delete', () => {
    it('Xóa thành công', async () => {
      (prismaService.category.delete as jest.Mock).mockResolvedValue(
        categories[0],
      );

      const result = await service.delete(1);

      expect(result).toEqual({
        message: `Xóa thành công danh mục ${categories[0].name}`,
      });

      expect(prismaService.category.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(prismaService.category.delete).toHaveBeenCalledTimes(1);
    });

    it('Xóa thất bại', async () => {
      (prismaService.category.delete as jest.Mock).mockRejectedValue(
        new Error('DB error'),
      );

      await expect(service.delete(1)).rejects.toThrow(HttpException);
      await expect(service.delete(1)).rejects.toThrow(
        'Đã xảy ra lỗi! Vui lòng thử lại sau.',
      );
      expect(prismaService.category.delete).toHaveBeenCalledTimes(1);
    });
  });
});
