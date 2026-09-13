/*
 * ZONA 33 — Panel administrativo (fuente única)
 * ------------------------------------------------------------
 * Único runtime del panel admin. Sustituye a todos los archivos
 * admin-*.js / *-fix.js / *-hotfix.js / z33-final-admin.js /
 * finance-*.js / admin-stability.js / coach-delete.js previos.
 *
 * Una sola inicialización, un solo router, un solo formulario de
 * pago, una sola forma de eliminar cada entidad. No hay wrapping
 * de window.route ni condiciones de carrera: este es el ÚNICO
 * archivo que dibuja el panel admin.
 *
 * Diseño: se conserva íntegro el lenguaje visual "z33a-" (hamburger
 * + drawer lateral, tarjetas, tabs) que ya existía en producción.
 */
(() => {
  'use strict';

  const SB_URL = 'https://ponhllwbvhtczaphfdgw.supabase.co';
  const SB_KEY = 'sb_publishable_okgoHkX2YZFtQ9P72ckztQ_jiCuWN-6';
  // Reutiliza el cliente único creado por app.js (evita instancias GoTrueClient
  // duplicadas); solo crea uno propio si admin.js se cargara de forma aislada.
  const db = window.__ZONA33_SB || window.supabase.createClient(SB_URL, SB_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
  const money = (v) => '$' + Number(v || 0).toLocaleString('es-MX', { maximumFractionDigits: 0 });
  const today = () => new Date().toISOString().slice(0, 10);
  const dateText = (v) => v ? new Date(v + 'T12:00:00').toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
  const timeText = (v) => String(v || '').slice(0, 5);
  const addDays = (d, n) => { const x = new Date(d + 'T12:00:00'); x.setDate(x.getDate() + n); return x.toISOString().slice(0, 10); };
  const weekMonday = (d) => { const x = new Date(d + 'T12:00:00'); const w = x.getDay(); x.setDate(x.getDate() + (w === 0 ? -6 : 1 - w)); return x.toISOString().slice(0, 10); };
  const parseMinutes = (v) => { const [h, m] = String(v || '00:00').split(':').map(Number); return h * 60 + (m || 0); };
  const fmtMinutes = (mins) => String(Math.floor(mins / 60) % 24).padStart(2, '0') + ':' + String(mins % 60).padStart(2, '0');

  const CLASS_TYPES = ['Functional', 'Strength', 'Mobility', 'Conditioning', 'Open Box', 'Personal'];
  const PENDING_DAYS_SOON = 7; // ventana para "por vencer"

  const state = {
    user: null, profile: null, page: 'dashboard', financeTab: 'overview', reportPeriod: 'month',
    weekAnchor: weekMonday(today()),
    clients: [], coaches: [], classes: [], reservations: [], payments: [], memberships: [],
    plans: [], founders: [], expenses: [], site: {}, masterOptions: []
  };

  // ---------------------------------------------------------------
  // Estado de membresía por cliente: SIEMPRE se deriva tomando la
  // última membresía (por vigencia y luego por fecha) de cada
  // profile_id. Nunca se cuenta una fila de `memberships` como si
  // fuera un cliente.
  // ---------------------------------------------------------------
  function latestMembershipByClient() {
    const map = new Map();
    for (const m of state.memberships) {
      const prev = map.get(m.profile_id);
      if (!prev) { map.set(m.profile_id, m); continue; }
      const prevScore = (prev.status === 'active' ? 1 : 0);
      const curScore = (m.status === 'active' ? 1 : 0);
      if (curScore !== prevScore) { if (curScore > prevScore) map.set(m.profile_id, m); continue; }
      const prevEnd = prev.end_date || '';
      const curEnd = m.end_date || '';
      if (curEnd !== prevEnd) { if (curEnd > prevEnd) map.set(m.profile_id, m); continue; }
      if ((m.created_at || '') > (prev.created_at || '')) map.set(m.profile_id, m);
    }
    return map;
  }
  function membershipStatus(m) {
    if (!m) return { key: 'none', label: 'Sin membresía', tone: 'warn' };
    if (m.status === 'cancelled') return { key: 'none', label: 'Sin membresía', tone: 'warn' };
    if (m.status !== 'active' || (m.end_date || '') < today()) return { key: 'expired', label: 'Vencida', tone: 'bad' };
    const daysLeft = Math.ceil((new Date(m.end_date + 'T12:00:00') - new Date(today() + 'T12:00:00')) / 86400000);
    if (daysLeft <= PENDING_DAYS_SOON) return { key: 'soon', label: 'Por vencer', tone: 'warn' };
    return { key: 'active', label: 'Activa', tone: 'ok' };
  }

  // ---------------------------------------------------------------
  // Shell / estilos (idénticos a los del panel visible en producción)
  // ---------------------------------------------------------------
  function injectStyles() {
    if ($('#z33AdminStyles')) return;
    const style = document.createElement('style');
    style.id = 'z33AdminStyles';
    style.textContent = `
      #z33-admin{min-height:100vh;background:#f7f7f8;color:#17181b;font-family:Inter,Arial,sans-serif}
      #z33-admin *{box-sizing:border-box}
      .z33a-top{height:72px;background:#fff;border-bottom:1px solid #e5e5e8;display:flex;align-items:center;padding:0 26px;gap:12px;position:sticky;top:0;z-index:30}
      .z33a-menu{width:38px;height:38px;border:0;background:#fff;border-radius:9px;display:grid;place-items:center;font-size:23px;color:#25272b;cursor:pointer}
      .z33a-menu:hover{background:#f1f1f3}.z33a-title{font-size:20px;font-weight:650}.z33a-date{font-size:14px;color:#7d828a}
      .z33a-actions{margin-left:auto;display:flex;gap:7px}.z33a-btn{min-height:40px;border:1px solid #dedfe3;background:#fff;color:#36393f;border-radius:8px;padding:0 13px;font-size:11px;font-weight:650;cursor:pointer}.z33a-btn.red{background:#d3232d;border-color:#d3232d;color:#fff}.z33a-btn.danger{background:#fff5f4;border-color:#efd0cc;color:#b42318}.z33a-btn:disabled{opacity:.45;cursor:not-allowed}
      .z33a-content{max-width:1120px;margin:0 auto;padding:25px 28px 54px}.z33a-kicker{font-size:10px;font-weight:800;letter-spacing:.13em;text-transform:uppercase;color:#c91428}.z33a-h2{font-size:31px;line-height:1.05;margin:5px 0;font-weight:720;letter-spacing:-.035em}.z33a-sub{font-size:13px;color:#7c8189}.z33a-head{display:flex;justify-content:space-between;align-items:flex-end;gap:12px;margin-bottom:18px}.z33a-head-actions{display:flex;gap:7px;flex-wrap:wrap}
      .z33a-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}.z33a-stat{background:#fff;border:1px solid #e1e2e5;border-radius:16px;padding:20px;min-height:120px}.z33a-icon{width:40px;height:40px;border-radius:11px;display:grid;place-items:center;font-size:18px}.z33a-icon.red{background:#fff1f1;color:#d3232d}.z33a-icon.amber{background:#fff8e9;color:#b87900}.z33a-icon.green{background:#e9fbf3;color:#12a46b}.z33a-icon.gray{background:#f1f1f3;color:#34383e}.z33a-value{font-size:28px;line-height:1.1;font-weight:600;margin-top:12px;letter-spacing:-.03em}.z33a-label{font-size:12.5px;color:#80848c;margin-top:6px}
      .z33a-chart{margin-top:16px;background:#fff;border:1px solid #e1e2e5;border-radius:16px;padding:22px}.z33a-chart-title{font-size:16px;font-weight:650;margin-bottom:4px}.z33a-chart-wrap{position:relative;height:220px;margin-top:14px}
      .z33a-tabs{display:flex;gap:2px;border-bottom:1px solid #e2e3e6;margin:22px 0 16px;overflow:auto}.z33a-tab{border:0;background:transparent;padding:11px 13px;font-size:12px;font-weight:650;color:#777b83;border-bottom:2px solid transparent;white-space:nowrap;cursor:pointer}.z33a-tab.active{color:#c61d28;border-color:#d9272f}
      .z33a-card{background:#fff;border:1px solid #e1e2e5;border-radius:14px;padding:18px}.z33a-grid2{display:grid;grid-template-columns:1.45fr 1fr;gap:16px}.z33a-grid3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}.z33a-toolbar{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:14px}.z33a-search{height:40px;min-width:280px;border:1px solid #dedfe3;border-radius:9px;padding:0 12px;background:#fff;font-size:12px}.z33a-filter-row{display:flex;gap:6px;flex-wrap:wrap}.z33a-filter{height:36px;border:1px solid #dedfe3;border-radius:8px;background:#fff;padding:0 11px;font-size:11px;cursor:pointer}.z33a-filter.active{background:#fff0f0;border-color:#e7a9ad;color:#b71f28;font-weight:700}
      .z33a-table{overflow:auto;border:1px solid #e1e2e5;border-radius:12px;background:#fff}.z33a-table table{width:100%;min-width:760px;border-collapse:collapse}.z33a-table th{background:#fafafa;color:#777b83;text-transform:uppercase;font-size:9px;letter-spacing:.06em;text-align:left;padding:11px;border-bottom:1px solid #ececef}.z33a-table td{padding:12px 11px;border-bottom:1px solid #f0f0f2;font-size:12px;vertical-align:middle}.z33a-table tr:last-child td{border-bottom:0}.z33a-muted{font-size:10px;color:#858991;margin-top:3px}.z33a-pill{display:inline-flex;border-radius:999px;padding:4px 8px;font-size:9px;font-weight:800}.z33a-pill.ok{background:#e9f8f1;color:#14764c}.z33a-pill.warn{background:#fff7df;color:#866300}.z33a-pill.bad{background:#fdecef;color:#b4232e}.z33a-pill.off{background:#eef0f3;color:#656b73}
      .z33a-list{display:grid;gap:8px}.z33a-item{background:#fafbfc;border:1px solid #eceef0;border-radius:10px;padding:12px;display:flex;align-items:center;justify-content:space-between;gap:10px}.z33a-empty{padding:34px;text-align:center;color:#8a8e95;font-size:12px}.z33a-actions-row{display:flex;gap:6px;flex-wrap:wrap}
      .z33a-menu-overlay{position:fixed;inset:0;background:rgba(20,22,26,.28);z-index:80;display:none}.z33a-menu-overlay.show{display:block}.z33a-menu-drawer{position:fixed;left:0;top:0;bottom:0;width:305px;background:#fff;z-index:81;box-shadow:18px 0 48px rgba(0,0,0,.12);padding:24px;transform:translateX(-100%);transition:transform .18s}.z33a-menu-drawer.show{transform:translateX(0)}.z33a-menu-title{font-size:20px;font-weight:700}.z33a-menu-sub{font-size:12px;color:#858991;margin-top:4px}.z33a-menu-list{display:grid;gap:4px;margin-top:22px}.z33a-menu-item{height:45px;border:0;background:#fff;border-radius:9px;text-align:left;padding:0 12px;font-size:13px;font-weight:600;color:#555a62;cursor:pointer}.z33a-menu-item:hover,.z33a-menu-item.active{background:#fff0f0;color:#b71e28}
      .z33a-drawer-overlay{position:fixed;inset:0;background:rgba(20,22,26,.28);z-index:90;display:none}.z33a-drawer-overlay.show{display:block}.z33a-drawer{position:fixed;top:0;right:0;bottom:0;width:min(500px,95vw);background:#fff;z-index:91;box-shadow:-18px 0 48px rgba(0,0,0,.15);padding:22px;overflow:auto;transform:translateX(100%);transition:transform .18s}.z33a-drawer.show{transform:translateX(0)}.z33a-drawer-head{display:flex;align-items:flex-start;gap:10px}.z33a-drawer-head h3{margin:0;font-size:20px}.z33a-drawer-head .z33a-btn{margin-left:auto}.z33a-form{display:grid;gap:12px;margin-top:18px}.z33a-form label{font-size:10px;font-weight:700;color:#727780}.z33a-form input,.z33a-form select,.z33a-form textarea{width:100%;margin-top:6px;padding:11px;border:1px solid #dfe1e5;border-radius:9px;background:#fff;font-size:12px}.z33a-form textarea{min-height:80px;resize:vertical}.z33a-row{display:grid;grid-template-columns:1fr 1fr;gap:10px}.z33a-check{display:flex;align-items:center;gap:8px;font-size:12px;font-weight:600;color:#36393f}.z33a-check input{width:auto;margin:0}.z33a-msg{font-size:11px;padding:9px 11px;border-radius:8px}.z33a-msg.err{background:#fff3f2;color:#b42318;border:1px solid #f2c7c3}.z33a-msg.ok{background:#eefaf4;color:#14764d;border:1px solid #c8ead9}
      .z33a-calendar{background:#fff;border:1px solid #e1e2e5;border-radius:14px;overflow:auto}.z33a-cal-inner{min-width:980px}.z33a-week-head{display:grid;grid-template-columns:54px repeat(7,1fr);background:#fafafa;border-bottom:1px solid #e6e7e9}.z33a-week-head>div{padding:9px 3px;text-align:center;border-left:1px solid #f0f1f2}.z33a-week-head small{font-size:8px;color:#80858d;text-transform:uppercase}.z33a-week-head b{display:block;margin-top:3px;font-size:13px}.z33a-week-body{display:grid;grid-template-columns:54px 1fr}.z33a-time-col,.z33a-day-col{height:850px;position:relative}.z33a-time{position:absolute;right:7px;transform:translateY(-6px);font-size:8px;color:#959ba2}.z33a-day-cols{display:grid;grid-template-columns:repeat(7,1fr)}.z33a-day-col{border-left:1px solid #f0f1f2}.z33a-hour{position:absolute;left:0;right:0;border-top:1px solid #f4f4f5}.z33a-class{position:absolute;left:4px;right:4px;border:1px solid #dfe2e5;border-left:3px solid #2d3136;background:#fff;border-radius:7px;padding:5px;cursor:pointer;overflow:hidden}.z33a-class.full{border-left-color:#c91428;background:#fff1f1}.z33a-class.master{border-left-color:#b87900;background:#fffaf0}.z33a-class strong{display:block;font-size:9px;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.z33a-class small{display:block;color:#858b93;font-size:8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .z33a-hero{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;margin-bottom:18px}.z33a-hero h2{font-size:32px;margin:4px 0}.z33a-big-actions{display:grid;grid-template-columns:repeat(2,minmax(150px,1fr));gap:10px;min-width:340px}.z33a-action-card{background:#fff;border:1px solid #e1e2e5;border-radius:14px;padding:16px;text-align:left;cursor:pointer}.z33a-action-card b{display:block;font-size:13px}.z33a-action-card span{display:block;color:#858a92;font-size:11px;margin-top:5px}
      @media(max-width:760px){.z33a-actions{display:none}.z33a-content{padding:18px 12px 42px}.z33a-stats{grid-template-columns:1fr 1fr}.z33a-grid2,.z33a-grid3{grid-template-columns:1fr}.z33a-row{grid-template-columns:1fr}.z33a-search{min-width:100%;width:100%}.z33a-big-actions{min-width:0;grid-template-columns:1fr}.z33a-menu-drawer{width:86vw}}
    `;
    document.head.appendChild(style);
  }

  function openMenu() { $('#z33-menu-overlay')?.classList.add('show'); $('#z33-menu')?.classList.add('show'); }
  function closeMenu() { $('#z33-menu-overlay')?.classList.remove('show'); $('#z33-menu')?.classList.remove('show'); }
  function openDrawer(title, html) {
    $('#z33-drawer-overlay')?.classList.add('show'); $('#z33-drawer')?.classList.add('show');
    $('#z33-drawer').innerHTML = `<div class="z33a-drawer-head"><div><div class="z33a-kicker">ZONA 33</div><h3>${title}</h3></div><button class="z33a-btn" id="z33-drawer-close">Cerrar</button></div>${html}`;
    $('#z33-drawer-close').onclick = closeDrawer;
  }
  function closeDrawer() { $('#z33-drawer-overlay')?.classList.remove('show'); $('#z33-drawer')?.classList.remove('show'); }

  // ---------------------------------------------------------------
  // Carga de datos — una sola vez por navegación, todo desde Supabase
  // ---------------------------------------------------------------
  async function loadData() {
    const [clients, coaches, classes, reservations, payments, memberships, plans, founders, expenses, site, masterOptions] = await Promise.all([
      db.from('profiles').select('*').eq('role', 'cliente').order('created_at', { ascending: false }),
      db.from('coaches').select('*').order('is_active', { ascending: false }).order('name'),
      db.from('classes').select('*').order('class_date', { ascending: false }).order('start_time'),
      db.from('reservations').select('*,profiles(full_name,email,phone)').order('created_at', { ascending: false }),
      db.from('payments').select('*,profiles(full_name,email),membership_plans(name,is_founder_plan)').order('payment_date', { ascending: false }),
      db.from('memberships').select('*,profiles(full_name,email),membership_plans(name,price,is_founder_plan,duration_days)').order('created_at', { ascending: false }),
      db.from('membership_plans').select('*').order('sort_order').order('name'),
      db.from('founder_codes').select('*').order('created_at', { ascending: false }),
      db.from('expenses').select('*').order('expense_date', { ascending: false }),
      db.from('site_content').select('*').order('key'),
      db.from('master_class_coach_options').select('*')
    ]);
    state.clients = clients.data || [];
    state.coaches = coaches.data || [];
    state.classes = (classes.data || []).map((c) => ({ ...c, coach: state.coaches.find((x) => x.id === c.coach_id) || null }));
    state.reservations = reservations.data || [];
    state.payments = payments.data || [];
    state.memberships = memberships.data || [];
    state.plans = plans.data || [];
    state.founders = founders.data || [];
    state.expenses = expenses.data || [];
    state.site = Object.fromEntries((site.data || []).map((x) => [x.key, x.value]));
    state.masterOptions = masterOptions.data || [];
  }

  function stat(icon, tone, value, label) {
    return `<div class="z33a-stat"><div class="z33a-icon ${tone}">${icon}</div><div class="z33a-value">${value}</div><div class="z33a-label">${label}</div></div>`;
  }
  function pageShell(title, subtitle = '', actions = '') {
    return `<div class="z33a-head"><div><div class="z33a-kicker">ZONA 33</div><div class="z33a-h2">${title}</div><div class="z33a-sub">${subtitle}</div></div><div class="z33a-head-actions">${actions}</div></div>`;
  }

  // ---------------------------------------------------------------
  // Layout raíz + router
  // ---------------------------------------------------------------
  const NAV_ITEMS = [['dashboard', 'Dashboard'], ['clients', 'Clientes'], ['agenda', 'Clases / Horarios'], ['coaches', 'Coaches'], ['finance', 'Finanzas'], ['landing', 'Editar Landing']];
  const PAGE_TITLES = Object.fromEntries(NAV_ITEMS);

  function renderRoot() {
    document.body.innerHTML = `<div id="z33-admin"><header class="z33a-top"><button class="z33a-menu" id="z33-open-menu">☰</button><div class="z33a-title" id="z33-title">Dashboard</div><span class="z33a-date">· ${new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}</span><div class="z33a-actions"><button class="z33a-btn" id="z33-goto-site">Sitio</button><button class="z33a-btn danger" id="z33-logout">Salir</button></div></header><main class="z33a-content" id="z33-content"></main><div id="z33-menu-overlay" class="z33a-menu-overlay"></div><aside id="z33-menu" class="z33a-menu-drawer"><div class="z33a-menu-title">ZONA 33</div><div class="z33a-menu-sub">Panel administrativo</div><div class="z33a-menu-list">${menuItems()}</div></aside><div id="z33-drawer-overlay" class="z33a-drawer-overlay"><aside id="z33-drawer" class="z33a-drawer"></aside></div></div>`;
    injectStyles();
    $('#z33-open-menu').onclick = openMenu;
    $('#z33-menu-overlay').onclick = closeMenu;
    $('#z33-drawer-overlay').onclick = (e) => { if (e.target.id === 'z33-drawer-overlay') closeDrawer(); };
    $('#z33-goto-site').onclick = () => { location.href = '/'; };
    $('#z33-logout').onclick = async () => { await db.auth.signOut(); location.reload(); };
    bindMenu();
  }
  function menuItems() {
    return NAV_ITEMS.map(([key, label]) => `<button class="z33a-menu-item ${state.page === key ? 'active' : ''}" data-page="${key}">${label}</button>`).join('');
  }
  function bindMenu() {
    $$('.z33a-menu-item').forEach((button) => { button.onclick = () => { closeMenu(); route(button.dataset.page); }; });
  }
  function setTitle(title) { $('#z33-title').textContent = title; }

  async function route(page) {
    state.page = page;
    setTitle(PAGE_TITLES[page] || 'Dashboard');
    await loadData();
    ({ dashboard, clients, agenda, coaches, finance, landing }[page] || dashboard)();
    const menu = $('#z33-menu');
    if (menu) { menu.querySelector('.z33a-menu-list').innerHTML = menuItems(); bindMenu(); }
  }

  // =================================================================
  // DASHBOARD — todos los contadores derivados de la base real
  // =================================================================
  function dashboard() {
    const latest = latestMembershipByClient();
    let activeMem = 0, soonMem = 0, expiredMem = 0;
    for (const c of state.clients) {
      const st = membershipStatus(latest.get(c.id)).key;
      if (st === 'active') activeMem++; else if (st === 'soon') soonMem++; else if (st === 'expired') expiredMem++;
    }
    const activeClients = state.clients.filter((c) => c.is_active !== false).length;
    const inactiveClients = state.clients.length - activeClients;
    const todayClasses = state.classes.filter((c) => c.class_date === today() && c.status === 'scheduled');
    const monthStart = today().slice(0, 7) + '-01';
    const income = state.payments.filter((p) => p.status === 'approved' && String(p.payment_date || '').slice(0, 10) >= monthStart).reduce((s, p) => s + Number(p.amount || 0), 0);
    const pendingAmt = state.payments.filter((p) => p.status === 'pending' || p.status === 'partial').reduce((s, p) => s + Number(p.amount || 0), 0);

    $('#z33-content').innerHTML = `${pageShell('Dashboard', 'Resumen de ZONA 33')}
      <div class="z33a-stats">
        ${stat('↗', 'red', money(income), 'Ingresos del mes')}
        ${stat('◷', 'amber', money(pendingAmt), 'Pagos pendientes')}
        ${stat('♧', 'green', activeMem, 'Membresías activas')}
        ${stat('□', 'gray', todayClasses.length, 'Clases de hoy')}
      </div>
      <div class="z33a-stats" style="margin-top:16px">
        ${stat('☺', 'gray', state.clients.length, 'Total clientes')}
        ${stat('✓', 'green', activeClients, 'Clientes activos')}
        ${stat('✕', 'gray', inactiveClients, 'Clientes inactivos')}
        ${stat('⚠', 'amber', soonMem, 'Por vencer (' + PENDING_DAYS_SOON + ' días)')}
      </div>
      <div class="z33a-grid2" style="margin-top:16px">
        <div class="z33a-card">
          <div class="z33a-kicker">Hoy</div><h3>Próximas clases</h3>
          <div class="z33a-list">${todayClasses.slice(0, 8).map((c) => {
            const booked = state.reservations.filter((r) => r.class_id === c.id && r.status === 'reserved').length;
            return `<div class="z33a-item" data-open-class="${c.id}" style="cursor:pointer"><div><b>${timeText(c.start_time)} · ${esc(c.class_type)}</b><div class="z33a-muted">${esc(c.coach?.name || 'Sin coach')} · ${c.capacity || 10} lugares</div></div><span class="z33a-pill ${booked >= (c.capacity || 10) ? 'bad' : 'ok'}">${booked}/${c.capacity || 10}</span></div>`;
          }).join('') || '<div class="z33a-empty">No hay clases hoy.</div>'}</div>
        </div>
        <div class="z33a-card">
          <div class="z33a-kicker">Acciones rápidas</div><h3>Administración</h3>
          <div class="z33a-big-actions">
            <button class="z33a-action-card" data-goto="clients"><b>Clientes</b><span>Perfiles y membresías</span></button>
            <button class="z33a-action-card" data-goto="agenda"><b>Clases / Horarios</b><span>Semana y cupos</span></button>
            <button class="z33a-action-card" data-goto="coaches"><b>Coaches</b><span>Editar, activar o eliminar</span></button>
            <button class="z33a-action-card" data-goto="finance"><b>Finanzas</b><span>Pagos, planes y reportes</span></button>
          </div>
        </div>
      </div>`;
    $$('[data-goto]').forEach((b) => b.onclick = () => route(b.dataset.goto));
    $$('[data-open-class]').forEach((b) => b.onclick = () => openClassDetail(b.dataset.openClass));
  }

  // =================================================================
  // CLIENTES — estado operativo (is_active) independiente de membresía
  // =================================================================
  function clients() {
    const latest = latestMembershipByClient();
    $('#z33-content').innerHTML = `${pageShell('Clientes', 'Perfiles, membresías, reservas y pagos.', '<button class="z33a-btn red" id="z33-new-client">+ Cliente</button>')}
      <div class="z33a-card">
        <div class="z33a-toolbar">
          <input class="z33a-search" id="clientSearch" placeholder="Buscar cliente por nombre o correo">
          <div class="z33a-filter-row">
            <button class="z33a-filter active" data-cf="all">Todos</button>
            <button class="z33a-filter" data-cf="active">Operativo activo</button>
            <button class="z33a-filter" data-cf="inactive">Operativo inactivo</button>
          </div>
        </div>
        <div class="z33a-table"><table><thead><tr><th>Cliente</th><th>Teléfono</th><th>Nacimiento</th><th>Membresía</th><th>Operativo</th><th></th></tr></thead><tbody id="clientRows"></tbody></table></div>
      </div>`;
    const draw = (filter = 'all') => {
      const q = ($('#clientSearch').value || '').toLowerCase();
      let rows = state.clients.filter((c) => `${c.full_name || ''} ${c.email || ''}`.toLowerCase().includes(q));
      if (filter === 'active') rows = rows.filter((c) => c.is_active !== false);
      if (filter === 'inactive') rows = rows.filter((c) => c.is_active === false);
      $('#clientRows').innerHTML = rows.length ? rows.map((c) => {
        const ms = membershipStatus(latest.get(c.id));
        return `<tr><td><b>${esc(c.full_name || '')}</b><div class="z33a-muted">${esc(c.email || '')}</div></td><td>${esc(c.phone || '—')}</td><td>${dateText(c.birth_date)}</td><td><span class="z33a-pill ${ms.tone}">${ms.label}</span></td><td><span class="z33a-pill ${c.is_active === false ? 'off' : 'ok'}">${c.is_active === false ? 'Inactivo' : 'Activo'}</span></td><td><button class="z33a-btn" data-open-client="${c.id}">Ver</button></td></tr>`;
      }).join('') : '<tr><td colspan="6" class="z33a-empty">Sin clientes.</td></tr>';
      $$('[data-open-client]').forEach((b) => b.onclick = () => openClientDetail(b.dataset.openClient));
    };
    $('#clientSearch').oninput = () => draw($('.z33a-filter.active')?.dataset.cf || 'all');
    $$('[data-cf]').forEach((b) => b.onclick = () => { $$('[data-cf]').forEach((x) => x.classList.remove('active')); b.classList.add('active'); draw(b.dataset.cf); });
    $('#z33-new-client').onclick = clientCreateForm;
    draw('all');
  }

  function openClientDetail(id) {
    const c = state.clients.find((x) => x.id === id); if (!c) return;
    const latest = latestMembershipByClient();
    const m = latest.get(id);
    const ms = membershipStatus(m);
    const rs = state.reservations.filter((x) => x.profile_id === id).slice(0, 6);
    const ps = state.payments.filter((x) => x.profile_id === id).slice(0, 6);
    openDrawer('Cliente', `
      <div class="z33a-list">
        <div class="z33a-card">
          <b>${esc(c.full_name || '')}</b>
          <div class="z33a-muted">${esc(c.email || '')}<br>${esc(c.phone || '')}</div>
          <div class="z33a-muted">Nacimiento: ${dateText(c.birth_date)}</div>
          <div class="z33a-actions-row" style="margin-top:12px">
            <span class="z33a-pill ${c.is_active === false ? 'off' : 'ok'}">${c.is_active === false ? 'Inactivo' : 'Activo'}</span>
            <span class="z33a-pill ${ms.tone}">${ms.label}</span>
          </div>
          <div class="z33a-actions-row" style="margin-top:12px">
            <button class="z33a-btn" id="z33-client-toggle">${c.is_active === false ? 'Reactivar' : 'Desactivar'}</button>
            <button class="z33a-btn red" id="z33-client-pay">Registrar pago</button>
            <button class="z33a-btn danger" id="z33-client-delete">Eliminar cliente</button>
          </div>
        </div>
        <div class="z33a-card"><b>Membresía</b><div class="z33a-muted">${m ? `${esc(m.membership_plans?.name || 'Plan')} · ${dateText(m.start_date)} → ${dateText(m.end_date)}` : 'Sin membresía activa'}</div></div>
        <div class="z33a-card"><b>Reservas</b><div class="z33a-list">${rs.map((r) => `<div class="z33a-item"><span>${dateText(state.classes.find((x) => x.id === r.class_id)?.class_date)} · ${esc(r.status)}</span></div>`).join('') || '<div class="z33a-empty">Sin reservas.</div>'}</div></div>
        <div class="z33a-card"><b>Pagos</b><div class="z33a-list">${ps.map((p) => `<div class="z33a-item"><span>${esc(p.concept || 'Pago')}<div class="z33a-muted">${dateText(p.payment_date)}</div></span><b>${money(p.amount)}</b></div>`).join('') || '<div class="z33a-empty">Sin pagos.</div>'}</div></div>
      </div>`);
    $('#z33-client-toggle').onclick = async () => {
      const next = c.is_active === false;
      const r = await db.from('profiles').update({ is_active: next, updated_at: new Date().toISOString() }).eq('id', id).eq('role', 'cliente');
      if (r.error) return alert(r.error.message);
      closeDrawer(); await route('clients');
    };
    $('#z33-client-pay').onclick = () => { closeDrawer(); paymentForm(id); };
    $('#z33-client-delete').onclick = async () => {
      if (!confirm(`¿Eliminar PERMANENTEMENTE a ${c.full_name || 'este cliente'}?\n\nSe borrarán sus reservas, pagos y membresías. Esta acción no se puede deshacer.`)) return;
      const r = await db.rpc('admin_delete_client', { p_profile_id: id });
      if (r.error) return alert(r.error.message);
      closeDrawer(); await route('clients');
    };
  }

  function clientCreateForm() {
    openDrawer('Nuevo cliente', `
      <form id="z33-client-form" class="z33a-form">
        <label>Nombre completo<input id="ccf-name" required></label>
        <div class="z33a-row"><label>Correo<input id="ccf-email" type="email" required></label><label>Teléfono<input id="ccf-phone" required></label></div>
        <label>Fecha de nacimiento (obligatoria)<input id="ccf-birth" type="date" required></label>
        <label>Código fundador <span style="color:#999;font-weight:400">(opcional)</span><input id="ccf-founder" placeholder="Z33-FND-001" autocapitalize="characters"></label>
        <div id="ccf-msg"></div>
        <div class="z33a-actions-row"><button type="button" class="z33a-btn" id="ccf-cancel">Cancelar</button><button class="z33a-btn red" id="ccf-save">Crear cliente</button></div>
      </form>`);
    $('#ccf-cancel').onclick = closeDrawer;
    $('#z33-client-form').onsubmit = async (e) => {
      e.preventDefault();
      const msg = $('#ccf-msg'); msg.innerHTML = '';
      const btn = $('#ccf-save'); btn.disabled = true; btn.textContent = 'Creando…';
      const { data: { session } } = await db.auth.getSession();
      const body = {
        full_name: $('#ccf-name').value.trim(), email: $('#ccf-email').value.trim(),
        phone: $('#ccf-phone').value.trim(), birth_date: $('#ccf-birth').value,
        founder_code: $('#ccf-founder').value.trim()
      };
      const resp = await db.functions.invoke('admin-create-client', { body });
      btn.disabled = false; btn.textContent = 'Crear cliente';
      if (resp.error || resp.data?.error) {
        msg.innerHTML = `<div class="z33a-msg err">${esc(resp.data?.message || resp.data?.error || resp.error?.message || 'No se pudo crear el cliente.')}</div>`;
        return;
      }
      closeDrawer(); await route('clients');
    };
  }

  // =================================================================
  // COACHES — desactivar (reversible) vs eliminar (permanente)
  // =================================================================
  function coaches() {
    $('#z33-content').innerHTML = `${pageShell('Coaches', 'Editar, activar/desactivar o eliminar coaches.', '<button class="z33a-btn red" id="z33-new-coach">+ Coach</button>')}
      <div class="z33a-sub" style="margin-bottom:12px">Desactivar conserva el historial de clases; eliminar borra al coach de forma permanente (sus clases pasadas se conservan sin coach asignado).</div>
      <div class="z33a-grid3">${state.coaches.map((c) => `
        <div class="z33a-card">
          <div style="display:flex;align-items:center;gap:12px"><img src="${esc(c.photo_url || './assets/zona33-logo-portal.webp')}" alt="" style="width:56px;height:56px;border-radius:12px;object-fit:cover;background:#f1f1f3"><div><b style="font-size:15px">${esc(c.name || '')}</b><div class="z33a-muted">${esc(c.specialty || 'Coach ZONA 33')} · ${c.is_active === false ? 'Inactivo' : 'Activo'}</div></div></div>
          <p class="z33a-muted" style="min-height:32px">${esc(c.bio || '')}</p>
          <div class="z33a-actions-row">
            <button class="z33a-btn" data-edit-coach="${c.id}">Editar</button>
            <button class="z33a-btn" data-toggle-coach="${c.id}">${c.is_active === false ? 'Activar' : 'Desactivar'}</button>
            <button class="z33a-btn danger" data-delete-coach="${c.id}">Eliminar</button>
          </div>
        </div>`).join('') || '<div class="z33a-empty">Sin coaches.</div>'}</div>`;
    $('#z33-new-coach').onclick = () => coachForm();
    $$('[data-edit-coach]').forEach((b) => b.onclick = () => coachForm(b.dataset.editCoach));
    $$('[data-toggle-coach]').forEach((b) => b.onclick = async () => {
      const c = state.coaches.find((x) => x.id === b.dataset.toggleCoach);
      const r = await db.from('coaches').update({ is_active: c.is_active === false, updated_at: new Date().toISOString() }).eq('id', c.id);
      if (r.error) return alert(r.error.message);
      await route('coaches');
    });
    $$('[data-delete-coach]').forEach((b) => b.onclick = async () => {
      const c = state.coaches.find((x) => x.id === b.dataset.deleteCoach);
      if (!confirm(`¿Eliminar PERMANENTEMENTE a ${c.name || 'este coach'}?\n\nSus clases pasadas se conservan sin coach asignado. Esta acción no se puede deshacer.`)) return;
      const r = await db.rpc('admin_delete_coach', { p_coach_id: c.id });
      if (r.error) return alert(r.error.message);
      await route('coaches');
    });
  }
  function coachForm(id) {
    const c = id ? state.coaches.find((x) => x.id === id) : {};
    openDrawer(id ? 'Editar coach' : 'Nuevo coach', `
      <form id="z33-coach-form" class="z33a-form">
        <label>Nombre<input id="co-name" required></label>
        <label>Especialidad<input id="co-specialty"></label>
        <label>Foto URL<input id="co-photo"></label>
        <label>Bio<textarea id="co-bio"></textarea></label>
        <div class="z33a-actions-row"><button type="button" class="z33a-btn" id="co-cancel">Cancelar</button><button class="z33a-btn red">Guardar</button></div>
      </form>`);
    $('#co-name').value = c.name || ''; $('#co-specialty').value = c.specialty || ''; $('#co-photo').value = c.photo_url || ''; $('#co-bio').value = c.bio || '';
    $('#co-cancel').onclick = closeDrawer;
    $('#z33-coach-form').onsubmit = async (e) => {
      e.preventDefault();
      const payload = { name: $('#co-name').value.trim(), specialty: $('#co-specialty').value.trim() || null, photo_url: $('#co-photo').value.trim() || null, bio: $('#co-bio').value.trim() || null, is_active: true, updated_at: new Date().toISOString() };
      const r = id ? await db.from('coaches').update(payload).eq('id', id) : await db.from('coaches').insert(payload);
      if (r.error) return alert(r.error.message);
      closeDrawer(); await route('coaches');
    };
  }

  // =================================================================
  // AGENDA / CLASES — CRUD completo + eliminación real
  // =================================================================
  function agenda() {
    const days = Array.from({ length: 7 }, (_, i) => addDays(state.weekAnchor, i));
    const startHour = 5, endHour = 21, hourPx = 48;
    const headers = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];
    $('#z33-content').innerHTML = `${pageShell('Clases / Horarios', 'Semana completa.', '<button class="z33a-btn red" id="z33-new-class">+ Clase</button>')}
      <div class="z33a-toolbar">
        <div class="z33a-actions-row"><button class="z33a-btn" id="z33-week-prev">← Semana</button><button class="z33a-btn" id="z33-week-today">Hoy</button><button class="z33a-btn" id="z33-week-next">Semana →</button></div>
        <div class="z33a-sub">${new Date(days[0] + 'T12:00:00').toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })} – ${new Date(days[6] + 'T12:00:00').toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
      </div>
      <div class="z33a-calendar"><div class="z33a-cal-inner">
        <div class="z33a-week-head"><div></div>${days.map((d, i) => `<div><small>${headers[i]}</small><b>${new Date(d + 'T12:00:00').getDate()}</b></div>`).join('')}</div>
        <div class="z33a-week-body">
          <div class="z33a-time-col">${Array.from({ length: endHour - startHour + 1 }, (_, i) => `<span class="z33a-time" style="top:${i * hourPx}px">${String(startHour + i).padStart(2, '0')}:00</span>`).join('')}</div>
          <div class="z33a-day-cols">${days.map((d) => `<div class="z33a-day-col">${Array.from({ length: endHour - startHour + 1 }, (_, i) => `<div class="z33a-hour" style="top:${i * hourPx}px"></div>`).join('')}${state.classes.filter((c) => c.class_date === d && c.status !== 'cancelled').map((c) => {
            const top = (parseMinutes(c.start_time) - startHour * 60) / 60 * hourPx;
            const h = (Number(c.duration_minutes || 60) / 60) * hourPx;
            const booked = state.reservations.filter((r) => r.class_id === c.id && r.status === 'reserved').length;
            return `<div class="z33a-class ${booked >= (c.capacity || 10) ? 'full' : ''} ${c.is_master_class ? 'master' : ''}" style="top:${top}px;height:${Math.max(28, h)}px" data-open-class="${c.id}"><strong>${timeText(c.start_time)} · ${esc(c.class_type)}</strong><small>${esc(c.coach?.name || 'Sin coach')} · ${booked}/${c.capacity || 10}</small></div>`;
          }).join('')}</div>`).join('')}</div>
        </div>
      </div></div>`;
    $('#z33-new-class').onclick = () => classForm();
    $('#z33-week-prev').onclick = () => { state.weekAnchor = addDays(state.weekAnchor, -7); agenda(); };
    $('#z33-week-next').onclick = () => { state.weekAnchor = addDays(state.weekAnchor, 7); agenda(); };
    $('#z33-week-today').onclick = () => { state.weekAnchor = weekMonday(today()); agenda(); };
    $$('[data-open-class]').forEach((b) => b.onclick = () => openClassDetail(b.dataset.openClass));
  }

  function openClassDetail(id) {
    const c = state.classes.find((x) => x.id === id); if (!c) return;
    const rs = state.reservations.filter((r) => r.class_id === id);
    const active = rs.filter((r) => r.status === 'reserved').length;
    openDrawer(esc(c.class_type || 'Clase'), `
      <div class="z33a-card"><div class="z33a-row">
        <div><div class="z33a-muted">Fecha</div><b>${dateText(c.class_date)}</b></div>
        <div><div class="z33a-muted">Hora</div><b>${timeText(c.start_time)} (${c.duration_minutes || 60} min)</b></div>
        <div><div class="z33a-muted">Capacidad / mínimo</div><b>${c.capacity} / ${c.min_attendees ?? 1}</b></div>
        <div><div class="z33a-muted">Ocupados</div><b>${active}</b></div>
      </div></div>
      <div class="z33a-card" style="margin-top:10px"><b>Coach</b><div class="z33a-muted">${esc(c.coach?.name || 'Sin asignar')}</div>${c.is_master_class ? '<span class="z33a-pill warn" style="margin-top:8px">Clase maestra</span>' : ''}</div>
      <div class="z33a-card" style="margin-top:10px"><b>Reservas</b><div class="z33a-list" style="margin-top:8px">${rs.map((r) => `<div class="z33a-item"><div><b>${esc(r.profiles?.full_name || 'Cliente')}</b><div class="z33a-muted">${esc(r.profiles?.phone || '')} · ${esc(r.profiles?.email || '')}</div></div><span class="z33a-pill ${r.status === 'reserved' ? 'ok' : 'warn'}">${esc(r.status)}</span></div>`).join('') || '<div class="z33a-empty">Sin reservas.</div>'}</div></div>
      <div class="z33a-actions-row" style="margin-top:12px"><button class="z33a-btn" id="z33-class-edit">Editar</button><button class="z33a-btn danger" id="z33-class-delete">Eliminar clase</button></div>`);
    $('#z33-class-edit').onclick = () => classForm(id);
    $('#z33-class-delete').onclick = async () => {
      if (!confirm('¿Eliminar esta clase de forma PERMANENTE?\n\nSus reservas asociadas también se eliminarán. Esta acción no se puede deshacer.')) return;
      const r = await db.rpc('admin_delete_class', { p_class_id: id });
      if (r.error) return alert(r.error.message);
      closeDrawer(); await route('agenda');
    };
  }

  function classForm(id) {
    const c = id ? state.classes.find((v) => v.id === id) : null;
    const existingCoachIds = new Set(state.masterOptions.filter((o) => o.class_id === id).map((o) => o.coach_id));
    openDrawer(id ? 'Editar clase' : 'Nueva clase', `
      <form id="z33-class-form" class="z33a-form">
        <div class="z33a-row">
          <label>Fecha<input id="cf-date" type="date" required></label>
          <label>Hora inicio<input id="cf-time" type="time" required></label>
        </div>
        <div class="z33a-row">
          <label>Duración<select id="cf-duration">${[30, 45, 60, 75, 90].map((v) => `<option value="${v}">${v} min</option>`).join('')}</select></label>
          <label>Tipo<select id="cf-type">${CLASS_TYPES.map((v) => `<option value="${v}">${v}</option>`).join('')}</select></label>
        </div>
        <div class="z33a-row">
          <label>Coach<select id="cf-coach"><option value="">Sin coach</option>${state.coaches.filter((x) => x.is_active !== false).map((co) => `<option value="${co.id}">${esc(co.name)}</option>`).join('')}</select></label>
          <label>Estado<select id="cf-status"><option value="scheduled">Programada</option><option value="cancelled">Cancelada</option><option value="completed">Completada</option></select></label>
        </div>
        <div class="z33a-row">
          <label>Capacidad (1–10)<input id="cf-cap" type="number" min="1" max="10" required></label>
          <label>Mínimo de asistentes (1–10)<input id="cf-min" type="number" min="1" max="10" required></label>
        </div>
        <label class="z33a-check"><input id="cf-master" type="checkbox"> Es clase maestra (coach por confirmar entre varios)</label>
        <div id="cf-master-coaches" style="display:none">
          <label>Coaches disponibles para esta clase maestra</label>
          <div class="z33a-list" style="margin-top:6px">${state.coaches.filter((x) => x.is_active !== false).map((co) => `<label class="z33a-check"><input type="checkbox" class="cf-master-opt" value="${co.id}" ${existingCoachIds.has(co.id) ? 'checked' : ''}> ${esc(co.name)}</label>`).join('')}</div>
        </div>
        <div id="cf-msg"></div>
        <div class="z33a-actions-row"><button type="button" class="z33a-btn" id="cf-cancel">Cancelar</button><button class="z33a-btn red">Guardar clase</button></div>
      </form>`);
    $('#cf-date').value = c?.class_date || today();
    $('#cf-time').value = timeText(c?.start_time || '08:00');
    $('#cf-duration').value = String(c?.duration_minutes || 60);
    $('#cf-type').value = c?.class_type || 'Functional';
    $('#cf-coach').value = c?.coach_id || '';
    $('#cf-status').value = c?.status || 'scheduled';
    $('#cf-cap').value = String(c?.capacity || 10);
    $('#cf-min').value = String(c?.min_attendees ?? 1);
    $('#cf-master').checked = !!c?.is_master_class;
    $('#cf-master-coaches').style.display = c?.is_master_class ? '' : 'none';
    $('#cf-cancel').onclick = closeDrawer;
    $('#cf-master').onchange = (e) => { $('#cf-master-coaches').style.display = e.target.checked ? '' : 'none'; };
    $('#z33-class-form').onsubmit = async (e) => {
      e.preventDefault();
      const msg = $('#cf-msg'); msg.innerHTML = '';
      const start = $('#cf-time').value;
      const dur = Number($('#cf-duration').value);
      const cap = Math.min(10, Math.max(1, Number($('#cf-cap').value || 10)));
      const min = Math.min(10, Math.max(1, Number($('#cf-min').value || 1)));
      const isMaster = $('#cf-master').checked;
      const payload = {
        class_date: $('#cf-date').value, start_time: start, end_time: fmtMinutes(parseMinutes(start) + dur),
        duration_minutes: dur, class_type: $('#cf-type').value, coach_id: $('#cf-coach').value || null,
        status: $('#cf-status').value, capacity: cap, min_attendees: min, is_master_class: isMaster,
        updated_at: new Date().toISOString()
      };
      const result = id ? await db.from('classes').update(payload).eq('id', id).select().single() : await db.from('classes').insert(payload).select().single();
      if (result.error) { msg.innerHTML = `<div class="z33a-msg err">${esc(result.error.message)}</div>`; return; }
      const classId = result.data.id;
      if (isMaster) {
        const chosen = $$('.cf-master-opt:checked').map((el) => el.value);
        await db.from('master_class_coach_options').delete().eq('class_id', classId);
        if (chosen.length) await db.from('master_class_coach_options').insert(chosen.map((coach_id) => ({ class_id: classId, coach_id })));
      } else if (id) {
        await db.from('master_class_coach_options').delete().eq('class_id', classId);
      }
      closeDrawer(); await route('agenda');
    };
  }

  // =================================================================
  // FINANZAS — un único flujo de pago (RPC admin_register_payment)
  // =================================================================
  let chartInstance = null;

  function finance() {
    $('#z33-content').innerHTML = `${pageShell('Finanzas', 'Pagos, membresías, planes, fundadores y reportes.')}
      <div class="z33a-tabs">${[['overview', 'Resumen'], ['payments', 'Pagos'], ['plans', 'Planes'], ['founders', 'Fundadores'], ['expenses', 'Egresos']].map(([k, l]) => `<button class="z33a-tab ${state.financeTab === k ? 'active' : ''}" data-finance-tab="${k}">${l}</button>`).join('')}</div>
      <div id="z33-finance-body"></div>`;
    $$('[data-finance-tab]').forEach((b) => b.onclick = () => { state.financeTab = b.dataset.financeTab; finance(); });
    financeTabBody();
  }

  function financeTabBody() {
    const body = $('#z33-finance-body'); if (!body) return;
    if (state.financeTab === 'overview') return financeOverview(body);
    if (state.financeTab === 'payments') return financePayments(body);
    if (state.financeTab === 'plans') return financePlans(body);
    if (state.financeTab === 'founders') return financeFounders(body);
    return financeExpenses(body);
  }

  function periodRange(period) {
    if (period === 'day') return [today(), today()];
    if (period === 'year') return [today().slice(0, 4) + '-01-01', today()];
    return [today().slice(0, 7) + '-01', today()];
  }
  function bucketKey(dateStr, period) {
    if (period === 'day') return dateStr; // one bucket per hour would need time; day view buckets by date itself
    if (period === 'year') return dateStr.slice(0, 7);
    return dateStr; // month view: bucket by day
  }

  function financeOverview(body) {
    const [from, to] = periodRange(state.reportPeriod);
    const approved = state.payments.filter((p) => p.status === 'approved');
    const inRange = approved.filter((p) => (p.payment_date || '').slice(0, 10) >= from && (p.payment_date || '').slice(0, 10) <= to);
    const income = inRange.reduce((s, p) => s + Number(p.amount || 0), 0);
    const pendingAmt = state.payments.filter((p) => p.status === 'pending' || p.status === 'partial').reduce((s, p) => s + Number(p.amount || 0), 0);
    const latest = latestMembershipByClient();
    let activeMem = 0; for (const c of state.clients) if (membershipStatus(latest.get(c.id)).key === 'active') activeMem++;

    const groups = {};
    inRange.forEach((p) => { const k = bucketKey((p.payment_date || '').slice(0, 10), state.reportPeriod); groups[k] = (groups[k] || 0) + Number(p.amount || 0); });
    const labels = Object.keys(groups).sort();

    body.innerHTML = `
      <div class="z33a-stats">${stat('↗', 'red', money(income), 'Ingresos del período')}${stat('◷', 'amber', money(pendingAmt), 'Pagos pendientes')}${stat('♧', 'green', activeMem, 'Membresías activas')}${stat('☺', 'gray', state.clients.length, 'Total clientes')}</div>
      <div class="z33a-chart">
        <div class="z33a-toolbar" style="margin-bottom:0"><div class="z33a-chart-title">Ingresos aprobados</div>
          <div class="z33a-filter-row">${['day', 'month', 'year'].map((p) => `<button class="z33a-filter ${state.reportPeriod === p ? 'active' : ''}" data-period="${p}">${p === 'day' ? 'Día' : p === 'month' ? 'Mes' : 'Año'}</button>`).join('')}</div>
        </div>
        <div class="z33a-chart-wrap">${labels.length ? '<canvas id="z33-income-chart"></canvas>' : '<div class="z33a-empty">No hay ingresos aprobados en este período.</div>'}</div>
      </div>
      <div class="z33a-card" style="margin-top:16px"><h3 style="margin:0 0 10px">Pagos pendientes de cobro</h3><div class="z33a-list">${state.payments.filter((p) => p.status === 'pending' || p.status === 'partial').slice(0, 8).map((p) => `<div class="z33a-item"><div><b>${esc(p.profiles?.full_name || 'Cliente')}</b><small>${esc(p.concept || 'Pago')} · ${dateText(p.payment_date)}</small></div><strong>${money(p.amount)}</strong></div>`).join('') || '<div class="z33a-empty">No hay pagos pendientes.</div>'}</div></div>`;
    $$('[data-period]').forEach((b) => b.onclick = () => { state.reportPeriod = b.dataset.period; financeOverview(body); });
    if (labels.length) drawChart(labels, labels.map((k) => groups[k]));
  }

  function drawChart(labels, values) {
    const canvas = $('#z33-income-chart'); if (!canvas || !window.Chart) return;
    if (chartInstance) { chartInstance.destroy(); chartInstance = null; }
    chartInstance = new window.Chart(canvas.getContext('2d'), {
      type: 'bar',
      data: { labels: labels.map((l) => state.reportPeriod === 'year' ? l : l.slice(5)), datasets: [{ label: 'Ingresos', data: values, backgroundColor: '#d3232d', borderRadius: 5, maxBarThickness: 42 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => money(ctx.parsed.y) } } }, scales: { y: { beginAtZero: true, ticks: { callback: (v) => money(v) } } } }
    });
  }

  function financePayments(body) {
    body.innerHTML = `
      <div class="z33a-card">
        <div class="z33a-toolbar">
          <div class="z33a-filter-row">${[['all', 'Todos'], ['approved', 'Pagados'], ['pending', 'Pendientes'], ['partial', 'Parciales'], ['rejected', 'Rechazados']].map(([k, l]) => `<button class="z33a-filter ${k === 'all' ? 'active' : ''}" data-payfilter="${k}">${l}</button>`).join('')}</div>
          <button class="z33a-btn red" id="z33-new-payment">Registrar pago</button>
        </div>
        <input class="z33a-search" id="z33-pay-search" placeholder="Buscar cliente o concepto" style="margin-bottom:12px">
        <div class="z33a-table"><table><thead><tr><th>Cliente</th><th>Concepto</th><th>Monto</th><th>Fecha</th><th>Método</th><th>Estado</th><th></th></tr></thead><tbody id="z33-pay-body"></tbody></table></div>
      </div>`;
    const draw = (status = 'all') => {
      const q = ($('#z33-pay-search')?.value || '').toLowerCase();
      let rows = state.payments.filter((p) => `${p.profiles?.full_name || ''} ${p.profiles?.email || ''} ${p.concept || ''}`.toLowerCase().includes(q));
      if (status !== 'all') rows = rows.filter((p) => p.status === status);
      $('#z33-pay-body').innerHTML = rows.length ? rows.map((p) => `<tr><td><b>${esc(p.profiles?.full_name || 'Cliente')}</b><div class="z33a-muted">${esc(p.profiles?.email || '')}</div></td><td>${esc(p.concept || p.membership_plans?.name || 'Membresía')}</td><td><b>${money(p.amount)}</b></td><td>${dateText(p.payment_date)}</td><td>${esc(p.method || '—')}</td><td><span class="z33a-pill ${p.status === 'approved' ? 'ok' : p.status === 'pending' || p.status === 'partial' ? 'warn' : 'bad'}">${{ approved: 'Pagado', pending: 'Pendiente', partial: 'Parcial', rejected: 'Rechazado' }[p.status] || p.status}</span></td><td>${p.status !== 'approved' ? `<button class="z33a-btn" data-approve-pay="${p.id}">Marcar pagado</button>` : ''}</td></tr>`).join('') : '<tr><td colspan="7" class="z33a-empty">Sin pagos.</td></tr>';
      $$('[data-approve-pay]').forEach((b) => b.onclick = async () => {
        const r = await db.rpc('admin_confirm_payment', { p_payment_id: b.dataset.approvePay });
        if (r.error) return alert(r.error.message);
        await route('finance');
      });
    };
    $('#z33-pay-search').oninput = () => draw($('.z33a-filter.active')?.dataset.payfilter || 'all');
    $$('[data-payfilter]').forEach((b) => b.onclick = () => { $$('[data-payfilter]').forEach((x) => x.classList.remove('active')); b.classList.add('active'); draw(b.dataset.payfilter); });
    $('#z33-new-payment').onclick = () => paymentForm();
    draw('all');
  }

  function paymentForm(preselectProfileId) {
    const latest = latestMembershipByClient();
    openDrawer('Registrar pago', `
      <form id="z33-payment-form" class="z33a-form">
        <label>Cliente<select id="pf-client" required>${state.clients.map((c) => `<option value="${c.id}">${esc(c.full_name || c.email || 'Cliente')}</option>`).join('')}</select></label>
        <div id="pf-membership-info" class="z33a-muted"></div>
        <div class="z33a-row"><label>Plan (si aplica)<select id="pf-plan"><option value="">Sin plan / cargo único</option>${state.plans.map((p) => `<option value="${p.id}">${esc(p.name)} · ${money(p.price)}</option>`).join('')}</select></label><label>Concepto<input id="pf-concept" value="Mensualidad" required></label></div>
        <div class="z33a-row"><label>Monto<input id="pf-amount" type="number" min="1" step="0.01" required></label><label>Fecha de pago<input id="pf-date" type="date" required></label></div>
        <div class="z33a-row"><label>Método<select id="pf-method"><option value="transferencia">Transferencia</option><option value="ficha">Ficha</option><option value="online">Online</option><option value="efectivo">Efectivo</option><option value="tarjeta">Tarjeta</option></select></label><label>Estado<select id="pf-status"><option value="approved">Pagado</option><option value="pending">Pendiente</option><option value="partial">Parcial</option><option value="rejected">Rechazado</option></select></label></div>
        <label>Notas<textarea id="pf-notes"></textarea></label>
        <div id="pf-msg"></div>
        <div class="z33a-actions-row"><button type="button" class="z33a-btn" id="pf-cancel">Cancelar</button><button class="z33a-btn red" id="pf-save">Guardar pago</button></div>
      </form>`);
    $('#pf-date').value = today();
    $('#pf-amount').value = '500';
    const updateInfo = () => {
      const m = latest.get($('#pf-client').value);
      const ms = membershipStatus(m);
      $('#pf-membership-info').textContent = m ? `Membresía actual: ${m.membership_plans?.name || 'Plan'} — ${ms.label} (vence ${dateText(m.end_date)})` : 'Sin membresía registrada todavía: si eliges un plan, se creará al aprobar el pago.';
      if (m?.plan_id) $('#pf-plan').value = m.plan_id;
    };
    if (preselectProfileId) $('#pf-client').value = preselectProfileId;
    updateInfo();
    $('#pf-client').onchange = updateInfo;
    $('#pf-plan').onchange = () => { const p = state.plans.find((x) => x.id === $('#pf-plan').value); if (p) $('#pf-amount').value = String(p.is_founder_plan ? 500 : p.price); };
    $('#pf-cancel').onclick = closeDrawer;
    $('#z33-payment-form').onsubmit = async (e) => {
      e.preventDefault();
      const msg = $('#pf-msg'); msg.innerHTML = '';
      const btn = $('#pf-save'); btn.disabled = true; btn.textContent = 'Guardando…';
      const profileId = $('#pf-client').value;
      const m = latest.get(profileId);
      const planId = $('#pf-plan').value || m?.plan_id || null;
      const r = await db.rpc('admin_register_payment', {
        p_profile_id: profileId,
        p_membership_id: m?.id || null,
        p_plan_id: planId,
        p_amount: Number($('#pf-amount').value || 0),
        p_method: $('#pf-method').value,
        p_status: $('#pf-status').value,
        p_concept: $('#pf-concept').value.trim() || 'Membresía',
        p_payment_date: $('#pf-date').value,
        p_notes: $('#pf-notes').value.trim() || null
      });
      btn.disabled = false; btn.textContent = 'Guardar pago';
      if (r.error) { msg.innerHTML = `<div class="z33a-msg err">${esc(r.error.message)}</div>`; return; }
      closeDrawer(); await route('finance');
    };
  }

  function financePlans(body) {
    body.innerHTML = `<div class="z33a-toolbar"><span class="z33a-sub">El Plan Fundadores se mantiene fijo en $500/mes de por vida (regla aplicada automáticamente).</span><button class="z33a-btn red" id="z33-new-plan">Nuevo plan</button></div>
      <div class="z33a-grid3">${state.plans.map((p) => `<div class="z33a-card"><div class="z33a-kicker">${p.is_founder_plan ? 'Fundadores' : 'Plan'}</div><h3>${esc(p.name)}</h3><div class="z33a-value">${money(p.is_founder_plan ? 500 : p.price)}</div><div class="z33a-muted">${p.duration_days || 30} días · ${p.is_active === false ? 'Oculto' : 'Activo'}</div><button class="z33a-btn" style="margin-top:10px" data-edit-plan="${p.id}">Editar</button></div>`).join('') || '<div class="z33a-empty">No hay planes.</div>'}</div>`;
    $('#z33-new-plan').onclick = () => planForm();
    $$('[data-edit-plan]').forEach((b) => b.onclick = () => planForm(b.dataset.editPlan));
  }
  function planForm(id) {
    const p = id ? state.plans.find((x) => x.id === id) : {};
    openDrawer(id ? 'Editar plan' : 'Nuevo plan', `
      <form id="z33-plan-form" class="z33a-form">
        <label>Nombre<input id="pl-name" required></label>
        <label>Descripción<textarea id="pl-desc"></textarea></label>
        <div class="z33a-row"><label>Precio<input id="pl-price" type="number" step="0.01" required></label><label>Duración (días)<input id="pl-days" type="number" required></label></div>
        <label class="z33a-check"><input id="pl-founder" type="checkbox"> Es el Plan Fundadores ($500 fijo)</label>
        <label class="z33a-check"><input id="pl-active" type="checkbox"> Visible / activo</label>
        <div class="z33a-actions-row"><button type="button" class="z33a-btn" id="pl-cancel">Cancelar</button><button class="z33a-btn red">Guardar plan</button></div>
      </form>`);
    $('#pl-name').value = p.name || ''; $('#pl-desc').value = p.description || ''; $('#pl-price').value = p.price ?? 500; $('#pl-days').value = p.duration_days ?? 30;
    $('#pl-founder').checked = !!p.is_founder_plan; $('#pl-active').checked = p.is_active !== false;
    $('#pl-cancel').onclick = closeDrawer;
    $('#z33-plan-form').onsubmit = async (e) => {
      e.preventDefault();
      const payload = { name: $('#pl-name').value.trim(), description: $('#pl-desc').value.trim() || null, price: Number($('#pl-price').value || 0), duration_days: Number($('#pl-days').value || 30), is_founder_plan: $('#pl-founder').checked, is_active: $('#pl-active').checked, updated_at: new Date().toISOString() };
      const r = id ? await db.from('membership_plans').update(payload).eq('id', id) : await db.from('membership_plans').insert(payload);
      if (r.error) return alert(r.error.message);
      closeDrawer(); await route('finance');
    };
  }

  function financeFounders(body) {
    body.innerHTML = `<div class="z33a-toolbar"><span class="z33a-sub">${state.founders.filter((f) => !f.used_by && f.is_active !== false).length} códigos disponibles.</span><button class="z33a-btn red" id="z33-new-founder">+ Código</button></div>
      <div class="z33a-table"><table><thead><tr><th>Código</th><th>Estado</th><th>Usado por</th><th>Creado</th><th></th></tr></thead><tbody>${state.founders.map((f) => `<tr><td><b>${esc(f.code)}</b></td><td><span class="z33a-pill ${f.is_active === false ? 'off' : f.used_by ? 'warn' : 'ok'}">${f.is_active === false ? 'Inactivo' : f.used_by ? 'Usado' : 'Disponible'}</span></td><td>${esc(state.clients.find((c) => c.id === f.used_by)?.full_name || '—')}</td><td>${dateText((f.created_at || '').slice(0, 10))}</td><td><button class="z33a-btn" data-toggle-founder="${f.id}">${f.is_active === false ? 'Activar' : 'Desactivar'}</button></td></tr>`).join('') || '<tr><td colspan="5" class="z33a-empty">Sin códigos.</td></tr>'}</tbody></table></div>`;
    $('#z33-new-founder').onclick = async () => {
      const code = prompt('Nuevo código (ej. Z33-FND-031)'); if (!code) return;
      const r = await db.from('founder_codes').insert({ code: code.trim().toUpperCase(), is_active: true });
      if (r.error) return alert(r.error.message);
      await route('finance');
    };
    $$('[data-toggle-founder]').forEach((b) => b.onclick = async () => {
      const f = state.founders.find((x) => x.id === b.dataset.toggleFounder);
      const r = await db.from('founder_codes').update({ is_active: f.is_active === false }).eq('id', f.id);
      if (r.error) return alert(r.error.message);
      await route('finance');
    });
  }

  function financeExpenses(body) {
    const income = state.payments.filter((p) => p.status === 'approved').reduce((s, p) => s + Number(p.amount || 0), 0);
    const outgo = state.expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
    body.innerHTML = `<div class="z33a-stats">${stat('↗', 'red', money(income), 'Ingresos totales')}${stat('↘', 'amber', money(outgo), 'Egresos totales')}${stat('=', 'gray', money(income - outgo), 'Balance')}</div>
      <div class="z33a-toolbar" style="margin-top:16px"><span class="z33a-sub">Historial de egresos</span><button class="z33a-btn red" id="z33-new-expense">Registrar egreso</button></div>
      <div class="z33a-table"><table><thead><tr><th>Fecha</th><th>Concepto</th><th>Categoría</th><th>Monto</th></tr></thead><tbody>${state.expenses.map((e) => `<tr><td>${dateText(e.expense_date)}</td><td>${esc(e.concept)}</td><td>${esc(e.category || 'General')}</td><td><b>${money(e.amount)}</b></td></tr>`).join('') || '<tr><td colspan="4" class="z33a-empty">Sin egresos registrados.</td></tr>'}</tbody></table></div>`;
    $('#z33-new-expense').onclick = () => expenseForm();
  }

  function expenseForm() {
    openDrawer('Registrar egreso', `
      <form id="z33-expense-form" class="z33a-form">
        <label>Concepto<input id="ex-concept" required></label>
        <div class="z33a-row"><label>Monto<input id="ex-amount" type="number" min="0.01" step="0.01" required></label><label>Fecha<input id="ex-date" type="date" required></label></div>
        <div class="z33a-row"><label>Categoría<input id="ex-category" placeholder="Renta, equipo, servicios…"></label><label>Método<input id="ex-method" placeholder="Transferencia, efectivo…"></label></div>
        <label>Notas<textarea id="ex-notes"></textarea></label>
        <div class="z33a-actions-row"><button type="button" class="z33a-btn" id="ex-cancel">Cancelar</button><button class="z33a-btn red">Guardar egreso</button></div>
      </form>`);
    $('#ex-date').value = today();
    $('#ex-cancel').onclick = closeDrawer;
    $('#z33-expense-form').onsubmit = async (e) => {
      e.preventDefault();
      const r = await db.from('expenses').insert({ concept: $('#ex-concept').value.trim(), amount: Number($('#ex-amount').value || 0), expense_date: $('#ex-date').value, category: $('#ex-category').value.trim() || null, method: $('#ex-method').value.trim() || null, notes: $('#ex-notes').value.trim() || null });
      if (r.error) return alert(r.error.message);
      closeDrawer(); await route('finance');
    };
  }

  // =================================================================
  // LANDING / CONTENIDO
  // =================================================================
  function landing() {
    const s = state.site; const hero = s.hero || {}, brand = s.brand || {}, contact = s.contact || {}, community = s.community || {};
    $('#z33-content').innerHTML = `${pageShell('Editar Landing', 'Contenido público del sitio.')}
      <div class="z33a-grid2">
        <div class="z33a-card"><div class="z33a-kicker">Marca</div><h3>Logo</h3><form class="z33a-form" id="f-brand"><label>URL del logo<input id="ls-logo" value="${esc(brand.logo_url || '')}"></label><button class="z33a-btn red">Guardar</button></form></div>
        <div class="z33a-card"><div class="z33a-kicker">Hero</div><h3>Portada</h3><form class="z33a-form" id="f-hero"><label>Título<input id="ls-title" value="${esc(hero.title || '')}"></label><label>Texto<textarea id="ls-copy">${esc(hero.copy || '')}</textarea></label><button class="z33a-btn red">Guardar</button></form></div>
        <div class="z33a-card"><div class="z33a-kicker">Contacto</div><h3>Datos</h3><form class="z33a-form" id="f-contact"><label>Teléfono<input id="ls-phone" value="${esc(contact.phone || '')}"></label><label>Instagram<input id="ls-ig" value="${esc(contact.instagram || '')}"></label><label>Dirección<textarea id="ls-address">${esc(contact.address || '')}</textarea></label><button class="z33a-btn red">Guardar</button></form></div>
        <div class="z33a-card"><div class="z33a-kicker">Comunidad</div><h3>Bloque social</h3><form class="z33a-form" id="f-community"><label>Título<input id="ls-ctitle" value="${esc(community.title || '')}"></label><label>Texto<textarea id="ls-ccopy">${esc(community.copy || '')}</textarea></label><button class="z33a-btn red">Guardar</button></form></div>
      </div>`;
    const save = async (key, value) => { const r = await db.from('site_content').upsert({ key, value, is_public: true, updated_by: state.user.id, updated_at: new Date().toISOString() }, { onConflict: 'key' }); if (r.error) return alert(r.error.message); await route('landing'); };
    $('#f-brand').onsubmit = (e) => { e.preventDefault(); save('brand', { logo_url: $('#ls-logo').value }); };
    $('#f-hero').onsubmit = (e) => { e.preventDefault(); save('hero', { title: $('#ls-title').value, copy: $('#ls-copy').value }); };
    $('#f-contact').onsubmit = (e) => { e.preventDefault(); save('contact', { phone: $('#ls-phone').value, instagram: $('#ls-ig').value, address: $('#ls-address').value }); };
    $('#f-community').onsubmit = (e) => { e.preventDefault(); save('community', { title: $('#ls-ctitle').value, copy: $('#ls-ccopy').value }); };
  }

  // =================================================================
  // Arranque — llamado por app.js una vez confirmado role === 'admin'
  // =================================================================
  async function start(user, profile) {
    state.user = user; state.profile = profile;
    injectStyles();
    await loadData();
    renderRoot();
    await route('dashboard');
  }

  window.ZONA33_ADMIN = { start };
})();
