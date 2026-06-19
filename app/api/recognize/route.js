export const runtime = 'edge';

const FIELDS = `{
  "name":"店名","category":"品类","city":"城市","area":"商圈/地址",
  "persona":"老板/品牌一句话人设","perCapita":"人均","hours":"营业时间",
  "signatures":["真实招牌1(带细节)","招牌2"],
  "differentiators":["真实差异点1"],
  "highlights":["可拍亮点1"],
  "landing":"引流/到店信息","taboo":"若有夸大宣传的提醒"
}`;

export async function POST(req) {
  try {
    const { images } = await req.json();
    const base = (process.env.VISION_API_BASE || process.env.LLM_API_BASE || '').replace(/\/+$/, '');
    const key = process.env.VISION_API_KEY || process.env.LLM_API_KEY;
    const model = process.env.LLM_MODEL_VISION || process.env.LLM_MODEL;
    if (!base || !key || !model) return Response.json({ error: '缺少视觉模型环境变量 VISION_API_BASE/KEY/LLM_MODEL_VISION' }, { status: 500 });
    const imgs = Array.isArray(images) ? images.filter(s => typeof s === 'string' && s.startsWith('data:image')).slice(0, 4) : [];
    if (!imgs.length) return Response.json({ error: '没有图片' }, { status: 400 });

    const sys = `你是商户信息整理员。从用户上传的店铺图片（门头/菜单/点评截图/营业执照）中，如实提取店铺信息，整理成JSON。
铁律：只提取图片里真实出现的信息，绝不编造店名/地址/菜品/价格——没有的字段留空字符串或空数组。
招牌/亮点要保留能写进内容的真实细节。只输出JSON本体，第一个字符是{，禁止任何解释或代码围栏。
字段：${FIELDS}`;
    const content = [{ type: 'text', text: '以下是店铺相关图片，请提取真实信息：' }];
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
