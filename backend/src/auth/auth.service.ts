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

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async validateTelegramAuth(initData: string): Promise<string> {
    if (!initData) {
      throw new UnauthorizedException('Missing initData');
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      console.error('TELEGRAM_BOT_TOKEN missing');
      throw new UnauthorizedException('Server misconfigured');
    }

    // TEMP DEBUG - REMOVE AFTER FIXING
    console.log('Telegram initData:', initData);
    console.log('BOT TOKEN EXISTS:', !!botToken);

    const valid = this.verifyTelegramInitData(initData, botToken);
    if (!valid) {
      throw new UnauthorizedException('Invalid Telegram signature');
    }

    // Parse user data
    const params = new URLSearchParams(initData);
    const userData = params.get('user');
    if (!userData) {
      throw new UnauthorizedException('Missing user data');
    }

    const user = JSON.parse(userData);

    // Check if auth_date is not too old (within 24 hours)
    const authDate = params.get('auth_date');
    if (authDate) {
      const now = Math.floor(Date.now() / 1000);
      const authTimestamp = parseInt(authDate);
      if (now - authTimestamp > 86400) {
        throw new UnauthorizedException('Authentication data is too old');
      }
    }

    // Create or update user
    const dbUser = await this.prisma.user.upsert({
      where: { telegramId: user.id.toString() },
      update: {
        username: user.username,
      },
      create: {
        telegramId: user.id.toString(),
        username: user.username,
      },
    });

    // Ensure user has a KYAT balance record
    await this.prisma.kyatBalance.upsert({
      where: { userId: dbUser.id },
      update: {},
      create: { userId: dbUser.id, balance: 0 },
    });

    // Generate JWT token
    const payload = { userId: dbUser.id, telegramId: dbUser.telegramId };
    return this.jwtService.sign(payload);
  }

  private verifyTelegramInitData(initData: string, botToken: string): boolean {
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    if (!hash) return false;

    params.delete('hash');

    const dataCheckString = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join('\n');

    const secretKey = crypto
      .createHash('sha256')
      .update(botToken)
      .digest();

    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    return calculatedHash === hash;
  }
}
