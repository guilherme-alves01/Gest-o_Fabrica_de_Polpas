import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = [
    { username: 'thais', password: 'l1c0r.X' },
    { username: 'guilherme', password: 'br4s1l.X' },
    { username: 'admin', password: 'admin' },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { username: user.username },
      update: { password: user.password },
      create: user,
    });
  }
  console.log('Senhas de Thais e Guilherme atualizadas com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
