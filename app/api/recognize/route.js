export const runtime = 'edge';
import { getSubject } from '@/lib/subjects';

// 按主体类型动态生成字段说明（实体店/电商/品牌/个人IP 各有其字段）
function fieldsOf(subjectType) {
  const st = getSubject(subjectType || 'store');
  const lines = st.fields.map((f) => {
    const label = f.label.replace(/（.*?）/g, '');
    return f.kind === 'list' ? `"${f.key}":["${label}1(带真实细节)","${label}2"]` : `"${f.key}":"${label}"`;
  });
  return { st, fields: '{\n  ' + lines.join(',\n  ') + '\n}' };
}

export async function POST(req) {
  try {
    const { images, texts, subjectType } = await req.json();
    const base = (process.env.VISION_API_BASE || process.env.LLM_API_BASE || '').replace(/\/+$/, '');
    const key = process.env.VISION_API_KEY || process.env.LLM_API_KEY;
    const model = process.env.LLM_MODEL_VISION || process.env.LLM_MODEL;
    if (!base || !key || !model) return Response.json({ error: '缺少视觉模型环境变量 VISION_API_BASE/KEY/LLM_MODEL_VISION' }, { status: 500 });
    const imgs = Array.isArray(images) ? images.filter(s => typeof s === 'string' && s.startsWith('data:image')).slice(0, 4) : [];
    const docs = Array.isArray(texts) ? texts.filter(t => t && t.content).slice(0, 8) : [];
    if (!imgs.length && !docs.length) return Response.json({ error: '没有可识别的图片或文档' }, { status: 400 });

    const { st, fields } = fieldsOf(subjectType);
    const sys = `你是${st.name}信息整理员。从用户上传的图片（${st.recognizeHint}等）中，如实提取该${st.name}的信息，整理成JSON。
铁律：只提取图片里真实出现的信息，绝不编造名称/地址/产品/价格——没有的字段留空字符串或空数组。
列表类字段要保留能写进内容的真实细节。只输出JSON本体，第一个字符是{，禁止任何解释或代码围栏。
字段：${fields}`;
    const content = [{ type: 'text', text: `以下是${st.name}相关资料（图片/文档），请提取真实信息：` }];
    for (const d0 of docs) content.push({ type: 'text', text: `【文档：${(d0.name || '资料').slice(0, 60)}】\n${String(d0.content).slice(0, 8000)}` });
    for (const u of imgs) content.push({ type: 'image_url', image_url: { url: u } });

    const up = await fetch(`${base}/chat/completions`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model, messages: [{ role: 'system', content: sys }, { role: 'user', content }], temperature: 0.2, max_tokens: 1500, stream: false, thinking: { type: 'disabled' } }),
    });
    if (!up.ok) { const t = await up.text(); return Response.json({ error: `视觉模型 ${up.status}: ${t.slice(0, 200)}` }, { status: 502 }); }
    const d = await up.json();
    let txt = (d.choices?.[0]?.message?.content || '').toString();
    if (Array.isArray(txt)) txt = txt.map(x => x.text || '').join('');
    txt = txt.replace(/```json/g, '').replace(/```/g, '').trim();
    const m = txt.match(/\{[\s\S]*\}/);
    try { return Response.json(JSON.parse(m ? m[0] : txt)); }
    catch (e) { return Response.json({ error: '解析失败：' + txt.slice(0, 100) }, { status: 502 }); }
  } catch (e) {
    return Response.json({ error: String(e.message || e).slice(0, 150) }, { status: 500 });
  }
}
