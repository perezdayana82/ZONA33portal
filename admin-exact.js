(() => {
  'use strict';

  const SB_URL = 'https://ponhllwbvhtczaphfdgw.supabase.co';
  const SB_KEY = 'sb_publishable_okgoHkX2YZFtQ9P72ckztQ_jiCuWN-6';
  const db = window.supabase.createClient(SB_URL, SB_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });

  const state = {
    user: null,
    profile: null,
    page: 'dashboard',
    financeTab: 'payments',
    clients: [],
    coaches: [],
    classes: [],
    reservations: [],
    payments: [],
    memberships: [],
    plans: [],
    founders: [],
    expenses: [],
    site: {}
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const esc = (value) => String(value ?? '').replace(/[&<>\"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
  const money = (value) => '$' + Number(value || 0).toLocaleString('es-MX', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
  const today = () => new Date().toISOString().slice(0, 10);
  const dateText = (value) => value
    ? new Date(value + 'T12:00:00').toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';
  const timeText = (value) => String(value || '').slice(0, 5);
  const addDays = (value, amount) => {
    const d = new Date(value + 'T12:00:00');
    d.setDate(d.getDate() + amount);
    return d.toISOString().slice(0, 10);
  };
  const monthStart = () => today().slice(0, 7) + '-01';

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
      .z33a-content{max-width:1120px;margin:0 auto;padding:25px 28px 54px}.z33a-kicker{font-size:10px;font-weight:800;letter-spacing:.13em;text-transform:uppercase;color:#c91428}.z33a-h2{font-size:31px;line-height:1.05;margin:5px 0;font-weight:720;letter-spacing:-.035em}.z33a-sub{font-size:13px;color:#7c8189}.z33a-head{display:flex;justify-content:space-between;align-items:flex-end;gap:12px;margin-bottom:18px}.z33a-head-actions{display:flex;gap:7px}
      .z33a-stats{display:grid;grid-template-columns:1fr 1fr;gap:16px}.z33a-stat{background:#fff;border:1px solid #e1e2e5;border-radius:16px;padding:20px;min-height:140px}.z33a-icon{width:40px;height:40px;border-radius:11px;display:grid;place-items:center;font-size:18px}.z33a-icon.red{background:#fff1f1;color:#d3232d}.z33a-icon.amber{background:#fff8e9;color:#b87900}.z33a-icon.green{background:#e9fbf3;color:#12a46b}.z33a-icon.gray{background:#f1f1f3;color:#34383e}.z33a-value{font-size:31px;line-height:1.1;font-weight:520;margin-top:13px;letter-spacing:-.03em}.z33a-label{font-size:14px;color:#80848c;margin-top:7px}
      .z33a-chart{margin-top:16px;background:#fff;border:1px solid #e1e2e5;border-radius:16px;padding:22px}.z33a-chart-title{font-size:18px;font-weight:650;margin-bottom:20px}.z33a-bars{display:grid;gap:10px}.z33a-bar{display:grid;grid-template-columns:96px 1fr 80px;align-items:center;gap:9px;font-size:12px;color:#757982}.z33a-track{height:30px;background:#fafafa;border-radius:5px;overflow:hidden}.z33a-fill{height:100%;background:#d9272f;border-radius:5px}.z33a-amount{text-align:right;color:#202226;font-weight:600}
      .z33a-tabs{display:flex;gap:2px;border-bottom:1px solid #e2e3e6;margin:22px 0 16px;overflow:auto}.z33a-tab{border:0;background:transparent;padding:11px 13px;font-size:12px;font-weight:650;color:#777b83;border-bottom:2px solid transparent;white-space:nowrap;cursor:pointer}.z33a-tab.active{color:#c61d28;border-color:#d9272f}
      .z33a-card{background:#fff;border:1px solid #e1e2e5;border-radius:14px;padding:18px}.z33a-grid2{display:grid;grid-template-columns:1.45fr 1fr;gap:16px}.z33a-grid3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}.z33a-toolbar{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:14px}.z33a-search{height:40px;min-width:280px;border:1px solid #dedfe3;border-radius:9px;padding:0 12px;background:#fff;font-size:12px}.z33a-filter-row{display:flex;gap:6px;flex-wrap:wrap}.z33a-filter{height:36px;border:1px solid #dedfe3;border-radius:8px;background:#fff;padding:0 11px;font-size:11px;cursor:pointer}.z33a-filter.active{background:#fff0f0;border-color:#e7a9ad;color:#b71f28;font-weight:700}
      .z33a-table{overflow:auto;border:1px solid #e1e2e5;border-radius:12px;background:#fff}.z33a-table table{width:100%;min-width:760px;border-collapse:collapse}.z33a-table th{background:#fafafa;color:#777b83;text-transform:uppercase;font-size:9px;letter-spacing:.06em;text-align:left;padding:11px;border-bottom:1px solid #ececef}.z33a-table td{padding:12px 11px;border-bottom:1px solid #f0f0f2;font-size:12px;vertical-align:middle}.z33a-table tr:last-child td{border-bottom:0}.z33a-muted{font-size:10px;color:#858991;margin-top:3px}.z33a-pill{display:inline-flex;border-radius:999px;padding:4px 8px;font-size:9px;font-weight:800}.z33a-pill.ok{background:#e9f8f1;color:#14764c}.z33a-pill.warn{background:#fff7df;color:#866300}.z33a-pill.bad{background:#fdecef;color:#b4232e}
      .z33a-list{display:grid;gap:8px}.z33a-item{background:#fafbfc;border:1px solid #eceef0;border-radius:10px;padding:12px;display:flex;align-items:center;justify-content:space-between;gap:10px}.z33a-empty{padding:34px;text-align:center;color:#8a8e95;font-size:12px}.z33a-actions-row{display:flex;gap:6px;flex-wrap:wrap}
      .z33a-menu-overlay{position:fixed;inset:0;background:rgba(20,22,26,.28);z-index:80;display:none}.z33a-menu-overlay.show{display:block}.z33a-menu-drawer{position:fixed;left:0;top:0;bottom:0;width:305px;background:#fff;z-index:81;box-shadow:18px 0 48px rgba(0,0,0,.12);padding:24px;transform:translateX(-100%);transition:transform .18s}.z33a-menu-drawer.show{transform:translateX(0)}.z33a-menu-title{font-size:20px;font-weight:700}.z33a-menu-sub{font-size:12px;color:#858991;margin-top:4px}.z33a-menu-list{display:grid;gap:4px;margin-top:22px}.z33a-menu-item{height:45px;border:0;background:#fff;border-radius:9px;text-align:left;padding:0 12px;font-size:13px;font-weight:600;color:#555a62;cursor:pointer}.z33a-menu-item:hover,.z33a-menu-item.active{background:#fff0f0;color:#b71e28}
      .z33a-drawer-overlay{position:fixed;inset:0;background:rgba(20,22,26,.28);z-index:90;display:none}.z33a-drawer-overlay.show{display:block}.z33a-drawer{position:fixed;top:0;right:0;bottom:0;width:min(500px,95vw);background:#fff;z-index:91;box-shadow:-18px 0 48px rgba(0,0,0,.15);padding:22px;overflow:auto;transform:translateX(100%);transition:transform .18s}.z33a-drawer.show{transform:translateX(0)}.z33a-drawer-head{display:flex;align-items:flex-start;gap:10px}.z33a-drawer-head h3{margin:0;font-size:20px}.z33a-drawer-head .z33a-btn{margin-left:auto}.z33a-form{display:grid;gap:12px;margin-top:18px}.z33a-form label{font-size:10px;font-weight:700;color:#727780}.z33a-form input,.z33a-form select,.z33a-form textarea{width:100%;margin-top:6px;padding:11px;border:1px solid #dfe1e5;border-radius:9px;background:#fff;font-size:12px}.z33a-form textarea{min-height:95px;resize:vertical}.z33a-row{display:grid;grid-template-columns:1fr 1fr;gap:10px}
      .z33a-calendar{background:#fff;border:1px solid #e1e2e5;border-radius:14px;overflow:auto}.z33a-cal-inner{min-width:980px}.z33a-week-head{display:grid;grid-template-columns:54px repeat(7,1fr);background:#fafafa;border-bottom:1px solid #e6e7e9}.z33a-week-head>div{padding:9px 3px;text-align:center;border-left:1px solid #f0f1f2}.z33a-week-head small{font-size:8px;color:#80858d;text-transform:uppercase}.z33a-week-head b{display:block;margin-top:3px;font-size:13px}.z33a-week-body{display:grid;grid-template-columns:54px 1fr}.z33a-time-col,.z33a-day-col{height:850px;position:relative}.z33a-time{position:absolute;right:7px;transform:translateY(-6px);font-size:8px;color:#959ba2}.z33a-day-cols{display:grid;grid-template-columns:repeat(7,1fr)}.z33a-day-col{border-left:1px solid #f0f1f2}.z33a-hour{position:absolute;left:0;right:0;border-top:1px solid #f4f4f5}.z33a-class{position:absolute;left:4px;right:4px;border:1px solid #dfe2e5;border-left:3px solid #2d3136;background:#fff;border-radius:7px;padding:5px;cursor:pointer;overflow:hidden}.z33a-class.full{border-left-color:#c91428;background:#fff1f1}.z33a-class strong{display:block;font-size:9px;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.z33a-class small{display:block;color:#858b93;font-size:8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .z33a-hero{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;margin-bottom:18px}.z33a-hero h2{font-size:32px;margin:4px 0}.z33a-big-actions{display:grid;grid-template-columns:repeat(2,minmax(150px,1fr));gap:10px;min-width:340px}.z33a-action-card{background:#fff;border:1px solid #e1e2e5;border-radius:14px;padding:16px}.z33a-action-card b{display:block;font-size:13px}.z33a-action-card span{display:block;color:#858a92;font-size:11px;margin-top:5px}
      @media(max-width:760px){.z33a-actions{display:none}.z33a-content{padding:18px 12px 42px}.z33a-stats{grid-template-columns:1fr}.z33a-grid2,.z33a-grid3{grid-template-columns:1fr}.z33a-row{grid-template-columns:1fr}.z33a-search{min-width:100%;width:100%}.z33a-bar{grid-template-columns:72px 1fr 68px}.z33a-big-actions{min-width:0;grid-template-columns:1fr}.z33a-menu-drawer{width:86vw}}
    `;
    document.head.appendChild(style);
  }

  function openMenu() { $('#z33-menu-overlay')?.classList.add('show'); $('#z33-menu')?.classList.add('show'); }
  function closeMenu() { $('#z33-menu-overlay')?.classList.remove('show'); $('#z33-menu')?.classList.remove('show'); }
  function openDrawer(title, html) { $('#z33-drawer-overlay')?.classList.add('show'); $('#z33-drawer')?.classList.add('show'); $('#z33-drawer').innerHTML = `<div class="z33a-drawer-head"><div><div class="z33a-kicker">ZONA 33</div><h3>${title}</h3></div><button class="z33a-btn" onclick="window.z33CloseDrawer()">Cerrar</button></div>${html}`; }
  function closeDrawer() { $('#z33-drawer-overlay')?.classList.remove('show'); $('#z33-drawer')?.classList.remove('show'); }
  window.z33CloseDrawer = closeDrawer;

  async function loadData() {
    const [clients, coaches, classes, reservations, payments, memberships, plans, founders, expenses, site] = await Promise.all([
      db.from('profiles').select('*').eq('role', 'cliente').order('created_at', { ascending: false }),
      db.from('coaches').select('*').order('is_active', { ascending: false }).order('name'),
      db.from('classes').select('*').gte('class_date', today()).order('class_date').order('start_time'),
      db.from('reservations').select('*,profiles(full_name,email,phone)').order('created_at', { ascending: false }),
      db.from('payments').select('*,profiles(full_name,email),membership_plans(name,is_founder_plan)').order('payment_date', { ascending: false }),
      db.from('memberships').select('*,profiles(full_name,email),membership_plans(name,price,is_founder_plan)').order('created_at', { ascending: false }),
      db.from('membership_plans').select('*').order('sort_order').order('name'),
      db.from('founder_codes').select('*').order('created_at', { ascending: false }),
      db.from('expenses').select('*').order('expense_date', { ascending: false }),
      db.from('site_content').select('*').order('key')
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
  }

  function stat(icon, tone, value, label) {
    return `<div class="z33a-stat"><div class="z33a-icon ${tone}">${icon}</div><div class="z33a-value">${value}</div><div class="z33a-label">${label}</div></div>`;
  }

  function pageShell(title, subtitle = '') {
    return `<div class="z33a-head"><div><div class="z33a-kicker">ZONA 33</div><div class="z33a-h2">${title}</div><div class="z33a-sub">${subtitle}</div></div></div>`;
  }

  function renderRoot() {
    document.body.innerHTML = `<div id="z33-admin"><header class="z33a-top"><button class="z33a-menu" id="z33-open-menu">☰</button><div class="z33a-title" id="z33-title">Dashboard</div><span class="z33a-date">· ${new Date().toLocaleDateString('es-MX',{weekday:'long',day:'numeric',month:'long'})}</span><div class="z33a-actions"><button class="z33a-btn" onclick="location.href='https://zona33.pages.dev/'">Sitio</button><button class="z33a-btn danger" id="z33-logout">Salir</button></div></header><main class="z33a-content" id="z33-content"></main><div id="z33-menu-overlay" class="z33a-menu-overlay"></div><aside id="z33-menu" class="z33a-menu-drawer"><div class="z33a-menu-title">ZONA 33</div><div class="z33a-menu-sub">Panel administrativo</div><div class="z33a-menu-list">${menuItems()}</div></aside><div id="z33-drawer-overlay" class="z33a-drawer-overlay"><aside id="z33-drawer" class="z33a-drawer"></aside></div></div>`;
    injectStyles();
    $('#z33-open-menu').onclick = openMenu;
    $('#z33-menu-overlay').onclick = closeMenu;
    $('#z33-drawer-overlay').onclick = (e) => { if (e.target.id === 'z33-drawer-overlay') closeDrawer(); };
    $('#z33-logout').onclick = async () => { await db.auth.signOut(); location.reload(); };
    bindMenu();
  }

  function menuItems() {
    const items = [['dashboard','Dashboard'],['clients','Clientes'],['agenda','Clases / Horarios'],['coaches','Coaches'],['finance','Finanzas'],['landing','Editar Landing']];
    return items.map(([key,label]) => `<button class="z33a-menu-item ${state.page === key ? 'active' : ''}" data-page="${key}">${label}</button>`).join('');
  }

  function bindMenu() {
    document.querySelectorAll('.z33a-menu-item').forEach((button) => {
      button.onclick = () => { closeMenu(); route(button.dataset.page); };
    });
  }

  function setTitle(title) { $('#z33-title').textContent = title; }

  function dashboard() {
    setTitle('Dashboard');
    const activeMemberships = state.memberships.filter((m) => m.status === 'active' && m.end_date >= today()).length;
    const todayClasses = state.classes.filter((c) => c.class_date === today());
    const pendingPayments = state.payments.filter((p) => p.status === 'pending').reduce((s, p) => s + Number(p.amount || 0), 0);
    const approvedIncome = state.payments.filter((p) => p.status === 'approved' && String(p.payment_date || '').slice(0, 10) >= monthStart()).reduce((s, p) => s + Number(p.amount || 0), 0);
    $('#z33-content').innerHTML = `${pageShell('Dashboard','Resumen de ZONA 33')}<div class="z33a-stats">${stat('↗','red',money(approvedIncome),'Ingresos del mes')}${stat('◷','amber',money(pendingPayments),'Pagos pendientes')}${stat('♧','green',activeMemberships,'Membresías activas')}${stat('□','gray',todayClasses.length,'Clases de hoy')}</div><div class="z33a-grid2" style="margin-top:16px"><div class="z33a-card"><div class="z33a-kicker">Hoy</div><h3>Próximas clases</h3><div class="z33a-list">${todayClasses.slice(0,8).map((c) => `<div class="z33a-item" onclick="window.z33OpenClass('${c.id}')" style="cursor:pointer"><div><b>${timeText(c.start_time)} · ${esc(c.class_type)}</b><div class="z33a-muted">${esc(c.coach?.name || 'Sin coach')} · ${c.capacity || 10} lugares</div></div><span class="z33a-pill ${Number(c.capacity || 10) <= state.reservations.filter(r => r.class_id === c.id && r.status === 'reserved').length ? 'bad' : 'ok'}">${state.reservations.filter(r => r.class_id === c.id && r.status === 'reserved').length}/${c.capacity || 10}</span></div>`).join('') || '<div class="z33a-empty">No hay clases hoy.</div>'}</div></div><div class="z33a-card"><div class="z33a-kicker">Acciones rápidas</div><h3>Administración</h3><div class="z33a-big-actions"><button class="z33a-action-card" onclick="route('clients')"><b>Clientes</b><span>Consultar perfiles y membresías</span></button><button class="z33a-action-card" onclick="route('agenda')"><b>Clases / Horarios</b><span>Ver semana y administrar clases</span></button><button class="z33a-action-card" onclick="route('coaches')"><b>Coaches</b><span>Editar, activar o desactivar</span></button><button class="z33a-action-card" onclick="route('finance')"><b>Finanzas</b><span>Pagos, planes y fundadores</span></button></div></div></div>`;
  }

  function clients() {
    setTitle('Clientes');
    $('#z33-content').innerHTML = `${pageShell('Clientes','Perfiles, membresías, reservas y pagos.')}<div class="z33a-card"><div class="z33a-toolbar"><input class="z33a-search" id="clientSearch" placeholder="Buscar cliente por nombre o correo"></div><div class="z33a-table"><table><thead><tr><th>Cliente</th><th>Teléfono</th><th>Nacimiento</th><th>Membresía</th><th>Estado</th><th></th></tr></thead><tbody id="clientRows"></tbody></table></div></div>`;
    const draw = () => { const q = ($('#clientSearch').value || '').toLowerCase(); const rows = state.clients.filter(c => `${c.full_name || ''} ${c.email || ''}`.toLowerCase().includes(q)); $('#clientRows').innerHTML = rows.length ? rows.map(c => { const m = state.memberships.find(x => x.profile_id === c.id && x.status === 'active'); return `<tr><td><b>${esc(c.full_name || '')}</b><div class="z33a-muted">${esc(c.email || '')}</div></td><td>${esc(c.phone || '—')}</td><td>${dateText(c.birth_date)}</td><td>${esc(m?.membership_plans?.name || 'Sin membresía')}</td><td><span class="z33a-pill ${m ? 'ok' : 'warn'}">${m ? 'Activa' : 'Sin vigencia'}</span></td><td><button class="z33a-btn" onclick="window.z33OpenClient('${c.id}')">Ver</button></td></tr>`; }).join('') : '<tr><td colspan="6" class="z33a-empty">Sin clientes.</td></tr>'; };
    $('#clientSearch').oninput = draw; draw();
  }

  function agenda() {
    setTitle('Clases / Horarios');
    const base = new Date(today() + 'T12:00:00'); base.setDate(base.getDate() - base.getDay() + 1);
    const days = Array.from({length:7}, (_, i) => { const d = new Date(base); d.setDate(base.getDate() + i); return d.toISOString().slice(0,10); });
    const startHour = 6; const endHour = 21; const hourPx = 48;
    const headers = ['LUN','MAR','MIÉ','JUE','VIE','SÁB','DOM'];
    $('#z33-content').innerHTML = `${pageShell('Clases / Horarios','Semana completa · máximo 10 personas por clase.')}<div class="z33a-toolbar"><div class="z33a-actions-row"><button class="z33a-btn" onclick="window.z33AgendaShift(-7)">← Semana</button><button class="z33a-btn" onclick="window.z33AgendaToday()">Hoy</button><button class="z33a-btn" onclick="window.z33AgendaShift(7)">Semana →</button></div><button class="z33a-btn red" onclick="window.z33NewClass()">+ Clase</button></div><div class="z33a-calendar"><div class="z33a-cal-inner"><div class="z33a-week-head"><div></div>${days.map((d,i)=>`<div><small>${headers[i]}</small><b>${new Date(d+'T12:00:00').getDate()}</b></div>`).join('')}</div><div class="z33a-week-body"><div class="z33a-time-col">${Array.from({length:endHour-startHour+1},(_,i)=>`<span class="z33a-time" style="top:${i*hourPx}px">${String(startHour+i).padStart(2,'0')}:00</span>`).join('')}</div><div class="z33a-day-cols">${days.map(d=>`<div class="z33a-day-col">${Array.from({length:endHour-startHour+1},(_,i)=>`<div class="z33a-hour" style="top:${i*hourPx}px"></div>`).join('')}${state.classes.filter(c=>c.class_date===d).map(c=>{const top=(Number(String(c.start_time||'0:00').slice(0,2))*60+Number(String(c.start_time||'0:00').slice(3,5)) - startHour*60)/60*hourPx; const h=(Number(c.duration_minutes||60)/60)*hourPx; const booked=state.reservations.filter(r=>r.class_id===c.id&&r.status==='reserved').length; return `<div class="z33a-class ${booked>=(c.capacity||10)?'full':''}" style="top:${top}px;height:${Math.max(28,h)}px" onclick="window.z33OpenClass('${c.id}')"><strong>${timeText(c.start_time)} · ${esc(c.class_type)}</strong><small>${esc(c.coach?.name||'Sin coach')} · ${booked}/${c.capacity||10}</small></div>`;}).join('')}</div>`).join('')}</div></div></div>`;
    window.z33AgendaShift = (delta) => { const d = new Date(state.weekAnchor || today() + 'T12:00:00'); d.setDate(d.getDate()+delta); state.weekAnchor = d.toISOString().slice(0,10); agenda(); };
    window.z33AgendaToday = () => { state.weekAnchor = today(); agenda(); };
  }

  function coaches() {
    setTitle('Coaches');
    $('#z33-content').innerHTML = `${pageShell('Coaches','Editar, activar o desactivar coaches.')}<div class="z33a-toolbar"><span class="z33a-sub">Los coaches desactivados conservan su historial.</span><button class="z33a-btn red" onclick="window.z33CoachForm()">+ Coach</button></div><div class="z33a-grid3">${state.coaches.map(c => `<div class="z33a-card"><div style="display:flex;align-items:center;gap:12px"><img src="${esc(c.photo_url || 'https://via.placeholder.com/56')}" alt="" style="width:56px;height:56px;border-radius:12px;object-fit:cover"><div><b style="font-size:15px">${esc(c.name || '')}</b><div class="z33a-muted">${esc(c.specialty || 'Coach ZONA 33')}</div></div></div><p class="z33a-muted" style="min-height:36px">${esc(c.bio || '')}</p><div class="z33a-actions-row"><button class="z33a-btn" onclick="window.z33CoachForm('${c.id}')">Editar</button><button class="z33a-btn" onclick="window.z33ToggleCoach('${c.id}',${c.is_active===false})">${c.is_active===false?'Activar':'Desactivar'}</button></div></div>`).join('') || '<div class="z33a-empty">Sin coaches.</div>'}</div>`;
  }

  function finance() {
    setTitle('Finanzas');
    const approved = state.payments.filter(p => p.status === 'approved' && String(p.payment_date || p.created_at || '').slice(0,10) >= monthStart() && String(p.payment_date || p.created_at || '').slice(0,10) <= today());
    const pending = state.payments.filter(p => p.status === 'pending').reduce((s,p)=>s+Number(p.amount||0),0);
    const income = approved.reduce((s,p)=>s+Number(p.amount||0),0);
    const active = state.memberships.filter(m=>m.status==='active'&&m.end_date>=today()).length;
    const expiring = state.memberships.filter(m=>m.status==='active'&&m.end_date>=today()&&m.end_date<=addDays(today(),7)).length;
    const newClients = state.clients.filter(c=>String(c.created_at||'').slice(0,10)>=monthStart()).length;
    const byDay = {}; approved.forEach(p => { const d=String(p.payment_date||p.created_at||'').slice(0,10); byDay[d]=(byDay[d]||0)+Number(p.amount||0); });
    const days = Object.entries(byDay).sort((a,b)=>a[0].localeCompare(b[0])); const max=Math.max(1,...days.map(x=>x[1]));
    $('#z33-content').innerHTML = `${pageShell('Finanzas','Pagos, membresías, planes, fundadores y reportes.')}<div class="z33a-stats">${stat('↗','red',money(income),'Ingresos del periodo')}${stat('◷','amber',money(pending),'Pagos pendientes')}${stat('♧','green',active,'Membresías activas')}${stat('▣','amber',expiring,'Por vencer')}${stat('＋','gray',newClients,'Nuevos clientes')}</div><div class="z33a-chart"><div class="z33a-chart-title">Ingresos por día</div><div class="z33a-bars">${days.length ? days.map(([d,v])=>`<div class="z33a-bar"><span>${esc(d)}</span><div class="z33a-track"><div class="z33a-fill" style="width:${Math.max(4,v/max*100)}%"></div></div><span class="z33a-amount">${money(v)}</span></div>`).join('') : '<div class="z33a-empty">No hay ingresos registrados en este periodo.</div>'}</div></div><div class="z33a-tabs">${[['payments','Pagos'],['memberships','Membresías'],['plans','Planes'],['founders','Códigos fundadores'],['reports','Reportes']].map(([key,label])=>`<button class="z33a-tab ${state.financeTab===key?'active':''}" data-finance="${key}">${label}</button>`).join('')}</div><div id="z33a-finance-body"></div>`;
    document.querySelectorAll('[data-finance]').forEach(b=>b.onclick=()=>{state.financeTab=b.dataset.finance;financeTab();});
    financeTab();
  }

  function financeTab() {
    const body = $('#z33a-finance-body'); if(!body)return;
    if(state.financeTab==='payments'){
      body.innerHTML=`<div class="z33a-card"><div class="z33a-toolbar"><div class="z33a-filter-row"><button class="z33a-filter active" data-payfilter="all">Todos</button><button class="z33a-filter" data-payfilter="approved">Pagados</button><button class="z33a-filter" data-payfilter="pending">Pendientes</button><button class="z33a-filter" data-payfilter="overdue">Vencidos</button></div><button class="z33a-btn red" onclick="window.z33PaymentForm()">Registrar pago</button></div><div class="z33a-toolbar"><input class="z33a-search" id="z33-pay-search" placeholder="Buscar cliente o concepto"></div><div class="z33a-table"><table><thead><tr><th>Cliente</th><th>Concepto</th><th>Monto</th><th>Fecha</th><th>Método</th><th>Estado</th><th></th></tr></thead><tbody id="z33-pay-body"></tbody></table></div></div>`;
      const draw=(status='all')=>{const q=($('#z33-pay-search')?.value||'').toLowerCase();let rows=state.payments.filter(p=>`${p.profiles?.full_name||''} ${p.profiles?.email||''} ${p.concept||''}`.toLowerCase().includes(q));if(status==='overdue')rows=rows.filter(p=>p.status==='pending'&&String(p.payment_date||'')<today());else if(status!=='all')rows=rows.filter(p=>p.status===status);$('#z33-pay-body').innerHTML=rows.length?rows.map(p=>`<tr><td><b>${esc(p.profiles?.full_name||'Cliente')}</b><div class="z33a-muted">${esc(p.profiles?.email||'')}</div></td><td>${esc(p.concept||p.membership_plans?.name||'Membresía')}</td><td><b>${money(p.amount)}</b></td><td>${dateText(p.payment_date)}</td><td>${esc(p.method||'—')}</td><td><span class="z33a-pill ${p.status==='approved'?'ok':p.status==='pending'?'warn':'bad'}">${p.status==='approved'?'Pagado':p.status==='pending'?'Pendiente':'Rechazado'}</span></td><td><button class="z33a-btn" onclick="window.z33PaymentForm('${p.id}')">Ver</button></td></tr>`).join(''):'<tr><td colspan="7" class="z33a-empty">Sin pagos.</td></tr>'}; $('#z33-pay-search').oninput=()=>draw('all'); document.querySelectorAll('[data-payfilter]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-payfilter]').forEach(x=>x.classList.remove('active'));b.classList.add('active');draw(b.dataset.payfilter)});draw('all');
    } else if(state.financeTab==='memberships') {
      body.innerHTML=`<div class="z33a-table"><table><thead><tr><th>Cliente</th><th>Plan</th><th>Inicio</th><th>Vence</th><th>Estado</th></tr></thead><tbody>${state.memberships.map(m=>`<tr><td>${esc(m.profiles?.full_name||'')}</td><td>${esc(m.membership_plans?.name||'')}</td><td>${dateText(m.start_date)}</td><td>${dateText(m.end_date)}</td><td>${esc(m.status)}</td></tr>`).join('')||'<tr><td colspan="5" class="z33a-empty">Sin membresías.</td></tr>'}</tbody></table></div>`;
    } else if(state.financeTab==='plans') {
      body.innerHTML=`<div class="z33a-grid3">${state.plans.map(p=>`<div class="z33a-card"><div class="z33a-kicker">${p.is_founder_plan?'Fundadores':'Plan'}</div><h3>${esc(p.name)}</h3><div class="z33a-value" style="margin-top:6px">${money(p.is_founder_plan?500:p.price)}</div><div class="z33a-muted">${p.duration_days||30} días · ${p.is_active===false?'Inactivo':'Activo'}</div></div>`).join('')}</div>`;
    } else if(state.financeTab==='founders') {
      body.innerHTML=`<div class="z33a-card"><div class="z33a-toolbar"><span class="z33a-sub">El Plan Fundadores permanece fijo en $500.</span><button class="z33a-btn red" onclick="window.z33FounderForm()">+ Código</button></div><div class="z33a-table"><table><thead><tr><th>Código</th><th>Estado</th><th>Creado</th><th>Uso</th><th></th></tr></thead><tbody>${state.founders.map(f=>`<tr><td><b>${esc(f.code)}</b></td><td><span class="z33a-pill ${f.is_active===false?'bad':f.used_by?'warn':'ok'}">${f.is_active===false?'Inactivo':f.used_by?'Usado':'Activo'}</span></td><td>${dateText(String(f.created_at||'').slice(0,10))}</td><td>${f.used_at?dateText(String(f.used_at).slice(0,10)):'—'}</td><td><button class="z33a-btn" onclick="window.z33FounderToggle('${f.id}',${f.is_active!==false})">${f.is_active===false?'Activar':'Desactivar'}</button></td></tr>`).join('')||'<tr><td colspan="5" class="z33a-empty">Sin códigos.</td></tr>'}</tbody></table></div></div>`;
    } else {
      const inc=state.payments.filter(p=>p.status==='approved').reduce((s,p)=>s+Number(p.amount||0),0); const out=state.expenses.reduce((s,e)=>s+Number(e.amount||0),0);
      body.innerHTML=`<div class="z33a-stats">${stat('↗','red',money(inc),'Ingresos')}${stat('↘','amber',money(out),'Egresos')}${stat('=','gray',money(inc-out),'Balance')}${stat('♧','green',state.founders.filter(f=>f.is_active!==false).length,'Fundadores activos')}</div><div class="z33a-card" style="margin-top:16px"><h3>Últimos egresos</h3><div class="z33a-list">${state.expenses.slice(0,8).map(e=>`<div class="z33a-item"><div><b>${esc(e.concept)}</b><div class="z33a-muted">${dateText(e.expense_date)} · ${esc(e.category||'General')}</div></div><b>${money(e.amount)}</b></div>`).join('')||'<div class="z33a-empty">Sin egresos registrados.</div>'}</div></div>`;
    }
  }

  function landing() {
    setTitle('Editar Landing');
    const keys=['hero_title','hero_subtitle','contact_phone','contact_instagram','site_cta'];
    $('#z33-content').innerHTML=`${pageShell('Editar Landing','Contenido del sitio público. WOD, Leaderboard, Instagram y Comunidad viven aquí.')}<form id="z33-site-form" class="z33a-card z33a-form">${keys.map(k=>`<label>${k.replaceAll('_',' ')}<input id="site-${k}" value="${esc(state.site[k]||'')}"></label>`).join('')}<div class="z33a-actions-row"><button class="z33a-btn red">Guardar cambios</button><a class="z33a-btn" href="https://zona33.pages.dev/" target="_blank">Ver sitio</a></div></form>`;
    $('#z33-site-form').onsubmit=async(e)=>{e.preventDefault();for(const k of keys){await db.from('site_content').upsert({key:k,value:$(`#site-${k}`).value,updated_at:new Date().toISOString()},{onConflict:'key'});}await loadData();alert('Landing actualizada.');};
  }

  function openClient(id){const c=state.clients.find(x=>x.id===id);if(!c)return;const m=state.memberships.find(x=>x.profile_id===id&&x.status==='active');const rs=state.reservations.filter(x=>x.profile_id===id).slice(0,6);const ps=state.payments.filter(x=>x.profile_id===id).slice(0,6);openDrawer('Cliente',`<div class="z33a-list"><div class="z33a-card"><b>${esc(c.full_name||'')}</b><div class="z33a-muted">${esc(c.email||'')}<br>${esc(c.phone||'')}</div><div class="z33a-muted">Nacimiento: ${dateText(c.birth_date)}</div></div><div class="z33a-card"><b>Membresía</b><div class="z33a-muted">${m?`${esc(m.membership_plans?.name||'Plan')} · ${dateText(m.start_date)} → ${dateText(m.end_date)}`:'Sin membresía activa'}</div></div><div class="z33a-card"><b>Reservas</b><div class="z33a-list">${rs.map(r=>`<div class="z33a-item"><span>${dateText(state.classes.find(x=>x.id===r.class_id)?.class_date)} · ${esc(r.status)}</span></div>`).join('')||'<div class="z33a-empty">Sin reservas.</div>'}</div></div><div class="z33a-card"><b>Pagos</b><div class="z33a-list">${ps.map(p=>`<div class="z33a-item"><span>${esc(p.concept||'Pago')}<div class="z33a-muted">${dateText(p.payment_date)}</div></span><b>${money(p.amount)}</b></div>`).join('')||'<div class="z33a-empty">Sin pagos.</div>'}</div></div></div>`)}
  function openClass(id){const c=state.classes.find(x=>x.id===id);if(!c)return;const rs=state.reservations.filter(r=>r.class_id===id);const active=rs.filter(r=>r.status==='reserved').length;openDrawer(esc(c.class_type||'Functional'),`<div class="z33a-card"><div class="z33a-row"><div><div class="z33a-muted">Fecha</div><b>${dateText(c.class_date)}</b></div><div><div class="z33a-muted">Hora</div><b>${timeText(c.start_time)} – ${timeText(c.end_time)}</b></div><div><div class="z33a-muted">Capacidad</div><b>${Math.min(10,Number(c.capacity||10))}</b></div><div><div class="z33a-muted">Ocupados</div><b>${active}</b></div></div></div><div class="z33a-card" style="margin-top:10px"><b>Coach</b><div class="z33a-muted">${esc(c.coach?.name||'Sin asignar')}</div></div><div class="z33a-card" style="margin-top:10px"><b>Reservas</b><div class="z33a-list" style="margin-top:8px">${rs.map(r=>`<div class="z33a-item"><div><b>${esc(r.profiles?.full_name||'Cliente')}</b><div class="z33a-muted">${esc(r.profiles?.phone||'')} · ${esc(r.profiles?.email||'')}</div></div><span class="z33a-pill ${r.status==='reserved'?'ok':'warn'}">${esc(r.status)}</span></div>`).join('')||'<div class="z33a-empty">Sin reservas.</div>'}</div></div><div class="z33a-actions-row" style="margin-top:12px"><button class="z33a-btn" onclick="window.z33EditClass('${id}')">Editar</button><button class="z33a-btn danger" onclick="window.z33CancelClass('${id}')">Cancelar clase</button></div>`);}

  function classForm(id){const c=id?state.classes.find(x=>x.id===id):{class_type:'Functional',class_date:today(),start_time:'08:00',duration_minutes:60,capacity:10,coach_id:''};openDrawer(id?'Editar clase':'Nueva clase',`<form id="z33-class-form" class="z33a-form"><div class="z33a-row"><label>Tipo<select id="cf-type">${['Functional','Strength','Mobility','Conditioning','Open Box','Personal'].map(v=>`<option value="${v}">${v}</option>`).join('')}</select></label><label>Fecha<input id="cf-date" type="date"></label></div><div class="z33a-row"><label>Hora<input id="cf-time" type="time"></label><label>Duración<select id="cf-duration">${[30,45,60,75,90].map(v=>`<option value="${v}">${v} min</option>`).join('')}</select></label></div><div class="z33a-row"><label>Coach<select id="cf-coach"><option value="">Sin asignar</option>${state.coaches.filter(x=>x.is_active).map(x=>`<option value="${x.id}">${esc(x.name)}</option>`).join('')}</select></label><label>Capacidad<input id="cf-cap" type="number" min="1" max="10"></label></div><div class="z33a-muted">Máximo 10 personas.</div><div class="z33a-actions-row"><button type="button" class="z33a-btn" onclick="window.z33CloseDrawer()">Cancelar</button><button class="z33a-btn red">Guardar</button></div></form>`);$('#cf-type').value=c.class_type||'Functional';$('#cf-date').value=c.class_date||today();$('#cf-time').value=timeText(c.start_time||'08:00');$('#cf-duration').value=String(c.duration_minutes||60);$('#cf-coach').value=c.coach_id||'';$('#cf-cap').value=String(Math.min(10,Number(c.capacity||10)));$('#z33-class-form').onsubmit=async(e)=>{e.preventDefault();const start=$('#cf-time').value;const dur=Number($('#cf-duration').value);const min=Number(start.slice(0,2))*60+Number(start.slice(3,5))+dur;const payload={class_type:$('#cf-type').value,class_date:$('#cf-date').value,start_time:start,end_time:String(Math.floor(min/60)).padStart(2,'0')+':'+String(min%60).padStart(2,'0'),duration_minutes:dur,coach_id:$('#cf-coach').value||null,capacity:Math.min(10,Math.max(1,Number($('#cf-cap').value||10))),status:'scheduled'};const result=id?await db.from('classes').update(payload).eq('id',id):await db.from('classes').insert(payload);if(result.error)return alert(result.error.message);closeDrawer();await loadData();agenda();};}

  function coachForm(id){const c=id?state.coaches.find(x=>x.id===id):{};openDrawer(id?'Editar coach':'Nuevo coach',`<form id="z33-coach-form" class="z33a-form"><label>Nombre<input id="co-name" required></label><label>Especialidad<input id="co-specialty"></label><label>Foto URL<input id="co-photo"></label><label>Bio<textarea id="co-bio"></textarea></label><div class="z33a-actions-row"><button type="button" class="z33a-btn" onclick="window.z33CloseDrawer()">Cancelar</button><button class="z33a-btn red">Guardar</button></div></form>`);$('#co-name').value=c.name||'';$('#co-specialty').value=c.specialty||'';$('#co-photo').value=c.photo_url||'';$('#co-bio').value=c.bio||'';$('#z33-coach-form').onsubmit=async(e)=>{e.preventDefault();const payload={name:$('#co-name').value.trim(),specialty:$('#co-specialty').value.trim()||null,photo_url:$('#co-photo').value.trim()||null,bio:$('#co-bio').value.trim()||null,is_active:true,updated_at:new Date().toISOString()};const result=id?await db.from('coaches').update(payload).eq('id',id):await db.from('coaches').insert(payload);if(result.error)return alert(result.error.message);closeDrawer();await loadData();coaches();};}

  function paymentForm(id){const p=id?state.payments.find(x=>x.id===id):null;openDrawer(p?'Editar pago':'Registrar pago',`<form id="z33-payment-form" class="z33a-form"><div class="z33a-row"><label>Cliente<select id="pf-client">${state.clients.map(c=>`<option value="${c.id}">${esc(c.full_name)} — ${esc(c.email||'')}</option>`).join('')}</select></label><label>Concepto<input id="pf-concept"></label></div><div class="z33a-row"><label>Monto<input id="pf-amount" type="number" min="0"></label><label>Fecha<input id="pf-date" type="date"></label></div><div class="z33a-row"><label>Método<select id="pf-method"><option>transferencia</option><option>ficha</option><option>online</option><option>efectivo</option><option>tarjeta</option></select></label><label>Estado<select id="pf-status"><option value="approved">Pagado</option><option value="pending">Pendiente</option><option value="rejected">Rechazado</option></select></label></div><label>Notas<textarea id="pf-notes"></textarea></label><div class="z33a-muted">Plan Fundadores: $500 mensuales.</div><div class="z33a-actions-row"><button type="button" class="z33a-btn" onclick="window.z33CloseDrawer()">Cancelar</button><button class="z33a-btn red">Guardar</button>${p?`<button type="button" class="z33a-btn danger" onclick="window.z33DeletePayment('${p.id}')">Eliminar</button>`:''}</div></form>`);$('#pf-client').value=p?.profile_id||state.clients[0]?.id||'';$('#pf-concept').value=p?.concept||'Mensualidad';$('#pf-amount').value=String(p?.amount??500);$('#pf-date').value=p?.payment_date||today();$('#pf-method').value=p?.method||'transferencia';$('#pf-status').value=p?.status||'approved';$('#pf-notes').value=p?.notes||'';$('#z33-payment-form').onsubmit=async(e)=>{e.preventDefault();const payload={profile_id:$('#pf-client').value,concept:$('#pf-concept').value.trim(),amount:Number($('#pf-amount').value||0),payment_date:$('#pf-date').value,method:$('#pf-method').value,status:$('#pf-status').value,notes:$('#pf-notes').value.trim()||null};const result=id?await db.from('payments').update(payload).eq('id',id):await db.from('payments').insert(payload);if(result.error)return alert(result.error.message);closeDrawer();await loadData();finance();};}

  async function bootstrap(){
    injectStyles();
    const {data:{user}} = await db.auth.getUser();
    if(!user) return;
    const {data:profile} = await db.from('profiles').select('*').eq('id',user.id).single();
    if(!profile || profile.role !== 'admin') return;
    state.user=user; state.profile=profile;
    await loadData();
    renderRoot();
    route('dashboard');
  }

  async function route(page){
    state.page=page;
    const title={dashboard:'Dashboard',clients:'Clientes',agenda:'Clases / Horarios',coaches:'Coaches',finance:'Finanzas',landing:'Editar Landing'}[page]||'Dashboard';
    setTitle(title);
    if(page==='dashboard') dashboard();
    else if(page==='clients') clients();
    else if(page==='agenda') agenda();
    else if(page==='coaches') coaches();
    else if(page==='finance') finance();
    else landing();
    const items=menuItems();
    const menu=$('#z33-menu'); if(menu){menu.querySelector('.z33a-menu-list').innerHTML=items;bindMenu();}
  }

  window.route = route;
  window.z33OpenClient = openClient;
  window.z33OpenClass = openClass;
  window.z33NewClass = () => classForm();
  window.z33EditClass = (id) => classForm(id);
  window.z33CancelClass = async (id) => { if(!confirm('¿Cancelar esta clase?')) return; const r=await db.from('classes').update({status:'cancelled'}).eq('id',id); if(r.error) return alert(r.error.message); closeDrawer(); await loadData(); agenda(); };
  window.z33CoachForm = coachForm;
  window.z33ToggleCoach = async (id, active) => { const r=await db.from('coaches').update({is_active:active,updated_at:new Date().toISOString()}).eq('id',id); if(r.error) return alert(r.error.message); await loadData(); coaches(); };
  window.z33PaymentForm = paymentForm;
  window.z33DeletePayment = async (id) => { if(!confirm('¿Eliminar este pago?')) return; const r=await db.from('payments').delete().eq('id',id); if(r.error) return alert(r.error.message); closeDrawer(); await loadData(); finance(); };
  window.z33FounderForm = async () => { const code=prompt('Nuevo código fundador'); if(!code) return; const r=await db.from('founder_codes').insert({code:code.trim().toUpperCase(),is_active:true}); if(r.error)return alert(r.error.message); await loadData(); finance(); };
  window.z33FounderToggle = async (id, active) => { const r=await db.from('founder_codes').update({is_active:!active}).eq('id',id); if(r.error)return alert(r.error.message); await loadData(); finance(); };

  bootstrap();
})();
