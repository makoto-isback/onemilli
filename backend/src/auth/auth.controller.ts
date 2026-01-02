import { Controller, Post, Body, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger('AuthController');

  constructor(private readonly authService: AuthService) {}

  @Post('telegram')
  async telegramAuth(@Body() body: { initData: string }) {
    this.logger.log('🔐 Telegram auth request received');

    // Check 1: initData exists
    if (!body.initData) {
      this.logger.error('❌ MISSING_INIT_DATA: No initData in request body');
      throw new HttpException(
        { error: 'MISSING_INIT_DATA', message: 'initData is required' },
        HttpStatus.UNAUTHORIZED
      );
    }

    this.logger.log('✅ initData exists (length: ' + body.initData.length + ')');

    try {
      const token = await this.authService.validateTelegramAuth(body.initData);
      this.logger.log('✅ Authentication successful');
      return {
        success: true,
        token,
      };
    } catch (error) {
      // Log the specific error type
      if (error.message?.includes('Server misconfigured')) {
        this.logger.error('❌ BOT_TOKEN_NOT_SET: ' + error.message);
        throw new HttpException(
          { error: 'BOT_TOKEN_NOT_SET', message: 'Server configuration error' },
          HttpStatus.UNAUTHORIZED
        );
      } else if (error.message?.includes('Invalid Telegram signature')) {
        this.logger.error('❌ INVALID_SIGNATURE: Telegram signature verification failed');
        throw new HttpException(
          { error: 'INVALID_SIGNATURE', message: 'Invalid Telegram signature' },
          HttpStatus.UNAUTHORIZED
        );
      } else if (error.message?.includes('Missing user data')) {
        this.logger.error('❌ MISSING_USER_DATA: No user data in initData');
        throw new HttpException(
          { error: 'MISSING_USER_DATA', message: 'Missing user data in Telegram auth' },
          HttpStatus.UNAUTHORIZED
        );
      } else if (error.message?.includes('too old')) {
        this.logger.error('❌ AUTH_DATA_TOO_OLD: ' + error.message);
        throw new HttpException(
          { error: 'AUTH_DATA_TOO_OLD', message: 'Authentication data is too old' },
          HttpStatus.UNAUTHORIZED
        );
      } else {
        this.logger.error('❌ UNKNOWN_AUTH_ERROR: ' + error.message);
        throw new HttpException(
          { error: 'UNKNOWN_AUTH_ERROR', message: 'Authentication failed' },
          HttpStatus.UNAUTHORIZED
        );
      }
    }
  }
}
