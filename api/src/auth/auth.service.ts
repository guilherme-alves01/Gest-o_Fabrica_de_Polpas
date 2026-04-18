import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async validateUser(username: string, pass: string): Promise<any> {
    // Para teste inicial: usuário 'admin' senha 'admin'
    if (username === 'admin' && pass === 'admin') {
      return { username: 'admin' };
    }
    
    // Se não for o teste, busca no banco
    const user = await this.prisma.user.findUnique({
      where: { username },
    });
    if (user && user.password === pass) {
      const { password, ...result } = user;
      return result;
    }
    throw new UnauthorizedException('Usuário ou senha inválidos');
  }
}
