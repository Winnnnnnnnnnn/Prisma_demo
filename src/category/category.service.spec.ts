import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from './category.service';
import { PrismaService } from 'src/prisma.service';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('CategoryService', () => {
  let service: CategoryService;
  let prismaService: PrismaService;

  const categories = [
    { id: 1, name: 'Thể thao', description: 'Mô tả 1' },
    { id: 2, name: 'Thời trang', description: 'Mô tả 2' },
  ];
  const category = { id: 3, name: 'Ẩm thực', description: 'Mô tả mới' };

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
    it('Trả về tất cả danh mục', async () => {
      (prismaService.category.findMany as jest.Mock).mockResolvedValue(categories);

      const result = await service.getAll();

      expect(result).toEqual(categories);
      expect(prismaService.category.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('getList', () => {
      it('Trả về danh sách phân trang (truyền đủ param)', async () => {
        (prismaService.category.findMany as jest.Mock).mockResolvedValue(categories);
        (prismaService.category.count as jest.Mock).mockResolvedValue(categories.length);
        const fillters = { page: 1, items_per_page: 10, search: '' };
        const result = await service.getList(fillters);

        expect(result).toEqual({
          data: categories,
          total: categories.length,
          current_page: fillters.page,
          items_per_page: fillters.items_per_page,
        });
      });

      it('Trả về danh sách phân trang (không truyền param, dùng default)', async () => {
        (prismaService.category.findMany as jest.Mock).mockResolvedValue(categories);
        (prismaService.category.count as jest.Mock).mockResolvedValue(categories.length);

        const result = await service.getList({} as any);

        expect(result).toEqual({
          data: categories,
          total: categories.length,
          current_page: 1, // mặc định
          items_per_page: 10, // mặc định
        });
      });
  });

  describe('getDetail', () => {
    it('Tìm danh mục có tồn tại', async () => {
      (prismaService.category.findUnique as jest.Mock).mockResolvedValue(categories[0]);

      const result = await service.getDetail(1);

      expect(result).toEqual(categories[0]);

      expect(prismaService.category.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('Tìm danh mục không tồn tại', async () => {
      (prismaService.category.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.getDetail(categories[0].id)).rejects.toMatchObject(
        new HttpException('Không tìm thấy danh mục!', HttpStatus.NOT_FOUND),
      );
      expect(prismaService.category.findUnique).toHaveBeenCalledTimes(1);
    });
  });

  describe('create', () => {
    it('Tạo thành công', async () => {
      (prismaService.category.create as jest.Mock).mockResolvedValue(category);

      const result = await service.create(category);

      expect(result).toEqual({
        message: `Tạo thành công danh mục ${category.name}`,
        data: category,
      });

      expect(prismaService.category.create).toHaveBeenCalledWith({
        data: category,
      });
    });

    it('Tạo thất bại', async () => {
      (prismaService.category.create as jest.Mock).mockRejectedValue(
        new Error('DB error'),
      );

      await expect(
        service.create(category),
      ).rejects.toMatchObject(
        new HttpException(
          'Đã xảy ra lỗi! Vui lòng thử lại sau.',
          HttpStatus.BAD_REQUEST,
        ),
      );

      expect(prismaService.category.create).toHaveBeenCalledWith({
        data: category,
      });
    });
  });

  describe('update', () => {
    const name = 'Tên mới',
      description = 'Mô tả mới';
    it('Cập nhật thành công', async () => {
      (prismaService.category.update as jest.Mock).mockResolvedValue({
        ...categories[1],
        name,
        description,
      });

      const result = await service.update(categories[1].id, { name , description });

      expect(result).toEqual({
        message: `Cập nhật thành công danh mục ` + name,
        data: { ...categories[1], name , description},
      });

      expect(prismaService.category.update).toHaveBeenCalledWith({
        where: { id: categories[1].id },
        data: { name , description},
      });
    });

    it('Cập nhật thất bại', async () => {
      (prismaService.category.update as jest.Mock).mockRejectedValue(
        new Error('DB error'),
      );

      await expect(service.update(2, { name, description })).rejects.toMatchObject(
        new HttpException(
          'Đã xảy ra lỗi! Vui lòng thử lại sau.',
          HttpStatus.BAD_REQUEST,
        ),
      );

      expect(prismaService.category.update).toHaveBeenCalledWith({
        where: { id: 2 },
        data: { name, description },
      });
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
        where: { id: categories[0].id },
      });
    });

    it('Xóa thất bại', async () => {
      (prismaService.category.delete as jest.Mock).mockRejectedValue(
        new Error('DB error'),
      );

      await expect(service.delete(1)).rejects.toMatchObject(
        new HttpException(
          'Đã xảy ra lỗi! Vui lòng thử lại sau.',
          HttpStatus.BAD_REQUEST,
        ),
      );
      expect(prismaService.category.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });
});
