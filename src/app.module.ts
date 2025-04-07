import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './user/user.module';
import { AwsModule } from './aws/aws.module';
import { MessageController } from './message/message.controller';
import { MessageModule } from './message/message.module';
import { ChatGateway } from './gateway/chat.gateway';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './env/.env.AppSetting'
    }),
    AuthModule,
    DatabaseModule,
    UserModule,
    AwsModule,
    MessageModule
  ],
  controllers: [AppController,MessageController,AuthController, ],
  providers: [AppService, ChatGateway],
})
export class AppModule {}
