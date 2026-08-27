(()=>{
'use strict';
const U='https://ponhllwbvhtczaphfdgw.supabase.co',K='sb_publishable_okgoHkX2YZFtQ9P72ckztQ_jiCuWN-6';
const api=supabase.createClient(U,K,{auth:{persistSession:true,autoRefreshToken:true}});
const esc=v=>String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[c]));
const val=id=>document.querySelector('#'+id)?.value?.trim()||'';
const toastx=m=>window.toast?window.toast(m):alert(m);
const normUrl=u=>{u=(u||'').trim();if(!u)return '';try{const x=new URL(u);if(!/instagram\.com$/i.test(x.hostname)&&!/([^.]+\.)?instagram\.com$/i.test(x.hostname))return '';return 'https://www.instagram.com'+x.pathname+(x.search||'')}catch{return ''}};
function previewEmbed(url){const u=normUrl(url);if(!u)return '<div class="empty">Pega una URL válida de Instagram para ver una vista previa.</div>';return `<div style="background:#111;border:1px solid #2a2a2a;border-radius:12px;padding:10px"><blockquote class="instagram-media" data-instgrm-permalink="${esc(u)}" data-instgrm-version="14" style="margin:0 auto;min-width:260px;max-width:540px;width:100%"></blockquote></div>`}
function loadEmbedScript(){if(document.querySelector('script[data-z33-ig-embed]'))return;const s=document.createElement('script');s.async=true;s.src='https://www.instagram.com/embed.js';s.dataset.z33IgEmbed='1';document.body.appendChild(s)}
window.adminInstagram=async c=>{
  const {data,error}=await api.from('instagram_posts').select('*').order('created_at',{ascending:false});
  if(error){c.innerHTML=`<div class='empty'>No se pudo cargar Instagram: ${esc(error.message)}</div>`;return}
  c.innerHTML=`<div class='hero'><div class='ey'>Instagram</div><h2>Tus publicaciones <span>en vivo.</span></h2><p class='muted'>Pega únicamente la URL de una publicación o reel de Instagram. No necesitas conseguir la URL de la imagen.</p><button class='btn red' id='z10new'>+ Nueva publicación</button></div><div class='grid grid3'>${(data||[]).map(x=>`<div class='card'><div class='ey'>${x.is_published?'PUBLICADA':'OCULTA'}</div>${x.instagram_url?previewEmbed(x.instagram_url):'<div class="empty">Sin URL</div>'}<p class='muted' style='margin-top:12px'>${esc(x.caption||'')}</p><small style='color:#8b9198;word-break:break-all'>${esc(x.instagram_url||'')}</small><div class='actions' style='margin-top:12px'><button class='btn out' data-z10e='${x.id}'>Editar</button><button class='btn danger' data-z10d='${x.id}'>Eliminar</button></div></div>`).join('')||'<div class="empty">Todavía no hay publicaciones.</div>'}</div>`;
  c.querySelector('#z10new').onclick=()=>igForm();
  c.querySelectorAll('[data-z10e]').forEach(b=>b.onclick=()=>{const x=(data||[]).find(v=>v.id===b.dataset.z10e);if(x)igForm(x)});
  c.querySelectorAll('[data-z10d]').forEach(b=>b.onclick=async()=>{if(!confirm('¿Eliminar esta publicación?'))return;const r=await api.from('instagram_posts').delete().eq('id',b.dataset.z10d);if(r.error)return toastx(r.error.message);toastx('Publicación eliminada.');window.go('instagram')});
  loadEmbedScript();setTimeout(()=>window.instgrm?.Embeds?.process?.(),300);
};
function igForm(x){
  modal(x?'Editar publicación':'Nueva publicación',`<div class='form'><div class='field'><label>URL de Instagram</label><input id='z10url' type='url' placeholder='https://www.instagram.com/p/.../' value='${esc(x?.instagram_url||'')}'><small class='muted'>También funciona con /reel/ y /tv/.</small></div><div id='z10preview' style='margin-top:12px'></div><div class='field'><label>Texto opcional</label><textarea id='z10cap' placeholder='Descripción breve'>${esc(x?.caption||'')}</textarea></div><div class='field'><label>Publicar en el landing</label><select id='z10pub'><option value='true' ${x?.is_published!==false?'selected':''}>Sí</option><option value='false' ${x?.is_published===false?'selected':''}>No</option></select></div><button class='btn red' id='z10save'>Guardar</button></div>`);
  const render=()=>{const p=document.querySelector('#z10preview');if(p){p.innerHTML=previewEmbed(val('z10url'));loadEmbedScript();setTimeout(()=>window.instgrm?.Embeds?.process?.(),300)}};
  document.querySelector('#z10url')?.addEventListener('input',render);render();
  document.querySelector('#z10save').onclick=async()=>{
    const instagram_url=normUrl(val('z10url')); if(!instagram_url)return toastx('Pega una URL válida de Instagram.');
    const {data:{user}}=await api.auth.getUser();
    const now=new Date().toISOString();
    const sort= x?.sort_order ?? (await api.from('instagram_posts').select('sort_order').order('sort_order',{ascending:false}).limit(1).maybeSingle()).data?.sort_order+1 || 1;
    const p={image_url:instagram_url,caption:val('z10cap')||null,instagram_url,sort_order:sort,is_published:val('z10pub')==='true',updated_at:now};
    const r=x?await api.from('instagram_posts').update(p).eq('id',x.id):await api.from('instagram_posts').insert({...p,created_at:now});
    if(r.error)return toastx('No se pudo guardar: '+r.error.message);closeModal();toastx('Publicación guardada.');window.go('instagram');
  };
}
})();
