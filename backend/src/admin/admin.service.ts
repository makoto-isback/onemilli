import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WalletService } from '../wallet/wallet.service';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private walletService: WalletService,
  ) {}

  private validateAdminToken(token: string): void {
    const adminToken = process.env.ADMIN_TOKEN;
    if (!adminToken || token !== adminToken) {
      throw new UnauthorizedException('Invalid admin token');
    }
  }

  async creditUser(token: string, telegramId: string, amount: number, note?: string) {
    this.validateAdminToken(token);

    const user = await this.prisma.user.findUnique({
      where: { telegramId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    await this.walletService.adminCredit(user.id, amount, note);

    return {
      success: true,
      userId: user.id,
      telegramId,
      amount,
      newBalance: await this.walletService.getBalance(user.id),
    };
  }

  async debitUser(token: string, telegramId: string, amount: number, note?: string) {
    this.validateAdminToken(token);

    const user = await this.prisma.user.findUnique({
      where: { telegramId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    await this.walletService.adminDebit(user.id, amount, note);

    return {
      success: true,
      userId: user.id,
      telegramId,
      amount,
      newBalance: await this.walletService.getBalance(user.id),
    };
  }

  async getAllTransactions(token: string, limit = 100) {
    this.validateAdminToken(token);

    return this.prisma.transaction.findMany({
      include: {
        user: {
          select: {
            telegramId: true,
            username: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getUserDetails(token: string, telegramId: string) {
    this.validateAdminToken(token);

    const user = await this.prisma.user.findUnique({
      where: { telegramId },
      include: {
        kyatBalance: true,
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        bets: {
          include: {
            round: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user.id,
      telegramId: user.telegramId,
      username: user.username,
      balance: user.kyatBalance?.balance || 0,
      transactions: user.transactions,
      bets: user.bets,
      createdAt: user.createdAt,
    };
  }
}
