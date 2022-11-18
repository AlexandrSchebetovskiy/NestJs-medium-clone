import { BeforeUpdate, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "../user/user.entity";

@Entity('articles')
export class ArticleEntity{
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  slug: string

  @Column()
  title: string
  @Column({default: ''})
  description: string

  @Column()
  body: string

  @Column({type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
  createdAt: Date

  @Column({type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
  updatedAt: Date

  @Column('simple-array')
  tagList: string[]

  @Column({default: 0})
  favoritedCount: number

  @ManyToOne(() => UserEntity,(user) =>user.articles, {eager: true})
  author: UserEntity

  @BeforeUpdate()
  updateTimeStamp() {
    this.updatedAt = new Date()
  }


}