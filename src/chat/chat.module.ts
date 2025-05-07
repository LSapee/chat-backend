import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { RoomProvider } from './chat.provider';
import { DatabaseModule } from '../database/database.module';
import { UserModule } from '../user/user.module';
import { RoomService } from '../room/room.service';

@Module({
  imports:[UserModule,DatabaseModule],
  providers:[RoomService,ChatGateway,...RoomProvider],
  exports:[RoomService,ChatGateway,...RoomProvider],
})
export class ChatModule {}
