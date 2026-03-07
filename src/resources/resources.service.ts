import { InjectQueue } from '@nestjs/bullmq';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Queue } from 'bullmq';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationJob } from '../queue/dto/notification-job.dto';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';

@Injectable()
export class ResourcesService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectQueue('notifications')
    private notificationsQueue: Queue<NotificationJob>,
  ) {}

  async create(createResourceDto: CreateResourceDto, authorId: string) {
    const resource = await this.prisma.resource.create({
      data: {
        ...createResourceDto,
        authorId,
      },
    });
    // Invalidate resources cache
    await this.clearResourcesCache();

    // Push background job
    await this.notificationsQueue.add(
      'resource-created',
      {
        resourceId: resource.id,
        resourceTitle: resource.title,
        authorId: resource.authorId,
      },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: true,
      },
    );

    return resource;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    type?: string,
    tags?: string,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (type) {
      where.type = type;
    }
    if (tags) {
      // Tags comma separated e.g. "nestjs,prisma"
      const tagsArray = tags.split(',').map((t) => t.trim());
      where.tags = { hasSome: tagsArray };
    }

    const [data, total] = await Promise.all([
      this.prisma.resource.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.resource.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const resource = await this.prisma.resource.findUnique({
      where: { id },
    });
    if (!resource) {
      throw new NotFoundException(`Resource with ID ${id} not found`);
    }
    return resource;
  }

  async update(
    id: string,
    updateResourceDto: UpdateResourceDto,
    authorId: string,
  ) {
    const resource = await this.findOne(id);
    if (resource.authorId !== authorId) {
      throw new NotFoundException(
        `Resource with ID ${id} not found or you are not the author`,
      );
    }

    const updated = await this.prisma.resource.update({
      where: { id },
      data: updateResourceDto,
    });
    await this.clearResourcesCache();
    return updated;
  }

  async remove(id: string, authorId: string) {
    const resource = await this.findOne(id);
    if (resource.authorId !== authorId) {
      throw new NotFoundException(
        `Resource with ID ${id} not found or you are not the author`,
      );
    }

    const deleted = await this.prisma.resource.delete({
      where: { id },
    });
    await this.clearResourcesCache();
    return deleted;
  }

  // Helper method to clear list caches. A simpler approach is to wipe everything starting with '/resources'
  private async clearResourcesCache() {
    // Note: cache-manager w/ redis store requires getting all keys to delete wildcards.
    // However standard cache-manager v5+ `redisStore` allows pattern matching or we can just reset
    // For simplicity, we can reset everything globally (or keep a list of keys)
    await this.cacheManager.clear();
  }
}
