import { BeforeInsert, Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import {hash} from 'bcrypt';
import { ArticleEntity } from "../article/article.entity";
@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id:number

  @Column()
  email:string

  @Column({default:''})
  bio:string

  @Column({default:''})
  img:string

  @Column()
  username:string

  @Column({select:false})
  password:string

  @BeforeInsert()
  async hashPassword() {
    this.password = await hash(this.password, 10)
  }
  @OneToMany(() => ArticleEntity, article => article.author)
  articles : ArticleEntity[]

  @ManyToMany(() => ArticleEntity)
  @JoinTable()
  favorites: ArticleEntity[]
}