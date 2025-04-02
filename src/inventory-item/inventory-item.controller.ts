import { Controller } from '@nestjs/common';
import { InventoryItemService } from './inventory-item.service';

@Controller('inventory-item')
export class InventoryItemController {
  constructor(private readonly inventoryItemService: InventoryItemService) {}
}
