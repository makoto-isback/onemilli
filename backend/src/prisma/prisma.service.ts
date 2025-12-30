import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  async enableShutdownHooks(app: any) {
    // Shutdown hooks for production use
    // this.$on('beforeExit', async () => {
    //   await app.close();
    // });
  }
}
