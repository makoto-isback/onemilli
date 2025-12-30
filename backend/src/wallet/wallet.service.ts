import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WalletService {
  constructor(private prisma: PrismaService) {}

  async getBalance(userId: string): Promise<number> {
    const balance = await this.prisma.kyatBalance.findUnique({
      where: { userId },
    });
    return balance?.balance || 0;
  }

  async updateBalance(userId: string, amount: number, type: string, note?: string): Promise<number> {
    return this.prisma.$transaction(async (tx) => {
      // Create transaction record
      await tx.transaction.create({
        data: {
          userId,
          type,
          amount,
          note,
        },
      });

      // Update balance
      const updatedBalance = await tx.kyatBalance.upsert({
        where: { userId },
        update: { balance: { increment: amount } },
        create: { userId, balance: amount },
      });

      return updatedBalance.balance;
    });
  }

  async deductForBet(userId: string, amount: number): Promise<void> {
    const currentBalance = await this.getBalance(userId);
    if (currentBalance < amount) {
      throw new BadRequestException('Insufficient KYAT balance');
    }

    await this.updateBalance(userId, -amount, "BET", `Bet placed: ${amount} KYAT`);
  }

  async creditWinnings(userId: string, amount: number): Promise<void> {
    await this.updateBalance(userId, amount, "WIN", `Lottery winnings: ${amount} KYAT`);
  }

  async recordDeposit(userId: string, amount: number): Promise<void> {
    await this.updateBalance(userId, amount, "DEPOSIT", `Deposit: ${amount} KYAT`);
  }

  async recordWithdrawal(userId: string, amount: number): Promise<void> {
    const currentBalance = await this.getBalance(userId);
    if (currentBalance < amount) {
      throw new BadRequestException('Insufficient balance for withdrawal');
    }

    await this.updateBalance(userId, -amount, "WITHDRAW", `Withdrawal: ${amount} KYAT`);
  }

  async getTransactionHistory(userId: string, limit = 50) {
    return this.prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  // Admin functions
  async adminCredit(userId: string, amount: number, adminNote?: string): Promise<void> {
    const note = adminNote ? `Admin credit: ${adminNote}` : 'Admin credit';
    await this.updateBalance(userId, amount, "ADMIN", note);
  }

  async adminDebit(userId: string, amount: number, adminNote?: string): Promise<void> {
    const currentBalance = await this.getBalance(userId);
    if (currentBalance < amount) {
      throw new BadRequestException('Cannot debit more than current balance');
    }

    const note = adminNote ? `Admin debit: ${adminNote}` : 'Admin debit';
    await this.updateBalance(userId, -amount, "ADMIN", note);
  }
}
