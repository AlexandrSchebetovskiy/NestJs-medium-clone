import { Module } from '@nestjs/common';
import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';
import { TypeOrmModule } from "@nestjs/typeorm";
import { ArticleEntity } from "./article.entity";
import { FollowEntity } from "../profile/follow.entity";

@Module({
  imports:[TypeOrmModule.forFeature([ArticleEntity, FollowEntity])],
  controllers: [ArticleController],
  providers: [ArticleService]
})
export class ArticleModule {}
