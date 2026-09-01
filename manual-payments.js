(()=>{
const PAYMENT_WA='https://wa.me/522229195074';
const adminPaymentData=async()=>{
  const [{data:memberships,error:meErr},{data:payments,error:pErr},{data:clients,error:cErr}]=await Promise.all([
    sb.from('memberships').select('*,membership_plans(name,price)').order('created_at',{ascending:false}),
    sb.from('payments').select('*,membership_plans(name)').order('created_at',{ascending:false}),
    sb.from('profiles').select('*').eq('role','cliente').order('created_at',{ascending:false})
  ]);
  if(meErr||pErr||cErr){toast(meErr?.message||pErr?.message||cErr?.message||'No se pudo cargar la información.');return null}
  return {memberships:memberships||[],payments:payments||[],clients:clients||[]};
};
window.requestMembership=async function(planId){
  const active=state.memberships.find(x=>x.status==='active'&&x.end_date>=today());
  const pending=state.memberships.find(x=>x.status==='pending');
  if(active)return toast('Ya tienes una membresía activa.');
  if(pending)return toast('Ya tienes una solicitud de membresía pendiente.');
  const plan=state.plans.find(x=>x.id===planId);
  if(!plan)return toast('Plan no disponible.');
  const {error}=await sb.rpc('request_membership',{p_plan_id:planId});
  if(error)return toast(error.message);
  await refresh();
  const text=encodeURIComponent(`Hola, quiero contratar el plan ${plan.name} de ZONA 33 por ${money(plan.price)}. Mi correo es ${me?.email||profile?.email||''}. Ya registré mi solicitud en el portal y quiero completar el pago.`);
  window.location.href=`${PAYMENT_WA}?text=${text}`;
};
window.confirmPayment=async function(paymentId){
  if(!paymentId)return toast('Pago no encontrado.');
  if(!confirm('¿Confirmar que recibiste este pago? La membresía quedará ACTIVA.'))return;
  const {data,error}=await sb.rpc('admin_confirm_payment',{p_payment_id:paymentId,p_method:'WhatsApp / transferencia'});
  if(error)return toast(error.message);
  toast('Pago confirmado. Membresía activa.');
  go('clients');
};
window.adminClients=async function(c){
  c.innerHTML='<div class="card"><div class="ey">Admin</div><h2>Cargando clientes...</h2></div>';
  const d=await adminPaymentData();if(!d)return;
  const byProfile={};d.memberships.forEach(m=>{if(!byProfile[m.profile_id]||new Date(m.created_at)>new Date(byProfile[m.profile_id].created_at))byProfile[m.profile_id]=m});
  const pending={};d.payments.filter(p=>p.status==='pending').forEach(p=>{pending[p.profile_id]=p});
  c.innerHTML=`<div class="hero"><div class="ey">Admin</div><h2>Clientes <span>${d.clients.length}</span></h2><p class="muted">Aquí confirmas los pagos recibidos y activas las membresías.</p></div><div class="card"><input id="q" placeholder="Buscar por nombre o correo" style="width:min(390px,100%);background:#080808;color:#fff;border:1px solid #333;border-radius:8px;padding:11px;margin-bottom:12px"><div class="table-wrap"><table class="tbl"><thead><tr><th>Nombre</th><th>Correo</th><th>Membresía</th><th>Pago</th><th>Acción</th></tr></thead><tbody id="clientBody"></tbody></table></div></div>`;
  const draw=rows=>clientBody.innerHTML=rows.map(x=>{const m=byProfile[x.id],p=pending[x.id],active=m?.status==='active'&&m?.end_date>=today();return `<tr><td><b>${esc(x.full_name)}</b></td><td>${esc(x.email||'—')}</td><td><span class="pill ${active?'ok':m?.status==='pending'?'warn':'bad'}">${active?'ACTIVA':m?.status==='pending'?'PENDIENTE':'SIN MEMBRESÍA'}</span>${m?.membership_plans?.name?`<small style="display:block;color:#888;margin-top:4px">${esc(m.membership_plans.name)}</small>`:''}</td><td>${p?`<span class="pill warn">${money(p.amount)} · PENDIENTE</span>`:active?'<span class="pill ok">PAGADO</span>':'—'}</td><td>${p?`<button class="btn red" onclick="confirmPayment('${p.id}')">CONFIRMAR PAGO</button>`:active?'<span class="pill ok">ACTIVA</span>':'—'}</td></tr>`}).join('')||'<tr><td colspan="5">No hay clientes.</td></tr>';
  draw(d.clients);q.oninput=()=>{const v=q.value.toLowerCase();draw(d.clients.filter(x=>(x.full_name||'').toLowerCase().includes(v)||(x.email||'').toLowerCase().includes(v)))};
};
window.adminPayments=async function(c){
  c.innerHTML='<div class="card"><div class="ey">Admin</div><h2>Cargando pagos...</h2></div>';
  const d=await adminPaymentData();if(!d)return;
  const names=Object.fromEntries(d.clients.map(x=>[x.id,x.full_name]));
  c.innerHTML=`<div class="hero"><div class="ey">Admin</div><h2>Pagos.</h2><p class="muted">Los clientes pagan por WhatsApp. Tú confirmas aquí cuando el pago ya fue recibido.</p></div><div class="card"><div class="table-wrap"><table class="tbl"><thead><tr><th>Fecha</th><th>Cliente</th><th>Plan</th><th>Monto</th><th>Método</th><th>Estado</th><th></th></tr></thead><tbody>${d.payments.map(x=>`<tr><td>${esc(new Date(x.created_at).toLocaleDateString('es-MX'))}</td><td>${esc(names[x.profile_id]||x.profile_id)}</td><td>${esc(x.membership_plans?.name||'—')}</td><td>${money(x.amount)}</td><td>${esc(x.method||'WhatsApp')}</td><td><span class="pill ${x.status==='paid'?'ok':'warn'}">${x.status==='paid'?'PAGADO':'PENDIENTE'}</span></td><td>${x.status==='pending'?`<button class="btn red" onclick="confirmPayment('${x.id}')">CONFIRMAR</button>`:'<span class="pill ok">OK</span>'}</td></tr>`).join('')||'<tr><td colspan="7">No hay pagos registrados.</td></tr>'}</tbody></table></div></div>`;
};
window.clientMembership=function(c){
  const active=state.memberships.find(x=>x.status==='active'&&x.end_date>=today());
  const pending=state.memberships.find(x=>x.status==='pending');
  c.innerHTML=`<div class="hero"><div class="ey">Membresía</div><h2>Mi <span>plan.</span></h2></div><div class="grid grid2"><div class="card">${active?`<div class="ey">Actual</div><h2>${esc(active.membership_plans?.name||'Membresía')}</h2><p class="muted">${esc(active.start_date)} → ${esc(active.end_date)}</p><span class="pill ok">ACTIVA · PAGO CONFIRMADO</span>`:`<div class="ey">Estado</div><h2>${pending?'Solicitud pendiente.':'Sin membresía activa.'}</h2><p class="muted">${pending?'Tu solicitud está registrada. Completa el pago por WhatsApp y el administrador la activará.':'Elige un plan para comenzar.'}</p>`}</div><div class="card"><div class="ey">Planes disponibles</div><div class="list">${state.plans.map(p=>`<div class="item"><div><b>${esc(p.name)}</b><small>${esc(p.description||'')}</small></div><div style="display:grid;gap:8px;justify-items:end"><strong>${money(p.price)}</strong>${p.is_founder_plan?`<span class="pill warn">Solo con código fundador</span>`:`<button class="btn red" ${pending||active?'disabled':''} onclick="requestMembership('${p.id}')">${pending?'SOLICITUD PENDIENTE':active?'MEMBRESÍA ACTIVA':'ELEGIR PLAN'}</button>`}</div></div>`).join('')}</div></div></div>`;
};
})();
