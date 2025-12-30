import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('telegram')
  async telegramAuth(@Body() body: { initData: string }) {
    if (!body.initData) {
      throw new Error('initData is required');
    }

    const token = await this.authService.validateTelegramAuth(body.initData);

    return {
      success: true,
      token,
    };
  }
}
