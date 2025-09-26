import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dtos/category.dto';
import type { CategoryFillerDto } from './dtos/category.dto';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { Category } from 'generated/prisma';

@Controller('category')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() body: CreateCategoryDto) {
    return this.categoryService.create(body);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  getAll() {
    return this.categoryService.getAll();
  }

  @Get('list')
  @UseGuards(JwtAuthGuard)
  getList(@Query() fillters: CategoryFillerDto) {
    return this.categoryService.getList(fillters);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  getDetail(@Param('id', ParseIntPipe) id: number): Promise<Category> {
    return this.categoryService.getDetail(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateCategoryDto,
  ): Promise<any> {
    return this.categoryService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  delete(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return this.categoryService.delete(id);
  }
}
