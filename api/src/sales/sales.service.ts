import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  async create(data: { productName: string; quantity: number; totalValue: number }) {
    const product = await this.prisma.product.findUnique({
      where: { name: data.productName },
    });

    if (!product || product.quantity < data.quantity) {
      throw new BadRequestException('Estoque insuficiente de ' + data.productName);
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Subtract product stock
      await tx.product.update({
        where: { name: data.productName },
        data: { quantity: { decrement: data.quantity } },
      });

      // 2. Log sale
      return tx.sale.create({
        data,
      });
    });
  }

  async findAll() {
    return this.prisma.sale.findMany({
      orderBy: { date: 'desc' },
    });
  }
}
