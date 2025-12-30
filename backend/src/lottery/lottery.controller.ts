import { Controller, Get, Post, Body, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { LotteryService } from './lottery.service';
import { TelegramGuard } from '../auth/telegram.guard';
import { Request } from 'express';

@Controller('lottery')
export class LotteryController {
  constructor(private readonly lotteryService: LotteryService) {}

  @Get('round')
  async getActiveRound() {
    return this.lotteryService.getActiveRound();
  }

  @Get('history')
  async getHistory() {
    return this.lotteryService.getRoundHistory();
  }

  @Post('bet')
  @UseGuards(TelegramGuard)
  async placeBet(@Req() req: Request & { user: any }, @Body() body: { amount: number }) {
    if (!body.amount || body.amount <= 0) {
      throw new BadRequestException('Invalid bet amount');
    }

    const bet = await this.lotteryService.placeBet(req.user.id, body.amount);

    return {
      success: true,
      bet: {
        id: bet.id,
        amount: bet.amount,
        roundId: bet.roundId,
        createdAt: bet.createdAt,
      },
    };
  }
}
