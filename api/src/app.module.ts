import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { IngredientsController } from './ingredients/ingredients.controller';
import { IngredientsService } from './ingredients/ingredients.service';
import { ProductsController } from './products/products.controller';
import { ProductsService } from './products/products.service';
import { ProductionController } from './production/production.controller';
import { ProductionService } from './production/production.service';
import { SalesController } from './sales/sales.controller';
import { SalesService } from './sales/sales.service';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';

@Module({
  imports: [],
  controllers: [AppController, IngredientsController, ProductsController, ProductionController, SalesController, AuthController],
  providers: [AppService, PrismaService, IngredientsService, ProductsService, ProductionService, SalesService, AuthService],
})
export class AppModule {}
