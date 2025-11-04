import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { PostResponseDto } from './dto/post-response.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostService {
  constructor(private readonly prismaService: PrismaService) {}

  async getAllPosts(currentUserId?: string): Promise<PostResponseDto[]> {
    const posts = await this.prismaService.post.findMany({
      where: {
        OR: [
          { isPublic: true },
          ...(currentUserId ? [{ authorId: currentUserId, isPublic: false }] : []),
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return posts;
  }

  async getPost(postId: string, currentUserId?: string): Promise<PostResponseDto> {
    const post = await this.prismaService.post.findUnique({
      where: {
        id: postId,
      },
    });

    if (!post) throw new NotFoundException('Post not found');

    if (!post.isPublic && post.authorId !== currentUserId) throw new ForbiddenException('You do not have access to this post');
    
    return post;
  }

  async createPost(userId: string, createPostDto: CreatePostDto): Promise<PostResponseDto> {
    const post = await this.prismaService.post.create({
      data: {
        title: createPostDto.title,
        content: createPostDto.content,
        isPublic: createPostDto.isPublic,
        authorId: userId,
      }
    })

    return post;
  }

  async updatePost(
    postId: string,
    userId: string,
    updatePostDto: UpdatePostDto,
  ): Promise<PostResponseDto> {
    const post = await this.prismaService.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) throw new NotFoundException('Post not found');
    if (post.authorId !== userId) throw new ForbiddenException('You can only update your own posts');

    const updatedPost = await this.prismaService.post.update({
      where: {
        id: postId,
      },
      data: {
        title: updatePostDto.title,
        content: updatePostDto.content,
        isPublic: updatePostDto.isPublic,
      },
    });

    return updatedPost;
  }

  async deletePost(postId: string, userId: string): Promise<void> {
    const post = await this.prismaService.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) throw new NotFoundException('Post not found');
    if (post.authorId !== userId) throw new ForbiddenException('You can only delete your own posts');

    await this.prismaService.post.delete({
      where: {
        id: postId,
      },
    });
  }

  async togglePostVisibility(postId: string, userId: string): Promise<PostResponseDto> {
    return this.prismaService.$transaction(async (tx) => {
      const post = await tx.post.findUnique({ where: { id: postId }, select: { isPublic: true, authorId: true } });
      if (!post) throw new NotFoundException('Post not found');
      if (post.authorId !== userId) throw new ForbiddenException();
  
      const updatedPost = await tx.post.update({
        where: { id: postId },
        data: { isPublic: { set: !post.isPublic } },
      });
      return updatedPost;
    });
  }


}
