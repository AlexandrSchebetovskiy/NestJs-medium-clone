import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, DeleteResult, Repository } from "typeorm";
import slugify from 'slugify';
import { UserEntity } from "../user/user.entity";
import { CreateArticleDto } from "./dto/createArticle.dto";
import { ArticleEntity } from "./article.entity";
import { ArticleResponseInterface } from "./types/articleResponse.interface";
import { UpdateArticleDto } from "./dto/updateArticle.dto";
import { ArticlesResponseInterface } from "./types/articlesResponse.interface";
import { FeedQueryInterface } from "./types/feedQuery.interface";
import { FollowEntity } from "../profile/follow.entity";

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity) private articleRepository: Repository<ArticleEntity>,
    @InjectRepository(FollowEntity) private followRepository: Repository<FollowEntity>,
    private dataSource: DataSource,

  ) {}
  async findAll(currentUserId: number, query: FeedQueryInterface):Promise<ArticlesResponseInterface> {
    const queryBuilder = await this.dataSource
      .getRepository(ArticleEntity)
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author')
      .orderBy('articles.createdAt', 'DESC')
    const articlesCount = await queryBuilder.getCount()
    if(query.tag) {
      queryBuilder.andWhere('articles.tagList LIKE :tag', {tag: `%${query.tag}%`})
    }
    if(query.author) {
      const author = await this.dataSource.getRepository(UserEntity).findOne({where: {username: query.author}})
      queryBuilder.andWhere('articles.authorId = :id', { id: author?.id })
    }
    if(query.favorited) {
      const author = await  this.dataSource.getRepository(UserEntity).findOne({
        where: {username: query.favorited},
        relations: ['favorites']
      })
      const ids = author.favorites.map(article => article.id)
      console.log(ids);
      queryBuilder.andWhere('articles.id IN (:...ids)', {ids})
    }
    if(query.offset) queryBuilder.offset(query.offset)
    if(query.limit) queryBuilder.limit(query.limit)

    let favoritedIds: number[] = []
    if(currentUserId) {
      const currentUser = await this.dataSource.getRepository(UserEntity).findOne({
        where: {id: currentUserId},
        relations: ['favorites']
      })
      favoritedIds = currentUser.favorites.map(el => el.id)
    }
    const articles = await queryBuilder.getMany()

    const articleWithFavorites = articles.map(article => {
      const favorited = favoritedIds.includes(article.id)
      return {...article, favorited}
    })
    return {articles: articleWithFavorites,articlesCount}
  }

  async getFeed(currentUserId: number, query: FeedQueryInterface) {
    const follows = await this.followRepository.find({where: {followerId: currentUserId}})
    if(follows.length === 0) return {articles:[], articlesCount: 0}
    const followingUserIds = follows.map(el => el.followingId)

    const queryBuilder = this.dataSource.getRepository(ArticleEntity)
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author')
      .where('articles.authorId IN (:...ids)', {ids: followingUserIds})
      .orderBy('articles.createdAt', 'DESC')
    const articlesCount = await queryBuilder.getCount()
    if(query.offset) queryBuilder.offset(query.offset)
    if(query.limit) queryBuilder.limit(query.limit)

    const articles = await queryBuilder.getMany()

    return {articles, articlesCount}
  }

  async getBySlug(slug: string): Promise<ArticleEntity> {
    return await this.articleRepository.findOne({where: {slug}})
  }

  async create(currentUser: UserEntity, createArticleDto: CreateArticleDto): Promise<ArticleEntity> {
    const article = new ArticleEntity()
    Object.assign(article, createArticleDto)
    if(!article.tagList) {
      article.tagList = []
    }
    article.author = currentUser
    article.slug = this.generateUniqueSlug(createArticleDto.title)
    console.log(article);
    return await this.articleRepository.save(article)
  }

  async updateArticle(userId: number, slug: string, updateArticleDto: UpdateArticleDto):Promise<ArticleEntity> {
    const article = await this.getBySlug(slug)
    if(!article)
      throw new HttpException('Article does not exist', HttpStatus.NOT_FOUND)
    if(article.author.id !== userId)
      throw new HttpException('You are not an author', HttpStatus.FORBIDDEN)
    Object.assign(article, updateArticleDto)
    return await this.articleRepository.save(article)
  }

  async deleteArticle(slug: string, userId: number): Promise<DeleteResult>{
    const article = await this.getBySlug(slug)
    if(!article) {
      throw new HttpException('Article does not exist', HttpStatus.NOT_FOUND)
    }
    if(article.author.id !== userId) {
      throw new HttpException('You are not an author', HttpStatus.FORBIDDEN)
    }
    return await this.articleRepository.delete({slug})
  }

  async addArticleToFavorites(slug: string, currentUserId: number): Promise<ArticleEntity> {
    const article = await this.getBySlug(slug)
    const user = await this.dataSource.getRepository(UserEntity).findOne({
      where:{id: currentUserId},
      relations: ['favorites']
    })
    const isNotFavorited = user.favorites.findIndex(articleIsFav => articleIsFav.id === article.id) === -1
    console.log(isNotFavorited)
    if(isNotFavorited) {
      user.favorites.push(article)
      article.favoritedCount++
      await this.dataSource.getRepository(UserEntity).save(user)
      await this.articleRepository.save(article)
    }
    return article
  }

  async removeFromFavorites(slug: string, currentUserId: number) {
    const article = await this.getBySlug(slug)
    const user = await this.dataSource.getRepository(UserEntity).findOne({
      where:{id: currentUserId},
      relations: ['favorites']
    })
    const articleIndex = user.favorites.findIndex(articleInFav => articleInFav.id=== article.id)
    if(articleIndex>=0) {
      user.favorites.splice(articleIndex, 1)
      article.favoritedCount--
      await this.dataSource.getRepository(UserEntity).save(user)
      await this.articleRepository.save(article)
    }
    return article
  }

  buildArticleResponse(article: ArticleEntity): ArticleResponseInterface{
    return {article}
  }

  private generateUniqueSlug(title: string): string {
    return slugify(title, {lower: true}) + '-' +(Math.random() * Math.pow(36,6) | 0).toString(36)
  }
}
