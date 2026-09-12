(() => {
  'use strict';

  const injectStyles = () => {
    if (document.getElementById('z33-modern-ui')) return;
    const style = document.createElement('style');
    style.id = 'z33-modern-ui';
    style.textContent = `
      :root{
        --z33-red:#e0433a;
        --z33-bg:#050505;
        --z33-panel:#101010;
        --z33-panel2:#151515;
        --z33-line:#2b2b2b;
        --z33-text:#f8f7f8;
        --z33-muted:#a8afb9;
        --z33-ok:#65e6aa;
        --z33-focus:rgba(224,67,58,.34);
      }
      body{font-size:14px;line-height:1.5}
      .side{width:285px;padding:18px 14px;background:linear-gradient(180deg,#0a0a0a 0%,#070707 100%)}
      .shell{grid-template-columns:285px 1fr}
      .side .brand{padding:12px 12px;margin-bottom:16px}
      .side .brand strong{font-size:28px}
      .role{font-size:11px;margin-bottom:16px}
      .nav{gap:6px}
      .nav button{padding:13px 14px;min-height:46px;border-radius:10px;font-size:12px;letter-spacing:.05em}
      .nav button:hover{background:#161616;transform:translateX(1px)}
      .nav button.active{box-shadow:inset 4px 0 0 var(--z33-red),0 0 0 1px rgba(224,67,58,.08);background:#171717}
      .main{background:radial-gradient(circle at 100% 0,rgba(224,67,58,.055),transparent 28%),#050505}
      .top{height:82px;padding:0 28px}
      .top h1{font-size:38px;margin:5px 0}
      .content{padding:28px;max-width:1500px}
      .card{background:linear-gradient(145deg,#141414,#0b0b0b);border-radius:16px;padding:22px;border-color:#292929;box-shadow:0 12px 34px rgba(0,0,0,.16)}
      .card h2,.card h3{font-size:32px;line-height:.96;margin:6px 0 14px}
      .muted{font-size:14px;color:var(--z33-muted)}
      .btn{min-height:50px;border-radius:11px;padding:12px 18px;font-size:12px;letter-spacing:.06em}
      .field{gap:8px}
      .field label{font-size:11px;color:#b6bcc5;letter-spacing:.07em}
      .field input,.field select,.field textarea{padding:14px 14px;border-radius:11px;border-color:#373737;background:#0b0b0b;font-size:15px;min-height:50px}
      .field textarea{min-height:130px}
      .field input:focus,.field select:focus,.field textarea:focus{border-color:var(--z33-red);box-shadow:0 0 0 4px var(--z33-focus)}
      button:focus-visible,a:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible{outline:3px solid rgba(224,67,58,.55);outline-offset:2px}
      .hero{border:1px solid #292929;border-radius:18px;padding:24px;background:linear-gradient(135deg,#151515 0%,#0b0b0b 72%);margin-bottom:18px}
      .hero h2{font-size:54px;margin:10px 0 8px}
      .grid{gap:16px}
      .item{padding:14px;border-radius:12px;background:#0d0d0d}
      .table-wrap{border-radius:12px}
      .tbl th,.tbl td{font-size:12px;padding:13px}
      .tbl th{font-size:10px}
      .mobilebar{backdrop-filter:blur(14px)}

      .z33-editor{display:grid;gap:18px}
      .z33-editor-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}
      .z33-editor-card{position:relative;overflow:hidden}
      .z33-editor-card .z33-section-icon{width:42px;height:42px;border-radius:12px;background:#1b1b1b;border:1px solid #323232;display:grid;place-items:center;color:#fff;font-weight:900;margin-bottom:12px}
      .z33-editor-card h3{margin-bottom:6px}
      .z33-editor-card p{margin:0 0 18px;color:var(--z33-muted);font-size:13px}
      .z33-editor-card form{display:grid;gap:14px}
      .z33-preview{border:1px solid #2b2b2b;border-radius:14px;overflow:hidden;background:#080808}
      .z33-preview-media{height:190px;background:#111 center/cover no-repeat;display:grid;place-items:center;position:relative}
      .z33-preview-media::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,.78),rgba(0,0,0,.2))}
      .z33-preview-copy{position:relative;z-index:1;padding:20px;width:100%}
      .z33-preview-copy small{display:block;color:#f06b63;font-weight:900;letter-spacing:.14em;text-transform:uppercase;font-size:10px}
      .z33-preview-copy strong{display:block;font:900 38px/.88 'Barlow Condensed';text-transform:uppercase;max-width:520px;margin-top:8px}
      .z33-preview-copy span{display:block;color:#d6d6d6;margin-top:9px;max-width:460px;font-size:12px}
      .z33-logo-preview{height:120px;border:1px solid #2b2b2b;border-radius:12px;background:#050505;display:grid;place-items:center;margin-bottom:14px}
      .z33-logo-preview img{max-height:82px;max-width:82%;object-fit:contain}
      .z33-savebar{position:sticky;bottom:14px;z-index:5;display:flex;justify-content:space-between;align-items:center;gap:12px;padding:12px 14px;background:rgba(10,10,10,.92);border:1px solid #333;border-radius:14px;backdrop-filter:blur(16px);box-shadow:0 16px 45px rgba(0,0,0,.34)}
      .z33-savebar small{color:#949ba5}
      .z33-inline-actions{display:flex;gap:8px;flex-wrap:wrap}
      .z33-help{padding:12px 14px;border-left:3px solid var(--z33-red);background:#151515;border-radius:10px;color:#cfd4da;font-size:12px}
      @media(max-width:1050px){.z33-editor-grid{grid-template-columns:1fr}.content{padding:22px}.top{padding:0 22px}}
      @media(max-width:900px){.shell{grid-template-columns:1fr}.side{display:none}.top{height:70px;padding:0 14px}.top h1{font-size:31px}.content{padding:14px 12px 88px}.hero h2{font-size:44px}.z33-editor-grid{grid-template-columns:1fr}.z33-savebar{bottom:62px;align-items:flex-start;flex-direction:column}.z33-savebar .btn{width:100%}.z33-inline-actions{width:100%}.z33-inline-actions .btn{flex:1}}
    `;
    document.head.appendChild(style);
  };

  injectStyles();

  const oldAdminSite = window.adminSite;
  window.adminSite = function(c) {
    const s = state.site || {};
    const hero = s.hero || {};
    const brand = s.brand || {};
    const contact = s.contact || {};
    const community = s.community || {};
    const fallbackLogo = 'https://raw.githubusercontent.com/perezdayana82/ZONA33/main/assets/zona33-logo.svg';

    c.innerHTML = `
      <div class="z33-editor">
        <div class="hero">
          <div class="ey">Configuración del sitio</div>
          <h2>Edita tu <span>landing.</span></h2>
          <p class="muted">Todo lo que cambies aquí se guarda en ZONA 33 y se utiliza como fuente de contenido para el sitio público.</p>
        </div>

        <div class="z33-help"><b>Regla simple:</b> cambia el contenido, guarda y revisa el sitio. No necesitas tocar código.</div>

        <div class="z33-editor-grid">
          <section class="card z33-editor-card">
            <div class="z33-section-icon">01</div>
            <h3>Marca</h3>
            <p>Logo principal que aparece en tu sitio.</p>
            <form onsubmit="z33SaveEditor(event,'brand')">
              <div class="z33-logo-preview"><img id="z33LogoPreview" src="${esc(brand.logo_url || brand.logoUrl || fallbackLogo)}" alt="Vista previa del logo"></div>
              <div class="field"><label>URL del logo</label><input id="z33BrandUrl" value="${esc(brand.logo_url || brand.logoUrl || fallbackLogo)}" oninput="z33PreviewLogo()" placeholder="https://..."></div>
              <div class="z33-inline-actions"><button class="btn red" type="submit">Guardar logo</button><button class="btn out" type="button" onclick="z33UseDefaultLogo()">Restaurar logo</button></div>
            </form>
          </section>

          <section class="card z33-editor-card">
            <div class="z33-section-icon">02</div>
            <h3>Portada</h3>
            <p>La primera impresión de ZONA 33.</p>
            <div class="z33-preview" id="z33HeroPreview">
              <div class="z33-preview-media" style="background-image:url('${esc(hero.image_url || '')}')">
                <div class="z33-preview-copy"><small>ZONA 33</small><strong>${esc(hero.title || 'SER TU MEJOR VERSIÓN')}</strong><span>${esc(hero.copy || 'Aquí empieza la fortaleza')}</span></div>
              </div>
            </div>
            <form onsubmit="z33SaveEditor(event,'hero')" style="margin-top:14px">
              <div class="field"><label>Título</label><input id="z33HeroTitle" value="${esc(hero.title || 'SER TU MEJOR VERSIÓN')}" oninput="z33PreviewHero()"></div>
              <div class="field"><label>Texto</label><textarea id="z33HeroCopy" oninput="z33PreviewHero()">${esc(hero.copy || 'Aquí empieza la fortaleza')}</textarea></div>
              <div class="field"><label>Imagen de portada</label><input id="z33HeroImage" value="${esc(hero.image_url || '')}" oninput="z33PreviewHero()" placeholder="Pega la URL de la imagen"></div>
              <button class="btn red" type="submit">Guardar portada</button>
            </form>
          </section>

          <section class="card z33-editor-card">
            <div class="z33-section-icon">03</div>
            <h3>Información de contacto</h3>
            <p>Datos que tus clientes necesitan encontrar rápido.</p>
            <form onsubmit="z33SaveEditor(event,'contact')">
              <div class="field"><label>Teléfono</label><input id="z33Phone" inputmode="tel" value="${esc(contact.phone || '')}" placeholder="222..." /></div>
              <div class="field"><label>WhatsApp</label><input id="z33Whatsapp" inputmode="tel" value="${esc(contact.whatsapp || contact.phone || '')}" placeholder="222..." /></div>
              <div class="field"><label>Instagram</label><input id="z33Instagram" value="${esc(contact.instagram || '@zona33functionalclub')}" placeholder="@zona33functionalclub" /></div>
              <div class="field"><label>Dirección</label><textarea id="z33Address">${esc(contact.address || '')}</textarea></div>
              <button class="btn red" type="submit">Guardar contacto</button>
            </form>
          </section>

          <section class="card z33-editor-card">
            <div class="z33-section-icon">04</div>
            <h3>Comunidad</h3>
            <p>Mensaje y bloque social del landing.</p>
            <form onsubmit="z33SaveEditor(event,'community')">
              <div class="field"><label>Título</label><input id="z33CommunityTitle" value="${esc(community.title || 'MORE THAN A GYM')}" /></div>
              <div class="field"><label>Texto</label><textarea id="z33CommunityCopy">${esc(community.copy || 'Comunidad, entrenamiento y resultados reales.')}</textarea></div>
              <button class="btn red" type="submit">Guardar comunidad</button>
            </form>
          </section>
        </div>

        <div class="z33-savebar"><small>Los cambios se guardan directamente en el CMS de ZONA 33.</small><button class="btn red" type="button" onclick="location.href='/'">Ver landing</button></div>
      </div>`;
  };

  window.z33PreviewLogo = function(){
    const v=document.querySelector('#z33BrandUrl')?.value?.trim();
    const img=document.querySelector('#z33LogoPreview');
    if(img && v) img.src=v;
  };

  window.z33UseDefaultLogo = function(){
    const v='https://raw.githubusercontent.com/perezdayana82/ZONA33/main/assets/zona33-logo.svg';
    const input=document.querySelector('#z33BrandUrl');
    if(input) input.value=v;
    z33PreviewLogo();
  };

  window.z33PreviewHero = function(){
    const title=document.querySelector('#z33HeroTitle')?.value?.trim() || 'SER TU MEJOR VERSIÓN';
    const copy=document.querySelector('#z33HeroCopy')?.value?.trim() || 'Aquí empieza la fortaleza';
    const image=document.querySelector('#z33HeroImage')?.value?.trim() || '';
    const preview=document.querySelector('#z33HeroPreview');
    if(!preview)return;
    const media=preview.querySelector('.z33-preview-media');
    const strong=preview.querySelector('strong');
    const span=preview.querySelector('span');
    if(media)media.style.backgroundImage=`url('${image.replace(/'/g,"%27")}')`;
    if(strong)strong.textContent=title;
    if(span)span.textContent=copy;
  };

  window.z33SaveEditor = async function(e,key){
    e.preventDefault();
    let value={};
    if(key==='brand')value={...(state.site?.brand||{}),logo_url:document.querySelector('#z33BrandUrl')?.value?.trim()||''};
    if(key==='hero')value={...(state.site?.hero||{}),title:document.querySelector('#z33HeroTitle')?.value?.trim()||'',copy:document.querySelector('#z33HeroCopy')?.value?.trim()||'',image_url:document.querySelector('#z33HeroImage')?.value?.trim()||''};
    if(key==='contact')value={...(state.site?.contact||{}),phone:document.querySelector('#z33Phone')?.value?.trim()||'',whatsapp:document.querySelector('#z33Whatsapp')?.value?.trim()||'',instagram:document.querySelector('#z33Instagram')?.value?.trim()||'',address:document.querySelector('#z33Address')?.value?.trim()||''};
    if(key==='community')value={...(state.site?.community||{}),title:document.querySelector('#z33CommunityTitle')?.value?.trim()||'',copy:document.querySelector('#z33CommunityCopy')?.value?.trim()||''};
    const {error}=await sb.from('site_content').upsert({key,value,is_public:true,updated_by:me.id,updated_at:new Date().toISOString()},{onConflict:'key'});
    if(error)return toast(error.message||'No se pudo guardar.');
    state.site[key]=value;
    toast('Guardado correctamente.');
    try{await refresh()}catch{}
    go('site');
  };
})();
