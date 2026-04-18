import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    // Note: This simplified version doesn't return stock automatically on create to avoid complexity
    // It subtracts from product quantity
    const product = await this.prisma.product.findUnique({ where: { name: data.productName } });
    if (product) {
      await this.prisma.product.update({
        where: { name: data.productName },
        data: { quantity: { decrement: parseFloat(data.quantity) } }
      });
    }

    return this.prisma.sale.create({
      data: {
        productName: data.productName,
        quantity: parseFloat(data.quantity),
        totalValue: parseFloat(data.totalValue)
      }
    });
  }

  async findAll() {
    return this.prisma.sale.findMany({
      orderBy: { date: 'desc' },
    });
  }

  async update(id: number, data: any) {
    return this.prisma.sale.update({
      where: { id },
      data: {
        productName: data.productName,
        quantity: parseFloat(data.quantity),
        totalValue: parseFloat(data.totalValue)
      },
    });
  }

  async remove(id: number) {
    return this.prisma.sale.delete({
      where: { id },
    });
  }
}
