import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody, OnGatewayConnection, OnGatewayDisconnect,
} from '@nestjs/websockets';
import {Server,Socket} from  "socket.io"
import process from 'node:process';

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
    if(typeof user_id === 'string') this.userSocketMap.delete(user_id);
    client.emit('getOnlineUsers', Array.from(this.userSocketMap.keys()));
  }

  @SubscribeMessage('newMessage')
  handleMessage(@MessageBody() data): void {
    this.server.to(data.receiverId).emit('newMessage', `Echo: ${data}`);
  }

  getReceiverSocketId(userId:string) {
    return this.userSocketMap.get(userId);
  }
}
