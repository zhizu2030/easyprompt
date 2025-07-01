# Prompt Open API 文档

## 1. 获取 Prompt 列表

**GET** `/api/open/prompts`

### Query 参数
| 参数      | 类型   | 必填 | 说明                 | 示例         |
|-----------|--------|------|----------------------|--------------|
| q         | string | 否   | 关键词，模糊搜索标题和内容 | chat         |
| page      | int    | 否   | 页码，默认1           | 1            |
| pageSize  | int    | 否   | 每页数量，默认20       | 10           |

### 响应示例
```json
{
  "total": 2,
  "page": 1,
  "pageSize": 10,
  "prompts": [
    {
      "id": "cmciwwtcp00009kw2cltscdeg",
      "title": "ChatGPT 快速入门",
      "content": "如何高效使用ChatGPT...",
      "createdAt": "2024-05-01T12:00:00.000Z",
      "userId": "user123"
    },
    {
      "id": "cmciwwtcp00009kw2cltscdeh",
      "title": "AI 写作技巧",
      "content": "写作时如何借助AI...",
      "createdAt": "2024-05-01T13:00:00.000Z",
      "userId": "user456"
    }
  ]
}
```

### 示例请求
```
GET /api/open/prompts?q=chat&page=1&pageSize=10
```

---

## 2. 获取单个 Prompt 详情

**GET** `/api/open/prompts/{id}`

### 路径参数
| 参数 | 类型   | 必填 | 说明         |
|------|--------|------|--------------|
| id   | string | 是   | prompt 的ID  |

### 响应示例
```json
{
  "id": "cmciwwtcp00009kw2cltscdeg",
  "title": "ChatGPT 快速入门",
  "content": "如何高效使用ChatGPT...",
  "createdAt": "2024-05-01T12:00:00.000Z",
  "userId": "user123"
}
```

### 示例请求
```
GET /api/open/prompts/cmciwwtcp00009kw2cltscdeg
```

---

## 3. OpenAPI (Swagger) 片段

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