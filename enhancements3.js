(()=>{
  const SB_URL='https://ponhllwbvhtczaphfdgw.supabase.co';
  const SB_KEY='sb_publishable_okgoHkX2YZFtQ9P72ckztQ_jiCuWN-6';
  const api=supabase.createClient(SB_URL,SB_KEY,{auth:{persistSession:true,autoRefreshToken:true}});
  const x=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const val=id=>document.querySelector('#'+id)?.value?.trim()||'';
  const admin=()=>/admin/i.test(document.querySelector('.role')?.textContent||'');
  const siteKeys=['brand','hero','community','contact'];
  const defaults={
    brand:{logo_url:'',instagram:'@zona33functionalclub'},
    hero:{title:'SER TU MEJOR VERSIÓN',copy:'Aquí empieza la fortaleza',image_url:''},
    community:{instagram:'@zona33functionalclub'},
    contact:{phone:'2229195074',address:'C. Tlaxcala 1030-local 33, 72682 San Francisco Ocotlán, Pue.'}
  };
  function inject(){
    if(!admin())return;
    const nav=document.querySelector('#nav');if(!nav)return;
    if(!nav.querySelector('[data-page="site"]')){const b=document.createElement('button');b.dataset.page='site';b.textContent='Landing';b.onclick=()=>window.go('site');nav.appendChild(b)}
  }
  new MutationObserver(inject).observe(document.body,{childList:true,subtree:true});setTimeout(inject,250);

  window.adminSite=async function(c){
    if(!admin()){c.innerHTML='<div class="empty">Acceso no autorizado.</div>';return}
    const {data,error}=await api.from('site_content').select('key,value,is_public').order('key');
    const site=Object.assign({},defaults,Object.fromEntries((data||[]).map(r=>[r.key,r.value||{}])));
    if(error){c.innerHTML='<div class="empty">No se pudo cargar el contenido de la landing.</div>';return}
    c.innerHTML=`
      <div class="hero"><div class="ey">Content management</div><h2>Controla tu <span>landing.</span></h2><p class="muted">Edita contenido público sin tocar código. Los cambios se guardan en Supabase y la landing los consume automáticamente.</p></div>
      <div class="grid grid2">
        <div class="card"><div class="ey">Marca</div><h2>Logo e Instagram</h2><div class="form"><div class="field"><label>URL del logo</label><input id="cmsLogo" value="${x(site.brand.logo_url||'')}" placeholder="https://..."></div><div class="field"><label>Instagram</label><input id="cmsInstagram" value="${x(site.community.instagram||site.brand.instagram||'')}" placeholder="@zona33functionalclub"></div><div class="actions"><button class="btn red" onclick="saveCMSBrand()">Guardar marca</button><button class="btn out" onclick="uploadSiteImage('logo')">Subir logo</button></div><div id="cmsLogoPreview" style="margin-top:10px"></div></div></div>
        <div class="card"><div class="ey">Hero</div><h2>Portada</h2><div class="form"><div class="field"><label>Título</label><textarea id="cmsHeroTitle">${x(site.hero.title||'')}</textarea></div><div class="field"><label>Texto</label><textarea id="cmsHeroCopy">${x(site.hero.copy||'')}</textarea></div><div class="field"><label>URL de imagen</label><input id="cmsHeroImage" value="${x(site.hero.image_url||'')}" placeholder="https://..."></div><div class="actions"><button class="btn red" onclick="saveCMSHero()">Guardar hero</button><button class="btn out" onclick="uploadSiteImage('hero')">Subir imagen</button></div><div id="cmsHeroPreview" style="margin-top:10px"></div></div></div>
        <div class="card"><div class="ey">Contacto</div><h2>Ubicación y teléfono</h2><div class="form"><div class="field"><label>Teléfono</label><input id="cmsPhone" value="${x(site.contact.phone||'')}" placeholder="222..."></div><div class="field"><label>Dirección</label><textarea id="cmsAddress">${x(site.contact.address||'')}</textarea></div><button class="btn red" onclick="saveCMSContact()">Guardar contacto</button></div></div>
        <div class="card"><div class="ey">Comunidad</div><h2>Instagram público</h2><p class="muted">La landing toma las publicaciones desde la sección Instagram del portal. Aquí puedes controlar la cuenta que se muestra como referencia.</p><div class="form"><div class="field"><label>Cuenta</label><input id="cmsCommunityIG" value="${x(site.community.instagram||'@zona33functionalclub')}"></div><button class="btn red" onclick="saveCMSCommunity()">Guardar comunidad</button></div></div>
      </div>
      <br><div class="card"><div class="ey">Publicación</div><h2>Cómo funciona</h2><p class="muted">WOD, horarios, coaches, planes, leaderboard e Instagram ya se editan desde sus propias secciones del panel. Al guardarlos, la landing los toma desde el mismo Supabase.</p><div class="actions"><button class="btn red" onclick="window.go('wod')">Editar WOD</button><button class="btn out" onclick="window.go('classes')">Editar horarios</button><button class="btn out" onclick="window.go('coaches')">Editar coaches</button><button class="btn out" onclick="window.go('plans')">Editar planes</button><button class="btn out" onclick="window.go('leaderboard')">Editar leaderboard</button><button class="btn out" onclick="window.go('instagram')">Editar Instagram</button></div></div>`;
    renderPreview(site);
  };

  async function save(key,value){
    const user=(await api.auth.getUser()).data.user;
    const {error}=await api.from('site_content').upsert({key,value,is_public:true,updated_by:user?.id||null,updated_at:new Date().toISOString()},{onConflict:'key'});
    if(error)throw error;
  }
  window.saveCMSBrand=async()=>{try{await save('brand',{logo_url:val('cmsLogo')||null,instagram:val('cmsInstagram')||null});await save('community',{instagram:val('cmsInstagram')||null});toast('Marca actualizada.');window.go('site')}catch(e){toast('No se pudo guardar: '+e.message)}};
  window.saveCMSHero=async()=>{try{await save('hero',{title:val('cmsHeroTitle'),copy:val('cmsHeroCopy'),image_url:val('cmsHeroImage')||null});toast('Hero actualizado.');window.go('site')}catch(e){toast('No se pudo guardar: '+e.message)}};
  window.saveCMSContact=async()=>{try{await save('contact',{phone:val('cmsPhone'),address:val('cmsAddress')});toast('Contacto actualizado.');window.go('site')}catch(e){toast('No se pudo guardar: '+e.message)}};
  window.saveCMSCommunity=async()=>{try{await save('community',{instagram:val('cmsCommunityIG')});toast('Comunidad actualizada.');window.go('site')}catch(e){toast('No se pudo guardar: '+e.message)}};

  window.uploadSiteImage=async(type)=>{
    const input=document.createElement('input');input.type='file';input.accept='image/*';input.onchange=async()=>{
      const file=input.files?.[0];if(!file)return;
      if(file.size>8*1024*1024)return toast('La imagen debe pesar menos de 8 MB.');
      try{
        toast('Subiendo imagen…');
        const ext=(file.name.split('.').pop()||'jpg').toLowerCase().replace(/[^a-z0-9]/g,'');
        const path=`${type}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
        const {error}=await api.storage.from('site-media').upload(path,file,{cacheControl:'3600',upsert:false,contentType:file.type||'image/jpeg'});
        if(error)throw error;
        const {data}=api.storage.from('site-media').getPublicUrl(path);
        if(type==='logo')document.querySelector('#cmsLogo').value=data.publicUrl;
        else document.querySelector('#cmsHeroImage').value=data.publicUrl;
        toast('Imagen subida. Ahora guarda los cambios.');
      }catch(e){toast('No se pudo subir la imagen: '+e.message)}
    };input.click();
  };
  function renderPreview(site){
    const l=site?.brand?.logo_url;const h=site?.hero?.image_url;
    if(l)document.querySelector('#cmsLogoPreview').innerHTML=`<img src="${x(l)}" alt="Logo" style="max-width:180px;max-height:80px;object-fit:contain;border:1px solid #222;border-radius:8px;padding:8px;background:#080808">`;
    if(h)document.querySelector('#cmsHeroPreview').innerHTML=`<img src="${x(h)}" alt="Hero" style="width:100%;max-height:180px;object-fit:cover;border:1px solid #222;border-radius:8px">`;
  }
})();
