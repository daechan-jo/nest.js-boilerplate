import { Logger, Module } from '@nestjs/common';
import { join } from 'path';
import { typeOrmConfig } from '../typeorm.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { PostModule } from './modules/post/post.module';
import { CommentModule } from './modules/comment/comment.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    PostModule,
    CommentModule,
    TypeOrmModule.forRoot(typeOrmConfig),
    ServeStaticModule.forRoot({ rootPath: join(__dirname, '..', 'public') }),
  ],
  providers: [Logger],
})
export class AppModule {}
