'use client';
import { useState, useRef } from 'react';
import { SUBJECT_LIST, getSubject } from '@/lib/subjects';

// 司南 · 事实层界面：先选主体类型（实体店/电商/品牌/个人IP），再按类型建真相档案
export default function ProfilePanel({ profile, onChange, subjectType, onTypeChange }) {
  const [recognizing, setRecognizing] = useState(false);
  const [recogNote, setRecogNote] = useState('');
  const fileRef = useRef(null);

  function set(key, val) { onChange({ ...profile, [key]: val }); }
  function setList(key, str) { onChange({ ...profile, [key]: str.split('\n').map(s => s.trim()).filter(Boolean) }); }

  // ============ 第一步：选主体类型 ============
  if (!subjectType) {
    return (
      <div className="profilePanel">
        <div className="ppHint">
          先告诉司南：<b>这个品牌是什么类型的主体</b>？不同类型的真相档案、发声视角完全不同——选对了，员工的内容才像"自己人"发的。
        </div>
        <div className="subjectGrid">
          {SUBJECT_LIST.map((st) => (
            <button key={st.id} className="subjectCard" onClick={() => onTypeChange(st.id)}>
              <span className="scEmoji">{st.emoji}</span>
              <span className="scName">{st.name}</span>
              <span className="scDesc">{st.desc}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ============ 第二步：按类型建档 ============
  const st = getSubject(subjectType);

  async function onPickImages(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setRecognizing(true); setRecogNote('正在识别图片信息…');
    try {
      const dataUrls = [];
      for (const f of files.slice(0, 4)) dataUrls.push(await fileToDataUrl(f));
      const res = await fetch('/api/recognize', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: dataUrls, subjectType }),
      });
      const d = await res.json();
      if (d.error) { setRecogNote('识别失败：' + d.error); }
      else {
        const merged = { ...d, ...Object.fromEntries(Object.entries(profile).filter(([k, v]) => v && (Array.isArray(v) ? v.length : true))) };
        onChange({ ...d, ...merged });
        setRecogNote('✓ 已识别并填入，请核对修正（AI识别可能有误，事实必须准确）');
      }
    } catch (err) { setRecogNote('识别出错：' + err.message); }
    setRecognizing(false);
    if (fileRef.current) fileRef.current.value = '';
  }

  const halfFields = st.fields.filter((f) => f.half);
  const fullFields = st.fields.filter((f) => !f.half);

  return (
    <div className="profilePanel">
      {/* 当前类型 + 可换 */}
      <div className="subjectBar">
        <span className="sbCur">{st.emoji} {st.name}</span>
        <span className="sbDesc">{st.desc}</span>
        <button className="sbSwitch" onClick={() => { if (confirm('换类型后需按新类型重新核对档案，确定？')) onTypeChange(''); }}>换类型</button>
      </div>

      <div className="ppHint">
        建立这个{st.name}的<b>真实档案</b>。这是所有员工（阿桃/阿文/阿抖）共享的事实来源——只填真实信息，绝不编造。
      </div>

      <div className="recogBox">
        <input ref={fileRef} type="file" accept="image/*" multiple onChange={onPickImages} style={{ display: 'none' }} />
        <button className="btn btnPrimary" onClick={() => fileRef.current?.click()} disabled={recognizing}>
          📷 上传{st.recognizeHint}，自动识别建档
        </button>
        {recogNote && <div className="recogNote">{recogNote}</div>}
        <div className="recogTip">或在下面手动填写。两种方式可结合：先识别，再核对修正。</div>
      </div>

      <div className="ppGrid">
        {halfFields.map((f) => (
          <Field key={f.key} label={f.label} v={profile[f.key]} onChange={(v) => set(f.key, v)} placeholder={f.placeholder} />
        ))}
      </div>
      {fullFields.map((f) => {
        if (f.kind === 'list') {
          return <ListField key={f.key} label={f.label} v={profile[f.key]} onChange={(s2) => setList(f.key, s2)} placeholder={f.placeholder} />;
        }
        if (f.kind === 'long') {
          return <LongField key={f.key} label={f.label} v={profile[f.key]} onChange={(v) => set(f.key, v)} placeholder={f.placeholder} />;
        }
        return <Field key={f.key} label={f.label} v={profile[f.key]} onChange={(v) => set(f.key, v)} placeholder={f.placeholder} full />;
      })}
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
function LongField({ label, v, onChange, placeholder }) {
  return (
    <div className="ppField full">
      <label>{label}</label>
      <textarea rows={3} value={v || ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
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
