import { Connection } from 'mongoose';
import { messageSchema } from '../schemas/message.schema';

export const MessageProvider = [
  {
    provide: 'MESSAGE_MODEL',
    useFactory: (connection:Connection) => connection.model('Message', messageSchema),
    inject: ['DATABASE_CONNECTION'],
  }
]