(()=>{
'use strict';
const SB_URL='https://ponhllwbvhtczaphfdgw.supabase.co',SB_KEY='sb_publishable_okgoHkX2YZFtQ9P72ckztQ_jiCuWN-6';
const db=window.supabase.createClient(SB_URL,SB_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
const esc=v=>String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
const money=v=>'$'+Number(v||0).toLocaleString('es-MX',{maximumFractionDigits:0});
const today=()=>new Date().toISOString().slice(0,10);
const addDays=(d,n)=>{const x=new Date(d+'T12:00:00');x.setDate(x.getDate()+n);return x.toISOString().slice(0,10)};
const dateText=v=>v?new Date(v+'T12:00:00').toLocaleDateString('es-MX',{day:'2-digit',month:'short',year:'numeric'}):'—';
const $=id=>document.getElementById(id);
function styles(){if($('z33-fin-fix-css'))return;const s=document.createElement('style');s.id='z33-fin-fix-css';s.textContent=`
.z33-fin-modal{position:fixed;inset:0;background:rgba(18,20,24,.28);z-index:95;display:none}.z33-fin-modal.show{display:flex;justify-content:flex-end}.z33-fin-panel{width:min(540px,95vw);height:100%;background:#fff;padding:22px;overflow:auto;box-shadow:-20px 0 50px rgba(0,0,0,.15)}.z33-fin-form{display:grid;gap:11px;margin-top:16px}.z33-fin-form label{font-size:10px;font-weight:800;color:#626770}.z33-fin-form input,.z33-fin-form select,.z33-fin-form textarea{width:100%;margin-top:5px;padding:10px 11px;border:1px solid #dfe2e6;border-radius:9px;font-size:12px;background:#fff}.z33-fin-form textarea{min-height:80px}.z33-fin-two{display:grid;grid-template-columns:1fr 1fr;gap:9px}.z33-fin-btn{height:38px;border:1px solid #dde0e4;border-radius:9px;padding:0 13px;background:#fff;font-size:11px;font-weight:750;cursor:pointer}.z33-fin-btn.red{background:#d92932;border-color:#d92932;color:#fff}.z33-fin-error{padding:10px 12px;background:#fff3f2;color:#b42318;border:1px solid #f2c7c3;border-radius:9px;font-size:11px}.z33-fin-ok{padding:10px 12px;background:#eefaf4;color:#14764d;border:1px solid #c8ead9;border-radius:9px;font-size:11px}.z33-dash-fin{margin-top:14px;background:#fff;border:1px solid #e3e5e8;border-radius:14px;padding:16px}.z33-dash-fin-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.z33-dash-fin-card{border:1px solid #eceef1;border-radius:10px;padding:12px}.z33-dash-fin-card span{display:block;font-size:10px;color:#7d828b}.z33-dash-fin-card b{display:block;font-size:20px;margin-top:5px}@media(max-width:700px){.z33-fin-two,.z33-dash-fin-grid{grid-template-columns:1fr}}
`;document.head.appendChild(s)}
function modal(title,html){styles();let m=$('z33-fin-modal');if(!m){m=document.createElement('div');m.id='z33-fin-modal';m.className='z33-fin-modal';document.body.appendChild(m)}m.className='z33-fin-modal show';m.innerHTML=`<aside class="z33-fin-panel"><div style="display:flex;gap:10px;align-items:flex-start"><div><div style="font-size:9px;font-weight:850;letter-spacing:.13em;color:#d1252e">FINANZAS</div><h3 style="margin:4px 0 0;font-size:21px">${title}</h3></div><button class="z33-fin-btn" style="margin-left:auto" id="z33-fin-close">Cerrar</button></div>${html}</aside>`;$('z33-fin-close').onclick=()=>m.classList.remove('show');m.onclick=e=>{if(e.target===m)m.classList.remove('show')}}
async function paymentForm(){
  const [{data:clients=[],error:ce},{data:memberships=[],error:me},{data:plans=[],error:pe}]=await Promise.all([
    db.from('profiles').select('id,full_name,email,phone').eq('role','cliente').order('full_name'),
    db.from('memberships').select('id,profile_id,plan_id,start_date,end_date,status,membership_plans(name,price,duration_days)').order('end_date',{ascending:false}),
    db.from('membership_plans').select('id,name,price,duration_days').eq('is_active',true).order('price')
  ]);
  if(ce||me||pe){return alert((ce||me||pe)?.message||'No se pudieron cargar los datos de Finanzas')}
  modal('Registrar pago',`<form class="z33-fin-form" id="z33-fin-payment-form"><label>Cliente<select id="z33fp-client" required><option value="">Seleccionar...</option>${clients.map(c=>`<option value="${c.id}">${esc(c.full_name||c.email||'Cliente')}</option>`).join('')}</select></label><div class="z33-fin-two"><label>Fecha de pago<input id="z33fp-date" type="date" value="${today()}" required></label><label>Monto<input id="z33fp-amt" type="number" min="1" step="0.01" required></label></div><div class="z33-fin-two"><label>Método<select id="z33fp-method"><option value="efectivo">Efectivo</option><option value="tarjeta">Tarjeta</option><option value="transferencia">Transferencia</option><option value="ficha">Ficha</option><option value="online">Online</option></select></label><label>Estado<select id="z33fp-status"><option value="approved">Pagado</option><option value="pending">Pendiente</option><option value="partial">Pago parcial</option><option value="rejected">Rechazado</option></select></label></div><label>Concepto<input id="z33fp-concept" value="Membresía"></label><label>Notas<textarea id="z33fp-notes" placeholder="Notas opcionales"></textarea></label><div id="z33fp-msg"></div><button class="z33-fin-btn red" type="submit">Guardar pago</button></form>`);
  const form=$('z33-fin-payment-form');
  form.onsubmit=async e=>{
    e.preventDefault();
    const msg=$('z33fp-msg'); msg.innerHTML='';
    const profileId=$('z33fp-client').value, amount=Number($('z33fp-amt').value||0), status=$('z33fp-status').value;
    const mem=memberships.find(x=>x.profile_id===profileId);
    if(!profileId)return msg.innerHTML='<div class="z33-fin-error">Selecciona un cliente.</div>';
    if(amount<=0)return msg.innerHTML='<div class="z33-fin-error">El monto debe ser mayor a 0.</div>';
    const date=$('z33fp-date').value||today();
    const {data:rpc,error}=await db.rpc('admin_register_payment',{p_profile_id:profileId,p_membership_id:mem?.id||null,p_plan_id:mem?.plan_id||null,p_amount:amount,p_method:$('z33fp-method').value,p_status:status,p_concept:$('z33fp-concept').value.trim()||'Membresía',p_payment_date:date,p_notes:$('z33fp-notes').value.trim()||null});
    if(error){msg.innerHTML='<div class="z33-fin-error">'+esc(error.message||'No se pudo registrar el pago.')+'</div>';return}
    msg.innerHTML='<div class="z33-fin-ok">Pago registrado correctamente.</div>';
    setTimeout(()=>{$('z33-fin-modal')?.classList.remove('show');if(window.z33FinanceRender)window.z33FinanceRender()},450);
  };
}
async function dashboardFinance(){
  const root=$('zf-content');if(!root||root.querySelector('.z33-dash-fin'))return;
  const [{data:payments=[]},{data:memberships=[]},{data:clients=[]}]=await Promise.all([
    db.from('payments').select('amount,status,payment_date').order('payment_date',{ascending:false}),
    db.from('memberships').select('status,end_date'),
    db.from('profiles').select('id').eq('role','cliente')
  ]);
  const ym=today().slice(0,7), approvedMonth=payments.filter(p=>p.status==='approved'&&String(p.payment_date||'').slice(0,7)===ym), pending=payments.filter(p=>p.status==='pending'||p.status==='partial');
  const income=approvedMonth.reduce((a,p)=>a+Number(p.amount||0),0), pendingAmt=pending.reduce((a,p)=>a+Number(p.amount||0),0);
  const active=memberships.filter(m=>m.status==='active'&&String(m.end_date||'')>=today()).length;
  const box=document.createElement('section');box.className='z33-dash-fin';box.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:12px"><div><div style="font-size:10px;letter-spacing:.12em;text-transform:uppercase;font-weight:800;color:#d1252e">FINANZAS</div><h3 style="margin:4px 0 0;font-size:16px">Resumen financiero</h3></div><button class="zf-btn" id="z33-dash-fin-go">Ver Finanzas</button></div><div class="z33-dash-fin-grid"><div class="z33-dash-fin-card"><span>Ingresos del mes</span><b>${money(income)}</b></div><div class="z33-dash-fin-card"><span>Pagos pendientes</span><b>${money(pendingAmt)}</b></div><div class="z33-dash-fin-card"><span>Membresías activas</span><b>${active}</b></div></div>`;
  root.appendChild(box);$('z33-dash-fin-go').onclick=()=>{if(window.z33FinanceRender)window.z33FinanceRender()};
}
function capture(){document.addEventListener('click',e=>{const b=e.target.closest('#zff-pay,#zff-reg');if(!b)return;e.preventDefault();e.stopImmediatePropagation();paymentForm()},true)}
function observe(){styles();const run=()=>{const title=document.querySelector('.zf-title');if(title&&title.textContent.trim()==='Dashboard')dashboardFinance()};new MutationObserver(run).observe(document.body,{childList:true,subtree:true});setInterval(run,900);run()}
capture();observe();
})();