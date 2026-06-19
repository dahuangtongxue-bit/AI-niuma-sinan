// ============================================================================
//  司南 · 店铺 DNA —— 要广播给阿桃/阿文/阿抖的统一配置
//  = 店铺真相(profile/事实层) + 灵魂(soul/调性人格层)
// ============================================================================
import { tonesToInstruction, PERSONAS } from './soul';

// DNA 完整结构
export function buildDNA({ profile, personaId, tones }) {
  return {
    _type: 'shop-dna',
    _version: 1,
    _updatedAt: new Date().toISOString(),
    // —— 事实层：店铺真相（所有员工共享、必须真实）——
    profile: {
      name: profile.name || '',
      category: profile.category || '',
      city: profile.city || '',
      area: profile.area || '',
      persona: profile.persona || '',      // 老板/品牌一句话人设
      perCapita: profile.perCapita || '',
      hours: profile.hours || '',
      signatures: profile.signatures || [], // 真实招牌
      differentiators: profile.differentiators || [], // 真实差异点
      highlights: profile.highlights || [], // 可拍的真实亮点
      landing: profile.landing || '',       // 引流/到店信息
      taboo: profile.taboo || '',           // 禁止夸大的提醒
    },
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
  const parts = [];
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
