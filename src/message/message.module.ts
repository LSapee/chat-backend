import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { MessageController } from './message.controller';
import { AuthMiddleware } from '../middleware/auth.middleware';
import { MessageService } from './message.service';
import { MessageProvider } from './message.provider';
import { DatabaseModule } from '../database/database.module';
import { AwsS3Service } from '../aws/aws.service';
import { ChatGateway } from '../chat/chat.gateway';
import { ChatModule } from '../chat/chat.module';

@Module({
  imports: [UserModule,
    DatabaseModule,
    ChatModule
  ],
  controllers: [MessageController],
  providers: [MessageService,AwsS3Service,ChatGateway,...MessageProvider],
  exports: [MessageService,...MessageProvider],
})
export class MessageModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        "api/messages/users",
        "api/messages/:id",
        "api/messages/send/:id",
        "api/messages/create-or-join/:id",
        "api/messages/rooms/all",
      )
  }
}
