import { Controller, Post, Get, Body, Headers, Param, BadRequestException } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('credit')
  async creditUser(
    @Headers('authorization') auth: string,
    @Body() body: { telegramId: string; amount: number; note?: string }
  ) {
    if (!auth || !auth.startsWith('Bearer ')) {
      throw new BadRequestException('Admin token required');
    }

    const token = auth.substring(7); // Remove 'Bearer ' prefix

    if (!body.telegramId || !body.amount || body.amount <= 0) {
      throw new BadRequestException('Invalid parameters');
    }

    return this.adminService.creditUser(token, body.telegramId, body.amount, body.note);
  }

  @Post('debit')
  async debitUser(
    @Headers('authorization') auth: string,
    @Body() body: { telegramId: string; amount: number; note?: string }
  ) {
    if (!auth || !auth.startsWith('Bearer ')) {
      throw new BadRequestException('Admin token required');
    }

    const token = auth.substring(7);

    if (!body.telegramId || !body.amount || body.amount <= 0) {
      throw new BadRequestException('Invalid parameters');
    }

    return this.adminService.debitUser(token, body.telegramId, body.amount, body.note);
  }

  @Get('transactions')
  async getTransactions(@Headers('authorization') auth: string) {
    if (!auth || !auth.startsWith('Bearer ')) {
      throw new BadRequestException('Admin token required');
    }

    const token = auth.substring(7);
    return this.adminService.getAllTransactions(token);
  }

  @Get('user/:telegramId')
  async getUserDetails(
    @Headers('authorization') auth: string,
    @Param('telegramId') telegramId: string
  ) {
    if (!auth || !auth.startsWith('Bearer ')) {
      throw new BadRequestException('Admin token required');
    }

    const token = auth.substring(7);
    return this.adminService.getUserDetails(token, telegramId);
  }
}
