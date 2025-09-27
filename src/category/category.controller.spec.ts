import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { get } from 'http';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('CategoryController', () => {
  let controller: CategoryController;
  let categoryService: CategoryService;

  const mockCategoryService = {
    getAll: jest.fn(),
    getList: jest.fn(),
    getDetail: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const categories = [
    { id: 1, name: 'Thể thao', description: 'Mô tả 1' },
    { id: 2, name: 'Thời trang', description: 'Mô tả 2' },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [
        {
          provide: CategoryService,
          useValue: mockCategoryService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<CategoryController>(CategoryController);
    categoryService = module.get<CategoryService>(CategoryService);

    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('Trả về tất cả danh mục', async () => {
      (categoryService.getAll as jest.Mock).mockResolvedValueOnce(categories);
      const result = await controller.getAll();

      expect(result).toEqual(categories);
    });
  });

  describe('getList', () => {
    const fillters = { page: 1, items_per_page: 10, search: '' };

    it('Trả về danh sách phân trang (truyền đủ param)', async () => {
      (categoryService.getList as jest.Mock).mockResolvedValueOnce({
        data: categories.slice(
          fillters.items_per_page * (fillters.page - 1),
          fillters.items_per_page * fillters.page,
        ),
        total: categories.length,
        current_page: fillters.page,
        items_per_page: fillters.items_per_page,
      });
      const result = await controller.getList(fillters);

      expect(result).toEqual({
        data: categories.slice(
          fillters.items_per_page * (fillters.page - 1),
          fillters.items_per_page * fillters.page,
        ),
        total: categories.length,
        current_page: fillters.page,
        items_per_page: fillters.items_per_page,
      });

      expect(categoryService.getList).toHaveBeenCalledWith(fillters);
    });

    it('Trả về danh sách phân trang (không truyền param, dùng default)', async () => {
      (categoryService.getList as jest.Mock).mockResolvedValueOnce({
        data: categories.slice(0, 10),
        total: categories.length,
        current_page: fillters.page,
        items_per_page: fillters.items_per_page,
      });
      const result = await controller.getList({} as any);

      expect(result).toEqual({
        data: categories.slice(0, 10),
        total: categories.length,
        current_page: 1,
        items_per_page: 10,
      });

      expect(categoryService.getList).toHaveBeenCalledWith({});
    });
  });

  describe('getDetail', () => {
    it('Tìm danh mục có tồn tại', async () => {
      (categoryService.getDetail as jest.Mock).mockResolvedValueOnce(
        categories[0],
      );
      const result = await controller.getDetail(categories[0].id);

      expect(result).toEqual(categories[0]);

      expect(categoryService.getDetail).toHaveBeenCalledWith(categories[0].id);
    });

    it('Tìm danh mục không tồn tại', async () => {
      (categoryService.getDetail as jest.Mock).mockRejectedValueOnce(
        new HttpException('Không tìm thấy danh mục!', HttpStatus.NOT_FOUND),
      );

      await expect(controller.getDetail(1000)).rejects.toMatchObject(
        new HttpException('Không tìm thấy danh mục!', HttpStatus.NOT_FOUND),
      );

      expect(categoryService.getDetail).toHaveBeenCalledTimes(1);
    });
  });

  describe('create', () => {
    const id = categories.length,
      data = { id, name: 'Danh mục mới', description: 'Mô tả mới' };

    it('Tạo danh mục thành công', async () => {
      (categoryService.create as jest.Mock).mockResolvedValueOnce({
        message: `Tạo danh mục ${data.name}`,
        data: data,
      });
      const result = await controller.create(data);

      expect(result).toEqual({
        message: `Tạo danh mục ${data.name}`,
        data: data,
      });

      expect(categoryService.create).toHaveBeenCalledWith(data);
    });

    it('Tạo danh mục thất bại', async () => {
      (categoryService.create as jest.Mock).mockRejectedValueOnce(
        new HttpException(
          'Đã xảy ra lỗi! Vui lòng thử lại sau.',
          HttpStatus.BAD_REQUEST,
        ),
      );

      await expect(controller.create(data)).rejects.toMatchObject(
        new HttpException(
          'Đã xảy ra lỗi! Vui lòng thử lại sau.',
          HttpStatus.BAD_REQUEST,
        ),
      );

      expect(categoryService.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    const newData = { ...categories[0], name: 'Tên mới nè' };

    it('Cập nhật danh mục thành cong', async () => {
      (categoryService.update as jest.Mock).mockResolvedValueOnce({
        message: `Cập nhật danh mục ${newData.name}`,
        data: newData,
      });
      const result = await controller.update(categories[0].id, newData);

      expect(result).toEqual({
        message: `Cập nhật danh mục ${newData.name}`,
        data: newData,
      });

      expect(categoryService.update).toHaveBeenCalledWith(
        categories[0].id,
        newData,
      );
    });

    it('Cập nhật danh mục thất bại', async () => {
      (categoryService.update as jest.Mock).mockRejectedValueOnce(
        new HttpException(
          'Đã xảy ra lỗi! Vui lòng thử lại sau.',
          HttpStatus.BAD_REQUEST,
        ),
      );

      await expect(
        controller.update(categories[0].id, newData),
      ).rejects.toMatchObject(
        new HttpException(
          'Đã xảy ra lỗi! Vui lòng thử lại sau.',
          HttpStatus.BAD_REQUEST,
        ),
      );

      expect(categoryService.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('delete', () => {
    it('Xoá danh mục thành công', async () => {
      (categoryService.delete as jest.Mock).mockResolvedValueOnce({
        message: `Xóa thành công danh mục  ${categories[0].name}`,
      });
      const result = await controller.delete(categories[0].id);

      expect(result).toEqual({
        message: `Xóa thành công danh mục  ${categories[0].name}`,
      });

      expect(categoryService.delete).toHaveBeenCalledWith(categories[0].id);
    });

    it('Xoá danh mục thất bại', async () => {
      (categoryService.delete as jest.Mock).mockRejectedValueOnce(
        new HttpException(
          'Đã xảy ra lỗi! Vui lòng thử lại sau.',
          HttpStatus.BAD_REQUEST,
        ),
      );

      await expect(controller.delete(categories[0].id)).rejects.toMatchObject(
        new HttpException(
          'Đã xảy ra lỗi! Vui lòng thử lại sau.',
          HttpStatus.BAD_REQUEST,
        ),
      );

      expect(categoryService.delete).toHaveBeenCalledTimes(1);
    });
  });
});
