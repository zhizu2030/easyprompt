// 自动删除 openapi.yaml 中所有接口 responses 下的 default 响应
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const openapiPath = path.join(__dirname, '../public/docs/openapi.yaml');

function removeDefaultResponses(doc) {
  if (!doc.paths) return;
  for (const [pathStr, ops] of Object.entries(doc.paths)) {
    for (const [method, op] of Object.entries(ops)) {
      if (op.responses && op.responses.default) {
        delete op.responses.default;
      }
    }
  }
}

function main() {
  const raw = fs.readFileSync(openapiPath, 'utf8');
  const doc = yaml.load(raw);
  removeDefaultResponses(doc);
  fs.writeFileSync(openapiPath, yaml.dump(doc, { lineWidth: -1 }), 'utf8');
  console.log('已自动删除所有 default 响应');
}

main(); 