import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
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
  private readonly logger = new Logger('AuthService');

  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async validateTelegramAuth(initData: string): Promise<string> {
    try {
      this.logger.log('🔍 Starting Telegram authentication validation');

      if (!initData) {
        this.logger.error('❌ MISSING_INIT_DATA: No initData provided');
        throw new UnauthorizedException('Missing initData');
      }

    this.logger.log('✅ INIT_DATA_EXISTS: initData received (length: ' + initData.length + ')');

    this.logger.log('🔐 Step 1: Verifying Telegram WebApp signature');
    const valid = this.verifyTelegramInitData(initData);
    if (!valid) {
      this.logger.error('❌ INVALID_SIGNATURE: Telegram WebApp signature verification failed');
      throw new UnauthorizedException('Invalid Telegram signature');
    }

    this.logger.log('✅ TELEGRAM WEBAPP SIGNATURE VERIFIED');

    this.logger.log('📝 Step 2: Parsing user data');
    // Parse user data
    const params = new URLSearchParams(initData);
    const userData = params.get('user');
    if (!userData) {
      this.logger.error('❌ MISSING_USER_DATA: No user data found in initData');
      throw new UnauthorizedException('Missing user data');
    }

    this.logger.log('✅ USER_DATA_FOUND: User data parsed successfully');
    const user = JSON.parse(userData);

    this.logger.log('⏰ Step 3: Checking auth_date freshness');
    // Check if auth_date is not too old (within 24 hours)
    const authDate = params.get('auth_date');
    if (authDate) {
      const now = Math.floor(Date.now() / 1000);
      const authTimestamp = parseInt(authDate);
      const ageSeconds = now - authTimestamp;

      this.logger.log(`📅 AUTH_DATE_CHECK: auth_date=${authTimestamp}, age=${ageSeconds}s, max_allowed=86400s`);

      if (ageSeconds > 86400) {
        this.logger.error(`❌ AUTH_DATA_TOO_OLD: Authentication data is ${ageSeconds} seconds old (max 86400)`);
        throw new UnauthorizedException('Authentication data is too old');
      }

      this.logger.log('✅ AUTH_DATE_VALID: Authentication data is fresh');
    } else {
      this.logger.warn('⚠️ NO_AUTH_DATE: No auth_date found in initData');
    }

    this.logger.log('💾 Step 4: Creating/updating user in database');
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

    this.logger.log(`✅ USER_CREATED: User ${dbUser.telegramId} (${dbUser.username || 'no username'}) created/updated`);

    this.logger.log('💰 Step 5: Ensuring user has KYAT balance');
    // Ensure user has a KYAT balance record
    await this.prisma.kyatBalance.upsert({
      where: { userId: dbUser.id },
      update: {},
      create: { userId: dbUser.id, balance: 0 },
    });

    this.logger.log('✅ BALANCE_ENSURED: User KYAT balance initialized');

    this.logger.log('🔑 Step 6: Generating JWT token');
    // Generate JWT token
    const payload = { userId: dbUser.id, telegramId: dbUser.telegramId };
    const token = this.jwtService.sign(payload);

      this.logger.log('✅ AUTH_SUCCESS: JWT token generated successfully');
      return token;
    } catch (error) {
      this.logger.error('❌ AUTH_VALIDATION_FAILED: ' + error.message);
      throw error; // Re-throw to preserve error type
    }
  }

  private verifyTelegramInitData(initData: string): boolean {
    const params = new URLSearchParams(initData);

    const signature = params.get('signature');
    if (!signature) return false;

    params.delete('signature');
    params.delete('hash');

    const dataCheckString = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join('\n');

    const publicKey = Buffer.from(
      'MCowBQYDK2VwAyEA1x9kYlR5cYs3sU8Nf+v1tZrJv9Qm0bFzJjJ0YwY=',
      'base64'
    );

    return crypto.verify(
      null,
      Buffer.from(dataCheckString),
      {
        key: publicKey,
        format: 'der',
        type: 'spki',
      },
      Buffer.from(signature, 'base64url')
    );
  }
}
