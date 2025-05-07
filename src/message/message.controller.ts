import { Controller, Delete, Get, Post, Req, Res } from '@nestjs/common';
import { MessageService } from './message.service';

@Controller('api/messages')
export class MessageController {
    constructor(private messageService: MessageService) {}

    // 사이드바 유저 정보 가져오기
    @Get("/users")
    async getUsersForSidebar(@Req() req, @Res() res) {
        try{
          const loggedInUserId = req.user._id;
          const filteredUsers  = await this.messageService.getUsersForSidebar(loggedInUserId);
          res.status(200).json(filteredUsers);
        }catch (error) {
            console.error("Error in getUsersForSidebar",error.message);
            res.status(500).send({error: "Internal server error"});
        }
    }
    // 기존 room의 메시지 가져오기
    @Get("/:id")
    async getMessages(@Req() req, @Res() res) {
        try{
            const { id } = req.params;
            const messages = await this.messageService.getAllMessages(id);
            res.status(200).json(messages);
        }catch (error) {
            console.error("Error in getMessages",error.message);
            res.status(500).send({error: "Internal server error"});
        }
    }
    // 메시지 보내기
    @Post("/send/:id")
    async sendMessage(@Req() req, @Res() res) {
        try{
            const {text, image } = req.body;
            const {id}  = req.params;
            const senderId = req.user._id;
            const message  = await this.messageService.sendMessage(text,image,senderId,id);
            res.status(201).json(message);
        }catch (error) {
            console.error("Error in sendMessage",error.message);
            res.status(500).send({error: "Internal server error"});
        }
    }
    // Room만들기
    @Post("/create-or-join/:id")
    async createOrJoinRoom(@Req() req, @Res() res) {
      try{
        const {id} = req.params;
        const senderId = req.user._id;
        const roomId = await this.messageService.createOrFindRoom(id,senderId);
        res.status(201).json(roomId);
      }catch (e){
        res.status(500).send({error: "Internal server error"});
      }
    }
    //Room 불러오기
    @Get("/rooms/all")
    async getRooms(@Req() req,@Res() res) {
    try{
      const myId = req.user._id;
      const rooms = await this.messageService.getAllRooms(myId);
      res.status(201).json(rooms);
    } catch (e) {
      console.error("error");
      res.status(500).send({error:"Internal server error"})
    }
  }

    @Delete("/rooms/:id")
    async deleteRoom(@Req() req, @Res() res) {
      try{
        const {id} = req.params;
        const message = await this.messageService.deleteRoom(id);
        res.status(200).json({message:message});
      }catch (e) {
        res.status(500).send({error:"Internal server error"})
      }
    }

}

