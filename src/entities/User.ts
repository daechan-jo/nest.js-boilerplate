import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';
import { Post } from './Post';
import { Comment } from './Comment';

@Entity('User')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  username: string;

  @Column({ nullable: true, unique: true })
  nickname: string;

  @Column()
  password: string;

  @Column({ nullable: true, unique: true })
  snsId: number;

  @Column({ nullable: true })
  provider: string;

  @Column({ nullable: true })
  profileImg: string;

  @Column({ nullable: true })
  backgroundImg: string;

  @Column({ nullable: true })
  field: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: false })
  manager: boolean;

  @CreateDateColumn()
  @Index()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Post, (post) => post.author)
  post: Post[];

  @OneToMany(() => Comment, (comment) => comment.author)
  comment: Comment[];

  @DeleteDateColumn()
  deletedAt: Date;
}
