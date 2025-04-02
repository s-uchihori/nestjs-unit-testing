import { Injectable } from '@nestjs/common';
import { Category } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InventoryItemService {
  constructor(private readonly prismaService: PrismaService) {}

  findByCategory(categoryId: Category['id']) {
    return this.prismaService.inventoryItem.findMany({
      where: {
        categoryId,
      },
    });
  }
}
