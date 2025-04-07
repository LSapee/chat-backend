import { Controller, Get, Post, Req, Res } from '@nestjs/common';
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
    // 기존 사용자간의 메시지 가져오기
    @Get("/:id")
    async getMessages(@Req() req, @Res() res) {
        try{
            const { id } = req.params;
            const senderId = req.user._id;
            const messages = await this.messageService.getAllMessages(id,senderId);
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
}

