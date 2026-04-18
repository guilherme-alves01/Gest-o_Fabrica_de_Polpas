import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
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

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: any) {
    return this.salesService.update(+id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.salesService.remove(+id);
  }
}
