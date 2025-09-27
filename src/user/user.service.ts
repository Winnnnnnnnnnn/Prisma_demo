import {
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import {
  CreateUserDto,
  UserFillerType,
  UserPaginationResponseType,
  UserResponseDto,
} from './dtos/user.dto';
import { User } from 'generated/prisma';
import { hash } from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private PrismaService: PrismaService) {}

  async getAll(): Promise<UserResponseDto[]> {
    const users = await this.PrismaService.user.findMany({
      select: {
        id: true,
        name: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    const safeUsers: UserResponseDto[] = users.map((u) => ({
      ...u,
      updatedAt: u.updatedAt ?? u.createdAt,
    }));

    return safeUsers;
  }

  async getList(fillters: UserFillerType): Promise<UserPaginationResponseType> {
    const items_per_page = Number(fillters.items_per_page) || 10,
      page = Number(fillters.page) || 1,
      search = fillters.search || '';

    const skip = (page - 1) * items_per_page;

    const users = await this.PrismaService.user.findMany({
      take: items_per_page,
      skip: skip,
      where: {
        OR: [{ name: { contains: search } }, { phone: { contains: search } }],
      },
      orderBy: { createdAt: 'desc' },
    });

    const total = await this.PrismaService.user.count({
      where: {
        OR: [{ name: { contains: search } }, { phone: { contains: search } }],
      },
    });

    return {
      data: users,
      total,
      current_page: page,
      items_per_page,
    };
  }

  async getDetail(id: number): Promise<User> {
    const user = await this.PrismaService.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new HttpException(
        'Không tìm thấy người dùng!',
        HttpStatus.NOT_FOUND,
      );
    }
    return user;
  }

  
  async create(body: CreateUserDto): Promise<any> {
    const registered_user = await this.PrismaService.user.findUnique({
      where: { phone: body.phone },
    });
    if (registered_user) {
      throw new HttpException(
        { message: 'Số điện thoại đã được đăng ký' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const hashedPassword = await hash(body.password, 10);

    const user = await this.PrismaService.user.create({
      data: { ...body, password: hashedPassword },
    });

    return {
      message: 'Đã tạo tài khoản thành công.',
      data: user,
    };
  }
}
