import { CACHE_MANAGER, CacheInterceptor } from '@nestjs/cache-manager';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import type { User } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { ResourcesService } from './resources.service';

@Controller('resources')
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body() createResourceDto: CreateResourceDto,
    @CurrentUser() user: User,
  ) {
    return this.resourcesService.create(createResourceDto, user.id);
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('type') type?: string,
    @Query('tags') tags?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.resourcesService.findAll(pageNum, limitNum, type, tags);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.resourcesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateResourceDto: UpdateResourceDto,
    @CurrentUser() user: User,
  ) {
    return this.resourcesService.update(id, updateResourceDto, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.resourcesService.remove(id, user.id);
  }
}
