import { IsNotEmpty, IsOptional } from "class-validator";
import { Category } from "generated/prisma";
export class CreateCategoryDto {
    @IsNotEmpty({ message: 'Không được bỏ trống tên danh mục!' })
    name: string

    @IsOptional()
    description?: string
}

export class UpdateCategoryDto {
    @IsNotEmpty({ message: 'Không được bỏ trống tên danh mục!' })
    name: string

    @IsOptional()
    description?: string
}


export interface CategoryFillerDto {
  items_per_page?: number
  page?: number
  search?: string
}

export interface CategoryPaginationDto {
  data: Category[];
  total: number;
  current_page: number;
  items_per_page: number;
}
