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
    origin: 'https://chat-frontend-ten-alpha.vercel.app', // 모든 도메인 허용
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
