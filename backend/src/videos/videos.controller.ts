import { Controller, Post, Get, Param, Body, Query, Req, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuid } from 'uuid';
import { extname } from 'path';
import { VideosService } from './videos.service';

const storage = diskStorage({
  destination: './uploads',
  filename: (_, file, cb) => cb(null, `${uuid()}${extname(file.originalname)}`),
});

@Controller('videos')
export class VideosController {
  constructor(private videosService: VideosService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file', { storage, limits: { fileSize: 100 * 1024 * 1024 } }))
  upload(@Req() req: any, @UploadedFile() file: Express.Multer.File, @Body('caption') caption: string) {
    return this.videosService.upload(req.user.id, file, caption || '');
  }

  @Get()
  findAll(@Query('page') page: string, @Query('limit') limit: string) {
    return this.videosService.findAll(Number(page) || 1, Number(limit) || 20);
  }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.videosService.findOne(id); }

  @Post(':id/like')
  @UseGuards(AuthGuard('jwt'))
  like(@Param('id') id: string) { return this.videosService.like(id); }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) { return this.videosService.findByUser(userId); }
}
