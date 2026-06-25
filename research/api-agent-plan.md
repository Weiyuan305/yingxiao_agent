# API 和 Agent 接入计划

## 目标

把当前静态 MVP 变成真正的留学营销 agent：

1. 每天自动抓取香港、英国、新加坡留学相关信息。
2. 接入 X.com、学校官网、政策官网、RSS/新闻源。
3. 使用大模型生成摘要、事实核验点、小红书草稿和发布包。
4. 人工审核后导出到小红书手动发布。

## 需要的环境变量

```bash
OPENAI_API_KEY=...
LLM_API_KEY=...
LLM_BASE_URL=https://your-gateway.example.com/v1
LLM_MODEL=...
X_BEARER_TOKEN=...
NEWS_API_KEY=...
```

也可以把 OpenAI 换成 Anthropic、OpenRouter、Vercel AI Gateway 或公司内部模型网关。

## 最小后端接口

```text
GET  /api/sources
POST /api/collect/run
POST /api/collect/x
POST /api/agent/brief
POST /api/agent/draft-xhs
GET  /api/intelligence
PATCH /api/drafts/:id
POST /api/publish-pack/:id/export
```

## X.com 接入

第一版只用官方 X API recent search：

```text
GET https://api.x.com/2/tweets/search/recent
query=("Graduate Visa" OR "Hong Kong study abroad" OR "UK international students") lang:en -is:retweet
tweet.fields=created_at,author_id,public_metrics,attachments
expansions=attachments.media_keys,author_id
media.fields=url,preview_image_url,type
```

注意：

- X.com 只作为趋势发现来源。
- 政策事实必须回到官方源核验。
- 用户图片和截图不能默认用于商业发布，必须记录授权状态。

## Agent 流程

```text
Collector
  -> Normalizer
  -> Deduper
  -> Relevance Scorer
  -> Marketing Score Ranker
  -> Fact Card Generator
  -> Xiaohongshu Draft Generator
  -> Daily Recommendation Selector
  -> Human Review
  -> Publish Pack Export
```

## 大模型输入输出

### 输入

- 原文标题
- 原文 URL
- 原文摘要或正文片段
- 来源类型
- 发布时间
- 国家/地区
- 已抓取图片 URL

### 输出

- 留学相关性评分
- 来源可信度评分
- 情报摘要
- 关键影响
- 事实核验点
- 小红书标题
- 小红书正文
- 话题标签
- 封面文案
- 风险提示
- 私信 CTA
- 选题评分维度
- 封面风格建议

## 配图策略

优先级：

1. 原文 `og:image`
2. RSS media/enclosure 图片
3. X API 返回的 media URL
4. News API `urlToImage`
5. 模板生成封面

每张图都要保存：

- image_url
- source_url
- license_status
- can_publish
- fallback_reason

## 第一版真实接入建议

先做本地 Node/Next API，不急着做复杂队列：

1. 新增 `sources.json`。
2. 新增 `collector.mjs` 抓取源。
3. 新增 `agent.mjs` 调模型生成结构化 JSON。
4. 结果先保存到 `data/intelligence.json`。
5. 前端从 JSON 读取，不再写死在 `app.js`。
