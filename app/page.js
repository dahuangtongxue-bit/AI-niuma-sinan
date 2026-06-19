'use client';
import { useState, useEffect } from 'react';
import ProfilePanel from '@/components/ProfilePanel';
import SoulPanel from '@/components/SoulPanel';
import { buildDNA } from '@/lib/dna';
import { tonesFromPersona } from '@/lib/soul';

export default function Page() {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState({});
  const [personaId, setPersonaId] = useState('rexin');
  const [tones, setTones] = useState(tonesFromPersona('rexin'));
  const [saved, setSaved] = useState(false);

  // 读本地已存的
  useEffect(() => {
    try {
      const raw = localStorage.getItem('sinan-dna');
      if (raw) {
        const d = JSON.parse(raw);
        if (d.profile) setProfile(d.profile);
        if (d.soul) { setPersonaId(d.soul.personaId); setTones(d.soul.tones); }
      }
    } catch (e) {}
  }, []);

  function onSoulChange({ personaId: pid, tones: t }) { setPersonaId(pid); setTones(t); }

  function saveDNA() {
    const dna = buildDNA({ profile, personaId, tones });
    localStorage.setItem('sinan-dna', JSON.stringify(dna));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    return dna;
  }

  function exportDNA() {
    const dna = saveDNA();
    const blob = new Blob([JSON.stringify(dna, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `店铺DNA_${profile.name || '未命名'}.json`;
    a.click(); URL.revokeObjectURL(url);
  }

  return (
    <div className="page">
      <header className="topbar">
        <div className="brand"><span className="logo">🧭</span><div><div className="bn">司南</div><div className="bs">店铺灵魂内核 · 数字员工总监</div></div></div>
      </header>

      <div className="intro">
        司南是你数字员工团队的大脑。在这里建立<b>店铺真相</b>、定义<b>品牌人格</b>，
        然后一键生成「店铺DNA」——让阿桃、阿文、阿抖都用同一个口径、同一种调性说话。
      </div>

      <div className="steps">
        <button className={`stepTab ${step === 1 ? 'on' : ''}`} onClick={() => setStep(1)}>① 店铺真相</button>
        <button className={`stepTab ${step === 2 ? 'on' : ''}`} onClick={() => setStep(2)}>② 品牌人格</button>
        <button className={`stepTab ${step === 3 ? 'on' : ''}`} onClick={() => setStep(3)}>③ 生成DNA</button>
      </div>

      <main className="main">
        {step === 1 && <ProfilePanel profile={profile} onChange={setProfile} />}
        {step === 2 && <SoulPanel personaId={personaId} tones={tones} onChange={onSoulChange} />}
        {step === 3 && (
          <div className="exportPanel">
            <div className="exHint">确认无误后，生成「店铺DNA」配置。这份配置导入到阿桃/阿文/阿抖，三个员工就共享同一套真相和调性了。</div>
            <div className="exSummary">
              <div className="exRow"><span>店名</span><b>{profile.name || '（未填）'}</b></div>
              <div className="exRow"><span>品类</span><b>{profile.category || '（未填）'}</b></div>
              <div className="exRow"><span>人格</span><b>{personaId}</b></div>
              <div className="exRow"><span>招牌</span><b>{(profile.signatures || []).join('、') || '（未填）'}</b></div>
            </div>
            <div className="exActions">
              <button className="btn btnGhost" onClick={saveDNA}>{saved ? '✓ 已保存' : '保存到本机'}</button>
              <button className="btn btnPrimary" onClick={exportDNA}>⬇ 导出店铺DNA（给员工导入）</button>
            </div>
            <div className="exTip">提示：当前是 v1，员工侧"导入DNA"的功能我们下一步给阿桃/阿文/阿抖加上。先把司南这个DNA中心建好。</div>
          </div>
        )}
      </main>

      <nav className="bottomNav">
        {step > 1 && <button className="btn btnGhost" onClick={() => setStep(step - 1)}>上一步</button>}
        {step < 3 && <button className="btn btnPrimary" onClick={() => setStep(step + 1)}>下一步</button>}
      </nav>
    </div>
  );
}
