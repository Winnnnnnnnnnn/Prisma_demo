import { IsNotEmpty, IsOptional, IsNumber, IsInt, MaxLength } from "class-validator";
import { News } from "generated/prisma";

export class createNewsDto {
    @IsNotEmpty({ message: 'Tiêu đề không được bỏ trống' })
    @MaxLength(100, { message: 'Tiêu đề không được vượt quá 100 ký tự' })
    title: string;

    @IsOptional()
    content: string;

    @IsNumber({}, { message: 'Trạng thái không hợp lệ' })
    @IsInt({ message: 'Trạng thái không hợp lệ' })
    status: number;

    @IsNumber({}, { message: 'Dữ liệu không hợp lệ' })
    @IsInt({ message: 'Dữ liệu không hợp lệ' })
    ownerId: number;

    @IsInt({ message: 'Danh mục không hợp lệ' })
    @IsNumber({}, { message: 'Danh mục không hợp lệ' })
    @IsNotEmpty({ message: 'Danh mục bài viết không được bỏ trống' })
    categoryId: number;
}

export class updateNewsDto {
    @IsNotEmpty({ message: 'Tiêu đề không được bỏ trống' })
    @MaxLength(100, { message: 'Tiêu đề không được vượt quá 100 ký tự' })
    title: string;

    @IsOptional()
    content: string;

    @IsNumber({}, { message: 'Trạng thái không hợp lệ' })
    @IsInt({ message: 'Trạng thái không hợp lệ' })
    status: number;

    @IsNumber({}, { message: 'Dữ liệu không hợp lệ' })
    @IsInt({ message: 'Dữ liệu không hợp lệ' })
    ownerId: number;

    @IsInt({ message: 'Danh mục không hợp lệ' })
    @IsNumber({}, { message: 'Danh mục không hợp lệ' })
    @IsNotEmpty({ message: 'Danh mục bài viết không được bỏ trống' })
    categoryId: number;
}


export interface NewsFillterDto {
  items_per_page?: number
  page?: number
  search?: string
}

export interface NewsPaginationDto {
  data: News[];
  total: number;
  current_page: number;
  items_per_page: number;
}