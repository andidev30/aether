import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { config as loadEnv } from 'dotenv';
import { AppModule } from './app.module';

async function bootstrap() {
  loadEnv();

  const app = await NestFactory.create(AppModule, {
    bufferLogs: true
  });

  app.enableCors({
    origin: true,
    credentials: true
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
    })
  );

  app.setGlobalPrefix('api');

  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`🚀 Aether backend is running on http://localhost:${port}`);
}

bootstrap().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Failed to bootstrap NestJS application', error);
  process.exitCode = 1;
});
