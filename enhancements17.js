// ZONA 33 · Admin: clientes + reservas | Cliente: horario semanal
(function(){
  const weekDays=(start)=>Array.from({length:7},(_,i)=>{const d=new Date(start);d.setDate(d.getDate()+i);return d});
  const iso=d=>d.toISOString().slice(0,10);
  const shortDay=d=>d.toLocaleDateString('es-MX',{weekday:'short'}).replace('.','');
  const dayNum=d=>d.toLocaleDateString('es-MX',{day:'numeric'});
  const time=v=>String(v||'').slice(0,5);

  const baseNav=window.nav;
  window.nav=function(){
    const items=baseNav?baseNav():[];
    if(role==='admin' && !items.some(x=>x[0]==='adminReservations')){
      const idx=items.findIndex(x=>x[0]==='payments');
      items.splice(idx>=0?idx:items.length,0,['adminReservations','Reservas']);
    }
    return items;
  };
  try{labels.adminReservations='Reservas'}catch(e){}

  function ensureAdminNav(){
    if(role!=='admin')return;
    const navEl=document.querySelector('#nav');
    if(!navEl || navEl.querySelector('[data-page="adminReservations"]'))return;
    const b=document.createElement('button');
    b.dataset.page='adminReservations';
    b.textContent='Reservas';
    b.onclick=()=>go('adminReservations');
    const payment=navEl.querySelector('[data-page="payments"]');
    if(payment)payment.before(b);else navEl.appendChild(b);
  }
  setTimeout(ensureAdminNav,0);

  window.deleteClient=async function(profileId,name){
    if(!profileId)return toast('Cliente no encontrado.');
    const clientName=name||state.clients.find(x=>x.id===profileId)?.full_name||'este cliente';
    const ok=confirm(`¿Eliminar definitivamente a ${clientName}?\n\nSe eliminarán su cuenta, membresías, pagos y reservas. Esta acción no se puede deshacer.`);
    if(!ok)return;
    const {error}=await sb.rpc('admin_delete_client',{p_profile_id:profileId});
    if(error)return toast(error.message||'No se pudo eliminar el cliente.');
    await refresh();
    toast('Cliente eliminado.');
    go('clients');
  };

  window.adminClients=async function(c){
    c.innerHTML='<div class="card"><div class="ey">Admin</div><h2>Cargando clientes...</h2></div>';
    const d=typeof adminPaymentData==='function'?await adminPaymentData():null;
    if(!d)return;
    const byProfile={};
    d.memberships.forEach(m=>{if(!byProfile[m.profile_id]||new Date(m.created_at)>new Date(byProfile[m.profile_id].created_at))byProfile[m.profile_id]=m});
    const pending={};
    d.payments.filter(p=>p.status==='pending').forEach(p=>{pending[p.profile_id]=p});
    c.innerHTML=`<div class="hero"><div class="ey">Admin</div><h2>Clientes <span>${d.clients.length}</span></h2><p class="muted">Gestiona membresías, pagos y cuentas de clientes.</p><button class="btn red" onclick="adminPaymentForm()">REGISTRAR PAGO</button></div><div class="card"><input id="q" placeholder="Buscar por nombre o correo" style="width:min(390px,100%);background:#080808;color:#fff;border:1px solid #333;border-radius:8px;padding:11px;margin-bottom:12px"><div class="table-wrap"><table class="tbl"><thead><tr><th>Nombre</th><th>Correo</th><th>Membresía</th><th>Pago</th><th>Acción</th></tr></thead><tbody id="clientBody"></tbody></table></div></div>`;
    const draw=rows=>clientBody.innerHTML=rows.map(x=>{
      const m=byProfile[x.id],p=pending[x.id],active=m?.status==='active'&&m?.end_date>=today();
      return `<tr><td><b>${esc(x.full_name)}</b></td><td>${esc(x.email||'—')}</td><td><span class="pill ${active?'ok':m?.status==='pending'?'warn':'bad'}">${active?'ACTIVA':m?.status==='pending'?'PENDIENTE':'SIN MEMBRESÍA'}</span>${m?.membership_plans?.name?`<small style="display:block;color:#888;margin-top:4px">${esc(m.membership_plans.name)}</small>`:''}</td><td>${p?`<span class="pill warn">${money(p.amount)} · PENDIENTE</span>`:active?'<span class="pill ok">PAGADO</span>':'—'}</td><td><div class="actions">${p?`<button class="btn red" onclick="confirmPayment('${p.id}')">CONFIRMAR PAGO</button>`:active?'<span class="pill ok">ACTIVA</span>':'<button class="btn out" onclick="adminPaymentForm()">REGISTRAR PAGO</button>'}<button class="btn danger" onclick="deleteClient('${x.id}')">ELIMINAR</button></div></td></tr>`;
    }).join('')||'<tr><td colspan="5">No hay clientes.</td></tr>';
    draw(d.clients);
    q.oninput=()=>{const v=q.value.toLowerCase();draw(d.clients.filter(x=>(x.full_name||'').toLowerCase().includes(v)||(x.email||'').toLowerCase().includes(v)))};
  };

  window.adminReservations=async function(c){
    c.innerHTML='<div class="card"><div class="ey">Admin</div><h2>Cargando reservas...</h2></div>';
    const {data,error}=await sb.from('reservations').select('id,status,created_at,cancelled_at,profile_id,class_id,coach_id,profiles(full_name,email),classes(class_date,start_time,end_time,class_type,capacity),coaches(name)').order('created_at',{ascending:false});
    if(error)return toast(error.message||'No se pudieron cargar las reservas.');
    const rows=(data||[]).filter(r=>r.classes).sort((a,b)=>String(a.classes.class_date).localeCompare(String(b.classes.class_date))||time(a.classes.start_time).localeCompare(time(b.classes.start_time)));
    const grouped={};
    rows.forEach(r=>{const k=r.class_id;(grouped[k]??=[]).push(r)});
    const cards=Object.values(grouped).map(rs=>{
      const cls=rs[0].classes;
      const active=rs.filter(r=>r.status==='reserved');
      const names=active.length?active.map(r=>`<span class="attendee">${esc(r.profiles?.full_name||'Cliente')}</span>`).join(''):'<span class="muted">Nadie ha reservado todavía.</span>';
      return `<div class="schedule-admin-card"><div class="schedule-admin-head"><div><div class="ey">${esc(dateText(cls.class_date))}</div><h3>${esc(time(cls.start_time))} · ${esc(cls.class_type||'Functional')}</h3><small>${esc(rs[0].coaches?.name||'Coach Z33')} · ${active.length}/${esc(cls.capacity)} lugares</small></div><span class="pill ${active.length?'ok':'warn'}">${active.length} RESERVA${active.length===1?'':'S'}</span></div><div class="attendees">${names}</div></div>`;
    }).join('');
    c.innerHTML=`<div class="hero"><div class="ey">Admin</div><h2>Reservas <span>de clases.</span></h2><p class="muted">Aquí puedes ver quién está apuntado a cada horario.</p></div><div class="card"><div class="list">${cards||'<div class="empty">No hay clases con reservas registradas.</div>'}</div></div>`;
  };

  window.book=function(c){
    const now=new Date();
    const monday=new Date(now);
    const day=(monday.getDay()+6)%7;
    monday.setDate(monday.getDate()-day);
    monday.setHours(0,0,0,0);
    const days=weekDays(monday);
    const byDay=Object.fromEntries(days.map(d=>[iso(d),[]]));
    state.classes.forEach(x=>{if(byDay[x.class_date])byDay[x.class_date].push(x)});
    const dayCols=days.map(d=>{
      const key=iso(d),items=byDay[key]||[];
      return `<div class="schedule-day"><div class="schedule-day-head"><b>${esc(shortDay(d))}</b><strong>${esc(dayNum(d))}</strong></div><div class="schedule-day-body">${items.length?items.map(x=>{const mine=state.reservations.some(r=>r.class_id===x.id&&r.status==='reserved');return `<div class="class-slot"><div><b>${esc(time(x.start_time))}</b><span>${esc(x.class_type||'Functional')}</span><small>${esc(x.coaches?.name||'Coach Z33')} · ${esc(x.capacity)} cupos</small></div><button class="btn ${mine?'out':'red'}" ${mine?'disabled':`onclick="reserve('${x.id}')"`}>${mine?'RESERVADA':'RESERVAR'}</button></div>`}).join(''):'<div class="schedule-empty">Sin clases</div>'}</div></div>`;
    }).join('');
    c.innerHTML=`<div class="hero"><div class="ey">Horarios</div><h2>Tu <span>semana.</span></h2><p class="muted">Elige un día y horario. Tus reservas quedan guardadas directamente en ZONA 33.</p></div><div class="schedule-week-wrap"><div class="schedule-week">${dayCols}</div></div>`;
  };

  const style=document.createElement('style');
  style.textContent=`
    .schedule-week-wrap{overflow:auto;border:1px solid #292929;border-radius:14px;background:linear-gradient(145deg,#111,#090909);-webkit-overflow-scrolling:touch}
    .schedule-week{display:grid;grid-template-columns:repeat(7,minmax(145px,1fr));min-width:1015px}
    .schedule-day{min-height:460px;border-right:1px solid #242424}.schedule-day:last-child{border-right:0}
    .schedule-day-head{position:sticky;top:0;z-index:2;background:#0b0b0b;border-bottom:1px solid #292929;padding:14px;text-align:center;text-transform:uppercase}
    .schedule-day-head b{display:block;color:#8f969f;font:900 11px/1 'Barlow Condensed';letter-spacing:.12em}.schedule-day-head strong{display:block;margin-top:6px;font:900 27px/.9 'Barlow Condensed'}
    .schedule-day-body{padding:8px;display:grid;gap:8px;align-content:start}.class-slot{border:1px solid #2a2a2a;border-radius:9px;background:#080808;padding:10px;display:grid;gap:9px}.class-slot b{font:900 21px/.9 'Barlow Condensed';display:block}.class-slot span{display:block;font-size:11px;font-weight:800;margin-top:4px}.class-slot small{display:block;color:#777;margin-top:4px;font-size:9px;line-height:1.35}.class-slot .btn{width:100%;min-height:38px;font-size:9px}.schedule-empty{padding:22px 8px;text-align:center;color:#606771;font-size:10px;text-transform:uppercase;letter-spacing:.06em}
    .schedule-admin-card{border:1px solid #292929;border-radius:10px;background:#0b0b0b;padding:14px}.schedule-admin-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}.schedule-admin-head h3{font:900 24px/.9 'Barlow Condensed';text-transform:uppercase;margin:5px 0}.schedule-admin-head small{color:#888}.attendees{display:flex;flex-wrap:wrap;gap:6px;margin-top:12px;padding-top:12px;border-top:1px solid #222}.attendee{padding:6px 9px;border-radius:999px;background:#151515;border:1px solid #333;font-size:10px;font-weight:800}
    @media(max-width:900px){.schedule-week-wrap{border-radius:12px}.schedule-week{display:block;min-width:0}.schedule-day{min-height:0;border-right:0;border-bottom:1px solid #242424}.schedule-day:last-child{border-bottom:0}.schedule-day-head{position:static;display:flex;align-items:center;justify-content:space-between;text-align:left;padding:12px 14px}.schedule-day-head b{font-size:12px}.schedule-day-head strong{margin:0;font-size:24px}.schedule-day-body{padding:8px}.class-slot{grid-template-columns:1fr auto;align-items:center}.class-slot .btn{width:auto;min-width:96px}.schedule-empty{padding:14px}.schedule-admin-head{flex-direction:column}.attendees{gap:5px}}
    @media(max-width:520px){.class-slot{grid-template-columns:1fr}.class-slot .btn{width:100%}.schedule-admin-card{padding:11px}}
  `;
  document.head.appendChild(style);
})();
