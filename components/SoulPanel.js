'use client';
import { useState } from 'react';
import { PERSONAS, TONE_DIMS, tonesFromPersona } from '@/lib/soul';

// 司南 · 灵魂层界面：选人格（粗）+ 调性滑杆（细）+ 实时预览
export default function SoulPanel({ personaId, tones, onChange }) {
  const [previewing, setPreviewing] = useState(false);
  const [preview, setPreview] = useState('');
  const [showSliders, setShowSliders] = useState(false);

  function pickPersona(id) {
    // 选人格 = 一次性设好整套调性预设
    onChange({ personaId: id, tones: tonesFromPersona(id) });
  }
  function setTone(key, val) {
    onChange({ personaId, tones: { ...tones, [key]: val } });
  }

  // 实时预览：用当前人格+调性，让模型写一句示例文案
  async function genPreview() {
    setPreviewing(true); setPreview('');
    try {
      const res = await fetch('/api/preview', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personaId, tones }),
      });
      const d = await res.json();
      setPreview(d.text || d.error || '（预览失败）');
    } catch (e) { setPreview('（预览失败：' + e.message + '）'); }
    setPreviewing(false);
  }

  const cur = PERSONAS[personaId] || PERSONAS.rexin;

  return (
    <div className="soulPanel">
      <div className="soulSectionTitle">① 选一个最像你家店的人格</div>
      <div className="personaGrid">
        {Object.values(PERSONAS).map((p) => (
          <button key={p.id} className={`personaCard ${personaId === p.id ? 'on' : ''}`} onClick={() => pickPersona(p.id)}>
            <div className="pcEmoji">{p.emoji}</div>
            <div className="pcName">{p.name}</div>
            <div className="pcDesc">{p.desc}</div>
          </button>
        ))}
      </div>

      {/* 选中人格的示例 */}
      <div className="personaSample">
        <span className="psLabel">{cur.emoji} {cur.name} 写出来大概是这样：</span>
        <div className="psText">“{cur.sample}”</div>
      </div>

      {/* 微调滑杆（折叠） */}
      <button className="soulToggle" onClick={() => setShowSliders(!showSliders)}>
        {showSliders ? '▲ 收起微调' : '▼ 想再精调一下调性（可选）'}
      </button>
      {showSliders && (
        <div className="sliders">
          {TONE_DIMS.map((d) => (
            <div className="slider" key={d.key}>
              <div className="slLabel"><span>{d.name}</span><span className="slVal">{tones[d.key]}</span></div>
              <input type="range" min="0" max="100" value={tones[d.key]} onChange={(e) => setTone(d.key, +e.target.value)} />
              <div className="slEnds"><span>{d.left}</span><span>{d.right}</span></div>
            </div>
          ))}
        </div>
      )}

      {/* 实时预览 */}
      <div className="previewBox">
        <button className="btn btnGhost btnSmall" onClick={genPreview} disabled={previewing}>
          {previewing ? '生成中…' : '🎤 用这个调性，让 AI 写句话看看'}
        </button>
        {preview && <div className="previewText">{preview}</div>}
      </div>
    </div>
  );
}
