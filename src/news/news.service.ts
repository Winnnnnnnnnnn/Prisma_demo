import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { createNewsDto, updateNewsDto } from './dtos/news.dto';
import type { NewsFillterDto } from './dtos/news.dto';

@Injectable()
export class NewsService {
  constructor(private PrismaService: PrismaService) {}

  async getAll() {
    return await this.PrismaService.news.findMany();
  }

  async getList(fillters: NewsFillterDto) {
    const items_per_page = Number(fillters.items_per_page) || 10,
      page = Number(fillters.page) || 1,
      search = fillters.search || '';

    const skip = (page - 1) * items_per_page;

    const news = await this.PrismaService.news.findMany({
      take: items_per_page,
      skip: skip,
      where: {
        OR: [
          { title: { contains: search } },
          { owner: { name: { contains: search } } },
          { category: { name: { contains: search } } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    const total = await this.PrismaService.news.count({
      where: {
        OR: [
          { title: { contains: search } },
          { owner: { name: { contains: search } } },
          { category: { name: { contains: search } } },
        ],
      },
    });

    return {
      data: news,
      total,
      current_page: page,
      items_per_page,
    };
  }

  async getDetail(id: number) {
    const news = await this.PrismaService.news.findUnique({ where: { id } });
    if (!news) {
      throw new HttpException(
        'Không tìm thấy bài viết! ',
        HttpStatus.NOT_FOUND,
      );
    }
    return news;
  }

  async create(data: createNewsDto) {
    try {
      const news = await this.PrismaService.news.create({ data });
      return {
        message: 'Đã tạo bài viết ' + news.title,
        data: news,
      };
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Đã xảy ra lỗi! Vui lòng thử lại sau. ',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async update(id: number, data: updateNewsDto) {
    try {
      const news = await this.PrismaService.news.update({
        where: { id },
        data: { ...data },
      });
      return {
        message: 'Đã cập nhật bài viết ' + news.title,
        data: news,
      };
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Đã xảy ra lỗi! Vui lòng thử lại sau. ',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async delete(id: number) {
    try {
      const news = await this.PrismaService.news.delete({ where: { id } });
      return {
        message: 'Đã xóa bài viết ' + news.title,
      };
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Đã xảy ra lỗi! Vui lòng thử lại sau. ',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
