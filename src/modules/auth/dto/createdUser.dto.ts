import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreatedUserDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Length(1, 20)
  username: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Exclude()
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  email: string;
}
