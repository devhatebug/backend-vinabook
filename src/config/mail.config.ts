import dotenv from 'dotenv';
import { Transporter, createTransport } from 'nodemailer';

dotenv.config();

interface MailOptions {
  from: string;
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

class MailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendEmail(to: string, subject: string, text?: string, html?: string): Promise<{ success: boolean; message: string }> {
    const mailOptions: MailOptions = {
      from: `"Hỗ trợ khách hàng" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`Email đã gửi thành công: ${info.messageId}`);
      return { success: true, message: 'Gửi email thành công' };
    } catch (error) {
      console.error('Lỗi khi gửi email:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Lỗi không xác định khi gửi email'
      };
    }
  }
}

export const mailService = new MailService();
