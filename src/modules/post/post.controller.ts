import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PostService } from './post.service';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PostContentDto } from './dto/postContent.dto';
import { PostDto } from './dto/post.dto';
import { RequestWithUser } from '../../interfaces/requestWithUser';
import { AuthGuard } from '@nestjs/passport';
import { ParseIntWithDefaultPipe } from '../../pipes/parseIntWithDefaultPipe';
import { LoggingInterceptor } from '../../interceptors/logging.interceptor';

@ApiTags('Post')
@Controller('api/post')
@UseInterceptors(LoggingInterceptor)
export class PostController {
  constructor(private postService: PostService) {}

  @Post()
  @ApiOperation({
    summary: '게시글 작성',
  })
  @ApiBody({
    type: PostContentDto,
  })
  @ApiResponse({ status: 201, type: PostDto })
  @UsePipes(new ValidationPipe())
  @UseGuards(AuthGuard('jwt'))
  async createPost(
    @Request() req: RequestWithUser,
    @Body() postContent: PostContentDto,
  ): Promise<PostDto> {
    const userId: number = Number(req.user.id);
    return await this.postService.createPost(userId, postContent);
  }

  @Get('/list')
  @ApiOperation({
    summary: '게시글 리스트',
  })
  @ApiResponse({ status: 200, type: [PostDto] })
  @UseGuards(AuthGuard('jwt'))
  async getPosts(
    @Query('page', new ParseIntWithDefaultPipe(1)) page: number,
    @Query('limit', new ParseIntWithDefaultPipe(10)) limit: number,
  ): Promise<{ posts: PostDto[]; totalPage: number; currentPage: number }> {
    return await this.postService.getAllPosts(page, limit);
  }

  @Get(':postId')
  @ApiOperation({
    summary: '단일 게시글 상세 조회',
  })
  @ApiResponse({ status: 200, type: PostDto })
  @UseGuards(AuthGuard('jwt'))
  async getPost(@Param('postId', ParseIntPipe) postId: number): Promise<PostDto> {
    return await this.postService.getPostAndIncrementView(postId);
  }

  @Put(':postId')
  @ApiOperation({
    summary: '단일 게시글 수정',
    description: '요청받은 필드 수정',
  })
  @ApiBody({ type: PostContentDto })
  @ApiResponse({ status: 201, type: PostDto })
  @UseGuards(AuthGuard('jwt'))
  async updatePost(
    @Request() req: RequestWithUser,
    @Param('postId') postId: number,
    @Body() updatePostContent: PostContentDto,
  ): Promise<PostDto> {
    const userId: number = Number(req.user.id);
    return await this.postService.updatePost(userId, postId, updatePostContent);
  }

  @Delete(':postId')
  @ApiOperation({
    summary: '게시글 삭제',
    description: '게시글에 포함된 댓글, 이미지 파일 삭제',
  })
  @ApiBody({
    description: '게시글 삭제',
  })
  @ApiResponse({ status: 204, description: 'Successfully deleted post' })
  @UseGuards(AuthGuard('jwt'))
  async deletePost(
    @Request() req: RequestWithUser,
    @Param('postId', ParseIntPipe) postId: number,
  ): Promise<void> {
    const userId: number = Number(req.user.id);

    await this.postService.deletePost(postId, userId);
    return;
  }
}
