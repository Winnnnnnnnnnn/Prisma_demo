import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { CreateUserDto, UserResponseDto } from './dtos/user.dto';
import type {  UserFillerType, UserPaginationResponseType } from './dtos/user.dto';
import { UserService } from './user.service';
import { User } from 'generated/prisma';
import { JwtAuthGuard } from 'src/auth/jwt.guard';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

    @Get()
    @UseGuards(JwtAuthGuard)
    getAll(): Promise<UserResponseDto[]> {
        return this.userService.getAll();
    }

    @Get('list')
    // @UseGuards(JwtAuthGuard)
    getList(@Query() params:UserFillerType): Promise<UserPaginationResponseType> {
        return this.userService.getList(params);
    }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() body: CreateUserDto): Promise<any> {
    return this.userService.create(body);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  getDetail(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.userService.getDetail(id);
  }
}
