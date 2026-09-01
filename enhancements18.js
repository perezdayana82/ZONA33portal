// ZONA 33 · Admin final fixes: clients + reservations
(function(){
  const ADMIN_RESERVATIONS='adminReservations';
  const baseGo=window.go;

  function ensureAdminNav(){
    if(typeof role==='undefined' || role!=='admin') return;
    const navEl=document.querySelector('#nav');
    if(!navEl) return;
    if(navEl.querySelector('[data-page="adminReservations"]')) return;
    const b=document.createElement('button');
    b.type='button';
    b.dataset.page=ADMIN_RESERVATIONS;
    b.textContent='Reservas';
    b.onclick=()=>window.go(ADMIN_RESERVATIONS);
    const payment=navEl.querySelector('[data-page="payments"]');
    if(payment) payment.before(b); else navEl.appendChild(b);
  }

  window.go=function(page){
    if(page===ADMIN_RESERVATIONS && typeof role!=='undefined' && role==='admin'){
      const title=document.querySelector('#pageTitle');
      const c=document.querySelector('#content');
      if(title) title.textContent='Reservas';
      document.querySelectorAll('#nav button').forEach(b=>b.classList.toggle('active',b.dataset.page===ADMIN_RESERVATIONS));
      if(c && typeof window.adminReservations==='function') return window.adminReservations(c);
    }
    return baseGo(page);
  };

  window.deleteClient=async function(profileId,name){
    if(typeof role==='undefined' || role!=='admin') return toast('Solo un administrador puede eliminar clientes.');
    if(!profileId) return toast('Cliente no encontrado.');
    const clientName=name || (state.clients||[]).find(x=>x.id===profileId)?.full_name || 'este cliente';
    if(!confirm(`¿Eliminar definitivamente a ${clientName}?\n\nSe eliminarán su cuenta, membresía, pagos y reservas. Esta acción no se puede deshacer.`)) return;
    const {error}=await sb.rpc('admin_delete_client',{p_profile_id:profileId});
    if(error){
      console.error('admin_delete_client',error);
      return toast('No se pudo eliminar: '+(error.message||'error de servidor'));
    }
    await refresh();
    toast('Cliente eliminado correctamente.');
    window.go('clients');
  };

  window.adminClients=function(c){
    const clients=Array.isArray(state.clients)?state.clients:[];
    c.innerHTML=`<div class="hero"><div class="ey">Admin</div><h2>Clientes <span>${clients.length}</span></h2><p class="muted">Gestiona las cuentas de tus clientes.</p></div><div class="card"><input id="adminClientSearch" placeholder="Buscar por nombre o correo" style="width:min(390px,100%);background:#080808;color:#fff;border:1px solid #333;border-radius:8px;padding:11px;margin-bottom:12px"><div class="table-wrap"><table class="tbl"><thead><tr><th>Nombre</th><th>Correo</th><th>Teléfono</th><th>Estado</th><th>Acciones</th></tr></thead><tbody id="adminClientBody"></tbody></table></div></div>`;
    const draw=(rows)=>{
      const body=document.querySelector('#adminClientBody');
      if(!body) return;
      body.innerHTML=rows.map(x=>`<tr><td><b>${esc(x.full_name||'Sin nombre')}</b></td><td>${esc(x.email||'—')}</td><td>${esc(x.phone||'—')}</td><td><span class="pill ${x.is_active?'ok':'bad'}">${x.is_active?'ACTIVO':'INACTIVO'}</span></td><td><div class="actions"><button class="btn danger" onclick="deleteClient('${x.id}',${JSON.stringify(x.full_name||'este cliente')})">ELIMINAR</button></div></td></tr>`).join('') || '<tr><td colspan="5">No hay clientes.</td></tr>';
    };
    draw(clients);
    const q=document.querySelector('#adminClientSearch');
    if(q) q.oninput=()=>{const v=q.value.toLowerCase().trim();draw(clients.filter(x=>(x.full_name||'').toLowerCase().includes(v)||(x.email||'').toLowerCase().includes(v)))};
  };

  window.adminReservations=async function(c){
    c.innerHTML='<div class="card"><div class="ey">Admin</div><h2>Cargando reservas...</h2></div>';
    const {data,error}=await sb.rpc('admin_list_reservations');
    if(error){
      console.error('admin_list_reservations',error);
      c.innerHTML=`<div class="card"><div class="ey">Admin</div><h2>No se pudieron cargar las reservas.</h2><p class="muted">${esc(error.message||'Error al consultar reservas.')}</p><button class="btn red" onclick="go('adminReservations')">REINTENTAR</button></div>`;
      return;
    }
    const rows=Array.isArray(data)?data:[];
    const grouped={};
    rows.forEach(r=>{const key=r.class_id||('row-'+r.reservation_id);(grouped[key]??=[]).push(r)});
    const groups=Object.values(grouped).sort((a,b)=>String(a[0].class_date||'').localeCompare(String(b[0].class_date||''))||String(a[0].start_time||'').localeCompare(String(b[0].start_time||'')));
    const cards=groups.map(rs=>{
      const cls=rs[0];
      const active=rs.filter(r=>r.status==='reserved');
      const names=active.length?active.map(r=>`<span class="attendee">${esc(r.client_name||'Cliente')}</span>`).join(''):'<span class="muted">Nadie ha reservado todavía.</span>';
      const date=cls.class_date?new Date(cls.class_date+'T12:00:00').toLocaleDateString('es-MX',{weekday:'long',day:'numeric',month:'long'}):'Fecha pendiente';
      return `<div class="schedule-admin-card"><div class="schedule-admin-head"><div><div class="ey">${esc(date)}</div><h3>${esc(String(cls.start_time||'').slice(0,5))} · ${esc(cls.class_type||'Functional')}</h3><small>${esc(cls.coach_name||'Coach Z33')} · ${active.length}/${esc(cls.capacity||0)} lugares</small></div><span class="pill ${active.length?'ok':'warn'}">${active.length} RESERVA${active.length===1?'':'S'}</span></div><div class="attendees">${names}</div></div>`;
    }).join('');
    c.innerHTML=`<div class="hero"><div class="ey">Admin</div><h2>Reservas <span>de clases.</span></h2><p class="muted">Aquí puedes ver quién está apuntado a cada horario.</p></div><div class="card"><div class="list">${cards||'<div class="empty">No hay reservas registradas.</div>'}</div></div>`;
  };

  const style=document.createElement('style');
  style.textContent='.schedule-admin-card{border:1px solid #292929;border-radius:10px;background:#0b0b0b;padding:14px}.schedule-admin-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}.schedule-admin-head h3{font:900 24px/.9 "Barlow Condensed";text-transform:uppercase;margin:5px 0}.schedule-admin-head small{color:#888}.attendees{display:flex;flex-wrap:wrap;gap:6px;margin-top:12px;padding-top:12px;border-top:1px solid #222}.attendee{padding:6px 9px;border-radius:999px;background:#151515;border:1px solid #333;font-size:10px;font-weight:800}@media(max-width:520px){.schedule-admin-head{flex-direction:column}.schedule-admin-card{padding:11px}}';
  document.head.appendChild(style);

  ensureAdminNav();
  setTimeout(ensureAdminNav,100);
  setTimeout(ensureAdminNav,500);
  setTimeout(ensureAdminNav,1500);
  const observer=new MutationObserver(ensureAdminNav);
  observer.observe(document.body,{childList:true,subtree:true});
})();
