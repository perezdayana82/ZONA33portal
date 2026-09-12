// ZONA 33 · Modern operations layer inspired by Base44 reference UX
(function(){
  'use strict';
  if(typeof window.sb==='undefined') return;

  const q=(s)=>document.querySelector(s);
  const esc0=(v)=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const fmtMoney=(v)=>'$'+Number(v||0).toLocaleString('es-MX',{minimumFractionDigits:0,maximumFractionDigits:0});
  const fmtDate=(v,opts={day:'numeric',month:'short'})=>v?new Date(String(v).slice(0,10)+'T12:00:00').toLocaleDateString('es-MX',opts):'—';
  const isoToday=()=>new Date().toISOString().slice(0,10);
  const weekDates=(ref)=>{const d=new Date(String(ref)+'T12:00:00');const day=d.getDay();d.setDate(d.getDate()+(day===0?-6:1-day));return Array.from({length:7},(_,i)=>{const x=new Date(d);x.setDate(d.getDate()+i);return x.toISOString().slice(0,10)});};
  const timeMins=(v)=>{const [h,m]=String(v||'00:00').slice(0,5).split(':').map(Number);return h*60+(m||0)};
  const timeText=(v)=>String(v||'').slice(0,5);

  const style=document.createElement('style');
  style.id='z33-modern-ops';
  style.textContent=`
    :root{--ops-bg:#f5f6f7;--ops-panel:#fff;--ops-line:#e6e8eb;--ops-text:#17191c;--ops-muted:#737a84;--ops-brand:#e0433a;--ops-soft:#fff1ef;--ops-green:#16845b;--ops-yellow:#9a6c00;--ops-red:#b42318}
    body{background:var(--ops-bg)!important;color:var(--ops-text)!important}
    .shell{grid-template-columns:220px 1fr!important}
    .side{width:220px!important;background:#fff!important;border-right:1px solid var(--ops-line)!important;padding:14px 10px!important}
    .side .brand{margin:4px 8px 16px!important;padding:8px 6px!important}.side .brand img{width:34px!important;height:34px!important}.side .brand strong{font-size:24px!important;color:#111!important}
    .role{color:var(--ops-muted)!important;margin:0 10px 10px!important;font-size:9px!important}
    .nav{gap:3px!important}.nav button{color:#5b616b!important;font-size:11px!important;letter-spacing:.02em!important;text-transform:none!important;padding:10px 11px!important;border-radius:9px!important;min-height:40px!important}.nav button:hover{background:#f2f3f5!important}.nav button.active{background:#fff1ef!important;color:#b52e27!important;box-shadow:inset 3px 0 0 var(--ops-brand)!important}
    .sidefoot{color:#9aa0a8!important;font-size:9px!important}
    .main{background:var(--ops-bg)!important}.top{height:68px!important;background:rgba(245,246,247,.95)!important;border-bottom:1px solid var(--ops-line)!important;padding:0 22px!important}.top h1{font-size:30px!important;color:#14171a!important}.ey{color:#b52e27!important;font-size:9px!important}.top-actions .pill{background:#ecfdf3!important;color:#137a54!important;border-color:#ccefe0!important}.top .btn{min-height:38px!important;font-size:10px!important;background:#fff!important;color:#363b42!important;border-color:#dfe2e6!important}.top .btn.danger{background:#fff!important;color:#b42318!important}
    .content{padding:22px!important;max-width:1480px!important}.hero{background:transparent!important;border:0!important;padding:0!important;margin:0 0 16px!important}.hero h2{font:700 34px/1.05 Inter,Arial,sans-serif!important;text-transform:none!important;margin:4px 0!important;color:#16191d!important}.hero h2 span{color:#16191d!important}.hero .muted{color:#737a84!important;font-size:13px!important}
    .card{background:#fff!important;border:1px solid var(--ops-line)!important;border-radius:14px!important;box-shadow:0 4px 16px rgba(18,24,32,.04)!important;padding:16px!important}.card h2,.card h3{font:650 20px/1.15 Inter,Arial,sans-serif!important;text-transform:none!important;color:#17191c!important}.muted{color:var(--ops-muted)!important;font-size:13px!important}.btn{min-height:40px!important;border-radius:9px!important;padding:9px 13px!important;font-size:11px!important;letter-spacing:0!important;text-transform:none!important}.btn.red{background:var(--ops-brand)!important;border-color:var(--ops-brand)!important;color:#fff!important}.btn.out{background:#fff!important;color:#333!important;border-color:#dde0e4!important}.btn.danger{background:#fff5f4!important;color:#b42318!important;border-color:#f2cfcb!important}.item{background:#fff!important;border:1px solid var(--ops-line)!important;border-radius:10px!important}.pill{font-size:10px!important}.table-wrap{border-color:var(--ops-line)!important;background:#fff!important}.tbl{min-width:720px!important}.tbl th,.tbl td{font-size:12px!important;padding:11px 12px!important;border-color:#eef0f2!important}.tbl th{background:#fafbfc!important;color:#767d87!important;font-size:10px!important}

    .z21-toolbar{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px}.z21-search{position:relative;flex:1;max-width:390px}.z21-search input{width:100%;height:40px;padding:0 12px 0 36px;border:1px solid #dde0e4;border-radius:9px;background:#fff;font-size:13px}.z21-search span{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#9aa0a8}.z21-tabs{display:flex;gap:4px;overflow:auto;margin-bottom:12px}.z21-tab{border:0;background:transparent;color:#737a84;padding:7px 11px;border-radius:999px;font-size:12px;white-space:nowrap}.z21-tab.active{background:#17191c;color:#fff}.z21-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.z21-stat{display:flex;flex-direction:column;gap:4px}.z21-stat small{text-transform:uppercase;letter-spacing:.05em;color:#8a919a;font-size:9px;font-weight:800}.z21-stat strong{font-size:26px;line-height:1.05}.z21-note{padding:10px 12px;border-radius:9px;background:#fafbfc;border:1px solid #eef0f2;color:#616872;font-size:11px}

    .z21-agenda-wrap{border:1px solid var(--ops-line);border-radius:14px;background:#fff;overflow:auto}.z21-agenda{min-width:990px}.z21-dayhead{display:grid;grid-template-columns:56px repeat(7,1fr);background:#fafbfc;border-bottom:1px solid var(--ops-line)}.z21-dayhead>div{padding:10px 6px;text-align:center;border-left:1px solid #eef0f2}.z21-dayhead .z21-timehead{border-left:0}.z21-dayname{font-size:10px;color:#838a94;text-transform:uppercase;font-weight:800}.z21-daynum{font-weight:700;font-size:15px;margin-top:3px}.z21-daynum.today{color:var(--ops-brand)}.z21-gridbody{display:grid;grid-template-columns:56px 1fr}.z21-timecol{height:840px;position:relative}.z21-time{position:absolute;right:9px;transform:translateY(-7px);font-size:10px;color:#8b929a}.z21-days{display:grid;grid-template-columns:repeat(7,1fr)}.z21-daycol{position:relative;height:840px;border-left:1px solid #eef0f2;background:#fff}.z21-daycol.today{background:#fffdfd}.z21-hourline{position:absolute;left:0;right:0;border-top:1px solid #f0f1f3}.z21-class{position:absolute;left:5px;right:5px;border-radius:9px;border:1px solid #dfe2e6;border-left:3px solid #4d5560;background:#f8f9fa;padding:7px 8px;text-align:left;overflow:hidden;cursor:pointer;transition:.15s}.z21-class:hover{transform:translateY(-1px);box-shadow:0 8px 18px rgba(20,25,32,.08);z-index:10}.z21-class.full{border-left-color:var(--ops-brand);background:var(--ops-soft)}.z21-class-time{display:flex;justify-content:space-between;gap:5px;font-size:10px;font-weight:700}.z21-class-name{font-size:11px;font-weight:800;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.z21-class-coach{font-size:9px;color:#7a818a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.z21-empty{padding:40px;text-align:center;color:#9299a1;font-size:12px}.z21-topactions{display:flex;gap:7px;align-items:center;flex-wrap:wrap}.z21-iconbtn{height:40px;width:40px;border-radius:9px;border:1px solid #dde0e4;background:#fff;display:grid;place-items:center;color:#363b42}.z21-range{font-size:13px;font-weight:650;min-width:170px;text-align:center}

    .z21-overlay{position:fixed;inset:0;background:rgba(18,23,30,.28);z-index:200;display:none;justify-content:flex-end}.z21-overlay.show{display:flex}.z21-drawer{width:min(460px,94vw);height:100%;background:#fff;border-left:1px solid #e3e5e8;box-shadow:-20px 0 50px rgba(18,24,32,.14);display:flex;flex-direction:column}.z21-dhead{padding:18px;border-bottom:1px solid #eef0f2;display:flex;justify-content:space-between;gap:12px}.z21-dbody{padding:18px;overflow:auto;flex:1}.z21-dfoot{padding:14px 18px;border-top:1px solid #eef0f2;display:flex;gap:8px}.z21-dtitle{font-size:20px;font-weight:700}.z21-dsub{font-size:12px;color:#7b838d;margin-top:3px}.z21-close{border:0;background:#f5f6f7;border-radius:8px;width:34px;height:34px}.z21-fields{display:grid;grid-template-columns:1fr 1fr;gap:12px}.z21-field{display:grid;gap:5px}.z21-field.full{grid-column:1/-1}.z21-field label{font-size:10px;font-weight:800;color:#7a818a;text-transform:uppercase;letter-spacing:.04em}.z21-field input,.z21-field select,.z21-field textarea{width:100%;border:1px solid #dde0e4;border-radius:8px;padding:9px 10px;background:#fff;font:inherit;font-size:13px}.z21-field textarea{min-height:84px;resize:vertical}.z21-section{padding-top:18px;margin-top:18px;border-top:1px solid #eef0f2}.z21-list{display:grid;gap:7px}.z21-row{display:flex;justify-content:space-between;gap:10px;align-items:flex-start;padding:10px;border:1px solid #eef0f2;border-radius:9px;background:#fafbfc}.z21-row strong{font-size:13px}.z21-row small{display:block;color:#7a818a;font-size:10px;margin-top:2px}.z21-mini{font-size:11px;color:#606872}
    .z21-coachrow{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px;border:1px solid #eef0f2;border-radius:10px;background:#fafbfc}.z21-coachinfo{display:flex;align-items:center;gap:10px}.z21-avatar{width:34px;height:34px;border-radius:50%;background:#17191c;color:#fff;display:grid;place-items:center;font-size:11px;font-weight:800;overflow:hidden}.z21-avatar img{width:100%;height:100%;object-fit:cover}.z21-mobile-list{display:none}
    @media(max-width:1000px){.shell{grid-template-columns:1fr!important}.side{display:none!important}.z21-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.content{padding:16px!important}.top{padding:0 14px!important}.top h1{font-size:26px!important}.z21-mobile-list{display:grid;gap:8px}.z21-table-desktop{display:none}.z21-agenda{min-width:0}.z21-dayhead{grid-template-columns:52px repeat(7,minmax(105px,1fr));min-width:787px}.z21-gridbody{min-width:787px}.z21-class{left:4px;right:4px}}
    @media(max-width:650px){.z21-grid{grid-template-columns:1fr 1fr}.z21-fields{grid-template-columns:1fr}.z21-field.full{grid-column:auto}.z21-agenda{min-width:760px}.z21-topactions{width:100%}.z21-range{flex:1}.z21-class-coach{display:none}}
  `;
  document.head.appendChild(style);

  const oldGo=window.go;
  const oldNav=window.nav;
  const oldLabels=window.labels||{};
  window.labels=Object.assign({},oldLabels,{overview:'Inicio',agenda2:'Agenda',clients:'Clientes',finance:'Finanzas',content:'Contenido',settings:'Configuración'});

  function installNav(){
    if(role!=='admin') return;
    const nav=q('#nav'); if(!nav) return;
    nav.innerHTML=`<button data-page="overview">Inicio</button><button data-page="agenda2">Agenda</button><button data-page="clients">Clientes</button><button data-page="finance">Finanzas</button><button data-page="content">Contenido</button><button data-page="settings">Configuración</button>`;
    nav.querySelectorAll('button').forEach(b=>b.onclick=()=>window.go(b.dataset.page));
  }

  function setActive(p){document.querySelectorAll('#nav button').forEach(b=>b.classList.toggle('active',b.dataset.page===p));}

  window.nav=function(){
    if(role==='admin') return [['overview','Inicio'],['agenda2','Agenda'],['clients','Clientes'],['finance','Finanzas'],['content','Contenido'],['settings','Configuración']];
    return oldNav?oldNav():[];
  };

  window.go=function(page){
    if(role==='admin' && ['finance','agenda2','content','settings'].includes(page)){
      const c=q('#content'); const t=q('#pageTitle');
      setActive(page); if(t)t.textContent=window.labels[page]||page;
      if(page==='agenda2') return renderAgenda(c);
      if(page==='finance') return renderFinance(c,'payments');
      if(page==='content') return renderContent(c);
      if(page==='settings') return renderSettings(c);
    }
    if(role==='admin' && page==='clients'){
      setActive('clients'); if(q('#pageTitle'))q('#pageTitle').textContent='Clientes';
      return window.adminClients(c=q('#content'));
    }
    if(role==='admin' && page==='overview'){
      setActive('overview'); if(q('#pageTitle'))q('#pageTitle').textContent='Inicio';
      return window.adminHome(q('#content'));
    }
    return oldGo(page);
  };

  function openDrawer(title,subtitle,body,footer){
    let ov=q('#z21Overlay');
    if(!ov){ov=document.createElement('div');ov.id='z21Overlay';ov.className='z21-overlay';document.body.appendChild(ov)}
    ov.innerHTML=`<aside class="z21-drawer"><div class="z21-dhead"><div><div class="z21-dtitle">${title}</div>${subtitle?`<div class="z21-dsub">${subtitle}</div>`:''}</div><button class="z21-close" onclick="window.z21Close()">×</button></div><div class="z21-dbody">${body}</div>${footer?`<div class="z21-dfoot">${footer}</div>`:''}</aside>`;
    ov.classList.add('show');
  }
  window.z21Close=()=>q('#z21Overlay')?.classList.remove('show');

  async function loadWeekData(){
    const days=weekDates(window.__z21AgendaDate||isoToday());
    const {data:classes,error}=await sb.from('classes').select('*,coaches(id,name,specialty,photo_url,is_active)').in('class_date',days).order('class_date').order('start_time');
    if(error){toast(error.message);return {classes:[],reservations:[]}}
    const ids=(classes||[]).map(x=>x.id);
    let reservations=[];
    if(ids.length){const r=await sb.from('reservations').select('id,class_id,profile_id,status,created_at,profiles(full_name,email,phone)').in('class_id',ids).order('created_at');reservations=r.data||[]}
    return {classes:classes||[],reservations};
  }

  async function renderAgenda(c){
    window.__z21AgendaDate=window.__z21AgendaDate||isoToday();
    c.innerHTML='<div class="hero"><h2>Agenda</h2><p class="muted">Gestiona clases, coaches y reservas desde una sola vista.</p></div><div class="z21-toolbar"><div class="z21-topactions"><button class="z21-iconbtn" onclick="window.z21AgendaShift(-7)">‹</button><button class="btn out" onclick="window.z21AgendaToday()">Hoy</button><button class="z21-iconbtn" onclick="window.z21AgendaShift(7)">›</button><span id="z21AgendaRange" class="z21-range"></span></div><div class="z21-topactions"><button class="btn out" onclick="window.z21AgendaView('day')">Día</button><button class="btn out" onclick="window.z21AgendaView('week')">Semana</button><button class="btn out" onclick="window.z21OpenCoaches()">Coaches</button><button class="btn red" onclick="window.z21OpenClass()">+ Clase</button></div></div><div id="z21AgendaHost"></div>';
    window.__z21AgendaView=window.__z21AgendaView||'week';
    await paintAgenda();
  }

  window.z21AgendaShift=(n)=>{const d=new Date(String(window.__z21AgendaDate||isoToday())+'T12:00:00');d.setDate(d.getDate()+n);window.__z21AgendaDate=d.toISOString().slice(0,10);paintAgenda()};
  window.z21AgendaToday=()=>{window.__z21AgendaDate=isoToday();paintAgenda()};
  window.z21AgendaView=(v)=>{window.__z21AgendaView=v;paintAgenda()};

  async function paintAgenda(){
    const host=q('#z21AgendaHost'); if(!host)return;
    host.innerHTML='<div class="card"><div class="z21-note">Cargando agenda…</div></div>';
    const days=window.__z21AgendaView==='day'?[window.__z21AgendaDate]:weekDates(window.__z21AgendaDate);
    const {classes,reservations}=await loadWeekData();
    const resByClass={};reservations.forEach(r=>(resByClass[r.class_id]??=[]).push(r));
    const label=window.__z21AgendaView==='day'?fmtDate(days[0],{weekday:'long',day:'numeric',month:'long'}):`${fmtDate(days[0])} – ${fmtDate(days[6])}`;
    const r=q('#z21AgendaRange');if(r)r.textContent=label;
    const startHour=6,endHour=21,hourPx=56,total=(endHour-startHour)*hourPx;
    if(window.__z21AgendaView==='day'){
      // reuse the weekly grid with a single day column for consistency
    }
    let head=`<div class="z21-dayhead"><div class="z21-timehead"></div>${days.map(d=>`<div><div class="z21-dayname">${fmtDate(d,{weekday:'short'}).replace('.','')}</div><div class="z21-daynum ${d===isoToday()?'today':''}">${fmtDate(d,{day:'numeric'})}</div></div>`).join('')}</div>`;
    const gridCols=days.length;
    const timeCol=`<div class="z21-timecol" style="height:${total}px">${Array.from({length:endHour-startHour},(_,i)=>{const h=startHour+i;return `<span class="z21-time" style="top:${i*hourPx}px">${String(h).padStart(2,'0')}:00</span>`}).join('')}</div>`;
    const dayCols=days.map(d=>{
      const items=(classes||[]).filter(x=>x.class_date===d);
      const lines=Array.from({length:endHour-startHour},(_,i)=>`<span class="z21-hourline" style="top:${i*hourPx}px"></span>`).join('');
      const blocks=items.map(x=>{const top=Math.max(0,(timeMins(x.start_time)-startHour*60)/60*hourPx);const height=Math.max(34,(timeMins(x.end_time)-timeMins(x.start_time))/60*hourPx-4);const count=(resByClass[x.id]||[]).filter(r=>r.status==='reserved').length;const full=count>=10||count>=Number(x.capacity||10);const coach=x.coaches?.name||'Sin coach';return `<button class="z21-class ${full?'full':''}" style="top:${top}px;height:${height}px" onclick="window.z21OpenClass('${x.id}')"><div class="z21-class-time"><span>${timeText(x.start_time)}</span><span>${count}/10</span></div><div class="z21-class-name">${esc0(x.class_type||'Functional')}</div><div class="z21-class-coach">${esc0(coach)}</div></button>`}).join('');
      return `<div class="z21-daycol ${d===isoToday()?'today':''}" style="height:${total}px">${lines}${blocks}</div>`;
    }).join('');
    host.innerHTML=`<div class="z21-agenda-wrap"><div class="z21-agenda">${head}<div class="z21-gridbody">${timeCol}<div class="z21-days" style="grid-template-columns:repeat(${days.length},1fr)">${dayCols||''}</div></div></div></div>`;
  }

  window.z21OpenClass=async function(id){
    let cls=null;
    if(id){const {data}=await sb.from('classes').select('*,coaches(id,name,specialty,photo_url,is_active)').eq('id',id).single();cls=data||null;}
    const coaches=state.coaches||[];
    let reservations=[]; let clients=[];
    if(cls){const r=await sb.from('reservations').select('id,profile_id,status,created_at,profiles(full_name,email,phone)').eq('class_id',cls.id).order('created_at');reservations=r.data||[]}
    const dur=(cls?((timeMins(cls.end_time)-timeMins(cls.start_time))||60):60);
    const cCount=reservations.filter(r=>r.status==='reserved').length;
    const isFull=cCount>=10;
    const body=`<div class="z21-fields">
      <div class="z21-field"><label>Tipo de clase</label><select id="z21cType">${['Functional','Strength','Mobility','Conditioning','Open Box','Personal'].map(n=>`<option ${((cls?.class_type||'Functional')===n)?'selected':''}>${n}</option>`).join('')}</select></div>
      <div class="z21-field"><label>Capacidad</label><input id="z21cCap" type="number" min="1" max="10" value="${Math.min(10,Number(cls?.capacity||10))}" readonly></div>
      <div class="z21-field"><label>Fecha</label><input id="z21cDate" type="date" value="${esc0(cls?.class_date||window.__z21AgendaDate||isoToday())}"></div>
      <div class="z21-field"><label>Coach</label><select id="z21cCoach">${coaches.map(co=>`<option value="${co.id}" ${cls?.coach_id===co.id?'selected':''}>${esc0(co.name)}</option>`).join('')}</select></div>
      <div class="z21-field"><label>Inicio</label><input id="z21cStart" type="time" value="${timeText(cls?.start_time||'08:00')}"></div>
      <div class="z21-field"><label>Fin</label><input id="z21cEnd" type="time" value="${timeText(cls?.end_time||'09:00')}"></div>
    </div>
    ${cls?`<div class="z21-section"><div class="z21-topactions" style="justify-content:space-between"><strong>Reservas</strong><span class="z21-mini">${cCount}/10</span></div><div class="z21-list" style="margin-top:8px">${reservations.length?reservations.map(r=>`<div class="z21-row"><div><strong>${esc0(r.profiles?.full_name||'Cliente')}</strong><small>${esc0(r.profiles?.phone||r.profiles?.email||'')}</small></div><button class="btn danger" onclick="window.z21CancelReservation('${r.id}')" ${r.status!=='reserved'?'disabled':''}>${r.status==='reserved'?'Cancelar':'Cancelada'}</button></div>`).join(''):'<div class="z21-note">Sin reservas.</div>'}</div></div>`:''}`;
    const footer=`<button class="btn out" onclick="window.z21Close()">Cancelar</button><button class="btn red" onclick="window.z21SaveClass('${id||''}')">${id?'Guardar cambios':'Crear clase'}</button>`;
    openDrawer(id?`Clase · ${esc0(cls?.class_type||'')}`:'Nueva clase',id?`${fmtDate(cls.class_date,{weekday:'long',day:'numeric',month:'long'})} · ${timeText(cls.start_time)}`:'Programa una nueva sesión',body,footer);
  };

  window.z21SaveClass=async function(id){
    const payload={class_date:q('#z21cDate').value,start_time:q('#z21cStart').value,end_time:q('#z21cEnd').value,class_type:q('#z21cType').value,coach_id:q('#z21cCoach').value||null,capacity:10,status:'scheduled',updated_at:new Date().toISOString()};
    if(!payload.class_date||!payload.start_time||!payload.end_time||!payload.class_type)return toast('Completa los datos de la clase.');
    const {error}=id?await sb.from('classes').update(payload).eq('id',id):await sb.from('classes').insert(payload);
    if(error)return toast(error.message); z21Close(); toast(id?'Clase actualizada.':'Clase creada.'); await paintAgenda();
  };
  window.z21CancelReservation=async function(id){
    if(!confirm('¿Cancelar esta reserva?'))return;const {error}=await sb.from('reservations').update({status:'cancelled',cancelled_at:new Date().toISOString()}).eq('id',id);if(error)return toast(error.message);toast('Reserva cancelada.');const current=document.querySelector('.z21-overlay.show');if(current)current.remove();await paintAgenda();
  };
  window.z21OpenCoaches=async function(){
    const rows=await sb.from('coaches').select('*').order('name');const coaches=rows.data||[];
    const list=coaches.map(c=>`<div class="z21-coachrow"><div class="z21-coachinfo"><div class="z21-avatar">${c.photo_url?`<img src="${esc0(c.photo_url)}">`:esc0((c.name||'?')[0].toUpperCase())}</div><div><strong>${esc0(c.name||'Sin nombre')}</strong><div class="z21-mini">${esc0(c.specialty||'')}</div></div></div><button class="btn out" onclick="window.z21EditCoach('${c.id}')">Editar</button></div>`).join('');
    openDrawer('Coaches',`${coaches.length} coaches`,`<div class="z21-list">${list||'<div class="z21-note">No hay coaches registrados.</div>'}</div>`,`<button class="btn red" style="width:100%" onclick="window.z21EditCoach('')">+ Nuevo coach</button>`);
  };
  window.z21EditCoach=async function(id){
    let c={name:'',specialty:'',bio:'',photo_url:'',is_active:true};if(id){const r=await sb.from('coaches').select('*').eq('id',id).single();c={...c,...(r.data||{})}}
    const body=`<div class="z21-fields"><div class="z21-field full"><label>Nombre</label><input id="z21coName" value="${esc0(c.name)}"></div><div class="z21-field"><label>Especialidad</label><input id="z21coSpec" value="${esc0(c.specialty||'')}"></div><div class="z21-field"><label>Estado</label><select id="z21coActive"><option value="true" ${c.is_active?'selected':''}>Activo</option><option value="false" ${!c.is_active?'selected':''}>Inactivo</option></select></div><div class="z21-field full"><label>Foto</label><input id="z21coPhoto" value="${esc0(c.photo_url||'')}" placeholder="URL de foto"></div><div class="z21-field full"><label>Bio</label><textarea id="z21coBio">${esc0(c.bio||'')}</textarea></div></div>`;
    openDrawer(id?'Editar coach':'Nuevo coach','Información del coach',body,`<button class="btn out" onclick="window.z21OpenCoaches()">Cancelar</button><button class="btn red" onclick="window.z21SaveCoach('${id}')">Guardar</button>`);
  };
  window.z21SaveCoach=async function(id){
    const payload={name:q('#z21coName').value.trim(),specialty:q('#z21coSpec').value.trim()||null,photo_url:q('#z21coPhoto').value.trim()||null,bio:q('#z21coBio').value.trim()||null,is_active:q('#z21coActive').value==='true',updated_at:new Date().toISOString()};if(!payload.name)return toast('Escribe el nombre del coach.');const {error}=id?await sb.from('coaches').update(payload).eq('id',id):await sb.from('coaches').insert(payload);if(error)return toast(error.message);toast('Coach guardado.');await sb.from('coaches').select('*');window.z21OpenCoaches();
  };

  async function financeData(){
    const [payments,memberships,plans,founders,clients]=await Promise.all([
      sb.from('payments').select('*,profiles(full_name,email),membership_plans(name)').order('created_at',{ascending:false}).limit(300),
      sb.from('memberships').select('*,profiles(full_name,email),membership_plans(name,price,duration_days,is_founder_plan)').order('end_date',{ascending:false}).limit(300),
      sb.from('membership_plans').select('*').order('sort_order').order('name'),
      sb.from('founder_codes').select('*,profiles:used_by(full_name,email)').order('created_at',{ascending:false}).limit(300),
      sb.from('profiles').select('id,full_name,email').eq('role','cliente').order('full_name')
    ]);
    return {payments:payments.data||[],memberships:memberships.data||[],plans:plans.data||[],founders:founders.data||[],clients:clients.data||[]};
  }

  window.renderFinance=async function(c,tab='payments'){
    const data=await financeData();window.__z21FinanceData=data; 
    const tabs=[['payments','Pagos'],['memberships','Membresías'],['plans','Planes'],['founders','Fundadores'],['reports','Reportes']];
    c.innerHTML=`<div class="hero"><h2>Finanzas</h2><p class="muted">Pagos, membresías y planes en un solo espacio.</p></div><div class="z21-tabs">${tabs.map(([k,v])=>`<button class="z21-tab ${k===tab?'active':''}" onclick="window.renderFinance(document.querySelector('#content'),'${k}')">${v}</button>`).join('')}</div><div id="z21FinanceHost"></div>`;
    if(tab==='payments')return renderPayments(data);
    if(tab==='memberships')return renderMemberships(data);
    if(tab==='plans')return renderPlans(data);
    if(tab==='founders')return renderFounders(data);
    return renderReports(data);
  };

  function renderPayments(data){
    const filters=[['all','Todos'],['paid','Pagados'],['pending','Pendientes'],['overdue','Vencidos']];
    const opts=filters.map(x=>`<button class="z21-tab z21-payfilter" data-k="${x[0]}">${x[1]} <span data-count="${x[0]}"></span></button>`).join('');
    q('#z21FinanceHost').innerHTML=`<div class="z21-toolbar"><div class="z21-search"><span>⌕</span><input id="z21PayQ" placeholder="Buscar cliente o concepto…"></div><div class="z21-topactions"><select id="z21PaySort" style="height:40px;border:1px solid #dde0e4;border-radius:9px;background:#fff;padding:0 10px"><option value="date-desc">Fecha reciente</option><option value="date-asc">Fecha antigua</option><option value="amount-desc">Monto mayor</option><option value="amount-asc">Monto menor</option></select><button class="btn red" onclick="window.z21PaymentDrawer()">+ Registrar pago</button></div></div><div class="z21-tabs" id="z21PayFilters">${opts}</div><div class="card"><div id="z21PayTable"></div></div>`;
    const draw=()=>{let rows=[...data.payments];const f=document.querySelector('.z21-payfilter.active')?.dataset.k||'all';const qv=(q('#z21PayQ')?.value||'').toLowerCase().trim();if(f!=='all')rows=rows.filter(p=>p.status===f);if(qv)rows=rows.filter(p=>(p.profiles?.full_name||'').toLowerCase().includes(qv)||(p.membership_plans?.name||'').toLowerCase().includes(qv));const sort=q('#z21PaySort')?.value||'date-desc';rows.sort((a,b)=>sort==='date-desc'?String(b.created_at).localeCompare(String(a.created_at)):sort==='date-asc'?String(a.created_at).localeCompare(String(b.created_at)):sort==='amount-desc'?Number(b.amount||0)-Number(a.amount||0):Number(a.amount||0)-Number(b.amount||0);const counts={all:data.payments.length,paid:data.payments.filter(p=>p.status==='paid').length,pending:data.payments.filter(p=>p.status==='pending').length,overdue:data.payments.filter(p=>p.status==='overdue').length};document.querySelectorAll('[data-count]').forEach(s=>s.textContent=counts[s.dataset.count]??0);q('#z21PayTable').innerHTML=`<div class="z21-table-desktop"><div class="table-wrap"><table class="tbl"><thead><tr><th>Cliente</th><th>Plan</th><th>Monto</th><th>Fecha</th><th>Método</th><th>Estado</th></tr></thead><tbody>${rows.length?rows.map(p=>`<tr style="cursor:pointer" onclick="window.z21PaymentDrawer('${p.id}')"><td><b>${esc0(p.profiles?.full_name||'—')}</b></td><td>${esc0(p.membership_plans?.name||'—')}</td><td>${fmtMoney(p.amount)}</td><td>${fmtDate(p.created_at)}</td><td>${esc0(p.method||'—')}</td><td><span class="pill ${p.status==='paid'?'ok':p.status==='pending'?'warn':'bad'}">${esc0(p.status||'')}</span></td></tr>`).join(''):'<tr><td colspan="6" style="text-align:center;padding:40px;color:#9299a1">Sin pagos</td></tr>'}</tbody></table></div></div><div class="z21-mobile-list">${rows.map(p=>`<button class="z21-row" onclick="window.z21PaymentDrawer('${p.id}')"><span><strong>${esc0(p.profiles?.full_name||'—')}</strong><small>${esc0(p.membership_plans?.name||'—')} · ${fmtDate(p.created_at)}</small></span><span><strong>${fmtMoney(p.amount)}</strong></span></button>`).join('')||'<div class="z21-note">Sin pagos</div>'}</div>`};
    document.querySelectorAll('.z21-payfilter').forEach((b,i)=>{if(i===0)b.classList.add('active');b.onclick=()=>{document.querySelectorAll('.z21-payfilter').forEach(x=>x.classList.remove('active'));b.classList.add('active');draw()}});q('#z21PayQ').oninput=draw;q('#z21PaySort').onchange=draw;draw();
  }

  window.z21PaymentDrawer=async function(id){
    const d=window.__z21FinanceData||await financeData();const p=id?d.payments.find(x=>x.id===id):null;
    const body=p?`<div class="z21-fields"><div class="z21-field"><label>Cliente</label><input id="z21pClient" value="${esc0(p.profiles?.full_name||'')}" disabled></div><div class="z21-field"><label>Monto</label><input id="z21pAmount" type="number" value="${Number(p.amount||0)}"></div><div class="z21-field"><label>Plan</label><select id="z21pPlan">${d.plans.map(pl=>`<option value="${pl.id}" ${pl.id===p?.plan_id?'selected':''}>${esc0(pl.name)}</option>`).join('')}</select></div><div class="z21-field"><label>Método</label><select id="z21pMethod"><option value="card" ${p?.method==='card'?'selected':''}>Tarjeta</option><option value="cash" ${p?.method==='cash'?'selected':''}>Efectivo</option><option value="transfer" ${p?.method==='transfer'?'selected':''}>Transferencia</option><option value="online" ${p?.method==='online'?'selected':''}>En línea</option></select></div><div class="z21-field"><label>Estado</label><select id="z21pStatus"><option value="paid" ${p?.status==='paid'?'selected':''}>Pagado</option><option value="pending" ${p?.status==='pending'?'selected':''}>Pendiente</option><option value="overdue" ${p?.status==='overdue'?'selected':''}>Vencido</option><option value="cancelled" ${p?.status==='cancelled'?'selected':''}>Cancelado</option></select></div></div>`:`<div class="z21-fields"><div class="z21-field full"><label>Cliente</label><select id="z21pClientSel">${d.clients.map(cl=>`<option value="${cl.id}">${esc0(cl.full_name)} · ${esc0(cl.email||'')}</option>`).join('')}</select></div><div class="z21-field"><label>Monto</label><input id="z21pAmount" type="number" value="1200"></div><div class="z21-field"><label>Plan</label><select id="z21pPlan">${d.plans.map(pl=>`<option value="${pl.id}">${esc0(pl.name)}</option>`).join('')}</select></div><div class="z21-field"><label>Método</label><select id="z21pMethod"><option value="card">Tarjeta</option><option value="cash">Efectivo</option><option value="transfer">Transferencia</option><option value="online">En línea</option></select></div><div class="z21-field"><label>Estado</label><select id="z21pStatus"><option value="paid">Pagado</option><option value="pending">Pendiente</option><option value="overdue">Vencido</option></select></div></div>`;
    openDrawer(p?'Detalle de pago':'Registrar pago',p?.profiles?.full_name||'Nuevo registro',body,p?`<button class="btn out" onclick="window.z21EditPayment('${p.id}')">Editar</button><button class="btn red" onclick="window.z21Close()">Cerrar</button>`:`<button class="btn out" onclick="window.z21Close()">Cancelar</button><button class="btn red" onclick="window.z21SavePayment()">Guardar</button>`);
    if(p){window.__z21EditingPayment=p}
  };
  window.z21EditPayment=(id)=>{const p=(window.__z21FinanceData||{}).payments?.find(x=>x.id===id);window.z21PaymentEditMode=p||null;window.z21PaymentDrawer();};
  window.z21SavePayment=async function(){
    const editing=window.__z21PaymentEditMode;if(editing){const {error}=await sb.from('payments').update({amount:Number(q('#z21pAmount').value||0),plan_id:q('#z21pPlan').value||null,method:q('#z21pMethod').value,status:q('#z21pStatus').value,reviewed_by:me.id,reviewed_at:new Date().toISOString()}).eq('id',editing.id);if(error)return toast(error.message);toast('Pago actualizado.');z21Close();return renderFinance(q('#content'),'payments');}
    const profileId=q('#z21pClientSel').value;const planId=q('#z21pPlan').value||null;const {error}=await sb.from('payments').insert({profile_id:profileId,plan_id:planId,amount:Number(q('#z21pAmount').value||0),method:q('#z21pMethod').value,status:q('#z21pStatus').value,reviewed_by:me.id,reviewed_at:new Date().toISOString()});if(error)return toast(error.message);toast('Pago registrado.');z21Close();await renderFinance(q('#content'),'payments');
  };

  function renderMemberships(data){
    const filters=[['all','Todas'],['active','Activas'],['expiring','Por vencer'],['expired','Vencidas'],['pending','Pendientes']];
    q('#z21FinanceHost').innerHTML=`<div class="z21-toolbar"><div class="z21-search"><span>⌕</span><input id="z21MemQ" placeholder="Buscar cliente o plan…"></div><button class="btn red" onclick="window.z21MembershipDrawer()">+ Nueva membresía</button></div><div class="z21-tabs" id="z21MemFilters">${filters.map(x=>`<button class="z21-tab z21-mfilter" data-k="${x[0]}">${x[1]} <span></span></button>`).join('')}</div><div class="card"><div class="table-wrap"><table class="tbl"><thead><tr><th>Cliente</th><th>Plan</th><th>Inicio</th><th>Vencimiento</th><th>Estado</th></tr></thead><tbody id="z21MemBody"></tbody></table></div></div>`;
    const draw=()=>{let rows=[...data.memberships];const f=document.querySelector('.z21-mfilter.active')?.dataset.k||'all';const qv=(q('#z21MemQ')?.value||'').toLowerCase();if(f!=='all')rows=rows.filter(m=>m.status===f);if(qv)rows=rows.filter(m=>(m.profiles?.full_name||'').toLowerCase().includes(qv)||(m.membership_plans?.name||'').toLowerCase().includes(qv));const counts={all:data.memberships.length,active:data.memberships.filter(m=>m.status==='active').length,expiring:data.memberships.filter(m=>m.status==='expiring').length,expired:data.memberships.filter(m=>m.status==='expired').length,pending:data.memberships.filter(m=>m.status==='pending').length};document.querySelectorAll('#z21MemFilters .z21-mfilter').forEach((b,i)=>b.querySelector('span').textContent=counts[b.dataset.k]||0);q('#z21MemBody').innerHTML=rows.map(m=>`<tr style="cursor:pointer" onclick="window.z21MembershipDrawer('${m.id}')"><td><b>${esc0(m.profiles?.full_name||'—')}</b></td><td>${esc0(m.membership_plans?.name||'—')}</td><td>${fmtDate(m.start_date)}</td><td>${fmtDate(m.end_date)}</td><td><span class="pill ${m.status==='active'?'ok':m.status==='pending'||m.status==='expiring'?'warn':'bad'}">${esc0(m.status)}</span></td></tr>`).join('')||'<tr><td colspan="5" style="text-align:center;padding:40px;color:#9299a1">Sin membresías</td></tr>'};
    document.querySelectorAll('.z21-mfilter').forEach((b,i)=>{if(i===0)b.classList.add('active');b.onclick=()=>{document.querySelectorAll('.z21-mfilter').forEach(x=>x.classList.remove('active'));b.classList.add('active');draw()}});q('#z21MemQ').oninput=draw;draw();
  }
  window.z21MembershipDrawer=async function(id){
    const d=window.__z21FinanceData||await financeData();const m=id?d.memberships.find(x=>x.id===id):null;const pays=m?d.payments.filter(p=>p.membership_id===m.id||p.profile_id===m.profile_id).slice(0,8):[];
    const body=m?`<div class="z21-fields"><div class="z21-field"><label>Cliente</label><input value="${esc0(m.profiles?.full_name||'')}" disabled></div><div class="z21-field"><label>Plan</label><select id="z21mPlan">${d.plans.map(pl=>`<option value="${pl.id}" ${pl.id===m.plan_id?'selected':''}>${esc0(pl.name)}</option>`).join('')}</select></div><div class="z21-field"><label>Inicio</label><input id="z21mStart" type="date" value="${m.start_date||''}"></div><div class="z21-field"><label>Vencimiento</label><input id="z21mEnd" type="date" value="${m.end_date||''}"></div><div class="z21-field full"><label>Estado</label><select id="z21mStatus"><option value="active" ${m.status==='active'?'selected':''}>Activa</option><option value="expiring" ${m.status==='expiring'?'selected':''}>Por vencer</option><option value="expired" ${m.status==='expired'?'selected':''}>Vencida</option><option value="pending" ${m.status==='pending'?'selected':''}>Pendiente</option><option value="cancelled" ${m.status==='cancelled'?'selected':''}>Cancelada</option></select></div></div><div class="z21-section"><strong>Historial de pagos</strong><div class="z21-list" style="margin-top:8px">${pays.map(p=>`<div class="z21-row"><div><strong>${fmtMoney(p.amount)}</strong><small>${fmtDate(p.created_at)} · ${esc0(p.method||'')}</small></div><span class="pill ${p.status==='paid'?'ok':'warn'}">${esc0(p.status)}</span></div>`).join('')||'<div class="z21-note">Sin pagos.</div>'}</div></div>`:`<div class="z21-fields"><div class="z21-field full"><label>Cliente</label><select id="z21mClient">${d.clients.map(cl=>`<option value="${cl.id}">${esc0(cl.full_name)}</option>`).join('')}</select></div><div class="z21-field"><label>Plan</label><select id="z21mPlan">${d.plans.map(pl=>`<option value="${pl.id}">${esc0(pl.name)}</option>`).join('')}</select></div><div class="z21-field"><label>Inicio</label><input id="z21mStart" type="date" value="${isoToday()}"></div><div class="z21-field"><label>Vencimiento</label><input id="z21mEnd" type="date" value="${new Date(Date.now()+30*86400000).toISOString().slice(0,10)}"></div><div class="z21-field full"><label>Estado</label><select id="z21mStatus"><option value="active">Activa</option><option value="pending">Pendiente</option><option value="expired">Vencida</option><option value="cancelled">Cancelada</option></select></div></div>`;
    openDrawer(m?'Membresía':'Nueva membresía',m?.profiles?.full_name||'Asignar plan',body,`<button class="btn out" onclick="window.z21Close()">Cancelar</button><button class="btn red" onclick="window.z21SaveMembership('${id||''}')">${m?'Guardar cambios':'Crear membresía'}</button>${m?`<button class="btn out" onclick="window.z21RenewMembership('${m.id}')">Renovar</button>`:''}`);
  };
  window.z21SaveMembership=async function(id){const payload={plan_id:q('#z21mPlan').value,start_date:q('#z21mStart').value,end_date:q('#z21mEnd').value,status:q('#z21mStatus').value,updated_at:new Date().toISOString()};if(!id)payload.profile_id=q('#z21mClient').value;const {error}=id?await sb.from('memberships').update(payload).eq('id',id):await sb.from('memberships').insert(payload);if(error)return toast(error.message);toast(id?'Membresía actualizada.':'Membresía creada.');z21Close();await renderFinance(q('#content'),'memberships')};
  window.z21RenewMembership=async function(id){const d=window.__z21FinanceData;const m=d.memberships.find(x=>x.id===id);if(!m)return;const plan=d.plans.find(p=>p.id===m.plan_id);const base=new Date((m.end_date||isoToday())+'T12:00:00');base.setDate(base.getDate()+Number(plan?.duration_days||30));const {error}=await sb.from('memberships').update({start_date:m.end_date||isoToday(),end_date:base.toISOString().slice(0,10),status:'active',updated_at:new Date().toISOString()}).eq('id',id);if(error)return toast(error.message);toast('Membresía renovada.');z21Close();await renderFinance(q('#content'),'memberships')};

  function renderPlans(data){
    q('#z21FinanceHost').innerHTML=`<div class="z21-toolbar"><span class="z21-mini">${data.plans.length} planes</span><button class="btn red" onclick="window.z21PlanDrawer()">+ Nuevo plan</button></div><div class="z21-grid">${data.plans.map(p=>`<div class="card"><div style="display:flex;justify-content:space-between;gap:8px"><div><strong>${esc0(p.name)}</strong>${p.is_founder_plan?'<div style="margin-top:5px"><span class="pill warn">Fundadores</span></div>':''}</div><span class="pill ${p.is_active?'ok':'bad'}">${p.is_active?'Activo':'Inactivo'}</span></div><div style="margin-top:12px;font-size:24px;font-weight:700">${fmtMoney(p.price)} <span style="font-size:11px;color:#7a818a">/ ${p.duration_days} días</span></div><div class="z21-mini" style="margin-top:6px">${esc0(p.description||'')}</div><div style="margin-top:14px;display:flex;justify-content:space-between;gap:8px"><button class="btn out" onclick="window.z21PlanDrawer('${p.id}')">Editar</button><button class="btn out" onclick="window.z21TogglePlan('${p.id}',${!p.is_active})">${p.is_active?'Desactivar':'Activar'}</button></div></div>`).join('')||'<div class="z21-note">Sin planes.</div>'}</div>`;
  }
  window.z21PlanDrawer=async function(id){
    const d=window.__z21FinanceData||await financeData();const p=id?d.plans.find(x=>x.id===id):null;const body=`<div class="z21-fields"><div class="z21-field full"><label>Nombre</label><input id="z21plName" value="${esc0(p?.name||'')}"></div><div class="z21-field"><label>Precio</label><input id="z21plPrice" type="number" value="${Number(p?.price||1200)}"></div><div class="z21-field"><label>Duración (días)</label><input id="z21plDays" type="number" value="${Number(p?.duration_days||30)}"></div><div class="z21-field full"><label>Descripción</label><textarea id="z21plDesc">${esc0(p?.description||'')}</textarea></div><div class="z21-field"><label>Estado</label><select id="z21plActive"><option value="true" ${p?.is_active!==false?'selected':''}>Activo</option><option value="false" ${p?.is_active===false?'selected':''}>Inactivo</option></select></div><div class="z21-field"><label>Fundadores</label><select id="z21plFounder"><option value="false" ${!p?.is_founder_plan?'selected':''}>No</option><option value="true" ${p?.is_founder_plan?'selected':''}>Sí</option></select></div></div>`;openDrawer(p?'Editar plan':'Nuevo plan',p?.name||'Nuevo plan',body,`<button class="btn out" onclick="window.z21Close()">Cancelar</button><button class="btn red" onclick="window.z21SavePlan('${id||''}')">Guardar</button>`);
  };
  window.z21SavePlan=async function(id){const payload={name:q('#z21plName').value.trim(),price:Number(q('#z21plPrice').value||0),duration_days:Number(q('#z21plDays').value||30),description:q('#z21plDesc').value.trim()||null,is_active:q('#z21plActive').value==='true',is_founder_plan:q('#z21plFounder').value==='true',updated_at:new Date().toISOString()};if(!payload.name)return toast('Escribe el nombre del plan.');const {error}=id?await sb.from('membership_plans').update(payload).eq('id',id):await sb.from('membership_plans').insert(payload);if(error)return toast(error.message);toast('Plan guardado.');z21Close();await renderFinance(q('#content'),'plans')};
  window.z21TogglePlan=async function(id,on){const {error}=await sb.from('membership_plans').update({is_active:on,updated_at:new Date().toISOString()}).eq('id',id);if(error)return toast(error.message);await renderFinance(q('#content'),'plans')};

  function renderFounders(data){
    q('#z21FinanceHost').innerHTML=`<div class="z21-toolbar"><div class="z21-search"><span>⌕</span><input id="z21FoundQ" placeholder="Buscar código o cliente…"></div><button class="btn red" onclick="window.z21FounderDrawer()">+ Crear código</button></div><div class="card"><div class="table-wrap"><table class="tbl"><thead><tr><th>Código</th><th>Estado</th><th>Creación</th><th>Usado por</th></tr></thead><tbody id="z21FoundBody"></tbody></table></div></div>`;
    const draw=()=>{const qv=(q('#z21FoundQ')?.value||'').toLowerCase();const rows=data.founders.filter(f=>(f.code||'').toLowerCase().includes(qv)||(f.profiles?.full_name||'').toLowerCase().includes(qv));q('#z21FoundBody').innerHTML=rows.map(f=>`<tr style="cursor:pointer" onclick="window.z21FounderDrawer('${f.id}')"><td><code>${esc0(f.code)}</code></td><td><span class="pill ${f.used_by?'warn':'ok'}">${f.used_by?'Usado':'Disponible'}</span></td><td>${fmtDate(f.created_at)}</td><td>${esc0(f.profiles?.full_name||'—')}</td></tr>`).join('')||'<tr><td colspan="4" style="text-align:center;padding:40px;color:#9299a1">Sin códigos</td></tr>'};q('#z21FoundQ').oninput=draw;draw();
  }
  window.z21FounderDrawer=async function(id){const d=window.__z21FinanceData||await financeData();const f=id?d.founders.find(x=>x.id===id):null;const body=f?`<div class="z21-fields"><div class="z21-field"><label>Código</label><input value="${esc0(f.code)}" disabled></div><div class="z21-field"><label>Estado</label><input value="${f.used_by?'Usado':'Disponible'}" disabled></div><div class="z21-field full"><label>Cliente asociado</label><input value="${esc0(f.profiles?.full_name||'—')}" disabled></div><div class="z21-note">Creado el ${fmtDate(f.created_at)}${f.used_at?` · utilizado el ${fmtDate(f.used_at)}`:''}</div></div>`:`<div class="z21-fields"><div class="z21-field full"><label>Código</label><input id="z21fCode" value="Z33-${Math.random().toString(36).slice(2,8).toUpperCase()}"></div></div>`;openDrawer(f?'Código de fundador':'Nuevo código de fundadores',f?.code||'Genera un código',body,f?`<button class="btn out" onclick="window.z21Close()">Cerrar</button>`:`<button class="btn out" onclick="window.z21Close()">Cancelar</button><button class="btn red" onclick="window.z21SaveFounder()">Crear</button>`) };
  window.z21SaveFounder=async function(){const code=q('#z21fCode').value.trim().toUpperCase();if(!code)return;const {error}=await sb.from('founder_codes').insert({code});if(error)return toast(error.message);toast('Código creado.');z21Close();await renderFinance(q('#content'),'founders')};

  function renderReports(data){const active=data.memberships.filter(m=>m.status==='active').length;const pending=data.payments.filter(p=>p.status==='pending').length;const paid=data.payments.filter(p=>p.status==='paid').reduce((a,b)=>a+Number(b.amount||0),0);const exp=data.memberships.filter(m=>m.status==='expiring').length;q('#z21FinanceHost').innerHTML=`<div class="z21-grid"><div class="card z21-stat"><small>Ingresos registrados</small><strong>${fmtMoney(paid)}</strong><span class="z21-mini">${data.payments.filter(p=>p.status==='paid').length} pagos</span></div><div class="card z21-stat"><small>Membresías activas</small><strong>${active}</strong></div><div class="card z21-stat"><small>Pagos pendientes</small><strong>${pending}</strong></div><div class="card z21-stat"><small>Por vencer</small><strong>${exp}</strong></div><div class="card z21-stat"><small>Clientes</small><strong>${data.clients.length}</strong></div></div><div class="card" style="margin-top:12px"><div class="z21-note">Los reportes se basan en la información registrada actualmente en el portal. Después podemos añadir rangos de fecha y gráficas si realmente hacen falta.</div></div>`}

  function renderContent(c){c.innerHTML=`<div class="hero"><h2>Contenido</h2><p class="muted">Administra lo que aparece dentro del ecosistema ZONA 33.</p></div><div class="z21-grid"><div class="card"><h3>WOD</h3><p class="muted">Publica y gestiona los entrenamientos.</p><button class="btn red" onclick="oldGo('wod')">Abrir WOD</button></div><div class="card"><h3>Instagram</h3><p class="muted">Gestiona las publicaciones del sitio.</p><button class="btn red" onclick="oldGo('instagram')">Abrir Instagram</button></div><div class="card"><h3>Comunidad</h3><p class="muted">Avisos y contenido para atletas.</p><button class="btn red" onclick="oldGo('community')">Abrir comunidad</button></div><div class="card"><h3>Landing</h3><p class="muted">Edita el contenido del sitio público.</p><button class="btn red" onclick="oldGo('site')">Abrir landing</button></div><div class="card"><h3>Leaderboard</h3><p class="muted">Resultados y posiciones.</p><button class="btn red" onclick="oldGo('leaderboard')">Abrir leaderboard</button></div></div>`;}
  function renderSettings(c){c.innerHTML=`<div class="hero"><h2>Configuración</h2><p class="muted">Herramientas administrativas y ajustes del portal.</p></div><div class="card"><div class="z21-note">La lógica actual de configuración se mantiene. Esta sección será el punto de entrada para futuras preferencias del gimnasio.</div><div style="margin-top:12px"><button class="btn out" onclick="oldGo('coaches')">Gestión de coaches</button></div></div>`;}

  function install(){if(role!=='admin')return;installNav();setTimeout(installNav,200);setTimeout(installNav,800);setTimeout(()=>{if(q('#pageTitle')?.textContent==='Dashboard')window.go('overview')},900)}
  install();
  const mo=new MutationObserver(()=>{if(role==='admin'&&q('#nav')&&!q('#nav').dataset.z21){q('#nav').dataset.z21='1';installNav()}});mo.observe(document.body,{childList:true,subtree:true});
})();
