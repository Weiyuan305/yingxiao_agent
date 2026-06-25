const fallbackIntelligenceItems = [
  {
    id: 'hk-ai-business',
    region: 'HK',
    regionLabel: '香港',
    title: '港大 2026 Fall 商学院新增 AI 商业分析方向',
    source: '香港大学官网',
    sourceUrl: 'https://www.hku.hk/',
    sourceType: '院校动态',
    mediaStatus: '官网图可抓取',
    coverTheme: 'linear-gradient(135deg, #111827 0%, #334155 48%, #b91c1c 100%)',
    time: '09:35',
    score: 88,
    credibility: 4.8,
    status: '待核验',
    summary:
      '港大商学院更新 2026 Fall 教学计划，新增与 AI 商业分析相关的选修方向。适合做“港校商科申请方向变化”和“AI+商科背景提升”的小红书选题。',
    impact: ['申请商科、BA、管理、信息系统方向的学生需要关注课程匹配。', '可以把文案角度放在选课变化、背景提升和申请时间线。', '适合转化为小红书图文清单：谁适合、怎么准备、材料重点。'],
    checks: ['官网课程页已更新，需要人工复核发布日期。', '课程名称和开放对象需按原文确认，不写成确定录取优势。', '社媒讨论热度高，但只作为选题信号，不作为事实来源。'],
    tags: ['香港留学', '港大商学院', 'AI商业分析', '留学申请', '2026Fall'],
    draftTitle: '港大商科新增 AI 方向，2026fall 申请要注意',
    draftBody:
      '港大又有新变化。\n\n2026 Fall 商科相关课程里，AI 商业分析方向开始被更多申请人关注。对想申 BA、管理、信息系统、金融科技方向的同学来说，这类课程变化值得提前看。\n\n你需要重点确认 3 件事：\n1. 课程是否真的面向目标专业开放\n2. 你的数学、数据分析、编程背景是否能匹配\n3. 文书里是否能讲清楚“为什么是 AI + 商科”\n\n建议不要只写“我对 AI 感兴趣”，而是把实习、项目、数据分析经历和未来职业方向连起来。\n\n想申请港校商科的同学，这个变化可以先收藏。',
    coverText: '港大商科新增 AI 方向'
  },
  {
    id: 'hk-round2',
    region: 'HK',
    regionLabel: '香港',
    title: '港科大 MSc 申请轮次更新，Round 2 截止提前',
    source: 'HKUST Admission',
    sourceUrl: 'https://prog-crs.hkust.edu.hk/pgprog/',
    sourceType: '申请信息',
    mediaStatus: '无来源图，用模板封面',
    coverTheme: 'linear-gradient(135deg, #0f172a 0%, #1d4ed8 52%, #f59e0b 100%)',
    time: '08:50',
    score: 84,
    credibility: 4.7,
    status: '待核验',
    summary:
      '港科大部分授课型硕士项目更新申请轮次安排，Round 2 截止时间相对往年提前。适合做申请季提醒和材料检查清单。',
    impact: ['正在准备香港 MSc 的学生需要重新核对 deadline。', '文案可以聚焦“不要按去年时间线准备”。', '适合引导用户预约材料检查或选校规划。'],
    checks: ['需要逐项目核对最新 deadline。', '不要把部分专业变化写成全校统一变化。', '建议附原始页面链接给运营复核。'],
    tags: ['香港留学', '港科大', '申请轮次', 'MSc申请', 'Deadline'],
    draftTitle: '港科大申请轮次更新，Round 2 别按去年准备',
    draftBody:
      '准备港科大 MSc 的同学注意一下。\n\n今年部分项目的 Round 2 时间线有更新，不能再完全照着去年的申请节奏走。\n\n建议现在就做 4 件事：\n1. 重新核对目标专业官网 deadline\n2. 检查推荐信是否能按时提交\n3. 确认成绩单、语言成绩、文书版本\n4. 把冲刺校和稳妥校分开排优先级\n\n港校申请最怕材料都准备好了，结果错过轮次。尤其是商科、工程、数据相关项目，建议尽早定稿。',
    coverText: '港科大 Round 2 提醒'
  },
  {
    id: 'uk-psw',
    region: 'UK',
    regionLabel: '英国',
    title: '英国 PSW 签证最新数据：国际生就业趋势上升',
    source: 'UK Gov / News RSS',
    sourceUrl: 'https://www.gov.uk/graduate-visa',
    sourceType: '政策数据',
    mediaStatus: '政策页无图，用模板封面',
    coverTheme: 'linear-gradient(135deg, #020617 0%, #1e3a8a 52%, #16a34a 100%)',
    time: '08:20',
    score: 82,
    credibility: 4.5,
    status: '可发布',
    summary:
      '英国毕业生签证相关数据更新，国际学生毕业后求职路径仍是社媒高关注话题。适合做“英国留学后就业机会”科普型图文。',
    impact: ['适合面向关心就业和回报率的本科/硕士申请家庭。', '可拆成签证政策、就业路径、专业选择三个内容角度。', '注意避免承诺就业结果，只讲政策和准备建议。'],
    checks: ['签证名称、时长和适用条件需以英国政府官网为准。', '数据口径要标明年份和来源。', '不得写“毕业一定能留下”。'],
    tags: ['英国留学', 'PSW签证', '毕业生签证', '留英就业', '政策解读'],
    draftTitle: '英国 PSW 最新数据，留英就业该怎么看',
    draftBody:
      '最近英国毕业生签证相关数据又被很多家长问到。\n\nPSW 不是“保证留下”，但它确实给国际学生毕业后找工作留出了一段缓冲期。\n\n申请英国时，建议你同时看 3 个问题：\n1. 目标专业是否有清晰就业出口\n2. 学校所在城市是否有实习和招聘机会\n3. 自己是否能提前准备简历、项目和面试\n\n如果你是为了就业选择英国，不要只看排名。专业方向、实习资源、签证规则和个人准备都要一起看。\n\n这条适合收藏，后面选校时对照检查。',
    coverText: '英国 PSW 怎么看'
  },
  {
    id: 'uk-ranking',
    region: 'UK',
    regionLabel: '英国',
    title: '曼大 2026 QS 排名上升至全球 Top 34',
    source: 'QS / 媒体新闻',
    sourceUrl: 'https://www.topuniversities.com/university-rankings/world-university-rankings',
    sourceType: '排名资讯',
    mediaStatus: '媒体图待授权',
    coverTheme: 'linear-gradient(135deg, #18181b 0%, #4338ca 48%, #dc2626 100%)',
    time: '07:45',
    score: 76,
    credibility: 4.1,
    status: '可发布',
    summary:
      '曼彻斯特大学排名信息更新，适合做“排名变化如何影响选校”的解释型内容，而不是简单制造焦虑。',
    impact: ['适合英国选校阶段用户。', '可以说明排名、专业强度和录取难度不是同一件事。', '适合引导用户从目标专业和背景匹配角度选校。'],
    checks: ['排名年份和榜单来源需核对。', '不要暗示排名上升必然导致录取变难。', '需要补充专业维度判断。'],
    tags: ['英国留学', '曼彻斯特大学', 'QS排名', '选校建议', '申请策略'],
    draftTitle: '曼大排名上升，申请英国要不要更焦虑？',
    draftBody:
      '曼大排名变化又开始刷屏，但申请时不要只看一个数字。\n\n排名上升说明学校整体声誉和国际关注度高，但对申请人来说，更重要的是：\n1. 你的目标专业是否适配\n2. 该专业往年录取背景如何\n3. 你的成绩、文书、实习是否有竞争力\n\n排名可以参考，但不能替代选校策略。\n\n如果只因为排名高就盲申，很容易把申请列表做得过冲。建议把梦校、匹配校、稳妥校分开规划。',
    coverText: '曼大排名上升'
  },
  {
    id: 'hk-iang',
    region: 'HK',
    regionLabel: '香港',
    title: '香港 IANG 签证续签常见问题更新',
    source: '香港入境处',
    sourceUrl: 'https://www.immd.gov.hk/',
    sourceType: '政策解读',
    mediaStatus: '政策页无图，用模板封面',
    coverTheme: 'linear-gradient(135deg, #111827 0%, #047857 50%, #d97706 100%)',
    time: '07:10',
    score: 79,
    credibility: 4.6,
    status: '待核验',
    summary:
      '香港 IANG 相关问答更新，适合做毕业后留港路径科普，尤其面向正在比较香港和英国就业路径的学生。',
    impact: ['能回应“香港读完能不能留下”的高频问题。', '适合做成流程图式小红书笔记。', '需要明确适用对象，避免泛化到所有签证类型。'],
    checks: ['逐条核对入境处原文。', '确认续签条件和材料要求是否有变化。', '避免使用移民保证类话术。'],
    tags: ['香港留学', 'IANG', '毕业留港', '签证政策', '就业路径'],
    draftTitle: '香港 IANG 续签问题更新，毕业留港要看这几点',
    draftBody:
      '想毕业后留港工作的同学，经常会问 IANG 怎么准备。\n\n这类政策内容一定要看官方原文，不要只看社媒总结。\n\n你可以先检查：\n1. 自己是否符合适用对象\n2. 续签时是否需要工作证明\n3. 材料提交时间和方式\n4. 是否和自己的毕业时间线匹配\n\n香港留学的优势之一是毕业后路径相对清晰，但每个人情况不同，申请前一定要确认政策细节。',
    coverText: 'IANG 续签提醒'
  },
  {
    id: 'uk-language',
    region: 'UK',
    regionLabel: '英国',
    title: 'UCL 部分专业语言要求说明调整',
    source: 'UCL Admissions',
    sourceUrl: 'https://www.ucl.ac.uk/prospective-students/',
    sourceType: '申请信息',
    mediaStatus: '官网图可抓取',
    coverTheme: 'linear-gradient(135deg, #111827 0%, #4f46e5 50%, #0ea5e9 100%)',
    time: '06:55',
    score: 74,
    credibility: 4.4,
    status: '待核验',
    summary:
      'UCL 部分专业的语言要求说明页面更新，适合做“语言成绩别等最后补”的申请提醒内容。',
    impact: ['适合正在冲刺 G5 和伦敦地区院校的申请人。', '可以转成语言成绩准备时间线。', '有助于提醒学生不要误解 conditional offer。'],
    checks: ['必须逐专业确认语言等级。', '不能把页面说明调整写成录取政策大改。', '需提醒学生以 offer 条件为准。'],
    tags: ['英国留学', 'UCL', '语言要求', '申请材料', 'G5申请'],
    draftTitle: 'UCL 语言要求更新，别等 offer 后才补救',
    draftBody:
      '申请 UCL 的同学，语言成绩不要拖到最后。\n\n部分专业语言要求说明有更新，虽然不代表所有专业政策大改，但足够提醒大家提前核对。\n\n建议现在做：\n1. 查目标专业对应语言等级\n2. 看是否接受后补语言\n3. 估算考试和出分时间\n4. 给文书和申请提交留出缓冲\n\n语言成绩不是最难的部分，但经常是最容易被时间线卡住的部分。',
    coverText: 'UCL 语言要求提醒'
  },
  {
    id: 'x-uk-graduate-visa',
    region: 'UK',
    regionLabel: '英国',
    title: 'X.com 热议：Graduate Visa 时间线和就业担忧',
    source: 'X.com recent search',
    sourceUrl: 'https://x.com/search?q=%22Graduate%20Visa%22%20international%20students&src=typed_query&f=live',
    sourceType: '社媒观察',
    mediaStatus: 'X 媒体图待 API 授权',
    coverTheme: 'linear-gradient(135deg, #000000 0%, #1d4ed8 45%, #06b6d4 100%)',
    time: '06:30',
    score: 71,
    credibility: 3.6,
    status: '待核验',
    summary:
      'X.com 上关于英国 Graduate Visa、国际生就业和毕业时间线的讨论增加。这个来源适合发现选题热度，但不能作为事实依据，必须回到 GOV.UK 或学校职业服务页面核验。',
    impact: ['适合捕捉学生和家长正在讨论的问题。', '可以转化为“英国毕业后找工作准备清单”的小红书内容。', '社媒内容只做趋势信号，不直接写成政策事实。'],
    checks: ['需要通过 X API recent search 拉取原帖和发布时间。', '政策内容必须回到 GOV.UK 核验。', '不能引用未授权用户图片或长文本截图。'],
    tags: ['英国留学', 'X热点', 'GraduateVisa', '留英就业', '社媒观察'],
    draftTitle: 'X 上都在问英国毕业签证，真正要看这 3 点',
    draftBody:
      '最近 X 上关于英国 Graduate Visa 和国际生就业的讨论明显变多。\n\n但社媒讨论只能说明大家在关注，不能直接当成政策结论。\n\n如果你准备申请英国，真正要看 3 件事：\n1. GOV.UK 上的毕业生签证适用条件\n2. 目标学校所在城市的实习和招聘机会\n3. 你的专业是否有清晰就业路径\n\n不要被单条帖子带节奏。选校和签证规划，最好回到官方来源和自己的背景条件。',
    coverText: '英国毕业签证热议'
  }
]

