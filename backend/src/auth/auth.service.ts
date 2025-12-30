import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

export interface TelegramUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export interface TelegramAuthData {
  user: TelegramUser;
  auth_date: number;
  hash: string;
}

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async validateTelegramAuth(initData: string): Promise<string> {
    try {
      const authData = this.parseInitData(initData);
      this.verifyTelegramHash(authData);

      // Check if auth_date is not too old (within 24 hours)
      const now = Math.floor(Date.now() / 1000);
      if (now - authData.auth_date > 86400) {
        throw new UnauthorizedException('Authentication data is too old');
      }

      // Create or update user
      const user = await this.prisma.user.upsert({
        where: { telegramId: authData.user.id.toString() },
        update: {
          username: authData.user.username,
        },
        create: {
          telegramId: authData.user.id.toString(),
          username: authData.user.username,
        },
      });

      // Ensure user has a KYAT balance record
      await this.prisma.kyatBalance.upsert({
        where: { userId: user.id },
        update: {},
        create: { userId: user.id, balance: 0 },
      });

      // Generate JWT token
      const payload = { userId: user.id, telegramId: user.telegramId };
      return this.jwtService.sign(payload);
    } catch (error) {
      throw new UnauthorizedException('Invalid Telegram authentication');
    }
  }

  private parseInitData(initData: string): TelegramAuthData {
    const params = new URLSearchParams(initData);
    const authData: any = {};

    for (const [key, value] of params.entries()) {
      if (key === 'user') {
        authData.user = JSON.parse(value);
      } else if (key === 'auth_date') {
        authData.auth_date = parseInt(value);
      } else {
        authData[key] = value;
      }
    }

    return authData as TelegramAuthData;
  }

  private verifyTelegramHash(authData: TelegramAuthData): void {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      throw new Error('TELEGRAM_BOT_TOKEN not configured');
    }

    // Create data string for hash verification
    const dataString = Object.keys(authData)
      .filter(key => key !== 'hash')
      .sort()
      .map(key => `${key}=${typeof authData[key] === 'object' ? JSON.stringify(authData[key]) : authData[key]}`)
      .join('\n');

    // Create secret key from bot token
    const secretKey = crypto.createHash('sha256').update(botToken).digest();

    // Create HMAC hash
    const hash = crypto.createHmac('sha256', secretKey).update(dataString).digest('hex');

    if (hash !== authData.hash) {
      throw new UnauthorizedException('Invalid hash');
    }
  }
}
