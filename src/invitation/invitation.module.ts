import { Module } from '@nestjs/common';
import { InvitationService } from './invitation.service';
import { EmailModule } from '../email/email.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invitation } from '../entities/invitation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Invitation]), EmailModule],
  providers: [InvitationService],
  exports: [InvitationService],
})
export class InvitationModule {}
