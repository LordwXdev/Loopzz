import { Controller, Post, Get, Param, Body, Query, Req, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuid } from 'uuid';
import { extname } from 'path';
import { TracksService } from './tracks.service';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

const storage = diskStorage({
  destination: './uploads',
  filename: (_, file, cb) => cb(null, `${uuid()}${extname(file.originalname)}`),
});

@Controller('tracks')
export class TracksController {
  constructor(private tracksService: TracksService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ARTIST')
  @UseInterceptors(FileInterceptor('file', { storage, limits: { fileSize: 50 * 1024 * 1024 } }))
  upload(@Req() req: any, @UploadedFile() file: Express.Multer.File, @Body('title') title: string) {
    return this.tracksService.upload(req.user.id, file, title || 'Untitled');
  }

  @Get()
  findAll(@Query('page') page: string, @Query('limit') limit: string) {
    return this.tracksService.findAll(Number(page) || 1, Number(limit) || 20);
  }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.tracksService.findOne(id); }

  @Get('artist/:artistId')
  findByArtist(@Param('artistId') artistId: string) { return this.tracksService.findByArtist(artistId); }
}
