# 真实数据获取与数据源方案

更新时间：2026-05-30

## 结论

第一版不要做“全网爬虫”。这个留学营销 agent 应该按下面的优先级拿真实数据：

1. 官方 API / RSS / Atom：稳定、可追溯、适合作为事实来源。
2. 官方页面定向采集：只抓已配置的政策页、招生页、新闻页，不做泛爬。
3. 新闻 API：用于发现热点，再回到官方源核验。
4. X.com API：用于发现讨论趋势，不作为政策事实依据。
5. 小红书：第一版不做批量抓取，先做手动发布、人工录入链接和选题回填。

因此，MVP 的真实数据可以先从英国和香港官方源跑通，再叠加新闻源。X.com 和小红书属于增强源，不能作为第一版能否上线的阻塞项。

## 数据源分层

### P0：第一版必须接入

| 地区 | 数据源 | 获取方式 | 用途 | 备注 |
| --- | --- | --- | --- | --- |
| 英国 | GOV.UK Content API | API | 签证、移民、政策页事实源 | 可按 base path 获取结构化内容 |
| 英国 | GOV.UK news Atom | Atom/RSS | 政策新闻、政府公告 | 可按关键词订阅 news-and-communications |
| 英国 | Graduate visa / Student visa 页面 | 定向页面采集 | 签证政策核验 | 用于二次核验，不只看新闻转述 |
| 英国 | UKCISA student news | 页面/RSS 如可用 | 国际学生政策解读 | 适合转成中文解释型内容 |
| 香港 | HKSAR Government Information Centre RSS | RSS | 香港政府新闻稿 | 政府新闻事实源 |
| 香港 | Education Bureau press release | 定向页面采集 | 教育政策、学校相关公告 | 没有稳定 API 时只抓列表和详情页 |
| 香港 | Immigration Department 页面 | 定向页面采集 | 签证、入境、逗留安排 | 作为签证事实核验源 |
| 新闻 | GDELT DOC 2.0 | API | 全球新闻发现 | 免费、覆盖广，适合做热点发现 |

### P1：第二批接入

| 地区 | 数据源 | 获取方式 | 用途 | 备注 |
| --- | --- | --- | --- | --- |
| 英国 | HESA data | 页面/下载数据 | 国际学生人数、趋势数据 | 适合做数据图文 |
| 英国 | UCAS data and analysis | 页面/下载数据 | 申请趋势、录取周期 | 适合做季度选题 |
| 英国 | UCL / Imperial / KCL / Manchester / Warwick admissions/news | RSS 或定向页面 | 学校申请、专业、截止日期 | 每个学校单独配置 source |
| 香港 | HKU / HKUST / CUHK / CityU / PolyU admissions/news | RSS 或定向页面 | 港校申请、专业、截止日期 | 优先研究生和非本地生页面 |
| 新闻 | NewsAPI Everything | API | 英文新闻聚合 | 需要 API key；免费层通常有限制 |
| 新闻 | Bing News Search API | API | 新闻搜索备选 | 付费云 API，适合后续生产化 |

### P2：增强源，不建议阻塞 MVP

| 平台 | 获取方式 | 用途 | 风险和限制 |
| --- | --- | --- | --- |
| X.com | 官方 X API recent search | 趋势发现、舆情热度、英文讨论 | API 不应当被当作免费稳定源；图片和用户内容授权要单独记录 |
| 小红书 | 官方商业/开放平台能力 + 人工录入 | 发布管理、人工观察爆款、手动回填链接 | 不建议批量爬搜索页或绕过登录；第一版不做自动抓取和自动发布 |
| RSSHub | 自建服务 + 合规路由 | 补 RSS 能力 | 只作为补充；每个路由要确认来源条款和稳定性 |

## 建议的具体源配置

### 英国

```json
[
  {
    "id": "govuk-content-graduate-visa",
    "region": "UK",
    "type": "govuk_content_api",
    "url": "https://content-api.publishing.service.gov.uk/content/graduate-visa",
    "topics": ["visa", "policy"],
    "trustLevel": "official",
    "fetchIntervalHours": 12
  },
  {
    "id": "govuk-news-international-students",
    "region": "UK",
    "type": "atom",
    "url": "https://www.gov.uk/search/news-and-communications.atom?keywords=international+students+visa",
    "topics": ["visa", "policy", "news"],
    "trustLevel": "official",
    "fetchIntervalHours": 6
  },
  {
    "id": "ukcisa-student-news",
    "region": "UK",
    "type": "page",
    "url": "https://www.ukcisa.org.uk/studentnews",
    "topics": ["student-life", "visa", "policy-explainer"],
    "trustLevel": "expert",
    "fetchIntervalHours": 12
  },
  {
    "id": "gdelt-uk-study-abroad",
    "region": "UK",
    "type": "gdelt_doc",
    "url": "https://api.gdeltproject.org/api/v2/doc/doc",
    "query": "\"international students\" \"UK\" OR \"Graduate Visa\"",
    "topics": ["news", "trend"],
    "trustLevel": "news-discovery",
    "fetchIntervalHours": 6
  }
]
```

