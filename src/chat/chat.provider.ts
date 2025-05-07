import { Connection } from 'mongoose';
import { roomSchema } from '../schemas/room.schema';

export const RoomProvider = [
  {
    provide: 'ROOM_MODEL',
    useFactory: (connection:Connection) => connection.model('Room', roomSchema),
    inject: ['DATABASE_CONNECTION'],
  }
]