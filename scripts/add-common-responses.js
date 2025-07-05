// 自动为 openapi.yaml 所有接口补充 400、401、500 响应
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const openapiPath = path.join(__dirname, '../public/docs/openapi.yaml');

const COMMON_RESPONSES = {
  '400': { description: '请求参数错误' },
  '401': { description: '未授权' },
  '500': { description: '服务器错误' }
};

function addCommonResponses(doc) {
  if (!doc.paths) return;
  for (const [pathStr, ops] of Object.entries(doc.paths)) {
    for (const [method, op] of Object.entries(ops)) {
      if (!op.responses) op.responses = {};
      for (const [code, val] of Object.entries(COMMON_RESPONSES)) {
        if (!op.responses[code]) op.responses[code] = val;
      }
    }
  }
}

function main() {
  const raw = fs.readFileSync(openapiPath, 'utf8');
  const doc = yaml.load(raw);
  addCommonResponses(doc);
  fs.writeFileSync(openapiPath, yaml.dump(doc, { lineWidth: -1 }), 'utf8');
  console.log('已为所有接口补充 400、401、500 响应');
}

main(); 