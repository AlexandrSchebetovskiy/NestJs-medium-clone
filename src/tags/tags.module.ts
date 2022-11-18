import { Module } from '@nestjs/common';
import { TagsController } from './tags.controller';
import { TagsService } from './tags.service';
import { TypeOrmModule } from "@nestjs/typeorm";
import TagEntity from "./tag.entity";

@Module({
  imports:[TypeOrmModule.forFeature([TagEntity])],
  controllers: [TagsController],
  providers: [TagsService]
})
export class TagsModule {}
