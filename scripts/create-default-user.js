const { PrismaClient } = require('../src/generated/prisma');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

async function main() {
  // 先删除所有用户
  await prisma.user.deleteMany();
  console.log('已删除所有用户');

  const username = 'testuser';
  const password = '123456';
  const email = 'test@example.com';

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name: username, email, password: hashedPassword },
  });
  console.log('已创建默认用户:', user);
}

main(); 