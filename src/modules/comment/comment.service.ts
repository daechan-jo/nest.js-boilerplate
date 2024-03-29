import { CommentContentDataDto } from './dto/commentContentData.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CommentDto } from './dto/comment.dto';
import { Repository } from 'typeorm';
import { User } from '../../entities/User';
import { Comment } from '../../entities/Comment';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,

    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createComment(
    userId: number,
    postId: number,
    parentId: number,
    createCommentDto: CommentContentDataDto,
  ): Promise<CommentDto> {
    const user: User = await this.userRepository.findOne({ where: { id: userId } });
    const newComment = await this.commentRepository.save({
      ...createCommentDto,
      author: user,
      postId: postId,
      parentId: parentId,
    });
    const { author, ...rest } = newComment;
    return { ...plainToInstance(CommentDto, rest), nickname: author.nickname };
  }

  async updateComment(
    userId: number,
    commentId: number,
    updateCommentDto: CommentContentDataDto,
  ): Promise<CommentDto> {
    await this.commentRepository.update(
      { id: commentId, authorId: userId },
      { ...updateCommentDto },
    );

    const updatedComment: Comment = await this.commentRepository.findOne({
      where: { id: commentId, authorId: userId },
      relations: ['author'],
    });
    const { author, ...rest } = updatedComment;
    return { ...plainToInstance(CommentDto, rest), nickname: author.nickname };
  }

  async deleteComment(userId: number, commentId: number): Promise<void> {
    const comment: Comment = await this.commentRepository.findOne({
      where: { id: commentId, authorId: userId },
    });
    if (!comment) {
      throw new NotFoundException('댓글을 찾을 수 없습니다.');
    }
    await this.commentRepository.delete(comment);
    return;
  }
}
