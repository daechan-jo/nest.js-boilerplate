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
    summary: 'write a post',
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
    summary: 'return all posts',
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
    summary: 'return a post',
  })
  @ApiResponse({ status: 200, type: PostDto })
  @UseGuards(AuthGuard('jwt'))
  async getPost(@Param('postId', ParseIntPipe) postId: number): Promise<PostDto> {
    return await this.postService.getPostAndIncrementView(postId);
  }

  @Put(':postId')
  @ApiOperation({
    summary: 'edit single post',
    description: 'modify requested fields',
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
    summary: 'delete single post',
    description: 'delete a post and image',
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
