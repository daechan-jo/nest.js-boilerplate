import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from '../auth/auth.service';
import { UserService } from '../user/user.service';
import { LocalStrategy } from '../../passport/local.strategy';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { PostService } from '../post/post.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from '../../entities/Post';
import { Comment } from '../../entities/Comment';
import { User } from '../../entities/User';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '24h' },
    }),
    TypeOrmModule.forFeature([Post, Comment, User]),
  ],
  controllers: [CommentController],
  providers: [AuthService, CommentService, PostService, UserService, LocalStrategy],
  exports: [CommentService],
})
export class CommentModule {}
