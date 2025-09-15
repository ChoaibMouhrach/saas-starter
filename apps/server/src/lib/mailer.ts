import { Resend } from "resend";

type SendMailContext = {
  to: string[];
  from: string;
  html: string;
  subject: string;
};

export abstract class BaseMailer {
  public abstract sendMail(context: SendMailContext): Promise<void>;
}

export class ResendMailer extends BaseMailer {
  private client;

  public constructor(context: { token: string }) {
    super();

    this.client = new Resend(context.token);
  }

  public override async sendMail(context: SendMailContext): Promise<void> {
    await this.client.emails.send({
      from: context.from,
      to: context.to,
      subject: context.subject,
      html: context.html,
    });
  }
}

export class DevMailer extends BaseMailer {
  public override async sendMail(context: SendMailContext): Promise<void> {
    console.log(context);
  }
}
