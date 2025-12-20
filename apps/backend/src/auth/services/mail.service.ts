import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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

    async sendVerificationEmail(
        recipientEmail, // почта пользователя, потом добавить в 'to'
        activationLink,
    ): Promise<boolean> {
        const verificationUrl = `${process.env.API_URL}/api/v1/auth/confirm?token=${activationLink}`;

        const mailOptions = {
            from: `"МОНИТОРИУМ" <${process.env.EMAIL_USER}>`,
            to: `${process.env.EMAIL_USER}`,
            subject: 'Подтверждение регистрации',
            html: `
                <h1>Добро пожаловать!</h1>
                <p>Пожалуйста, перейдите по ссылке ниже, чтобы подтвердить ваш адрес электронной почты:</p>
                <p><a href="${verificationUrl}">Подтвердить мой email</a></p>
                <p>Если вы не регистрировались, просто проигнорируйте это письмо.</p>
            `,
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('Письмо отправлено:', info.messageId);
            return true;
        } catch (error) {
            console.error('Ошибка отправки письма:', error);
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
                        Эта ссылка действительна в течение <strong>1 часа</strong>.
                    </p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p style="font-size: 0.8em; color: #999;">
                        Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо. Ваш пароль останется прежним.
                    </p>
                </div>
            `,
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('Письмо отправлено:', info.messageId);
            return true;
        } catch (error) {
            console.error('Ошибка отправки письма:', error);
            return false;
        }
    }
}
