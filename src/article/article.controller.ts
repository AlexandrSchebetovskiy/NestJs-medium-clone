import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
} from "@nestjs/common";
import { ArticleService } from "./article.service";
import { AuthGuard } from "../user/guards/auth.guard";
import { User } from "../user/decorators/user.decorator";
import { UserEntity } from "../user/user.entity";
import { CreateArticleDto } from "./dto/createArticle.dto";
import { ArticleResponseInterface } from "./types/articleResponse.interface";
import { UpdateArticleDto } from "./dto/updateArticle.dto";
import { ArticlesResponseInterface } from "./types/articlesResponse.interface";
import { FeedQueryInterface } from "./types/feedQuery.interface";
import { BackendValidationPipe } from "../shared/pipes/backendValidation.pipe";

@Controller('articles')
export class ArticleController {
  constructor(private articleService: ArticleService) {}

  @Get()
  async findAll(
    @User('id') currentUserId: number,
    @Query() query:FeedQueryInterface
  ): Promise<ArticlesResponseInterface> {
    return await this.articleService.findAll(currentUserId, query)
  }

  @Get('feed')
  @UseGuards(AuthGuard)
  async getFeed(
    @User('id') currentUserId: number,
    @Query() query:FeedQueryInterface
  ) : Promise<ArticlesResponseInterface> {
    return await this.articleService.getFeed(currentUserId, query)
  }

  @Post()
  @UseGuards(AuthGuard)
  @UsePipes(new BackendValidationPipe())
  async create(
    @User() currentUser: UserEntity,
    @Body('article') createArticleDto: CreateArticleDto
  ): Promise<ArticleResponseInterface>{
    const article = await this.articleService.create(currentUser, createArticleDto)
    return this.articleService.buildArticleResponse(article)
  }


  @Get(':slug')
  async getBySlug(@Param('slug') slug: string)
    : Promise<ArticleResponseInterface> {
    const article = await this.articleService.getBySlug(slug)
    return this.articleService.buildArticleResponse(article)
  }

  @Delete(':slug')
  @UseGuards(AuthGuard)
  async delete(@User('id') userId: number, @Param('slug') slug: string) {
    return await this.articleService.deleteArticle(slug, userId)
  }
  @Put(':slug')
  @UseGuards(AuthGuard)
  @UsePipes(new BackendValidationPipe())
  async update(
    @User('id') userId: number,
    @Param('slug') slug: string,
    @Body('article') updateArticleDto: UpdateArticleDto
  ): Promise<ArticleResponseInterface> {
    const article = await this.articleService.updateArticle(userId, slug, updateArticleDto)
    return this.articleService.buildArticleResponse(article)
  }

  @Post(':slug/favorites')
  @UseGuards(AuthGuard)
  async addToFavorites(
    @User('id') currentUserId: number,
    @Param('slug') slug: string
  ) : Promise<ArticleResponseInterface> {
    const article = await this.articleService.addArticleToFavorites(slug, currentUserId)
    return this.articleService.buildArticleResponse(article)
  }

  @Delete(':slug/favorites')
  @UseGuards(AuthGuard)
  async removeFromFavorites(
    @User('id') currentUserId: number,
    @Param('slug') slug: string
  ) : Promise<ArticleResponseInterface> {
    const article = await this.articleService.removeFromFavorites(slug, currentUserId)
    return this.articleService.buildArticleResponse(article)
  }

}
