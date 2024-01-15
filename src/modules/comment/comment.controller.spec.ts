import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from '../../../typeorm.config';
import { User } from '../../entities/User';
import { Post } from '../../entities/Post';
import { Comment } from '../../entities/Comment';
import { AuthService } from '../auth/auth.service';
import { PostService } from '../post/post.service';
import { UserService } from '../user/user.service';
import { LocalStrategy } from '../../passport/local.strategy';
import { RequestWithUser } from '../../interfaces/requestWithUser';
import { CommentDto } from './dto/comment.dto';
import { CommentContentDataDto } from './dto/commentContentData.dto';

describe('CommentController', () => {
  let commentController: CommentController;
  let commentService: CommentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: process.env.JWT_SECRET,
          signOptions: { expiresIn: '24h' },
        }),
        TypeOrmModule.forRoot(typeOrmConfig),
        TypeOrmModule.forFeature([Post, User, Comment]),
      ],
      controllers: [CommentController],
      providers: [AuthService, CommentService, PostService, UserService, LocalStrategy],
    }).compile();

    commentController = module.get<CommentController>(CommentController);
    commentService = module.get<CommentService>(CommentService);
  });

  describe('createComment', () => {
    it('should create a new comment', async () => {
      const mockRequest: RequestWithUser = { user: { id: 1 } } as any;
      const mockCommentContent: CommentContentDataDto = {
        content: 'test content',
      };
      const mockComment: CommentDto = {
        nickname: '',
        id: 1,
        content: 'test content',
        authorId: 1,
        postId: 1,
        parentId: null,
        createdAt: undefined,
        updatedAt: undefined,
      };

      jest.spyOn(commentService, 'createComment').mockResolvedValue(mockComment);

      const result: CommentDto = await commentController.createComment(
        mockRequest,
        mockCommentContent,
        1,
      );

      expect(commentService.createComment).toHaveBeenCalledWith(
        1,
        1,
        undefined,
        mockCommentContent,
      );
      expect(result).toEqual(mockComment);
    });
  });

  describe('updateComment', () => {
    it('should update a comment', async () => {
      const mockRequest: RequestWithUser = { user: { id: 1 } } as any;
      const mockCommentContent: CommentContentDataDto = {
        content: 'test content',
      };
      const mockUpdatedComment: CommentDto = {
        nickname: '',
        id: 1,
        content: 'test content',
        authorId: 1,
        postId: 1,
        parentId: null,
        createdAt: undefined,
        updatedAt: undefined,
      };

      jest.spyOn(commentService, 'updateComment').mockResolvedValue(mockUpdatedComment);

      const result: CommentDto = await commentController.updateComment(
        mockRequest,
        mockCommentContent,
        1,
      );

      expect(commentService.updateComment).toHaveBeenCalledWith(1, 1, mockCommentContent);
      expect(result).toEqual(mockUpdatedComment);
    });
  });

  describe('deleteComment', () => {
    it('should delete a comment', async () => {
      const mockRequest: RequestWithUser = { user: { id: 1 } } as any;
      const mockCommentId: number = 1;

      jest.spyOn(commentService, 'deleteComment').mockResolvedValue(undefined);

      const result: void = await commentController.deleteComment(mockRequest, mockCommentId);

      expect(commentService.deleteComment).toHaveBeenCalledWith(1, 1);
      expect(result).toEqual(undefined);
    });
  });
});
