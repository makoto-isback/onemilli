import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

const logger = new Logger('Bootstrap');

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule, {
      logger: process.env.NODE_ENV === 'production' ? ['error', 'warn'] : ['log', 'error', 'warn', 'debug'],
    });

    // Enable CORS for Telegram Mini App
    app.enableCors({
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true,
    });

    // Enable global validation pipes
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));

    // Set global prefix for API routes
    app.setGlobalPrefix('api');

    // Enable graceful shutdown
    app.enableShutdownHooks();

    // Log all registered routes
    const server = app.getHttpAdapter().getInstance();
    const router = server._router;
    if (router && router.stack) {
      logger.log('📋 REGISTERED ROUTES:');
      router.stack.forEach((layer: any) => {
        if (layer.route) {
          const methods = Object.keys(layer.route.methods).join(', ').toUpperCase();
          logger.log(`  ${methods} ${layer.route.path}`);
        }
      });
    }

    const port = process.env.PORT || 3000;
    await app.listen(port, '0.0.0.0');

    logger.log(`🚀 Application is running on: ${await app.getUrl()}`);
    logger.log(`📊 Health check available at: ${await app.getUrl()}/api/health`);

  } catch (error) {
    logger.error('❌ Failed to start application:', error);
    process.exit(1);
  }
}

bootstrap();
