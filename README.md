# 留学营销智能体 Agent

面向留学机构运营和内容团队的营销智能体 MVP。系统会从香港、英国、新加坡相关的官方源、院校源、新闻源和手动社媒收件箱采集信息，整理成留学情报，再由 TypeScript Agent 编排选题评分、每日推荐、LLM/规则生成、封面建议、核验清单、发布排期和复盘记录。

当前版本重点支持“小红书图文生产”流程：每日选题、选题评分、标题正文生成、封面风格切换、人工核验、手动发布和效果复盘。项目默认不自动登录或自动发布小红书 / 抖音，避免平台风控风险。

## 快速开始

要求 Node.js 20 或以上。

```bash
npm install
cp .env.example .env
npm run check
npm run refresh
npm run serve
```

打开本地网站：

```text
http://localhost:4173/
```

如果只想先看界面，也可以直接运行：

```bash
npm run serve
```

仓库内已经保留了最近一次生成的 `data/intelligence.json`，页面可以先用本地 JSON 展示。

## 常用命令

- `npm run refresh`：采集真实数据并生成小红书草稿，更新 `data/intelligence.json`。
- `npm run serve`：编译 TypeScript 后启动本地 Node 服务，支持 `/api/intelligence`、`/api/collect/run` 和前端页面。
- `npm run collect`：只采集原始数据，输出 `data/collected.json`。
- `npm run agent`：编译 TypeScript Agent，并基于已采集数据生成小红书草稿。
- `npm run build`：把 `src/agent/**/*.mts` 编译到 `dist/agent/`。
- `npm run test`：运行营销评分和 Agent pipeline 测试。
- `npm run check`：编译 TypeScript、检查前端和脚本语法，并运行测试。

## 环境配置

复制 `.env.example` 为 `.env`，本地填写自己的密钥。`.env` 已加入 `.gitignore`，不要提交真实 key。

可选配置：

```bash
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini

LLM_API_KEY=
LLM_BASE_URL=
LLM_MODEL=

X_BEARER_TOKEN=
```

说明：

- 配置 `LLM_API_KEY` / `LLM_BASE_URL` / `LLM_MODEL` 后，会通过 OpenAI-compatible Chat Completions 接口生成标题、正文、摘要、标签、核验点和封面文案。
- 没有配置模型 key 时，系统不会假装调用大模型，会使用规则兜底生成草稿，并在元数据里标记 fallback。
- `X_BEARER_TOKEN` 只用于 X.com recent search；未配置时，X.com 数据源会显示“待配置 Bearer Token”并跳过。
- 官方源、院校源、RSS 和新闻源不依赖 LLM，主要通过 API、RSS/Atom 或页面抓取获取真实数据。

## 功能模块

- 真实数据源配置：`config/sources.json`。
- 真实采集器：`scripts/collect.mjs`，支持 RSS/Atom、GOV.UK Content API、Google News RSS、官方页面、X.com recent search。
- TypeScript Agent 核心：`src/agent/pipeline.mts`，按 `ingest -> score -> recommend -> generate -> package` 编排完整内容生产流程，并在输出 JSON 的 `meta.agent.steps` 里记录每一步 trace。
- Agent 生成器：`src/agent/llm.mts` + `src/agent/rules.mts`，支持 OpenAI-compatible API；没有 Key 或模型失败时使用规则兜底生成摘要、核验点、标题、正文、标签和封面文案。
- 营销评分器：`src/agent/marketing.mts`，按政策影响、热点热度、紧急程度、收藏价值和专业可信度评分。
- 兼容入口：`scripts/agent.mjs`、`scripts/marketing.mjs` 保留原 import 路径，但实际调用 `dist/agent/` 的 TypeScript 编译产物。
- 本地 API 服务：`server.mjs`。
- 前端工作台：`index.html`、`styles.css`、`app.js`，从 `/api/intelligence` 或 `data/intelligence.json` 读取真实 JSON。
- 每日推荐：自动给出 3-5 篇候选，用户可以手动选择今日创作内容。
- 备选题库：低优先级内容保留做合集、补位或后续跟进。
- 发布管理：生成今日内容日历和人工发布提醒。
- 竞品笔记录入：先支持手动保存标题和链接，避免自动爬小红书触发风控。
- 封面风格：支持来源图、数据图表、强对比、AI 风格四种预览。

