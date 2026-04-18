import { Controller, Get, Post, Body } from '@nestjs/common';
import { SalesService } from './sales.service';

@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  create(@Body() createDto: any) {
    return this.salesService.create(createDto);
  }

  @Get()
  findAll() {
    return this.salesService.findAll();
  }
}
