import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as process from 'node:process';
import CookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule,{cors:{
      origin:"http://localhost:3000",
      credentials:true,
    }});
  const PORT = process.env.PORT||5001;
  // body로 받을수 있는 용량 제한을 50mb로
  app.use(bodyParser.json({limit: '50mb'}));
  app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
  app.use(CookieParser());
  await app.listen(PORT,()=>{
    console.log('Server running on port 5001');
  });
}
bootstrap();
