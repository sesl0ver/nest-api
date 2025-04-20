import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {ValidationPipe} from "@nestjs/common";
import * as process from "node:process";
import * as bodyParser from 'body-parser';
import { config } from "dotenv";
import {ResponseInterceptor} from "./lib/response.interceptor";
import {GlobalExceptionFilter} from "./lib/exception.filter";

async function bootstrap() {
  config()
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [process.env.NEST_API_CROS_HOST],
    credentials: true,
    // exposedHeaders: ['Authorization'],
  });
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true
  }));

  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new GlobalExceptionFilter());

  await app.listen(process.env.PORT ?? 3333);
}
bootstrap().then();
