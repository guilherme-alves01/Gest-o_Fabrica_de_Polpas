import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.product.findMany({
      orderBy: { name: 'asc' }
    });
  }

  async update(id: number, data: any) {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.quantity !== undefined) updateData.quantity = parseFloat(data.quantity);
    if (data.unitPrice !== undefined) updateData.unitPrice = parseFloat(data.unitPrice);

    return this.prisma.product.update({
      where: { id },
      data: updateData
    });
  }

  async remove(id: number) {
    return this.prisma.product.delete({
      where: { id }
    });
  }
}
