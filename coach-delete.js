(() => {
  'use strict';
  if (window.__Z33_COACH_DELETE__) return;
  window.__Z33_COACH_DELETE__ = true;

  const URL = 'https://ponhllwbvhtczaphfdgw.supabase.co';
  const KEY = 'sb_publishable_okgoHkX2YZFtQ9P72ckztQ_jiCuWN-6';
  const db = window.supabase.createClient(URL, KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
  const $ = (s) => document.querySelector(s);
  const esc = (v) => String(v ?? '').replace(/[&<>\"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));

  function css() {
    if ($('#z33CoachDeleteStyle')) return;
    const s = document.createElement('style');
    s.id = 'z33CoachDeleteStyle';
    s.textContent = `
      .z33-coach-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
      .z33-coach-card{background:#fff;border:1px solid #e8e8ea;border-radius:14px;padding:18px;box-shadow:0 8px 30px rgba(20,20,24,.05)}
      .z33-coach-head{display:flex;gap:12px;align-items:center}.z33-coach-head img{width:56px;height:56px;border-radius:12px;object-fit:cover;background:#f1f1f3}
      .z33-coach-name{font-size:15px;font-weight:750}.z33-coach-meta{font-size:11px;color:#85858c;margin-top:3px}
      .z33-coach-bio{font-size:11px;color:#72727a;line-height:1.5;min-height:34px;margin:14px 0}
      .z33-coach-actions{display:flex;gap:7px;flex-wrap:wrap}
      .z33-coach-btn{border:1px solid #dcdce0;background:#fff;border-radius:9px;padding:9px 12px;font-size:11px;font-weight:700;cursor:pointer}.z33-coach-btn:hover{background:#f8f8f9}
      .z33-coach-btn.danger{border-color:#efcdca;color:#b4232e;background:#fff8f7}
      .z33-coach-empty{padding:32px;text-align:center;color:#909097;border:1px dashed #dedee2;border-radius:10px;background:#fcfcfc}
      @media(max-width:900px){.z33-coach-grid{grid-template-columns:1fr}}
    `;
    document.head.appendChild(s);
  }

  async function renderCoaches() {
    css();
    const main = $('#zfMain') || $('#z33-content') || $('.z33c');
    if (!main) return;
    const { data: coaches = [], error } = await db.from('coaches').select('*').order('is_active',{ascending:false}).order('name');
    if (error) {
      main.innerHTML = '<div class="z33-coach-empty">No se pudieron cargar los coaches.</div>';
      return;
    }
    const active = coaches.filter(c => c.is_active !== false);
    const inactive = coaches.filter(c => c.is_active === false);
    main.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:end;gap:12px;margin-bottom:20px;flex-wrap:wrap">
        <div><div style="font-size:10px;letter-spacing:.13em;text-transform:uppercase;font-weight:800;color:#a0a0a6">ZONA 33</div><h1 style="font-size:32px;letter-spacing:-.04em;margin:4px 0">Coaches</h1><div style="color:#78787f;font-size:13px">Editar, activar, desactivar o eliminar coaches.</div></div>
        <button class="zf-btn red" id="z33AddCoach">+ Coach</button>
      </div>
      <div class="z33-coach-grid">
        ${coaches.map(c => `
          <article class="z33-coach-card">
            <div class="z33-coach-head">
              <img src="${esc(c.photo_url || './assets/zona33-logo-portal.webp')}" alt="">
              <div><div class="z33-coach-name">${esc(c.name || 'Coach')}</div><div class="z33-coach-meta">${esc(c.specialty || 'Coach ZONA 33')} · ${c.is_active === false ? 'Inactivo' : 'Activo'}</div></div>
            </div>
            <div class="z33-coach-bio">${esc(c.bio || 'Sin descripción.')}</div>
            <div class="z33-coach-actions">
              <button class="z33-coach-btn" data-edit="${c.id}">Editar</button>
              <button class="z33-coach-btn" data-toggle="${c.id}" data-active="${c.is_active !== false}">${c.is_active === false ? 'Activar' : 'Desactivar'}</button>
              <button class="z33-coach-btn danger" data-delete="${c.id}">Eliminar</button>
            </div>
          </article>`).join('') || '<div class="z33-coach-empty">No hay coaches registrados.</div>'}
      </div>
      <div style="margin-top:14px;color:#8a8a91;font-size:11px">${active.length} activos · ${inactive.length} inactivos</div>
    `;

    $('#z33AddCoach')?.addEventListener('click', () => {
      if (typeof window.z33CoachForm === 'function') window.z33CoachForm();
      else alert('El formulario de coach todavía no está disponible.');
    });
    main.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => window.z33CoachForm?.(b.dataset.edit));
    main.querySelectorAll('[data-toggle]').forEach(b => b.onclick = async () => {
      const id = b.dataset.toggle;
      const next = b.dataset.active !== 'true';
      const r = await db.from('coaches').update({is_active: next, updated_at: new Date().toISOString()}).eq('id', id);
      if (r.error) return alert(r.error.message);
      renderCoaches();
    });
    main.querySelectorAll('[data-delete]').forEach(b => b.onclick = async () => {
      const id = b.dataset.delete;
      const coach = coaches.find(c => c.id === id);
      if (!coach) return;
      if (!confirm(`¿Eliminar definitivamente a ${coach.name || 'este coach'}?\n\nEsta acción no se puede deshacer.`)) return;
      const r = await db.from('coaches').delete().eq('id', id);
      if (r.error) {
        alert('No se puede eliminar este coach porque tiene información relacionada en el sistema. Puedes desactivarlo para conservar su historial.');
        return;
      }
      renderCoaches();
    });
  }

  const waitRoute = () => {
    if (typeof window.route !== 'function') return setTimeout(waitRoute, 100);
    const original = window.route;
    if (original.__z33CoachDeleteWrapped) return;
    const wrapped = async (page) => {
      if (page === 'coaches') {
        try { $('#zfTitle') && ($('#zfTitle').textContent = 'Coaches'); } catch (_) {}
        if ($('#zfMain')) return renderCoaches();
      }
      return original(page);
    };
    wrapped.__z33CoachDeleteWrapped = true;
    window.route = wrapped;
    if (($('#zfTitle')?.textContent || '').toLowerCase() === 'coaches') renderCoaches();
  };
  waitRoute();
})();
