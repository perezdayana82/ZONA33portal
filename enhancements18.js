// ZONA 33 · Admin fixes: delete clients + reservation viewer
(function(){
  const baseGo=window.go;
  window.go=function(page){
    if(page==='adminReservations'){
      const title=document.querySelector('#pageTitle');
      if(title) title.textContent='Reservas';
      document.querySelectorAll('#nav button').forEach(b=>b.classList.toggle('active',b.dataset.page==='adminReservations'));
      const c=document.querySelector('#content');
      if(role==='admin' && typeof window.adminReservations==='function') return window.adminReservations(c);
    }
    return baseGo(page);
  };

  window.deleteClient=async function(profileId,name){
    if(role!=='admin') return toast('Solo un administrador puede eliminar clientes.');
    if(!profileId) return toast('Cliente no encontrado.');
    const clientName=name || state.clients.find(x=>x.id===profileId)?.full_name || 'este cliente';
    if(!confirm(`¿Eliminar definitivamente a ${clientName}?\n\nSe eliminarán su cuenta, membresía, pagos y reservas. Esta acción no se puede deshacer.`)) return;
    const {error}=await sb.rpc('admin_delete_client',{p_profile_id:profileId});
    if(error){
      console.error('admin_delete_client',error);
      return toast('No se pudo eliminar: '+(error.message||'error de servidor'));
    }
    await refresh();
    toast('Cliente eliminado correctamente.');
    go('clients');
  };

  window.adminReservations=async function(c){
    c.innerHTML='<div class="card"><div class="ey">Admin</div><h2>Cargando reservas...</h2></div>';
    const {data,error}=await sb.rpc('admin_list_reservations');
    if(error){
      console.error('admin_list_reservations',error);
      c.innerHTML=`<div class="card"><div class="ey">Admin</div><h2>No se pudieron cargar.</h2><p class="muted">${esc(error.message||'Error al consultar reservas.')}</p><button class="btn out" onclick="go('adminReservations')">REINTENTAR</button></div>`;
      return;
    }
    const rows=Array.isArray(data)?data:[];
    const grouped={};
    rows.forEach(r=>{const key=r.class_id;(grouped[key]??=[]).push(r)});
    const dateLabel=v=>v?new Date(v+'T12:00:00').toLocaleDateString('es-MX',{weekday:'long',day:'numeric',month:'long'}):'Fecha pendiente';
    const time=v=>String(v||'').slice(0,5);
    const cards=Object.values(grouped).sort((a,b)=>String(a[0].class_date).localeCompare(String(b[0].class_date))||time(a[0].start_time).localeCompare(time(b[0].start_time)).map(rs=>{
      const cls=rs[0];
      const active=rs.filter(r=>r.status==='reserved');
      const names=active.length?active.map(r=>`<span class="attendee">${esc(r.client_name||'Cliente')}</span>`).join(''):'<span class="muted">Nadie ha reservado todavía.</span>';
      return `<div class="schedule-admin-card"><div class="schedule-admin-head"><div><div class="ey">${esc(dateLabel(cls.class_date))}</div><h3>${esc(time(cls.start_time))} · ${esc(cls.class_type||'Functional')}</h3><small>${esc(cls.coach_name||'Coach Z33')} · ${active.length}/${esc(cls.capacity)} lugares</small></div><span class="pill ${active.length?'ok':'warn'}">${active.length} RESERVA${active.length===1?'':'S'}</span></div><div class="attendees">${names}</div></div>`;
    }).join('');
    c.innerHTML=`<div class="hero"><div class="ey">Admin</div><h2>Reservas <span>de clases.</span></h2><p class="muted">Aquí puedes ver quién está apuntado a cada horario.</p></div><div class="card"><div class="list">${cards||'<div class="empty">No hay reservas registradas.</div>'}</div></div>`;
  };
})();
