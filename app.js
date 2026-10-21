'use strict';
/* ================= helpers ================= */
const $ = s => document.querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ICONS = {
  refresh: '<path d="M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5"/>', download: '<path d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v3h16v-3"/>',
  upload: '<path d="M12 15V3m0 0L8 7m4-4l4 4M4 17v3h16v-3"/>', folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>', alert: '<path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17h.01"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
  users: '<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5M15 14.5c3 0 6 1.5 6 5.5"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>', plus: '<path d="M12 5v14M5 12h14"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>', x: '<path d="M6 6l12 12M18 6L6 18"/>', check: '<path d="M5 12l5 5L20 7"/>',
  moon: '<path d="M20 14A8 8 0 0 1 10 4a8 8 0 1 0 10 10z"/>', sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19"/>',
  logout: '<path d="M9 4H5v16h4M16 8l4 4-4 4M20 12H9"/>', copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/>',
  send: '<path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/>', phone: '<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M11 18h2"/>',
  grid: '<path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z"/>', clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  file: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/>', layers: '<path d="M12 3l9 5-9 5-9-5zM3 13l9 5 9-5"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7M12 17h.01"/>', bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>', laptop: '<rect x="4" y="5" width="16" height="11" rx="1.5"/><path d="M2 20h20"/>',
  home: '<path d="M4 11l8-7 8 7v9H4z"/>', bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 21h4"/>', copy2: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M4 16V6a2 2 0 0 1 2-2h10"/>',
  hex: '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/>', tiles: '<path d="M4 4h4v4H4zM10 4h4v4h-4zM16 4h4v4h-4zM4 10h4v4H4zM10 10h4v4h-4zM16 10h4v4h-4z"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>', table: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 4v16"/>',
  filter: '<path d="M3 5h18l-7 8v6l-4-2v-4z"/>', edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>', eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'
};
const I = (n, s = 18) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n] || ''}</svg>`;
const hhmm = iso => { const d = new Date(iso); return isNaN(d) ? '--:--' : String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); };
const dt = iso => { const d = new Date(iso); return isNaN(d) ? '' : d.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }); };
const CATS = ['Hackathon', 'Course', 'Participation', 'Award', 'Merit', 'Certification', 'Other'];

/* ================= state ================= */
const S = { token: localStorage.getItem('cx_token') || '', user: null, data: null, tab: 'dash', filter: 'all', layout: 'matrix', mview: 'desk', mstatus: 'all',
  msearch: '', tsearch: '', page: 1, dark: localStorage.getItem('cx_dark') !== '0', banner: localStorage.getItem('cx_banner') !== '0', modal: null, online: true, installEvt: null };
document.documentElement.classList.toggle('dark', S.dark);
const PAGE = 25;

async function api(path, opt = {}) {
  const h = { Authorization: 'Bearer ' + S.token };
  if (opt.body !== undefined) h['Content-Type'] = 'application/json';
  const r = await fetch(path, { method: opt.method || 'GET', headers: h, body: opt.body !== undefined ? JSON.stringify(opt.body) : undefined });
  if (opt.raw) { if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || 'Request failed'); return r; }
  const j = await r.json().catch(() => ({}));
  if (r.status === 401 && S.token) { logout(true); throw new Error(j.error || 'Please sign in.'); }
  if (!r.ok) throw new Error(j.error || 'Request failed');
  return j;
}
function toast(msg, err) {
  const el = document.createElement('div'); el.className = 'toast' + (err ? ' err' : '');
  el.innerHTML = (err ? I('alert') : I('check')) + `<span>${esc(msg)}</span>`; $('#toasts').appendChild(el); setTimeout(() => el.remove(), 4200);
}
async function act(fn, ok) { try { const r = await fn(); if (ok) toast(typeof ok === 'function' ? ok(r) : ok); return r; } catch (e) { toast(e.message, true); } }

/* ================= derived data ================= */
function dv(s) {
  const nf = s.files.length, nr = s.sheetRows.length, ver = s.driveUploaded && s.sheetUpdated && s.submitted, mismatch = nf !== nr;
  let st;
  if (!s.driveUploaded && !s.sheetUpdated) st = 'missing'; else if (mismatch) st = 'mismatch'; else if (ver) st = 'verified';
  else if (s.driveUploaded && !s.sheetUpdated) st = 'drive'; else if (s.sheetUpdated && !s.driveUploaded) st = 'sheet'; else st = 'partial';
  return { nf, nr, ver, mismatch, st };
}
const FILTERS = [['all', 'All Roster', () => true], ['mismatch', 'Count Mismatch (Sheet ≠ Drive)', (s, x) => x.mismatch], ['nodrive', 'Missing Drive', s => !s.driveUploaded],
  ['nosheet', 'Missing Sheet', s => !s.sheetUpdated], ['incomplete', 'Incomplete', (s, x) => !x.ver], ['both', 'Missing Both', s => !s.driveUploaded && !s.sheetUpdated],
  ['unconf', 'Unconfirmed', s => !s.submitted], ['done', 'Completed', (s, x) => x.ver]];
const STAT = { verified: ['Verified', 'g'], drive: ['Drive Only', 'a'], sheet: ['Sheet Only', ''], mismatch: ['Mismatch', 'v'], partial: ['Partial', ''], missing: ['Missing', 'r'] };
const list = () => S.data.students.map(s => ({ s, x: dv(s) }));
const stu = id => S.data.students.find(s => s.id === id);
const dupCount = () => S.data.duplicates.reduce((a, g) => a + g.removable, 0);
const defaulters = () => S.data.students.filter(s => !dv(s).ver || s.approval === 'REJECTED');
function reviewItems() {
  const L = list();
  return { pending: L.filter(({ s }) => s.approval === 'PENDING' && s.files.length).map(o => o.s), dups: S.data.duplicates,
    mism: L.filter(({ x }) => x.mismatch).map(o => o.s), rej: L.filter(({ s }) => s.approval === 'REJECTED').map(o => o.s) };
}
const reviewCount = () => { const r = reviewItems(); return r.pending.length + r.dups.length + r.mism.length + r.rej.length; };

/* ================= views ================= */
function loginView() {
  return `<div class="login"><form class="card box" data-form="login">
    <div class="row g12" style="margin-bottom:18px"><div class="logo">${I('file', 26)}</div><div><h1 class="h2">Certifyx</h1><div class="muted">Class Certificate Automation Manager</div></div></div>
    <div class="field"><label>Admin email</label><input class="in" name="email" type="email" autocomplete="username" required autofocus></div>
    <div class="field"><label>Password</label><input class="in" name="password" type="password" autocomplete="current-password" required></div>
    <div class="err-t" id="loginErr"></div>
    <button class="btn p" style="width:100%" type="submit">Sign in</button></form></div>`;
}
function header() {
  const st = S.data.settings, n = S.data.students.length;
  return `<div class="top"><div class="wrap">
    <div class="brand"><div class="logo">${I('file', 26)}</div><div><div class="row g12 wrapf"><h1>Class Certificate Automation Manager</h1><span class="pill">${n} Roster</span></div>
      <div class="muted">Direct Drive &amp; Sheets Automated Reconciliation Engine</div></div></div>
    <div class="toolbar">
      <button class="tb blue" data-act="drive">${I('folder')}<span>Drive<br>Folder</span></button>
      <div class="tb static muted">${I('clock')}<span>Synced<br><b style="color:var(--text)">${hhmm(st.lastSync)}</b></span><span class="pill g" style="margin-left:6px">Auto ${st.autoSyncMinutes}m</span></div>
      <button class="tb primary" data-act="sync" id="syncBtn">${I('refresh')}<span>SYNC<br>NOW</span></button>
      <button class="tb green" data-act="proof">${I('file')}<span>Sheet<br>Proof</span></button>
      <button class="tb violet" data-act="export">${I('download')}<span>Export<br>Center</span></button>
      <div class="tb static" style="border:0;background:none;padding:0 4px"><span class="muted" style="font-size:12px">Full ${S.dark ? 'Dark' : 'Light'}<br>Mode</span></div>
      <button class="toggle" data-act="theme" aria-label="Toggle theme"><i>${I(S.dark ? 'moon' : 'sun', 16)}</i></button>
      <button class="tb primary" data-act="install">${I('download')}<span>Install<br>App</span></button>
      <div class="tb static" style="margin-left:auto"><div class="avatar">${esc((S.user.name || 'A')[0])}</div><div><b>${esc(S.user.name)}</b><div style="font-size:11px;color:var(--green)">● Authorized Admin</div></div>
        <button class="x" data-act="logout" title="Sign out">${I('logout')}</button></div>
    </div>
    <div class="tabs">
      <button class="tab ${S.tab === 'dash' ? 'on' : ''}" data-act="tab" data-v="dash">${I('folder')}Dashboard &amp; Class Roster (${n})</button>
      <button class="tab ${S.tab === 'review' ? 'on' : ''}" data-act="tab" data-v="review">${I('alert')}Needs Review <span class="pill a">${reviewCount()}</span></button>
      <button class="btn-o end ${S.tab === 'settings' ? 'on' : ''}" data-act="tab" data-v="settings">${I('settings')}System Controls &amp; Settings</button>
    </div></div></div>`;
}
function installBanner() {
  if (!S.banner) return '';
  return `<section class="card install"><div class="row sp wrapf g16"><div style="max-width:760px">
    <div class="row g8 wrapf" style="margin-bottom:14px"><span class="pill">${I('bolt', 14)}Progressive Web App (PWA) Ready</span><span class="pill v">${I('bolt', 14)}Offline-First Shell</span><span class="pill g">${I('globe', 14)}Cross-Platform (Android / iOS / Desktop)</span></div>
    <h2 class="h2">Install Certifyx Application on Your Device</h2>
    <p class="muted" style="font-size:15px;margin:8px 0 14px">Get a native application experience without app store downloads. Dedicated window, desktop/mobile launcher icon, offline caching of the app shell, and instant launch.</p>
    <div class="row g12 wrapf"><span class="chipf">${I('laptop')}Standalone Window</span><span class="chipf">${I('shield')}Instant Offline Shell</span><span class="chipf">${I('phone')}Home Screen Launcher</span></div></div>
    <div class="col" style="display:flex;flex-direction:column;gap:10px;align-items:stretch;min-width:300px">
      <button class="btn p" style="padding:16px" data-act="install">${I('download')}Install Native App</button>
      <button class="btn ghost" data-act="howto">${I('help')}Instructions</button>
      <button class="btn ghost sm" style="border:0" data-act="dismissBanner">Dismiss this banner</button></div></div></section>`;
}
function ring(v, p, n, tot) {
  const C = 2 * Math.PI * 40, seg = [[v, 'var(--green)'], [p, 'var(--amber)'], [n, 'var(--rose)']]; let off = 0;
  const circles = tot ? seg.map(([c, col]) => { const len = C * c / tot, el = `<circle r="40" cx="50" cy="50" fill="none" stroke="${col}" stroke-width="11" stroke-dasharray="${len} ${C - len}" stroke-dashoffset="${-off}" transform="rotate(-90 50 50)"/>`; off += len; return el; }).join('') : '';
  return `<svg width="120" height="120" viewBox="0 0 100 100"><circle r="40" cx="50" cy="50" fill="none" stroke="var(--line)" stroke-width="11"/>${circles}
    <text x="50" y="49" text-anchor="middle" font-size="14" font-weight="800" fill="var(--text)">${tot ? Math.round(v * 100 / tot) : 0}%</text>
    <text x="50" y="62" text-anchor="middle" font-size="7" fill="var(--muted)">VERIFIED</text></svg>`;
}
function compliance() {
  const L = list(), n = L.length, ver = L.filter(o => o.x.ver).length, none = L.filter(o => !o.s.driveUploaded && !o.s.sheetUpdated && !o.s.submitted).length, pend = n - ver - none;
  const pc = v => n ? (v * 100 / n).toFixed(1) : '0.0', pi = v => n ? Math.round(v * 100 / n) : 0;
  const drive = L.filter(o => o.s.driveUploaded).length, sheet = L.filter(o => o.s.sheetUpdated).length, sub = L.filter(o => o.s.submitted).length;
  const bar = (ic, name, v, col) => `<div class="bar"><div class="row sp mono" style="font-size:13px"><span class="row g8" style="font-family:Inter,sans-serif;font-weight:600">${I(ic, 16)}${name}</span><b style="color:${col}">${v}/${n} (${pi(v)}%)</b></div>
    <div class="track" style="margin-top:8px"><i style="width:${pi(v)}%;background:${col}"></i></div></div>`;
  return `<section class="card"><div class="milestone"><div>
    <span class="pill g mono" style="margin-bottom:12px">${I('shield', 14)}3-WAY REQUIREMENT MILESTONE</span> <span class="muted">(Drive Uploaded + Sheet Updated + Submitted)</span>
    <div class="row g12" style="margin:12px 0 8px;align-items:baseline"><span class="big">${pi(ver)}%</span><span style="font-size:26px;font-weight:700;color:var(--green)">Completed</span><span class="mono muted">(${ver} of ${n} Students)</span></div>
    <div><b>${n - ver}</b> students currently have pending requirements. Complete all 3 channels to achieve 100% compliance.</div></div>
    <div class="rings">${ring(ver, pend, none, n)}<div class="legend"><div class="muted mono" style="font-size:11px;letter-spacing:1px">COMPLIANCE RINGS</div>
      <div class="lg"><span class="dot" style="background:var(--green)"></span>Verified: <b class="mono">${ver}</b> <span class="muted mono">(${pc(ver)}%)</span></div>
      <div class="lg"><span class="dot" style="background:var(--amber)"></span>Pending: <b class="mono">${pend}</b> <span class="muted mono">(${pc(pend)}%)</span></div>
      <div class="lg"><span class="dot" style="background:var(--rose)"></span>Not Started: <b class="mono">${none}</b> <span class="muted mono">(${pc(none)}%)</span></div></div></div>
    <button class="btn o" style="padding:18px 22px" data-act="remind">${I('send')}Remind ${defaulters().length}<br>Defaulters</button></div>
    <hr style="border:0;border-top:1px solid var(--line);margin:22px 0 14px">
    <div class="row sp mono muted" style="font-size:13px"><span>Progress Breakdown:</span><span>${ver} of ${n} fully complete (${pi(ver)}%)</span></div>
    <div class="track big2"><i style="width:${pi(ver)}%;background:linear-gradient(90deg,var(--green),var(--cyan))"></i></div>
    <div class="bars">${bar('upload', '1. Drive Files', drive, 'var(--blue)')}${bar('file', '2. Sheet Rows', sheet, 'var(--cyan)')}${bar('check', '3. Submitted', sub, 'var(--violet)')}${bar('shield', '3-Way Verified', ver, 'var(--green)')}</div></section>`;
}
function dupCard() {
  const c = dupCount(); if (!c) return '';
  return `<section class="card danger"><div class="row sp wrapf g16"><div class="row g16"><div class="ico r">${I('copy2', 24)}</div><div>
    <div class="row g12 wrapf"><h3 class="h3">${c} Duplicate Certificate Submissions Detected</h3><span class="pill r">Action Required</span></div>
    <div class="muted">Multiple certificate uploads share the same student &amp; category. Clean up redundant copies with one click (the newest copy is kept).</div></div></div>
    <div class="row g12"><button class="btn r" data-act="rmdups">${I('trash')}Remove All Duplicates (${c})</button><button class="btn" data-act="tab" data-v="review">Review in Queue</button></div></div></section>`;
}
function rosterCard() {
  return `<section class="card sm"><div class="row sp wrapf g16"><div class="row g16"><div class="ico">${I('users', 24)}</div><div>
    <div class="row g12 wrapf"><h3 class="h3">Active Class Roster</h3><span class="pill">${S.data.students.length} Students</span><span class="pill g">${I('shield', 12)}Permanently Synced (Server Database)</span></div>
    <div class="muted">Permanently register students or bulk-import entire class rosters via copy-paste or CSV.</div></div></div>
    <div class="row g12 wrapf"><button class="btn p" data-act="addStu">${I('plus')}Add Student</button><button class="btn g" data-act="import">${I('users')}Batch Import Students</button>
    <button class="btn" data-act="manage">${I('file')}Manage Roster</button></div></div></section>`;
}
function filtersCard() {
  const L = list();
  return `<section class="card sm"><div class="row sp" style="margin-bottom:12px"><div class="row g8" style="font-weight:800;letter-spacing:.4px;text-transform:uppercase;font-size:13px">${I('filter', 16)}Quick Synchronization Issue Filters:</div>
    <span class="muted mono" style="font-size:12px">Click chip to filter table visibility</span></div>
    <div class="chips">${FILTERS.map(([k, label, fn]) => `<button class="fchip ${S.filter === k ? 'on' : ''}" data-act="filter" data-v="${k}">${label}<span class="n">${L.filter(o => fn(o.s, o.x)).length}</span></button>`).join('')}</div></section>`;
}
function layoutCard() {
  return `<section class="card sm"><div class="row sp wrapf g16"><div class="row g12 wrapf"><span class="row g8" style="font-weight:800">${I('bolt', 16)}Classroom Roster Layout Mode:</span><span class="muted">Choose spatial grid or tabular audit list</span></div>
    <div class="seg"><button class="${S.layout === 'matrix' ? 'on' : ''}" data-act="layout" data-v="matrix">${I('compass', 16)}Interactive Matrix (Seating Map &amp; HUD)</button>
    <button class="${S.layout === 'table' ? 'on' : ''}" data-act="layout" data-v="table">${I('table', 16)}Detailed Audit Table</button></div></div></section>`;
}
function visible() {
  const f = FILTERS.find(x => x[0] === S.filter)[2];
  return list().filter(o => f(o.s, o.x));
}
function matrixBody() {
  const q = S.msearch.trim().toLowerCase(), all = visible();
  const rows = all.filter(o => (S.mstatus === 'all' || o.x.st === S.mstatus) && (!q || o.s.rollNo.toLowerCase().includes(q) || o.s.name.toLowerCase().includes(q))).sort((a, b) => (a.s.seat || 0) - (b.s.seat || 0));
  const hud = o => `data-hud="${o.s.id}" data-act="open" data-id="${o.s.id}"`;
  if (!rows.length) return `<div class="muted" style="padding:30px;text-align:center">No seats match the current filters.</div>`;
  if (S.mview === 'desk') return `<div class="desk-grid">${rows.map(o => `<button class="seat s-${o.x.st}" ${hud(o)}><div class="no">Seat ${o.s.seat}</div><div class="rn mono">${esc(o.s.rollNo.slice(-5))}</div><div class="nm">${esc(o.s.name.split(' ')[0])}</div></button>`).join('')}</div>`;
  if (S.mview === 'hex') {
    const per = 12; let h = '';
    for (let i = 0; i < rows.length; i += per) h += `<div class="hexrow ${(i / per) % 2 ? 'odd' : ''}">${rows.slice(i, i + per).map(o => `<button class="hex s-${o.x.st}" ${hud(o)}><b>${o.s.seat}</b><span class="mono" style="font-size:10px">${esc(o.s.rollNo.slice(-4))}</span></button>`).join('')}</div>`;
    return `<div style="padding-bottom:18px;overflow-x:auto">${h}</div>`;
  }
  return `<div class="tiles">${rows.map(o => `<button class="tile s-${o.x.st}" ${hud(o)}>${o.s.seat}</button>`).join('')}</div>`;
}
function matrixCard() {
  const base = visible(), cnt = k => base.filter(o => o.x.st === k).length;
  const chip = (k, label, color) => `<button class="fchip ${S.mstatus === k ? 'on' : ''}" data-act="mstatus" data-v="${k}">${color ? `<span class="dot" style="background:${color}"></span>` : ''}${label} <span class="n">${k === 'all' ? base.length : cnt(k)}</span></button>`;
  return `<section class="card"><div class="row sp wrapf g16" style="margin-bottom:16px"><div class="row g16"><div class="ico">${I('compass', 24)}</div><div>
    <div class="row g12 wrapf"><h2 class="h2">Interactive Classroom Matrix</h2><span class="pill">Spatial View (${S.data.students.length} Seats)</span></div>
    <div class="muted">Visual seat-by-seat compliance status chart with real-time status glows and Mini-HUD inspection</div></div></div>
    <div class="seg"><button class="${S.mview === 'desk' ? 'on' : ''}" data-act="mview" data-v="desk">${I('grid', 16)}Classroom Desk Map</button>
    <button class="${S.mview === 'hex' ? 'on' : ''}" data-act="mview" data-v="hex">${I('hex', 16)}Honeycomb Grid</button>
    <button class="${S.mview === 'tiles' ? 'on' : ''}" data-act="mview" data-v="tiles">${I('tiles', 16)}Seat Tiles</button></div></div>
    <div class="row g12 wrapf" style="margin-bottom:16px"><label class="search">${I('search')}<input id="msearch" placeholder="Search roll number (e.g. 05GB) or name…" value="${esc(S.msearch)}"></label>
    ${chip('all', 'All Seats')}${chip('verified', 'Verified', 'var(--green)')}${chip('drive', 'Drive Only', 'var(--amber)')}${chip('sheet', 'Sheet Only', 'var(--cyan)')}${chip('mismatch', 'Mismatch', 'var(--violet)')}${chip('partial', 'Partial', 'var(--blue)')}${chip('missing', 'Missing', 'var(--rose)')}</div>
    <div id="matrixBody">${matrixBody()}</div></section>`;
}
function tableBody() {
  const q = S.tsearch.trim().toLowerCase(), rows = visible().filter(o => !q || o.s.rollNo.toLowerCase().includes(q) || o.s.name.toLowerCase().includes(q)).sort((a, b) => (a.s.seat || 0) - (b.s.seat || 0));
  const pages = Math.max(1, Math.ceil(rows.length / PAGE)); if (S.page > pages) S.page = pages;
  const slice = rows.slice((S.page - 1) * PAGE, S.page * PAGE), yn = v => `<span class="${v ? 'yes' : 'no'}">${v ? 'Yes' : 'No'}</span>`;
  return `<div class="tblwrap"><table><thead><tr><th>Seat</th><th>Roll No</th><th>Name</th><th>Drive</th><th>Sheet</th><th>Submitted</th><th>Files</th><th>Rows</th><th>Status</th><th>Approval</th><th></th></tr></thead><tbody>
    ${slice.map(({ s, x }) => `<tr><td class="mono">${s.seat}</td><td class="mono">${esc(s.rollNo)}</td><td>${esc(s.name)}</td><td>${yn(s.driveUploaded)}</td><td>${yn(s.sheetUpdated)}</td><td>${yn(s.submitted)}</td>
      <td class="mono">${x.nf}</td><td class="mono">${x.nr}</td><td><span class="pill ${STAT[x.st][1]}">${STAT[x.st][0]}</span></td>
      <td><span class="pill ${s.approval === 'APPROVED' ? 'g' : s.approval === 'REJECTED' ? 'r' : 'a'}">${s.approval}</span></td><td><button class="btn sm" data-act="open" data-id="${s.id}">Open</button></td></tr>`).join('') || '<tr><td colspan="11" class="muted" style="text-align:center;padding:28px">No students match.</td></tr>'}</tbody></table></div>
    <div class="pager"><span class="muted">${rows.length} students · page ${S.page}/${pages}</span><div class="row g8"><button class="btn sm" data-act="page" data-v="-1" ${S.page <= 1 ? 'disabled' : ''}>Prev</button><button class="btn sm" data-act="page" data-v="1" ${S.page >= pages ? 'disabled' : ''}>Next</button></div></div>`;
}
function tableCard() {
  return `<section class="card"><div class="row sp wrapf g16" style="margin-bottom:14px"><div class="row g12"><div class="ico">${I('table', 22)}</div><h2 class="h2">Detailed Audit Table</h2></div>
    <label class="search">${I('search')}<input id="tsearch" placeholder="Search roll number or name…" value="${esc(S.tsearch)}"></label></div><div id="tblBody">${tableBody()}</div></section>`;
}
function dashboard() {
  return installBanner() + compliance() + dupCard() + rosterCard() + filtersCard() + layoutCard() + (S.layout === 'matrix' ? matrixCard() : tableCard());
}
function review() {
  const r = reviewItems(), who = s => `<div class="grow"><b>${esc(s.name)}</b> <span class="mono muted">${esc(s.rollNo)}</span></div>`;
  const sec = (title, n, body, empty) => `<section class="card"><div class="row g12" style="margin-bottom:14px"><h2 class="h2">${title}</h2><span class="pill a">${n}</span></div>${n ? `<div class="list">${body}</div>` : `<div class="muted">${empty}</div>`}</section>`;
  return sec('Awaiting Faculty Approval', r.pending.length, r.pending.map(s => `<div class="item">${who(s)}<span class="pill">${s.files.length} file(s)</span>
      <button class="btn sm" data-act="open" data-id="${s.id}">Open</button><button class="btn sm g" data-act="approve" data-id="${s.id}">${I('check', 14)}Approve</button><button class="btn sm r" data-act="reject" data-id="${s.id}">${I('x', 14)}Reject</button></div>`).join(''), 'No submissions are waiting for review.') +
    sec('Duplicate Submissions', r.dups.length, r.dups.map(g => `<div class="item"><div class="grow"><b>${esc(g.name)}</b> <span class="mono muted">${esc(g.rollNo)}</span> · ${esc(g.category)}</div><span class="pill r">${g.removable} redundant</span><button class="btn sm" data-act="open" data-id="${g.studentId}">Open</button></div>`).join('') +
      `<div><button class="btn r" data-act="rmdups">${I('trash')}Remove All Duplicates (${dupCount()})</button></div>`, 'No duplicates found.') +
    sec('Drive ≠ Sheet Count Mismatches', r.mism.length, r.mism.map(s => `<div class="item">${who(s)}<span class="pill v">${s.files.length} files / ${s.sheetRows.length} rows</span><button class="btn sm" data-act="open" data-id="${s.id}">Open</button></div>`).join('') +
      `<div><button class="btn p" data-act="sync">${I('refresh')}Run Sync to Reconcile</button></div>`, 'Drive files and sheet rows agree for every student.') +
    sec('Rejected — Waiting for Re-upload', r.rej.length, r.rej.map(s => `<div class="item">${who(s)}<span class="muted grow">${esc(s.feedback || '')}</span><button class="btn sm" data-act="open" data-id="${s.id}">Open</button></div>`).join(''), 'No rejected submissions.');
}
function settingsView() {
  const st = S.data.settings;
  const f = (n, l, v, t = 'text') => `<div class="field"><label>${l}</label><input class="in" name="${n}" type="${t}" value="${esc(v)}" required></div>`;
  return `<section class="card"><h2 class="h2" style="margin-bottom:14px">System Controls &amp; Settings</h2>
    <form data-form="settings"><div class="grid2">${f('driveFolderName', 'Google Drive folder name', st.driveFolderName)}${f('driveFolderId', 'Drive folder ID', st.driveFolderId)}
    ${f('spreadsheetName', 'Spreadsheet name', st.spreadsheetName)}${f('sheetName', 'Sheet tab name', st.sheetName)}${f('autoSyncMinutes', 'Auto-sync interval (minutes)', st.autoSyncMinutes, 'number')}</div>
    <div class="row g12" style="margin-top:6px"><button class="btn p" type="submit">Save Settings</button><span class="muted">Authorized admins: ${st.adminEmails.map(esc).join(', ')}</span></div></form></section>
    <section class="card"><div class="row sp" style="margin-bottom:12px"><h2 class="h2">Activity Log</h2><span class="pill">${S.data.audit.length} recent</span></div>
    <div class="tblwrap"><table><thead><tr><th>Time</th><th>User</th><th>Action</th><th>Details</th></tr></thead><tbody>${S.data.audit.slice(0, 60).map(a => `<tr><td>${esc(dt(a.at))}</td><td>${esc(a.user)}</td><td><span class="pill">${esc(a.action)}</span></td><td style="white-space:normal">${esc(a.details)}</td></tr>`).join('')}</tbody></table></div></section>
    <section class="card"><div class="row sp" style="margin-bottom:12px"><h2 class="h2">Student Notifications (sent)</h2><span class="pill">${S.data.notifications.length}</span></div>
    ${S.data.notifications.length ? `<div class="list">${S.data.notifications.slice(0, 15).map(n => `<div class="item"><span class="pill ${n.type === 'APPROVAL' ? 'g' : n.type === 'REJECTION' || n.type === 'DEADLINE' ? 'r' : ''}">${esc(n.type)}</span><span class="mono">${esc(n.rollNo)}</span><b class="grow">${esc(n.title)}</b><span class="muted">${esc(dt(n.at))}</span></div>`).join('')}</div>` : '<div class="muted">No notifications yet.</div>'}</section>
    <section class="card danger"><h2 class="h2">Danger Zone</h2><p class="muted">Resets the database to the seeded roster and deletes every uploaded file.</p><button class="btn r" data-act="reset">${I('trash')}Reset All Data</button></section>`;
}
function render() {
  const app = $('#app');
  if (!S.token || !S.data) { app.innerHTML = loginView(); return; }
  app.innerHTML = header() + `<div class="wrap"><main>${S.tab === 'dash' ? dashboard() : S.tab === 'review' ? review() : settingsView()}</main></div>`;
  $('#status').classList.toggle('off', !S.online); $('#statusText').textContent = S.online ? 'Online • Connected to Server' : 'Offline • Server unreachable';
}

/* ================= modals ================= */
function showModal(html, wide) {
  $('#modal').innerHTML = `<div class="scrim" data-act="closeScrim"><div class="modal ${wide ? 'wide' : ''}" role="dialog" aria-modal="true">${html}</div></div>`;
}
const closeModal = () => { S.modal = null; $('#modal').innerHTML = ''; };
const mHead = (t, sub) => `<div class="row sp" style="margin-bottom:14px"><div><h2 class="h2">${t}</h2>${sub ? `<div class="muted">${sub}</div>` : ''}</div><button class="x" data-act="close">${I('x')}</button></div>`;
function studentModal(id) {
  const s = stu(id); if (!s) return closeModal();
  S.modal = { t: 'student', id };
  const x = dv(s), sw = (k, l) => `<div class="row sp item"><span>${l}</span><button class="sw ${s[k] ? 'on' : ''}" data-act="flag" data-id="${s.id}" data-v="${k}" role="switch" aria-checked="${!!s[k]}"></button></div>`;
  const notes = S.data.notifications.filter(n => n.rollNo === s.rollNo).slice(0, 3);
  showModal(`${mHead(esc(s.name), `<span class="mono">${esc(s.rollNo)}</span> · Seat ${s.seat} · ${esc(s.section)}`)}
    <div class="row g8 wrapf" style="margin-bottom:14px"><span class="pill ${STAT[x.st][1]}">${STAT[x.st][0]}</span><span class="pill ${s.approval === 'APPROVED' ? 'g' : s.approval === 'REJECTED' ? 'r' : 'a'}">${s.approval}</span><span class="pill">${x.nf} Drive file(s)</span><span class="pill">${x.nr} Sheet row(s)</span></div>
    ${s.feedback ? `<div class="err-t" style="margin-bottom:10px">Rejection reason: ${esc(s.feedback)}</div>` : ''}
    <h3 class="h3" style="margin-bottom:8px">Certificates</h3>
    <div class="list" style="margin-bottom:14px">${s.files.length ? s.files.map(f => `<div class="item">${I('file')}<div class="grow"><b>${esc(f.name)}</b><div class="muted" style="font-size:12px">${esc(f.category)}${f.title ? ' · ' + esc(f.title) : ''}${f.size ? ' · ' + Math.ceil(f.size / 1024) + ' KB' : ' · seeded record'}</div></div>
      ${f.stored ? `<button class="btn sm" data-act="viewFile" data-id="${s.id}" data-v="${f.id}">${I('eye', 14)}View</button>` : ''}<button class="btn sm r" data-act="delFile" data-id="${s.id}" data-v="${f.id}">${I('trash', 14)}</button></div>`).join('') : '<div class="muted">No certificates uploaded yet.</div>'}</div>
    <form data-form="upload" data-id="${s.id}" class="item" style="flex-direction:column;align-items:stretch;gap:10px;margin-bottom:14px"><b>Upload certificate</b>
      <div class="grid2"><select class="in" name="category">${CATS.map(c => `<option>${c}</option>`).join('')}</select><input class="in" name="title" placeholder="Event / course title (optional)"></div>
      <input class="in" type="file" name="file" accept=".pdf,.png,.jpg,.jpeg" required><div class="row g8"><button class="btn p" type="submit">${I('upload')}Upload to Drive &amp; Record in Sheet</button><span class="muted" style="font-size:12px">PDF/PNG/JPG, max 10 MB</span></div></form>
    <h3 class="h3" style="margin-bottom:8px">Verification flags</h3><div class="list" style="margin-bottom:14px">${sw('submitted', 'Submitted')}${sw('driveUploaded', 'Drive uploaded')}${sw('sheetUpdated', 'Sheet updated')}</div>
    <div class="row g8 wrapf" style="margin-bottom:14px"><button class="btn g" data-act="approve" data-id="${s.id}">${I('check')}Approve</button><button class="btn r" data-act="reject" data-id="${s.id}">${I('x')}Reject…</button></div>
    ${notes.length ? `<h3 class="h3" style="margin-bottom:8px">Recent notifications</h3><div class="list" style="margin-bottom:14px">${notes.map(n => `<div class="item"><span class="pill">${esc(n.type)}</span><span class="grow">${esc(n.title)}</span><span class="muted">${esc(dt(n.at))}</span></div>`).join('')}</div>` : ''}
    <form data-form="editStu" data-id="${s.id}"><h3 class="h3" style="margin-bottom:8px">Edit record</h3><div class="grid2"><div class="field"><label>Name</label><input class="in" name="name" value="${esc(s.name)}" required></div>
      <div class="field"><label>Section</label><input class="in" name="section" value="${esc(s.section)}" required></div></div>
      <div class="field" style="max-width:180px"><label>Seat number</label><input class="in" type="number" min="1" name="seat" value="${s.seat}"></div>
      <div class="row sp"><button class="btn p" type="submit">Save changes</button><button type="button" class="btn r" data-act="delStu" data-id="${s.id}">${I('trash')}Delete student</button></div></form>`, true);
}
function exportModal(tab) {
  const prev = S.modal && S.modal.t === 'export' ? S.modal.layout : null;
  S.modal = { t: 'export', tab, layout: prev || 'category' };
  const files = S.data.students.flatMap(s => s.files), cats = {}; files.forEach(f => { cats[f.category] = (cats[f.category] || 0) + 1; });
  const avail = files.filter(f => f.stored).length, lay = S.modal.layout;
  const L = [['category', 'By Certificate Category (Recommended)', 'Participation/ , Course/ , Hackathon/ …'], ['category-student', 'Category → Student Subfolders', 'Participation / 25A31A05GB_Name / File.pdf'],
    ['student-category', 'Student → Category Subfolders', '25A31A05GB_Name / Participation / File.pdf'], ['student', 'Student Folders Only', '25A31A05GB_Name / File.pdf']];
  showModal(`${mHead('Drive Organization &amp; Export Hub', 'Reorganize files into folders without altering file names, and export the roster.')}
    <div class="seg" style="margin-bottom:16px;display:inline-flex"><button class="${tab === 'drive' ? 'on' : ''}" data-act="extab" data-v="drive">${I('folder', 16)}Drive Exporter</button><button class="${tab === 'fmt' ? 'on' : ''}" data-act="extab" data-v="fmt">${I('download', 16)}All Export Formats</button></div>
    ${tab === 'drive' ? `<div class="item" style="margin-bottom:14px">${I('shield', 22)}<div><b>Exact existing filenames preserved</b><div class="muted">Original file names stay 100% untouched. No roll number prefixes or random IDs are added.</div></div></div>
      <div class="muted" style="font-weight:800;margin-bottom:8px">FOLDER STRUCTURE LAYOUT</div><div class="grid2" style="margin-bottom:14px">${L.map(([k, n, ex]) => `<button class="opt ${lay === k ? 'on' : ''}" data-act="layoutOpt" data-v="${k}"><b>${n}</b><div class="mono muted" style="font-size:12px;margin-top:4px">${ex}</div></button>`).join('')}</div>
      <div class="muted" style="font-weight:800;margin-bottom:8px">DETECTED CATEGORIES</div><div class="chips" style="margin-bottom:16px">${Object.keys(cats).map(c => `<span class="fchip">${I('folder', 14)}${esc(c)}<span class="n">${cats[c]}</span></span>`).join('') || '<span class="muted">No files yet.</span>'}</div>
      <div class="row g12 wrapf"><button class="btn p" data-act="zip" ${avail ? '' : 'disabled'}>${I('download')}Download organized ZIP (${avail} file${avail === 1 ? '' : 's'})</button><button class="btn" data-act="plan">${I('file')}Download folder plan (JSON)</button></div>
      <p class="muted" style="font-size:12.5px">The ZIP contains documents uploaded through this server. Seeded demo records have no document to include. This server does not create folders in a real Google Drive account.</p>`
    : `<div class="grid2"><button class="opt" data-act="fmtdl" data-v="csv"><b>CSV</b><div class="muted">Roster with status, counts and approvals</div></button><button class="opt" data-act="fmtdl" data-v="xls"><b>Excel (.xls)</b><div class="muted">Opens in Excel / Sheets</div></button>
      <button class="opt" data-act="fmtdl" data-v="json"><b>JSON</b><div class="muted">Full database snapshot incl. file metadata</div></button></div>`}`, true);
}
function remindModal() {
  const d = defaulters(), pv = d.slice(0, 10).map(s => s.rollNo).join(', '), more = d.length > 10 ? ` and ${d.length - 10} others` : '';
  const text = `📢 *URGENT CERTIFICATE SUBMISSION REMINDER* 📢\nDear Students,\nPlease upload your Hackathon/Course/Activity certificates on *Certifyx* for NAAC & Accreditation records immediately.\n\n*Pending Roll Numbers (${d.length} students)*:\n${pv}${more}\n\n👉 Please submit your PDF certificate directly via Certifyx Portal. Ensure your Roll Number matches.`;
  S.modal = { t: 'remind', text };
  showModal(`${mHead('Remind Defaulters', `${d.length} students have pending requirements`)}<pre class="wa">${esc(text)}</pre>
    <div class="row g12 wrapf" style="margin-top:14px"><button class="btn o" data-act="sendRemind">${I('send')}Send to ${d.length} student inboxes</button><button class="btn" data-act="copyText">${I('copy')}Copy for WhatsApp</button></div>`);
}
function instructionsModal() {
  showModal(`${mHead('Install Certifyx')}<div class="list"><div class="item"><b>Chrome / Edge (desktop &amp; Android)</b><span class="muted">Open the browser menu → “Install Certifyx” (or use the Install App button).</span></div>
    <div class="item"><b>iPhone / iPad (Safari)</b><span class="muted">Tap Share → “Add to Home Screen”.</span></div>
    <div class="item"><b>Requirement</b><span class="muted">Installation needs HTTPS (or localhost).</span></div></div>`);
}
function formModal(title, body, formName, submit, id) {
  showModal(`${mHead(title)}<form data-form="${formName}" ${id ? `data-id="${id}"` : ''}>${body}<div class="row g12" style="margin-top:6px"><button class="btn p" type="submit">${submit}</button><button type="button" class="btn" data-act="close">Cancel</button></div></form>`);
}
function manageModal(q = '') {
  const rows = S.data.students.filter(s => !q || s.rollNo.toLowerCase().includes(q.toLowerCase()) || s.name.toLowerCase().includes(q.toLowerCase()));
  S.modal = { t: 'manage' };
  showModal(`${mHead('Manage Roster', `${S.data.students.length} students`)}<label class="search" style="margin-bottom:12px">${I('search')}<input id="msrch" placeholder="Search…" value="${esc(q)}"></label>
    <div class="list">${rows.slice(0, 120).map(s => `<div class="item"><span class="mono muted">${s.seat}</span><span class="mono">${esc(s.rollNo)}</span><span class="grow">${esc(s.name)}</span><button class="btn sm" data-act="open" data-id="${s.id}">Open</button><button class="btn sm r" data-act="delStu" data-id="${s.id}">${I('trash', 14)}</button></div>`).join('')}</div>`, true);
  const i = $('#msrch'); if (i) { i.focus(); i.setSelectionRange(q.length, q.length); }
}
function rejectModal(id) {
  const s = stu(id); S.modal = { t: 'reject', id };
  formModal('Request Re-upload', `<p class="muted">Tell ${esc(s.name)} why the certificate was rejected:</p><div class="field"><label>Reason</label><input class="in" name="reason" value="Blurry document / ineligible date" required></div>`, 'reject', 'Send rejection', id);
}

/* ================= actions ================= */
async function refresh(keepModal = true) {
  S.data = await api('/api/bootstrap'); render();
  const oldM = $('#modal .modal'), top = oldM ? oldM.scrollTop : 0;
  if (keepModal && S.modal) { if (S.modal.t === 'student') studentModal(S.modal.id); else if (S.modal.t === 'manage') manageModal($('#msrch') ? $('#msrch').value : ''); else if (S.modal.t === 'export') exportModal(S.modal.tab);
    const nm = $('#modal .modal'); if (nm) nm.scrollTop = top; }
}
async function download(path, fallback) {
  const r = await api(path, { raw: true }), b = await r.blob(), cd = r.headers.get('Content-Disposition') || '', m = cd.match(/filename="?([^";]+)"?/);
  const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = m ? decodeURIComponent(m[1]) : fallback; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
function logout(expired) { S.token = ''; S.data = null; localStorage.removeItem('cx_token'); closeModal(); render(); if (expired) toast('Session expired. Please sign in again.', true); }
const ACT = {
  tab: v => { S.tab = v; render(); }, theme: () => { S.dark = !S.dark; localStorage.setItem('cx_dark', S.dark ? '1' : '0'); document.documentElement.classList.toggle('dark', S.dark); render(); },
  logout: () => logout(), dismissBanner: () => { S.banner = false; localStorage.setItem('cx_banner', '0'); render(); },
  filter: v => { S.filter = v; S.page = 1; render(); }, layout: v => { S.layout = v; render(); }, mview: v => { S.mview = v; render(); }, mstatus: v => { S.mstatus = v; render(); },
  page: v => { S.page += +v; $('#tblBody').innerHTML = tableBody(); },
  sync: async () => { const b = $('#syncBtn'); if (b) b.disabled = true; const r = await act(() => api('/api/sync', { method: 'POST' }), r => `Synchronization complete — ${r.driveFiles} files, ${r.sheetRows} rows, ${r.repaired} repair(s).`); await refresh(); },
  drive: () => toast(`Drive folder: ${S.data.settings.driveFolderName} (${S.data.settings.driveFolderId})`),
  proof: () => toast(`Sheet: ${S.data.settings.spreadsheetName} › ${S.data.settings.sheetName} — ${S.data.students.reduce((a, s) => a + s.sheetRows.length, 0)} rows`),
  export: () => exportModal('drive'), extab: v => exportModal(v), layoutOpt: v => { S.modal.layout = v; exportModal(S.modal.tab); },
  zip: () => act(() => download('/api/export/zip?layout=' + (S.modal.layout || 'category'), 'certifyx-export.zip')),
  plan: () => act(async () => { const p = await api('/api/export/plan?layout=' + (S.modal.layout || 'category')); const b = new Blob([JSON.stringify(p, null, 2)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'drive-folder-plan.json'; a.click(); }),
  fmtdl: v => act(() => download('/api/export/' + v, 'certifyx-roster.' + v), 'Download started.'),
  install: async () => { if (S.installEvt) { S.installEvt.prompt(); S.installEvt = null; } else instructionsModal(); }, howto: () => instructionsModal(),
  remind: () => remindModal(), copyText: () => navigator.clipboard.writeText(S.modal.text).then(() => toast('Reminder text copied.'), () => toast('Copy failed.', true)),
  sendRemind: async () => { await act(() => api('/api/remind', { method: 'POST' }), r => `Reminder sent to ${r.sent} students' inboxes.`); closeModal(); await refresh(false); },
  addStu: () => formModal('Add Student', `<div class="field"><label>Roll number</label><input class="in" name="rollNo" required></div><div class="field"><label>Full name</label><input class="in" name="name" required></div><div class="field"><label>Section</label><input class="in" name="section" value="CSE-C (2025-26)"></div>`, 'addStu', 'Add student'),
  import: () => formModal('Batch Import Students', `<p class="muted">Paste lines in <b>RollNumber, StudentName</b> format (comma, tab or semicolon separated).</p><div class="field"><label>Section</label><input class="in" name="section" value="CSE-C (2025-26)"></div><div class="field"><label>Student list</label><textarea class="in" name="text" placeholder="25A31A05GJ, KOPPAKA SRAVANI" required></textarea></div>`, 'import', 'Import students'),
  manage: () => manageModal(), open: id => studentModal(id), close: () => closeModal(), closeScrim: (v, el, e) => { if (e.target === el) closeModal(); },
  flag: async (id, el) => { const k = el.dataset.v, s = stu(id); await act(() => api('/api/students/' + id, { method: 'PUT', body: { [k]: !s[k] } })); await refresh(); },
  approve: async id => { await act(() => api(`/api/students/${id}/review`, { method: 'POST', body: { action: 'approve' } }), 'Certificate approved.'); await refresh(); },
  reject: id => rejectModal(id),
  viewFile: async (id, el) => { await act(async () => { const r = await api(`/api/files/${id}/${el.dataset.v}`, { raw: true }); const u = URL.createObjectURL(await r.blob()); window.open(u, '_blank'); }); },
  delFile: async (id, el) => { if (!confirm('Delete this certificate file?')) return; await act(() => api(`/api/files/${id}/${el.dataset.v}`, { method: 'DELETE' }), 'File removed.'); await refresh(); },
  delStu: async id => { const s = stu(id); if (!confirm(`Remove ${s.name} (${s.rollNo}) and all their files?`)) return; await act(() => api('/api/students/' + id, { method: 'DELETE' }), 'Student removed.'); if (S.modal && S.modal.t === 'student') closeModal(); await refresh(); },
  rmdups: async () => { if (!confirm(`Remove ${dupCount()} redundant copies? The newest copy of each is kept.`)) return; await act(() => api('/api/duplicates/remove', { method: 'POST' }), r => `Removed ${r.removed} duplicate submissions.`); await refresh(); },
  reset: async () => { if (!confirm('Reset ALL data to the seeded roster and delete every uploaded file?')) return; await act(() => api('/api/reset', { method: 'POST' }), 'Database reset.'); await refresh(false); }
};
const FORMS = {
  login: async f => {
    try {
      const r = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify({ email: f.email.value, password: f.password.value }) });
      const contentType = r.headers.get('content-type') || '';
      const raw = await r.text();
      let j;
      try { j = raw ? JSON.parse(raw) : {}; }
      catch (_) {
        const preview = raw.replace(/\s+/g, ' ').slice(0, 140);
        throw new Error(`Login API returned non-JSON (HTTP ${r.status}, ${contentType || 'unknown content type'}). ${preview || 'Empty response'} Check the Vercel API route and deployment logs.`);
      }
      if (!r.ok) throw new Error(j.error || `Login failed (HTTP ${r.status}).`);
      if (!j.token) throw new Error('Login API response did not include a token. Check the backend deployment.');
      S.token = j.token; S.user = j.user; localStorage.setItem('cx_token', S.token); await boot();
    } catch (e) { $('#loginErr').textContent = e.message || 'Unable to sign in.'; }
  },
  settings: async f => { await act(() => api('/api/settings', { method: 'PUT', body: { driveFolderName: f.driveFolderName.value, driveFolderId: f.driveFolderId.value, spreadsheetName: f.spreadsheetName.value, sheetName: f.sheetName.value, autoSyncMinutes: +f.autoSyncMinutes.value } }), 'Settings saved.'); await refresh(); },
  addStu: async f => { const r = await act(() => api('/api/students', { method: 'POST', body: { rollNo: f.rollNo.value, name: f.name.value, section: f.section.value } }), 'Student added.'); if (r) { closeModal(); await refresh(false); } },
  import: async f => { const r = await act(() => api('/api/students/import', { method: 'POST', body: { text: f.text.value, section: f.section.value } }), r => `Imported ${r.added} students (${r.skipped} duplicates skipped).`); if (r) { closeModal(); await refresh(false); } },
  editStu: async (f, id) => { await act(() => api('/api/students/' + id, { method: 'PUT', body: { name: f.name.value, section: f.section.value, seat: parseInt(f.seat.value, 10) } }), 'Record updated.'); await refresh(); },
  reject: async (f, id) => { const r = await act(() => api(`/api/students/${id}/review`, { method: 'POST', body: { action: 'reject', reason: f.reason.value } }), 'Rejection sent to student.'); if (r) { closeModal(); await refresh(false); } },
  upload: async (f, id) => {
    const file = f.file.files[0]; if (!file) return;
    if (file.size > 10 * 1024 * 1024) return toast('File is larger than 10 MB.', true);
    const data = await new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.onerror = rej; fr.readAsDataURL(file); });
    await act(() => api(`/api/students/${id}/upload`, { method: 'POST', body: { fileName: file.name, category: f.category.value, title: f.title.value, dataBase64: data } }), 'Certificate uploaded and recorded.'); await refresh();
  }
};
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]'); if (!el) return;
  const fn = ACT[el.dataset.act]; if (fn) fn(el.dataset.id || el.dataset.v, el, e);
});
document.addEventListener('submit', e => { const f = e.target.closest('[data-form]'); if (!f) return; e.preventDefault(); const fn = FORMS[f.dataset.form]; if (fn) fn(f, f.dataset.id); });
document.addEventListener('input', e => {
  if (e.target.id === 'msearch') { S.msearch = e.target.value; $('#matrixBody').innerHTML = matrixBody(); }
  else if (e.target.id === 'tsearch') { S.tsearch = e.target.value; S.page = 1; $('#tblBody').innerHTML = tableBody(); }
  else if (e.target.id === 'msrch') manageModal(e.target.value);
});
document.addEventListener('keydown', e => { if (e.key === 'Escape' && S.modal) closeModal(); });
const hud = $('#hud');
document.addEventListener('mouseover', e => {
  const el = e.target.closest('[data-hud]'); if (!el) return;
  const s = stu(el.dataset.hud); if (!s) return; const x = dv(s), r = el.getBoundingClientRect();
  hud.innerHTML = `<b>${esc(s.name)}</b><div class="mono muted">${esc(s.rollNo)} · Seat ${s.seat}</div><div style="margin:6px 0"><span class="pill ${STAT[x.st][1]}">${STAT[x.st][0]}</span> <span class="pill ${s.approval === 'APPROVED' ? 'g' : s.approval === 'REJECTED' ? 'r' : 'a'}">${s.approval}</span></div>
    <div>Drive: <b class="${s.driveUploaded ? 'yes' : 'no'}">${s.driveUploaded ? 'Yes' : 'No'}</b> (${x.nf}) · Sheet: <b class="${s.sheetUpdated ? 'yes' : 'no'}">${s.sheetUpdated ? 'Yes' : 'No'}</b> (${x.nr}) · Submitted: <b class="${s.submitted ? 'yes' : 'no'}">${s.submitted ? 'Yes' : 'No'}</b></div>`;
  hud.classList.remove('hide');
  const w = hud.offsetWidth, h = hud.offsetHeight; let left = r.left + r.width / 2 - w / 2, top = r.bottom + 8;
  left = Math.max(8, Math.min(innerWidth - w - 8, left)); if (top + h > innerHeight - 8) top = r.top - h - 8;
  hud.style.left = left + 'px'; hud.style.top = top + 'px';
});
document.addEventListener('mouseout', e => { if (e.target.closest && e.target.closest('[data-hud]')) hud.classList.add('hide'); });
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); S.installEvt = e; });

/* ================= boot ================= */
async function boot() {
  if (!S.token) { render(); return; }
  try { S.user = await api('/api/me'); S.data = await api('/api/bootstrap'); render(); toast(`Loaded ${S.data.students.length} students and roster from the server database.`); }
  catch (e) { render(); }
}
async function ping() {
  try { const r = await fetch('/api/health', { cache: 'no-store' }); S.online = r.ok; } catch (e) { S.online = false; }
  $('#status').classList.toggle('off', !S.online); $('#statusText').textContent = S.online ? 'Online • Connected to Server' : 'Offline • Server unreachable';
}
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) navigator.serviceWorker.register('/sw.js').catch(() => {});
setInterval(ping, 15000); ping(); boot();
