const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
  const keys = JSON.parse(fs.readFileSync('apikey.json', 'utf-8'));
  for (const k of keys) {
    // 避免主键冲突，建议移除 id 字段，由 MySQL 自动生成
    const { id, ...data } = k;
    try {
      await prisma.apiKey.create({ data });
      console.log('导入成功:', data.key);
    } catch (e) {
      console.error('导入失败:', data.key, e.message);
    }
  }
  console.log('全部导入完成');
}
main(); 