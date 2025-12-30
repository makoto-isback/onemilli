import { Controller, Get, Post, Body, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { TelegramGuard } from '../auth/telegram.guard';
import { Request } from 'express';

@Controller('wallet')
@UseGuards(TelegramGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('balance')
  async getBalance(@Req() req: Request & { user: any }) {
    const balance = await this.walletService.getBalance(req.user.id);
    return { balance };
  }

  @Get('transactions')
  async getTransactions(@Req() req: Request & { user: any }) {
    const transactions = await this.walletService.getTransactionHistory(req.user.id);
    return { transactions };
  }

  @Post('deposit')
  async requestDeposit(@Req() req: Request & { user: any }, @Body() body: { amount: number }) {
    if (!body.amount || body.amount <= 0) {
      throw new BadRequestException('Invalid deposit amount');
    }

    // In a real implementation, this would send a message to support
    // For now, we'll just return success and note that admin needs to process
    return {
      success: true,
      message: 'Deposit request submitted. Please contact support to complete the deposit.',
      amount: body.amount,
    };
  }

  @Post('withdraw')
  async requestWithdraw(@Req() req: Request & { user: any }, @Body() body: { amount: number }) {
    if (!body.amount || body.amount <= 0) {
      throw new BadRequestException('Invalid withdrawal amount');
    }

    // Check balance
    const balance = await this.walletService.getBalance(req.user.id);
    if (balance < body.amount) {
      throw new BadRequestException('Insufficient balance');
    }

    // In a real implementation, this would send a message to support
    // For now, we'll just return success and note that admin needs to process
    return {
      success: true,
      message: 'Withdrawal request submitted. Please contact support to complete the withdrawal.',
      amount: body.amount,
    };
  }
}
