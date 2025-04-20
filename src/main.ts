import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as process from 'node:process';
import CookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule,{cors:{
      origin: process.env.ORIGIN_URL,
      credentials:true,
    }});
  const PORT = process.env.PORT;
  // ALB 설정을 위한 응답시간 설정
  const server = app.getHttpAdapter().getHttpServer();
  server.keepAliveTimeout = 61 * 1000; // ALB Idle Timeout보다 길게 설정
  server.headersTimeout = 65 * 1000; // 헤더 타임아웃 추가 설정

  // body로 받을수 있는 용량 제한을 50mb로
  app.use(bodyParser.json({limit: '50mb'}));
  app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
  app.use(CookieParser());
  const config = new DocumentBuilder()
    .setTitle('Chat-App')
    .setDescription('The Chat-App API description')
    .setVersion('1.0')
    .addTag('Chat-App')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('apiSettings', app, documentFactory);

  await app.listen(PORT,()=>{
    console.log('Server running on port 5001');
  });
}
bootstrap();
