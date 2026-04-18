import { Controller, Get, Post, Body } from '@nestjs/common';
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
}
