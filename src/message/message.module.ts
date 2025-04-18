import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { MessageController } from './message.controller';
import { AuthMiddleware } from '../middleware/auth.middleware';
import { MessageService } from './message.service';
import { MessageProvider } from './message.provider';
import { DatabaseModule } from '../database/database.module';
import { AwsS3Service } from '../aws/aws.service';
import { ChatGateway } from '../chat/chat.gateway';

@Module({
  imports: [UserModule,
    DatabaseModule,
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
      )
  }
}
