import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as cryptoRandomString from 'crypto-random-string';

import { Invitation } from '../entities/invitation.entity';
import { Repository } from 'typeorm';
import { EmailService } from '../email/email.service';

@Injectable()
export class InvitationService {
  constructor(
    @InjectRepository(Invitation)
    private readonly invitationRepository: Repository<Invitation>,
    private readonly emailService: EmailService,
  ) {}

  // Send unique invitations to emails
  async sendInvitations(groupId, groupName, emails): Promise<any> {
    const invitations: Invitation[] = await Promise.all(
      emails.map(async email => await this.createInvitation(groupId, email)),
    );

    const emailTokens = emails.reduce((acc, currEmail, i) => {
      const { token } = invitations[i];
      acc[currEmail] = { token };
      return acc;
    }, {});

    try {
      await this.emailService.sendBatchEmail(
        {
          to: emails,
          subject: 'Your Vote Matters at the North Poll',
          html: this.invitationText(groupId, groupName),
        },
        emailTokens,
      );
    } catch (e) {
      await this.revokeInvitations(groupId, emails);
      throw new ServiceUnavailableException('Unable to send invitations.');
    }
  }

  // Create text for invitation email
  invitationText(groupId, groupName): string {
    return `You're invited to vote in The North Poll! <a href="http://localhost:3000/group/${groupId}/join/%recipient.token%">Join ${groupName}</a> there now.`;
  }

  // Check if invitation token is still valid/exists
  async validateInvitation(token): Promise<boolean> {
    const invitation = await this.invitationRepository.findOne({
      where: { token },
    });

    return invitation ? true : false;
  }

  // Create a new invitation for an email in a group
  async createInvitation(groupId, email) {
    const token = this.generateToken();

    // Expire date on token
    const expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + 7);

    const newToken = await this.invitationRepository.create({
      email,
      token,
      groupId,
      expireDate,
    });

    return this.invitationRepository.save(newToken);
  }

  // Revokes existing invitations
  async revokeInvitations(groupId: number, emails: string[]) {
    return this.invitationRepository
      .createQueryBuilder()
      .delete()
      .where('groupId = :groupId', { groupId })
      .andWhere('email IN (:...emails)', { emails })
      .execute();
  }

  async deleteToken(token) {
    return this.invitationRepository
      .createQueryBuilder()
      .delete()
      .where('token = :token', { token })
      .execute();
  }

  // Invitation expiration date helper
  setExpireDate(today: Date): number {
    const expiredDate = today.setDate(today.getDate() + 7);
    return expiredDate;
  }

  // Invitatino token generation helper
  generateToken(): string {
    return cryptoRandomString({ length: 16, type: 'url-safe' });
  }
}
