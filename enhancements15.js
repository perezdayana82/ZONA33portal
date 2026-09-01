(()=>{
const SB_URL='https://ponhllwbvhtczaphfdgw.supabase.co';
const SB_KEY='sb_publishable_okgoHkX2YZFtQ9P72ckztQ_jiCuWN-6';
const api=supabase.createClient(SB_URL,SB_KEY,{auth:{persistSession:true,autoRefreshToken:true}});
const WA_NUMBER='522229195074';
const tx=m=>window.toast?window.toast(m):console.log(m);

window.requestMembership=async function(planId){
 const active=state.memberships.find(x=>x.status==='active'&&x.end_date>=today());
 const pending=state.memberships.find(x=>x.status==='pending');
 if(active)return tx('Ya tienes una membresía activa.');
 if(pending)return tx('Ya tienes una solicitud de membresía pendiente.');
 const plan=state.plans.find(x=>x.id===planId);
 const {error}=await api.rpc('request_membership',{p_plan_id:planId});
 if(error)return tx(error.message);
 await refresh();
 const text=encodeURIComponent(`Hola, quiero contratar el plan ${plan?.name||'de ZONA 33'} por ${money(plan?.price)}. Ya hice mi solicitud en el portal y quiero completar el pago.`);
 location.href=`https://wa.me/${WA_NUMBER}?text=${text}`;
};

window.confirmAdminPayment=async function(paymentId){
 if(!paymentId)return tx('No se encontró el pago.');
 if(!confirm('¿Confirmar que recibiste este pago? La membresía pasará a ACTIVA.'))return;
 const {error}=await api.rpc('admin_confirm_payment',{p_payment_id:paymentId,p_method:'Transferencia'});
 if(error)return tx(error.message);
 tx('Pago confirmado. Membresía activa.');
 await refresh();
 window.adminClients(document.querySelector('#content'));
};

window.adminClients=async function(c){
 const clients=state.clients||[];
 const ids=clients.map(x=>x.id);
 let memberships=[],payments=[];
 if(ids.length){
  const [mr,pr]=await Promise.all([
   api.from('memberships').select('id,profile_id,plan_id,status,start_date,end_date,membership_plans(name,price)').in('profile_id',ids).order('created_at',{ascending:false}),
   api.from('payments').select('id,profile_id,membership_id,amount,method,status,created_at').in('profile_id',ids).order('created_at',{ascending:false})
  ]);
  if(mr.error)return tx(mr.error.message);
  if(pr.error)return tx(pr.error.message);
  memberships=mr.data||[];payments=pr.data||[];
 }
 const info=id=>{
  const ms=memberships.filter(m=>m.profile_id===id);
  const active=ms.find(m=>m.status==='active'&&m.end_date>=today());
  const pending=ms.find(m=>m.status==='pending');
  const payment=pending?payments.find(p=>p.membership_id===pending.id&&p.status!=='paid'):null;
  return {active,pending,payment};
 };
 c.innerHTML=`<div class="hero"><div class="ey">Admin</div><h2>Clientes <span>${clients.length}</span></h2><p class="muted">Confirma manualmente los pagos recibidos para activar la membresía.</p></div><div class="card"><input id="q" placeholder="Buscar por nombre o correo" style="width:min(390px,100%);background:#080808;color:#fff;border:1px solid #333;border-radius:8px;padding:11px;margin-bottom:12px"><div class="table-wrap"><table class="tbl"><thead><tr><th>Nombre</th><th>Correo</th><th>Teléfono</th><th>Membresía</th><th>Pago</th></tr></thead><tbody id="clientBody"></tbody></table></div></div>`;
 const draw=rows=>clientBody.innerHTML=rows.map(x=>{
  const z=info(x.id);
  const membership=z.active?`<span class="pill ok">ACTIVA</span><small style="display:block;color:#888;margin-top:5px">${esc(z.active.membership_plans?.name||'Membresía')} · ${esc(z.active.end_date||'')}</small>`:z.pending?`<span class="pill warn">PENDIENTE</span><small style="display:block;color:#888;margin-top:5px">${esc(z.pending.membership_plans?.name||'Membresía')}</small>`:'<span class="pill bad">SIN MEMBRESÍA</span>';
  const payment=z.active?'<span class="pill ok">PAGADO</span>':z.pending?(z.payment?`<button class="btn red" onclick="confirmAdminPayment('${z.payment.id}')">CONFIRMAR PAGO</button>`:'<span class="pill warn">SIN PAGO</span>'):'—';
  return `<tr><td><b>${esc(x.full_name)}</b></td><td>${esc(x.email||'—')}</td><td>${esc(x.phone||'—')}</td><td>${membership}</td><td>${payment}</td></tr>`;
 }).join('');
 draw(clients);
 q.oninput=()=>{const v=q.value.toLowerCase();draw(clients.filter(x=>(x.full_name||'').toLowerCase().includes(v)||(x.email||'').toLowerCase().includes(v)))};
};

// El cliente solo consulta su historial; no se ofrece checkout de Mercado Pago.
window.clientPayments=function(c){
 c.innerHTML=`<div class="hero"><div class="ey">Pagos</div><h2>Mi <span>historial.</span></h2><p class="muted">Los pagos se realizan por fuera del portal y son confirmados por administración.</p></div><div class="card"><div class="list">${state.payments.length?state.payments.map(x=>`<div class="item"><div><b>${esc(x.membership_plans?.name||'Pago')}</b><small>${esc(new Date(x.created_at).toLocaleDateString('es-MX'))} · ${esc(x.method||'—')}</small></div><div><strong>${money(x.amount)}</strong><span class="pill ${x.status==='paid'?'ok':'warn'}">${esc(x.status==='paid'?'Pagado':'Pendiente')}</span></div></div>`).join(''):'<div class="empty">Aún no hay pagos registrados.</div>'}</div></div>`;
};
})();
