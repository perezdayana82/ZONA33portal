(()=>{
'use strict';
const U='https://ponhllwbvhtczaphfdgw.supabase.co',K='sb_publishable_okgoHkX2YZFtQ9P72ckztQ_jiCuWN-6',api=supabase.createClient(U,K,{auth:{persistSession:true,autoRefreshToken:true}});
const esc=v=>String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[c]));
const val=id=>document.querySelector('#'+id)?.value?.trim()||'';
const toastx=m=>window.toast?window.toast(m):alert(m);
const modalx=(t,h)=>window.modal?window.modal(t,h):null;
const today=()=>new Date().toISOString().slice(0,10);
const money=v=>'$'+Number(v||0).toLocaleString('es-MX');
const activeAdmin=()=>/admin/i.test(document.querySelector('.role')?.textContent||'');

/* ---------- Robust monthly calendar: no ambiguous PostgREST relationship ---------- */
async function loadCalendar(){
  const c=document.querySelector('#content'); if(!c)return;
  let month=new Date(new Date().getFullYear(),new Date().getMonth(),1);
  let selected=today();
  const fmtMonth=d=>new Intl.DateTimeFormat('es-MX',{month:'long',year:'numeric'}).format(d);
  const fmtDate=s=>new Intl.DateTimeFormat('es-MX',{weekday:'long',day:'numeric',month:'long'}).format(new Date(s+'T12:00:00'));
  const key=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
  async function data(){
    const start=key(month)+'-01';
    const end=new Date(month.getFullYear(),month.getMonth()+1,0).toISOString().slice(0,10);
    const [{data:classes,error:ce},{data:coaches,error:oe}]=await Promise.all([
      api.from('classes').select('*').gte('class_date',start).lte('class_date',end).order('class_date').order('start_time'),
      api.from('coaches').select('*').eq('is_active',true).order('name')
    ]);
    if(ce)throw ce;if(oe)throw oe;
    const byCoach=Object.fromEntries((coaches||[]).map(x=>[x.id,x]));
    return {classes:(classes||[]).map(x=>({...x,coach:byCoach[x.coach_id]||null}))};
  }
  function cells(){
    const first=new Date(month.getFullYear(),month.getMonth(),1), offset=(first.getDay()+6)%7, days=new Date(month.getFullYear(),month.getMonth()+1,0).getDate();
    const out=Array(offset).fill(null); for(let i=1;i<=days;i++)out.push(new Date(month.getFullYear(),month.getMonth(),i)); while(out.length%7)out.push(null); return out;
  }
  async function render(){
    try{
      const {classes}=await data(); const by={}; classes.forEach(x=>(by[x.class_date]??=[]).push(x));
      if(selected.slice(0,7)!==key(month))selected=key(month)+'-01';
      c.innerHTML=`<div class='hero'><div class='ey'>Agenda mensual</div><h2>Horarios de <span>${esc(fmtMonth(month))}.</span></h2><p class='muted'>Este calendario es la fuente de verdad de los horarios públicos del landing.</p></div><div class='calendar-shell'><div class='calendar-toolbar'><button class='btn out' id='z7today'>Hoy</button><div class='calendar-nav'><button class='btn out' id='z7prev'>←</button><strong>${esc(fmtMonth(month))}</strong><button class='btn out' id='z7next'>→</button></div><button class='btn red' id='z7new'>+ Nueva clase</button></div><div class='calendar-week'>${['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map(x=>`<div>${x}</div>`).join('')}</div><div class='calendar-grid'>${cells().map(d=>!d?`<div class='calendar-day blank'></div>`:(()=>{const k=d.toISOString().slice(0,10),its=by[k]||[];return `<button class='calendar-day ${k===selected?'selected':''} ${k===today()?'today':''}' data-day='${k}'><span class='num'>${d.getDate()}</span><span class='count'>${its.length?its.length+' clases':''}</span><span class='dots'>${its.slice(0,4).map(x=>`<i class='${x.status==='scheduled'?'live':'off'}'></i>`).join('')}</span></button>`})()).join('')}</div></div><br><div class='card'><div class='ey'>${esc(fmtDate(selected))}</div><div class='list'>${(by[selected]||[]).map(x=>`<div class='item'><div><b>${esc(String(x.start_time||'').slice(0,5))} · ${esc(x.class_type)}</b><small>${esc(x.coach?.name||'Sin coach')} · ${x.capacity} spots · ${esc(x.status)}</small></div><div class='actions'><button class='btn out' data-edit='${x.id}'>Editar</button>${x.status==='scheduled'?`<button class='btn danger' data-cancel='${x.id}'>Cancelar</button>`:''}</div></div>`).join('')||'<div class="empty">No hay clases este día.</div>'}</div></div>`;
      c.querySelector('#z7today').onclick=()=>{month=new Date(new Date().getFullYear(),new Date().getMonth(),1);selected=today();render()};
      c.querySelector('#z7prev').onclick=()=>{month=new Date(month.getFullYear(),month.getMonth()-1,1);selected=key(month)+'-01';render()};
      c.querySelector('#z7next').onclick=()=>{month=new Date(month.getFullYear(),month.getMonth()+1,1);selected=key(month)+'-01';render()};
      c.querySelector('#z7new').onclick=()=>classForm();
      c.querySelectorAll('[data-day]').forEach(b=>b.onclick=()=>{selected=b.dataset.day;render()});
      c.querySelectorAll('[data-edit]').forEach(b=>b.onclick=async()=>{const row=classes.find(x=>x.id===b.dataset.edit);if(row)classForm(row)});
      c.querySelectorAll('[data-cancel]').forEach(b=>b.onclick=async()=>{if(!confirm('¿Cancelar esta clase?'))return;const r=await api.from('classes').update({status:'cancelled',updated_at:new Date().toISOString()}).eq('id',b.dataset.cancel);if(r.error)return toastx(r.error.message);toastx('Clase cancelada.');render()});
    }catch(e){c.innerHTML=`<div class='empty'>No se pudo cargar el calendario: ${esc(e.message)}</div>`}
  }
  async function classForm(x){
    const {data:coaches,error}=await api.from('coaches').select('*').eq('is_active',true).order('name');
    if(error)return toastx('No se pudieron cargar los coaches: '+error.message);
    const start=x?.start_time?.slice(0,5)||'05:30'; const end=x?.end_time?.slice(0,5)||`${String((Number(start.slice(0,2))+1)%24).padStart(2,'0')}:${start.slice(3)}`;
    modalx(x?'Editar clase':'Nueva clase',`<div class='form'><div class='row'><div class='field'><label>Fecha</label><input id='z7date' type='date' value='${x?.class_date||selected}'></div><div class='field'><label>Tipo</label><input id='z7type' value='${esc(x?.class_type||'Functional')}'></div></div><div class='row'><div class='field'><label>Inicio</label><input id='z7start' type='time' value='${start}'></div><div class='field'><label>Fin</label><input id='z7end' type='time' value='${end}'></div></div><div class='row'><div class='field'><label>Coach</label><select id='z7coach'><option value=''>Sin coach</option>${(coaches||[]).map(q=>`<option value='${q.id}' ${x?.coach_id===q.id?'selected':''}>${esc(q.name)}</option>`).join('')}</select></div><div class='field'><label>Cupo</label><input id='z7cap' type='number' min='1' value='${x?.capacity??10}'></div></div><button class='btn red' id='z7save'>Guardar</button></div>`);
    document.querySelector('#z7save').onclick=async()=>{const p={class_date:val('z7date'),start_time:val('z7start'),end_time:val('z7end'),class_type:val('z7type')||'Functional',coach_id:document.querySelector('#z7coach').value||null,capacity:Number(document.querySelector('#z7cap').value||10),min_attendees:1,is_master_class:false,status:x?.status==='cancelled'?'scheduled':'scheduled',updated_at:new Date().toISOString()};const r=x?await api.from('classes').update(p).eq('id',x.id):await api.from('classes').insert(p);if(r.error)return toastx(r.error.message);closeModal();toastx('Clase guardada.');render()};
  }
  window.z33AdminCalendar=render; render();
}

