import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CategoryService {
  constructor(private readonly prismaService: PrismaService) {}

  findAll() {
    return this.prismaService.category.findMany();
  }

  create(data: Omit<Prisma.CategoryCreateInput, 'items'>) {
    return this.prismaService.category.create({ data });
  }
}