let intelligenceItems = [...fallbackIntelligenceItems]
let backupItems = []
const competitorStorageKey = 'study-agent-competitor-notes'
const draftOverridesStorageKey = 'study-agent-draft-overrides'
const verificationStorageKey = 'study-agent-verification-state'
const publishPlanStorageKey = 'study-agent-publish-plan'
const feedbackStorageKey = 'study-agent-feedback'
let competitorNotes = loadCompetitorNotes()
let draftOverrides = loadRecordStorage(draftOverridesStorageKey)
let verificationState = loadRecordStorage(verificationStorageKey)
let publishPlan = loadRecordStorage(publishPlanStorageKey)
let feedbackState = loadRecordStorage(feedbackStorageKey)
let sourceStatuses = []
let dataMeta = {
  mode: 'demo-fallback',
  generatedAt: '',
  collectedAt: '',
  sourceCount: 0,
  successfulSourceCount: 0,
  skippedSourceCount: 0,
  failedSourceCount: 0,
  rawItemCount: 0,
  itemCount: intelligenceItems.length,
  llm: {
    enabled: false,
    mode: 'not-run',
    model: '',
    errorCount: 0
  }
}

const state = {
  filter: 'all',
  view: 'intelligence',
  selectedId: intelligenceItems[0].id,
  selectedRecommendationIds: new Set(),
  coverStyle: localStorage.getItem('study-agent-cover-style') || 'source',
  sourceFilter: 'all'
}

const coverStyleLabels = {
  source: '来源图',
  chart: '数据图表',
  contrast: '强对比',
  ai: 'AI 风格'
}

const recommendationMin = 3
const recommendationMax = 5

const navLinks = document.querySelectorAll('[data-view]')
const viewPanels = document.querySelectorAll('[data-view-panel]')
const listEl = document.querySelector('#intelList')
const selectedTitleEl = document.querySelector('#selectedTitle')
const selectedMetaEl = document.querySelector('#selectedMeta')
const selectedScoreEl = document.querySelector('#selectedScore')
const selectedCredibilityEl = document.querySelector('#selectedCredibility')
const selectedSummaryEl = document.querySelector('#selectedSummary')
const sourceUrlEl = document.querySelector('#sourceUrl')
const mediaStatusEl = document.querySelector('#mediaStatus')
const statSGEl = document.querySelector('#statSG')
const dailyRecommendationListEl = document.querySelector('#dailyRecommendationList')
const dailySelectedCountEl = document.querySelector('#dailySelectedCount')
const dailyRecommendationHintEl = document.querySelector('#dailyRecommendationHint')
const backupTopicListEl = document.querySelector('#backupTopicList')
const backupTopicCountEl = document.querySelector('#backupTopicCount')
const workflowStripEl = document.querySelector('#workflowStrip')
const workflowIntelEl = document.querySelector('#workflowIntel')
const workflowSelectEl = document.querySelector('#workflowSelect')
const workflowDraftEl = document.querySelector('#workflowDraft')
const workflowVerifyEl = document.querySelector('#workflowVerify')
const workflowPublishEl = document.querySelector('#workflowPublish')
const impactListEl = document.querySelector('#impactList')
const checkListEl = document.querySelector('#checkList')
const draftStatusEl = document.querySelector('#draftStatus')
const draftTitleEl = document.querySelector('#draftTitle')
const draftBodyEl = document.querySelector('#draftBody')
const coverTextEl = document.querySelector('#coverText')
const titleCountEl = document.querySelector('#titleCount')
const bodyCountEl = document.querySelector('#bodyCount')
const coverCountEl = document.querySelector('#coverCount')
const tagRowEl = document.querySelector('#tagRow')
const coverArtEl = document.querySelector('#coverArt')
const coverSourceEl = document.querySelector('#coverSource')
const coverStyleControlEl = document.querySelector('#coverStyleControl')
const creationListEl = document.querySelector('#creationList')
const creationMetaEl = document.querySelector('#creationMeta')
const creationCoverEl = document.querySelector('#creationCover')
const creationCoverSourceEl = document.querySelector('#creationCoverSource')
const creationScoreStripEl = document.querySelector('#creationScoreStrip')
const creationCtaPanelEl = document.querySelector('#creationCtaPanel')
const creationChecklistEl = document.querySelector('#creationChecklist')
const creationDraftTitleEl = document.querySelector('#creationDraftTitle')
const creationDraftBodyEl = document.querySelector('#creationDraftBody')
const creationCtaInputEl = document.querySelector('#creationCtaInput')
const creationTagsInputEl = document.querySelector('#creationTagsInput')
const creationCoverTextEl = document.querySelector('#creationCoverText')
const creationTitleCountEl = document.querySelector('#creationTitleCount')
const creationBodyCountEl = document.querySelector('#creationBodyCount')
const creationCoverCountEl = document.querySelector('#creationCoverCount')
const creationCoverStyleControlEl = document.querySelector('#creationCoverStyleControl')
const publishTableEl = document.querySelector('#publishTable')
const contentCalendarEl = document.querySelector('#contentCalendar')
const publishSummaryEl = document.querySelector('#publishSummary')
const feedbackListEl = document.querySelector('#feedbackList')
const feedbackCountEl = document.querySelector('#feedbackCount')
const sourcesGridEl = document.querySelector('#sourcesGrid')
const sourceSummaryEl = document.querySelector('#sourceSummary')
const competitorFormEl = document.querySelector('#competitorForm')
const competitorTitleEl = document.querySelector('#competitorTitle')
const competitorUrlEl = document.querySelector('#competitorUrl')
const competitorListEl = document.querySelector('#competitorList')
const competitorCountEl = document.querySelector('#competitorCount')
const toastEl = document.querySelector('#toast')
const dataModeEl = document.querySelector('#dataMode')
const modelStatusEl = document.querySelector('#modelStatus')
const xStatusEl = document.querySelector('#xStatus')
const dataDateEl = document.querySelector('#dataDate')
const sourceHealthOfficialEl = document.querySelector('#sourceHealthOfficial')
const sourceHealthSchoolEl = document.querySelector('#sourceHealthSchool')
const sourceHealthSocialEl = document.querySelector('#sourceHealthSocial')
const creationCountBadgeEl = document.querySelector('#creationCountBadge')
const llmApiStatusEl = document.querySelector('#llmApiStatus')
const xApiStatusEl = document.querySelector('#xApiStatus')
const storageStatusEl = document.querySelector('#storageStatus')

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function safeList(value, fallback = []) {
  return Array.isArray(value) ? value : fallback
}

