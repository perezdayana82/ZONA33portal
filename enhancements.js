(()=>{
  const SB_URL='https://ponhllwbvhtczaphfdgw.supabase.co';
  const SB_KEY='sb_publishable_okgoHkX2YZFtQ9P72ckztQ_jiCuWN-6';
  const api=supabase.createClient(SB_URL,SB_KEY,{auth:{persistSession:true,autoRefreshToken:true}});
  const escx=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const v=id=>document.querySelector('#'+id)?.value?.trim()||'';
  const isAdmin=()=>/admin/i.test(document.querySelector('.role')?.textContent||'');
  const loadXLSX=()=>new Promise((resolve,reject)=>{if(window.XLSX)return resolve(window.XLSX);const s=document.createElement('script');s.src='https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js';s.onload=()=>resolve(window.XLSX);s.onerror=reject;document.head.appendChild(s)});
  const monthRange=()=>{const d=new Date(),y=d.getFullYear(),m=d.getMonth();return {start:new Date(y,m,1),end:new Date(y,m+1,1),label:`${y}-${String(m+1).padStart(2,'0')}`}};

  function injectAdminTools(){
    if(!isAdmin())return;
    const nav=document.querySelector('#nav');if(!nav)return;
    if(!nav.querySelector('[data-page="reports"]')){const b=document.createElement('button');b.dataset.page='reports';b.textContent='Reportes';b.onclick=()=>window.go('reports');nav.appendChild(b)}
    if(!nav.querySelector('[data-page="settings"]')){const b=document.createElement('button');b.dataset.page='settings';b.textContent='Configuración';b.onclick=()=>window.go('settings');nav.appendChild(b)}
  }
  new MutationObserver(injectAdminTools).observe(document.body,{childList:true,subtree:true});
  setTimeout(injectAdminTools,300);

  const oldAdminCoaches=window.adminCoaches;
  window.adminCoaches=async function(c){
    const {data:rows,error}=await api.from('coaches').select('*').order('name');
    if(error){c.innerHTML=`<div class="empty">No se pudieron cargar los coaches.</div>`;return}
    c.innerHTML=`<div class="hero"><div class="ey">Admin</div><h2>Coaches.</h2><button class="btn red" onclick="coachForm()">Agregar coach</button></div><div class="grid grid2">${(rows||[]).map(x=>`<div class="card"><div style="display:flex;gap:14px;align-items:center"><div style="width:74px;height:74px;border-radius:50%;overflow:hidden;background:#111">${x.photo_url?`<img class="image" style="width:74px;height:74px;border:0" src="${escx(x.photo_url)}" alt="">`:''}</div><div style="flex:1"><h2>${escx(x.name)}</h2><div class="muted">${escx(x.specialty||'Coach')}</div><div class="tiny">${escx(x.bio||'')}</div><div class="actions" style="margin-top:12px"><span class="pill ${x.is_active!==false?'ok':'bad'}">${x.is_active!==false?'Activo':'Inactivo'}</span><button class="btn out" onclick="editCoachForm('${x.id}')">Editar</button></div></div></div></div>`).join('')||'<div class="empty">No hay coaches registrados.</div>'}</div>`;
  };

  window.editCoachForm=function(id){
    api.from('coaches').select('*').eq('id',id).single().then(({data:x,error})=>{
      if(error||!x)return toast('No se pudo cargar el coach.');
      modal('Editar coach',`<form class="form" onsubmit="saveCoachEdit(event,'${id}')"><div class="row"><div class="field"><label>Nombre</label><input id="ecname" value="${escx(x.name)}" required></div><div class="field"><label>Especialidad</label><input id="ecspec" value="${escx(x.specialty||'')}"></div></div><div class="field"><label>Bio</label><textarea id="ecbio">${escx(x.bio||'')}</textarea></div><div class="field"><label>Foto URL</label><input id="ecphoto" value="${escx(x.photo_url||'')}" placeholder="https://..."></div><div class="field"><label>Estado</label><select id="ecactive"><option value="true" ${x.is_active!==false?'selected':''}>Activo</option><option value="false" ${x.is_active===false?'selected':''}>Inactivo</option></select></div><button class="btn red">Guardar cambios</button></form>`);
    });
  };
  window.saveCoachEdit=async function(e,id){e.preventDefault();const payload={name:v('ecname'),specialty:v('ecspec')||null,bio:v('ecbio')||null,photo_url:v('ecphoto')||null,is_active:v('ecactive')==='true'};const {error}=await api.from('coaches').update(payload).eq('id',id);if(error)return toast(error.message);closeModal();toast('Coach actualizado.');window.go('coaches')};

  window.adminReports=async function(c){
    const {label}=monthRange();
    c.innerHTML=`<div class="hero"><div class="ey">Administración</div><h2>Reporte <span>mensual.</span></h2><p class="muted">Descarga la operación del mes en Excel con hojas separadas.</p></div><div class="card"><div class="grid grid2"><div><div class="ey">Periodo</div><h2>${label}</h2><p class="muted">Clientes, membresías, pagos, clases y reservas.</p></div><div style="display:flex;align-items:center;justify-content:flex-end"><button class="btn red" onclick="exportMonthlyExcel()">Descargar Excel</button></div></div></div>`;
  };
  window.exportMonthlyExcel=async function(){
    try{toast('Preparando Excel…');const XLSX=await loadXLSX();const {start,end,label}=monthRange();const sd=start.toISOString().slice(0,10),ed=end.toISOString().slice(0,10);
      const qs=await Promise.all([
        api.from('profiles').select('*').eq('role','cliente').order('created_at'),
        api.from('memberships').select('*,membership_plans(name,price,is_founder_plan)').order('created_at'),
        api.from('payments').select('*,membership_plans(name)').order('created_at'),
        api.from('classes').select('*,coaches(name)').gte('class_date',sd).lt('class_date',ed).order('class_date').order('start_time'),
        api.from('reservations').select('*,classes(class_date,start_time,end_time,class_type),coaches(name),profiles(full_name,email)').order('created_at')
      ]);
      const [a,b,c,d,e]=qs;const bad=[a,b,c,d,e].find(x=>x.error);if(bad)throw bad.error;
      const inRange=(x,fields)=>fields.some(f=>{const val=x?.[f];if(!val)return false;const dt=new Date(val);return !Number.isNaN(dt.valueOf())&&dt>=start&&dt<end});
      const sheet=(rows)=>XLSX.utils.json_to_sheet(rows.length?rows:[{Mensaje:'Sin registros para este mes'}]);
      const wb=XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb,sheet((a.data||[]).filter(x=>inRange(x,['created_at'])).map(x=>({Nombre:x.full_name||'',Email:x.email||'',Telefono:x.phone||'',Fecha_nacimiento:x.birth_date||'',Activo:x.is_active?'Sí':'No',Creado:x.created_at||''}))),'Clientes');
      XLSX.utils.book_append_sheet(wb,sheet((b.data||[]).filter(x=>inRange(x,['created_at','start_date'])).map(x=>({Cliente:x.profile_id||'',Plan:x.membership_plans?.name||'',Precio:x.membership_plans?.price||'',Estado:x.status||'',Inicio:x.start_date||'',Fin:x.end_date||'',Fundador:x.membership_plans?.is_founder_plan?'Sí':'No'}))),'Membresias');
      XLSX.utils.book_append_sheet(wb,sheet((c.data||[]).filter(x=>inRange(x,['created_at','paid_at','payment_date'])).map(x=>({Cliente:x.profile_id||'',Plan:x.membership_plans?.name||'',Monto:x.amount??x.total??x.price??'',Estado:x.status||'',Metodo:x.method??x.payment_method??'',Fecha:x.paid_at||x.payment_date||x.created_at||''}))),'Pagos');
      XLSX.utils.book_append_sheet(wb,sheet((d.data||[]).map(x=>({Fecha:x.class_date||'',Hora:String(x.start_time||'').slice(0,5),Fin:String(x.end_time||'').slice(0,5),Clase:x.class_type||'',Coach:x.coaches?.name||'',Cupo:x.capacity??'',Estado:x.status||''}))),'Clases');
      XLSX.utils.book_append_sheet(wb,sheet((e.data||[]).filter(x=>{const d=x.classes?.class_date;return d>=sd&&d<ed}).map(x=>({Cliente:x.profiles?.full_name||x.profile_id||'',Email:x.profiles?.email||'',Fecha:x.classes?.class_date||'',Hora:String(x.classes?.start_time||'').slice(0,5),Clase:x.classes?.class_type||'',Coach:x.coaches?.name||'',Estado:x.status||'',Creada:x.created_at||''}))),'Reservas');
      XLSX.writeFile(wb,`ZONA33_reporte_${label}.xlsx`);toast('Excel descargado.');
    }catch(err){toast('No se pudo generar el Excel: '+(err?.message||err))}
  };

  window.adminSettings=function(c){
    api.auth.getUser().then(({data:{user}})=>{const email=user?.email||'';c.innerHTML=`<div class="hero"><div class="ey">Seguridad</div><h2>Configuración.</h2><p class="muted">Ajustes de la cuenta administrativa.</p></div><div class="grid grid2"><div class="card"><div class="ey">Cuenta</div><h2>Correo del administrador</h2><p class="muted">Actual: <strong>${escx(email)}</strong></p><form class="form" onsubmit="changeAdminEmail(event)"><div class="field"><label>Nuevo correo</label><input id="newAdminEmail" type="email" required autocomplete="email"></div><button class="btn red">Cambiar correo</button></form><div class="notice" style="margin-top:12px">El correo nuevo puede requerir confirmación por email antes de quedar activo.</div></div><div class="card"><div class="ey">Seguridad</div><h2>Contraseña</h2><p class="muted">El acceso administrativo sigue protegido por Supabase Auth y el rol admin.</p><button class="btn out" onclick="forgotPassword()">Cambiar contraseña por correo</button></div></div>`});
  };
  window.changeAdminEmail=async function(e){e.preventDefault();const email=v('newAdminEmail').toLowerCase();if(!email)return;const {data,error}=await api.auth.updateUser({email});if(error)return toast(error.message);toast(data?.user?.email_confirmed_at?'Correo actualizado.':'Revisa el correo nuevo para confirmar el cambio.')};

  const oldGo=window.go;
  window.go=function(page){if(page==='reports'||page==='settings'){document.querySelector('#pageTitle').textContent=page==='reports'?'Reportes':'Configuración';document.querySelectorAll('#nav button').forEach(b=>b.classList.toggle('active',b.dataset.page===page));const c=document.querySelector('#content');return page==='reports'?adminReports(c):adminSettings(c)}return oldGo(page)};
})();
