const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
  const keys = await prisma.apiKey.findMany();
  fs.writeFileSync('apikey.json', JSON.stringify(keys, null, 2));
  console.log('导出完成，已保存为 apikey.json');
}
main(); 