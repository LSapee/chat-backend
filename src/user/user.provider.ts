import {Connection} from 'mongoose';
import {userSchema} from '../schemas/user.schema';

export const UserProviders = [
  {
    provide: 'USER_MODEL',
    useFactory: (connection:Connection) => connection.model('User', userSchema),
    inject: ['DATABASE_CONNECTION'],
  }
]
