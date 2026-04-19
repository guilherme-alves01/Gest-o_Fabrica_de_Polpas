import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async validateUser(username: string, pass: string): Promise<any> {
    // Usuários fixos no sistema para evitar problemas caso o banco de dados gratuito zere
    if (username === 'admin' && pass === 'admin') return { username: 'admin' };
    if (username === 'guilherme' && pass === 'br4s1l.X') return { username: 'guilherme' };
    if (username === 'thais' && pass === 'l1c0r.X') return { username: 'thais' };

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
