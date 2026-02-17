import { Controller, Get, Patch, Param, Body, Req, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('artists')
  getArtists(@Query('page') page: string) { return this.usersService.getArtists(Number(page) || 1); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.usersService.findOne(id); }

  @Patch('profile')
  @UseGuards(AuthGuard('jwt'))
  updateProfile(@Req() req: any, @Body() body: { username?: string; bio?: string }) {
    return this.usersService.updateProfile(req.user.id, body);
  }
}
