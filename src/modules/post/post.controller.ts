import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '@shared/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreatePostDto } from './dto/create-post.dto';
import { PostResponseDto } from './dto/post-response.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostService } from './post.service';

@ApiTags('Post')
@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Get all posts (public + user private posts)' })
  @ApiResponse({
    status: 200,
    description: 'List of posts',
    type: [PostResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  getAllPosts(@CurrentUser() userId: string): Promise<PostResponseDto[]> {
    return this.postService.getAllPosts(userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Get a post by ID' })
  @ApiResponse({
    status: 200,
    description: 'Post details',
    type: PostResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - no access to private post',
  })
  @ApiResponse({
    status: 404,
    description: 'Post not found',
  })
  getPost(
    @Param('id') postId: string,
    @CurrentUser() userId: string,
  ): Promise<PostResponseDto> {
    return this.postService.getPost(postId, userId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Create a new post' })
  @ApiResponse({
    status: 201,
    description: 'Post created successfully',
    type: PostResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  createPost(
    @CurrentUser() userId: string,
    @Body() createPostDto: CreatePostDto,
  ): Promise<PostResponseDto> {
    return this.postService.createPost(userId, createPostDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Update a post' })
  @ApiResponse({
    status: 200,
    description: 'Post updated successfully',
    type: PostResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - can only update your own posts',
  })
  @ApiResponse({
    status: 404,
    description: 'Post not found',
  })
  updatePost(
    @Param('id') postId: string,
    @CurrentUser() userId: string,
    @Body() updatePostDto: UpdatePostDto,
  ): Promise<PostResponseDto> {
    return this.postService.updatePost(postId, userId, updatePostDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Delete a post' })
  @ApiResponse({
    status: 204,
    description: 'Post deleted successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - can only delete your own posts',
  })
  @ApiResponse({
    status: 404,
    description: 'Post not found',
  })
  deletePost(
    @Param('id') postId: string,
    @CurrentUser() userId: string,
  ): Promise<void> {
    return this.postService.deletePost(postId, userId);
  }

  @Patch(':id/toggle-visibility')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Toggle post visibility (public/private)' })
  @ApiResponse({
    status: 200,
    description: 'Post visibility toggled successfully',
    type: PostResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - can only toggle your own posts',
  })
  @ApiResponse({
    status: 404,
    description: 'Post not found',
  })
  togglePostVisibility(
    @Param('id') postId: string,
    @CurrentUser() userId: string,
  ): Promise<PostResponseDto> {
    return this.postService.togglePostVisibility(postId, userId);
  }
}
