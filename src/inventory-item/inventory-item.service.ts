import { BadRequestException, Injectable } from '@nestjs/common';
import { Category, Prisma } from '@prisma/client';
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

  async createItem(
    data: Omit<Prisma.InventoryItemCreateInput, 'category'>,
    categoryId: Category['id'],
  ) {
    // バリデーション
    // (本来はController層でclass-validatorとかでやっていると思うが勉強のためにやる)

    if (data.quantity != null && data.quantity < 0) {
      throw new BadRequestException(
        '在庫数量は0より大きい値を設定してください。',
      );
    }

    // カテゴリの存在チェック

    const category = await this.prismaService.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new BadRequestException('指定されたカテゴリは存在しません。');
    }

    // データ作成
    return this.prismaService.inventoryItem.create({
      data: { ...data, categoryId },
    });
  }
}
