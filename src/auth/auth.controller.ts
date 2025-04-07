import { BadRequestException, Controller, Get, HttpException, HttpStatus, Post, Put, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import * as process from 'node:process';
import { SeedUserMakerService } from '../seeds/user.seed';

@Controller('/api/auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private seedUserMakerService:SeedUserMakerService
  ) {}
  // 회원 가입
  @Post("/signup")
  async signUp(@Req() req, @Res() res) {
    try{
      // 이름 이메일, 비밀번호
      const { fullName, email, password } = req.body;
      const token =await this.authService.signUp(fullName, email, password);
      // 토큰을 쿠키에 저장
      res.cookie("jwt",token,{
        maxAge:7*24*60*60*1000,
        httpOnly:true,
        sameSite:"strict",
        secure:process.env.NODE_ENV !== "development" ? true : false, //보안 http /https 구분 NODE_ENV가 개발일 경우 http도 가능
      })
      res.status(HttpStatus.OK).json({ message: 'success' });
    }catch(e){
      if (e instanceof HttpException) {
        res.status(HttpStatus.BAD_REQUEST).json({ message: e.message });
      } else {
        // 기타 서버 에러의 경우 500 응답
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
      }
    }
  }

  @Post("/login")
  async login(@Req() req, @Res() res) {
    try{
      const {email,password} = req.body;
      const token:string[] = await this.authService.login(email,password);
      const userID:string = token[1];
      // 토큰을 쿠키에 저장
      res.cookie("jwt",token[0],{
        maxAge:7*24*60*60*1000,
        httpOnly:true,
        sameSite:"strict",
        secure:process.env.NODE_ENV !== "development" ? true : false, //보안 http /https 구분 NODE_ENV가 개발일 경우 http도 가능
      })
      res.status(201).json({ _id: userID });
    }catch(e){
      if (e instanceof HttpException) {
        res.status(HttpStatus.BAD_REQUEST).json({ message: e.message });
      } else {
        // 기타 서버 에러의 경우 500 응답
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
      }
    }
  }

  @Post("/logout")
  async logout(@Req() req, @Res() res) {
    try{
      // 쿠키에서 토큰을 삭제
      res.cookie("jwt","",{maxAge:0})
      res.status(HttpStatus.OK).json({ message: 'Logged out successfully' });
    }catch(e){
      if (e.status instanceof BadRequestException) {
        res.status(HttpStatus.BAD_REQUEST).json({ message: e.message });
      } else {
        // 기타 서버 에러의 경우 500 응답
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
      }
    }
  }

  @Put("/update-profile")
  async updateProfile(@Req() req, @Res() res) {
    try{
      const { profilePic,fileName } = req.body;
      const userId = req.user._id;
      // 이미지가 없다면 에러 발생
      if(!profilePic) res.status(400).json({ message : "Profile picture already" });

      const uploadProfilePic = await this.authService.updateProfile(profilePic,fileName,userId);
      res.status(200).json(uploadProfilePic);
    }catch (e){
      console.error("에러 발생",e);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
    }
  }

  @Get("/check")
  async check(@Req() req, @Res() res) {
    try{
      res.status(HttpStatus.OK).json(req.user);
    }catch(e){
      console.error(e);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // 더미 회원가입 자료 가입 시키기
  @Get("/test")
  async test(@Req() req, @Res() res) {
    try{
      await this.seedUserMakerService.makeSeedUsers();
      res.status(HttpStatus.OK).json({message:"success"});
    }catch(e){
      console.error(e);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}
