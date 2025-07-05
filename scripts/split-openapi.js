// 用于将 openapi.yaml 拆分为每个接口一个 json 文件
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const openapiPath = path.join(__dirname, '../public/docs/openapi.yaml');
const outputDir = path.join(__dirname, '../public/docs');

function safeOperationId(op, method, pathStr) {
  return op.operationId || `${method}_${pathStr}`.replace(/[^a-zA-Z0-9_]/g, '_');
}

async function main() {
  const raw = fs.readFileSync(openapiPath, 'utf8');
  const doc = yaml.load(raw);
  const paths = doc.paths || {};
  let count = 0;
  for (const [pathStr, ops] of Object.entries(paths)) {
    for (const [method, op] of Object.entries(ops)) {
      const operationId = safeOperationId(op, method, pathStr);
      const single = {
        openapi: doc.openapi,
        info: doc.info,
        servers: doc.servers,
        tags: doc.tags,
        components: doc.components,
        paths: {
          [pathStr]: {
            [method]: op
          }
        }
      };
      const outPath = path.join(outputDir, `api-${operationId}.json`);
      fs.writeFileSync(outPath, JSON.stringify(single, null, 2), 'utf8');
      count++;
    }
  }
  console.log(`已生成 ${count} 个接口 json 文件到 ${outputDir}`);
}

main(); 