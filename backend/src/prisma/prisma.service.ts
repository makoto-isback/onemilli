import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);
  private isConnected = false;

  async onModuleInit() {
    // Start connection attempt in background - don't block app startup
    this.connectWithRetry().catch((error) => {
      this.logger.error('Database connection failed permanently:', error.message);
    });
  }

  private async connectWithRetry(maxRetries = 50, delay = 5000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.$connect();
        this.isConnected = true;
        this.logger.log('✅ Database connected successfully');
        return;
      } catch (error) {
        this.logger.warn(
          `Database connection attempt ${attempt}/${maxRetries} failed: ${error.message}`
        );

        if (attempt === maxRetries) {
          this.logger.error('Failed to connect to database after all retries - app will continue without database');
          return; // Don't throw - let app continue
        }

        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // Method to check if database is available
  async isDatabaseAvailable(): Promise<boolean> {
    if (!this.isConnected) return false;

    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch {
      this.isConnected = false;
      return false;
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
