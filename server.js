'use strict';
/* Certifyx Web — zero-dependency Node.js backend (Node 18+).
   Serves /public and a JSON REST API. Data lives in DATA_DIR/db.json, uploaded files in DATA_DIR/uploads. */
const http = require('http'), fs = require('fs'), path = require('path'), crypto = require('crypto');

const PORT = +process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const UPLOADS = path.join(DATA_DIR, 'uploads');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const PUBLIC = path.join(__dirname, 'public');
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'jayaramsappa09@gmail.com').toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const ADMIN_NAME = process.env.ADMIN_NAME || 'Jayaram Sappa';
const MAX_BODY = 15 * 1024 * 1024;
const MAX_FILE = 10 * 1024 * 1024;
fs.mkdirSync(UPLOADS, { recursive: true });

/* ---------- helpers ---------- */
const now = () => new Date().toISOString();
const uid = (p = 'id') => p + '_' + crypto.randomBytes(6).toString('hex');
const safeName = s => String(s).replace(/[\\/:*?"<>|\u0000-\u001f]/g, '_').slice(0, 150) || 'file';
const eqi = (a, b) => String(a).toLowerCase() === String(b).toLowerCase();
const blank = s => s == null || String(s).trim() === '';
const verified = s => s.driveUploaded && s.sheetUpdated && s.submitted;

/* ---------- database ---------- */
let db;
function seedDb() {
  const seed = JSON.parse(fs.readFileSync(path.join(__dirname, 'seed.json'), 'utf8'));
  const t = now();
  const students = seed.roster.map(([rollNo, name], i) => {
    const certs = seed.certs[rollNo] || [];
    const s = { id: uid('stu'), rollNo, name, section: 'CSE-C (2025-26)', seat: i + 1, submitted: certs.length > 0,
      driveUploaded: certs.length > 0, sheetUpdated: certs.length > 0, approval: 'PENDING', feedback: null,
      files: certs.map(c => ({ id: uid('f'), name: `${rollNo}_${c}.pdf`, category: c, title: c, size: 0, hash: null, uploadedAt: t, stored: null })),
      sheetRows: certs.map(c => ({ id: uid('r'), category: c, title: c, at: t })), updatedAt: t };
    return s;
  });
  return { meta: { secret: crypto.randomBytes(32).toString('hex'), created: t },
    settings: { driveFolderName: 'Class Certificates 2026', driveFolderId: 'root', spreadsheetName: 'Student Certificate Submissions (Responses)',
      sheetName: 'Form Responses 1', autoSyncMinutes: 5, adminEmails: [ADMIN_EMAIL], lastSync: t },
    students, notifications: [], audit: [{ id: uid('a'), at: t, user: 'system', action: 'INITIALIZE', details: `Seeded database with ${students.length} students.` }] };
}
function load() {
  try { db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); } catch (e) { db = seedDb(); save(); }
}
function save() {
  const tmp = DB_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(db)); fs.renameSync(tmp, DB_FILE);
}
function audit(user, action, details) {
  db.audit.unshift({ id: uid('a'), at: now(), user: user || 'system', action, details });
  if (db.audit.length > 500) db.audit.length = 500;
}
load();

/* ---------- auth (HMAC-signed bearer tokens) ---------- */
const b64 = b => Buffer.from(b).toString('base64url');
function sign(payload) { const p = b64(JSON.stringify(payload)); return p + '.' + crypto.createHmac('sha256', db.meta.secret).update(p).digest('base64url'); }
function verifyToken(tok) {
  if (!tok || !tok.includes('.')) return null;
  const [p, sig] = tok.split('.');
  const exp = crypto.createHmac('sha256', db.meta.secret).update(p).digest('base64url');
  const a = Buffer.from(sig), b = Buffer.from(exp);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try { const d = JSON.parse(Buffer.from(p, 'base64url').toString()); return d.exp > Date.now() ? d : null; } catch (e) { return null; }
}
const attempts = new Map();
function rateLimited(ip) {
  const t = Date.now(), a = (attempts.get(ip) || []).filter(x => t - x < 60000); a.push(t); attempts.set(ip, a); return a.length > 10;
}

