import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { CategoryModule } from './category/category.module';
import { NewsModule } from './news/news.module';

@Module({
  imports: [AuthModule, UserModule, CategoryModule, NewsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
