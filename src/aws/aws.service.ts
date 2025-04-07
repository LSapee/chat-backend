import { Injectable } from '@nestjs/common';
import {S3Client,PutObjectCommand} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import * as process from 'node:process';

@Injectable()
export class AwsS3Service {
  s3Client: S3Client;
  Bucket: string;
  constructor(private configService: ConfigService) {
    const AWS_REGION = process.env.AWS_REGION;
    const AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY;
    const AWS_SECRET_KEY = process.env.AWS_SECRET_KEY;
    const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME;

    this.s3Client = new S3Client({
      region: this.configService.get("AWS_REGION"), // AWS Region
      credentials: {
        accessKeyId: this.configService.get("AWS_ACCESS_KEY"), // Access Key
        secretAccessKey: this.configService.get("AWS_SECRET_KEY"), // Secret Key
      },
    });
    this.Bucket = this.configService.get("AWS_BUCKET_NAME");
  }
  async fileUpload(base64Data,fileName:string): Promise<String> {
    try{
      const base64String = base64Data.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64String, 'base64');
      // 파일 타입 추출 (예: image/png)
      const mimeTypeMatch = base64Data.match(/^data:(.+);base64,/);
      const mimeType = mimeTypeMatch ? mimeTypeMatch[1] :'application/octet-stream';
      const key = `${Date.now()}-${fileName}`;
      const BucketName:string = this.configService.get("AWS_BUCKET_NAME");
      const command  = new PutObjectCommand({
        Bucket: BucketName,
        Key: key,
        Body: buffer,
        ContentEncoding: 'base64',
        ContentType: mimeType,
      });
      await this.s3Client.send(command);
      return `https://${this.Bucket}.s3.${this.configService.get("AWS_REGION")}.amazonaws.com/${key}`;
    }catch(error){
      console.error("Error uploading file", error);
      throw new Error("image upload failed");
    }
  }
}
