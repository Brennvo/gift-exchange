export class EmailDTO {
  to: string[] | string;
  from?: string;
  subject: string;
  text?: string;
  html?: any;
}
