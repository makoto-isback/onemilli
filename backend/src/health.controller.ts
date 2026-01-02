import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getHealth() {
    const dbStatus = await this.checkDatabaseStatus();

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: dbStatus,
    };
  }

  private async checkDatabaseStatus(): Promise<string> {
    try {
      const isAvailable = await this.prisma.isDatabaseAvailable();
      return isAvailable ? 'connected' : 'disconnected';
    } catch {
      return 'error';
    }
  }
}
