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

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      this.logger.error('❌ BOT_TOKEN_NOT_SET: TELEGRAM_BOT_TOKEN environment variable not configured');
      throw new UnauthorizedException('Server misconfigured');
    }

    this.logger.log('✅ BOT_TOKEN_EXISTS: Telegram bot token is configured');

    // TEMP DEBUG - REMOVE AFTER FIXING
    console.log('Telegram initData length:', initData?.length || 0);
    console.log('BOT TOKEN EXISTS:', !!botToken);

    this.logger.log('🔐 Step 1: Verifying Telegram signature');
    const valid = this.verifyTelegramInitData(initData, botToken);
    if (!valid) {
      this.logger.error('❌ INVALID_SIGNATURE: Telegram signature verification failed');
      throw new UnauthorizedException('Invalid Telegram signature');
    }

    this.logger.log('✅ SIGNATURE_VALID: Telegram signature verified successfully');

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
