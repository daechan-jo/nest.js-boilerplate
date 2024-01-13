import { Injectable, NotFoundException } from '@nestjs/common';
import { classToPlain, instanceToPlain, plainToClass, plainToInstance } from 'class-transformer';
import { PostDto } from './dto/post.dto';
import { deleteRelativeImage } from '../../utils/deleteRelativeImage';
import { Post } from '../../entities/Post';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../../entities/Comment';
import { PostContentDto } from './dto/postContent.dto';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,

    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
  ) {}

  async createPost(userId: number, postContent: PostContentDto): Promise<PostDto> {
    const post: Post = this.postRepository.create({
      authorId: userId,
      ...postContent,
    });

    const createdPost: Post = await this.postRepository.save(post);

    return plainToInstance(PostDto, createdPost);
  }

  async getAllPosts(
    page: number,
    limit: number,
  ): Promise<{ posts: PostDto[]; totalPage: number; currentPage: number }> {
    const [posts, totalCount] = await this.postRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: {
        createdAt: 'DESC',
      },
    });

    const totalPage: number = Math.ceil(totalCount / limit);
    return { posts: plainToInstance(PostDto, posts), totalPage, currentPage: page };
  }

  async incrementViewCount(postId: number): Promise<void> {
    await this.postRepository.increment({ id: postId }, 'viewCount', 1);
  }

  async getPost(postId: number): Promise<PostDto> {
    const post: Post = await this.postRepository.findOne({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('The post cannot be found.');
    }

    return plainToInstance(PostDto, post);
  }

  async getPostAndIncrementView(postId: number): Promise<PostDto> {
    await this.incrementViewCount(postId);

    const post: Post = await this.postRepository.findOne({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('The post cannot be found.');
    }

    return plainToInstance(PostDto, post);
  }

  async updatePost(
    userId: number,
    postId: number,
    updatePostContent: PostContentDto,
  ): Promise<PostDto> {
    let post: Post = await this.postRepository.findOne({
      where: {
        id: postId,
        authorId: userId,
      },
    });

    if (!post) {
      throw new NotFoundException(`The post cannot be found.`);
    }

    post = this.postRepository.merge(post, updatePostContent);
    const updatedPost: Post = await this.postRepository.save(post);

    return plainToInstance(PostDto, updatedPost);
  }

  async deletePost(postId: number, userId: number): Promise<void> {
    const post = await this.postRepository.findOne({ where: { id: postId } });
    const deletedPost = await this.postRepository.remove(post);
    if (deletedPost.authorId !== userId) throw new NotFoundException();
    if (deletedPost.postImg) await deleteRelativeImage(deletedPost);

    return;
  }
}
