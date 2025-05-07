import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody, OnGatewayConnection, OnGatewayDisconnect,
} from '@nestjs/websockets';
import {Server,Socket} from  "socket.io"
import process from 'node:process';
import { Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import { Room } from '../interfaces/room.interface';
import { RoomService } from '../room/room.service';

@WebSocketGateway({
  namespace: '/chat',
  cors: {
    origin: [
      process.env.ORIGIN_URL,
      "http://localhost:3000",
      "https://chat.lsapee.com"
    ]
  },
  }
)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    @Inject('ROOM_MODEL') private readonly roomModel: Model<Room>,
    private roomService: RoomService
  ) {}
  @WebSocketServer()
  server: Server;
  private userSocketMap:Map<string,string> = new Map();

  // 연결
  handleConnection(client: Socket) {
    const user_id:string|string[] =  client.handshake.query.userId;
    if(typeof user_id === 'string') this.userSocketMap.set(user_id,client.id);
    client.emit('getOnlineUsers', Array.from(this.userSocketMap.keys()));
  }
  // 연결 해제
  handleDisconnect(client: Socket) {
    const user_id:string|string[] = client.handshake.query.userId;
    if(typeof user_id === 'string') {
      this.userSocketMap.delete(user_id);
    }
    client.emit('getOnlineUsers', Array.from(this.userSocketMap.keys()));
  }
  // 기존의 모든 방에 참가
  @SubscribeMessage('allRoomConnected')
  async handleAllRoomConnected(client:Socket): Promise<void> {
    try{
      const user_id:string|string[] =  client.handshake.query.userId;
      if(typeof user_id === 'string'){
        const RoomIds = await this.roomModel.find({
          $or: [{ senderId:user_id}, { receiverId:user_id}]
        })
        for(let i =0; i<RoomIds.length; i++){
          const roomId = RoomIds[i]._id.toString();
          client.join(roomId);
          this.server.to(roomId).emit('allRoomConnected',{
            room:roomId,
            members:[user_id]
          });
        }
      }
    }catch(error){
      console.error("Error in handleAllRoomConnected",error);
    }

  }
  // 방에 참가하기
  @SubscribeMessage('joinRoom')
  async handleJoinRoom(client:Socket,roomId:string): Promise<void> {
    const user_id:string|string[] = client.handshake.query.userId;
    if(typeof user_id === 'string')await this.roomService.join(roomId,user_id);
    client.join(roomId);
  }
  //새로운 메시지
  @SubscribeMessage('newMessage')
  handleMessage(socketId:string,@MessageBody() data): void {
    this.server.to(socketId).emit('newMessage', data);
  }

  // 온라인 유저목록 가져오기
  getOnlineUsers() :string[]{
    return Array.from(this.userSocketMap.keys());
  }
}
