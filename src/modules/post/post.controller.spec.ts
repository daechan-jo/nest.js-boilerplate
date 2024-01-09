import { Test, TestingModule } from '@nestjs/testing';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { PostContentDto } from './dto/postContent.dto';
import { PostDto } from './dto/post.dto';
import { RequestWithUser } from '../../interfaces/requestWithUser';

// Mock PostService
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
        authorId: 0,
        createdAt: undefined,
        id: 0,
        likeCount: 0,
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

  // Add similar test cases for other controller methods (getPosts, getPost, updatePost, deletePost)
});
