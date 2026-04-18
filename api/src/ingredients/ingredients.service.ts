import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class IngredientsService {
  constructor(private prisma: PrismaService) {}

  async create(data: { name: string; quantity: number; unitCost: number }) {
    // Upsert logic: if ingredient with name exists, update it by adding quantity and recalculating average cost or just updating.
    // Let's keep it simple: find by name, update quantity and cost.
    const existing = await this.prisma.ingredient.findUnique({
      where: { name: data.name },
    });

    if (existing) {
      return this.prisma.ingredient.update({
        where: { name: data.name },
        data: {
          quantity: existing.quantity + data.quantity,
          unitCost: data.unitCost, // Update to latest cost
        },
      });
    }

    return this.prisma.ingredient.create({
      data,
    });
  }

  async findAll() {
    return this.prisma.ingredient.findMany();
  }
}
