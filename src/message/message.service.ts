import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { User } from '../interfaces/user.interface';
import { Message } from '../interfaces/message.interface';
import { Room } from '../interfaces/room.interface';
import { AwsS3Service } from '../aws/aws.service';
import {ChatGateway} from "../chat/chat.gateway"
import { RoomService } from '../room/room.service';

@Injectable()
export class MessageService {
  constructor(
    @Inject('USER_MODEL') private readonly userModel: Model<User>,
    @Inject('MESSAGE_MODEL') private readonly messageModel: Model<Message>,
    @Inject('ROOM_MODEL') private readonly roomModel: Model<Room>,
    private awsS3Service: AwsS3Service,
    private chatGateway: ChatGateway,
    private roomService: RoomService,
  ) { }
  //모든 유저 정보 가져오기
  async getUsersForSidebar(userId){
    try{
      const filteredUsers  = await this.userModel.find({
        _id:{$ne:userId}
      }).select("-password");
      const onLineUsers:string[] = this.chatGateway.getOnlineUsers();
      // onLineUsers 위로 가게 정렬
      filteredUsers.sort((a:any,b:any) => {
        if(onLineUsers.indexOf(a._id.toString()) ==-1) return 1;
        else if(onLineUsers.indexOf(b._id.toString()) ==-1) return -1;
        else return 0;
      })
      return filteredUsers;
    }catch (error){
      console.error("Error in getUsersForSidebar");
      throw error;
    }
  }
  //방의 모든 메시지 가져오기
  async getAllMessages(roomId){
      try{
        const messages = await this.messageModel.find({
          roomId:roomId
        });
        return messages;
      }catch (error){
        console.error("Error in getAllMessages");
      }
  }
  //메시지 보내기
  async sendMessage(text,image,senderId,roomId){
    try{
      let imageUrl:any = "";
      const fileName = "ABC";
      if(image){
        // 이미지 업로드
        imageUrl = await this.awsS3Service.fileUpload(image,fileName);
      }
      const newMessage = await new this.messageModel({
        roomId:roomId,
        senderId:senderId,
        text: text,
        imageUrl:imageUrl,
      });
      await newMessage.save();
      // 리얼타임 소켓 기능 추가될 곳
      if(roomId) this.chatGateway.handleMessage(roomId,newMessage);
      return newMessage;
    }catch (error){
      console.error("Error in sendMessage",error.message);
    }

  }
  // 룸 생성 또는 Join
  async createOrFindRoom(receiverId,sendUserId){
    let room :any = await this.roomModel.findOne({
      $or : [
          {senderId:sendUserId,receiverId:receiverId,},
          {senderId:receiverId,receiverId:sendUserId,},
        ]
    });
    let roomsData;
    if(room === null || room.length ===0) room = await this.roomService.createRoom(receiverId,sendUserId);
    const roomId :string= room._id.toString();
    let receiverIdInfo = await this.userModel.find({
      _id:receiverId,
    }).select("-password -email -createdAt -updatedAt -__v");
    roomsData={
      roomID: roomId,
      receiverId: receiverIdInfo,
      lastMessage: "",
    };
    return roomsData;
  }
  // 모든 방 가져오기
  async getAllRooms(myId){
    const rooms = await this.roomModel.find({
      $or : [
        {senderId:myId},
        {receiverId:myId},
      ]
    })
    const roomsData = [];
    for(let i =0; i<rooms.length; i++){
      let lastMessage:any = await this.messageModel.findOne({
        roomId:rooms[i]._id,
      }).sort({ createdAt: -1 });
      lastMessage = !lastMessage ? "" : lastMessage.text;
      let receiverId:any;
      if(rooms[i].senderId == myId) {
        receiverId = await this.userModel.find({
          _id:rooms[i].receiverId,
        }).select("-password -email -createdAt -updatedAt -__v");
      }else{
        receiverId = await this.userModel.find({
          _id:rooms[i].senderId,
        }).select("-password -email -createdAt -updatedAt -__v");
      }
      // 탈퇴한 회원 있을 경우.
      if(receiverId.length===0)continue;
      roomsData.push({
            roomID: rooms[i]._id,
            receiverId: receiverId,
            lastMessage: lastMessage,
        })
    }
    return roomsData;
  }
  //room 삭제하기
  async deleteRoom(roomId){
    try{
      const deletedRoom = await this.roomService.removeRoom(roomId);
      let message = false;
      if(deletedRoom){
        const roomMessages = await this.messageModel.deleteMany({
          roomId:roomId,
        })
        message =roomMessages.acknowledged;
      }
      return message;
    }catch (error){
      console.error("Error in deleteRoom",error.message);
    }
  }

}// 클라스 마지막
