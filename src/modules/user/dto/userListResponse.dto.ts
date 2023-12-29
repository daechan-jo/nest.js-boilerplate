import { ApiProperty } from '@nestjs/swagger';
import { UserListDto } from './userList.dto';

export class UserListResponseDto {
  @ApiProperty()
  totalPage: number;

  @ApiProperty()
  currentPage: number;

  @ApiProperty({ type: [UserListDto] })
  users: UserListDto[];
}
