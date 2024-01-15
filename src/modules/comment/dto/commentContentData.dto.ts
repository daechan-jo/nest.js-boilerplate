import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CommentContentDataDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Length(1, 200)
  content: string;
}
