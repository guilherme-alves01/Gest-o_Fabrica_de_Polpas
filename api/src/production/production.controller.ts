import { Controller, Get, Post, Body } from '@nestjs/common';
import { ProductionService } from './production.service';

@Controller('production')
export class ProductionController {
  constructor(private readonly productionService: ProductionService) {}

  @Post()
  create(@Body() createDto: any) {
    return this.productionService.create(createDto);
  }

  @Get()
  findAll() {
    return this.productionService.findAll();
  }
}
