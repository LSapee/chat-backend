import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody, OnGatewayConnection, OnGatewayDisconnect,
} from '@nestjs/websockets';
import {Server,Socket} from  "socket.io"

@WebSocketGateway({
  namespace: '/chat',
  cors: {
    origin: 'http://localhost:3000', // 모든 도메인 허용
  },
  }
)

export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSocketMap:Map<string,string> = new Map();
  private userId:string|string[] = "";

  // 연결
  handleConnection(client: Socket) {
    this.userId= client.handshake.query.userId;
    if(typeof this.userId === 'string') this.userSocketMap.set(this.userId,client.id);
    client.emit('getOnlineUsers', Array.from(this.userSocketMap.keys()));
  }
  // 연결 해제
  handleDisconnect(client: Socket) {
    if(this.userId === typeof 'string') this.userSocketMap.delete(this.userId);
    client.emit('getOnlineUsers', Object.keys(this.userSocketMap));
  }
  //
  // @SubscribeMessage('message')
  // handleMessage(@MessageBody() data: string): void {
  //   console.log("전체 뿌리기");
  //   // this.server.emit('message', `Echo: ${data}`);
  // }

  getReceiverSocketId(userId:string) {
    return this.userSocketMap.get(userId);
  }
}
