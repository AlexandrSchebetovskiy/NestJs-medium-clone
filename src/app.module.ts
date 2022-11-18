import { MiddlewareConsumer, Module, RequestMethod } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TagsModule } from "./tags/tags.module";
import { UserModule } from "./user/user.module";
import DatabaseModule from "../database.module";
import { AuthMiddleware } from "./user/middlewares/auth.middleware";
import { ArticleModule } from './article/article.module';
import { ProfileModule } from './profile/profile.module';

@Module({
  imports: [
    DatabaseModule,
    TagsModule,
    UserModule,
    ArticleModule,
    ProfileModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes({
      path: '*',
      method: RequestMethod.ALL
    })
  }
}
