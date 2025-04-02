import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { InventoryItemService } from './inventory-item/inventory-item.service';
import { InventoryItemController } from './inventory-item/inventory-item.controller';
import { CategoryService } from './category/category.service';

@Module({
  imports: [],
  controllers: [AppController, InventoryItemController],
  providers: [AppService, PrismaService, InventoryItemService, CategoryService],
})
export class AppModule {}
