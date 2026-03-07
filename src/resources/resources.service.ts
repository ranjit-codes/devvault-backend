import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';

@Injectable()
export class ResourcesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createResourceDto: CreateResourceDto, authorId: string) {
    return this.prisma.resource.create({
      data: {
        ...createResourceDto,
        authorId,
      },
    });
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

    return this.prisma.resource.update({
      where: { id },
      data: updateResourceDto,
    });
  }

  async remove(id: string, authorId: string) {
    const resource = await this.findOne(id);
    if (resource.authorId !== authorId) {
      throw new NotFoundException(
        `Resource with ID ${id} not found or you are not the author`,
      );
    }

    return this.prisma.resource.delete({
      where: { id },
    });
  }
}
