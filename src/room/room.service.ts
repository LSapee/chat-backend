import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Model } from 'mongoose';
import { Room } from '../interfaces/room.interface';

@Injectable()
export class RoomService implements OnModuleInit {
  constructor(@Inject('ROOM_MODEL') private roomModel: Model<Room>

  ) {}
private RoomsCache:Map<string,string[]> = new Map();

// 서버 오픈 모든 Room 가져와서 캐싱
  async onModuleInit() {
    const allRooms = await this.roomModel.find({});
    for(const room of allRooms){
      const roomId = room._id.toString();
      this.RoomsCache.set(roomId,[]);
    }
  }
  // room 생성 및 roomId 반환
  async createRoom(receiverId,serderId):Promise<any>{
    const createdRoom = await this.roomModel.create({
      senderId:serderId,
      receiverId:receiverId,
    })
    return createdRoom;
  }
  //room 입장
  async join(roomId:string,userId:string):Promise<void>{
    if(!this.RoomsCache.get(roomId)) this.RoomsCache.set(roomId,[]);
    const roomMembers:string[] = this.RoomsCache.get(roomId);
    if(roomMembers.indexOf(userId) === -1) {
      this.RoomsCache.get(roomId).push(userId);
    }
  }
  // room 삭제
  async removeRoom(roomId:string){
    const room = await this.roomModel.deleteOne({_id:roomId});
    return room.acknowledged;
  }

}