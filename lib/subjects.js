// ============================================================================
//  司南 · 主体类型 —— 一套骨架，四种类型模板
//  实体门店 / 电商店铺 / 品牌企业 / 个人IP，每种保持细分深度与第一人称视角。
//  字段 schema 会随 DNA 一起导出（subjectMeta），员工侧按 schema 渲染，
//  将来新增类型，员工零改动。
// ============================================================================

// kind: 'text' 单行 | 'list' 多行列表 | 'long' 大段文本
// half: true 时在表单里占半宽
export const SUBJECT_TYPES = {
  store: {
    id: 'store', emoji: '🏪', name: '实体门店',
    desc: '餐饮 / 美业 / 零售等线下到店生意',
    firstPerson: '你是这家店的老板/店长本人，以第一人称「我 / 我们店」发声，像老板自己在经营账号。',
    recognizeHint: '门头照、菜单、点评截图',
    fields: [
      { key: 'name', label: '店名', placeholder: '招牌上的正式名称', half: true },
      { key: 'category', label: '品类', placeholder: '如 兰州牛肉面 / 咖啡馆', half: true },
      { key: 'city', label: '城市', placeholder: '如 苏州', half: true },
      { key: 'area', label: '商圈/地址', placeholder: '至少到街道或商圈', half: true },
      { key: 'perCapita', label: '人均', placeholder: '如 25元', half: true },
      { key: 'hours', label: '营业时间', placeholder: '如 10:00-22:00', half: true },
      { key: 'persona', label: '老板人设（一句话）', placeholder: '如 在苏州开店的兰州人，做正宗牛大' },
      { key: 'signatures', label: '真实招牌（每行一个，带真实细节）', placeholder: '汤每天凌晨现熬\n牛肉现切\n面分九种粗细', kind: 'list' },
      { key: 'differentiators', label: '真实差异点（和同行不一样的地方）', placeholder: '老板亲自拉面\n不用浓汤宝', kind: 'list' },
      { key: 'highlights', label: '可拍的真实亮点/故事', placeholder: '凌晨四点熬汤的过程\n二十年老手艺', kind: 'list' },
      { key: 'landing', label: '引流/到店信息', placeholder: '地址定位、预约/排队方式、私域入口' },
      { key: 'taboo', label: '⚠️ 禁止夸大的提醒（如有）', placeholder: "如 别写'全城第一''最好吃'" },
    ],
  },

  ecom: {
    id: 'ecom', emoji: '🛒', name: '电商店铺',
    desc: '淘宝 / 抖店 / 拼多多等线上卖货',
    firstPerson: '你是这家店铺的掌柜/主理人本人，以第一人称「我 / 我们家」发声，像掌柜自己在运营账号。',
    recognizeHint: '店铺首页、商品详情页、宝贝截图',
    fields: [
      { key: 'name', label: '店铺名', placeholder: '平台上的店铺名称', half: true },
      { key: 'category', label: '主营类目', placeholder: '如 女装 / 零食 / 数码配件', half: true },
      { key: 'platform', label: '主营平台', placeholder: '如 淘宝 / 抖店 / 拼多多', half: true },
      { key: 'priceBand', label: '价格带', placeholder: '如 客单 50-150元', half: true },
      { key: 'shipping', label: '发货与售后承诺', placeholder: '如 48小时发货、7天无理由、运费险', half: true },
      { key: 'persona', label: '掌柜/主理人人设（一句话）', placeholder: '如 做了8年源头工厂的宝妈掌柜' },
      { key: 'signatures', label: '主推产品（每行一个，带真实卖点）', placeholder: '主打A款：真实卖点\n主打B款：真实卖点', kind: 'list' },
      { key: 'differentiators', label: '真实差异点（供应链/工艺/服务）', placeholder: '源头工厂直发\n面料检测报告齐全', kind: 'list' },
      { key: 'highlights', label: '可拍可晒的真实素材点', placeholder: '工厂生产线实拍\n打包发货现场', kind: 'list' },
      { key: 'landing', label: '转化落点', placeholder: '商品链接 / 直播间 / 店铺关注 / 粉丝群' },
      { key: 'taboo', label: '⚠️ 禁止夸大的提醒（如有）', placeholder: "如 别写'全网最低''绝对正品'" },
    ],
  },

  brand: {
    id: 'brand', emoji: '🏢', name: '品牌/企业',
    desc: '有产品线的品牌方或公司',
    firstPerson: '你是品牌官方内容负责人，以品牌第一人称「我们」发声，代表品牌但保持真人温度、不打官腔。',
    recognizeHint: '官网截图、产品图、品牌介绍页',
    fields: [
      { key: 'name', label: '品牌名', placeholder: '对外使用的品牌名称', half: true },
      { key: 'category', label: '行业赛道', placeholder: '如 新消费茶饮 / 智能硬件 / SaaS', half: true },
      { key: 'market', label: '主要市场/人群', placeholder: '如 一二线年轻女性 / 中小企业主', half: true },
      { key: 'priceBand', label: '价格定位', placeholder: '如 中高端 / 性价比', half: true },
      { key: 'persona', label: '品牌一句话主张', placeholder: '如 让每个家庭喝上一杯放心好茶' },
      { key: 'story', label: '品牌故事/背景', placeholder: '创始背景、为什么做这个品牌、关键节点（真实）', kind: 'long' },
      { key: 'signatures', label: '核心产品线（每行一个，带真实卖点）', placeholder: '产品线A：真实卖点\n产品线B：真实卖点', kind: 'list' },
      { key: 'differentiators', label: '差异化优势（技术/供应链/理念）', placeholder: '自有专利技术\n全链路自建供应链', kind: 'list' },
      { key: 'highlights', label: '可展示的真实素材点', placeholder: '实验室/工厂实拍\n用户真实案例', kind: 'list' },
      { key: 'landing', label: '转化落点', placeholder: '官网 / 私域 / 线下渠道 / 咨询入口' },
      { key: 'taboo', label: '⚠️ 禁止夸大与合规提醒（如有）', placeholder: "如 别提'行业第一'、功效类需合规表述" },
    ],
  },

  personal: {
    id: 'personal', emoji: '👤', name: '个人IP/账号',
    desc: '博主 / 专家 / 主理人的个人号',
    firstPerson: '你就是这个人本人，以「我」的口吻发声，讲自己的真实经历和观点，绝不虚构人设。',
    recognizeHint: '主页截图、个人简介、代表作截图',
    fields: [
      { key: 'name', label: '账号名/称呼', placeholder: '账号名或大家怎么称呼你', half: true },
      { key: 'category', label: '内容领域', placeholder: '如 职场成长 / 母婴育儿 / 美食探店', half: true },
      { key: 'identity', label: '真实身份/职业', placeholder: '如 10年HR / 三甲医院营养师', half: true },
      { key: 'persona', label: '人设一句话', placeholder: '如 说人话的理财老兵，只讲能落地的' },
      { key: 'story', label: '个人经历/背景', placeholder: '真实经历、转折点、为什么做这个账号', kind: 'long' },
      { key: 'signatures', label: '代表作/成绩（每行一个，须真实）', placeholder: '帮300+学员上岸\n出版过《xxx》', kind: 'list' },
      { key: 'differentiators', label: '独特之处（和同领域博主的差异）', placeholder: '只讲亲测过的方法\n敢说行业大实话', kind: 'list' },
      { key: 'highlights', label: '可分享的真实故事/素材', placeholder: '踩过的坑\n印象最深的案例', kind: 'list' },
      { key: 'landing', label: '转化落点', placeholder: '关注 / 私信关键词 / 主页服务 / 社群' },
      { key: 'taboo', label: '⚠️ 禁止夸大的提醒（如有）', placeholder: "如 别写'保证''百分百'、资质类如实" },
    ],
  },
};

export const SUBJECT_LIST = Object.values(SUBJECT_TYPES);

export function getSubject(id) {
  return SUBJECT_TYPES[id] || SUBJECT_TYPES.store;
}

// 精简版 schema（随 DNA 导出给员工侧渲染用）
export function subjectMetaOf(id) {
  const st = getSubject(id);
  return {
    id: st.id,
    name: st.name,
    emoji: st.emoji,
    firstPerson: st.firstPerson,
    fields: st.fields.map((f) => ({ key: f.key, label: f.label.replace(/（.*?）/g, ''), list: f.kind === 'list' })),
  };
}
