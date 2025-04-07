import jwt,{JwtPayload} from 'jsonwebtoken';
import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { Req, Res } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { User } from "../user/user.interface"
import { Model } from 'mongoose';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    @Inject('USER_MODEL') private userModel: Model<User>, // USER_MODEL 주입
  ) {}
  async use(@Req() req:Request,@Res() res: Response,next:NextFunction): Promise<any> {
    try {
      const token = req.cookies.jwt;
      if (!token) return res.status(401).json({ message: "No token provided" });
      const decoded:JwtPayload|string = jwt.verify(token,process.env.JWT_SECRET)
      if(!decoded) return res.status(401).json({ message: "Invalid Token" });
      if(typeof decoded === 'string') return res.status(401).json({ message: "Invalid Token" });
      const user = await this.userModel.findById(decoded.userId).select("-password");
      if(!user) return res.status(404).json({ message: "User not found" });
      req.user = user;
      next();
    }catch (error){
      return res.status(500).json({ message: "Server error", error: error.message });
    }
  }
}






