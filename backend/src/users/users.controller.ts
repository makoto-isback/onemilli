import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { TelegramGuard } from '../auth/telegram.guard';
import { Request } from 'express';

@Controller('users')
@UseGuards(TelegramGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  async getProfile(@Req() req: Request & { user: any }) {
    return this.usersService.getUserProfile(req.user.id);
  }
}

