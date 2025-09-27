import { Test, TestingModule } from '@nestjs/testing';
import { NewsService } from './news.service';
import { PrismaService } from 'src/prisma.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { omit } from 'lodash';

describe('NewsService', () => {
  let service: NewsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    news: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };
  const news = [
    { id: 1, title: 'Tieu de', content: 'Noi dung' },
    { id: 2, title: 'Tieu de 2', content: 'Noi dung 2' },
    { id: 3, title: 'Tieu de 3', content: 'Noi dung 3' },
    { id: 4, title: 'Tieu de 4', content: 'Noi dung 4' },
    { id: 5, title: 'Tieu de 5', content: 'Noi dung 5' },
    { id: 6, title: 'Tieu de 6', content: 'Noi dung 6' },
  ];

  const data = { id: 7, title: 'Tieu de moi', content: 'Noi dung moi' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NewsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<NewsService>(NewsService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('getAll', async () => {
    (prismaService.news.findMany as jest.Mock).mockResolvedValueOnce(news);

    const result = await service.getAll();
    expect(result).toEqual(news);

    expect(prismaService.news.findMany).toHaveBeenCalledTimes(1);
  });

  describe('getList', () => {
    it('Trả về danh sách phân trang (truyền đủ param)', async () => {
      (prismaService.news.findMany as jest.Mock).mockImplementation(
        ({ take, skip }) => {
          return Promise.resolve(news.slice(skip, skip + take));
        },
      );
      (prismaService.news.count as jest.Mock).mockResolvedValue(news.length);
      const fillters = { page: 2, items_per_page: 4, search: '' };
      const result = await service.getList(fillters);

      expect(result).toEqual({
        data: news.slice(
          fillters.items_per_page * (fillters.page - 1),
          fillters.items_per_page * fillters.page,
        ),
        total: news.length,
        current_page: fillters.page,
        items_per_page: fillters.items_per_page,
      });

      expect(prismaService.news.findMany).toHaveBeenCalledTimes(1);
      expect(prismaService.news.count).toHaveBeenCalledTimes(1);
    });

    it('Trả về danh sách phân trang (không truyền param, dùng default)', async () => {
      (prismaService.news.findMany as jest.Mock).mockResolvedValue(news.slice(0, 10));
      (prismaService.news.count as jest.Mock).mockResolvedValue(news.length);

      const result = await service.getList({} as any);

      expect(result).toEqual({
        data: news.slice(0, 10),
        total: news.length,
        current_page: 1, 
        items_per_page: 10,
      });

      expect(prismaService.news.findMany).toHaveBeenCalledTimes(1);
      expect(prismaService.news.count).toHaveBeenCalledTimes(1);
    });
  });

  describe('getDetail', () => {
    it('Có tồn tại', async () => {
      (prismaService.news.findUnique as jest.Mock).mockResolvedValue(news[0]);

      const result = await service.getDetail(news[0].id);

      expect(result).toEqual(news[0]);

      expect(prismaService.news.findUnique).toHaveBeenCalledWith({
        where: { id: news[0].id },
      });
    });

    it('Không tồn tại', async () => {
      (prismaService.news.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.getDetail(1000)).rejects.toMatchObject(
        new HttpException('Không tìm thấy bài viết!', HttpStatus.NOT_FOUND),
      );

      expect(prismaService.news.findUnique).toHaveBeenCalledTimes(1);
    });
  });

  describe('create', () => {
    it('Tạo bài viết', async () => {
      (prismaService.news.create as jest.Mock).mockResolvedValue(data);

      const result = await service.create(omit(data, 'id'));

      expect(result).toEqual({
        message: 'Đã tạo bài viết ' + data.title,
        data,
      });

      expect(prismaService.news.create).toHaveBeenCalledWith({
        data: omit(data, 'id'),
      });
    });

    it('Tạo thất bại', async () => {
      (prismaService.news.create as jest.Mock).mockRejectedValue(
        new Error('DB error'),
      );

      await expect(service.create(omit(data, 'id'))).rejects.toMatchObject(
        new HttpException(
          'Đã xảy ra lỗi! Vui lòng thử lại sau.',
          HttpStatus.BAD_REQUEST,
        ),
      );

      expect(prismaService.news.create).toHaveBeenCalledWith({
        data: omit(data, 'id'),
      });
    });
  });

  describe('update', () => {
    const newData = {
      ...data,
      title: 'Cap nhat tieu de',
      content: 'Cap nhat noi dung',
    };
    it('Cập nhật thành công', async () => {
      (prismaService.news.update as jest.Mock).mockResolvedValue(newData);

      const result = await service.update(newData.id, omit(newData, 'id'));

      expect(result).toEqual({
        message: 'Đã cập nhật bài viết ' + newData.title,
        data: newData,
      });

      expect(prismaService.news.update).toHaveBeenCalledWith({
        where: { id: data.id },
        data: omit(newData, 'id'),
      });
    });

    it('Cập nhật thất bại', async () => {
      (prismaService.news.update as jest.Mock).mockRejectedValue(
        new Error('DB error'),
      );

      await expect(
        service.update(newData.id, omit(newData, 'id')),
      ).rejects.toMatchObject(
        new HttpException(
          'Đã xảy ra lỗi! Vui lòng thử lại sau.',
          HttpStatus.BAD_REQUEST,
        ),
      );

      expect(prismaService.news.update).toHaveBeenCalledWith({
        where: { id: newData.id },
        data: omit(newData, 'id'),
      });
    });
  });

  describe('delete', () => {
    it('Xóa thành công', async () => {
      (prismaService.news.delete as jest.Mock).mockResolvedValue(news[0]);

      const result = await service.delete(news[0].id);

      expect(result).toEqual({
        message: 'Đã xóa bài viết ' + news[0].title,
      });

      expect(prismaService.news.delete).toHaveBeenCalledWith({
        where: { id: news[0].id },
      });
    });

    it('Xóa thất bại', async () => {
      (prismaService.news.delete as jest.Mock).mockRejectedValue(
        new Error('DB error'),
      );

      await expect(service.delete(news[0].id)).rejects.toMatchObject(
        new HttpException(
          'Đã xảy ra lỗi! Vui lòng thử lại sau.',
          HttpStatus.BAD_REQUEST,
        ),
      );

      expect(prismaService.news.delete).toHaveBeenCalledWith({
        where: { id: news[0].id },
      });
    });
  });
});
