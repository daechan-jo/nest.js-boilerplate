import { CommentService } from './comment.service';
import { Test } from '@nestjs/testing';
import { User } from '../../entities/User';
import { Comment } from '../../entities/Comment';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CommentContentDataDto } from './dto/commentContentData.dto';

describe('CommentService', () => {
  let commentService: CommentService;
  let commentRepository: Repository<Comment>;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CommentService,
        {
          provide: getRepositoryToken(Comment),
          useValue: {
            save: jest.fn(),
            update: jest.fn(),
            findOne: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    commentService = module.get<CommentService>(CommentService);
    commentRepository = module.get(getRepositoryToken(Comment));
    userRepository = module.get(getRepositoryToken(User));
  });

  const mockUser = new User();
  const mockCommentContentData: CommentContentDataDto = { content: 'test' };
  mockUser.id = 1;
  const mockComment: Comment = new Comment();
  mockComment.id = 1;
  mockComment.content = mockCommentContentData.content;
  mockComment.author = mockUser;
  mockComment.postId = 1;
  mockComment.parentId = undefined;

  describe('createComment', () => {
    it('should return a comment', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(commentRepository, 'save').mockResolvedValue(mockComment);

      const result = await commentService.createComment(1, 1, undefined, mockCommentContentData);

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(commentRepository.save).toHaveBeenCalledWith({
        ...mockCommentContentData,
        author: mockUser,
        postId: 1,
        parentId: undefined,
      });
      expect(result).toEqual({
        ...mockCommentContentData,
        nickname: mockUser.nickname,
        id: 1,
        parentId: undefined,
        postId: 1,
      });
    });
  });

  describe('updateComment', () => {
    it('should return a comment', async () => {
      jest.spyOn(commentRepository, 'findOne').mockResolvedValue(mockComment);
      jest.spyOn(commentRepository, 'update').mockResolvedValue(undefined);

      const result = await commentService.updateComment(1, 1, mockCommentContentData);

      expect(commentRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1, authorId: 1 },
        relations: ['author'],
      });
      expect(commentRepository.update).toHaveBeenCalledWith(
        { id: 1, authorId: 1 },
        { ...mockCommentContentData },
      );
      expect(result).toEqual({
        ...mockCommentContentData,
        nickname: mockUser.nickname,
        id: 1,
        parentId: undefined,
        postId: 1,
      });
    });
  });

  describe('deleteComment', () => {
    it('should return undefined', async () => {
      jest.spyOn(commentRepository, 'findOne').mockResolvedValue(mockComment);
      jest.spyOn(commentRepository, 'delete').mockResolvedValue(undefined);

      const result = await commentService.deleteComment(1, 1);

      expect(commentRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1, authorId: 1 },
      });
      expect(commentRepository.delete).toHaveBeenCalledWith(mockComment);
      expect(result).toBeUndefined();
    });
  });
});
