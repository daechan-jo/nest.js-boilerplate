import { Test, TestingModule } from '@nestjs/testing';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { PostContentDto } from './dto/postContent.dto';
import { PostDto } from './dto/post.dto';
import { RequestWithUser } from '../../interfaces/requestWithUser';

jest.mock('./post.service');

describe('PostController', () => {
  let postController: PostController;
  let postService: PostService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostController],
      providers: [PostService],
    }).compile();

    postController = module.get<PostController>(PostController);
    postService = module.get<PostService>(PostService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('createPost', () => {
    it('should create a new post', async () => {
      const mockRequest: RequestWithUser = { user: { id: 1 } } as any;
      const mockPostContent: PostContentDto = {
        content: 'test content',
        title: 'test title',
      };
      const mockPost: PostDto = {
        comment: [],
        authorId: 0,
        createdAt: undefined,
        id: 0,
        postImg: '',
        updatedAt: undefined,
        viewCount: 0,
        content: 'test content',
        title: 'test title',
      };

      jest.spyOn(postService, 'createPost').mockResolvedValue(mockPost);

      const result: PostDto = await postController.createPost(mockRequest, mockPostContent);

      expect(postService.createPost).toHaveBeenCalledWith(1, mockPostContent);
      expect(result).toEqual(mockPost);
    });
  });

  describe('getPosts', () => {
    it('should get a list of posts', async () => {
      // const mockRequest: RequestWithUser = { user: { id: 1 } } as any;
      const mockPostsResponse = {
        posts: [
          {
            authorId: 0,
            createdAt: undefined,
            id: 0,
            postImg: '',
            updatedAt: undefined,
            viewCount: 0,
            content: 'test content',
            title: 'test title',
            comment: [],
          },
          {
            authorId: 1,
            createdAt: undefined,
            id: 1,
            postImg: '',
            updatedAt: undefined,
            viewCount: 0,
            content: 'test content',
            title: 'test title',
            comment: [],
          },
        ],
        totalPage: 2,
        currentPage: 1,
      };

      jest.spyOn(postService, 'getAllPosts').mockResolvedValue(mockPostsResponse);

      const result = await postController.getPosts(1, 10);

      expect(postService.getAllPosts).toHaveBeenCalledWith(1, 10);
      expect(result).toEqual(mockPostsResponse);
    });
  });

  describe('getPost', () => {
    it('should get a single post', async () => {
      const mockPost: PostDto = {
        authorId: 0,
        createdAt: undefined,
        id: 0,
        postImg: '',
        updatedAt: undefined,
        viewCount: 0,
        content: 'test content',
        title: 'test title',
        comment: [],
      };

      jest.spyOn(postService, 'getPostAndIncrementView').mockResolvedValue(mockPost);

      const result = await postController.getPost(1);

      expect(postService.getPostAndIncrementView).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockPost);
    });
  });

  describe('updatePost', () => {
    it('should update a post', async () => {
      const mockRequest: RequestWithUser = { user: { id: 1 } } as any;
      const mockPostContent: PostContentDto = {
        title: 'update content',
        content: 'update content',
      };
      const mockPost: PostDto = {
        authorId: 1,
        createdAt: undefined,
        id: 1,
        postImg: '',
        updatedAt: undefined,
        viewCount: 0,
        content: 'update content',
        title: 'update content',
        comment: [],
      };

      jest.spyOn(postService, 'updatePost').mockResolvedValue(mockPost);

      const result = await postController.updatePost(mockRequest, 1, mockPostContent);

      expect(postService.updatePost).toHaveBeenCalledWith(1, 1, mockPostContent);
      expect(result).toEqual(mockPost);
    });
  });

  describe('deletePost', () => {
    it('should delete a post', async () => {
      const mockRequest: RequestWithUser = { user: { id: 1 } } as any;

      jest.spyOn(postService, 'deletePost').mockResolvedValue(undefined);

      const result = await postController.deletePost(mockRequest, 1);

      expect(postService.deletePost).toHaveBeenCalledWith(1, 1);
      expect(result).toBeUndefined();
    });
  });
});
