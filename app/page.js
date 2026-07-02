'use client';
import { useState, useEffect } from 'react';
import ProfilePanel from '@/components/ProfilePanel';
import SoulPanel from '@/components/SoulPanel';
import { buildDNA } from '@/lib/dna';
import { tonesFromPersona, PERSONAS } from '@/lib/soul';
import { migrateV1, listBrands, getBrand, saveBrand, deleteBrand, newBrandId } from '@/lib/brands';

export default function Page() {
  const [view, setView] = useState('list');     // list | edit
  const [brands, setBrands] = useState([]);
  const [editing, setEditing] = useState(null); // 当前编辑的品牌id
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState({});
  const [personaId, setPersonaId] = useState('rexin');
  const [tones, setTones] = useState(tonesFromPersona('rexin'));
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    migrateV1();
    setBrands(listBrands());
  }, []);

  function refresh() { setBrands(listBrands()); }

  // —— 品牌库操作 ——
  function openNew() {
    setEditing(newBrandId());
    setProfile({}); setPersonaId('rexin'); setTones(tonesFromPersona('rexin'));
    setStep(1); setView('edit');
  }

  function openEdit(id) {
    const b = getBrand(id);
    if (!b) return;
    setEditing(id);
    setProfile(b.profile || {});
    setPersonaId(b.personaId || 'rexin');
    setTones(b.tones || tonesFromPersona(b.personaId || 'rexin'));
    setStep(1); setView('edit');
  }

  function removeBrand(id, name) {
    if (!confirm(`确定删除品牌「${name || '未命名'}」？该品牌的DNA配置将被移除。`)) return;
    deleteBrand(id); refresh();
  }

  function exportBrandDNA(b) {
    const dna = buildDNA({ profile: b.profile, personaId: b.personaId, tones: b.tones });
    const blob = new Blob([JSON.stringify(dna, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `品牌DNA_${b.profile?.name || '未命名'}.json`;
    a.click(); URL.revokeObjectURL(url);
  }

  // —— 编辑态操作 ——
  function onSoulChange({ personaId: pid, tones: t }) { setPersonaId(pid); setTones(t); }

  function saveCurrent() {
    saveBrand({ id: editing, profile, personaId, tones });
    refresh();
    setSaved(true); setTimeout(() => setSaved(false), 1600);
  }

  function exportCurrent() {
    saveCurrent();
    exportBrandDNA({ profile, personaId, tones });
  }

  const personaOf = (pid) => PERSONAS[pid] || PERSONAS.rexin;

  // ======================= 品牌库（列表视图）=======================
  if (view === 'list') {
    return (
      <div className="page">
        <header className="topbar">
          <div className="brand"><span className="logo">🧭</span><div><div className="bn">司南</div><div className="bs">品牌DNA中枢 · 数字员工总监</div></div></div>
        </header>

        <div className="intro">
          这里是你所有客户品牌的<b>DNA 库</b>。每个品牌一份「真相 + 人格 + 调性」，
          导出给阿桃 / 阿文 / 阿抖，全平台内容自动带上这个品牌的口吻——千牌千面，绝不串味。
        </div>

        <div className="brandGrid">
          {brands.map((b) => {
            const pe = personaOf(b.personaId);
            return (
              <div className="brandCard" key={b.id}>
                <div className="bcHead">
                  <span className="bcEmoji">{pe.emoji || '🏪'}</span>
                  <div className="bcTitle">
                    <div className="bcName">{b.profile?.name || '（未命名品牌）'}</div>
                    <div className="bcMeta">{[b.profile?.category, pe.name].filter(Boolean).join(' · ')}</div>
                  </div>
                </div>
                <div className="bcTime">更新于 {(b.updatedAt || '').slice(0, 10)}</div>
                <div className="bcActions">
                  <button className="btn btnGhost btnSm" onClick={() => openEdit(b.id)}>编辑</button>
                  <button className="btn btnPrimary btnSm" onClick={() => exportBrandDNA(b)}>⬇ 导出DNA</button>
                  <button className="btn btnDanger btnSm" onClick={() => removeBrand(b.id, b.profile?.name)}>删除</button>
                </div>
              </div>
            );
          })}
          <button className="brandCard brandNew" onClick={openNew}>
            <span className="bnPlus">＋</span>
            <span>新建品牌</span>
          </button>
        </div>

        {brands.length === 0 && (
          <div className="emptyHint">还没有品牌。点「新建品牌」建第一个客户的 DNA —— 填真相、选人格、调调性，三步搞定。</div>
        )}
      </div>
    );
  }

  // ======================= 品牌编辑（三步流程）=======================
  return (
    <div className="page">
      <header className="topbar">
        <div className="brand">
          <button className="backBtn" onClick={() => { setView('list'); refresh(); }}>← 品牌库</button>
          <span className="logo">🧭</span>
          <div><div className="bn">{profile.name || '新品牌'}</div><div className="bs">编辑品牌 DNA</div></div>
        </div>
        <button className="btn btnGhost" onClick={saveCurrent}>{saved ? '✓ 已保存' : '保存'}</button>
      </header>

      <div className="steps">
        <button className={`stepTab ${step === 1 ? 'on' : ''}`} onClick={() => setStep(1)}>① 品牌真相</button>
        <button className={`stepTab ${step === 2 ? 'on' : ''}`} onClick={() => setStep(2)}>② 品牌人格</button>
        <button className={`stepTab ${step === 3 ? 'on' : ''}`} onClick={() => setStep(3)}>③ 生成DNA</button>
      </div>

      <main className="main">
        {step === 1 && <ProfilePanel profile={profile} onChange={setProfile} />}
        {step === 2 && <SoulPanel personaId={personaId} tones={tones} onChange={onSoulChange} />}
        {step === 3 && (
          <div className="exportPanel">
            <div className="exHint">确认无误后，导出这个品牌的 DNA。导入到阿桃 / 阿文 / 阿抖后，员工就用这个品牌的口径和调性干活了。</div>
            <div className="exSummary">
              <div className="exRow"><span>品牌</span><b>{profile.name || '（未填）'}</b></div>
              <div className="exRow"><span>品类</span><b>{profile.category || '（未填）'}</b></div>
              <div className="exRow"><span>人格</span><b>{personaOf(personaId).emoji} {personaOf(personaId).name}</b></div>
              <div className="exRow"><span>招牌</span><b>{(profile.signatures || []).join('、') || '（未填）'}</b></div>
            </div>
            <div className="exActions">
              <button className="btn btnGhost" onClick={saveCurrent}>{saved ? '✓ 已保存' : '保存到品牌库'}</button>
              <button className="btn btnPrimary" onClick={exportCurrent}>⬇ 导出品牌DNA（给员工导入）</button>
            </div>
            <div className="exTip">导出的 JSON 文件，在阿桃 / 阿文 / 阿抖页面顶部「品牌DNA」处导入。员工侧可同时装多个品牌、随时切换。</div>
          </div>
        )}
      </main>
    </div>
  );
}
