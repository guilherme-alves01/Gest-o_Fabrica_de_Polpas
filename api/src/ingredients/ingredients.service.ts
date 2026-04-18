import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class IngredientsService {
  constructor(private prisma: PrismaService) {}

  async create(data: { name: string; quantity: number; unitCost: number }) {
    const existing = await this.prisma.ingredient.findUnique({
      where: { name: data.name },
    });

    if (existing) {
      return this.prisma.ingredient.update({
        where: { name: data.name },
        data: {
          quantity: existing.quantity + data.quantity,
          unitCost: data.unitCost,
        },
      });
    }

    return this.prisma.ingredient.create({
      data,
    });
  }

  async findAll() {
    return this.prisma.ingredient.findMany({
      orderBy: { name: 'asc' }
    });
  }

  async update(id: number, data: any) {
    return this.prisma.ingredient.update({
      where: { id },
      data: {
        name: data.name,
        quantity: parseFloat(data.quantity),
        unitCost: parseFloat(data.unitCost),
      },
    });
  }

  async remove(id: number) {
    return this.prisma.ingredient.delete({
      where: { id },
    });
  }
}
