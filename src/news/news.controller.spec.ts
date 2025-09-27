import { Test, TestingModule } from '@nestjs/testing';
import { NewsController } from './news.controller';
import { NewsService } from './news.service';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { HttpException, HttpStatus } from '@nestjs/common';
import { omit } from 'lodash';

describe('NewsController', () => {
  let controller: NewsController;
  let newsService: NewsService;

  const mockNewsService = {
    getAll: jest.fn(),
    getList: jest.fn(),
    getDetail: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  const news = [
    { id: 1, title: 'Tieu de', content: 'Noi dung' },
    { id: 2, title: 'Tieu de 2', content: 'Noi dung 2' },
    { id: 3, title: 'Tieu de 3', content: 'Noi dung 3' },
    { id: 4, title: 'Tieu de 4', content: 'Noi dung 4' },
    { id: 5, title: 'Tieu de 5', content: 'Noi dung 5' },
    { id: 6, title: 'Tieu de 6', content: 'Noi dung 6' },
  ];

  const data = { id: 4, title: 'Tieu de moi', content: 'Noi dung moi' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NewsController],
      providers: [
        {
          provide: NewsService,
          useValue: mockNewsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<NewsController>(NewsController);
    newsService = module.get<NewsService>(NewsService);

    jest.clearAllMocks();
  });

  it('getAll', async () => {
    (newsService.getAll as jest.Mock).mockResolvedValueOnce(news);

    const result = await controller.getAll();

    expect(result).toEqual(news);

    expect(newsService.getAll).toHaveBeenCalledTimes(1);
  });

  describe('getList', () => {
    it('Trả về danh sách phân trang (truyền đủ param)', async () => {
      const fillters = { page: 1, items_per_page: 4, search: '' };
      (newsService.getList as jest.Mock).mockResolvedValueOnce({
        data: news.slice(fillters.items_per_page * (fillters.page - 1), fillters.items_per_page * fillters.page),
        total: news.length,
        current_page: fillters.page,
        items_per_page: fillters.items_per_page,
      });
      const result = await controller.getList(fillters);

      expect(result).toEqual({
        data: news.slice(fillters.items_per_page * (fillters.page - 1), fillters.items_per_page * fillters.page),
        total: news.length,
        current_page: fillters.page,
        items_per_page: fillters.items_per_page,
      });

      expect(newsService.getList).toHaveBeenCalledWith(fillters);
    });

    it('Trả về danh sách phân trang (không truyền param, dùng default)', async () => {
      (newsService.getList as jest.Mock).mockResolvedValueOnce({
        data: news.slice(0, 10),
        total: news.length,
        current_page: 1,
        items_per_page: 10,
      });
      const result = await controller.getList({} as any);

      expect(result).toEqual({
        data: news.slice(0, 10),
        total: news.length,
        current_page: 1,
        items_per_page: 10,
      });

      expect(newsService.getList).toHaveBeenCalledWith({});
    });
  });

  describe('getDetail', () => {
    it('Đối tượng có tồn tại', async () => {
      const id = news[0].id;
      (newsService.getDetail as jest.Mock).mockResolvedValueOnce(news[0]);

      const result = await controller.getDetail(id);

      expect(result).toEqual(news[0]);

      expect(newsService.getDetail).toHaveBeenCalledWith(id);
    });

    it('Đối tượng không tồn tại', async () => {
      const id = 1000;
      (newsService.getDetail as jest.Mock).mockRejectedValue(
        new HttpException('Không tìm thấy bài viết!', HttpStatus.NOT_FOUND),
      );

      await expect(controller.getDetail(id)).rejects.toMatchObject(
        new HttpException('Không tìm thấy bài viết!', HttpStatus.NOT_FOUND),
      );

      expect(newsService.getDetail).toHaveBeenCalledWith(id);
    });
  });

  describe('create', () => {
    it('Tạo thành công', async () => {
      (newsService.create as jest.Mock).mockResolvedValue({
        message: 'Đã tạo bài viết ' + data.title,
        data,
      });

      const result = await controller.create(omit(data, 'id'));

      expect(result).toEqual({
        message: 'Đã tạo bài viết ' + data.title,
        data,
      });

      expect(newsService.create).toHaveBeenCalledWith(omit(data, 'id'));
    });

    it('Tạo thất bại', async () => {
      (newsService.create as jest.Mock).mockRejectedValue(
        new HttpException('DB error', HttpStatus.BAD_REQUEST),
      );

      await expect(controller.create(omit(data, 'id'))).rejects.toMatchObject(
        new HttpException('DB error', HttpStatus.BAD_REQUEST),
      );

      expect(newsService.create).toHaveBeenCalledWith(omit(data, 'id'));
    });
  });

  describe('update', () => { 
    const newData = { ...data, title: 'Cap nhat tieu de', 'content': 'Cap nhat noi dung' };

    it('Cập nhật thành công', async () => {
      (newsService.update as jest.Mock).mockResolvedValue({
        message: 'Đã cập nhật bài viết ' + newData.title,
        data: newData
      });
      const result = await controller.update(newData.id, omit(newData, 'id'));

      expect(result).toEqual({
        message: 'Đã cập nhật bài viết ' + newData.title,
        data: newData
      });

      expect(newsService.update).toHaveBeenCalledWith(newData.id, omit(newData, 'id'));
    });

    it('Cập nhật thất bại', async () => {
      (newsService.update as jest.Mock).mockRejectedValue(
        new HttpException('DB error', HttpStatus.BAD_REQUEST),
      );

      await expect(controller.update(newData.id, omit(newData, 'id'))).rejects.toMatchObject(
        new HttpException('DB error', HttpStatus.BAD_REQUEST),
      );

      expect(newsService.update).toHaveBeenCalledWith(newData.id, omit(newData, 'id'));
    })
  });

  describe('delete', () => {
    const id = news[0].id;

    it('Xóa thành công', async () => {
      (newsService.delete as jest.Mock).mockResolvedValue({
        message: 'Đã xóa bài viết ' + news[0].title,
      });

      const result = await controller.delete(id);

      expect(result).toEqual({
        message: 'Đã xóa bài viết ' + news[0].title,
      });

      expect(newsService.delete).toHaveBeenCalledWith(id);
    });

    it('Xóa thất bại', async () => {
      (newsService.delete as jest.Mock).mockRejectedValue(
        new HttpException('DB error', HttpStatus.BAD_REQUEST),
      );

      await expect(controller.delete(id)).rejects.toMatchObject(
        new HttpException('DB error', HttpStatus.BAD_REQUEST),
      );

      expect(newsService.delete).toHaveBeenCalledWith(id);
    });
  })
});
