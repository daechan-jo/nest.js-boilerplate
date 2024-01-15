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
  Param,
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

  @Get('/my')
  @ApiOperation({
    summary: 'login user info',
  })
  @ApiResponse({ status: 200, type: UserDto })
  @UseGuards(AuthGuard('jwt'))
  async getMyInfo(@Request() req: RequestWithUser): Promise<UserDto> {
    const userId: number = Number(req.user.id);
    return await this.userService.findUserById(userId);
  }

  @Get('/:id')
  @ApiOperation({
    summary: 'single user info',
    description: 'user lookup matching id',
  })
  @ApiResponse({ status: 200, type: UserDto })
  @UseGuards(AuthGuard('jwt'))
  async getUser(
    @Param('userId', new ParseIntWithDefaultUserPipe()) userId: number,
  ): Promise<UserDto> {
    return await this.userService.findUserById(userId);
  }

  @Get('/all')
  @ApiOperation({
    summary: 'all user info',
  })
  @ApiResponse({ status: 200, type: UserListResponseDto })
  @UseGuards(AuthGuard('jwt'))
  async getAllUsers(
    @Query('page', new ParseIntWithDefaultPipe(1)) page: number,
    @Query('limit', new ParseIntWithDefaultPipe(10)) limit: number,
  ): Promise<UserListResponseDto> {
    return await this.userService.getUsers(page, limit);
  }

  @Put()
  @ApiOperation({
    summary: 'edit user info',
    description: 'edit requested user fields',
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

  @Delete()
  @ApiOperation({
    summary: 'delete user',
    description: 'delete user and related records',
  })
  @ApiResponse({ status: 204, description: 'User successfully deleted.' })
  @UseGuards(AuthGuard('jwt'))
  async deleteUser(@Request() req: RequestWithUser): Promise<void> {
    const userId: number = Number(req.user.id);
    await this.userService.deleteUser(userId);
    return;
  }
}
