import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { User } from '../interfaces/user.interface';
import { Message } from '../interfaces/message.interface';
import { AwsS3Service } from '../aws/aws.service';
import {ChatGateway} from "../chat/chat.gateway"

@Injectable()
export class MessageService {
  constructor(
    @Inject('USER_MODEL') private readonly userModel: Model<User>,
    @Inject('MESSAGE_MODEL') private readonly messageModel: Model<Message>,
    private awsS3Service: AwsS3Service,
    private chatGateway: ChatGateway,
  ) { }

  async getUsersForSidebar(userId){
    try{
      const filteredUsers  = await this.userModel.find({
        _id:{$ne:userId}
      }).select("-password")
      return filteredUsers;
    }catch (error){
      console.error("Error in getUsersForSidebar");
      throw error;
    }
  }

  async getAllMessages(userId,sendUserId){
      try{
        const messages = await this.messageModel.find({
          $or:[
            {senderId:sendUserId,receiverId:userId,},
            {senderId:userId,receiverId:sendUserId,},
          ]
        });
        return messages;
      }catch (error){
        console.error("Error in getAllMessages");
      }
  }

  async sendMessage(text,image,senderId,selectedId){
    try{
      let imageUrl:any = "";
      const fileName = "ABC";
      if(image){
        // 이미지 업로드
        imageUrl = await this.awsS3Service.fileUpload(image,fileName);
      }
      const newMessage = await new this.messageModel({
        senderId:senderId,
        receiverId:selectedId,
        text: text,
        imageUrl:imageUrl,
      });
      await newMessage.save();
      // 리얼타임 소켓 기능 추가될 곳
      const receiverSocketId = this.chatGateway.getReceiverSocketId(selectedId)
      if(receiverSocketId) this.chatGateway.handleMessage(receiverSocketId,newMessage);
      return newMessage;
    }catch (error){
      console.error("Error in sendMessage",error.message);
    }

  }
}// 클라스 마지막
