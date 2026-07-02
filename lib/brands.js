// ============================================================================
//  司南 v2 · 品牌库 —— 多品牌存储层（localStorage）
//  一个后台管 N 个品牌，每个品牌一份完整 DNA（真相 + 人格 + 调性）
// ============================================================================
'use client';

const KEY = 'sinan-brands';        // [{ id, profile, personaId, tones, updatedAt }]
const LEGACY_KEY = 'sinan-dna';    // v1 单品牌旧数据（自动迁移）

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) { return []; }
}

function write(list) {
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) {}
}

export function newBrandId() {
  return 'b_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// v1 迁移：把旧的单品牌 sinan-dna 迁成品牌库第一个品牌（只迁一次）
export function migrateV1() {
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    if (!raw) return;
    const old = JSON.parse(raw);
    if (!old || !old.profile) { localStorage.removeItem(LEGACY_KEY); return; }
    const list = read();
    // 避免重复迁移（按店名判断）
    if (list.some((b) => b.profile?.name === old.profile?.name)) {
      localStorage.removeItem(LEGACY_KEY); return;
    }
    list.unshift({
      id: newBrandId(),
      profile: old.profile || {},
      personaId: old.soul?.personaId || 'rexin',
      tones: old.soul?.tones || null,
      updatedAt: old._updatedAt || new Date().toISOString(),
    });
    write(list);
    localStorage.removeItem(LEGACY_KEY);
  } catch (e) {}
}

export function listBrands() {
  return read().sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
}

export function getBrand(id) {
  return read().find((b) => b.id === id) || null;
}

export function saveBrand(brand) {
  const list = read();
  const i = list.findIndex((b) => b.id === brand.id);
  const next = { ...brand, updatedAt: new Date().toISOString() };
  if (i >= 0) list[i] = next; else list.unshift(next);
  write(list);
  return next;
}

export function deleteBrand(id) {
  write(read().filter((b) => b.id !== id));
}
