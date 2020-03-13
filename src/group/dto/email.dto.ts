export class EmailDTO {
  to: string;
  from?: string;
  subject: string;
  text?: string;
  html?: string;
}
