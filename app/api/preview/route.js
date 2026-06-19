export const runtime = 'edge';
import { PERSONAS, tonesToInstruction } from '@/lib/soul';

export async function POST(req) {
  try {
    const { personaId, tones } = await req.json();
    const base = (process.env.LLM_API_BASE || '').replace(/\/+$/, '');
    const key = process.env.LLM_API_KEY;
    const model = process.env.LLM_MODEL;
    if (!base || !key || !model) return Response.json({ error: '缺少 LLM_API_BASE/KEY/MODEL' }, { status: 500 });
    const instruction = tonesToInstruction(personaId, tones);
    const sys = `你是一家餐饮店的内容运营。按下面的人格和调性，写一句开场文案示例（用"牛肉面/牛肉煲"做例子），让老板感受这个调性写出来什么味道。只输出那一句文案，不超过40字，不要解释。\n\n${instruction}`;
    const up = await fetch(`${base}/chat/completions`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model, messages: [{ role: 'system', content: sys }, { role: 'user', content: '写一句' }], temperature: 0.9, max_tokens: 120, stream: false }),
    });
    if (!up.ok) { const t = await up.text(); return Response.json({ error: `模型 ${up.status}: ${t.slice(0, 150)}` }, { status: 502 }); }
    const d = await up.json();
    let txt = (d.choices?.[0]?.message?.content || '').toString();
    if (Array.isArray(txt)) txt = txt.map(x => x.text || '').join('');
    return Response.json({ text: txt.replace(/```/g, '').replace(/^["「]|["」]$/g, '').trim() });
  } catch (e) {
    return Response.json({ error: String(e.message || e).slice(0, 150) }, { status: 500 });
  }
}
