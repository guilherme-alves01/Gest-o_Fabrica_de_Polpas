import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductionService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    productName: string;
    ingredientName: string;
    ingredientUsed: number;
    outputQuantity: number;
    productionType: string; // "POLPA" or "LICOR"
  }) {
    const ingredient = await this.prisma.ingredient.findUnique({
      where: { name: data.ingredientName },
    });

    if (!ingredient || ingredient.quantity < data.ingredientUsed) {
      throw new BadRequestException('Estoque insuficiente de ' + data.ingredientName);
    }

    // Atomic transaction for production
    return this.prisma.$transaction(async (tx) => {
      // 1. Subtract ingredient
      await tx.ingredient.update({
        where: { name: data.ingredientName },
        data: { quantity: { decrement: data.ingredientUsed } },
      });

      // 2. Add product (Upsert)
      await tx.product.upsert({
        where: { name: data.productName },
        update: { quantity: { increment: data.outputQuantity } },
        create: {
          name: data.productName,
          quantity: data.outputQuantity,
          type: data.productionType,
          unitPrice: 0, // Should be updated via a Product module or default
        },
      });

      // 3. Log production
      return tx.production.create({
        data,
      });
    });
  }

  async findAll() {
    return this.prisma.production.findMany({
      orderBy: { date: 'desc' },
    });
  }
}