function safeObject(value, fallback = {}) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : fallback
}

function loadRecordStorage(key) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || '{}')
    return safeObject(parsed)
  } catch {
    return {}
  }
}

function saveRecordStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

function getDraftOverride(id) {
  return safeObject(draftOverrides[id])
}

function getWorkingItem(item) {
  const override = getDraftOverride(item.id)
  return {
    ...item,
    draftTitle: override.draftTitle || item.draftTitle,
    draftBody: override.draftBody || item.draftBody,
    coverText: override.coverText || item.coverText,
    privateMessageCta: override.privateMessageCta || item.privateMessageCta,
    tags: safeList(override.tags, item.tags)
  }
}

function getBaseItemById(id) {
  return intelligenceItems.find(item => item.id === id) ||
    backupItems.find(item => item.id === id) ||
    fallbackIntelligenceItems.map(normalizeItem).find(item => item.id === id)
}

function listsEqual(a = [], b = []) {
  if (a.length !== b.length) return false
  return a.every((value, index) => value === b[index])
}

function hasMeaningfulDraftOverride(item) {
  if (!item?.id) return false
  const override = getDraftOverride(item.id)
  if (!Object.keys(override).length) return false

  const base = getBaseItemById(item.id) || item
  const textFields = ['draftTitle', 'draftBody', 'coverText', 'privateMessageCta']
  const hasTextChange = textFields.some(key => override[key] && override[key] !== base[key])
  const hasTagsChange = Array.isArray(override.tags) && !listsEqual(override.tags, base.tags)
  return hasTextChange || hasTagsChange
}

function updateDraftOverride(id, patch) {
  if (!id) return
  const current = getDraftOverride(id)
  const next = {
    ...current,
    ...patch
  }
  const base = getBaseItemById(id)
  if (base) {
    ;['draftTitle', 'draftBody', 'coverText', 'privateMessageCta'].forEach(key => {
      if (next[key] === base[key]) delete next[key]
    })
    if (Array.isArray(next.tags) && listsEqual(next.tags, base.tags)) delete next.tags
  }

  if (Object.keys(next).length) {
    draftOverrides[id] = {
      ...next,
      updatedAt: new Date().toISOString()
    }
  } else {
    delete draftOverrides[id]
  }
  saveRecordStorage(draftOverridesStorageKey, draftOverrides)
}

function getVerification(id) {
  return {
    cover: false,
    source: false,
    facts: false,
    risk: false,
    ...safeObject(verificationState[id])
  }
}

function updateVerification(id, key, checked) {
  verificationState[id] = {
    ...getVerification(id),
    [key]: checked,
    updatedAt: new Date().toISOString()
  }
  saveRecordStorage(verificationStorageKey, verificationState)
}

function verificationPercent(items = getChosenRecommendations()) {
  const total = items.length * 4
  if (!total) return 0
  const done = items.reduce((sum, item) => {
    const verification = getVerification(item.id)
    return sum + ['cover', 'source', 'facts', 'risk'].filter(key => verification[key]).length
  }, 0)
  return Math.round((done / total) * 100)
}

function getPublishPlan(id, index = 0) {
  const slots = ['10:30', '14:30', '18:30', '20:30', '21:30']
  return {
    time: slots[index] || '待排期',
    channel: '小红书',
    status: '待复制',
    reminder: '发布前 30 分钟',
    ...safeObject(publishPlan[id])
  }
}

function updatePublishPlan(id, patch) {
  publishPlan[id] = {
    ...getPublishPlan(id),
    ...patch,
    updatedAt: new Date().toISOString()
  }
  saveRecordStorage(publishPlanStorageKey, publishPlan)
}

function getFeedback(id) {
  return {
    views: '',
    saves: '',
    comments: '',
    dms: '',
    notes: '',
    ...safeObject(feedbackState[id])
  }
}

function updateFeedback(id, patch) {
  feedbackState[id] = {
    ...getFeedback(id),
    ...patch,
    updatedAt: new Date().toISOString()
  }
  saveRecordStorage(feedbackStorageKey, feedbackState)
}

function regionLabel(region) {
  if (region === 'HK') return '香港'
  if (region === 'UK') return '英国'
  if (region === 'SG') return '新加坡'
  return region || '全部'
}

function fallbackMarketingScore(item) {
  const score = Number(item.score || item.relevanceScore || 0)
  return {
    total: Math.max(0, Math.min(100, score)),
    level: score >= 82 ? '今日必写' : score >= 68 ? '可写' : '备选',
    dimensions: {
      policyImpact: score,
      heat: score,
      urgency: score,
      saveValue: score,
      credibility: Math.round(Number(item.credibility || 3.5) * 20)
    },
    reasons: ['基于来源相关度进入候选池。'],
    contentAngle: item.sourceType || '留学资讯选题',
    privateMessageCta: '评论区打专业我帮你看。',
    riskNotes: ['发布前必须打开原文做事实核验。']
  }
}

function normalizeItem(item) {
  const marketingScore = {
    ...fallbackMarketingScore(item),
    ...safeObject(item.marketingScore),
    dimensions: {
      ...fallbackMarketingScore(item).dimensions,
      ...safeObject(item.marketingScore?.dimensions)
    },
    reasons: safeList(item.marketingScore?.reasons, fallbackMarketingScore(item).reasons)
  }
  return {
    ...item,
    tags: safeList(item.tags),
    impact: safeList(item.impact, ['请打开原文核对影响范围。']),
    checks: safeList(item.checks, ['请打开原文完成事实核验。']),
    credibility: Number(item.credibility || 3.5),
    score: Number(item.score || 0),
    status: item.status || '待核验',
    sourceUrl: item.sourceUrl || item.url || '#',
    sourceType: item.sourceType || item.sourceTypeLabel || '数据源',
    mediaStatus: item.mediaStatus || '配图状态待确认',
    imageUrl: item.imageUrl || '',
    imageOrigin: item.imageOrigin || 'none',
    imageLicenseStatus: item.imageLicenseStatus || 'unknown',
    canPublishImage: Boolean(item.canPublishImage),
    coverTheme: item.coverTheme || 'linear-gradient(135deg, #111827 0%, #334155 48%, #0f766e 100%)',
    marketingScore,
    recommendationTier: item.recommendationTier || (marketingScore.level === '今日必写' ? 'daily-candidate' : marketingScore.level === '可写' ? 'candidate' : 'backup'),
    isDailyRecommendation: Boolean(item.isDailyRecommendation),
    recommendationRank: Number(item.recommendationRank || 0),
    contentAngle: item.contentAngle || marketingScore.contentAngle,
    privateMessageCta: item.privateMessageCta || marketingScore.privateMessageCta,
    riskNotes: safeList(item.riskNotes, marketingScore.riskNotes),
    draftTitle: item.draftTitle || item.title || '待生成标题',
    draftBody: item.draftBody || item.summary || '待生成正文',
    coverText: item.coverText || item.title || '留学动态',
    regionLabel: item.regionLabel || regionLabel(item.region),
    time: item.time || '--:--'
  }
}

function isHttpImageUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}

