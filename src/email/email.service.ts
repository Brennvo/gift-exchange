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

  sendBatchEmail(emailDto: EmailDTO, recipientVariables: object): Promise<any> {
    const emails = <string[]>emailDto.to;
    const recipientList = emails.join(', ');

    const email = {
      ...emailDto,
      from:
        'The North Poll <TheNorthPoll@sandboxbc57580314be4c42901acff6b590c844.mailgun.org?>',
      to: recipientList,
      html: emailDto.html,
      'recipient-variables': recipientVariables,
    };

    return new Promise((resolve, reject) => {
      mailgun.messages().send(email, (err, body) => {
        console.log('err is: ', err);
        err ? reject('Failed to send message') : resolve(email);
      });
    });
  }
}
