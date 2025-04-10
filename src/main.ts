import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {ValidationPipe} from "@nestjs/common";
import * as process from "node:process";
import { config } from "dotenv";

async function bootstrap() {
  config()
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [process.env.REACT_APP_CROS_HOST],
    credentials: true,
    // exposedHeaders: ['Authorization'],
  });
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true
  }));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().then();