function escapeCssUrl(value) {
  return String(value).replace(/["\\\n\r]/g, '\\$&')
}

function getCoverAsset(item, style = state.coverStyle) {
  if (style === 'chart') {
    return {
      mode: 'chart',
      imageUrl: '',
      label: '数据图表封面',
      note: '用来源数据和营销评分生成信息图排版'
    }
  }

  if (style === 'contrast') {
    return {
      mode: 'contrast',
      imageUrl: '',
      label: '强对比封面',
      note: '爆款标题加对比排版，发布前核对措辞'
    }
  }

  if (style === 'ai') {
    return {
      mode: 'ai',
      imageUrl: '',
      label: 'AI 生成图封面',
      note: '建议用标题和来源摘要生成背景图，发布前复核版权'
    }
  }

  if (item.imageUrl && item.canPublishImage && isHttpImageUrl(item.imageUrl)) {
    return {
      mode: 'source-image',
      imageUrl: item.imageUrl,
      label: '来源图封面',
      note: `${item.imageOrigin || 'source image'} · 发布前复核授权`
    }
  }

  if (item.imageUrl) {
    return {
      mode: 'reference-only',
      imageUrl: '',
      label: '模板封面',
      note: '来源图仅供参考，不建议直接发布'
    }
  }

  return {
    mode: 'template',
    imageUrl: '',
    label: '信息图模板封面',
    note: '当前来源无可用配图，使用非纯色模板'
  }
}

function getCoverReadiness(item, style = state.coverStyle) {
  const asset = getCoverAsset(item, style)
  if (asset.mode === 'source-image') {
    return {
      ...asset,
      label: '来源图可用',
      detail: '可做封面底图，发布前复核授权',
      className: 'ready'
    }
  }
  if (asset.mode === 'reference-only') {
    return {
      ...asset,
      label: '来源图仅参考',
      detail: '需改用模板、AI 图或图表封面',
      className: 'review'
    }
  }
  if (style === 'source') {
    return {
      ...asset,
      label: '模板封面',
      detail: '当前无可发布来源图，已用非纯色信息图模板',
      className: 'review'
    }
  }
  return {
    ...asset,
    label: asset.label,
    detail: asset.note,
    className: 'ready'
  }
}

function getStatusBadgeClass(item) {
  if (item.status === '可发布') return 'badge-ready'
  return 'badge-review'
}

function getScoreTone(score) {
  if (score >= 82) return 'high'
  if (score >= 68) return 'medium'
  return 'low'
}

function sourceTrustLabel(source) {
  const trust = source.trustLevel || ''
  if (trust === 'official') return '官方'
  if (trust === 'school') return '院校'
  if (trust === 'expert') return '专家'
  if (trust === 'news-discovery') return '新闻'
  if (trust === 'social') return '社媒'
  if (trust === 'manual') return '手动'
  return source.type || '数据源'
}

function sourceFixHint(source) {
  if (source.id?.startsWith('x-') || /x\.com/i.test(source.name || '')) {
    return {
      label: '复制 X_BEARER_TOKEN',
      copy: 'X_BEARER_TOKEN=',
      detail: '在 .env 配置 X_BEARER_TOKEN 后，点击测试连接或刷新情报。'
    }
  }
  if (!source.ok && !source.skipped) {
    return {
      label: '复制排查项',
      copy: `${source.name}: ${source.message || '连接失败'}`,
      detail: '多半是源站响应、网络或页面结构变化；可稍后重试或打开源链接人工核对。'
    }
  }
  return {
    label: '查看源链接',
    copy: source.url || '',
    detail: '该来源可作为人工核验入口。'
  }
}

function getSourceGroup(source) {
  if (!source.ok || source.skipped) return 'failed'
  if (source.trustLevel === 'school') return 'school'
  if (source.trustLevel === 'news-discovery' || source.type === 'atom') return 'news'
  if (source.trustLevel === 'social' || source.trustLevel === 'manual') return 'social'
  if (source.trustLevel === 'official' || source.trustLevel === 'expert') return 'official'
  return 'other'
}

function matchesSourceFilter(source) {
  if (state.sourceFilter === 'all') return true
  return getSourceGroup(source) === state.sourceFilter
}

function applyCoverArt(element, item) {
  const asset = getCoverAsset(item, state.coverStyle)
  element.style.setProperty('--cover-bg', item.coverTheme)
  element.style.setProperty('--cover-image', asset.imageUrl ? `url("${escapeCssUrl(asset.imageUrl)}")` : 'none')
  element.classList.remove('cover-style-source', 'cover-style-chart', 'cover-style-contrast', 'cover-style-ai')
  element.classList.add(`cover-style-${state.coverStyle}`)
  element.classList.toggle('has-source-image', Boolean(asset.imageUrl))
  element.classList.toggle('no-source-image', !asset.imageUrl)
  element.dataset.region = item.regionLabel
  element.dataset.title = item.coverText
  element.dataset.coverMode = asset.mode
  return asset
}

function applyPayload(payload, fallbackMessage) {
  const incomingItems = safeList(payload.items).map(normalizeItem)
  backupItems = safeList(payload.backupItems).map(normalizeItem)
  dataMeta = payload.meta || dataMeta
  sourceStatuses = safeList(payload.sources)

  if (incomingItems.length > 0 && dataMeta.mode !== 'not-collected') {
    intelligenceItems = incomingItems
    state.selectedId = incomingItems[0].id
  } else if (!intelligenceItems.length) {
    intelligenceItems = fallbackIntelligenceItems.map(normalizeItem)
    state.selectedId = intelligenceItems[0].id
  }

  syncDefaultRecommendations()

  render()

  if (fallbackMessage) {
    showToast(fallbackMessage)
  }
}

function getDailyRecommendations() {
  const explicit = intelligenceItems
    .filter(item => item.isDailyRecommendation)
    .sort((a, b) => (a.recommendationRank || 99) - (b.recommendationRank || 99))

  if (explicit.length) return explicit.slice(0, 5)

  return [...intelligenceItems]
    .sort((a, b) => b.marketingScore.total - a.marketingScore.total)
    .slice(0, 5)
}

function getRecommendationBounds() {
  const daily = getDailyRecommendations()
  return {
    min: Math.min(recommendationMin, daily.length),
    max: Math.min(recommendationMax, daily.length)
  }
}

function syncDefaultRecommendations() {
  const daily = getDailyRecommendations()
  const validIds = new Set(daily.map(item => item.id))
  state.selectedRecommendationIds = new Set([...state.selectedRecommendationIds].filter(id => validIds.has(id)))
  const bounds = getRecommendationBounds()
  if (state.selectedRecommendationIds.size === 0) {
    daily.slice(0, bounds.min).forEach(item => state.selectedRecommendationIds.add(item.id))
  }
  if (state.selectedRecommendationIds.size < bounds.min) {
    daily
      .filter(item => !state.selectedRecommendationIds.has(item.id))
      .slice(0, bounds.min - state.selectedRecommendationIds.size)
      .forEach(item => state.selectedRecommendationIds.add(item.id))
  }
  if (state.selectedRecommendationIds.size > bounds.max) {
    state.selectedRecommendationIds = new Set([...state.selectedRecommendationIds].slice(0, bounds.max))
  }
}

function getChosenRecommendations() {
  const daily = getDailyRecommendations()
  const chosen = daily.filter(item => state.selectedRecommendationIds.has(item.id))
  return chosen.length ? chosen : daily.slice(0, Math.min(recommendationMin, daily.length))
}

async function loadIntelligence() {
  const endpoints = ['/api/intelligence', './data/intelligence.json']
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${endpoint}?t=${Date.now()}`, { cache: 'no-store' })
      if (!response.ok) throw new Error(`${response.status}`)
      const payload = await response.json()
      applyPayload(payload)
      return
    } catch {
      // Try the next endpoint. Static file mode will not have /api routes.
    }
  }
  render()
}

function getVisibleItems() {
  if (state.filter === 'all') return intelligenceItems
  return intelligenceItems.filter(item => item.region === state.filter)
}

function getSelectedItem() {
  const item = intelligenceItems.find(item => item.id === state.selectedId) ||
    backupItems.find(item => item.id === state.selectedId) ||
    getVisibleItems()[0] ||
    intelligenceItems[0] ||
    normalizeItem({})
  return getWorkingItem(item)
}

function updateStats() {
  const hkCount = intelligenceItems.filter(item => item.region === 'HK').length
  const ukCount = intelligenceItems.filter(item => item.region === 'UK').length
  const sgCount = intelligenceItems.filter(item => item.region === 'SG').length
  const chosen = getChosenRecommendations()
  const reviewCount = chosen.length
    ? chosen.filter(item => verificationPercent([item]) < 100).length
    : intelligenceItems.filter(item => item.status === '待核验').length
  document.querySelector('#statTotal').textContent = intelligenceItems.length
  document.querySelector('#statHK').textContent = hkCount
  document.querySelector('#statUK').textContent = ukCount
  if (statSGEl) statSGEl.textContent = sgCount
  document.querySelector('#statReview').textContent = reviewCount
  document.querySelector('#visibleCount').textContent = getVisibleItems().length
  if (creationCountBadgeEl) creationCountBadgeEl.textContent = `${getChosenRecommendations().length} 条今日已选`
}

function renderWorkflowStatus() {
  const chosen = getChosenRecommendations()
  const draftEditedCount = chosen.filter(hasMeaningfulDraftOverride).length
  const publishedCount = chosen.filter((item, index) => {
    const plan = getPublishPlan(item.id, index)
    return plan.status === '已发布' || plan.status === '已复盘'
  }).length
  const feedbackCount = chosen.filter(item => {
    const feedback = getFeedback(item.id)
    return Number(feedback.views || 0) || Number(feedback.saves || 0) || Number(feedback.comments || 0) || Number(feedback.dms || 0)
  }).length

  if (workflowIntelEl) workflowIntelEl.textContent = `${intelligenceItems.length} 条`
  if (workflowSelectEl) workflowSelectEl.textContent = `${chosen.length} 已选`
  if (workflowDraftEl) workflowDraftEl.textContent = `${draftEditedCount} 已改`
  if (workflowVerifyEl) workflowVerifyEl.textContent = `${verificationPercent(chosen)}%`
  if (workflowPublishEl) workflowPublishEl.textContent = `${publishedCount}/${chosen.length} 发布 · ${feedbackCount} 复盘`

  workflowStripEl?.querySelectorAll('[data-workflow-view]').forEach(button => {
    button.classList.toggle('active', button.dataset.workflowView === state.view)
  })
}

function updateIntegrationStatus() {
  const realDataLoaded = dataMeta.mode === 'real-data'
  const llmMode = dataMeta.llm?.mode || 'not-run'
  const llmEnabled = Boolean(dataMeta.llm?.enabled)
  const llmErrorCount = Number(dataMeta.llm?.errorCount || 0)
  const xSource = sourceStatuses.find(source => source.id?.startsWith('x-'))
  const generatedDate = dataMeta.generatedAt || dataMeta.collectedAt

  if (dataModeEl) {
    dataModeEl.textContent = realDataLoaded ? '真实数据 JSON' : '演示兜底数据'
  }
  if (modelStatusEl) {
    modelStatusEl.textContent = llmErrorCount
      ? `模型失败 ${llmErrorCount} 条，规则回退`
      : llmEnabled ? `已接入 ${dataMeta.llm.model}` : '未配置 Key，规则生成'
  }
  if (xStatusEl) {
    xStatusEl.textContent = xSource?.ok ? '已接入 recent search' : '待配置 Bearer Token'
  }
  if (dataDateEl) {
    dataDateEl.textContent = generatedDate ? new Date(generatedDate).toLocaleDateString('zh-CN') : '未采集'
  }
  if (sourceHealthOfficialEl) {
    const officialSources = sourceStatuses.filter(source => source.trustLevel === 'official')
    const okCount = officialSources.filter(source => source.ok).length
    sourceHealthOfficialEl.innerHTML = `<i class="${okCount ? 'online' : 'warn'}"></i>官方源 ${okCount}/${officialSources.length || 0}`
  }
  if (sourceHealthSchoolEl) {
    const schoolSources = sourceStatuses.filter(source => source.trustLevel === 'school')
    const okCount = schoolSources.filter(source => source.ok).length
    sourceHealthSchoolEl.innerHTML = `<i class="${okCount ? 'online' : 'warn'}"></i>院校源 ${okCount}/${schoolSources.length || 0}`
  }
  if (sourceHealthSocialEl) {
    const socialSources = sourceStatuses.filter(source => source.trustLevel === 'social')
    const okCount = socialSources.filter(source => source.ok).length
    sourceHealthSocialEl.innerHTML = `<i class="${okCount ? 'online' : 'warn'}"></i>社媒源 ${okCount}/${socialSources.length || 0}`
  }
  if (llmApiStatusEl) {
    llmApiStatusEl.textContent = llmErrorCount ? '调用失败' : llmEnabled ? '已连接' : '规则兜底'
  }
  if (xApiStatusEl) {
    xApiStatusEl.textContent = xSource?.ok ? '已连接' : xSource?.skipped ? '缺少 Token' : '未连接'
  }
  if (storageStatusEl) {
    storageStatusEl.textContent = realDataLoaded ? '本地 JSON' : '演示兜底'
  }
}

function renderList() {
  listEl.innerHTML = ''
  getVisibleItems().forEach(rawItem => {
    const item = getWorkingItem(rawItem)
    const button = document.createElement('button')
    button.type = 'button'
    button.className = `intel-item${item.id === state.selectedId ? ' active' : ''}`
    button.dataset.id = item.id
    button.innerHTML = `
      <div class="intel-top">
        <span class="item-dot ${item.status === '可发布' ? 'online' : 'warn'}"></span>
        <div style="min-width:0; flex:1;">
          <h3>${escapeHtml(item.title)}</h3>
          <div class="intel-meta">
            <span>${escapeHtml(item.regionLabel)} · ${escapeHtml(item.sourceType)} · 营销 ${item.marketingScore.total}</span>
            <span>${escapeHtml(item.time)}</span>
          </div>
          <div class="intel-tags">
            ${item.tags.slice(0, 3).map(tag => `<span class="mini-tag">${escapeHtml(tag)}</span>`).join('')}
          </div>
        </div>
        <span class="score">${item.score}</span>
      </div>
    `
    button.addEventListener('click', () => {
      state.selectedId = item.id
      render()
    })
    listEl.append(button)
  })
}

function renderDailyRecommendations() {
  if (!dailyRecommendationListEl) return
  const daily = getDailyRecommendations()
  const bounds = getRecommendationBounds()
  const selectedCount = getChosenRecommendations().length
  if (dailySelectedCountEl) dailySelectedCountEl.textContent = `${selectedCount}/${bounds.max || 0} 已选`
  if (dailyRecommendationHintEl) {
    dailyRecommendationHintEl.textContent = `建议每天选择 ${bounds.min}-${bounds.max} 篇，默认按营销评分排序`
  }

  if (!daily.length) {
    dailyRecommendationListEl.innerHTML = '<p class="empty-note">暂无可推荐内容，请先刷新真实数据。</p>'
    return
  }

  dailyRecommendationListEl.innerHTML = daily.map(rawItem => {
    const item = getWorkingItem(rawItem)
    const active = state.selectedRecommendationIds.has(item.id)
    const dimensions = item.marketingScore.dimensions || {}
    const cover = getCoverReadiness(item)
    const reasons = item.marketingScore.reasons.slice(0, 2)
    return `
      <button class="recommendation-item${active ? ' selected' : ''}" type="button" data-recommend-id="${item.id}">
        <div class="recommendation-rank score-${getScoreTone(item.marketingScore.total)}">
          <span>${item.recommendationRank || '-'}</span>
          <strong>${item.marketingScore.total}</strong>
        </div>
        <div class="recommendation-main">
          <div class="recommendation-title">
            <strong>${escapeHtml(item.draftTitle || item.title)}</strong>
            <span class="readiness-pill ${cover.className}">${escapeHtml(cover.label)}</span>
          </div>
          <p>${escapeHtml(item.contentAngle)}</p>
          <div class="recommendation-reasons">
            ${reasons.map(reason => `<span>${escapeHtml(reason)}</span>`).join('')}
          </div>
          <div class="dimension-grid" aria-label="营销评分维度">
            <span>政策 ${dimensions.policyImpact || 0}</span>
            <span>热度 ${dimensions.heat || 0}</span>
            <span>紧急 ${dimensions.urgency || 0}</span>
            <span>收藏 ${dimensions.saveValue || 0}</span>
          </div>
          <small>${escapeHtml(item.regionLabel)} · ${escapeHtml(item.sourceType)} · ${escapeHtml(item.privateMessageCta)}</small>
        </div>
      </button>
    `
  }).join('')

  dailyRecommendationListEl.querySelectorAll('[data-recommend-id]').forEach(button => {
    button.addEventListener('click', () => toggleRecommendation(button.dataset.recommendId))
  })
}

function toggleRecommendation(id) {
  const daily = getDailyRecommendations()
  const item = daily.find(candidate => candidate.id === id)
  if (!item) return
  const bounds = getRecommendationBounds()
  if (state.selectedRecommendationIds.has(id)) {
    if (state.selectedRecommendationIds.size <= bounds.min) {
      showToast(`今日至少选择 ${bounds.min} 篇`)
    } else {
      state.selectedRecommendationIds.delete(id)
    }
  } else if (state.selectedRecommendationIds.size >= bounds.max) {
    showToast(`今日最多选择 ${bounds.max} 篇`)
  } else {
    state.selectedRecommendationIds.add(id)
  }
  state.selectedId = id
  render()
}

function renderBackupTopics() {
  if (!backupTopicListEl) return
  const selectedIds = new Set(getChosenRecommendations().map(item => item.id))
  const backups = backupItems.length
    ? backupItems.filter(item => !selectedIds.has(item.id))
    : [...intelligenceItems]
      .filter(item => !selectedIds.has(item.id) && !item.isDailyRecommendation)
      .sort((a, b) => a.marketingScore.total - b.marketingScore.total)

  if (backupTopicCountEl) backupTopicCountEl.textContent = `${backups.length} 条`

  if (!backups.length) {
    backupTopicListEl.innerHTML = '<p class="empty-note">暂无备选内容。</p>'
    return
  }

  backupTopicListEl.innerHTML = backups.slice(0, 8).map(rawItem => {
    const item = getWorkingItem(rawItem)
    return `
    <button class="backup-item${item.id === state.selectedId ? ' active' : ''}" type="button" data-backup-id="${item.id}">
      <span>${escapeHtml(item.regionLabel)} · 营销 ${item.marketingScore.total} · ${escapeHtml(getCoverReadiness(item).label)}</span>
      <strong>${escapeHtml(item.title)}</strong>
      <small>${escapeHtml(item.reason || item.contentAngle || '备选题库素材')}</small>
    </button>
  `
  }).join('')

  backupTopicListEl.querySelectorAll('[data-backup-id]').forEach(button => {
    button.addEventListener('click', () => {
      state.selectedId = button.dataset.backupId
      render()
    })
  })
}

function renderDetail() {
  const item = getSelectedItem()
  selectedTitleEl.textContent = item.title
  selectedMetaEl.textContent = `${item.source} · ${item.regionLabel} · ${item.time}`
  selectedScoreEl.textContent = `${item.marketingScore.level} · 营销 ${item.marketingScore.total}分`
  selectedCredibilityEl.textContent = `来源可信度 ★ ${item.credibility.toFixed(1)}`
  selectedSummaryEl.textContent = item.summary
  sourceUrlEl.href = item.sourceUrl
  sourceUrlEl.textContent = item.sourceUrl
  mediaStatusEl.textContent = item.mediaStatus
  draftStatusEl.textContent = item.status
  draftStatusEl.className = `badge ${item.status === '可发布' ? 'badge-ready' : 'badge-review'}`

  const impactItems = [
    `内容角度：${item.contentAngle}`,
    `私信引导：${item.privateMessageCta}`,
    ...item.marketingScore.reasons,
    ...item.impact
  ]
  const checkItems = [
    ...item.riskNotes,
    ...item.checks
  ]
  impactListEl.innerHTML = impactItems.map(text => `<li>${escapeHtml(text)}</li>`).join('')
  checkListEl.innerHTML = checkItems.map(text => `<li>${escapeHtml(text)}</li>`).join('')

  draftTitleEl.value = item.draftTitle
  draftBodyEl.value = item.draftBody
  coverTextEl.value = item.coverText
  const coverAsset = applyCoverArt(coverArtEl, item)
  if (coverSourceEl) {
    coverSourceEl.textContent = `${coverAsset.label} · ${coverAsset.note}`
  }
  tagRowEl.innerHTML = item.tags.map(tag => `<span class="tag">#${escapeHtml(tag)}</span>`).join('')
  updateCounts()
}

function getCreationItems() {
  const chosenIds = new Set(getChosenRecommendations().map(item => item.id))
  return [
    ...getChosenRecommendations(),
    ...intelligenceItems.filter(item => !chosenIds.has(item.id))
  ]
}

function renderCreation() {
  const selected = getSelectedItem()
  const chosenIds = new Set(getChosenRecommendations().map(item => item.id))
  creationListEl.innerHTML = getCreationItems().map((rawItem, index) => {
    const item = getWorkingItem(rawItem)
    const cover = getCoverReadiness(item)
    const selectedForToday = chosenIds.has(item.id)
    const verified = verificationPercent([item]) === 100
    return `
    <button class="creation-item${item.id === selected.id ? ' active' : ''}" type="button" data-create-id="${item.id}">
      <div class="creation-item-head">
        <span class="queue-number">${String(index + 1).padStart(2, '0')}</span>
        <span class="badge ${selectedForToday ? 'badge-selected' : getStatusBadgeClass(item)}">${selectedForToday ? '今日已选' : escapeHtml(item.status)}</span>
        <span class="badge ${verified ? 'badge-ready' : 'badge-review'}">${verified ? '已核验' : '待核验'}</span>
      </div>
      <strong>${escapeHtml(item.draftTitle)}</strong>
      <small>${escapeHtml(item.regionLabel)} · ${escapeHtml(item.sourceType)} · ${item.tags.slice(0, 2).map(tag => `#${escapeHtml(tag)}`).join(' ')}</small>
      <div class="creation-item-metrics">
        <span>营销 ${item.marketingScore.total}</span>
        <span>${escapeHtml(cover.label)}</span>
        <span>可信 ${item.credibility.toFixed(1)}</span>
      </div>
    </button>
  `
  }).join('')

  creationMetaEl.textContent = `${selected.regionLabel} · ${selected.source} · 营销 ${selected.marketingScore.total} 分`
  const coverAsset = applyCoverArt(creationCoverEl, selected)
  if (creationCoverSourceEl) {
    creationCoverSourceEl.textContent = `${coverAsset.label} · ${coverAsset.note}`
  }
  if (creationDraftTitleEl) creationDraftTitleEl.value = selected.draftTitle
  if (creationDraftBodyEl) creationDraftBodyEl.value = selected.draftBody
  if (creationCtaInputEl) creationCtaInputEl.value = selected.privateMessageCta
  if (creationTagsInputEl) creationTagsInputEl.value = selected.tags.map(tag => `#${tag}`).join(' ')
  if (creationCoverTextEl) creationCoverTextEl.value = selected.coverText
  updateCreationCounts()
  const dimensions = selected.marketingScore.dimensions || {}
  if (creationScoreStripEl) {
    creationScoreStripEl.innerHTML = [
      ['政策影响', dimensions.policyImpact || 0],
      ['热点热度', dimensions.heat || 0],
      ['申请紧急', dimensions.urgency || 0],
      ['收藏价值', dimensions.saveValue || 0],
      ['可信度', dimensions.credibility || Math.round(selected.credibility * 20)]
    ].map(([label, value]) => `
      <div class="score-tile">
        <span>${escapeHtml(label)}</span>
        <strong>${escapeHtml(value)}</strong>
      </div>
    `).join('')
  }
  if (creationCtaPanelEl) {
    creationCtaPanelEl.innerHTML = `
      <div>
        <span>内容角度</span>
        <strong>${escapeHtml(selected.contentAngle)}</strong>
      </div>
      <div>
        <span>私信引导</span>
        <strong>${escapeHtml(selected.privateMessageCta)}</strong>
      </div>
      <div>
        <span>来源链接</span>
        <a href="${escapeHtml(selected.sourceUrl)}" target="_blank" rel="noreferrer">${escapeHtml(selected.source)}</a>
      </div>
    `
  }
  if (creationChecklistEl) {
    const cover = getCoverReadiness(selected)
    const verification = getVerification(selected.id)
    const checklist = [
      { key: 'cover', label: cover.label, detail: cover.detail },
      { key: 'source', label: '来源已打开', detail: `${selected.source} · 发布前确认原文没有变动` },
      { key: 'facts', label: '事实点已核验', detail: selected.checks[0] || '标题、数据、政策口径已逐条确认' },
      { key: 'risk', label: '风险话术已检查', detail: selected.riskNotes[0] || '不承诺录取、不暗示保签、不攻击学校或政策' }
    ]
    creationChecklistEl.innerHTML = checklist.map(item => `
      <label class="check-row ${verification[item.key] ? 'ready' : 'review'}">
        <input type="checkbox" data-verify-key="${item.key}" ${verification[item.key] ? 'checked' : ''} />
        <div>
          <strong>${escapeHtml(item.label)}</strong>
          <small>${escapeHtml(item.detail)}</small>
        </div>
      </label>
    `).join('')
  }

  document.querySelectorAll('[data-create-id]').forEach(button => {
    button.addEventListener('click', () => {
      state.selectedId = button.dataset.createId
      render()
    })
  })

  creationChecklistEl?.querySelectorAll('[data-verify-key]').forEach(input => {
    input.addEventListener('change', () => {
      updateVerification(selected.id, input.dataset.verifyKey, input.checked)
      render()
    })
  })
}

function renderCalendar() {
  if (!contentCalendarEl) return
  const chosen = getChosenRecommendations()
  contentCalendarEl.innerHTML = chosen.map((rawItem, index) => {
    const item = getWorkingItem(rawItem)
    const plan = getPublishPlan(item.id, index)
    return `
    <div class="calendar-item">
      <span class="calendar-time">${escapeHtml(plan.time)}</span>
      <div>
        <strong>第 ${index + 1} 篇 · 小红书图文 · ${escapeHtml(item.regionLabel)}</strong>
        <small>${escapeHtml(item.draftTitle)} · ${escapeHtml(getCoverReadiness(item).label)}</small>
      </div>
      <span class="badge ${plan.status === '已发布' || plan.status === '已复盘' ? 'badge-ready' : 'badge-review'}">${escapeHtml(plan.status)}</span>
    </div>
  `
  }).join('')
}

function renderPublish() {
  const publishItems = getChosenRecommendations().map(getWorkingItem)
  if (publishSummaryEl) {
    const readyCount = publishItems.filter(item => verificationPercent([item]) === 100).length
    const coverReadyCount = publishItems.filter(item => getCoverReadiness(item).className === 'ready').length
    const publishedCount = publishItems.filter((item, index) => {
      const plan = getPublishPlan(item.id, index)
      return plan.status === '已发布' || plan.status === '已复盘'
    }).length
    publishSummaryEl.innerHTML = `
      <div>
        <span>今日排期</span>
        <strong>${publishItems.length}</strong>
      </div>
      <div>
        <span>已核验</span>
        <strong>${readyCount}</strong>
      </div>
      <div>
        <span>封面就绪</span>
        <strong>${coverReadyCount}</strong>
      </div>
      <div>
        <span>已发布</span>
        <strong>${publishedCount}</strong>
      </div>
    `
  }
  publishTableEl.innerHTML = publishItems.map((item, index) => {
    const plan = getPublishPlan(item.id, index)
    return `
    <div class="publish-row">
      <div>
        <strong>${escapeHtml(item.draftTitle)}</strong>
        <small>${escapeHtml(item.regionLabel)} · ${escapeHtml(item.sourceType)} · ${escapeHtml(item.privateMessageCta)}</small>
      </div>
      <div class="publish-controls">
        <label>
          <span>时间</span>
          <input class="input-field compact-input" type="time" value="${escapeHtml(plan.time.includes(':') ? plan.time : '10:30')}" data-publish-time="${item.id}" />
        </label>
        <label>
          <span>状态</span>
          <select class="input-field compact-input" data-publish-status="${item.id}">
            ${['待复制', '已复制', '已发布', '已复盘'].map(status => `<option value="${status}" ${plan.status === status ? 'selected' : ''}>${status}</option>`).join('')}
          </select>
        </label>
      </div>
      <div class="publish-checks">
        <span>${escapeHtml(getCoverReadiness(item).label)}</span>
        <span>核验 ${verificationPercent([item])}%</span>
      </div>
      <button class="btn-secondary compact" type="button" data-publish-id="${item.id}">打开草稿</button>
    </div>
  `
  }).join('')

  document.querySelectorAll('[data-publish-id]').forEach(button => {
    button.addEventListener('click', () => {
      state.selectedId = button.dataset.publishId
      setView('creation')
      render()
    })
  })
  document.querySelectorAll('[data-publish-time]').forEach(input => {
    input.addEventListener('change', () => {
      updatePublishPlan(input.dataset.publishTime, { time: input.value })
      render()
    })
  })
  document.querySelectorAll('[data-publish-status]').forEach(select => {
    select.addEventListener('change', () => {
      updatePublishPlan(select.dataset.publishStatus, { status: select.value })
      render()
    })
  })

  renderFeedbackList(publishItems)
}

function renderFeedbackList(items = getChosenRecommendations().map(getWorkingItem)) {
  if (!feedbackListEl) return
  const reviewedCount = items.filter(item => {
    const feedback = getFeedback(item.id)
    return Number(feedback.views || 0) || Number(feedback.saves || 0) || Number(feedback.comments || 0) || Number(feedback.dms || 0)
  }).length
  if (feedbackCountEl) feedbackCountEl.textContent = `${reviewedCount} 条已复盘`

  feedbackListEl.innerHTML = items.map(item => {
    const feedback = getFeedback(item.id)
    return `
      <article class="feedback-item">
        <div>
          <strong>${escapeHtml(item.draftTitle)}</strong>
          <small>${escapeHtml(item.regionLabel)} · ${escapeHtml(item.contentAngle)}</small>
        </div>
        <div class="feedback-fields">
          <label><span>浏览</span><input class="input-field compact-input" inputmode="numeric" value="${escapeHtml(feedback.views)}" data-feedback-field="views" data-feedback-id="${item.id}" /></label>
          <label><span>收藏</span><input class="input-field compact-input" inputmode="numeric" value="${escapeHtml(feedback.saves)}" data-feedback-field="saves" data-feedback-id="${item.id}" /></label>
          <label><span>评论</span><input class="input-field compact-input" inputmode="numeric" value="${escapeHtml(feedback.comments)}" data-feedback-field="comments" data-feedback-id="${item.id}" /></label>
          <label><span>私信</span><input class="input-field compact-input" inputmode="numeric" value="${escapeHtml(feedback.dms)}" data-feedback-field="dms" data-feedback-id="${item.id}" /></label>
        </div>
        <input class="input-field feedback-note" value="${escapeHtml(feedback.notes)}" placeholder="复盘备注：哪些标题/封面/CTA 更有效" data-feedback-field="notes" data-feedback-id="${item.id}" />
      </article>
    `
  }).join('')

  feedbackListEl.querySelectorAll('[data-feedback-field]').forEach(input => {
    input.addEventListener('input', () => {
      updateFeedback(input.dataset.feedbackId, { [input.dataset.feedbackField]: input.value })
      renderWorkflowStatus()
      if (feedbackCountEl) {
        const count = items.filter(item => {
          const feedback = getFeedback(item.id)
          return Number(feedback.views || 0) || Number(feedback.saves || 0) || Number(feedback.comments || 0) || Number(feedback.dms || 0)
        }).length
        feedbackCountEl.textContent = `${count} 条已复盘`
      }
    })
  })
}

function renderSources() {
  const sources = sourceStatuses.length
    ? sourceStatuses
    : intelligenceItems.map(item => ({
      id: item.sourceId || item.id,
      name: item.source,
      url: item.sourceUrl,
      region: item.region,
      sourceTypeLabel: item.sourceType,
      trustLevel: item.sourceTrustLevel || 'demo',
      ok: dataMeta.mode === 'real-data',
      skipped: false,
      itemCount: 1,
      message: dataMeta.mode === 'real-data' ? 'ok' : 'demo fallback'
    }))

  document.querySelectorAll('[data-source-filter]').forEach(button => {
    button.classList.toggle('active', button.dataset.sourceFilter === state.sourceFilter)
  })

  const filteredSources = sources.filter(matchesSourceFilter)
  const okCount = sources.filter(source => source.ok).length
  const actionCount = sources.filter(source => !source.ok || source.skipped).length
  const itemCount = sources.reduce((sum, source) => sum + Number(source.itemCount || 0), 0)
  if (sourceSummaryEl) {
    sourceSummaryEl.innerHTML = `
      <div>
        <span>接入源</span>
        <strong>${sources.length}</strong>
      </div>
      <div>
        <span>已跑通</span>
        <strong>${okCount}</strong>
      </div>
      <div>
        <span>采集条目</span>
        <strong>${itemCount}</strong>
      </div>
      <div>
        <span>需处理</span>
        <strong>${actionCount}</strong>
      </div>
    `
  }

  const groups = [
    { id: 'failed', label: '需处理源', hint: '失败、跳过或缺少凭证的连接' },
    { id: 'official', label: '官方与专家源', hint: '政府、官方指南、专家机构' },
    { id: 'school', label: '院校源', hint: '大学招生、国际学生和项目页面' },
    { id: 'news', label: '新闻发现源', hint: 'RSS、Google News 和新闻线索' },
    { id: 'social', label: '社媒与手动源', hint: 'X.com、手动社媒收件箱和竞品录入' },
    { id: 'other', label: '其他来源', hint: '未归类数据源' }
  ]

  const groupedHtml = groups.map(group => {
    const groupSources = filteredSources.filter(source => getSourceGroup(source) === group.id)
    if (!groupSources.length) return ''
    return `
      <section class="source-group">
        <div class="source-group-header">
          <div>
            <h3>${escapeHtml(group.label)}</h3>
            <p>${escapeHtml(group.hint)}</p>
          </div>
          <span>${groupSources.length} 个</span>
        </div>
        <div class="source-group-list">
          ${groupSources.map(source => {
            const fix = sourceFixHint(source)
            const needsAction = !source.ok || source.skipped
            return `
            <article class="source-item">
              <div>
                <div class="source-item-tags">
                  <span class="mini-tag">${escapeHtml(source.region === 'HK' ? '香港' : source.region === 'UK' ? '英国' : source.region === 'SG' ? '新加坡' : source.region || '全部')}</span>
                  <span class="mini-tag">${escapeHtml(sourceTrustLabel(source))}</span>
                </div>
                <h3>${escapeHtml(source.name)}</h3>
                <a href="${escapeHtml(source.url || '#')}" target="_blank" rel="noreferrer">${escapeHtml(source.url || '-')}</a>
              </div>
              <div class="source-item-footer">
                <span>${escapeHtml(source.sourceTypeLabel || source.type || '数据源')}</span>
                <strong>${source.ok ? `已获取 ${source.itemCount || 0} 条` : source.skipped ? '待配置 Key' : escapeHtml(source.message || '连接失败')}</strong>
              </div>
              ${needsAction ? `
                <div class="source-fix">
                  <small>${escapeHtml(fix.detail)}</small>
                  <button class="btn-ghost compact" type="button" data-copy-source-fix="${escapeHtml(source.id)}">${escapeHtml(fix.label)}</button>
                </div>
              ` : ''}
            </article>
          `
          }).join('')}
        </div>
      </section>
    `
  }).join('')

  sourcesGridEl.innerHTML = groupedHtml || '<p class="empty-note">当前筛选没有数据源。</p>'

  sourcesGridEl.querySelectorAll('[data-copy-source-fix]').forEach(button => {
    button.addEventListener('click', async () => {
      const source = sources.find(candidate => candidate.id === button.dataset.copySourceFix)
      const fix = sourceFixHint(source || {})
      try {
        await navigator.clipboard.writeText(fix.copy)
        showToast('已复制排查信息')
      } catch {
        showToast(fix.copy || '请打开源链接排查')
      }
    })
  })
}

function renderCoverStyleControl() {
  coverStyleControlEl?.querySelectorAll('[data-cover-style]').forEach(button => {
    button.classList.toggle('active', button.dataset.coverStyle === state.coverStyle)
  })
  creationCoverStyleControlEl?.querySelectorAll('[data-creation-cover-style]').forEach(button => {
    button.classList.toggle('active', button.dataset.creationCoverStyle === state.coverStyle)
  })
}

function loadCompetitorNotes() {
  try {
    const parsed = JSON.parse(localStorage.getItem(competitorStorageKey) || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveCompetitorNotes() {
  localStorage.setItem(competitorStorageKey, JSON.stringify(competitorNotes.slice(0, 50)))
}

function safeHref(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : '#'
  } catch {
    return '#'
  }
}

function renderCompetitors() {
  if (!competitorListEl) return
  if (competitorCountEl) competitorCountEl.textContent = `${competitorNotes.length} 条`

  if (!competitorNotes.length) {
    competitorListEl.innerHTML = '<p class="empty-note">还没有保存竞品笔记。</p>'
    return
  }

  competitorListEl.innerHTML = competitorNotes.map(note => `
    <div class="competitor-item">
      <div>
        <strong>${escapeHtml(note.title)}</strong>
        <a href="${escapeHtml(safeHref(note.url))}" target="_blank" rel="noreferrer">${escapeHtml(note.url || '未填写链接')}</a>
      </div>
      <button class="btn-ghost compact" type="button" data-delete-competitor="${note.id}">删除</button>
    </div>
  `).join('')

  competitorListEl.querySelectorAll('[data-delete-competitor]').forEach(button => {
    button.addEventListener('click', () => {
      competitorNotes = competitorNotes.filter(note => note.id !== button.dataset.deleteCompetitor)
      saveCompetitorNotes()
      renderCompetitors()
    })
  })
}

function parseTagsInput(value) {
  return String(value)
    .split(/[\s,，#]+/)
    .map(tag => tag.trim())
    .filter(Boolean)
    .slice(0, 10)
}

function updateCounts() {
  titleCountEl.textContent = `${draftTitleEl.value.length} / ${draftTitleEl.maxLength}`
  bodyCountEl.textContent = `${draftBodyEl.value.length} / ${draftBodyEl.maxLength || 1000}`
  coverCountEl.textContent = `${coverTextEl.value.length} / ${coverTextEl.maxLength}`
}

function updateCreationCounts() {
  if (creationTitleCountEl && creationDraftTitleEl) {
    creationTitleCountEl.textContent = `${creationDraftTitleEl.value.length} / ${creationDraftTitleEl.maxLength}`
  }
  if (creationBodyCountEl && creationDraftBodyEl) {
    creationBodyCountEl.textContent = `${creationDraftBodyEl.value.length} / ${creationDraftBodyEl.maxLength || 1000}`
  }
  if (creationCoverCountEl && creationCoverTextEl) {
    creationCoverCountEl.textContent = `${creationCoverTextEl.value.length} / ${creationCoverTextEl.maxLength}`
  }
}

function saveMainDraftFields() {
  const item = getSelectedItem()
  updateDraftOverride(item.id, {
    draftTitle: draftTitleEl.value,
    draftBody: draftBodyEl.value,
    coverText: coverTextEl.value
  })
  updateCounts()
  applyCoverArt(coverArtEl, getSelectedItem())
  renderWorkflowStatus()
}

function saveCreationDraftFields() {
  const item = getSelectedItem()
  updateDraftOverride(item.id, {
    draftTitle: creationDraftTitleEl?.value || item.draftTitle,
    draftBody: creationDraftBodyEl?.value || item.draftBody,
    coverText: creationCoverTextEl?.value || item.coverText,
    privateMessageCta: creationCtaInputEl?.value || item.privateMessageCta,
    tags: parseTagsInput(creationTagsInputEl?.value || item.tags.join(' '))
  })
  const working = getSelectedItem()
  updateCreationCounts()
  applyCoverArt(creationCoverEl, working)
  if (creationCoverSourceEl) {
    const coverAsset = getCoverAsset(working)
    creationCoverSourceEl.textContent = `${coverAsset.label} · ${coverAsset.note}`
  }
  renderWorkflowStatus()
}

function setFilter(filter) {
  state.filter = filter
  const visible = getVisibleItems()
  if (!visible.some(item => item.id === state.selectedId)) {
    state.selectedId = visible[0]?.id || intelligenceItems[0].id
  }
  document.querySelectorAll('[data-filter]').forEach(button => {
    button.classList.toggle('active', button.dataset.filter === filter)
  })
  render()
}

function setSourceFilter(filter) {
  state.sourceFilter = filter
  renderSources()
}

function setView(view) {
  state.view = view
  document.body.dataset.activeView = view
  navLinks.forEach(button => {
    button.classList.toggle('active', button.dataset.view === view)
  })
  viewPanels.forEach(panel => {
    panel.classList.toggle('active', panel.dataset.viewPanel === view)
  })
  renderWorkflowStatus()
}

function buildDraftText() {
  const item = getSelectedItem()
  const coverAsset = getCoverAsset(item, state.coverStyle)
  const tags = item.tags.map(tag => `#${tag}`).join(' ')
  const verification = getVerification(item.id)
  const plan = getPublishPlan(item.id)
  return [
    `标题：${item.draftTitle}`,
    '',
    item.draftBody,
    '',
    `话题：${tags}`,
    `封面文案：${item.coverText}`,
    `封面风格：${coverStyleLabels[state.coverStyle] || state.coverStyle}`,
    `封面来源：${coverAsset.label}；${coverAsset.note}`,
    coverAsset.imageUrl ? `封面图片：${coverAsset.imageUrl}` : '',
    `营销评分：${item.marketingScore.total} / 100（${item.marketingScore.level}）`,
    `内容角度：${item.contentAngle}`,
    `私信引导：${item.privateMessageCta}`,
    `排期：${plan.channel} ${plan.time} ${plan.status}`,
    '',
    `来源：${item.source}`,
    `来源链接：${item.sourceUrl}`,
    `事实核验：${item.checks.join('；')}`,
    `人工核验：封面 ${verification.cover ? '已确认' : '待确认'}；来源 ${verification.source ? '已确认' : '待确认'}；事实 ${verification.facts ? '已确认' : '待确认'}；风险话术 ${verification.risk ? '已确认' : '待确认'}`
  ].join('\n')
}

async function copyDraft() {
  const text = buildDraftText()
  try {
    await navigator.clipboard.writeText(text)
    showToast('文案已复制')
  } catch {
    showToast('当前浏览器不支持直接复制')
  }
}

function exportPack() {
  const item = getSelectedItem()
  const content = buildDraftText()
  const file = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(file)
  const link = document.createElement('a')
  link.href = url
  link.download = `${item.region.toLowerCase()}-xiaohongshu-pack-${item.id}.txt`
  document.body.append(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
  showToast('发布包已导出')
}

async function copyCoverAsset() {
  const item = getSelectedItem()
  const coverAsset = getCoverAsset(item)
  const text = coverAsset.imageUrl
    ? coverAsset.imageUrl
    : [
      `封面风格：${coverStyleLabels[state.coverStyle] || state.coverStyle}`,
      `封面文案：${item.coverText}`,
      `画面方向：${coverAsset.note}`,
      `内容标题：${item.draftTitle}`,
      `来源：${item.source}`
    ].join('\n')
  try {
    await navigator.clipboard.writeText(text)
    showToast(coverAsset.imageUrl ? '来源图链接已复制' : '封面提示已复制')
  } catch {
    showToast('当前浏览器不支持直接复制')
  }
}

function exportCoverBrief() {
  const item = getSelectedItem()
  const coverAsset = getCoverAsset(item)
  const content = [
    `封面文案：${item.coverText}`,
    `封面风格：${coverStyleLabels[state.coverStyle] || state.coverStyle}`,
    `素材状态：${coverAsset.label}`,
    `处理建议：${coverAsset.note}`,
    coverAsset.imageUrl ? `来源图片：${coverAsset.imageUrl}` : '',
    `标题：${item.draftTitle}`,
    `来源：${item.source}`,
    `来源链接：${item.sourceUrl}`
  ].filter(Boolean).join('\n')
  const file = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(file)
  const link = document.createElement('a')
  link.href = url
  link.download = `cover-brief-${item.id}.txt`
  document.body.append(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
  showToast('封面 brief 已导出')
}

function showToast(message) {
  toastEl.textContent = message
  toastEl.classList.add('show')
  clearTimeout(showToast.timer)
  showToast.timer = setTimeout(() => toastEl.classList.remove('show'), 1800)
}

function render() {
  updateIntegrationStatus()
  updateStats()
  renderWorkflowStatus()
  renderCoverStyleControl()
  renderDailyRecommendations()
  renderBackupTopics()
  renderList()
  renderDetail()
  renderCreation()
  renderCalendar()
  renderPublish()
  renderSources()
  renderCompetitors()
}

async function refreshData() {
  showToast('正在采集真实数据...')
  try {
    const response = await fetch('/api/collect/run', {
      method: 'POST',
      cache: 'no-store'
    })
    if (!response.ok) throw new Error(`${response.status}`)
    const payload = await response.json()
    applyPayload(payload, '真实数据已更新')
  } catch {
    await loadIntelligence()
    showToast('已读取本地 JSON；用 npm run serve 可触发在线采集')
  }
}

navLinks.forEach(button => {
  button.addEventListener('click', () => setView(button.dataset.view))
})

document.querySelectorAll('[data-workflow-view]').forEach(button => {
  button.addEventListener('click', () => setView(button.dataset.workflowView))
})

document.querySelectorAll('[data-view-shortcut]').forEach(button => {
  button.addEventListener('click', () => setView(button.dataset.viewShortcut))
})

document.querySelectorAll('[data-filter]').forEach(button => {
  button.addEventListener('click', () => setFilter(button.dataset.filter))
})

document.querySelectorAll('[data-source-filter]').forEach(button => {
  button.addEventListener('click', () => setSourceFilter(button.dataset.sourceFilter))
})

draftTitleEl.addEventListener('input', saveMainDraftFields)
draftBodyEl.addEventListener('input', saveMainDraftFields)
coverTextEl.addEventListener('input', saveMainDraftFields)
coverStyleControlEl?.addEventListener('click', event => {
  const button = event.target.closest('[data-cover-style]')
  if (!button) return
  state.coverStyle = button.dataset.coverStyle
  localStorage.setItem('study-agent-cover-style', state.coverStyle)
  render()
})
creationCoverStyleControlEl?.addEventListener('click', event => {
  const button = event.target.closest('[data-creation-cover-style]')
  if (!button) return
  state.coverStyle = button.dataset.creationCoverStyle
  localStorage.setItem('study-agent-cover-style', state.coverStyle)
  render()
})
;[creationDraftTitleEl, creationDraftBodyEl, creationCtaInputEl, creationTagsInputEl, creationCoverTextEl]
  .filter(Boolean)
  .forEach(input => input.addEventListener('input', saveCreationDraftFields))
document.querySelector('#copyButton').addEventListener('click', copyDraft)
document.querySelector('#exportButton').addEventListener('click', exportPack)
document.querySelector('#creationCopyButton')?.addEventListener('click', copyDraft)
document.querySelector('#creationExportButton')?.addEventListener('click', exportPack)
document.querySelector('#copyCoverAssetButton')?.addEventListener('click', copyCoverAsset)
document.querySelector('#exportCoverBriefButton')?.addEventListener('click', exportCoverBrief)
document.querySelector('#refreshButton').addEventListener('click', refreshData)
document.querySelector('#jumpDraftButton').addEventListener('click', () => setView('intelligence'))
document.querySelector('#testSourcesButton').addEventListener('click', async () => {
  try {
    const response = await fetch('/api/health', { cache: 'no-store' })
    if (!response.ok) throw new Error(`${response.status}`)
    const health = await response.json()
    showToast(health.ok ? 'Node 服务已连接，可触发真实采集' : '服务异常')
  } catch {
    showToast('当前是静态文件模式；运行 npm run serve 后可测试连接')
  }
})

competitorFormEl?.addEventListener('submit', event => {
  event.preventDefault()
  const title = competitorTitleEl.value.trim()
  const url = competitorUrlEl.value.trim()
  if (!title) {
    showToast('请先填写竞品标题')
    return
  }
  competitorNotes.unshift({
    id: `manual-${Date.now()}`,
    title,
    url,
    createdAt: new Date().toISOString()
  })
  saveCompetitorNotes()
  competitorTitleEl.value = ''
  competitorUrlEl.value = ''
  renderCompetitors()
  showToast('竞品笔记已保存')
})

document.body.dataset.activeView = state.view
intelligenceItems = fallbackIntelligenceItems.map(normalizeItem)
syncDefaultRecommendations()
render()
loadIntelligence()
