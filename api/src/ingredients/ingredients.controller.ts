import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { IngredientsService } from './ingredients.service';

@Controller('ingredients')
export class IngredientsController {
  constructor(private readonly ingredientsService: IngredientsService) {}

  @Post()
  create(@Body() createDto: { name: string; quantity: number; unitCost: number }) {
    return this.ingredientsService.create(createDto);
  }

  @Get()
  findAll() {
    return this.ingredientsService.findAll();
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: any) {
    return this.ingredientsService.update(+id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ingredientsService.remove(+id);
  }
}
