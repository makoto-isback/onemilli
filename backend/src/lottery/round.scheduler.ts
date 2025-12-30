import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LotteryService } from './lottery.service';

@Injectable()
export class RoundScheduler {
  constructor(private lotteryService: LotteryService) {}

  @Cron('0 * * * *') // Run every hour at minute 0
  async handleRoundEnd() {
    try {
      const activeRound = await this.lotteryService.getActiveRound();
      const endTime = new Date(activeRound.endTime);

      // Check if round should end
      if (Date.now() >= endTime.getTime()) {
        console.log(`Ending round ${activeRound.id}`);
        const result = await this.lotteryService.endRound(activeRound.id);

        if (result) {
          console.log(`Round ${result.roundId} ended. Winner: ${result.winner.username}, Winnings: ${result.winner.winnings} KYAT`);
        } else {
          console.log(`Round ${activeRound.id} ended with no winner (no bets)`);
        }

        // Create new round
        await this.lotteryService.createNewRound();
        console.log('New round created');
      }
    } catch (error) {
      console.error('Error in round scheduler:', error);
    }
  }

  // Also check every minute for more responsive round ending
  @Cron(CronExpression.EVERY_MINUTE)
  async checkRoundStatus() {
    try {
      const activeRound = await this.lotteryService.getActiveRound();
      const endTime = new Date(activeRound.endTime);

      if (Date.now() >= endTime.getTime()) {
        await this.handleRoundEnd();
      }
    } catch (error) {
      // Silently handle errors to avoid cron spam
    }
  }
}
