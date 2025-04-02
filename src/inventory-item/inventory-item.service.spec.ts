import { Test, TestingModule } from '@nestjs/testing';
import { InventoryItemService } from './inventory-item.service';
import { PrismaService } from '../prisma/prisma.service';
import { faker } from '@faker-js/faker';
import { InventoryItem } from '@prisma/client';

describe('InventoryItemService', () => {
  let service: InventoryItemService;
  let prismaService: PrismaService;

  // mockデータのセットアップ
  /**
   * mockの返却値.
   * @see {@link https://fakerjs.dev/guide/}
   */
  const findManyResolvedValue: InventoryItem[] = [...Array(10).keys()].map(
    () => {
      return {
        id: faker.number.int({ min: 0 }), // 値がなんでもいいときはfakerを利用する
        name: faker.commerce.productName(),
        price: Number(faker.commerce.price()),
        description: faker.lorem.sentence(),
        quantity: faker.number.int({ min: 0 }),
        categoryId: 1,
      };
    },
  );

  beforeEach(async () => {
    // モジュールのセットアップ
    // 共通のarrange
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryItemService,
        {
          provide: PrismaService,
          useValue: {
            inventoryItem: {
              findMany: jest.fn().mockResolvedValue(findManyResolvedValue),
            },
          },
        },
      ],
    }).compile();

    service = module.get<InventoryItemService>(InventoryItemService);
    prismaService = module.get(PrismaService);
  });

  describe('findByCategory', () => {
    test('指定したカテゴリIDの在庫が返却されること', async () => {
      const expected = [...findManyResolvedValue];
      // act
      const actual = await service.findByCategory(1);

      // assert
      expect(actual).toEqual(expected);
      // 指定したカテゴリIDで絞り込んでいることの検証
      expect(prismaService.inventoryItem.findMany).toHaveBeenCalledWith({
        where: { categoryId: 1 },
      });
    });

    describe('未実装機能', () => {
      // todoは test.todoで表現可能
      test.todo('id順でソートされていること');
      test.todo('作成日順でソートされていること');
    });
  });
});
