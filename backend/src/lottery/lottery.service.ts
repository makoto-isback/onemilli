import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WalletService } from '../wallet/wallet.service';

@Injectable()
export class LotteryService {
  private readonly ROUND_DURATION_MINUTES = parseInt(process.env.ROUND_DURATION_MINUTES || '60'); // 1 hour default

  constructor(
    private prisma: PrismaService,
    private walletService: WalletService,
  ) {}

  async getActiveRound() {
    let round = await this.prisma.round.findFirst({
      where: { status: "ACTIVE" },
      include: {
        bets: {
          include: { user: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    // If no active round, create one
    if (!round) {
      round = await this.createNewRound();
    }

    const endTime = new Date(round.createdAt.getTime() + this.ROUND_DURATION_MINUTES * 60 * 1000);
    const timeLeft = Math.max(0, endTime.getTime() - Date.now());

    return {
      id: round.id,
      totalPool: round.totalPool,
      betCount: round.bets.length,
      endTime: endTime.toISOString(),
      timeLeftMs: timeLeft,
      bets: round.bets.map(bet => ({
        id: bet.id,
        userId: bet.userId,
        username: bet.user.username,
        amount: bet.amount,
        createdAt: bet.createdAt,
      })),
    };
  }

  async placeBet(userId: string, amount: number) {
    if (amount <= 0) {
      throw new BadRequestException('Bet amount must be positive');
    }

    // Minimum bet of 10 KYAT
    if (amount < 10) {
      throw new BadRequestException('Minimum bet is 10 KYAT');
    }

    const round = await this.getActiveRound();

    // Deduct from wallet first
    await this.walletService.deductForBet(userId, amount);

    // Create bet record
    const bet = await this.prisma.bet.create({
      data: {
        userId,
        roundId: round.id,
        amount,
      },
    });

    // Update round total
    await this.prisma.round.update({
      where: { id: round.id },
      data: { totalPool: { increment: amount } },
    });

    return bet;
  }

  async createNewRound() {
    return this.prisma.round.create({
      data: {
        status: "ACTIVE",
        totalPool: 0,
      },
      include: {
        bets: {
          include: { user: true },
        },
      },
    });
  }

  async endRound(roundId: string) {
    const round = await this.prisma.round.findUnique({
      where: { id: roundId },
      include: { bets: true },
    });

    if (!round || round.status !== "ACTIVE") {
      throw new BadRequestException('Round not found or already ended');
    }

    if (round.bets.length === 0) {
      // No bets, just end the round
      await this.prisma.round.update({
        where: { id: roundId },
        data: {
          status: "FINISHED",
          endedAt: new Date(),
        },
      });
      return null;
    }

    // Select random winner
    const randomIndex = Math.floor(Math.random() * round.bets.length);
    const winningBet = round.bets[randomIndex];

    // Calculate winnings (90% of pool)
    const winnings = Math.floor(round.totalPool * 0.9);

    // Credit winner
    await this.walletService.creditWinnings(winningBet.userId, winnings);

    // Update round with winner
    const finishedRound = await this.prisma.round.update({
      where: { id: roundId },
      data: {
        status: "FINISHED",
        winnerUserId: winningBet.userId,
        endedAt: new Date(),
      },
      include: {
        winner: true,
        bets: {
          include: { user: true },
        },
      },
    });

    return {
      roundId: finishedRound.id,
      winner: {
        userId: winningBet.userId,
        username: finishedRound.winner?.username,
        winnings,
      },
      totalPool: round.totalPool,
      betCount: round.bets.length,
    };
  }

  async getRoundHistory(limit = 10) {
    const rounds = await this.prisma.round.findMany({
      where: { status: "FINISHED" },
      include: {
        winner: true,
        bets: {
          include: { user: true },
        },
      },
      orderBy: { endedAt: 'desc' },
      take: limit,
    });

    return rounds.map(round => ({
      id: round.id,
      totalPool: round.totalPool,
      winner: round.winner ? {
        username: round.winner.username,
        winnings: Math.floor(round.totalPool * 0.9),
      } : null,
      betCount: round.bets.length,
      endedAt: round.endedAt,
    }));
  }
}
