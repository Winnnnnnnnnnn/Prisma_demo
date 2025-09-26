import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { NewsService } from './news.service';
import { createNewsDto, updateNewsDto } from './dtos/news.dto';
import type { NewsFillterDto } from './dtos/news.dto';
import { JwtAuthGuard } from 'src/auth/jwt.guard';

@Controller('news')
export class NewsController {
    constructor(private newsService: NewsService) {}

    @Get()
    @UseGuards(JwtAuthGuard)
    async getAll() {
        return await this.newsService.getAll();
    }

    @Get('list')
    @UseGuards(JwtAuthGuard)
    async getList(@Query() fillters: NewsFillterDto) {
        return await this.newsService.getList(fillters);
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    async getDetail(@Param('id', ParseIntPipe) id: number) {
        return await this.newsService.getDetail(id);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    async create(@Body() data: createNewsDto) {
        return await this.newsService.create(data);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    async update(@Param('id') id: number, @Body() data: updateNewsDto) {
        console.log(data.title);
        return await this.newsService.update(id, data);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    async delete(@Param('id') id: number) {
        return await this.newsService.delete(id);
    }
}