### 香港

```json
[
  {
    "id": "hk-gic-general-zh",
    "region": "HK",
    "type": "rss",
    "url": "http://www.info.gov.hk/gia/rss/general_zh.xml",
    "topics": ["government", "policy", "news"],
    "trustLevel": "official",
    "fetchIntervalHours": 6
  },
  {
    "id": "hk-edb-press-release",
    "region": "HK",
    "type": "page",
    "url": "https://www.edb.gov.hk/en/about-edb/press/press-release/index.html",
    "topics": ["education", "policy"],
    "trustLevel": "official",
    "fetchIntervalHours": 12
  },
  {
    "id": "hk-immigration",
    "region": "HK",
    "type": "page",
    "url": "https://www.immd.gov.hk/",
    "topics": ["visa", "immigration"],
    "trustLevel": "official",
    "fetchIntervalHours": 12
  },
  {
    "id": "hku-press",
    "region": "HK",
    "type": "page",
    "url": "https://www.hku.hk/press/all/",
    "topics": ["university", "admission", "ranking"],
    "trustLevel": "school",
    "fetchIntervalHours": 24
  }
]
```

## 采集方式

### 1. RSS / Atom

适合政府新闻、新闻列表、学校动态。采集器只需要解析 feed item：

- title
- link
- published date
- summary
- media/enclosure

这是第一版最应该先做的方式，因为稳定、便宜、实现快。

### 2. 官方 API

英国 GOV.UK Content API 适合做政策页核验。采集器按固定 URL 或 base path 拉 JSON，然后提取：

- title
- description
- details/body
- public updated date
- document type
- links

### 3. 定向页面采集

用于没有 RSS/API 的官方页面和学校页面。规则必须保守：

- 只抓 sources.json 里配置过的页面。
- 遵守 robots.txt、请求频率和网站条款。
- 只保存标题、摘要、正文片段、更新时间、原文链接。
- 不保存整站内容，不绕过登录，不抓用户隐私内容。

推荐技术：`fetch` + `cheerio` / `Readability`，每个 source 单独写 selector，避免不稳定的通用爬虫。

### 4. 新闻 API

GDELT、NewsAPI、Bing News 只做“发现层”。如果新闻提到政策变化，agent 必须找到官方源再生成稿件。新闻源输出不应直接变成“政策已变更”的结论。

### 5. X.com

X.com 用 official API recent search：

```text
("Graduate Visa" OR "international students" OR "Hong Kong study abroad") lang:en -is:retweet
```

用途：

- 发现讨论热度。
- 提取常见问题和担忧点。
- 给小红书选题提供角度。

限制：

- 不把 X 帖子当政策事实。
- 不默认使用用户图片做商业发布。
- 需要保存 tweet URL、author、created_at、public_metrics、media license 状态。

### 6. 小红书

第一版建议只做：

- 小红书文案生成。
- 发布清单管理。
- 人工复制发布。
- 人工录入竞品笔记 URL、标题、互动数据。

不建议第一版做：

- 批量爬小红书搜索页。
- 自动登录、自动发布。
- 采集用户图片用于发布。

## 统一数据结构

```json
{
  "id": "sha256-source-url-title",
  "sourceId": "govuk-news-international-students",
  "sourceType": "atom",
  "region": "UK",
  "topic": ["visa", "policy"],
  "title": "Example title",
  "url": "https://example.com/news",
  "canonicalUrl": "https://example.com/news",
  "publishedAt": "2026-05-30T00:00:00Z",
  "fetchedAt": "2026-05-30T08:00:00Z",
  "summary": "短摘要",
  "rawText": "正文片段或结构化正文",
  "imageUrl": "https://example.com/cover.jpg",
  "imageOrigin": "og:image",
  "imageLicenseStatus": "unknown | official-page | user-generated | generated",
  "canPublishImage": false,
  "trustLevel": "official",
  "language": "en",
  "hash": "content-hash"
}
```

