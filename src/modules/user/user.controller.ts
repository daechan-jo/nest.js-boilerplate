import {
  Controller,
  Get,
  Put,
  UseGuards,
  Request,
  Body,
  Query,
  Delete,
  UsePipes,
  ValidationPipe,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserDto } from './dto/user.dto';
import { AuthGuard } from '@nestjs/passport';
import { UpdateUserDto } from './dto/updateUser.dto';
import { RequestWithUser } from '../../interfaces/requestWithUser';
import { ParseIntWithDefaultUserPipe } from '../../pipes/parseIntWithDefaultUserPipe';
import { ParseIntWithDefaultPipe } from '../../pipes/parseIntWithDefaultPipe';
import { LoggingInterceptor } from '../../interceptors/logging.interceptor';
import { UserListResponseDto } from './dto/userListResponse.dto';

@ApiTags('User')
@Controller('api/user')
@UseInterceptors(LoggingInterceptor)
export class UserController {
  constructor(private userService: UserService) {}

  @Put()
  @ApiOperation({
    summary: '회원 정보 수정',
    description: '요청 받은 필드 수정',
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, type: UserDto })
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe())
  async editUser(
    @Request() req: RequestWithUser,
    @Body() updateData: UpdateUserDto,
  ): Promise<UserDto> {
    const userId = Number(req.user.id);
    return await this.userService.updateUser(userId, updateData);
  }

  @Get()
  @ApiOperation({
    summary: '단일 유저 상세 조회',
    description: '쿼리로 받은 userId에 해당하는 유저 조회',
  })
  @ApiResponse({ status: 200, type: UserDto })
  @UseGuards(AuthGuard('jwt'))
  async getUser(
    @Query('userId', new ParseIntWithDefaultUserPipe()) userId: number,
  ): Promise<UserDto> {
    return await this.userService.findUserById(userId);
  }

  @Get('/my')
  @ApiOperation({
    summary: '내 정보 조회',
  })
  @ApiResponse({ status: 200, type: UserDto })
  @UseGuards(AuthGuard('jwt'))
  async getMyInfo(@Request() req: RequestWithUser): Promise<UserDto> {
    const userId: number = Number(req.user.id);
    return await this.userService.findUserById(userId);
  }

  @Get('/list-all')
  @ApiOperation({
    summary: '모든 유저 리스트',
  })
  @ApiResponse({ status: 200, type: UserListResponseDto })
  @UseGuards(AuthGuard('jwt'))
  async getAllUsers(
    @Query('page', new ParseIntWithDefaultPipe(1)) page: number,
    @Query('limit', new ParseIntWithDefaultPipe(10)) limit: number,
  ): Promise<UserListResponseDto> {
    return await this.userService.getUsers(page, limit);
  }

  @Delete()
  @ApiOperation({
    summary: '회원탈퇴',
    description: '프로필,백그라운드 이미지 + 관련 게시글, 댓글 삭제',
  })
  @ApiBody({ description: '유저 + 관련 레코드 삭제' })
  @ApiResponse({ status: 204, description: 'User successfully deleted.' })
  @UseGuards(AuthGuard('jwt'))
  async deleteUser(@Request() req: RequestWithUser): Promise<void> {
    const userId: number = Number(req.user.id);
    await this.userService.deleteUser(userId);
  }
}
