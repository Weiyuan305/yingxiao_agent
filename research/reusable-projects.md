# GitHub 可复用项目清单

本文件记录本次调研中最相关的开源项目。结论按“能否直接帮助留学营销智能体 MVP”排序。

## 1. yikart/AiToEarn

链接：https://github.com/yikart/AiToEarn  
许可证：MIT  
定位：OPC/创作者/品牌的 AI 内容营销智能体，支持内容变现、发布、互动、创作。

可复用点：
- 多平台内容营销产品形态。
- 抖音、小红书、快手、B站、视频号、TikTok、YouTube、X、LinkedIn 等渠道概念。
- Docker 部署思路。
- 内容创作、草稿生成、视频/图文任务的产品组织方式。

不建议直接照搬的原因：
- 它是大而全平台，不是留学情报工作台。
- 需要实际跑通后才能判断代码质量、模块边界和可扩展性。
- 你的 MVP 发布端先人工，AiToEarn 的发布和变现能力第一版不是必需。

结论：强参考，先不 fork。后续可以单独 clone 到实验目录跑一次。

## 2. langchain-ai/social-media-agent

链接：https://github.com/langchain-ai/social-media-agent  
许可证：MIT  
定位：输入 URL，生成 Twitter 和 LinkedIn 文案，并带 human-in-the-loop 审核。

可复用点：
- LangGraph 工作流。
- 人工审批/修改/拒绝的 HITL 模式。
- URL 内容提取到平台文案的生成链路。
- 定时任务和 Agent Inbox 思路。

不匹配点：
- 默认平台是 X/LinkedIn。
- 不包含小红书/抖音文案格式。
- 不包含留学垂直数据源。

结论：非常适合作为“工作流骨架”和审核模式参考。

## 3. BetaStreetOmnis/xhs_ai_publisher

链接：https://github.com/BetaStreetOmnis/xhs_ai_publisher  
定位：小红书内容生成与自动发布工具，包含 PyQt 桌面 UI、FastAPI、登录态复用、模板、热点采集、定时任务。

可复用点：
- 小红书标题、正文、标签、封面模板的组织方式。
- 热点采集到文案生成的流程。
- 发布预览和登录态管理思路。
- 本地 API Key 加密、日志、用户隔离。

风险：
- 自动化发布依赖浏览器和登录态，容易遇到验证码、风控、页面改版。
- 第一版如果只是人工发布，不需要引入这部分复杂度。

结论：适合参考小红书文案和发布执行层；不建议 MVP 直接依赖自动发布。

## 4. dreammis/social-auto-upload

链接：https://github.com/dreammis/social-auto-upload  
定位：自动化上传视频到抖音、小红书、B站、快手、视频号、TikTok、YouTube 等平台。

可复用点：
- 多平台上传器抽象。
- 抖音、小红书视频上传和图文上传脚本。
- Agent/Skill 形式的执行入口。

风险：
- 发布链路维护成本高。
- 国内平台账号风控不稳定。
- 你的第一版明确是手动发布，所以它属于后期增强项。

结论：后期如果要做“半自动上传”再评估。

## 5. trypostit/trypost

链接：https://github.com/trypostit/trypost  
许可证：AGPL-3.0  
定位：开源社媒排期工具，支持内容日历、多平台 composer、品牌语气、AI 文案、资产库、API/MCP。

可复用点：
- 内容日历和多平台草稿 UI。
- 品牌语气 profile。
- AI draft/review 的交互方式。

风险：
- AGPL-3.0 对闭源商业化不友好。
- 不支持中文平台作为核心。

结论：适合看 UI 和产品设计，不建议直接混入代码。

## 6. DIYgod/RSSHub

链接：https://github.com/DIYgod/RSSHub  
定位：把网站和平台转成 RSS feed。

可复用点：
- 快速接入大量新闻、社媒、学校、博客、公告源。
- 可以作为低成本采集层。
- 对小红书用户、微博、B站、TikTok、YouTube 等有路由或历史路由。

风险：
- 部分路由依赖页面结构，稳定性不保证。
- 不能替代官方 API 和事实核验。

结论：适合 MVP 接入，作为候选信息源之一。

## 7. mutonby/openshorts

链接：https://github.com/mutonby/openshorts  
定位：开源 AI 短视频平台，含 Clip Generator、AI Shorts、YouTube Studio。

可复用点：
- 9:16 短视频、字幕、AI actor、UGC 视频生成。
- 后期可用于“留学新闻短视频”自动成片。

风险：
- 第一版更需要脚本和素材包，不一定需要自动成片。
- 视频生成成本和质量需要实测。

结论：第二阶段视频生产可参考。

## 8. HKUDS/ViMax

链接：https://github.com/HKUDS/ViMax  
许可证：MIT  
定位：多 Agent 视频生成框架，负责导演、编剧、制片和生成。

可复用点：
- 分镜、脚本、镜头规划、多 Agent 视频流程。
- 可借鉴“从新闻到视频稿”的结构化流程。

风险：
- 太重，MVP 不适合先集成。
- 生成式视频质量、成本和耗时都要实测。

结论：研究价值高，工程复用放到后期。

## 推荐复用策略

第一版：
- 自建网站和数据模型。
- 借鉴 LangChain social-media-agent 的 HITL 流程。
- 用 RSSHub/News API/X API/官方站点做采集。
- 借鉴 AiToEarn 和 TryPost 的内容工作台设计。

第二版：
- 评估接入 xhs_ai_publisher 的小红书模板能力。
- 评估 social-auto-upload 的上传能力，但默认继续人工确认。
- 评估 OpenShorts 做成片。

第三版：
- 如果发布需求稳定，再申请抖音开放平台发布能力。
- 小红书只在有稳定合规 API 或可接受风控成本时做半自动。
