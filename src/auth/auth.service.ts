import { BadRequestException, Inject, Injectable, Req, Res, UploadedFile } from '@nestjs/common';
import {User} from '../interfaces/user.interface';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { generateToken } from '../utils/utils';
import { AwsS3Service } from '../aws/aws.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject('USER_MODEL') private readonly userModel: Model<User>,
    private awsS3Service: AwsS3Service
  ) {}
  // 회원가입 서비스 부분
  async signUp(fullName, email, password) {
    try{

      // 필요한 정보가 없다면 BadRequestException 반환
      if(!fullName || !email || !password)return new BadRequestException({message:"All fields are required"})
      // 패스워드가 8자리 이하면 BadRequestException 반환
      if(password.length < 8) return new BadRequestException({message:"Password must be between 8 and 16 characters"});
      // 이메일 중복 체크
      const user = await this.userModel.findOne({
        email:email,
      })
      // 해당 이메일을 가진 유저가 있다면
      if(user) return new BadRequestException({message:"Email already exists"});
      // 보안용 salt
      const salt = await bcrypt.genSalt(10);
      // 비밀번호를 그대로 저장하지 않고 암호화하여 저장.
      const hashedPassword = await bcrypt.hash(password,salt);
      // 새로운 유저 생성
      const newUser = await new this.userModel({
        fullName,
        email,
        password:hashedPassword,
      })
      if(newUser) {
        await newUser.save();
        return generateToken(newUser._id);
      }else{
        throw new BadRequestException({message:"Something went wrong"});
      }
    }catch(err){
      //서버 에러
      throw err;
    }
  }
  // 로그인 서비스
  async login(email,password):Promise<string[]> {
    try{
      // 해당 이메일을 가진 유저 확인
      const user = await this.userModel.findOne({email})
      if(!user) throw new BadRequestException({message:"Email or password is incorrect"});
      // 비밀번호 확인
      const isPasswordCorrect = await bcrypt.compare(password,user.password);
      if(!isPasswordCorrect) throw new BadRequestException({message:"Email or password is incorrect"});
      const userID:string = user.id;
      //토큰을 생성하여 반환
      return [generateToken(user._id),userID];
    }catch(err) {
      //서버 에러
      throw err;
    }
  }
  async updateProfile(@UploadedFile() profilePic : Express.Multer.File,fileName:string,userID:string) {
    // 프로필 이미지를 AWS S3에 업로드 후 해당 S3 URL 가져오기
    const fileUrl = await this.awsS3Service.fileUpload(profilePic,fileName);
    // DB에 저장
    const upDatedUser = await this.userModel.findByIdAndUpdate(userID,{
      profilePic:fileUrl
    },{new: true});
    return upDatedUser;
  }
}
