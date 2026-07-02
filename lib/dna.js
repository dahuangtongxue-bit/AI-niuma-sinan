// ============================================================================
//  司南 · 店铺 DNA —— 要广播给阿桃/阿文/阿抖的统一配置
//  = 店铺真相(profile/事实层) + 灵魂(soul/调性人格层)
// ============================================================================
import { tonesToInstruction, PERSONAS } from './soul';
import { subjectMetaOf } from './subjects';

// DNA 完整结构
export function buildDNA({ profile, personaId, tones, subjectType }) {
  const st = subjectType || 'store';
  return {
    _type: 'shop-dna',
    _version: 2,
    _updatedAt: new Date().toISOString(),
    // —— 主体类型：实体门店/电商/品牌/个人IP（字段schema随DNA走，员工侧按此渲染）——
    subjectType: st,
    subjectMeta: subjectMetaOf(st),
    // —— 事实层：店铺真相（所有员工共享、必须真实）——
    // 事实层直接透传（不同类型字段不同：如电商有 platform/shipping、品牌有 story）
    profile: { ...(profile || {}) },
    // —— 灵魂层：品牌调性人格（所有员工共享）——
    soul: {
      personaId: personaId || 'rexin',
      personaName: PERSONAS[personaId]?.name || '热心老板',
      tones: tones || PERSONAS[personaId]?.tones || PERSONAS.rexin.tones,
      // 预先翻译好的调性指令，员工直接拼进 prompt 即可
      instruction: tonesToInstruction(personaId, tones),
    },
  };
}

// 员工侧：把 DNA 翻译成可直接拼进 prompt 的一段文本
export function dnaToPromptBlock(dna, { platformTone } = {}) {
  if (!dna) return '';
  const p = dna.profile || {};
  const s = dna.soul || {};
  const meta = dna.subjectMeta;
  const parts = [];
  if (meta && Array.isArray(meta.fields) && meta.fields.length) {
    // —— v2：按主体类型的字段 schema 渲染（实体店/电商/品牌/个人IP 各有其字段与身份视角）——
    parts.push(`【品牌DNA · ${meta.name || '主体'}真相（只能讲这些真实信息，绝不编造）】`);
    if (meta.firstPerson) parts.push(`【身份视角】${meta.firstPerson}`);
    for (const f of meta.fields) {
      const v = p[f.key];
      if (v == null || v === '' || (Array.isArray(v) && !v.length)) continue;
      parts.push(`${f.label}：${Array.isArray(v) ? v.join('、') : v}`);
    }
    parts.push('');
    parts.push(s.instruction || '');
    if (platformTone) parts.push(`\n【本平台微调】${platformTone}`);
    return parts.join('\n');
  }
  // —— v1 老DNA兼容：按原有实体店字段渲染 ——
  parts.push('【店铺真相（只能讲这些真实信息，绝不编造）】');
  if (p.name) parts.push(`店名：${p.name}`);
  if (p.category) parts.push(`品类：${p.category}`);
  if (p.city || p.area) parts.push(`位置：${[p.city, p.area].filter(Boolean).join(' ')}`);
  if (p.persona) parts.push(`老板人设：${p.persona}`);
  if (p.perCapita) parts.push(`人均：${p.perCapita}`);
  if ((p.signatures || []).length) parts.push(`真实招牌：${p.signatures.join('、')}`);
  if ((p.differentiators || []).length) parts.push(`真实差异点：${p.differentiators.join('、')}`);
  if ((p.highlights || []).length) parts.push(`可拍亮点：${p.highlights.join('、')}`);
  if (p.landing) parts.push(`引流/到店：${p.landing}`);
  if (p.taboo) parts.push(`⚠️禁止夸大：${p.taboo}`);
  parts.push('');
  parts.push(s.instruction || '');
  if (platformTone) parts.push(`\n【本平台微调】${platformTone}`);
  return parts.join('\n');
}

// 各平台在共享人格基础上的"微调"建议（员工侧默认值，可改）
export const PLATFORM_TWEAKS = {
  douyin:   '抖音节奏快、更外放，钩子要狠，前3秒抓人；可比全局再活泼一点。',
  xiaohongshu: '小红书重真诚分享和氛围感，标题带情绪、正文像闺蜜安利；营销感收一点。',
  gongzhonghao: '公众号沉稳、可长可深，娓娓道来；比全局再稳重克制一点。',
};
