# 当前 MVP 状态

日期：2026-06-25

## 已完成

- 网站工作台已搭建：`index.html`、`styles.css`、`app.js`。
- 视觉风格继续对齐 Auto Apply / EduApply：白底、黑白按钮、轻量卡片、胶囊筛选、窄容器工作台。
- 前端已从静态数组升级为读取真实 JSON：优先 `/api/intelligence`，静态模式下退到 `data/intelligence.json`。
- 新增真实数据源配置：`config/sources.json`。
- 新增真实采集器：`scripts/collect.mjs`。
- 新增 Agent 生成器：`scripts/agent.mjs`。
- 新增一键刷新脚本：`scripts/run-agent.mjs`。
- 新增本地 API 服务：`server.mjs`。
- 支持香港 / 英国 / 新加坡筛选、情报详情、来源可信度、事实核验点、关键影响。
- 支持生成小红书图文草稿、复制文案和导出 txt 发布包。
- 每条情报展示来源链接、配图来源状态和授权提示。
- 数据源页展示每个来源的连接状态、成功条数、跳过原因。
- 新增营销评分：政策影响、热点热度、紧急程度、收藏价值、专业可信度。
- 新增每日推荐：自动推荐 3-5 篇，用户可手动选择今日创作内容。
- 新增备选题库：低优先级选题保留做合集或补位。
- 新增发布管理内容日历和发布提醒。
- 新增竞品笔记手动录入和本地保存，暂不自动爬小红书。
- 新增封面风格选择：来源图、数据图表、强对比、AI 风格。

## 当前真实数据链路

```text
config/sources.json
  -> scripts/collect.mjs
  -> data/collected.json
  -> scripts/agent.mjs
  -> data/intelligence.json
  -> server.mjs /api/intelligence
  -> app.js 前端展示
```

启动服务后，网页“刷新情报”按钮会调用：

```text
POST /api/collect/run
```

如果只是直接打开静态 HTML，页面仍可以读取已有的 `data/intelligence.json`。

## 当前数据源

默认配置 50 个源，其中 48 个启用自动采集。CUHK 本科招生页和 Cambridge 直连招生页因本地 Node 运行时不稳定暂时禁用，保留为候选源。

已启用源覆盖：

- 英国官方政策：GOV.UK Graduate visa、Student visa、Child Student visa、GOV.UK news Atom。
- 英国统计与申请数据：GOV.UK / data.gov.uk HESA student statistics、UCAS Data and Analysis、UCAS Undergraduate statistics、UCAS releases、UCAS News and Insights。
- 英国院校：Manchester、KCL、Warwick、Edinburgh、Bristol、Glasgow、Leeds。
- 新加坡来源：Google News Singapore Study Abroad、ICA Student's Pass、NTU International Qualifications。
- 香港官方政策：香港政府新闻 RSS、香港教育局、香港入境事务处、GovHK Entry for Study。
- Study in Hong Kong：Apply to Study、How to Apply、Admission Requirements、Visas、Scholarships。
- UGC / RGC：non-local students FAQ、non-local student ceiling、research postgraduate places、Future Talents Scholarship、Hong Kong PhD Fellowship Scheme。
- 香港院校：HKU、HKUST、CUHK Graduate School、PolyU、HKBU、EdUHK、HKMU、Lingnan。
- 手动社媒收件箱：`data/manual-social.json`。
- X.com Recent Search。

未启用自动采集但已记录为候选源：

- HESA 官网直连页：命令行访问触发 Cloudflare challenge，当前改用 GOV.UK / data.gov.uk 的 HESA 官方统计发布页。
- Universities UK international student data：命令行访问触发 Cloudflare challenge。
- CityU admissions：命令行抓取返回保护层内容，不作为每日自动源。
- CUHK Undergraduate Admissions：Node DNS 对 `admission.cuhk.edu.hk` 解析失败，保留为人工/候选源。
- Cambridge International Undergraduate Admissions：本地 Node fetch 偶发失败，保留为人工/候选源。

最新一次验证结果：

- 启用源：48
- 成功源：47/48
- 跳过源：1/48，X.com 缺少 `X_BEARER_TOKEN`
- 失败源：0
- 原始采集条数：262
- 展示情报：12
- 每日推荐：5
- 备选题：20

## 大模型和 API 状态

代码已接入 OpenAI-compatible 模型调用路径，当前 `.env` 已配置模型网关和模型名。

- 有 `OPENAI_API_KEY` 或 `LLM_API_KEY` 时：`scripts/agent.mjs` 会调用模型生成结构化 JSON。
- 没有 Key 时：系统使用规则兜底生成摘要、核验点、小红书标题、正文、标签和封面文案。
- 如果模型网关返回错误：系统会记录错误数量，页面显示“模型失败，规则回退”，不会伪装成已成功调用大模型。
- `.env` 文件会被脚本和本地服务自动读取。

最新一次验证中，`cywx/gpt-5.5` 生成成功，12 条内容全部由模型 API 生成，`errorCount=0`、`fallbackCount=0`。

可选环境变量：

```bash
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-4o-mini
LLM_API_KEY=...
LLM_BASE_URL=https://your-gateway.example.com/v1
LLM_MODEL=...
X_BEARER_TOKEN=...
```

## 配图策略

真实接入后，每篇文章的配图按优先级处理：

1. RSS `media:content` / `media:thumbnail` / `enclosure`。
2. 原文页面的 Open Graph 图片：`og:image`。
3. X.com 帖子里的媒体图。
4. 新闻源 API 返回的图片字段。
5. 学校官网新闻正文首图。
6. 如果没有可用图，使用模板封面。

系统会记录：

- `imageUrl`
- `imageOrigin`
- `imageLicenseStatus`
- `canPublishImage`

注意：能预览不代表能发布。新闻媒体图、社媒用户图默认不建议直接用于小红书或抖音发布。

## 还没做

- 生产级数据库：当前是本地 JSON，不是 SQLite/Postgres。
- 生产级定时任务：当前通过 `npm run refresh` 或网页按钮手动触发。
- X.com 真 API：代码已支持，但需要配置 `X_BEARER_TOKEN`。
- 真大模型生成：已接通。后续需要继续做提示词版本管理、生成质量评估和人工审核记录。
- 账号登录和权限。
- 审核状态持久化。
- 小红书真实发布接口或半自动发布流程。
- 抖音短视频稿和视频发布包。
- 更细的来源白名单、版权策略和人工审核工作流。