/* ---------- Leaderboard CRUD ---------- */
window.adminLeaderboard=async function(c){
  const {data,error}=await api.from('leaderboard_entries').select('*').order('position').order('created_at');
  if(error){c.innerHTML=`<div class='empty'>No se pudo cargar el leaderboard: ${esc(error.message)}</div>`;return}
  c.innerHTML=`<div class='hero'><div class='ey'>Resultados</div><h2>Leaderboard <span>real.</span></h2><p class='muted'>Estos son los resultados que se publican en el landing.</p><button class='btn red' id='z7lbnew'>+ Nuevo resultado</button></div><div class='grid grid2'>${(data||[]).map(x=>`<div class='card'><div class='ey'>#${x.position||'—'} · ${x.is_published?'PUBLICADO':'OCULTO'}</div><h2>${esc(x.athlete_name)}</h2><div class='muted'>${esc(x.category||'')} · ${esc(x.wod_name||'')}</div><p><strong>${esc(x.score||'')}</strong></p><div class='actions'><button class='btn out' data-lb-edit='${x.id}'>Editar</button><button class='btn danger' data-lb-del='${x.id}'>Eliminar</button></div></div>`).join('')||'<div class="empty">No hay resultados.</div>'}</div>`;
  c.querySelector('#z7lbnew').onclick=()=>lbForm();
  c.querySelectorAll('[data-lb-edit]').forEach(b=>b.onclick=async()=>{const x=(data||[]).find(v=>v.id===b.dataset.lbEdit);if(x)lbForm(x)});
  c.querySelectorAll('[data-lb-del]').forEach(b=>b.onclick=async()=>{if(!confirm('¿Eliminar este resultado?'))return;const r=await api.from('leaderboard_entries').delete().eq('id',b.dataset.lbDel);if(r.error)return toastx(r.error.message);toastx('Resultado eliminado.');window.go('leaderboard')});
};
function lbForm(x){modalx(x?'Editar resultado':'Nuevo resultado',`<div class='form'><div class='field'><label>Atleta</label><input id='z7lbname' value='${esc(x?.athlete_name||'')}'></div><div class='row'><div class='field'><label>Categoría</label><input id='z7lbcat' value='${esc(x?.category||'')} placeholder='RX / Scaled / Mujeres'></div><div class='field'><label>Posición</label><input id='z7lbpos' type='number' min='1' value='${x?.position||1}'></div></div><div class='row'><div class='field'><label>WOD</label><input id='z7lbwod' value='${esc(x?.wod_name||'')}'></div><div class='field'><label>Score</label><input id='z7lbscore' value='${esc(x?.score||'')}' placeholder='12:34 / 185 kg'></div></div><div class='field'><label>Publicar</label><select id='z7lbpub'><option value='true' ${x?.is_published!==false?'selected':''}>Sí</option><option value='false' ${x?.is_published===false?'selected':''}>No</option></select></div><button class='btn red' id='z7lbsave'>Guardar</button></div>`);document.querySelector('#z7lbsave').onclick=async()=>{const p={athlete_name:val('z7lbname'),category:val('z7lbcat')||null,position:Number(val('z7lbpos')||1),wod_name:val('z7lbwod')||null,score:val('z7lbscore')||null,is_published:val('z7lbpub')==='true',updated_at:new Date().toISOString()};const r=x?await api.from('leaderboard_entries').update(p).eq('id',x.id):await api.from('leaderboard_entries').insert(p);if(r.error)return toastx(r.error.message);closeModal();toastx('Resultado guardado.');window.go('leaderboard')};

/* ---------- Community notices ---------- */
window.adminCommunity=async function(c){
  const [{data:posts, error:pe},{data:ann, error:ae}]=await Promise.all([
    api.from('community_posts').select('*').order('published_at',{ascending:false}),
    api.from('announcements').select('*').order('published_at',{ascending:false})
  ]);
  if(pe||ae){c.innerHTML=`<div class='empty'>No se pudo cargar comunidad: ${esc((pe||ae).message)}</div>`;return}
  c.innerHTML=`<div class='hero'><div class='ey'>Comunidad</div><h2>Avisos <span>en vivo.</span></h2><p class='muted'>Los avisos activos aparecen públicamente en la sección Comunidad del landing.</p><button class='btn red' id='z7annnew'>+ Publicar aviso</button></div><div class='card'><div class='ey'>Avisos publicados</div><div class='list'>${(ann||[]).map(x=>`<div class='item'><div><b>${esc(x.title)}</b><small>${esc(x.body)} · ${new Date(x.published_at).toLocaleString('es-MX')} ${x.expires_at?'· vence '+new Date(x.expires_at).toLocaleDateString('es-MX'):''}</small></div><div class='actions'><span class='pill ${x.is_active?'ok':'bad'}'>${x.is_active?'Activo':'Oculto'}</span><button class='btn out' data-ann-edit='${x.id}'>Editar</button>${x.is_active?`<button class='btn danger' data-ann-hide='${x.id}'>Ocultar</button>`:`<button class='btn out' data-ann-show='${x.id}'>Publicar</button>`}</div></div>`).join('')||'<div class="empty">Todavía no hay avisos.</div>'}</div></div><br><div class='card'><div class='ey'>Publicaciones de comunidad</div><div class='list'>${(posts||[]).map(x=>`<div class='item'><div><b>${esc(x.title)}</b><small>${esc(x.body)}</small></div><span class='pill ${x.is_active?'ok':'bad'}'>${x.is_active?'Activo':'Oculto'}</span></div>`).join('')||'<div class="empty">No hay publicaciones de comunidad.</div>'}</div></div>`;
  c.querySelector('#z7annnew').onclick=()=>annForm();
  c.querySelectorAll('[data-ann-edit]').forEach(b=>b.onclick=async()=>{const x=(ann||[]).find(v=>v.id===b.dataset.annEdit);if(x)annForm(x)});
  c.querySelectorAll('[data-ann-hide]').forEach(b=>b.onclick=()=>annToggle(b.dataset.annHide,false));
  c.querySelectorAll('[data-ann-show]').forEach(b=>b.onclick=()=>annToggle(b.dataset.annShow,true));
};
async function annToggle(id,on){const r=await api.from('announcements').update({is_active:on,updated_at:new Date().toISOString()}).eq('id',id);if(r.error)return toastx(r.error.message);toastx(on?'Aviso publicado.':'Aviso ocultado.');window.go('community')}
function annForm(x){modalx(x?'Editar aviso':'Publicar aviso',`<div class='form'><div class='field'><label>Título</label><input id='z7antitle' value='${esc(x?.title||'')}' placeholder='Aviso importante'></div><div class='field'><label>Mensaje</label><textarea id='z7anbody'>${esc(x?.body||'')}</textarea></div><div class='field'><label>Caducidad (opcional)</label><input id='z7anexp' type='datetime-local' value='${x?.expires_at?new Date(x.expires_at).toISOString().slice(0,16):''}'></div><button class='btn red' id='z7ansave'>${x?'Guardar cambios':'Publicar'}</button></div>`);document.querySelector('#z7ansave').onclick=async()=>{const user=(await api.auth.getUser()).data.user;const p={title:val('z7antitle'),body:val('z7anbody'),published_by:user?.id||null,published_at:x?.published_at||new Date().toISOString(),expires_at:val('z7anexp')?new Date(val('z7anexp')).toISOString():null,is_active:true,updated_at:new Date().toISOString()};const r=x?await api.from('announcements').update(p).eq('id',x.id):await api.from('announcements').insert(p);if(r.error)return toastx(r.error.message);closeModal();toastx('Aviso publicado.');window.go('community')};

/* ---------- Instagram: 3 latest managed posts ---------- */
window.adminInstagram=async function(c){
  const {data,error}=await api.from('instagram_posts').select('*').order('created_at',{ascending:false});
  if(error){c.innerHTML=`<div class='empty'>No se pudo cargar Instagram: ${esc(error.message)}</div>`;return}
  c.innerHTML=`<div class='hero'><div class='ey'>Instagram</div><h2>Las 3 últimas <span>publicaciones.</span></h2><p class='muted'>La landing muestra automáticamente las tres publicaciones más recientes que estén publicadas.</p><button class='btn red' id='z7ignew'>+ Nueva publicación</button></div><div class='grid grid3'>${(data||[]).map((x,i)=>`<div class='card'><div class='ey'>${i<3&&x.is_published?'EN LANDING':'NO PUBLICADA'}</div>${x.image_url?`<img src='${esc(x.image_url)}' alt='' style='width:100%;aspect-ratio:1;object-fit:cover;border-radius:10px;margin-bottom:12px'>`:''}<h3>${esc(x.caption||'Publicación')}</h3><p class='muted'>${esc(x.instagram_url||'')}</p><div class='actions'><button class='btn out' data-ig-edit='${x.id}'>Editar</button><button class='btn danger' data-ig-del='${x.id}'>Eliminar</button></div></div>`).join('')||'<div class="empty">No hay publicaciones.</div>'}</div>`;
  c.querySelector('#z7ignew').onclick=()=>igForm();
  c.querySelectorAll('[data-ig-edit]').forEach(b=>b.onclick=async()=>{const x=(data||[]).find(v=>v.id===b.dataset.igEdit);if(x)igForm(x)});
  c.querySelectorAll('[data-ig-del]').forEach(b=>b.onclick=async()=>{if(!confirm('¿Eliminar esta publicación?'))return;const r=await api.from('instagram_posts').delete().eq('id',b.dataset.igDel);if(r.error)return toastx(r.error.message);toastx('Publicación eliminada.');window.go('instagram')});
};
async function igUpload(target){const i=document.createElement('input');i.type='file';i.accept='image/*';i.onchange=async()=>{const f=i.files?.[0];if(!f)return;if(f.size>8*1024*1024)return toastx('Máximo 8 MB.');try{const ext=(f.name.split('.').pop()||'jpg').toLowerCase().replace(/[^a-z0-9]/g,'');const path=`instagram/${Date.now()}-${crypto.randomUUID()}.${ext}`;const r=await api.storage.from('site-media').upload(path,f,{cacheControl:'3600',upsert:false,contentType:f.type||'image/jpeg'});if(r.error)throw r.error;const u=api.storage.from('site-media').getPublicUrl(path).data.publicUrl;document.querySelector('#'+target).value=u;toastx('Imagen subida. Guarda la publicación.')}catch(e){toastx('No se pudo subir: '+e.message)}};i.click()}
function igForm(x){modalx(x?'Editar publicación':'Nueva publicación',`<div class='form'><div class='field'><label>Imagen</label><input id='z7igimg' value='${esc(x?.image_url||'')}' placeholder='URL de imagen'><button class='btn out' type='button' id='z7igup'>Subir imagen</button></div><div class='field'><label>Enlace de Instagram</label><input id='z7igurl' value='${esc(x?.instagram_url||'https://www.instagram.com/zona33functionalclub/')}'></div><div class='field'><label>Texto</label><textarea id='z7igcap'>${esc(x?.caption||'')}</textarea></div><div class='field'><label>Orden</label><input id='z7igsort' type='number' value='${x?.sort_order??0}'></div><div class='field'><label>Publicar</label><select id='z7igpub'><option value='true' ${x?.is_published!==false?'selected':''}>Sí</option><option value='false' ${x?.is_published===false?'selected':''}>No</option></select></div><button class='btn red' id='z7igsave'>Guardar</button></div>`);document.querySelector('#z7igup').onclick=()=>igUpload('z7igimg');document.querySelector('#z7igsave').onclick=async()=>{const p={image_url:val('z7igimg'),instagram_url:val('z7igurl')||null,caption:val('z7igcap')||null,sort_order:Number(val('z7igsort')||0),is_published:val('z7igpub')==='true',updated_at:new Date().toISOString()};const r=x?await api.from('instagram_posts').update(p).eq('id',x.id):await api.from('instagram_posts').insert(p);if(r.error)return toastx(r.error.message);closeModal();toastx('Instagram actualizado.');window.go('instagram')};

function boot(){if(!activeAdmin())return;let i=0;const t=setInterval(()=>{if(typeof window.go==='function'&&document.querySelector('#nav')){const origGo=window.go; if(!window.__z7Wrapped){window.go=(p)=>{if(p==='classes')return loadCalendar();return origGo(p)};window.__z7Wrapped=true} if(typeof window.adminClasses!=='undefined')window.adminClasses=loadCalendar; clearInterval(t)} if(++i>40)clearInterval(t)},250)}
boot();
})();
