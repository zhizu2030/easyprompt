#!/bin/bash
set -e

DB_PATH="prisma/dev.db"
BACKUP_PATH="prisma/dev.db.bak"

# 1. 备份数据库
if [ -f "$DB_PATH" ]; then
  cp "$DB_PATH" "$BACKUP_PATH"
  echo "[1/5] 数据库已备份到 $BACKUP_PATH"
else
  echo "[1/5] 未找到 $DB_PATH，无法备份。"
  exit 1
fi

# 2. 清空数据库（重置迁移，清空所有表并重建结构）
npx prisma migrate reset --force --skip-seed

echo "[2/5] 数据库已重置。"

# 3. 恢复备份（覆盖重置后的数据库）
cp "$BACKUP_PATH" "$DB_PATH"
echo "[3/5] 备份已恢复到 $DB_PATH。"

# 4. 自动补齐信息（根据 schema.prisma 补齐表结构/字段）
npx prisma db push
echo "[4/5] 数据库结构已自动补齐。"

# 5. 删除备份文件
rm "$BACKUP_PATH"
echo "[5/5] 备份文件已删除。"

echo "\n全部完成！当前数据库已还原并与 schema 保持一致。" 