import { UserWithoutPassword } from '../interfaces/user.interface';

declare global {
  namespace Express {
    interface Request {
      user?:UserWithoutPassword
    }
  }
}