(()=>{
  const SB_URL='https://ponhllwbvhtczaphfdgw.supabase.co';
  const SB_KEY='sb_publishable_okgoHkX2YZFtQ9P72ckztQ_jiCuWN-6';
  const mediaClient=window.supabase?.createClient(SB_URL,SB_KEY,{auth:{persistSession:true,autoRefreshToken:true}});
  if(!mediaClient)return;
  const escm=v=>String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[c]));
  const val=id=>document.querySelector('#'+id)?.value?.trim()||'';
  const style=document.createElement('style');
  style.textContent=`
    .cms-wrap{display:grid;gap:18px}.cms-hero{display:flex;justify-content:space-between;gap:18px;align-items:flex-end;flex-wrap:wrap}.cms-title{font:900 clamp(38px,5vw,64px)/.86 'Barlow Condensed';text-transform:uppercase;margin:4px 0 8px}.cms-sub{max-width:640px;color:#a9b0ba;line-height:1.65;font-size:15px}.cms-actions{display:flex;gap:8px;flex-wrap:wrap}.cms-section{background:linear-gradient(145deg,#111,#090909);border:1px solid #292929;border-radius:18px;padding:20px}.cms-section-head{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;margin-bottom:16px}.cms-kicker{font:900 11px/1 'Barlow Condensed';color:#e0433a;letter-spacing:.18em;text-transform:uppercase}.cms-section h3{font:900 28px/.9 'Barlow Condensed';text-transform:uppercase;margin:5px 0 6px}.cms-help{color:#89919d;font-size:13px;line-height:1.55;margin:0}.cms-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.cms-grid3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.cms-field{display:grid;gap:7px}.cms-field label{font-size:11px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;color:#c4c9d0}.cms-field input,.cms-field textarea{width:100%;padding:13px 14px;background:#070707;color:#fff;border:1px solid #343434;border-radius:10px;font-size:15px;outline:none}.cms-field textarea{min-height:120px;resize:vertical}.cms-field input:focus,.cms-field textarea:focus{border-color:#e0433a;box-shadow:0 0 0 3px rgba(224,67,58,.12)}.cms-media{border:1px dashed #444;border-radius:14px;background:#090909;min-height:190px;display:grid;place-items:center;padding:10px;position:relative;overflow:hidden;transition:.2s}.cms-media.drag{border-color:#e0433a;background:rgba(224,67,58,.08)}.cms-media.has-image{display:block;padding:0}.cms-media img{width:100%;height:230px;object-fit:cover;display:block}.cms-media.logo img{height:180px;object-fit:contain;background:#050505}.cms-drop{display:grid;place-items:center;text-align:center;gap:8px;padding:22px}.cms-drop strong{font-size:16px}.cms-drop span{color:#8e96a0;font-size:13px}.cms-drop .btn{margin-top:4px}.cms-file{display:none}.cms-media-tools{display:flex;gap:8px;flex-wrap:wrap;padding:10px;background:#090909;border-top:1px solid #242424}.cms-status{font-size:12px;color:#9da5af;min-height:18px}.cms-row-end{display:flex;justify-content:flex-end;gap:8px;flex-wrap:wrap}.cms-mini{font-size:12px;color:#818995;align-self:center}@media(max-width:900px){.cms-grid,.cms-grid3{grid-template-columns:1fr}.cms-section{padding:16px}.cms-title{font-size:44px}.cms-actions{width:100%}.cms-actions .btn{flex:1}.cms-media img{height:210px}}@media(max-width:520px){.cms-section-head{display:block}.cms-media img{height:180px}}`;
  document.head.appendChild(style);

  const extFor=file=>file.type.includes('png')?'png':file.type.includes('webp')?'webp':file.type.includes('gif')?'gif':'jpg';
  async function uploadMedia(file,folder,statusEl,existingImg){
    if(!file)return '';
    if(!file.type.startsWith('image/')){toast('Selecciona una imagen válida.');return ''}
    if(file.size>8*1024*1024){toast('La imagen debe pesar menos de 8 MB.');return ''}
    statusEl.textContent='Subiendo foto…';
    const path=`${folder}/${crypto.randomUUID()}.${extFor(file)}`;
    const {error}=await mediaClient.storage.from('site-media').upload(path,file,{cacheControl:'3600',upsert:false,contentType:file.type});
    if(error){statusEl.textContent='';toast('No se pudo subir la foto: '+error.message);return ''}
    const {data}=mediaClient.storage.from('site-media').getPublicUrl(path);
    const url=data?.publicUrl||'';
    if(existingImg)existingImg.src=url;
    statusEl.textContent='Foto lista. Guarda los cambios para publicarla.';
    return url;
  }
  function uploader({id,label,url,help,folder,logo=false}){
    const wrap=document.createElement('div');
    wrap.innerHTML=`<div class="cms-field"><label>${escm(label)}</label><div class="cms-media ${logo?'logo ':''}" id="${id}Media"></div><div class="cms-status" id="${id}Status">${url?'Imagen actual':'Selecciona una foto'}</div></div>`;
    const media=wrap.querySelector('#'+id+'Media'),status=wrap.querySelector('#'+id+'Status');
    const input=document.createElement('input');input.type='file';input.accept='image/*';input.className='cms-file';media.appendChild(input);
    const render=url?`<img src="${escm(url)}" alt="Vista previa"><div class="cms-media-tools"><button type="button" class="btn red">Cambiar foto</button></div>`:`<div class="cms-drop"><strong>Subir desde tu dispositivo</strong><span>${escm(help||'JPG, PNG o WEBP · máximo 8 MB')}</span><button type="button" class="btn red">Elegir foto</button></div>`;
    media.insertAdjacentHTML('beforeend',render);
    const open=()=>input.click();media.querySelector('button').onclick=open;
    media.addEventListener('click',e=>{if(e.target.closest('button'))return;if(!media.classList.contains('has-image'))open()});
    ['dragenter','dragover'].forEach(ev=>media.addEventListener(ev,e=>{e.preventDefault();media.classList.add('drag')}));
    ['dragleave','drop'].forEach(ev=>media.addEventListener(ev,e=>{e.preventDefault();media.classList.remove('drag')}));
    const handle=async file=>{const old=media.querySelector('img');const p=await uploadMedia(file,folder,status,old);if(!p)return;if(old){status.textContent='Foto lista. Guarda los cambios para publicarla.'}else{media.classList.add('has-image');media.innerHTML=`<img src="${escm(p)}" alt="Vista previa"><div class="cms-media-tools"><button type="button" class="btn red">Cambiar foto</button></div>`;media.querySelector('button').onclick=open;media.appendChild(input)}};
    media.addEventListener('drop',e=>handle(e.dataTransfer?.files?.[0]));input.addEventListener('change',()=>handle(input.files?.[0]));
    return {wrap,getUrl:()=>media.querySelector('img')?.src||''};
  }

  window.adminSite=async function(c){
    const s=state.site||{},hero=s.hero||{},brand=s.brand||{},contact=s.contact||{},community=s.community||{};
    c.innerHTML=`<div class="cms-wrap"><div class="cms-hero"><div><div class="cms-kicker">Editor del sitio</div><div class="cms-title">Haz cambios sin tocar código.</div><p class="cms-sub">Sube tus fotos desde este dispositivo. Ya no necesitas copiar ni pegar URLs.</p></div><div class="cms-actions"><button class="btn out" type="button" onclick="location.href='/'">Ver landing</button><button class="btn red" type="button" onclick="document.querySelector('#cmsMainForm')?.requestSubmit()">Guardar cambios</button></div></div><form id="cmsMainForm" class="cms-wrap" onsubmit="saveCMS(event)">
      <section class="cms-section"><div class="cms-section-head"><div><div class="cms-kicker">01 · Portada</div><h3>Imagen y mensaje principal</h3><p class="cms-help">La portada es lo primero que verán tus nuevos clientes.</p></div></div><div class="cms-grid"><div class="cms-field"><label>Título</label><input id="cmsHeroTitle" value="${escm(hero.title||'SER TU MEJOR VERSIÓN')}"></div><div class="cms-field"><label>Texto</label><textarea id="cmsHeroCopy">${escm(hero.copy||'Aquí empieza la fortaleza')}</textarea></div></div><div id="cmsHeroUploader" style="margin-top:14px"></div></section>
      <section class="cms-section"><div class="cms-section-head"><div><div class="cms-kicker">02 · Marca</div><h3>Logo</h3><p class="cms-help">Selecciona el archivo desde tu dispositivo. PNG o WEBP funcionan muy bien.</p></div></div><div id="cmsLogoUploader"></div></section>
      <section class="cms-section"><div class="cms-section-head"><div><div class="cms-kicker">03 · Contacto</div><h3>Información de ZONA 33</h3></div></div><div class="cms-grid3"><div class="cms-field"><label>Teléfono</label><input id="cmsPhone" value="${escm(contact.phone||'')}"></div><div class="cms-field"><label>Instagram</label><input id="cmsInstagram" value="${escm(contact.instagram||'@zona33functionalclub')}"></div><div class="cms-field"><label>WhatsApp</label><input id="cmsWhatsApp" value="${escm(contact.whatsapp||'2227109802')}" placeholder="2227109802"></div></div><div class="cms-field" style="margin-top:14px"><label>Dirección</label><textarea id="cmsAddress">${escm(contact.address||'')}</textarea></div></section>
      <section class="cms-section"><div class="cms-section-head"><div><div class="cms-kicker">04 · Comunidad</div><h3>Mensaje del bloque social</h3></div></div><div class="cms-grid"><div class="cms-field"><label>Título</label><input id="cmsCommTitle" value="${escm(community.title||'MORE THAN A GYM')}"></div><div class="cms-field"><label>Texto</label><textarea id="cmsCommCopy">${escm(community.copy||'Comunidad, entrenamiento y resultados reales.')}</textarea></div></div></section>
      <div class="cms-row-end"><span class="cms-mini">Primero sube las fotos y después pulsa Guardar cambios.</span><button class="btn red" type="submit">Guardar cambios</button></div></form></div>`;
    const hu=uploader({id:'hero',label:'Foto de portada',url:hero.image_url||'',help:'Arrastra o selecciona una foto desde tu dispositivo.',folder:'landing/hero'});document.querySelector('#cmsHeroUploader').appendChild(hu.wrap);
    const lu=uploader({id:'logo',label:'Logo de ZONA 33',url:brand.logo_url||'',help:'PNG o WEBP con fondo transparente.',folder:'landing/logo',logo:true});document.querySelector('#cmsLogoUploader').appendChild(lu.wrap);
    window.__z33CMS={hu,lu};
  };
  window.saveCMS=async function(e){
    e.preventDefault();const U=window.__z33CMS||{};const updates=[['hero',{title:val('cmsHeroTitle'),copy:val('cmsHeroCopy'),image_url:U.hu?.getUrl()||''}],['brand',{logo_url:U.lu?.getUrl()||''}],['contact',{phone:val('cmsPhone'),instagram:val('cmsInstagram'),whatsapp:val('cmsWhatsApp'),address:val('cmsAddress')}],['community',{title:val('cmsCommTitle'),copy:val('cmsCommCopy')}]];
    const {data:{user}}=await mediaClient.auth.getUser();
    for(const [key,value] of updates){const {error}=await mediaClient.from('site_content').upsert({key,value,is_public:true,updated_by:user?.id||null,updated_at:new Date().toISOString()},{onConflict:'key'});if(error)return toast('No se pudo guardar '+key+': '+error.message)}
    await refresh();toast('Cambios guardados correctamente.');go('site');
  };
})();
