'use client';
import { useState, useRef } from 'react';

// 司南 · 事实层界面：建店铺档案（手动填 + 图片识别）
export default function ProfilePanel({ profile, onChange }) {
  const [recognizing, setRecognizing] = useState(false);
  const [recogNote, setRecogNote] = useState('');
  const fileRef = useRef(null);

  function set(key, val) { onChange({ ...profile, [key]: val }); }
  function setList(key, str) { onChange({ ...profile, [key]: str.split('\n').map(s => s.trim()).filter(Boolean) }); }

  // 图片识别建档：上传门头/菜单/点评截图 → 视觉模型提取店铺信息
  async function onPickImages(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setRecognizing(true); setRecogNote('正在识别图片里的店铺信息…');
    try {
      const dataUrls = [];
      for (const f of files.slice(0, 4)) {
        dataUrls.push(await fileToDataUrl(f));
      }
      const res = await fetch('/api/recognize', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: dataUrls }),
      });
      const d = await res.json();
      if (d.error) { setRecogNote('识别失败：' + d.error); }
      else {
        // 把识别到的字段合并进档案（不覆盖已填的）
        const merged = { ...d, ...Object.fromEntries(Object.entries(profile).filter(([k, v]) => v && (Array.isArray(v) ? v.length : true))) };
        onChange({ ...d, ...merged });
        setRecogNote('✓ 已识别并填入，请核对修正（AI识别可能有误，事实必须准确）');
      }
    } catch (err) { setRecogNote('识别出错：' + err.message); }
    setRecognizing(false);
    if (fileRef.current) fileRef.current.value = '';
  }

  return (
    <div className="profilePanel">
      <div className="ppHint">
        建立你家店的真实档案。这份档案是<b>所有员工（阿桃/阿文/阿抖）共享的事实来源</b>——只填真实信息，绝不编造。
      </div>

      {/* 图片识别建档 */}
      <div className="recogBox">
        <input ref={fileRef} type="file" accept="image/*" multiple onChange={onPickImages} style={{ display: 'none' }} />
        <button className="btn btnPrimary" onClick={() => fileRef.current?.click()} disabled={recognizing}>
          📷 上传门头/菜单/点评截图，自动识别建档
        </button>
        {recogNote && <div className="recogNote">{recogNote}</div>}
        <div className="recogTip">或在下面手动填写。两种方式可结合：先识别，再核对修正。</div>
      </div>

      {/* 手动填写 */}
      <div className="ppGrid">
        <Field label="店名" v={profile.name} onChange={(v) => set('name', v)} placeholder="招牌上的正式名称" />
        <Field label="品类" v={profile.category} onChange={(v) => set('category', v)} placeholder="如 兰州牛肉面 / 咖啡馆" />
        <Field label="城市" v={profile.city} onChange={(v) => set('city', v)} placeholder="如 苏州" />
        <Field label="商圈/地址" v={profile.area} onChange={(v) => set('area', v)} placeholder="至少到街道或商圈" />
        <Field label="人均" v={profile.perCapita} onChange={(v) => set('perCapita', v)} placeholder="如 25元" />
        <Field label="营业时间" v={profile.hours} onChange={(v) => set('hours', v)} placeholder="如 10:00-22:00" />
      </div>
      <Field label="老板/品牌人设（一句话）" v={profile.persona} onChange={(v) => set('persona', v)} placeholder="如 在苏州开店的兰州人，做正宗牛大" full />
      <ListField label="真实招牌（每行一个，带真实细节）" v={profile.signatures} onChange={(s) => setList('signatures', s)} placeholder={"汤每天凌晨现熬\n牛肉现切\n面分九种粗细"} />
      <ListField label="真实差异点（和同行不一样的地方）" v={profile.differentiators} onChange={(s) => setList('differentiators', s)} placeholder={"老板亲自拉面\n不用浓汤宝"} />
      <ListField label="可拍的真实亮点/故事" v={profile.highlights} onChange={(s) => setList('highlights', s)} placeholder={"凌晨四点熬汤的过程\n二十年老手艺"} />
      <Field label="引流/到店信息" v={profile.landing} onChange={(v) => set('landing', v)} placeholder="地址定位、预约/排队方式、私域入口" full />
      <Field label="⚠️ 禁止夸大的提醒（如有）" v={profile.taboo} onChange={(v) => set('taboo', v)} placeholder="如 别写'全城第一''最好吃'" full />
    </div>
  );
}

function Field({ label, v, onChange, placeholder, full }) {
  return (
    <div className={`ppField ${full ? 'full' : ''}`}>
      <label>{label}</label>
      <input value={v || ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}
function ListField({ label, v, onChange, placeholder }) {
  return (
    <div className="ppField full">
      <label>{label}</label>
      <textarea rows={3} value={(v || []).join('\n')} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}
