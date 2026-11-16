/* ===== Versión independiente: Firebase en lugar de la base de Claude ===== */
const FBCFG = __FBCFG__;
firebase.initializeApp(FBCFG);
const _fdb = firebase.firestore();
try { _fdb.settings({ ignoreUndefinedProperties: true }); } catch (e) {}
try { _fdb.enablePersistence({ synchronizeTabs: true }).catch(() => {}); } catch (e) {}
const _auth = firebase.auth();
// Firestore no acepta listas dentro de listas (ej. parejas): se guardan envueltas y se desenvuelven al leer
const _enc = v => Array.isArray(v) ? v.map(x => Array.isArray(x) ? { __a: _enc(x) } : _enc(x)) : (v && typeof v === 'object') ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, _enc(x)])) : v;
const _dec = v => Array.isArray(v) ? v.map(_dec) : (v && typeof v === 'object') ? (Object.keys(v).length === 1 && '__a' in v ? _dec(v.__a) : Object.fromEntries(Object.entries(v).map(([k, x]) => [k, _dec(x)]))) : v;
const _snap = s => ({ exists: s.exists, id: s.id, data: () => _dec(s.data()) });
const _wDoc = r => ({ id: r.id, onSnapshot: (f, e) => r.onSnapshot(s => f(_snap(s)), e), set: (d, o) => r.set(_enc(d), o || {}), update: d => r.update(_enc(d)), delete: () => r.delete(), collection: c => _wCol(r.collection(c)) });
const _wCol = r => ({ doc: id => _wDoc(r.doc(id)), add: d => r.add(_enc(d)), orderBy: (...a) => _wCol(r.orderBy(...a)), limit: n => _wCol(r.limit(n)), onSnapshot: (f, e) => r.onSnapshot(s => f({ size: s.size, docs: s.docs.map(_snap) }), e) });
const _db = { doc: p => _wDoc(_fdb.doc(p)), collection: p => _wCol(_fdb.collection(p)) };
function _overlay(html) { let d = document.getElementById('fb-ov'); if (!d) { d = document.createElement('div'); d.id = 'fb-ov'; d.style.cssText = 'position:fixed;inset:0;z-index:9999;background:#111114;color:#eee;display:flex;align-items:center;justify-content:center;padding:20px;font:15px system-ui;text-align:center'; document.body.appendChild(d); } d.innerHTML = html; return d; }
const _DIF = (() => { try { return new URLSearchParams(location.search).get('dif'); } catch (e) { return null; } })(); // link de clase diferenciada: sin login
const _user = _DIF ? new Promise(() => {}) : new Promise(res => { _auth.getRedirectResult().catch(() => {}); _auth.onAuthStateChanged(u => { if (u) { document.getElementById('fb-ov')?.remove(); res(u); return; }
  const d = _overlay(`<div style="max-width:340px"><div style="font:900 22px system-ui;margin-bottom:6px">🥊 Clases de <span style="color:#e5383b">Kick Boxing / Muay Thai</span></div><div style="opacity:.75;margin-bottom:18px">Entrá con tu cuenta de Google (una sola vez en este dispositivo).</div><button id="fb-g" style="padding:12px 20px;border-radius:12px;border:0;background:#fff;color:#111;font:700 16px system-ui;cursor:pointer">Entrar con Google</button><div id="fb-e" style="color:#ff6b6b;margin-top:12px;font-size:13px"></div></div>`);
  d.querySelector('#fb-g').onclick = () => { const p = new firebase.auth.GoogleAuthProvider(); _auth.signInWithPopup(p).catch(e => { if (/popup|operation-not-supported/.test(e.code || '')) _auth.signInWithRedirect(p); else d.querySelector('#fb-e').textContent = 'No se pudo entrar: ' + (e.code || e.message); }); }; }); });
async function _importarSiVacio() {
  const s = await _fdb.doc('banco/ejercicios').get().catch(e => { _overlay(`<div style="max-width:360px">No tenés permiso para usar esta base.<br><br><small style="opacity:.7">${e.code || e.message}</small><br><br><button onclick="firebase.auth().signOut().then(()=>location.reload())" style="padding:10px 16px;border-radius:10px;border:0">Salir</button></div>`); throw e; });
  if (s.exists) return;
  await new Promise(done => { const d = _overlay(`<div style="max-width:520px;width:100%"><div style="font:800 18px system-ui;margin-bottom:6px">📥 Importar datos</div><div style="opacity:.75;font-size:13px;margin-bottom:10px">La base está vacía. Pegá acá el texto que exportaste desde la versión de Claude (📍 → ⬇ Exportar todos los datos), o elegí el archivo descargado.</div><input type="file" id="im-f" accept=".json,application/json" style="margin-bottom:8px"><textarea id="im-t" style="width:100%;height:160px;font-size:11px;background:#1c1c21;color:#eee;border:1px solid #333;border-radius:8px"></textarea><div style="margin-top:10px;display:flex;gap:8px;justify-content:center"><button id="im-v" style="padding:10px 14px;border-radius:10px;border:1px solid #444;background:none;color:#eee">Empezar vacía</button><button id="im-ok" style="padding:10px 16px;border-radius:10px;border:0;background:#e5383b;color:#fff;font-weight:700">Importar</button></div><div id="im-s" style="margin-top:10px;font-size:13px"></div></div>`);
    d.querySelector('#im-f').onchange = ev => { const f = ev.target.files[0]; if (f) f.text().then(t => d.querySelector('#im-t').value = t); };
    d.querySelector('#im-v').onclick = async () => { await _fdb.doc('banco/ejercicios').set({ items: [], borrados: [] }); d.remove(); done(); };
    d.querySelector('#im-ok').onclick = async () => { let J; try { J = JSON.parse(d.querySelector('#im-t').value); } catch (e) { d.querySelector('#im-s').textContent = 'El texto no es válido. Copialo completo.'; return; }
      const ks = Object.keys(J); let n = 0; d.querySelector('#im-s').textContent = 'Importando…';
      for (let i = 0; i < ks.length; i += 400) { const b = _fdb.batch(); ks.slice(i, i + 400).forEach(k => b.set(_fdb.doc(k), _enc(J[k]))); await b.commit(); n += Math.min(400, ks.length - i); d.querySelector('#im-s').textContent = `Importados ${n} de ${ks.length}…`; }
      d.remove(); done(); }; });
}
window.claude = { use: async n => { if (_DIF) { if (n === 'db') return _db; throw new Error('no disponible'); } if (n === 'db') { await _user; await _importarSiVacio(); return _db; } if (n === 'user') { const u = await _user; return { isOwner: async () => true, id: async () => u.uid }; } throw new Error('no disponible'); } };
