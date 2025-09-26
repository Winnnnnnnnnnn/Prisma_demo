import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dtos/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  login(@Body() body: LoginDto): Promise<any> {
    return this.authService.login(body); 
  }

  @Post('register')
  register(@Body() body: RegisterDto): Promise<any> {
    return this.authService.register(body); 
  }
}
