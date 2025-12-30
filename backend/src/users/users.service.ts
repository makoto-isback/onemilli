import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByTelegramId(telegramId: string) {
    return this.prisma.user.findUnique({
      where: { telegramId },
      include: {
        kyatBalance: true,
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });
  }

  async findById(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        kyatBalance: true,
      },
    });
  }

  async getUserProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
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
      recentBets: user.bets,
      createdAt: user.createdAt,
    };
  }
}
