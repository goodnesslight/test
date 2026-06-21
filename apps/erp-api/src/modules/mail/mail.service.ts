import { ConfigKey } from '@common/types/config.type';
import { createTransport, Transporter } from 'nodemailer';

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private readonly logger: Logger = new Logger(MailService.name);
  private readonly transporter: Transporter | null;

  constructor(private readonly configService: ConfigService) {
    this.transporter = this.createTransporter();
  }

  async sendOrganizationInvite(
    email: string,
    organizationName: string,
    inviteUrl: string
  ): Promise<void> {
    const subject: string = `You have been invited to join ${organizationName}`;
    const html: string = this.buildInviteHtml(organizationName, inviteUrl);

    if (!this.transporter) {
      this.logger.warn(
        `SMTP is not configured — invite link for ${email}: ${inviteUrl}`
      );

      return;
    }

    await this.transporter.sendMail({
      from: this.configService.getOrThrow(ConfigKey.MAIL_FROM),
      to: email,
      subject,
      html,
    });
  }

  private createTransporter(): Transporter | null {
    const host: string | undefined = this.configService.get<string>(
      ConfigKey.SMTP_HOST
    );

    if (!host) {
      return null;
    }

    const port: number = Number(
      this.configService.getOrThrow(ConfigKey.SMTP_PORT)
    );
    const user: string | undefined = this.configService.get<string>(
      ConfigKey.SMTP_USER
    );
    const password: string | undefined = this.configService.get<string>(
      ConfigKey.SMTP_PASSWORD
    );

    return createTransport({
      host,
      port,
      secure: port === 465,
      auth: user ? { user, pass: password } : undefined,
    });
  }

  private buildInviteHtml(organizationName: string, inviteUrl: string): string {
    return `
      <div style="font-family: sans-serif; line-height: 1.5;">
        <h2>You have been invited to join ${organizationName}</h2>
        <p>Follow the link below to set up your account and join the team:</p>
        <p>
          <a href="${inviteUrl}"
            style="display: inline-block; padding: 12px 20px; background: #18181b; color: #fff; border-radius: 8px; text-decoration: none;">
            Accept invitation
          </a>
        </p>
        <p>If the button does not work, copy this link into your browser:</p>
        <p><a href="${inviteUrl}">${inviteUrl}</a></p>
      </div>
    `;
  }
}