## 图片获取策略

每篇文章配图按优先级选择：

1. RSS `media:content` / `enclosure`
2. 原文页面 `og:image`
3. 新闻 API 的 `urlToImage`
4. X API 返回的 `media.url` 或 `preview_image_url`
5. 用模板生成封面图

注意：能“显示”不代表能“发布”。系统要分开记录：

- `imageUrl`：可以在后台预览的图。
- `canPublishImage`：是否允许作为小红书/抖音素材发布。
- `imageLicenseStatus`：官方图、新闻图、用户生成内容、未知、AI 生成。
- `fallbackReason`：为什么用了模板图。

对第一版来说，最稳的做法是：后台展示原文图作为参考，发布包默认使用模板封面，除非来源明确允许商用或是自己生成的图。

## Agent 处理流程

```text
Source Config
  -> Collector
  -> Normalizer
  -> Deduper
  -> Relevance Scorer
  -> Fact Card
  -> LLM Draft Generator
  -> Human Review
  -> Publish Pack Export
```

每一步职责：

| 步骤 | 作用 |
| --- | --- |
| Collector | 按 source 类型获取 RSS/API/页面数据 |
| Normalizer | 转成统一数据结构 |
| Deduper | URL、标题相似度、正文 hash 去重 |
| Relevance Scorer | 判断是否和香港/英国留学相关 |
| Fact Card | 生成事实卡：原文链接、时间、结论、风险 |
| Draft Generator | 生成小红书标题、正文、标签、封面文案 |
| Human Review | 人工确认事实和改稿 |
| Export | 导出图片、文案、来源链接和发布备注 |

## 留学相关性评分

第一版可以先用规则评分，后续再加大模型：

- 命中地区词：UK、United Kingdom、Hong Kong、香港、英国。
- 命中身份词：international students、non-local students、留学生、非本地生。
- 命中政策词：visa、immigration、Graduate Visa、Student Visa、IANG、入境、签证。
- 命中申请词：admission、application、deadline、tuition、scholarship、UCAS、postgraduate。
- 来源可信度加权：官方 > 学校 > 专业组织 > 新闻 > 社交平台。

建议阈值：

- 80+：进入今日重点。
- 60-79：进入候选选题。
- 40-59：只入库，不生成文案。
- 40 以下：忽略或等待人工确认。

## 第一版工程落地顺序

1. 新增 `config/sources.json`：先放 10 个 P0/P1 源。
2. 新增 `scripts/collect.mjs`：支持 `rss`、`atom`、`govuk_content_api`、`gdelt_doc`、`page` 五种 fetcher。
3. 新增 `data/raw/*.json`：保存每次原始采集结果，便于排错。
4. 新增 `data/intelligence.json`：保存去重后的情报列表。
5. 前端从 `data/intelligence.json` 读取，不再把文章写死在 `app.js`。
6. 接入大模型：对 relevance 60+ 的条目生成事实卡和小红书草稿。
7. 增加人工审核状态：`new`、`drafted`、`reviewed`、`exported`、`published`。

## 第一版不做的事

- 不做全网爬虫。
- 不批量抓小红书搜索页。
- 不自动登录小红书或抖音发布。
- 不把 X.com 或新闻源内容当最终事实。
- 不默认使用第三方新闻图或社交平台用户图做发布素材。
- 不生成没有来源链接的政策结论。

## 参考链接

- GOV.UK Content API: https://content-api.publishing.service.gov.uk/
- GOV.UK news Atom: https://www.gov.uk/search/news-and-communications.atom
- HKSAR Government RSS: http://www.info.gov.hk/gia/rss/general_zh.xml
- GovHK RSS feeds: https://www.gov.hk/en/about/rss.htm
- Education Bureau press releases: https://www.edb.gov.hk/en/about-edb/press/press-release/index.html
- Immigration Department: https://www.immd.gov.hk/
- UKCISA student news: https://www.ukcisa.org.uk/studentnews
- HESA students data: https://www.hesa.ac.uk/data-and-analysis/students
- UCAS data and analysis: https://www.ucas.com/providers/services/data-and-analysis
- GDELT DOC API: https://www.gdeltproject.org/
- NewsAPI Everything: https://newsapi.org/docs/endpoints/everything
- Bing News Search API: https://learn.microsoft.com/en-us/bing/search-apis/bing-news-search/
- X API pricing: https://docs.x.com/x-api/getting-started/pricing
- RSSHub: https://github.com/DIYgod/RSSHub
