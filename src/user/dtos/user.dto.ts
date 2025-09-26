import { IsNotEmpty, Matches, MinLength, MaxLength } from 'class-validator';
import { User } from 'generated/prisma';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Không bỏ trống số điện thoại!' })
  @Matches(/^(0|\+84)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-9]|9[0-9])[0-9]{7}$/, {
    message: 'Số điện thoại không hợp lệ',
  })
  phone: string;

  @IsNotEmpty({ message: 'Không được bỏ trống tên!' })
  @MinLength(6, { message: 'Tên phải có ít nhất 6 ký tự' })
  @MaxLength(30, { message: 'Tên không được vượt quá 30 ký tự' })
  name: string;

  @IsNotEmpty({ message: 'Mật khẩu không được bỏ trống!' })
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password: string;
}

export class UserResponseDto {
  id: number
  name: string
  phone: string
  createdAt: Date
  updatedAt?: Date
}

export interface UserFillerType {
  items_per_page?: number
  page?: number
  search?: string
}

export interface UserPaginationResponseType {
  data: User[];
  total: number;
  current_page: number;
  items_per_page: number;
}
