import { Test, TestingModule } from '@nestjs/testing';
import { InventoryItemService } from './inventory-item.service';
import { PrismaService } from '../prisma/prisma.service';
import { faker } from '@faker-js/faker';
import { InventoryItem, Prisma } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';

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

  const mocks = {
    inventoryItem: {
      findMany: jest.fn().mockResolvedValue(findManyResolvedValue), // 返却値がある場合はメソッドチェーンで指定する
      create: jest.fn(),
    },
    category: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    // モジュールのセットアップ
    // 共通のarrange
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryItemService,
        {
          provide: PrismaService,
          useValue: mocks, // mocksで指定した値で
        },
      ],
    }).compile();

    service = module.get<InventoryItemService>(InventoryItemService);
    prismaService = module.get(PrismaService);
  });

  describe('findByCategory', () => {
    test('指定したカテゴリIDの在庫が返却されること', async () => {
      const categoryId = 1;
      const expected = [...findManyResolvedValue];
      // act
      const actual = await service.findByCategory(categoryId);

      // assert
      // 出力値ベースの検証
      expect(actual).toEqual(expected);
      // 指定したカテゴリIDで絞り込んでいることの検証
      // コミュニケーションベースの検証
      expect(prismaService.inventoryItem.findMany).toHaveBeenCalledWith({
        where: { categoryId }, // 指定されたカテゴリIDを検索条件に含めていることを検証する
      });
    });

    describe('未実装機能', () => {
      // todoは test.todoで表現可能
      test.todo('id順でソートされていること');
      test.todo('作成日順でソートされていること');
    });
  });

  describe('createItem', () => {
    describe('カテゴリが存在するとき', () => {
      const categoryId = 1;
      beforeEach(() => {
        // モックの返却値を変更する
        mocks.category.findUnique.mockResolvedValue({
          id: faker.number.int({ min: 0 }),
          name: faker.lorem.word(),
        });
      });
      describe('在庫数量を 0 より小さい値に設定しようとしたとき', () => {
        const data: Omit<Prisma.InventoryItemCreateInput, 'category'> = {
          name: faker.commerce.productName(),
          price: Number(faker.commerce.price()),
          quantity: -1,
        };
        test('BadRequestException が設定されること', async () => {
          await expect(
            // act
            service.createItem(data, categoryId),
          )
            // assert
            .rejects.toThrow(
              new BadRequestException(
                '在庫数量は0より大きい値を設定してください。',
              ),
            );
        });
      });
      describe('在庫数量を 0 に設定しようとしたとき', () => {
        const data: Omit<Prisma.InventoryItemCreateInput, 'category'> = {
          name: faker.commerce.productName(),
          price: Number(faker.commerce.price()),
          quantity: 0,
        };
        test('データが登録されること', async () => {
          const expected = { categoryId: 1, ...data };
          // act
          await service.createItem(data, categoryId);
          // assert
          expect(prismaService.inventoryItem.create).toHaveBeenCalledWith({
            data: expected,
          });
        });
      });
      describe('在庫数量を 0 より大きい値に設定しようとしたとき', () => {
        const data: Omit<Prisma.InventoryItemCreateInput, 'category'> = {
          name: faker.commerce.productName(),
          price: Number(faker.commerce.price()),
          quantity: faker.number.int({ min: 1 }), // 0より大きい整数
        };
        test('データが登録されること', async () => {
          const expected = { categoryId: 1, ...data };
          // act
          await service.createItem(data, categoryId);
          // assert
          expect(prismaService.inventoryItem.create).toHaveBeenCalledWith({
            data: expected,
          });
        });
      });
    });
    describe('カテゴリが存在せず', () => {
      const categoryId = 1;
      beforeEach(() => {
        // モックの返却値を変更する
        mocks.category.findUnique.mockResolvedValue(null);
      });
      describe('在庫数量を 0 より小さい値に設定しようとしたとき', () => {
        const data: Omit<Prisma.InventoryItemCreateInput, 'category'> = {
          name: faker.commerce.productName(),
          price: Number(faker.commerce.price()),
          quantity: -1,
        };
        test('BadRequestException が設定されること', async () => {
          await expect(
            // act
            service.createItem(data, categoryId),
          )
            // assert
            .rejects.toThrow(
              new BadRequestException(
                '在庫数量は0より大きい値を設定してください。',
              ),
            );
        });
      });
      describe('在庫数量を 0 に設定しようとしたとき', () => {
        const data: Omit<Prisma.InventoryItemCreateInput, 'category'> = {
          name: faker.commerce.productName(),
          price: Number(faker.commerce.price()),
          quantity: 0,
        };
        test('BadRequestException が設定されること', async () => {
          await expect(
            // act
            service.createItem(data, categoryId),
          )
            // assert
            .rejects.toThrow(
              new BadRequestException('指定されたカテゴリは存在しません。'),
            );
        });
      });
      describe('在庫数量を 0 より大きい値に設定しようとしたとき', () => {
        const data: Omit<Prisma.InventoryItemCreateInput, 'category'> = {
          name: faker.commerce.productName(),
          price: Number(faker.commerce.price()),
          quantity: faker.number.int({ min: 1 }), // 0より大きい整数
        };
        test('BadRequestException が設定されること', async () => {
          await expect(
            // act
            service.createItem(data, categoryId),
          )
            // assert
            .rejects.toThrow(
              new BadRequestException('指定されたカテゴリは存在しません。'),
            );
        });
      });
    });
  });
});
