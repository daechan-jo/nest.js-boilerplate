import {
  Body,
  Controller,
  HttpException,
  Request,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JoinDataDto } from './dto/joinData.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginDataDto } from './dto/loginData.dto';
import { LoginUserDto } from './dto/loginUser.dto';
import { AuthGuard } from '@nestjs/passport';
import { RequestWithUser } from '../../interfaces/requestWithUser';
import { LoggingInterceptor } from '../../interceptors/logging.interceptor';
import { CreatedUserDto } from './dto/createdUser.dto';

@ApiTags('Auth')
@Controller('api/auth')
@UseInterceptors(LoggingInterceptor)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post()
  @ApiOperation({
    summary: 'join the membership',
  })
  @ApiBody({ type: JoinDataDto })
  @ApiResponse({ status: 201, type: CreatedUserDto })
  @UsePipes(new ValidationPipe())
  async createUser(@Body() joinData: JoinDataDto): Promise<CreatedUserDto> {
    if (!this.authService.isValidPassword(joinData)) {
      throw new HttpException('Passwords do not match', 400);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordConfirm: passwordConfirm, ...createUserDto } = joinData;
    return await this.authService.createUser(createUserDto);
  }

  @Post('login')
  @ApiOperation({
    summary: 'login',
    description: 'JWT issued upon successful login',
  })
  @ApiBody({ type: LoginDataDto })
  @ApiResponse({ status: 201, type: LoginUserDto })
  @UsePipes(new ValidationPipe())
  @UseGuards(AuthGuard('local'))
  async login(@Request() req: RequestWithUser): Promise<LoginUserDto> {
    return await this.authService.login(req.user);
  }
}
