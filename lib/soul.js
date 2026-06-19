// ============================================================================
//  司南 · 店铺灵魂内核（Soul）数据模型
//  这是要广播给阿桃/阿文/阿抖的"店铺DNA"中——品牌调性/人格那一层
// ============================================================================

// —— 两个对"内容调性"最关键的维度 ——
//   energy: 0(内敛/沉稳) ~ 100(外放/热情)
//   feel:   0(理性/讲门道) ~ 100(感性/带情绪)
// 4 种店铺人格 = 两维度交叉（借 MBTI 的"神"，规避其商标/版权，维度专为店铺内容设计）

export const PERSONAS = {
  hangjia: {
    id: 'hangjia', name: '行家掌柜', emoji: '🎯',
    energy: 75, feel: 35,
    desc: '专业又会说，边吆喝边给你讲门道',
    voice: '热情但有干货，爱科普、爱亮专业细节，让你觉得"这老板懂行"',
    sample: '别小看这碗面——汤是凌晨四点吊的牛骨清汤，面是手工九种粗细，今天给你讲讲门道。',
    // 这套人格对应的调性预设
    tones: { sincere: 55, warm: 60, plain: 70, local: 55, fun: 35 },
  },
  rexin: {
    id: 'rexin', name: '热心老板', emoji: '🔥',
    energy: 85, feel: 80,
    desc: '情绪饱满、亲切吆喝、特别接地气',
    voice: '像热情的邻家老板，情绪外放、说话带劲、爱跟你唠，吆喝感强',
    sample: '家人们！今天这锅牛肉煲我是真没忍住，咕嘟咕嘟冒泡的时候我口水都下来了，必须给你们整一个！',
    tones: { sincere: 45, warm: 90, plain: 35, local: 70, fun: 55 },
  },
  jiangren: {
    id: 'jiangren', name: '匠人师傅', emoji: '🛠',
    energy: 30, feel: 30,
    desc: '话不多，用细节和专业说话',
    voice: '沉稳克制，不吆喝，靠真实的工艺细节和质感打动人，有匠气',
    sample: '一碗汤，凌晨四点开始熬。牛骨、白萝卜，八小时。不需要多说，喝一口就知道。',
    tones: { sincere: 75, warm: 45, plain: 80, local: 40, fun: 15 },
  },
  wenrou: {
    id: 'wenrou', name: '温柔店主', emoji: '🍵',
    energy: 30, feel: 80,
    desc: '安静温暖，像朋友轻声跟你分享',
    voice: '温柔、有温度、像朋友轻声说话，重感受和氛围，不喧闹',
    sample: '降温了，特别想给你煮一碗热乎的。慢慢熬的汤，暖手也暖胃，等你来。',
    tones: { sincere: 70, warm: 85, plain: 55, local: 45, fun: 25 },
  },
};

// —— 可微调的调性滑杆（每条 0~100），藏在人格卡后面做精修 ——
export const TONE_DIMS = [
  { key: 'sincere', name: '真诚 ↔ 营销', left: '纯分享', right: '强种草', hint: '越高越爱推销引导' },
  { key: 'warm',    name: '专业 ↔ 亲切', left: '讲门道', right: '唠家常', hint: '越高越像邻居唠嗑' },
  { key: 'plain',   name: '夸张 ↔ 平实', left: '情绪满', right: '不吹牛', hint: '越高越克制（受广告法约束建议偏高）' },
  { key: 'local',   name: '普适 ↔ 本地', left: '谁都懂', right: '本地味', hint: '越高越多本地梗' },
  { key: 'fun',     name: '正经 ↔ 玩梗', left: '稳重', right: '整活', hint: '越高越爱玩梗' },
];

// 选定人格 → 得到该人格的调性预设
export function tonesFromPersona(personaId) {
  return { ...(PERSONAS[personaId]?.tones || PERSONAS.rexin.tones) };
}

// 把调性数值翻译成给文案模型的"调性指令"（这段会进所有员工的 prompt）
export function tonesToInstruction(personaId, tones) {
  const p = PERSONAS[personaId] || PERSONAS.rexin;
  const t = tones || p.tones;
  const lines = [];
  lines.push(`【店铺人格】${p.emoji} ${p.name}——${p.voice}`);
  // 把每个维度数值翻译成可执行的语气指令
  const desc = (v, lo, mid, hi) => v <= 33 ? lo : v <= 66 ? mid : hi;
  lines.push(`【说话调性】`);
  lines.push(`· ${desc(t.sincere, '基本不推销，纯粹分享', '适度引导到店', '明确种草、强引导行动')}`);
  lines.push(`· ${desc(t.warm, '专业口吻、讲门道为主', '专业里带亲切', '像邻居唠嗑，亲切随意')}`);
  lines.push(`· ${desc(t.plain, '情绪可以饱满外放', '有情绪但不过度', '克制平实，绝不夸大（不说最/第一）')}`);
  lines.push(`· ${desc(t.local, '尽量普适、谁都看得懂', '适度本地特色', '多用本地梗和方言味')}`);
  lines.push(`· ${desc(t.fun, '正经稳重，少玩梗', '偶尔玩梗活跃', '爱整活、玩梗、网感强')}`);
  return lines.join('\n');
}

// 根据店铺特征自动推荐人格（建档时用，可被用户改）
export function recommendPersona({ perCapita, category, signals }) {
  // signals 是图片识别/档案里提取的特征关键词
  const s = (signals || []).join(' ') + ' ' + (category || '');
  const price = parseInt(String(perCapita).replace(/[^0-9]/g, '')) || 0;
  // 高客单/精致 → 匠人；家常/亲民 → 热心；专业感强 → 行家；温馨/治愈 → 温柔
  // 高客单/精致 → 匠人师傅
  if (/精致|高端|讲究|摆盘|主厨|私房/.test(s) || price >= 150) return 'jiangren';
  // 专业感强/老字号 → 行家掌柜
  if (/专业|工艺|老字号|传承|秘方|手艺/.test(s)) return 'hangjia';
  // 温馨治愈文艺（且非家常吆喝型）→ 温柔店主
  if (/温馨|治愈|文艺|静谧|手作|甜品|咖啡|茶/.test(s) && !/家常|亲民|大份|实惠/.test(s)) return 'wenrou';
  // 默认：家常亲民小店最多 → 热心老板
  return 'rexin';
}
