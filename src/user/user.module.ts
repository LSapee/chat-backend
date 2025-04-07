import { Module } from '@nestjs/common';
import { UserProviders } from './user.provider';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports:[DatabaseModule],
  providers: [...UserProviders],
  exports: [...UserProviders],
})
export class UserModule {}
