import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Delete,
  Optional,
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
import { CommentService } from './comment.service';
import { AuthGuard } from '@nestjs/passport';
import { RequestWithUser } from '../../interfaces/requestWithUser';
import { CommentContentDataDto } from './dto/commentContentData.dto';
import { CommentDto } from './dto/comment.dto';
import { OptionalIntPipe } from '../../pipes/optionalIntPipe';
import { LoggingInterceptor } from '../../interceptors/logging.interceptor';

@ApiTags('Comment')
@Controller('api/comment')
@UseInterceptors(LoggingInterceptor)
export class CommentController {
  constructor(private commentService: CommentService) {}

  @Post()
  @ApiOperation({
    summary: 'write a comment',
    description: 'write a comment or reply to a reply',
  })
  @ApiBody({ type: CommentContentDataDto })
  @ApiResponse({ status: 201, type: CommentDto })
  @UsePipes(new ValidationPipe())
  @UseGuards(AuthGuard('jwt'))
  async createComment(
    @Request() req: RequestWithUser,
    @Body() commentContentData: CommentContentDataDto,
    @Query('postId', ParseIntPipe) postId: number,
    @Optional() @Query('parentId', OptionalIntPipe) parentId?: number,
  ): Promise<CommentDto> {
    const userId: number = Number(req.user.id);
    return await this.commentService.createComment(userId, postId, parentId, commentContentData);
  }

  @Put(':commentId')
  @ApiOperation({
    summary: 'edit comment',
    description: 'write a comment or edit a reply',
  })
  @ApiBody({ type: CommentContentDataDto })
  @ApiResponse({ status: 201, type: CommentDto })
  @UsePipes(new ValidationPipe())
  @UseGuards(AuthGuard('jwt'))
  async updateComment(
    @Request() req: RequestWithUser,
    @Body() updateCommentData: CommentContentDataDto,
    @Param('commentId', ParseIntPipe) commentId: number,
  ): Promise<CommentDto> {
    const userId: number = Number(req.user.id);
    return await this.commentService.updateComment(userId, commentId, updateCommentData);
  }

  @Delete(':commentId')
  @ApiOperation({
    summary: 'delete comment',
    description: 'delete a comment or reply',
  })
  @ApiResponse({ status: 204, description: 'Successfully deleted comment' })
  @UseGuards(AuthGuard('jwt'))
  async deleteComment(
    @Request() req: RequestWithUser,
    @Param('commentId', ParseIntPipe) commentId: number,
  ): Promise<void> {
    const userId: number = Number(req.user.id);
    await this.commentService.deleteComment(userId, commentId);
    return;
  }
}
