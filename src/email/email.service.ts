import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { keys } from '../config/keys';
const mailgun = require('mailgun-js')({
  apiKey: keys.mailgun.secret,
  domain: keys.mailgun.domain,
});
import { EmailDTO } from '../group/dto/email.dto';

@Injectable()
export class EmailService {
  constructor() {}

  sendEmail(emailDto: EmailDTO): Promise<EmailDTO> {
    const email: EmailDTO = {
      from:
        'The North Poll <TheNorthPoll@sandboxbc57580314be4c42901acff6b590c844.mailgun.org?>',
      ...emailDto,
    };

    return new Promise((resolve, reject) => {
      mailgun.messages().send(email, (err, body) => {
        err ? reject('Failed to send message') : resolve(email);
      });
    });
  }
}
