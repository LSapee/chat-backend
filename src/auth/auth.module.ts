import { Module, NestModule, NestMiddleware, MiddlewareConsumer } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import * as process from 'node:process';
import { AuthMiddleware } from '../middleware/auth.middleware';
import { AwsS3Service } from '../aws/aws.service';
import { diskStorage } from 'multer';
import { MulterModule } from '@nestjs/platform-express';
import { SeedUserMakerService } from '../seeds/user.seed';
@Module({
  imports: [UserModule,
    JwtModule.register({
      global:true,
      secret:process.env.JWT_SECRET || 'default-secret',
      signOptions:{expiresIn:'7d'}
    }),
    MulterModule.register({
      storage: diskStorage({
        destination: './update-profile',
        filename: (req, file, cb) => {
          const filename = `${Date.now()}-${file.originalname}`;
          cb(null, filename);
        },
      }),
      limits: {
        fileSize: 100 * 1024 * 1024, // 최대 파일 크기 100MB로 설정
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService,AwsS3Service,SeedUserMakerService],
  exports: [AuthService,SeedUserMakerService],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        "api/auth/check",
        "api/auth/update-profile",
      )
  }
}
