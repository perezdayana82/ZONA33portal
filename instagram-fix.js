(()=>{
'use strict';
const U='https://ponhllwbvhtczaphfdgw.supabase.co';
const K='sb_publishable_okgoHkX2YZFtQ9P72ckztQ_jiCuWN-6';
const api=supabase.createClient(U,K,{auth:{persistSession:true,autoRefreshToken:true}});
const esc=v=>String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[c]));
const val=id=>document.getElementById(id)?.value?.trim()||'';
const toastx=m=>window.toast?window.toast(m):alert(m);
const modalx=(t,h)=>window.modal?window.modal(t,h):null;
const close=()=>window.closeModal&&window.closeModal();
const normUrl=u=>{let x=String(u||'').trim();if(!x)return '';if(!/^https?:\/\//i.test(x))x='https://'+x;return x};
const validIg=u=>/^https?:\/\/(www\.)?instagram\.com\/(p|reel|tv)\/[A-Za-z0-9_-]+\/?(?:\?.*)?$/i.test(normUrl(u));

window.adminInstagram=async function(c){
  const r=await api.from('instagram_posts').select('*').order('sort_order').order('created_at',{ascending:false});
  if(r.error){c.innerHTML=`<div class='empty'>No se pudieron cargar las publicaciones: ${esc(r.error.message)}</div>`;return}
  const rows=r.data||[];
  c.innerHTML=`<div class='hero'><div class='ey'>Instagram</div><h2>Publicaciones <span>del club.</span></h2><p class='muted'>Solo necesitas pegar el enlace de la publicación o reel. La landing lo mostrará directamente.</p><button class='btn red' id='zIgNew'>+ Nueva publicación</button></div><div class='grid grid3'>${rows.map(x=>{const u=x.instagram_url||x.image_url||'';return `<div class='card'><div class='ey'>${x.is_published?'PUBLICADA':'OCULTA'}</div><div style='aspect-ratio:1.1;background:#111;border-radius:10px;overflow:hidden;display:grid;place-items:center'><div style='padding:20px;text-align:center;color:#aaa;font-size:13px'>${validIg(u)?'Publicación de Instagram':'Enlace por revisar'}</div></div><h3 style='margin-top:12px'>${esc(x.caption||'Sin descripción')}</h3><p class='muted' style='word-break:break-word'>${esc(u)}</p><div class='actions'><button class='btn out' data-ige='${x.id}'>Editar</button><button class='btn ${x.is_published?'danger':'out'}' data-igt='${x.id}' data-on='${x.is_published?'false':'true'}'>${x.is_published?'Ocultar':'Publicar'}</button></div></div>`}).join('')||'<div class="empty">Todavía no hay publicaciones.</div>'}</div>`;
  c.querySelector('#zIgNew').onclick=()=>igForm();
  c.querySelectorAll('[data-ige]').forEach(b=>b.onclick=()=>igForm(rows.find(x=>x.id===b.dataset.ige)));
  c.querySelectorAll('[data-igt]').forEach(b=>b.onclick=async()=>{const on=b.dataset.on==='true';const q=await api.from('instagram_posts').update({is_published:on,updated_at:new Date().toISOString()}).eq('id',b.dataset.igt);if(q.error)return toastx(q.error.message);toastx(on?'Publicada.':'Ocultada.');window.go('instagram')});
};

function igForm(x){
  modalx(x?'Editar publicación':'Nueva publicación',`<div class='form'>
    <div class='field'><label>URL de Instagram</label><input id='igUrl' type='url' value='${esc(x?.instagram_url||x?.image_url||'')}' placeholder='https://www.instagram.com/reel/...'><small class='muted'>Pega aquí el enlace de la publicación o reel. No necesitas subir imagen.</small></div>
    <div class='field'><label>Descripción (opcional)</label><textarea id='igCaption' placeholder='Texto que acompaña la publicación'>${esc(x?.caption||'')}</textarea></div>
    <div class='field'><label>Orden</label><input id='igOrder' type='number' value='${x?.sort_order??0}'></div>
    <div class='field'><label>Visible en landing</label><select id='igPub'><option value='true' ${x?.is_published!==false?'selected':''}>Sí</option><option value='false' ${x?.is_published===false?'selected':''}>No</option></select></div>
    <button class='btn red' id='igSave'>Guardar</button>
  </div>`);
  document.getElementById('igSave').onclick=async()=>{
    const url=normUrl(val('igUrl'));
    if(!validIg(url))return toastx('Pega una URL válida de una publicación o reel de Instagram.');
    const p={instagram_url:url,image_url:url,caption:val('igCaption')||null,sort_order:Number(val('igOrder')||0),is_published:val('igPub')==='true',updated_at:new Date().toISOString()};
    const q=x?await api.from('instagram_posts').update(p).eq('id',x.id):await api.from('instagram_posts').insert(p);
    if(q.error)return toastx('No se pudo guardar: '+q.error.message);
    close();toastx('Publicación guardada.');window.go('instagram');
  };
}
})();
