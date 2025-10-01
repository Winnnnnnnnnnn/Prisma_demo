import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import {
  CategoryFillerDto,
  CreateCategoryDto,
  UpdateCategoryDto,
} from './dtos/category.dto';
import { Category } from 'generated/prisma';

@Injectable()
export class CategoryService {
  constructor(private PrismaService: PrismaService) {}

    async getAll(): Promise<Category[]> {
      return await this.PrismaService.category.findMany();
    }

  async getList(fillters: CategoryFillerDto) {
    const items_per_page = Number(fillters.items_per_page) || 10,
      page = Number(fillters.page) || 1,
      search = fillters.search || '';

    const skip = (page - 1) * items_per_page;

    const categories = await this.PrismaService.category.findMany({
      take: items_per_page,
      skip: skip,
      where: {
        OR: [{ name: { contains: search } }],
      },
      orderBy: { id: 'desc' },
    });

    const total = await this.PrismaService.category.count({
      where: {
        OR: [{ name: { contains: search } }],
      },
    });

    return {
      data: categories,
      total,
      current_page: page,
      items_per_page,
    };
  }

  async getDetail(id: number): Promise<Category> {
    const category = await this.PrismaService.category.findUnique({
      where: { id },
    });
    if (!category) {
      throw new HttpException('Không tìm thấy danh mục!', HttpStatus.NOT_FOUND);
    }
    return category;
  }

  async create(body: CreateCategoryDto): Promise<any> {
    try {
      const category = await this.PrismaService.category.create({
        data: { ...body },
      });
      return {
        message: 'Tạo thành công danh mục ' + category.name,
        data: category,
      };
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Đã xảy ra lỗi! Vui lòng thử lại sau.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async update(id: number, body: UpdateCategoryDto): Promise<any> {
    try {
      const category = await this.PrismaService.category.update({
        where: { id },
        data: body ,
      });
      return {
        message: 'Cập nhật thành công danh mục ' + category.name,
        data: category,
      };
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Đã xảy ra lỗi! Vui lòng thử lại sau.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async delete(id: number): Promise<any> {
    try {
      const category = await this.PrismaService.category.delete({
        where: { id },
      });
      return {
        message: 'Xóa thành công danh mục ' + category.name,
      };
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Đã xảy ra lỗi! Vui lòng thử lại sau.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
