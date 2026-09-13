const SB_URL='https://ponhllwbvhtczaphfdgw.supabase.co';
const SB_KEY='sb_publishable_okgoHkX2YZFtQ9P72ckztQ_jiCuWN-6';
const sb=supabase.createClient(SB_URL,SB_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
window.__ZONA33_SB=sb; // cliente único de Supabase, compartido con admin.js
const app=document.querySelector('#app');
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const money=v=>'$'+Number(v||0).toLocaleString('es-MX');
const today=()=>new Date().toISOString().slice(0,10);
const dateText=v=>v?new Date(v+'T12:00:00').toLocaleDateString('es-MX',{weekday:'short',day:'numeric',month:'short'}):'—';
const addDays=(d,n)=>{const x=new Date(d+'T12:00:00');x.setDate(x.getDate()+n);return x.toISOString().slice(0,10)};
// Mismo cálculo de lunes-de-la-semana que usa admin.js (Agenda), para que
// "semana actual" signifique lo mismo en todo el sistema.
const weekMonday=(d)=>{const x=new Date(d+'T12:00:00');const w=x.getDay();x.setDate(x.getDate()+(w===0?-6:1-w));return x.toISOString().slice(0,10)};
const DOW=['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
// ---------------------------------------------------------------
// WhatsApp ("Elegir plan") — el número real vive en site_content.contact
// (misma fuente que ya usan el Landing público y Admin → Contacto; ver
// refresh() más abajo). Nunca se hardcodea otro número aquí.
// Normalización: solo dígitos, y se antepone "52" únicamente si el valor
// guardado no lo trae ya (nunca duplicar el código de país).
// ---------------------------------------------------------------
const digits=v=>String(v||'').replace(/[^0-9+]/g,'').replace(/^\+/,'');
function waNumber(raw){
  const d=digits(raw);
  if(!d)return'';
  return d.length===10?'52'+d:d;
}
function waLink(raw,message){
  const num=waNumber(raw);
  return num?`https://wa.me/${num}?text=${encodeURIComponent(message)}`:null;
}
// Hora local del dispositivo (nunca UTC) en formato "3:23 pm".
function nowLocalTimeLabel(){
  const d=new Date();
  let h=d.getHours();
  const m=String(d.getMinutes()).padStart(2,'0');
  const ap=h>=12?'pm':'am';
  h=h%12;if(h===0)h=12;
  return `${h}:${m} ${ap}`;
}
// Mensaje de WhatsApp: si hay sesión de cliente, usa sus datos reales
// (nombre, correo, hora local) + el nombre real del plan elegido
// (membership_plans.name — nunca hardcodeado, sirve para cualquier plan).
// Sin sesión (ej. desde el Landing sin login), mensaje genérico sin datos
// inventados.
function buildPlanMessage(planName){
  if(me&&profile){
    const first=(profile.full_name||me.email||'').split(' ')[0];
    return `Hola, soy ${first}.\n\nSon las ${nowLocalTimeLabel()} y mi correo es\n${profile.email||me.email}.\n\nQuiero realizar el pago de la membresía:\n${planName}.\n\n¿Me pueden compartir los datos para realizar el pago?`;
  }
  return `Hola, quiero información para contratar el ${planName}.`;
}
let me=null,profile=null,role='cliente';
// Este estado y router solo se usan para los roles "cliente" y "coach".
// El rol "admin" entrega el control por completo a admin.js (ver boot()).
const state={classes:[],reservations:[],memberships:[],payments:[],plans:[],coaches:[],contact:{},weekAnchor:weekMonday(today()),weekClasses:[],availability:{},currentPage:'overview',currentPageArg:null};
function toast(msg){const x=document.querySelector('#toast');x.textContent=msg;x.classList.add('show');clearTimeout(window.__toast);window.__toast=setTimeout(()=>x.classList.remove('show'),3500)}

// ---------------------------------------------------------------
// Membresía — una sola fuente de verdad: memberships + membership_plans
// reales del cliente. Mismo criterio exacto que usa el admin
// (latestMembershipByClient/membershipStatus en admin.js) para que
// "membresía actual" signifique lo mismo en todo el sistema: entre varias
// membresías, prioriza estado activo, luego la de vencimiento (end_date)
// más reciente, luego la más nueva por fecha de creación — nunca "la
// primera fila".
// ---------------------------------------------------------------
const PENDING_DAYS_SOON=7; // ventana "por vencer" — igual que en admin.js
function latestMembership(list){
  let best=null;
  for(const m of list){
    if(!best){best=m;continue}
    const prevScore=best.status==='active'?1:0,curScore=m.status==='active'?1:0;
    if(curScore!==prevScore){if(curScore>prevScore)best=m;continue}
    const prevEnd=best.end_date||'',curEnd=m.end_date||'';
    if(curEnd!==prevEnd){if(curEnd>prevEnd)best=m;continue}
    if((m.created_at||'')>(best.created_at||''))best=m;
  }
  return best;
}
// Estado de la MEMBRESÍA (memberships.status + end_date). Deliberadamente
// separado del estado del CLIENTE (profiles.is_active) — son dos conceptos
// distintos y no deben mezclarse (ver computeSlotState).
function membershipStatus(m){
  if(!m||m.status==='cancelled')return{key:'none',label:'Sin membresía',tone:'warn'};
  if(m.status!=='active'||(m.end_date||'')<today())return{key:'expired',label:'Vencida',tone:'bad'};
  const daysLeft=Math.ceil((new Date(m.end_date+'T12:00:00')-new Date(today()+'T12:00:00'))/86400000);
  if(daysLeft<=PENDING_DAYS_SOON)return{key:'soon',label:'Por vencer',tone:'warn'};
  return{key:'active',label:'Activa',tone:'ok'};
}
// days_until_expiry = end_date - hoy. Se calcula siempre en el momento
// (nunca se guarda "X días" en la base) para que el aviso avance solo.
function daysUntilExpiry(m){return m&&m.end_date?Math.ceil((new Date(m.end_date+'T12:00:00')-new Date(today()+'T12:00:00'))/86400000):null}
function expiryMessage(m){
  if(!m||m.status==='cancelled')return'';
  const d=daysUntilExpiry(m);
  if(d==null||d>PENDING_DAYS_SOON)return'';
  if(d<=0)return'Tu membresía ha vencido.';
  if(d===1)return'Tu membresía vence mañana.';
  return `Tu membresía vence en ${d} días.`;
}

// ---------------------------------------------------------------
// Contexto Landing → Login/Registro → Reserva: el landing manda
// "?class=<id>" (ya lo hace hoy, portalFor('class',id)); aquí solo falta
// leerlo y no perderlo mientras el visitante inicia sesión o se registra.
// sessionStorage se usa únicamente como contexto de navegación de esta
// visita — nunca como fuente de verdad de datos (eso sigue siendo
// exclusivamente Supabase).
// ---------------------------------------------------------------
function capturePendingClass(){
  const cid=new URLSearchParams(location.search).get('class');
  if(cid){sessionStorage.setItem('z33_pending_class',cid);history.replaceState(null,'',location.pathname)}
}
function peekPendingClass(){return sessionStorage.getItem('z33_pending_class')}
function consumePendingClass(){const c=peekPendingClass();if(c)sessionStorage.removeItem('z33_pending_class');return c}

function auth(message=''){app.innerHTML=`<section class="auth"><div class="auth-card"><a class="brand" href="/"><img src="./assets/zona33-logo-portal.webp" alt="ZONA 33"><strong>ZONA 33</strong></a><div class="ey">Functional Club</div><h1>Tu portal.</h1><p class="muted">Reservas, membresía, pagos y gestión de ZONA 33 en un solo lugar.</p>${message?`<div class="notice"><b>Importante:</b> ${esc(message)}</div><br>`:''}<div class="form"><div class="field"><label>Correo</label><input id="loginEmail" type="email" autocomplete="email"></div><div class="field"><label>Contraseña</label><input id="loginPassword" type="password" autocomplete="current-password"></div><button class="btn red" onclick="login()">Iniciar sesión</button><button class="btn out" onclick="registerView()">Crear cuenta</button><button class="btn out" onclick="forgotPassword()">Olvidé mi contraseña</button></div></div></section>`}
function registerView(){app.innerHTML=`<section class="auth"><div class="auth-card"><a class="brand" href="/"><img src="./assets/zona33-logo-portal.webp" alt="ZONA 33"><strong>ZONA 33</strong></a><div class="ey">Nuevo miembro</div><h1>Únete.</h1><p class="muted">Crea tu cuenta. Te enviaremos un correo de confirmación.</p><div class="form"><div class="row"><div class="field"><label>Nombre completo</label><input id="rName" autocomplete="name"></div><div class="field"><label>Teléfono</label><input id="rPhone" autocomplete="tel"></div></div><div class="field"><label>Fecha de nacimiento</label><input id="rBirth" type="date"></div><div class="field"><label>Correo</label><input id="rEmail" type="email" autocomplete="email"></div><div class="field"><label>Contraseña</label><input id="rPassword" type="password" minlength="8" autocomplete="new-password"></div><div class="field"><label>Código de fundadores <span style="color:#777">(opcional)</span></label><input id="rFounderCode" autocomplete="off" autocapitalize="characters" placeholder="Ej. Z33-FOUND-001"><small class="muted">Si tienes un código, lo aplicaremos a tu cuenta al confirmar tu correo.</small></div><button class="btn red" onclick="register()">Crear cuenta</button><button class="btn out" onclick="auth()">Volver</button></div></div></section>`}
async function login(){const email=loginEmail.value.trim().toLowerCase(),password=loginPassword.value;if(!email||!password)return toast('Completa correo y contraseña.');const {error}=await sb.auth.signInWithPassword({email,password});if(error)return toast(error.message);boot()}
async function register(){
  const full_name=rName.value.trim(),phone=rPhone.value.trim(),birth_date=rBirth.value,email=rEmail.value.trim().toLowerCase(),password=rPassword.value,founder_code=(document.querySelector('#rFounderCode')?.value||'').trim().toUpperCase();
  if(!full_name||!phone||!birth_date||!email||password.length<8)return toast('Completa todos los datos.');
  // Si venía de "Reservar" en el landing, el enlace de confirmación debe
  // regresar a esa misma clase aunque el correo se abra en otra pestaña
  // (sessionStorage no viaja entre pestañas; la URL sí).
  const pending=peekPendingClass();
  const redirectTo=pending?`${location.origin}${location.pathname}?class=${encodeURIComponent(pending)}`:location.href;
  const {data,error}=await sb.auth.signUp({email,password,options:{data:{full_name,phone,birth_date,role:'cliente',founder_code:founder_code||null,founder_code_redeemed:false},emailRedirectTo:redirectTo}});
  if(error)return toast(error.message);
  if(!data.session){auth(founder_code?'Cuenta creada. Confirma tu correo; al iniciar sesión aplicaremos tu código de fundadores.':'Cuenta creada. Revisa tu correo y confirma tu dirección antes de iniciar sesión.');return}
  boot()
}
async function forgotPassword(){const email=prompt('Correo de tu cuenta ZONA 33');if(!email)return;const {error}=await sb.auth.resetPasswordForEmail(email.trim().toLowerCase(),{redirectTo:location.href});toast(error?'No pudimos enviar el enlace.':'Revisa tu correo para restablecer la contraseña.')}
async function logout(){await sb.auth.signOut();auth()}
async function redeemFounderCode(user){const code=String(user?.user_metadata?.founder_code||'').trim().toUpperCase();if(!code||user?.user_metadata?.founder_code_redeemed)return false;const {error}=await sb.rpc('claim_founder_code',{p_code:code});if(error){toast('Tu cuenta se creó, pero no pudimos aplicar el código: '+error.message);return false}const {error:metadataError}=await sb.auth.updateUser({data:{...user.user_metadata,founder_code_redeemed:true}});if(metadataError)console.warn('No se pudo marcar el código como aplicado.',metadataError.message);toast('Código de fundadores aplicado. Tu Plan Fundadores está activo.');return true}
async function boot(){
  capturePendingClass();
  const {data:{user}}=await sb.auth.getUser();
  if(!user){auth();return}
  me=user;
  const {data:p,error}=await sb.from('profiles').select('*').eq('id',user.id).single();
  if(error||!p){auth('Tu cuenta existe, pero todavía no hay un perfil disponible.');return}
  profile=p;role=p.role||'cliente';
  const redeemed=await redeemFounderCode(user);
  if(redeemed){const {data:{user:updatedUser}}=await sb.auth.getUser();if(updatedUser)me=updatedUser}
  if(role==='admin'){
    // Única fuente de verdad del panel admin: admin.js toma el control
    // completo de la pantalla a partir de aquí.
    if(!window.ZONA33_ADMIN){auth('El panel administrativo no pudo cargarse. Recarga la página.');return}
    await window.ZONA33_ADMIN.start(me,profile);
    return;
  }
  await refresh();renderShell();
  const pending=role==='cliente'?consumePendingClass():null;
  if(pending)go('confirm',pending);else go('overview');
}
// Carga "siempre vigente" del cliente: sus propias reservas/membresías/
// pagos (dataset pequeño, ok cargarlo completo) + coaches/planes activos.
// Los horarios (classes) NO se cargan aquí — ver loadWeek(): solo se pide
// la semana que el cliente está viendo, nunca "todas las clases".
async function refresh(){
  const [r,m,p,plans,coaches,contact]=await Promise.all([
    sb.from('reservations').select('*,classes(class_date,start_time,class_type,capacity),coaches(name)').eq('profile_id',me.id).order('created_at',{ascending:false}),
    sb.from('memberships').select('*,membership_plans(name,price,is_founder_plan)').eq('profile_id',me.id).order('created_at',{ascending:false}),
    sb.from('payments').select('*,membership_plans(name)').eq('profile_id',me.id).order('created_at',{ascending:false}),
    sb.from('membership_plans').select('*').eq('is_active',true).order('sort_order'),
    sb.from('coaches').select('*').eq('is_active',true).order('name'),
    // Misma fuente que ya usan el Landing público y Admin → Contacto — solo
    // se lee, nunca se duplica ni se hardcodea un número aparte.
    sb.from('site_content').select('value').eq('key','contact').maybeSingle()
  ]);
  Object.assign(state,{reservations:r.data||[],memberships:m.data||[],payments:p.data||[],plans:plans.data||[],coaches:coaches.data||[],contact:contact.data?.value||{}});
  // Si estamos parados en Agenda (coach) refrescamos también sus clases.
  if(role==='coach'){const {data:c}=await sb.from('classes').select('*').eq('status','scheduled').gte('class_date',today()).order('class_date').order('start_time');state.classes=c||[]}
}
// Horarios de UNA semana (lunes→sábado), con disponibilidad real — misma
// tabla `classes` y misma RPC de disponibilidad que ya usa el landing
// público (get_public_class_availability). Nunca "todas las clases
// históricas": solo el rango visible.
async function loadWeek(anchor){
  const start=anchor,end=addDays(anchor,6);
  const [c,av]=await Promise.all([
    sb.from('classes').select('*').eq('status','scheduled').gte('class_date',start).lte('class_date',end).order('class_date').order('start_time'),
    sb.rpc('get_public_class_availability',{p_start_date:start,p_end_date:end})
  ]);
  state.weekClasses=c.data||[];
  state.availability=Object.fromEntries((av.data||[]).map(x=>[x.class_id,x]));
}
function nav(){if(role==='coach')return[['overview','Dashboard'],['agenda','Agenda'],['coachprofile','Mi perfil']];return[['overview','Dashboard'],['book','Reservar'],['reservations','Mis reservas'],['membership','Membresía'],['payments','Pagos'],['account','Mi perfil']]}
function renderShell(){app.innerHTML=`<div class="shell"><aside class="side"><a class="brand" href="/"><img src="./assets/zona33-logo-portal.webp" alt="ZONA 33"><strong>ZONA 33</strong></a><div class="role">${esc(role)} · portal</div><nav class="nav" id="nav">${nav().map(([k,v])=>`<button data-page="${k}">${v}</button>`).join('')}</nav><div class="sidefoot">ZONA 33 FUNCTIONAL CLUB<br>Portal operativo</div></aside><main class="main"><header class="top"><div><div class="ey">ZONA 33</div><h1 id="pageTitle">Dashboard</h1></div><div class="top-actions"><span class="pill ok">Conectado</span><button class="btn out" onclick="location.href='/'">Sitio</button><button class="btn danger" onclick="logout()">Salir</button></div></header><section class="content" id="content"></section><div class="mobilebar"><button class="btn red" onclick="go('overview')">Inicio</button><button class="btn" onclick="location.href='/'">Sitio</button><button class="btn danger" onclick="logout()">Salir</button></div></main><div id="clientDrawerOverlay" class="drawer-overlay" onclick="closeClientDrawer()"></div><aside id="clientDrawer" class="drawer"></aside></div>`;document.querySelectorAll('#nav button').forEach(b=>b.onclick=()=>go(b.dataset.page))}
const labels={overview:'Dashboard',book:'Reservar',confirm:'Confirmar reserva',reservations:'Mis reservas',membership:'Membresía',payments:'Pagos',account:'Mi perfil',agenda:'Agenda',coachprofile:'Mi perfil'};
function go(page,arg){
  state.currentPage=page;state.currentPageArg=arg;
  document.querySelector('#pageTitle').textContent=labels[page]||'Portal';
  document.querySelectorAll('#nav button').forEach(b=>b.classList.toggle('active',b.dataset.page===page));
  const c=document.querySelector('#content');
  if(page==='overview')return role==='coach'?coachHome(c):clientHome(c);
  if(page==='book')return bookWeek(c,state.weekAnchor);
  if(page==='confirm')return confirmClass(c,arg);
  if(page==='reservations')return clientReservations(c);
  if(page==='membership')return clientMembership(c);
  if(page==='payments')return clientPayments(c);
  if(page==='account')return clientAccount(c);
  if(page==='agenda')return coachAgenda(c);
  if(page==='coachprofile')return coachProfile(c);
}
function clientHome(c){
  const m=latestMembership(state.memberships),mStatus=membershipStatus(m),msg=expiryMessage(m);
  const upcoming=state.reservations.filter(x=>x.status==='reserved'&&x.classes&&(x.classes.class_date>today()||(x.classes.class_date===today()))).sort((a,b)=>(a.classes.class_date+String(a.classes.start_time)).localeCompare(b.classes.class_date+String(b.classes.start_time)));
  const nextOne=upcoming[0];
  c.innerHTML=`<div class="hero"><div class="ey">Bienvenida</div><h2>Hola, <span>${esc((profile.full_name||'Atleta').split(' ')[0])}.</span></h2><p class="muted">Tu entrenamiento, reservas y membresía en un solo lugar.</p></div>
    <div class="grid grid3">
      <div class="card stat"><small>Mi membresía</small><b>${esc(m?.membership_plans?.name||'Sin membresía')}</b><span class="pill ${mStatus.tone}">${esc(mStatus.label)}</span>${m?`<small class="muted">Vence: ${esc(dateText(m.end_date))}</small>`:''}${msg?`<span class="warn-text">${esc(msg)}</span>`:''}</div>
      <div class="card stat"><small>Próxima clase</small>${nextOne?`<b>${esc(dateText(nextOne.classes.class_date))}</b><small class="muted">${esc(String(nextOne.classes.start_time||'').slice(0,5))} · ${esc(nextOne.coaches?.name||'Coach Z33')}</small>`:`<b>—</b><small class="muted">Sin próximas clases</small>`}</div>
      <div class="card stat"><small>Mis reservas</small><b>${upcoming.length}</b><small class="muted">próximas</small></div>
    </div><br>
    <div class="card"><div class="ey">Entrenamiento</div><h2>Reserva tu próxima clase.</h2><p class="muted">Elige día y horario, como en una app de reservas.</p><button class="btn red" onclick="go('book')">Ver horarios</button></div>`;
}
// ---------------------------------------------------------------
// Horarios — vista tipo app de reservas: semana actual, agrupada por día
// (Lunes→Sábado), con navegación Anterior/Hoy/Siguiente. Misma tabla
// `classes` que usa Agenda del admin: si el admin cambia hora, fecha,
// coach, capacidad o estado, se ve aquí de inmediato (se recarga cada vez
// que se abre o se cambia de semana, sin caché).
// ---------------------------------------------------------------
async function bookWeek(c,anchor){
  state.weekAnchor=anchor;
  const end=addDays(anchor,5);
  c.innerHTML=`<div class="hero"><div class="ey">Horarios</div><h2>Elige tu <span>clase.</span></h2><p class="muted">${esc(dateText(anchor))} – ${esc(dateText(end))}</p></div>
    <div class="week-nav"><button class="btn out" id="wkPrev">‹ Anterior</button><button class="btn out" id="wkToday">Hoy</button><button class="btn out" id="wkNext">Siguiente ›</button></div>
    <div id="wkBody"><div class="empty">Cargando horarios…</div></div>`;
  document.querySelector('#wkPrev').onclick=()=>bookWeek(c,addDays(anchor,-7));
  document.querySelector('#wkToday').onclick=()=>bookWeek(c,weekMonday(today()));
  document.querySelector('#wkNext').onclick=()=>bookWeek(c,addDays(anchor,7));
  await loadWeek(anchor);
  renderWeekBody();
}
// Misma estructura visual que Agenda del admin (tabla con Hora/Duración/
// Clase/Coach/Ocupados-Cap./Estado, ver admin.js agendaDay()), adaptada al
// cliente: se agrega "Lugares" y el botón abre una ficha (drawer) en vez de
// navegar a otra pantalla. Los datos son exactamente los mismos que carga
// loadWeek() (misma tabla `classes` + misma RPC de disponibilidad) — no hay
// una segunda fuente ni un segundo calendario.
function renderWeekBody(){
  const body=document.querySelector('#wkBody');if(!body)return;
  const days=[0,1,2,3,4,5].map(i=>addDays(state.weekAnchor,i)); // Lunes..Sábado
  body.innerHTML=days.map(d=>{
    const rows=state.weekClasses.filter(x=>x.class_date===d);
    return `<div class="day-group"><div class="day-title">${esc(DOW[new Date(d+'T12:00:00').getDay()])} <small>${esc(dateText(d))}</small></div>${rows.length?`<div class="sched-table-wrap"><table class="sched-table"><thead><tr><th>Hora</th><th>Duración</th><th>Clase</th><th>Coach</th><th>Ocupados/Cap.</th><th>Lugares</th><th>Estado</th><th></th></tr></thead><tbody>${rows.map(x=>schedRowHtml(x)).join('')}</tbody></table></div>`:'<div class="empty">Sin clases este día.</div>'}</div>`;
  }).join('');
  document.querySelectorAll('[data-open-class]').forEach(b=>b.onclick=()=>openClassDetail(b.dataset.openClass));
}
function schedRowHtml(x){
  const st=computeSlotState(x);
  const av=state.availability[x.id];
  const capacity=Number(x.capacity||(av&&av.capacity)||0);
  const booked=av?Number(av.booked_count||0):0;
  const dur=x.duration_minutes||60;
  const coachName=(state.coaches.find(cc=>cc.id===x.coach_id)||{}).name||'Coach Z33';
  return `<tr>
    <td><b>${esc(String(x.start_time).slice(0,5))}</b></td>
    <td>${esc(String(dur))} min</td>
    <td>${esc(x.class_type||'Functional')}</td>
    <td>${esc(coachName)}</td>
    <td>${booked}/${capacity}</td>
    <td>${Math.max(capacity-booked,0)}</td>
    <td><span class="pill ${st.tone}">${esc(st.code==='mine'?'Reservado':st.label)}</span></td>
    <td><button class="btn out" data-open-class="${x.id}">Ver</button></td>
  </tr>`;
}
// Ficha/drawer de una clase — no navega fuera de Horarios (sección 15/16
// del pedido). Misma lógica de estado (computeSlotState) y misma función
// reserve() que ya validan las reglas en el backend; el drawer solo evita
// que el cliente tenga que salir de la vista de horarios para reservar.
function openClassDetail(classId){
  const x=state.weekClasses.find(c=>c.id===classId);if(!x)return;
  renderClassDetail(x);
  document.querySelector('#clientDrawerOverlay')?.classList.add('show');
  document.querySelector('#clientDrawer')?.classList.add('show');
}
function closeClientDrawer(){
  document.querySelector('#clientDrawerOverlay')?.classList.remove('show');
  document.querySelector('#clientDrawer')?.classList.remove('show');
}
function renderClassDetail(x){
  const drawer=document.querySelector('#clientDrawer');if(!drawer)return;
  const st=computeSlotState(x);
  const av=state.availability[x.id];
  const capacity=Number(x.capacity||(av&&av.capacity)||0);
  const booked=av?Number(av.booked_count||0):0;
  const dur=x.duration_minutes||60;
  const coachName=(state.coaches.find(cc=>cc.id===x.coach_id)||{}).name||'Coach Z33';
  const action=st.code==='nomembership'
    ?`<button class="btn red" onclick="closeClientDrawer();go('membership')">Ver planes</button>`
    :`<button class="btn ${st.disabled?'out':'red'}" ${st.disabled?'disabled':`onclick="reserveFromDrawer('${x.id}')"`}>${esc((st.code==='mine'?'RESERVADO':st.label).toUpperCase())}</button>`;
  drawer.innerHTML=`<div class="drawer-head"><h3>${esc(x.class_type||'Clase')}</h3><button class="btn out" onclick="closeClientDrawer()">Cerrar</button></div>
    <div class="list" style="margin-top:14px">
      <div class="item"><div><b>Fecha</b></div><span>${esc(dateText(x.class_date))}</span></div>
      <div class="item"><div><b>Hora</b></div><span>${esc(String(x.start_time).slice(0,5))}</span></div>
      <div class="item"><div><b>Duración</b></div><span>${esc(String(dur))} min</span></div>
      <div class="item"><div><b>Coach</b></div><span>${esc(coachName)}</span></div>
      <div class="item"><div><b>Lugares</b></div><span>${Math.max(capacity-booked,0)}/${capacity} disponibles</span></div>
      <div class="item"><div><b>Estado</b></div><span class="pill ${st.tone}">${esc(st.code==='mine'?'Reservado':st.label)}</span></div>
    </div>
    <div style="margin-top:16px">${action}</div>`;
}
async function reserveFromDrawer(id){
  await reserve(id); // reserve() ya valida en backend, refresca datos y renderiza Horarios
  const x=state.weekClasses.find(c=>c.id===id);
  if(x&&document.querySelector('#clientDrawer.show'))renderClassDetail(x); // deja el drawer abierto mostrando "Reservado"
}
// Prioridad de estados de una clase (idéntica al orden acordado):
// cancelada/no-programada → ya inició → llena → cierre 1h antes →
// membresía no válida → cliente inactivo → disponible. El backend
// (reserve_class) aplica exactamente las mismas reglas — esto es solo
// para pintar el botón correcto; nunca es la única barrera.
function computeSlotState(x){
  const mine=state.reservations.find(r=>r.class_id===x.id&&r.status==='reserved');
  if(mine)return{code:'mine',label:'Reservado',disabled:true,tone:'ok'};
  if(x.status!=='scheduled')return{code:'unavailable',label:'No disponible',disabled:true,tone:'bad'};
  const start=new Date(x.class_date+'T'+String(x.start_time).slice(0,8));
  const now=new Date();
  if(now>=start)return{code:'started',label:'No disponible',disabled:true,tone:'bad'};
  const av=state.availability[x.id];
  const capacity=Number(x.capacity||(av&&av.capacity)||0);
  const booked=av?Number(av.booked_count||0):0;
  if(capacity>0&&booked>=capacity)return{code:'full',label:'Clase llena',disabled:true,tone:'bad'};
  if(now>=new Date(start.getTime()-3600000))return{code:'closed',label:'Reserva cerrada',disabled:true,tone:'warn'};
  const mStatus=membershipStatus(latestMembership(state.memberships));
  if(mStatus.key!=='active'&&mStatus.key!=='soon')return{code:'nomembership',label:'Necesitas una membresía activa',disabled:false,tone:'warn'};
  if(profile.is_active===false)return{code:'inactive',label:'Cuenta inactiva',disabled:true,tone:'bad'};
  return{code:'available',label:'Reservar',disabled:false,tone:'ok'};
}
function classCardHtml(x){
  const st=computeSlotState(x);
  const av=state.availability[x.id];
  const capacity=Number(x.capacity||(av&&av.capacity)||0);
  const booked=av?Number(av.booked_count||0):0;
  const dur=x.duration_minutes||60;
  const coachName=(state.coaches.find(cc=>cc.id===x.coach_id)||{}).name||'Coach Z33';
  const action=st.code==='nomembership'
    ?`<div style="display:grid;gap:6px"><button class="btn out" disabled>${esc(st.label)}</button><button class="btn red" onclick="go('membership')">Ver planes</button></div>`
    :`<button class="btn ${st.disabled?'out':'red'}" ${st.disabled?'disabled':`onclick="reserve('${x.id}')"`}>${esc((st.code==='mine'?'RESERVADO':st.label).toUpperCase())}</button>`;
  return `<div class="class-card">
    <div class="class-card-main"><div class="class-time">${esc(String(x.start_time).slice(0,5))}</div><div class="class-info"><b>${esc(x.class_type||'Functional')}</b><small>${esc(String(dur))} min · Coach: ${esc(coachName)}</small></div></div>
    <div class="class-card-side"><span class="pill ${st.tone}">${esc(st.code==='mine'?'Reservado':st.code==='available'?`${Math.max(capacity-booked,0)}/${capacity} lugares`:st.label)}</span>${st.code!=='mine'&&st.code!=='available'?`<small class="muted">${booked}/${capacity} lugares</small>`:''}${action}</div>
  </div>`;
}
// Pantalla de confirmación tras Landing → Login/Registro → volver a la
// MISMA clase (sección 15/16 del pedido). Muestra únicamente esa clase,
// con el mismo botón/estado que en Horarios — sin que el visitante tenga
// que volver a buscarla.
async function confirmClass(c,classId){
  c.innerHTML=`<div class="hero"><div class="ey">Casi listo</div><h2>Confirma tu <span>clase.</span></h2><p class="muted">Volviste automáticamente a la clase que querías reservar.</p></div><div id="confirmBody"><div class="empty">Cargando clase…</div></div>`;
  const [{data:x},av]=await Promise.all([
    sb.from('classes').select('*').eq('id',classId).maybeSingle(),
    sb.rpc('get_public_class_availability',{p_start_date:today(),p_end_date:addDays(today(),180)})
  ]);
  const body=document.querySelector('#confirmBody');if(!body)return;
  if(!x){body.innerHTML='<div class="empty">Esa clase ya no está disponible.</div><br><button class="btn red" onclick="go(\'book\')">Ver horarios</button>';return}
  state.availability=Object.assign({},state.availability,Object.fromEntries((av.data||[]).map(y=>[y.class_id,y])));
  body.innerHTML=`<div class="card"><div class="ey">${esc(DOW[new Date(x.class_date+'T12:00:00').getDay()])} · ${esc(dateText(x.class_date))}</div>${classCardHtml(x)}</div><br><button class="btn out" onclick="go('book')">Ver todos los horarios</button>`;
}
function reserveErrorMessage(code){
  const map={
    AUTH_REQUIRED:'Inicia sesión para reservar.',
    CLASS_UNAVAILABLE:'Esta clase ya no está disponible.',
    CLASS_STARTED:'Esta clase ya inició.',
    CLASS_FULL:'Esta clase está llena.',
    BOOKING_CLOSED:'Las reservas de esta clase ya cerraron (1 hora antes del inicio).',
    ACTIVE_MEMBERSHIP_REQUIRED:'Necesitas una membresía activa para reservar.',
    ACCOUNT_INACTIVE:'Tu cuenta está inactiva. Contacta al equipo de ZONA 33.',
    ALREADY_RESERVED:'Ya tienes una reserva para esta clase.',
    COACH_NOT_AVAILABLE_FOR_MASTER_CLASS:'Ese coach no está disponible para esta clase.'
  };
  return map[code]||code;
}
async function reserve(id){
  // Validación visual (computeSlotState) + la real: reserve_class rechaza
  // en el backend cualquier intento que no cumpla membresía activa,
  // cliente activo, cupo, cierre de 1h o duplicado — nunca solo frontend.
  const {error}=await sb.rpc('reserve_class',{p_class_id:id});
  if(error)return toast(reserveErrorMessage(error.message));
  await refresh();
  if(state.currentPage==='book')await loadWeek(state.weekAnchor);
  toast('Reserva confirmada.');
  go(state.currentPage||'book',state.currentPageArg);
}
async function cancelReservation(id){
  // Se conserva la lógica actual tal cual: cualquier reserva propia con
  // status 'reserved' se puede cancelar en cualquier momento — no existe
  // hoy una regla de "hasta X horas antes" para cancelar (solo para
  // reservar, ver reserve_class). Si se quiere agregar una, es un cambio
  // aparte a decidir con el usuario.
  if(!confirm('¿Cancelar esta reserva?'))return;
  const {error}=await sb.from('reservations').update({status:'cancelled',cancelled_at:new Date().toISOString()}).eq('id',id).eq('profile_id',me.id);
  if(error)return toast(error.message);
  await refresh();
  if(state.weekClasses.length)await loadWeek(state.weekAnchor);
  toast('Reserva cancelada.');
  go('reservations');
}
function reservationStatusPill(s){
  const map={reserved:['ok','Reservada'],cancelled:['bad','Cancelada'],attended:['ok','Asistió'],no_show:['warn','No asistió']};
  const [tone,label]=map[s]||['warn',s];
  return `<span class="pill ${tone}">${esc(label)}</span>`;
}
function clientReservations(c){
  const rows=state.reservations.filter(x=>x.classes);
  c.innerHTML=`<div class="hero"><div class="ey">Cliente</div><h2>Mis <span>reservas.</span></h2></div><div class="card"><div class="list">${rows.length?rows.map(x=>`<div class="item"><div><b>${esc(x.classes?.class_type||'Functional')}</b><small>${esc(dateText(x.classes?.class_date))} · ${esc(String(x.classes?.start_time||'').slice(0,5))} · ${esc(x.coaches?.name||'Coach Z33')}</small></div><div class="actions" style="display:flex;align-items:center;gap:10px">${reservationStatusPill(x.status)}${x.status==='reserved'?`<button class="btn danger" onclick="cancelReservation('${x.id}')">Cancelar</button>`:''}</div></div>`).join(''):'<div class="empty">Aún no tienes reservas.</div>'}</div></div>`;
}
function clientMembership(c){
  const m=latestMembership(state.memberships),mStatus=membershipStatus(m),msg=expiryMessage(m);
  const pending=state.memberships.find(x=>x.status==='pending');
  c.innerHTML=`<div class="hero"><div class="ey">Membresía</div><h2>Mi <span>plan.</span></h2></div><div class="grid grid2">
    ${m?`<div class="card"><div class="ey">Plan</div><h2 style="margin-top:4px">${esc(m.membership_plans?.name||'Membresía')}</h2>
      <div class="list">
        <div class="item"><div><b>Estado</b></div><span class="pill ${mStatus.tone}">${esc(mStatus.label)}</span></div>
        <div class="item"><div><b>Inicio</b></div><span>${esc(dateText(m.start_date))}</span></div>
        <div class="item"><div><b>Vencimiento</b></div><span>${esc(dateText(m.end_date))}</span></div>
      </div>
      ${msg?`<div class="notice" style="margin-top:14px">${esc(msg)}</div>`:''}
    </div>`:`<div class="card"><h2>${pending?'Solicitud en revisión.':'Sin membresía activa.'}</h2><p class="muted">${pending?'Tu solicitud está pendiente de confirmación.':'Elige un plan para comenzar.'}</p></div>`}
    <div class="card"><div class="ey">Planes disponibles</div><div class="list">${state.plans.map(p=>`<div class="item"><div><b>${esc(p.name)}</b><small>${esc(p.description||'')}</small></div><div style="display:grid;gap:8px;justify-items:end"><strong>${money(p.price)}</strong>${p.is_founder_plan?`<span class="pill warn">Solo con código fundador</span>`:`<button class="btn red" onclick="chooseplanWhatsApp('${p.id}')">Elegir plan</button>`}</div></div>`).join('')}</div></div>
  </div>`;
}
// "Elegir plan" ya no abre un formulario de pago dentro del portal: abre
// WhatsApp con el número real de Contacto (state.contact.whatsapp, cargado
// en refresh() desde site_content — misma fuente que el Landing) y un
// mensaje con los datos reales del cliente + el nombre real del plan
// elegido (nunca hardcodeado; sirve igual para Plan Mensual, 6 meses,
// Fundadores, etc.).
function chooseplanWhatsApp(planId){
  const plan=state.plans.find(p=>p.id===planId);
  const message=buildPlanMessage(plan?.name||'Membresía');
  const link=waLink(state.contact?.whatsapp,message);
  if(!link)return toast('No pudimos obtener el número de WhatsApp de Contacto. Intenta más tarde.');
  window.open(link,'_blank','noopener');
}
function clientPayments(c){c.innerHTML=`<div class="hero"><div class="ey">Pagos</div><h2>Mi <span>historial.</span></h2></div><div class="card"><div class="list">${state.payments.length?state.payments.map(x=>`<div class="item"><div><b>${esc(x.membership_plans?.name||'Pago')}</b><small>${esc(new Date(x.created_at).toLocaleDateString('es-MX'))} · ${esc(x.method)}</small></div><div><strong>${money(x.amount)}</strong><span class="pill ${x.status==='approved'?'ok':'warn'}">${esc(x.status)}</span></div></div>`).join(''):'<div class="empty">Aún no hay pagos registrados.</div>'}</div></div>`}
function clientAccount(c){c.innerHTML=`<div class="hero"><div class="ey">Perfil</div><h2>Mi <span>cuenta.</span></h2></div><div class="card"><form class="form" onsubmit="saveAccount(event)"><div class="field"><label>Nombre completo</label><input id="accName" value="${esc(profile.full_name)}" required></div><div class="field"><label>Teléfono</label><input id="accPhone" value="${esc(profile.phone||'')}"></div><div class="field"><label>Fecha de nacimiento</label><input id="accBirth" type="date" value="${esc(profile.birth_date||'')}"></div><div class="field"><label>Correo</label><input value="${esc(profile.email||me.email)}" disabled></div><button class="btn red">Guardar cambios</button></form></div>`}
async function saveAccount(e){e.preventDefault();const {data,error}=await sb.from('profiles').update({full_name:accName.value,phone:accPhone.value,birth_date:accBirth.value,updated_at:new Date().toISOString()}).eq('id',me.id).select().single();if(error)return toast(error.message);profile=data;toast('Perfil actualizado.');go('account')}
function coachHome(c){c.innerHTML=`<div class="hero"><div class="ey">Coach</div><h2>Hola, <span>${esc((profile.full_name||'Coach').split(' ')[0])}.</span></h2></div><div class="grid grid3"><div class="card stat"><small>Clases próximas</small><b>${state.classes.length}</b></div><div class="card stat"><small>Hoy</small><b>${state.classes.filter(x=>x.class_date===today()).length}</b></div><div class="card stat"><small>Perfil</small><b>Activo</b></div></div><br><div class="card"><button class="btn red" onclick="go('agenda')">Ver agenda</button></div>`}
function coachAgenda(c){const mine=state.classes.filter(x=>x.coach_id===profile.id);c.innerHTML=`<div class="hero"><div class="ey">Agenda</div><h2>Mis <span>clases.</span></h2></div><div class="card"><div class="list">${mine.length?mine.map(x=>`<div class="item"><div><b>${esc(dateText(x.class_date))} · ${esc(String(x.start_time).slice(0,5))}</b><small>${esc(x.class_type)} · Cupo ${esc(x.capacity)}</small></div><span class="pill ${x.status==='scheduled'?'ok':'bad'}">${esc(x.status)}</span></div>`).join(''):'<div class="empty">No hay clases asignadas.</div>'}</div></div>`}
function coachProfile(c){c.innerHTML=`<div class="hero"><div class="ey">Coach</div><h2>Mi <span>perfil.</span></h2></div><div class="card"><form class="form" onsubmit="saveCoachProfile(event)"><div class="field"><label>Nombre</label><input id="cpName" value="${esc(profile.full_name)}" required></div><div class="field"><label>Correo</label><input value="${esc(profile.email||me.email)}" disabled></div><button class="btn red">Guardar</button></form></div>`}
async function saveCoachProfile(e){e.preventDefault();const {data,error}=await sb.from('profiles').update({full_name:cpName.value,updated_at:new Date().toISOString()}).eq('id',me.id).select().single();if(error)return toast(error.message);profile=data;toast('Perfil actualizado.')}
boot();
