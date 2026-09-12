(() => {
  'use strict';

  const SB_URL = 'https://ponhllwbvhtczaphfdgw.supabase.co';
  const SB_KEY = 'sb_publishable_okgoHkX2YZFtQ9P72ckztQ_jiCuWN-6';
  const db = window.supabase.createClient(SB_URL, SB_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });

  const $ = (s) => document.querySelector(s);
  const esc = (v) => String(v ?? '').replace(/[&<>\"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', "'": '&#39;' }[c]));
  const today = () => new Date().toISOString().slice(0, 10);
  const money = (v) => '$' + Number(v || 0).toLocaleString('es-MX', { maximumFractionDigits: 0 });
  const dateText = (v) => v ? new Date(v + 'T12:00:00').toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
  const weekMonday = (d) => {
    const x = new Date(d + 'T12:00:00');
    const day = x.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    x.setDate(x.getDate() + diff);
    return x.toISOString().slice(0, 10);
  };
  const addDays = (d, n) => {
    const x = new Date(d + 'T12:00:00');
    x.setDate(x.getDate() + n);
    return x.toISOString().slice(0, 10);
  };
  const timeText = (v) => String(v || '').slice(0, 5);
  const parseMinutes = (v) => { const [h, m] = String(v || '00:00').split(':').map(Number); return h * 60 + (m || 0); };

  let anchor = weekMonday(today());
  const slotsWeek = ['05:30','06:30','07:30','08:30','09:30','10:30','11:30','12:30','17:00','18:00','19:00'];
  const slotsSat = ['07:00','08:00','09:00','10:00','11:00'];

  function inject() {
    if ($('#z33AgendaPaymentsFixStyles')) return;
    const s = document.createElement('style');
    s.id = 'z33AgendaPaymentsFixStyles';
    s.textContent = `
      .z33fix-wrap{max-width:1120px;margin:0 auto;padding:25px 28px 55px}
      .z33fix-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-end;margin-bottom:16px}
      .z33fix-title{font-size:30px;font-weight:720;letter-spacing:-.035em;margin:4px 0}.z33fix-sub{font-size:13px;color:#7c8189}
      .z33fix-toolbar{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:14px}
      .z33fix-btn{min-height:38px;border:1px solid #dedfe3;background:#fff;border-radius:8px;padding:0 12px;font-size:11px;font-weight:650;cursor:pointer}.z33fix-btn.red{background:#d3232d;border-color:#d3232d;color:#fff}
      .z33fix-week{font-size:13px;font-weight:700;color:#35383e}.z33fix-grid{background:#fff;border:1px solid #e1e2e5;border-radius:14px;overflow:auto}.z33fix-inner{min-width:980px}
      .z33fix-days{display:grid;grid-template-columns:56px repeat(7,1fr);background:#fafafa;border-bottom:1px solid #e5e6e8}.z33fix-days>div{text-align:center;padding:9px 3px;border-left:1px solid #f0f1f2}.z33fix-days small{display:block;text-transform:uppercase;font-size:8px;color:#81868e}.z33fix-days b{display:block;margin-top:3px;font-size:13px}.z33fix-body{display:grid;grid-template-columns:56px 1fr}.z33fix-times,.z33fix-dayscols{height:900px;position:relative}.z33fix-time{position:absolute;right:7px;transform:translateY(-6px);font-size:8px;color:#969ba2}.z33fix-cols{display:grid;grid-template-columns:repeat(7,1fr);height:900px}.z33fix-col{position:relative;border-left:1px solid #f0f1f2}.z33fix-line{position:absolute;left:0;right:0;border-top:1px solid #f5f5f6}.z33fix-class{position:absolute;left:4px;right:4px;border:1px solid #dfe2e5;border-left:3px solid #2d3136;background:#fff;border-radius:7px;padding:5px;cursor:pointer;overflow:hidden}.z33fix-class strong{display:block;font-size:9px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.z33fix-class small{display:block;color:#858b93;font-size:8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.z33fix-class.full{border-left-color:#c91428;background:#fff1f1}.z33fix-slot{position:absolute;left:6px;right:6px;height:50px;border:1px dashed #e7e8ea;border-radius:7px;background:rgba(250,250,250,.65);display:none;align-items:center;justify-content:center;font-size:9px;color:#9a9ea4;cursor:pointer}.z33fix-slot:hover{background:#fff1f1;color:#b71f28;border-color:#efb4b7}
      .z33fix-modal{position:fixed;inset:0;background:rgba(20,22,26,.28);z-index:200;display:none}.z33fix-modal.show{display:flex;align-items:center;justify-content:flex-end}.z33fix-drawer{width:min(500px,95vw);height:100%;background:#fff;padding:22px;overflow:auto;box-shadow:-18px 0 48px rgba(0,0,0,.14)}
      .z33fix-form{display:grid;gap:12px;margin-top:16px}.z33fix-form label{font-size:10px;font-weight:700;color:#727780}.z33fix-form input,.z33fix-form select,.z33fix-form textarea{width:100%;margin-top:6px;padding:11px;border:1px solid #dfe1e5;border-radius:9px;background:#fff;font-size:12px}.z33fix-row{display:grid;grid-template-columns:1fr 1fr;gap:10px}.z33fix-actions{display:flex;gap:6px;flex-wrap:wrap}
      @media(max-width:760px){.z33fix-wrap{padding:18px 12px 42px}.z33fix-row{grid-template-columns:1fr}}
    `;
    document.head.appendChild(s);
  }

  function drawer(title, html) {
    const overlay = $('#z33fix-modal');
    const box = $('#z33fix-drawer');
    if (!overlay || !box) return;
    box.innerHTML = `<div style="display:flex;align-items:flex-start;gap:10px"><div><div style="font-size:10px;font-weight:800;color:#c91428;letter-spacing:.13em;text-transform:uppercase">ZONA 33</div><h3 style="margin:4px 0 0;font-size:20px">${title}</h3></div><button class="z33fix-btn" style="margin-left:auto" id="z33fix-close">Cerrar</button></div>${html}`;
    overlay.classList.add('show');
    $('#z33fix-close').onclick = () => overlay.classList.remove('show');
  }

  async function renderAgenda() {
    inject();
    const from = anchor;
    const to = addDays(anchor, 6);
    const { data: classes = [] } = await db.from('classes').select('*,coaches(name)').gte('class_date', from).lte('class_date', to).order('class_date').order('start_time');
    const days = Array.from({ length: 7 }, (_, i) => addDays(anchor, i));
    const dayNames = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
    const minHour = 5.5;
    const hourPx = 60;
    const bodyHeight = 16 * hourPx;
    const hAt = (t) => Math.max(0, (parseMinutes(t) / 60 - minHour) * hourPx);
    const weekLabel = `${new Date(from + 'T12:00:00').toLocaleDateString('es-MX',{day:'2-digit',month:'short'})} – ${new Date(to + 'T12:00:00').toLocaleDateString('es-MX',{day:'2-digit',month:'short',year:'numeric'})}`;
    const app = $('#z33-content');
    if (!app) return;
    app.innerHTML = `
      <div class="z33fix-wrap">
        <div class="z33fix-head"><div><div style="font-size:10px;font-weight:800;letter-spacing:.13em;text-transform:uppercase;color:#c91428">HORARIOS</div><div class="z33fix-title">Clases / Horarios</div><div class="z33fix-sub">Semana completa · cupo máximo 10</div></div><div class="z33fix-actions"><button class="z33fix-btn" id="z33fix-prev">‹ Semana anterior</button><button class="z33fix-btn" id="z33fix-today">Hoy</button><button class="z33fix-btn" id="z33fix-next">Semana siguiente ›</button><button class="z33fix-btn red" id="z33fix-seed">Generar semana</button></div></div>
        <div class="z33fix-toolbar"><div class="z33fix-week">${weekLabel}</div><div style="font-size:11px;color:#858991">Horarios fijos: L-V 5:30–12:30 y 17:00–19:00 · S 7:00–11:00</div></div>
        <div class="z33fix-grid"><div class="z33fix-inner"><div class="z33fix-days"><div></div>${days.map((d,i)=>`<div><small>${dayNames[i]}</small><b>${new Date(d+'T12:00:00').getDate()}</b></div>`).join('')}</div><div class="z33fix-body"><div class="z33fix-times">${Array.from({length:17},(_,i)=>{const h=5+i;return `<span class="z33fix-time" style="top:${i*hourPx}px">${String(h).padStart(2,'0')}:00</span>`}).join('')}</div><div class="z33fix-dayscols"><div class="z33fix-cols">${days.map((d,di)=>{
          const dayClasses=classes.filter(c=>c.class_date===d && c.status==='scheduled');
          const slots=di===5?slotsSat:di<5?slotsWeek:[];
          return `<div class="z33fix-col">${Array.from({length:17},(_,i)=>`<div class="z33fix-line" style="top:${i*hourPx}px"></div>`).join('')}${slots.map(t=>`<button class="z33fix-slot" style="top:${hAt(t)+5}px;display:flex" data-slot="${d}|${t}">+ ${t}</button>`).join('')}${dayClasses.map(c=>{const top=hAt(c.start_time), height=Math.max(42,hAt(c.end_time)-top);const booked=0;return `<div class="z33fix-class" style="top:${top}px;height:${height}px" data-class="${c.id}"><strong>${timeText(c.start_time)} · ${esc(c.class_type||'Functional')}</strong><small>10 cupos · ${esc(c.coaches?.name||'Sin coach')}</small></div>`}).join('')}</div>`}).join('')}</div></div></div></div></div>`;
    }
    $('#z33fix-prev').onclick = () => { anchor = addDays(anchor,-7); renderAgenda(); };
    $('#z33fix-next').onclick = () => { anchor = addDays(anchor,7); renderAgenda(); };
    $('#z33fix-today').onclick = () => { anchor = weekMonday(today()); renderAgenda(); };
    $('#z33fix-seed').onclick = () => seedWeek();
    document.querySelectorAll('[data-slot]').forEach((b) => b.onclick = () => { const [date,time] = b.dataset.slot.split('|'); openClassForm(null,date,time); });
    document.querySelectorAll('[data-class]').forEach((b) => b.onclick = async () => openExistingClass(b.dataset.class));
  }

  async function openExistingClass(id) {
    const { data: c } = await db.from('classes').select('*,coaches(name)').eq('id', id).single();
    if (!c) return;
    const { data: rs = [] } = await db.from('reservations').select('*,profiles(full_name,email,phone)').eq('class_id', id).order('created_at');
    drawer(c.class_type || 'Clase', `<div style="margin-top:16px"><b>${dateText(c.class_date)} · ${timeText(c.start_time)}–${timeText(c.end_time)}</b><div style="margin-top:8px;color:#858991;font-size:12px">Coach: ${esc(c.coaches?.name || 'Sin coach')} · Capacidad: ${Number(c.capacity||10)}</div></div><div style="margin-top:18px"><b>Reservas (${rs.length}/${Number(c.capacity||10)})</b><div style="display:grid;gap:8px;margin-top:8px">${rs.length ? rs.map(r=>`<div style="padding:10px;border:1px solid #eceef0;border-radius:9px"><b>${esc(r.profiles?.full_name||'Cliente')}</b><div style="font-size:10px;color:#858991">${esc(r.profiles?.email||'')} · ${esc(r.profiles?.phone||'')}</div></div>`).join('') : '<div style="color:#858991;font-size:12px">Sin reservas.</div>'}</div></div><div class="z33fix-actions" style="margin-top:18px"><button class="z33fix-btn red" id="z33fix-edit">Editar</button><button class="z33fix-btn" id="z33fix-cancel">Cancelar clase</button></div>`);
    $('#z33fix-edit').onclick = () => openClassForm(c.id,c.class_date,timeText(c.start_time),c);
    $('#z33fix-cancel').onclick = async () => { if (!confirm('¿Cancelar esta clase?')) return; const r=await db.from('classes').update({status:'cancelled'}).eq('id',id); if(r.error)return alert(r.error.message); $('#z33fix-modal').classList.remove('show'); renderAgenda(); };
  }

  function openClassForm(id,date,time,existing) {
    const c=existing||{};
    drawer(id?'Editar clase':'Nueva clase', `<form id="z33fix-class-form" class="z33fix-form"><div class="z33fix-row"><label>Tipo<select id="fix-type"><option>Functional</option><option>Strength</option><option>Mobility</option><option>Conditioning</option><option>Open Box</option><option>Personal</option></select></label><label>Fecha<input id="fix-date" type="date" required></label></div><div class="z33fix-row"><label>Hora<input id="fix-time" type="time" required></label><label>Duración<select id="fix-duration"><option value="60">60 min</option><option value="45">45 min</option><option value="90">90 min</option></select></label></div><label>Coach<select id="fix-coach"><option value="">Sin coach</option></select></label><label>Capacidad<input id="fix-cap" type="number" min="1" max="10" value="10"></label><div class="z33fix-actions"><button type="button" class="z33fix-btn" id="fix-cancel">Cancelar</button><button class="z33fix-btn red">Guardar</button></div></form>`);
    (async()=>{const {data:coaches=[]}=await db.from('coaches').select('id,name').eq('is_active',true).order('name');$('#fix-coach').innerHTML='<option value="">Sin coach</option>'+coaches.map(x=>`<option value="${x.id}">${esc(x.name)}</option>`).join('');$('#fix-type').value=c.class_type||'Functional';$('#fix-date').value=c.class_date||date||today();$('#fix-time').value=timeText(c.start_time||time||'08:00');$('#fix-duration').value=String(c.duration_minutes||60);$('#fix-cap').value=String(Math.min(10,Number(c.capacity||10)));$('#fix-coach').value=c.coach_id||'';$('#fix-cancel').onclick=()=>$('#z33fix-modal').classList.remove('show');})();
    $('#z33fix-class-form').onsubmit=async e=>{e.preventDefault();const st=$('#fix-time').value;const dur=Number($('#fix-duration').value);const total=parseMinutes(st)+dur;const payload={class_type:$('#fix-type').value,class_date:$('#fix-date').value,start_time:st,end_time:String(Math.floor(total/60)).padStart(2,'0')+':'+String(total%60).padStart(2,'0'),duration_minutes:dur,coach_id:$('#fix-coach').value||null,capacity:Math.min(10,Math.max(1,Number($('#fix-cap').value||10))),status:'scheduled'};const r=id?await db.from('classes').update(payload).eq('id',id):await db.from('classes').insert(payload);if(r.error)return alert(r.error.message);$('#z33fix-modal').classList.remove('show');renderAgenda();};
  }

  async function seedWeek(){
    const days=Array.from({length:7},(_,i)=>addDays(anchor,i));
    const desired=[];
    days.forEach((d,i)=>{const slots=i===5?slotsSat:i<5?slotsWeek:[];slots.forEach(time=>desired.push({class_date:d,start_time:time,end_time:String(Math.floor(parseMinutes(time)/60+1)).padStart(2,'0')+':00',class_type:'Functional',capacity:10,status:'scheduled'}));});
    const {data:existing=[]}=await db.from('classes').select('class_date,start_time,status').gte('class_date',days[0]).lte('class_date',days[6]);
    const missing=desired.filter(x=>!existing.some(y=>y.class_date===x.class_date&&timeText(y.start_time)===x.start_time&&y.status==='scheduled'));
    if(!missing.length){alert('Esta semana ya tiene todos los horarios.');return;}
    const {error}=await db.from('classes').insert(missing);if(error)return alert(error.message);renderAgenda();
  }

  async function paymentForm() {
    const {data:clients=[],error:clientError}=await db.from('profiles').select('id,full_name,email').eq('role','cliente').order('full_name');
    if(clientError)return alert('No se pudieron cargar clientes: '+clientError.message);
    if(!clients.length)return alert('No hay clientes registrados.');
    const modal=$('#z33fix-modal'),box=$('#z33fix-drawer');
    drawer('Registrar pago', `<form id="z33fix-pay-form" class="z33fix-form"><div class="z33fix-row"><label>Cliente<select id="pay-client">${clients.map(c=>`<option value="${esc(c.id)}">${esc(c.full_name||'Cliente')} — ${esc(c.email||'')}</option>`).join('')}</select></label><label>Concepto<input id="pay-concept" value="Mensualidad" required></label></div><div class="z33fix-row"><label>Monto<input id="pay-amount" type="number" min="0" value="500" required></label><label>Fecha<input id="pay-date" type="date" value="${today()}" required></label></div><div class="z33fix-row"><label>Método<select id="pay-method"><option value="transferencia">Transferencia</option><option value="ficha">Ficha</option><option value="online">Online</option><option value="efectivo">Efectivo</option><option value="tarjeta">Tarjeta</option></select></label><label>Estado<select id="pay-status"><option value="approved">Pagado</option><option value="pending">Pendiente</option><option value="rejected">Rechazado</option></select></label></div><label>Notas<textarea id="pay-notes"></textarea></label><div id="pay-error" style="font-size:11px;color:#b42318"></div><div class="z33fix-actions"><button type="button" class="z33fix-btn" id="pay-cancel">Cancelar</button><button class="z33fix-btn red" id="pay-save">Guardar pago</button></div></form>`);
    $('#pay-cancel').onclick=()=>modal.classList.remove('show');
    $('#z33fix-pay-form').onsubmit=async e=>{e.preventDefault();const btn=$('#pay-save');btn.disabled=true;const payload={profile_id:$('#pay-client').value,concept:$('#pay-concept').value.trim(),amount:Number($('#pay-amount').value||0),payment_date:$('#pay-date').value,method:$('#pay-method').value,status:$('#pay-status').value,notes:$('#pay-notes').value.trim()||null};const r=await db.from('payments').insert(payload).select('id').single();if(r.error){$('#pay-error').textContent='No se pudo guardar: '+r.error.message;btn.disabled=false;return;}modal.classList.remove('show'); if(window.route) window.route('finance');};
  }

  function attach(){
    inject();
    const oldRoute=window.route;
    if(!oldRoute||oldRoute.__fixAttached)return false;
    const route=async(page)=>{if(page==='agenda'){window.__z33FixMode=true;document.querySelector('#z33-content')?.replaceChildren();renderAgenda();return;}if(page==='finance'){oldRoute(page);setTimeout(()=>{const b=document.querySelector('#z33a-finance-body');const btn=document.querySelector('[onclick="window.z33PaymentForm()"]');if(btn)btn.onclick=paymentForm;window.z33PaymentForm=paymentForm;},150);return;}return oldRoute(page);};
    route.__fixAttached=true;window.route=route;window.z33PaymentForm=paymentForm;
    if(!$('#z33fix-modal')){const m=document.createElement('div');m.id='z33fix-modal';m.className='z33fix-modal';m.innerHTML='<aside id="z33fix-drawer" class="z33fix-drawer"></aside>';document.body.appendChild(m);}
    return true;
  }

  let tries=0;const timer=setInterval(()=>{if(attach()||++tries>100)clearInterval(timer);},100);
})();
