import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { User } from '../entities/user.entity';
import { Group } from '../entities/group.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Group])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