## 当前数据源

默认配置 50 个源，其中 48 个启用自动采集。已覆盖：

- 英国官方政策：GOV.UK Graduate visa / Student visa / Child Student visa、GOV.UK news Atom。
- 英国统计数据：GOV.UK / data.gov.uk 上的 HESA student statistics 发布页。
- 英国申请数据：UCAS Data and Analysis、Undergraduate statistics、Undergraduate releases、News and Insights。
- 英国院校：Manchester、KCL、Warwick、Edinburgh、Cambridge、Bristol、Glasgow、Leeds。
- 新加坡新闻与官方/院校：Google News Singapore Study Abroad、ICA Student's Pass、NTU International Qualifications。
- 香港官方政策：香港政府新闻 RSS、香港教育局、香港入境事务处、GovHK Entry for Study。
- Study in Hong Kong：Apply to Study、How to Apply、Admission Requirements、Visas、Scholarships。
- UGC / RGC：non-local students FAQ、40% non-local student ceiling、research postgraduate places、Future Talents Scholarship、HKPFS。
- 香港院校：HKU、HKUST、CUHK Graduate School、PolyU、HKBU、EdUHK、HKMU、Lingnan。
- 手动社媒收件箱：`data/manual-social.json`。
- X.com Recent Search（需要 `X_BEARER_TOKEN`）。

最新一次本地验证结果（2026-06-25）：47/48 个启用源成功，X.com 因未配置 Bearer Token 跳过，失败源 0；采集 262 条原始记录，当前展示 12 条小红书草稿、5 条每日推荐、20 条备选题。

没有启用自动采集但已记录为候选源：HESA 官网直连页、Universities UK 国际学生数据页、CityU / CUHK / Cambridge 部分招生页。这些页面在命令行或 Node 运行时会遇到 Cloudflare/保护层/DNS/fetch 不稳定问题，适合后续改 API、数据下载或人工录入，不适合直接放进每日自动刷新。

本地如果配置了 OpenAI-compatible 模型网关，草稿会优先由模型 API 生成；未配置时会回退到规则生成。

## 目录结构

```text
.
├── index.html              # 前端页面
├── styles.css              # UI 样式
├── app.js                  # 前端交互和本地状态
├── server.mjs              # 本地 API 服务
├── src/agent/              # TypeScript Agent 核心
├── scripts/                # 采集脚本和兼容入口
├── config/sources.json     # 数据源配置
├── data/intelligence.json  # 当前展示用情报数据
├── data/collected.json     # 最近一次采集结果
├── assets/                 # 示例封面和视觉资产
├── tests/                  # Agent pipeline 测试
└── research/               # 调研、方案和实现说明
```

`dist/` 是 TypeScript 编译产物，运行 `npm run build` 自动生成；`data/raw/` 是历史采集快照缓存，默认不提交到仓库。

## 相关文档

- [research/current-status.md](research/current-status.md): 当前实现状态、真实数据源和剩余限制。
- [research/real-data-acquisition-plan.md](research/real-data-acquisition-plan.md): 真实数据获取方式、可接入数据源、采集边界和落地顺序。
- [research/api-agent-plan.md](research/api-agent-plan.md): API 和 Agent 接入计划。
- [research/2026-05-29-research.md](research/2026-05-29-research.md): 调研结论、竞品、技术路线和落地建议。
- [research/reusable-projects.md](research/reusable-projects.md): GitHub 可复用项目清单和取舍。
- [research/mvp-architecture.md](research/mvp-architecture.md): 推荐 MVP 架构、页面、数据流和数据模型。
- [research/sources.md](research/sources.md): 调研引用链接。

## 当前边界

- 不批量爬小红书搜索页。
- 不自动登录或发布小红书 / 抖音。
- 不把新闻源或 X.com 内容当政策事实。
- 不默认使用第三方新闻图或用户图片做发布素材。
