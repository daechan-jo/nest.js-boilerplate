import { Test, TestingModule } from '@nestjs/testing';
import { PostService } from './post.service';
import { PostDto } from './dto/post.dto';
import { PostContentDto } from './dto/postContent.dto';
import { plainToInstance } from 'class-transformer';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Comment } from '../../entities/Comment';
import { Post } from '../../entities/Post';

const mockPostRepository = {
  findOne: jest.fn(),
  findAndCount: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  merge: jest.fn(),
  remove: jest.fn(),
  find: jest.fn(),
  increment: jest.fn(),
};
const mockCommentRepository = {};

jest.mock('../../utils/deleteRelativeImage', () => ({
  deleteRelativeImage: jest.fn(),
}));

describe('PostService', () => {
  let postService: PostService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostService,
        { provide: getRepositoryToken(Post), useValue: mockPostRepository },
        { provide: getRepositoryToken(Comment), useValue: mockCommentRepository },
      ],
    }).compile();

    postService = module.get<PostService>(PostService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('createPost', () => {
    it('should create a new post', async () => {
      const mockUserId = 1;
      const mockPostContent: PostContentDto = {
        title: 'test title',
        content: 'test content',
      };
      const mockCreatedPost: Post = {
        title: 'test title',
        content: 'test content',
      } as any;

      mockPostRepository.create.mockResolvedValue(mockCreatedPost);
      mockPostRepository.save.mockResolvedValue(mockCreatedPost);

      const result: PostDto = await postService.createPost(mockUserId, mockPostContent);

      expect(mockPostRepository.create).toHaveBeenCalledWith({
        authorId: mockUserId,
        ...mockPostContent,
      });

      const savedPost = await mockPostRepository.save(mockCreatedPost);
      expect(savedPost).toEqual(mockCreatedPost);

      expect(result).toEqual(plainToInstance(PostDto, mockCreatedPost));
    });
  });

  describe('getAllPosts', () => {
    it('should get all posts', async () => {
      const mockPage = 1;
      const mockLimit = 10;
      const mockPosts = [
        {
          id: 1,
          title: 'test title',
          content: 'test content',
          createdAt: new Date(),
          updatedAt: new Date(),
          authorId: 1,
          viewCount: 0,
          postImg: null,
          comment: [],
        },
        {
          id: 2,
          title: 'test title 2',
          content: 'test content 2',
          createdAt: new Date(),
          updatedAt: new Date(),
          authorId: 2,
          viewCount: 0,
          postImg: null,
          comment: [],
        },
      ];
      const mockTotalPage = 1;
      const mockCurrentPage = 1;

      mockPostRepository.findAndCount.mockResolvedValue([
        mockPosts,
        mockTotalPage,
        mockCurrentPage,
      ]);

      const result = await postService.getAllPosts(mockPage, mockLimit);

      expect(result).toEqual({
        posts: plainToInstance(PostDto, mockPosts),
        totalPage: mockTotalPage,
        currentPage: mockPage,
      });
    });
  });

  describe('getPostAndIncrementView', () => {
    it('should increment view count and return post', async () => {
      const mockPost = {
        id: 1,
        title: 'Test Post',
        viewCount: 0,
      };

      mockPostRepository.findOne.mockResolvedValue(mockPost);
      mockPostRepository.increment.mockResolvedValue({});

      const result = await postService.getPostAndIncrementView(1);

      expect(mockPostRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockPostRepository.increment).toHaveBeenCalledWith({ id: 1 }, 'viewCount', 1);

      expect(result).toEqual(plainToInstance(PostDto, mockPost));
    });

    it('should throw NotFoundException when post is not found', async () => {
      mockPostRepository.findOne.mockResolvedValue(null);

      await expect(postService.getPostAndIncrementView(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updatePost', () => {
    it('should update post and return post', async () => {
      const mockUserId = 1;
      const mockPostId = 1;
      const mockPostContent: PostContentDto = {
        title: 'test title',
        content: 'test content',
      };
      const mockPost = {
        id: 1,
        title: 'Test Post',
        content: 'Test Content',
        authorId: 1,
      };
      const updatedPost = {
        id: 1,
        title: 'test title',
        content: 'test content',
        authorId: 1,
      };

      mockPostRepository.findOne.mockResolvedValue(mockPost);
      mockPostRepository.merge.mockReturnValue(updatedPost);
      const post = mockPostRepository.merge(mockPost, mockPostContent);
      mockPostRepository.save.mockResolvedValue(post);

      const result = await postService.updatePost(mockUserId, mockPostId, mockPostContent);

      expect(mockPostRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: mockPostId,
          authorId: mockUserId,
        },
      });

      expect(mockPostRepository.merge).toHaveBeenCalledWith(mockPost, mockPostContent);

      expect(mockPostRepository.save).toHaveBeenCalledWith(post);

      expect(result).toEqual(plainToInstance(PostDto, updatedPost));
    });
  });

  describe('deletePost', () => {
    it('should delete post', async () => {
      const mockUserId = 1;
      const mockPostId = 1;
      const mockPost = {
        id: 1,
        title: 'Test Post',
        content: 'Test Content',
        authorId: 1,
      };

      mockPostRepository.findOne.mockResolvedValue(mockPost);
      mockPostRepository.remove.mockResolvedValue(mockPost);

      await postService.deletePost(mockUserId, mockPostId);

      expect(mockPostRepository.findOne).toHaveBeenCalledWith({ where: { id: mockPostId } });
      expect(mockPostRepository.remove).toHaveBeenCalledWith(mockPost);
    });
  });
});