/* ---------- ZIP (store-only) ---------- */
const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
const crc32 = buf => { let c = 0xFFFFFFFF; for (let i = 0; i < buf.length; i++) c = CRC[(c ^ buf[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
function makeZip(entries) {
  const parts = [], central = []; let off = 0;
  for (const e of entries) {
    const name = Buffer.from(e.name, 'utf8'), crc = crc32(e.data);
    const lh = Buffer.alloc(30); lh.writeUInt32LE(0x04034b50, 0); lh.writeUInt16LE(20, 4); lh.writeUInt16LE(0x0800, 6);
    lh.writeUInt16LE(0, 8); lh.writeUInt16LE(0, 10); lh.writeUInt16LE(0x21, 12); lh.writeUInt32LE(crc, 14);
    lh.writeUInt32LE(e.data.length, 18); lh.writeUInt32LE(e.data.length, 22); lh.writeUInt16LE(name.length, 26);
    parts.push(lh, name, e.data);
    const ch = Buffer.alloc(46); ch.writeUInt32LE(0x02014b50, 0); ch.writeUInt16LE(20, 4); ch.writeUInt16LE(20, 6); ch.writeUInt16LE(0x0800, 8);
    ch.writeUInt16LE(0, 10); ch.writeUInt16LE(0, 12); ch.writeUInt16LE(0x21, 14); ch.writeUInt32LE(crc, 16);
    ch.writeUInt32LE(e.data.length, 20); ch.writeUInt32LE(e.data.length, 24); ch.writeUInt16LE(name.length, 28); ch.writeUInt32LE(off, 42);
    central.push(ch, name);
    off += 30 + name.length + e.data.length;
  }
  const cd = Buffer.concat(central), end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(entries.length, 8); end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(cd.length, 12); end.writeUInt32LE(off, 16);
  return Buffer.concat([...parts, cd, end]);
}

/* ---------- domain logic ---------- */
function findStudent(id) { return db.students.find(s => s.id === id); }
function touch(s) { s.updatedAt = now(); }
function duplicateGroups() {
  const out = [];
  db.students.forEach(s => {
    const by = {};
    s.files.forEach(f => { (by[f.category.toLowerCase()] = by[f.category.toLowerCase()] || []).push(f); });
    Object.values(by).filter(g => g.length > 1).forEach(g => out.push({ studentId: s.id, rollNo: s.rollNo, name: s.name, category: g[0].category,
      fileIds: g.map(f => f.id), removable: g.length - 1 }));
  });
  return out;
}
function removeFile(s, fileId) {
  const i = s.files.findIndex(f => f.id === fileId); if (i < 0) return false;
  const [f] = s.files.splice(i, 1);
  if (f.stored) fs.rm(path.join(UPLOADS, f.stored), { force: true }, () => {});
  const ri = s.sheetRows.findIndex(r => r.category.toLowerCase() === f.category.toLowerCase());
  if (ri >= 0) s.sheetRows.splice(ri, 1);
  if (!s.files.length) { s.driveUploaded = false; }
  if (!s.sheetRows.length) { s.sheetUpdated = false; }
  if (!s.files.length && !s.sheetRows.length) s.submitted = false;
  touch(s); return true;
}
function runSync(user) {
  let repaired = 0, files = 0, rows = 0;
  db.students.forEach(s => {
    s.files.forEach(f => { if (!s.sheetRows.some(r => r.category.toLowerCase() === f.category.toLowerCase())) { s.sheetRows.push({ id: uid('r'), category: f.category, title: f.title, at: now() }); repaired++; } });
    const d = s.files.length > 0, sh = s.sheetRows.length > 0;
    if (d !== s.driveUploaded || sh !== s.sheetUpdated) { s.driveUploaded = d; s.sheetUpdated = sh; repaired++; }
    files += s.files.length; rows += s.sheetRows.length;
  });
  db.settings.lastSync = now();
  const rep = { at: db.settings.lastSync, studentsChecked: db.students.length, driveFiles: files, sheetRows: rows, repaired };
  audit(user, 'RUN_SYNC', `Reconciled ${files} Drive files and ${rows} sheet rows for ${db.students.length} students (${repaired} repairs).`);
  return rep;
}
function notify(rollNo, title, message, type) {
  db.notifications.unshift({ id: uid('n'), rollNo, title, message, type, at: now(), read: false });
  if (db.notifications.length > 1000) db.notifications.length = 1000;
}
function folderPlan(layout) {
  const lay = ['category', 'category-student', 'student-category', 'student'].includes(layout) ? layout : 'category';
  const items = [];
  db.students.forEach(s => s.files.forEach(f => {
    const stu = safeName(`${s.rollNo}_${s.name}`), cat = safeName(f.category), fn = safeName(f.name);
    const p = lay === 'category' ? `${cat}/${fn}` : lay === 'category-student' ? `${cat}/${stu}/${fn}` : lay === 'student-category' ? `${stu}/${cat}/${fn}` : `${stu}/${fn}`;
    items.push({ path: p, rollNo: s.rollNo, studentId: s.id, fileId: f.id, available: !!f.stored });
  }));
  const cats = {}; db.students.forEach(s => s.files.forEach(f => { cats[f.category] = (cats[f.category] || 0) + 1; }));
  return { layout: lay, root: db.settings.driveFolderName, categories: cats, items };
}
const csvCell = v => { v = v == null ? '' : String(v); return /[",\n\r]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
function rosterRows() {
  return db.students.map(s => [s.seat, s.rollNo, s.name, s.section, s.files.length, s.sheetRows.length, s.submitted ? 'Yes' : 'No',
    s.driveUploaded ? 'Yes' : 'No', s.sheetUpdated ? 'Yes' : 'No', verified(s) ? 'VERIFIED' : 'PENDING', s.approval, s.feedback || '',
    s.files.map(f => f.category).join('; ')]);
}
const ROSTER_HEAD = ['Seat', 'RollNo', 'Name', 'Section', 'DriveFiles', 'SheetRows', 'Submitted', 'DriveUploaded', 'SheetUpdated', 'Status', 'Approval', 'Feedback', 'Categories'];

/* ---------- routing ---------- */
const routes = [];
const route = (m, p, h, auth = true) => routes.push({ m, re: new RegExp('^' + p.replace(/:(\w+)/g, '(?<$1>[^/]+)') + '$'), h, auth });
const send = (res, code, body, headers = {}) => {
  const isBuf = Buffer.isBuffer(body), data = isBuf || typeof body === 'string' ? body : JSON.stringify(body);
  res.writeHead(code, Object.assign({ 'Content-Type': isBuf || typeof body === 'string' ? 'text/plain; charset=utf-8' : 'application/json; charset=utf-8',
    'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'no-store' }, headers));
  res.end(data);
};
const fail = (res, code, msg) => send(res, code, { error: msg });

route('GET', '/api/health', (q, res) => send(res, 200, { ok: true, time: now(), students: db.students.length }), false);
route('POST', '/api/login', (q, res, c) => {
  if (rateLimited(q.socket.remoteAddress)) return fail(res, 429, 'Too many attempts. Try again in a minute.');
  const { email, password } = c.body || {};
  const okEmail = db.settings.adminEmails.some(e => eqi(e, email || ''));
  const a = Buffer.from(String(password || '')), b = Buffer.from(ADMIN_PASSWORD);
  const okPw = a.length === b.length && crypto.timingSafeEqual(a, b);
  if (!okEmail || !okPw) { audit('anonymous', 'LOGIN_FAILED', `Failed login for ${String(email).slice(0, 80)}`); save(); return fail(res, 401, 'Invalid email or password.'); }
  audit(email, 'LOGIN', 'Admin signed in.'); save();
  send(res, 200, { token: sign({ email: String(email).toLowerCase(), exp: Date.now() + 12 * 3600e3 }), user: { email, name: ADMIN_NAME, role: 'Authorized Admin' } });
}, false);
route('GET', '/api/me', (q, res, c) => send(res, 200, { email: c.user.email, name: ADMIN_NAME, role: 'Authorized Admin' }));
route('GET', '/api/bootstrap', (q, res) => send(res, 200, { settings: db.settings, students: db.students, audit: db.audit.slice(0, 100),
  notifications: db.notifications.slice(0, 50), duplicates: duplicateGroups() }));

route('POST', '/api/students', (q, res, c) => {
  const { rollNo, name, section } = c.body || {};
  if (blank(rollNo) || blank(name)) return fail(res, 400, 'Roll number and name are required.');
  if (db.students.some(s => eqi(s.rollNo, rollNo.trim()))) return fail(res, 409, 'A student with this roll number already exists.');
  const seat = db.students.reduce((m, s) => Math.max(m, s.seat || 0), 0) + 1;
  const s = { id: uid('stu'), rollNo: rollNo.trim(), name: name.trim(), section: blank(section) ? 'CSE-C (2025-26)' : section.trim(), seat, submitted: false,
    driveUploaded: false, sheetUpdated: false, approval: 'PENDING', feedback: null, files: [], sheetRows: [], updatedAt: now() };
  db.students.push(s); audit(c.user.email, 'ADD_STUDENT', `Added ${s.rollNo} (${s.name}).`); save(); send(res, 201, s);
});
route('POST', '/api/students/import', (q, res, c) => {
  const { text, section } = c.body || {};
  const sec = blank(section) ? 'CSE-C (2025-26)' : section.trim();
  let added = 0, skipped = 0;
  String(text || '').split(/\r\n|\n|\r/).map(l => l.trim()).filter(Boolean).forEach(line => {
    const p = line.split(/[,\t;]/).map(x => x.trim());
    if (p.length < 2 || blank(p[0]) || blank(p[1]) || eqi(p[0], 'rollno') || eqi(p[0], 'roll number')) return;
    if (db.students.some(s => eqi(s.rollNo, p[0]))) { skipped++; return; }
    const seat = db.students.reduce((m, s) => Math.max(m, s.seat || 0), 0) + 1;
    db.students.push({ id: uid('stu'), rollNo: p[0], name: p[1], section: sec, seat, submitted: false, driveUploaded: false, sheetUpdated: false,
      approval: 'PENDING', feedback: null, files: [], sheetRows: [], updatedAt: now() }); added++;
  });
  if (added) audit(c.user.email, 'IMPORT_ROSTER', `Imported ${added} students into '${sec}' (${skipped} duplicates skipped).`);
  save(); send(res, 200, { added, skipped });
});
route('PUT', '/api/students/:id', (q, res, c) => {
  const s = findStudent(c.params.id); if (!s) return fail(res, 404, 'Student not found.');
  const b = c.body || {};
  if (typeof b.name === 'string' && !blank(b.name)) s.name = b.name.trim();
  if (typeof b.section === 'string' && !blank(b.section)) s.section = b.section.trim();
  if (Number.isInteger(b.seat) && b.seat > 0) s.seat = b.seat;
  ['submitted', 'driveUploaded', 'sheetUpdated'].forEach(k => { if (typeof b[k] === 'boolean') s[k] = b[k]; });
  touch(s); audit(c.user.email, 'UPDATE_STUDENT', `Updated ${s.rollNo}: ${Object.keys(b).join(', ')}.`); save(); send(res, 200, s);
});
route('DELETE', '/api/students/:id', (q, res, c) => {
  const i = db.students.findIndex(s => s.id === c.params.id); if (i < 0) return fail(res, 404, 'Student not found.');
  const [s] = db.students.splice(i, 1);
  s.files.forEach(f => f.stored && fs.rm(path.join(UPLOADS, f.stored), { force: true }, () => {}));
  audit(c.user.email, 'DELETE_STUDENT', `Removed ${s.rollNo} (${s.name}).`); save(); send(res, 200, { ok: true });
});
route('POST', '/api/students/:id/upload', (q, res, c) => {
  const s = findStudent(c.params.id); if (!s) return fail(res, 404, 'Student not found.');
  const { fileName, category, title, dataBase64 } = c.body || {};
  if (blank(fileName) || blank(category) || blank(dataBase64)) return fail(res, 400, 'File, category and data are required.');
  if (!/\.(pdf|png|jpe?g)$/i.test(fileName)) return fail(res, 400, 'Only PDF, PNG or JPG files are allowed.');
  const buf = Buffer.from(String(dataBase64).replace(/^data:[^,]*,/, ''), 'base64');
  if (!buf.length) return fail(res, 400, 'The file is empty.');
  if (buf.length > MAX_FILE) return fail(res, 413, 'File is larger than 10 MB.');
  const hash = crypto.createHash('sha256').update(buf).digest('hex');
  const id = uid('f'), stored = path.join(s.id, id + '_' + safeName(fileName));
  fs.mkdirSync(path.join(UPLOADS, s.id), { recursive: true }); fs.writeFileSync(path.join(UPLOADS, stored), buf);
  const f = { id, name: safeName(fileName), category: String(category).trim().slice(0, 60), title: String(title || '').trim().slice(0, 120), size: buf.length, hash, uploadedAt: now(), stored };
  s.files.unshift(f); s.sheetRows.unshift({ id: uid('r'), category: f.category, title: f.title, at: now() });
  s.driveUploaded = true; s.sheetUpdated = true; s.submitted = true; s.approval = 'PENDING'; s.feedback = null; touch(s);
  notify(s.rollNo, 'Certificate received', `Your ${f.category} certificate (${f.name}) was received and is awaiting faculty review.`, 'NOTICE');
  audit(c.user.email, 'UPLOAD_CERTIFICATE', `${s.rollNo} (${s.name}): ${f.name} [${f.category}].`); save(); send(res, 201, { student: s, file: f });
});
route('GET', '/api/files/:sid/:fid', (q, res, c) => {
  const s = findStudent(c.params.sid), f = s && s.files.find(x => x.id === c.params.fid);
  if (!f) return fail(res, 404, 'File not found.');
  if (!f.stored) return fail(res, 404, 'This is a seeded record without an uploaded document.');
  const full = path.join(UPLOADS, f.stored);
  if (!full.startsWith(UPLOADS) || !fs.existsSync(full)) return fail(res, 404, 'File missing on disk.');
  const type = /\.pdf$/i.test(f.name) ? 'application/pdf' : /\.png$/i.test(f.name) ? 'image/png' : 'image/jpeg';
  send(res, 200, fs.readFileSync(full), { 'Content-Type': type, 'Content-Disposition': `inline; filename="${encodeURIComponent(f.name)}"` });
});
route('DELETE', '/api/files/:sid/:fid', (q, res, c) => {
  const s = findStudent(c.params.sid); if (!s || !removeFile(s, c.params.fid)) return fail(res, 404, 'File not found.');
  audit(c.user.email, 'DELETE_FILE', `Removed a file from ${s.rollNo}.`); save(); send(res, 200, s);
});
route('POST', '/api/students/:id/review', (q, res, c) => {
  const s = findStudent(c.params.id); if (!s) return fail(res, 404, 'Student not found.');
  const { action, reason } = c.body || {};
  if (action === 'approve') {
    s.approval = 'APPROVED'; s.feedback = null;
    notify(s.rollNo, 'Certificate approved', 'Your certificate has been verified and added to the accreditation records.', 'APPROVAL');
  } else if (action === 'reject') {
    if (blank(reason)) return fail(res, 400, 'A rejection reason is required.');
    s.approval = 'REJECTED'; s.feedback = reason.trim().slice(0, 300);
    notify(s.rollNo, 'Re-upload required', `Your certificate was not accepted. Reason: ${s.feedback}. Please upload a clear copy.`, 'REJECTION');
  } else return fail(res, 400, 'Unknown review action.');
  touch(s); audit(c.user.email, action === 'approve' ? 'APPROVE' : 'REJECT', `${s.rollNo} (${s.name})${s.feedback ? ': ' + s.feedback : ''}`); save(); send(res, 200, s);
});
route('GET', '/api/duplicates', (q, res) => send(res, 200, duplicateGroups()));
route('POST', '/api/duplicates/remove', (q, res, c) => {
  let removed = 0;
  duplicateGroups().forEach(g => {
    const s = findStudent(g.studentId); if (!s) return;
    const group = g.fileIds.map(id => s.files.find(f => f.id === id)).filter(Boolean).sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
    group.slice(1).forEach(f => { s.files = s.files.filter(x => x.id !== f.id); if (f.stored) fs.rm(path.join(UPLOADS, f.stored), { force: true }, () => {}); removed++; });
    const keep = s.sheetRows.filter(r => r.category.toLowerCase() === g.category.toLowerCase());
    keep.slice(1).forEach(r => { s.sheetRows = s.sheetRows.filter(x => x.id !== r.id); });
    touch(s);
  });
  audit(c.user.email, 'REMOVE_DUPLICATES', `Removed ${removed} redundant copies (kept the newest of each).`); save(); send(res, 200, { removed });
});
route('POST', '/api/sync', (q, res, c) => { const r = runSync(c.user.email); save(); send(res, 200, r); });
route('POST', '/api/remind', (q, res, c) => {
  const d = db.students.filter(s => !verified(s) || s.approval === 'REJECTED');
  d.forEach(s => notify(s.rollNo, 'Urgent: upload your pending certificate',
    'Your certificate submission is pending. Please upload your PDF certificate via Certifyx immediately for NAAC compliance.', 'DEADLINE'));
  audit(c.user.email, 'REMIND_DEFAULTERS', `Sent reminder to ${d.length} students.`); save(); send(res, 200, { sent: d.length });
});
route('PUT', '/api/settings', (q, res, c) => {
  const b = c.body || {}, st = db.settings;
  ['driveFolderName', 'driveFolderId', 'spreadsheetName', 'sheetName'].forEach(k => { if (typeof b[k] === 'string' && !blank(b[k])) st[k] = b[k].trim().slice(0, 150); });
  if (Number.isInteger(b.autoSyncMinutes) && b.autoSyncMinutes >= 1 && b.autoSyncMinutes <= 1440) st.autoSyncMinutes = b.autoSyncMinutes;
  audit(c.user.email, 'UPDATE_SETTINGS', 'Updated system settings.'); save(); send(res, 200, st);
});
route('POST', '/api/reset', (q, res, c) => {
  fs.rmSync(UPLOADS, { recursive: true, force: true }); fs.mkdirSync(UPLOADS, { recursive: true });
  const secret = db.meta.secret; db = seedDb(); db.meta.secret = secret; audit(c.user.email, 'RESET_DATA', 'Database reset to seed data.'); save(); send(res, 200, { ok: true });
});
route('GET', '/api/export/plan', (q, res, c) => send(res, 200, folderPlan(c.query.get('layout'))));
route('GET', '/api/export/zip', (q, res, c) => {
  const plan = folderPlan(c.query.get('layout')), used = new Set(), entries = [];
  plan.items.forEach(it => {
    const s = findStudent(it.studentId), f = s.files.find(x => x.id === it.fileId);
    if (!f.stored) return;
    let p = it.path, n = 1; while (used.has(p)) p = it.path.replace(/(\.[^./]+)?$/, `_${++n}$1`);
    used.add(p); entries.push({ name: `${safeName(db.settings.driveFolderName)}/${p}`, data: fs.readFileSync(path.join(UPLOADS, f.stored)) });
  });
  if (!entries.length) return fail(res, 404, 'No uploaded documents to export yet (seeded records have no files).');
  audit(c.user.email, 'EXPORT_ZIP', `Exported ${entries.length} files using layout '${plan.layout}'.`); save();
  send(res, 200, makeZip(entries), { 'Content-Type': 'application/zip', 'Content-Disposition': 'attachment; filename="certifyx-export.zip"' });
});
route('GET', '/api/export/:fmt', (q, res, c) => {
  const fmt = c.params.fmt, stamp = new Date().toISOString().slice(0, 10);
  audit(c.user.email, 'EXPORT_' + fmt.toUpperCase(), `Exported roster as ${fmt}.`); save();
  if (fmt === 'csv') return send(res, 200, '\ufeff' + [ROSTER_HEAD, ...rosterRows()].map(r => r.map(csvCell).join(',')).join('\r\n'),
    { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="certifyx-roster-${stamp}.csv"` });
  if (fmt === 'json') return send(res, 200, JSON.stringify({ exportedAt: now(), settings: db.settings, students: db.students }, null, 2),
    { 'Content-Type': 'application/json; charset=utf-8', 'Content-Disposition': `attachment; filename="certifyx-${stamp}.json"` });
  if (fmt === 'xls') {
    const e = s => String(s).replace(/[&<>]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[ch]));
    const html = '<html><head><meta charset="utf-8"></head><body><table border="1"><tr>' + ROSTER_HEAD.map(h => `<th>${h}</th>`).join('') + '</tr>' +
      rosterRows().map(r => '<tr>' + r.map(v => `<td>${e(v)}</td>`).join('') + '</tr>').join('') + '</table></body></html>';
    return send(res, 200, html, { 'Content-Type': 'application/vnd.ms-excel; charset=utf-8', 'Content-Disposition': `attachment; filename="certifyx-roster-${stamp}.xls"` });
  }
  fail(res, 404, 'Unknown export format.');
});

/* ---------- HTTP server ---------- */
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.json': 'application/json',
  '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon' };
const SEC = { 'Content-Security-Policy': "default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; frame-src 'self' blob:; object-src 'self' blob:; connect-src 'self'",
  'X-Frame-Options': 'SAMEORIGIN', 'Referrer-Policy': 'same-origin' };

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on('data', ch => { size += ch.length; if (size > MAX_BODY) { reject(Object.assign(new Error('Request too large'), { code: 413 })); req.destroy(); } else chunks.push(ch); });
    req.on('end', () => { try { const t = Buffer.concat(chunks).toString('utf8'); resolve(t ? JSON.parse(t) : {}); } catch (e) { reject(Object.assign(new Error('Invalid JSON'), { code: 400 })); } });
    req.on('error', reject);
  });
}
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://x');
    if (url.pathname.startsWith('/api/')) {
      const r = routes.find(x => x.m === req.method && x.re.test(url.pathname));
      if (!r) return fail(res, 404, 'Not found.');
      const params = (url.pathname.match(r.re).groups) || {};
      let user = null;
      if (r.auth) {
        user = verifyToken((req.headers.authorization || '').replace(/^Bearer /, '') || url.searchParams.get('token'));
        if (!user) return fail(res, 401, 'Please sign in.');
      }
      const body = ['POST', 'PUT', 'PATCH'].includes(req.method) ? await readBody(req) : null;
      return r.h(req, res, { params, query: url.searchParams, body, user });
    }
    let rel = decodeURIComponent(url.pathname); if (rel === '/') rel = '/index.html';
    const full = path.normalize(path.join(PUBLIC, rel));
    if (!full.startsWith(PUBLIC)) return send(res, 403, 'Forbidden');
    fs.readFile(full, (err, data) => {
      if (err) return send(res, 404, 'Not found');
      res.writeHead(200, Object.assign({ 'Content-Type': MIME[path.extname(full)] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff' }, SEC));
      res.end(data);
    });
  } catch (e) {
    if (!res.headersSent) fail(res, e.code === 413 || e.code === 400 ? e.code : 500, e.code ? e.message : 'Server error.');
    if (!e.code) console.error(e);
  }
});
setInterval(() => {   // auto-sync every `autoSyncMinutes`
  if (Date.now() - new Date(db.settings.lastSync).getTime() >= db.settings.autoSyncMinutes * 60000) { runSync('auto-sync'); save(); }
}, 30000).unref();
if (require.main === module) server.listen(PORT, () => console.log(`Certifyx running on http://localhost:${PORT}  (admin: ${ADMIN_EMAIL})`));
module.exports = server;
