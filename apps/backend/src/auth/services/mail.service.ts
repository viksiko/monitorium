import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { logger } from '@src/logger/winston.logger';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    transporter: nodemailer.Transporter;

    constructor(private configService: ConfigService) {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT || '587', 10),
            secure: true, // true для 465, false для других портов
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });
    }

    async sendVerificationCode(
        recipientEmail: string,
        code: string,
    ): Promise<boolean> {
        const mailOptions = {
            from: `"МОНИТОРИУМ" <${process.env.EMAIL_USER}>`,
            to: `${process.env.EMAIL_USER}`, // заменить на recipientEmail
            subject: 'Код подтверждения регистрации',
            html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #2c3e50; margin-bottom: 10px;">
                    Подтверждение регистрации
                </h2>

                <p>Здравствуйте!</p>

                <p>
                    Для завершения регистрации в системе 
                    <strong>«МОНИТОРИУМ»</strong> введите следующий код:
                </p>

                <div style="
                    font-size: 28px;
                    font-weight: bold;
                    letter-spacing: 6px;
                    text-align: center;
                    margin: 20px 0;
                    padding: 15px;
                    background-color: #f4f6f8;
                    border-radius: 6px;
                ">
                    ${code}
                </div>

                <p style="font-size: 0.95em;">
                    Код действителен в течение <strong>5 минут</strong>.
                </p>

                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />

                <p style="font-size: 0.85em; color: #777;">
                    Если вы не регистрировались в системе «МОНИТОРИУМ», 
                    просто проигнорируйте это письмо.
                </p>
            </div>
        `,
        };

        try {
            await this.transporter.sendMail(mailOptions);

            logger.info(`Verification code email sent to ${recipientEmail}`, {
                category: 'email',
                operation: 'sendVerificationCode',
            });

            return true;
        } catch (error) {
            logger.error('Error sending verification code email', {
                category: 'email',
                operation: 'sendVerificationCode',
                error: error instanceof Error ? error.message : error,
            });

            return false;
        }
    }

    async sendResetPasswordEmail(
        recipientEmail, // почта пользователя, потом добавить в 'to'
        resetPasswordLink,
    ): Promise<boolean> {
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetPasswordLink}`;

        const mailOptions = {
            from: `"МОНИТОРИУМ" <${process.env.EMAIL_USER}>`,
            to: `${process.env.EMAIL_USER}`,
            subject: 'Сброс пароля',
            html: `
                <div style="font-family: sans-serif; line-height: 1.5; color: #333;">
                    <h1 style="color: #2c3e50;">Восстановление пароля</h1>
                    <p>Здравствуйте!</p>
                    <p>Вы получили это письмо, потому что мы получили запрос на сброс пароля для вашей учетной записи в системе <strong>"МОНИТОРИУМ"</strong>.</p>
                    <p style="margin: 20px 0;">
                        <a href="${resetUrl}" 
                        style="background-color: #007bff; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                        Сбросить пароль
                        </a>
                    </p>
                    <p style="font-size: 0.9em; color: #666;">
                        Срок действия этой ссылки <strong>1 час</strong>.
                    </p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p style="font-size: 0.8em; color: #999;">
                        Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо. Ваш пароль останется прежним.
                    </p>
                </div>
            `,
        };

        try {
            await this.transporter.sendMail(mailOptions);
            logger.info(`The email has been sent - ${process.env.EMAIL_USER}`, {
                category: 'email',
                operation: 'sendResetPasswordEmail',
            });
            return true;
        } catch (error) {
            logger.error('Error sending email', {
                category: 'email',
                operation: 'sendResetPasswordEmail',
                error: error instanceof Error ? error.message : error,
            });
            return false;
        }
    }
}
