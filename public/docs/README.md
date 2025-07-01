# Prompt Open API 文档

## 1. 获取 Prompt 列表

GET `/api/open/prompts`

### Query 参数

| 参数      | 类型   | 必填 | 说明                 | 示例 |
| --------- | ------ | ---- | -------------------- | ---- |
| q         | string | 否   | 关键词，模糊搜索标题和内容 | chat |
| page      | int    | 否   | 页码，默认1          | 1    |
| pageSize  | int    | 否   | 每页数量，默认20      | 10   |

### 请求示例

```tabs
--- tab:curl
```bash
curl -X GET "https://yourdomain.com/api/open/prompts?q=chat&page=1&pageSize=10"
```
--- tab:Python
```python
import requests
resp = requests.get("https://yourdomain.com/api/open/prompts", params={"q": "chat", "page": 1, "pageSize": 10})
print(resp.json())
```
--- tab:JavaScript
```js
fetch("https://yourdomain.com/api/open/prompts?q=chat&page=1&pageSize=10")
  .then(res => res.json())
  .then(console.log)
```
```

### 响应示例

```json
{
  "total": 2,
  "page": 1,
  "pageSize": 10,
  "prompts": [
    {
      "id": "cmciwwtcp0009kw2c1tscdeg",
      "title": "ChatGPT 快速入门",
      "content": "如何高效使用ChatGPT..."
    }
  ]
}
```

## 2. 获取单个 Prompt 详情

GET `/api/open/prompts/{id}`

### 路径参数

| 参数 | 类型   | 必填 | 说明     |
| ---- | ------ | ---- | -------- |
| id   | string | 是   | Prompt ID |

### 请求示例

```tabs
--- tab:curl
```bash
curl -X GET "https://yourdomain.com/api/open/prompts/cmciwwtcp0009kw2c1tscdeg"
```
--- tab:Python
```python
import requests
resp = requests.get("https://yourdomain.com/api/open/prompts/cmciwwtcp0009kw2c1tscdeg")
print(resp.json())
```
--- tab:JavaScript
```js
fetch("https://yourdomain.com/api/open/prompts/cmciwwtcp0009kw2c1tscdeg")
  .then(res => res.json())
  .then(console.log)
```
```

### 响应示例

```json
{
  "id": "cmciwwtcp0009kw2c1tscdeg",
  "title": "ChatGPT 快速入门",
  "content": "如何高效使用ChatGPT..."
}
```

## 3. 新增 Prompt（需鉴权）

POST `/api/open/prompts`

### Body 参数

| 参数    | 类型   | 必填 | 说明     |
| ------- | ------ | ---- | -------- |
| title   | string | 是   | 标题     |
| content | string | 是   | 内容     |
| apikey  | string | 是   | API Key  |

### 请求示例

```tabs
--- tab:curl
```bash
curl -X POST "https://yourdomain.com/api/open/prompts" \
  -H "Content-Type: application/json" \
  -d '{"title": "ChatGPT 快速入门", "content": "如何高效使用ChatGPT...", "apikey": "your_api_key"}'
```
--- tab:Python
```python
import requests
resp = requests.post(
    "https://yourdomain.com/api/open/prompts",
    json={"title": "ChatGPT 快速入门", "content": "如何高效使用ChatGPT...", "apikey": "your_api_key"}
)
print(resp.json())
```
--- tab:JavaScript
```js
fetch("https://yourdomain.com/api/open/prompts", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    title: "ChatGPT 快速入门",
    content: "如何高效使用ChatGPT...",
    apikey: "your_api_key"
  })
})
  .then(res => res.json())
  .then(console.log)
```
```

### 响应示例

```json
{
  "id": "cmciwwtcp0009kw2c1tscdeg",
  "title": "ChatGPT 快速入门",
  "content": "如何高效使用ChatGPT..."
}
```

## 4. OpenAPI (Swagger) 片段

```yaml
openapi: 3.0.0
info:
  title: Prompt Open API
  version: 1.0.0
paths:
  /api/open/prompts:
    get:
      summary: 获取 Prompt 列表
      parameters:
        - in: query
          name: q
          schema:
            type: string
          description: 关键词，模糊搜索标题和内容
        - in: query
          name: page
          schema:
            type: integer
            default: 1
        - in: query
          name: pageSize
          schema:
            type: integer
            default: 20
      responses:
        '200':
          description: 成功
          content:
            application/json:
              schema:
                type: object
                properties:
                  total:
                    type: integer
                  page:
                    type: integer
                  pageSize:
                    type: integer
                  prompts:
                    type: array
                    items:
                      $ref: '#/components/schemas/Prompt'
  /api/open/prompts/{id}:
    get:
      summary: 获取单个 Prompt 详情
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: string
      responses:
        '200':
          description: 成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Prompt'
        '404':
          description: 未找到
components:
  schemas:
    Prompt:
      type: object
      properties:
        id:
          type: string
        title:
          type: string
        content:
          type: string
        createdAt:
          type: string
          format: date-time
        userId:
          type: string
``` 