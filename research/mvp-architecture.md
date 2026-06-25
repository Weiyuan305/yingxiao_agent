# MVP 架构草案

## 产品定位

一个留学行业内容运营后台。每天自动生成“可发布候选”，由人工审核后发布到小红书和抖音。

它不是第一版就自动发布的平台，也不是通用社媒排期工具。

## 用户角色

- 运营：查看每日消息、选择选题、改文案、发布。
- 审核者：确认事实、风险和话术。
- 管理员：配置数据源、关键词、账号、模型、品牌语气。

## 页面

1. Dashboard  
   今日新增消息、候选选题、已生成草稿、待审核、已发布统计。

2. Source Inbox  
   展示抓取到的原始信息。支持筛选国家、学校、签证、奖学金、就业、申请季、社媒热度。

3. Intelligence Card  
   单条信息详情：原文链接、来源、发布时间、摘要、影响人群、可信度、待核验点、相关链接。

4. Content Studio  
   生成小红书笔记：标题、正文、标签、封面文案、评论区引导、备选角度。

5. Video Script Studio  
   生成抖音脚本：30 秒/60 秒口播稿、字幕、分镜、B-roll 建议、开头钩子。

6. Review Queue  
   待审核、需复核、可发布、已拒绝。

7. Publish Pack  
   一键复制文案，下载封面图，导出脚本和素材清单。发布动作由人工完成。

8. Settings  
   数据源、关键词、品牌语气、禁用词、平台模板、模型配置。

## 数据流

```text
数据源配置
  -> 采集任务
  -> 原始消息入库
  -> 去重与聚类
  -> 留学相关性评分
  -> 摘要与事实卡片
  -> 人工选择选题
  -> 生成小红书/抖音草稿
  -> 人工审核
  -> 发布包导出
  -> 手动发布
```

## 核心模块

### collectors

负责按数据源拉取内容：
- RSS collector
- News API collector
- X recent search collector
- official site crawler
- manual link importer
- RSSHub collector

### normalizer

把不同来源统一成 `source_items`：
- title
- url
- source
- author/account
- published_at
- raw_text
- media_urls
- language

### scorer

给消息打分：
- 留学相关性
- 时效性
- 来源可信度
- 平台传播潜力
- 风险等级

### brief generator

生成事实卡片：
- 发生了什么
- 影响谁
- 为什么重要
- 可用于什么内容角度
- 需要核验什么

### content generator

生成平台草稿：
- 小红书：标题、正文、标签、封面文案、评论区问题。
- 抖音：口播稿、字幕、分镜、B-roll、标题、话题。

### review workflow

状态机：
- raw
- shortlisted
- drafted
- needs_fact_check
- approved
- exported
- published
- rejected

## 推荐数据表

```text
sources
  id
  type
  name
  url_or_query
  country
  topic
  enabled
  fetch_interval

source_items
  id
  source_id
  title
  url
  author
  published_at
  raw_text
  language
  hash
  created_at

intelligence_cards
  id
  source_item_ids
  topic
  country
  summary
  impact
  credibility_score
  relevance_score
  risk_level
  fact_check_notes
  status

drafts
  id
  card_id
  platform
  format
  title
  body
  hashtags
  cover_text
  script
  storyboard
  status

publish_packs
  id
  draft_id
  exported_at
  published_at
  publish_url
  notes
```

## 技术栈建议

前端/后端：
- Next.js App Router
- TypeScript
- Tailwind 或 shadcn/ui

数据库：
- Postgres
- Supabase 可作为快速起步方案

任务：
- cron job 或队列任务
- Vercel Cron / Supabase Edge Functions / 自建 worker 三选一

AI 工作流：
- 第一版可以先用普通 service pipeline。
- 如果后续流程变复杂，再引入 LangGraph。

数据采集：
- RSS parser
- News API 或 GDELT
- X API recent search
- RSSHub
- Firecrawl/Playwright 只用于官方网页或允许抓取的页面

生成：
- OpenAI/Anthropic/兼容模型用于摘要、分类和草稿。
- 后期接入图片/视频模型。

## 第一版验收标准

- 每天能自动收集至少 50 条候选信息。
- 能筛出 5-10 条留学相关高价值选题。
- 每条选题能生成一张事实卡片。
- 每张事实卡片能生成小红书图文和抖音短视频脚本。
- 人工能在 10 分钟内完成审核、复制和发布准备。
- 所有草稿都保留来源链接和待核验点。

## 第一版不做

- 不做自动发布。
- 不做账号矩阵管理。
- 不做评论互动自动化。
- 不做完整视频渲染。
- 不做全网小红书搜索爬虫。

## 后续扩展

1. 接入封面图生成。
2. 接入短视频自动成片。
3. 接入发布效果回填。
4. 增加账号/客户维度。
5. 半自动发布和排期。
6. 竞品账号监听。
