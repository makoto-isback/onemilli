import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    await this.connectWithRetry();
  }

  private async connectWithRetry(maxRetries = 10, delay = 2000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.$connect();
        this.logger.log('Database connected successfully');
        return;
      } catch (error) {
        this.logger.warn(
          `Database connection attempt ${attempt}/${maxRetries} failed: ${error.message}`
        );

        if (attempt === maxRetries) {
          this.logger.error('Failed to connect to database after all retries');
          throw error;
        }

        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  async enableShutdownHooks(app: any) {
    // Graceful shutdown hook - called by NestJS
    process.on('SIGTERM', async () => {
      await this.$disconnect();
    });

    process.on('SIGINT', async () => {
      await this.$disconnect();
    });
  }
}
