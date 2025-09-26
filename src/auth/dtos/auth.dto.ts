import { IsNotEmpty, Matches, MinLength } from 'class-validator';

export class RegisterDto {

  @IsNotEmpty({ message: 'Không bỏ trống số điện thoại!' })
  @Matches(/^(0|\+84)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-9]|9[0-9])[0-9]{7}$/, {
    message: 'Số điện thoại không hợp lệ',
  })
  phone: string;

  @IsNotEmpty({ message: 'Không được bỏ trống tên!' })
  @MinLength(2, { message: 'Tên phải có ít nhất 2 ký tự' })
  name: string;

  @IsNotEmpty({ message: 'Mật khẩu không được bỏ trống' })
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password: string;
}

export class LoginDto {

  @IsNotEmpty({ message: 'Số điện thoại không được bỏ trống' })
  @Matches(/^(0|\+84)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-9]|9[0-9])[0-9]{7}$/, {
    message: 'Số điện thoại không hợp lệ',
  })
  phone: string;

  @IsNotEmpty({ message: 'Mật khẩu không được bỏ trống' })
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password: string;
}
