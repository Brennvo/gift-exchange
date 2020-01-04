import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GroupModule } from './group/group.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import { UserModule } from './user/user.module';

@Module({
  imports: [TypeOrmModule.forRoot(typeOrmConfig), GroupModule, UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
