import { Module } from '@nestjs/common';
import { LotteryService } from './lottery.service';
import { LotteryController } from './lottery.controller';
import { RoundScheduler } from './round.scheduler';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [WalletModule],
  providers: [LotteryService, RoundScheduler],
  controllers: [LotteryController],
  exports: [LotteryService],
})
export class LotteryModule {}
