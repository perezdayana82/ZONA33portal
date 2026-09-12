/* ZONA 33 · Portal UI v2
   Visual/UX layer only. Keeps the existing Supabase + booking logic intact.
   Goal: make the portal feel like a real SaaS product instead of a prototype.
*/
(function(){
  const CSS = `
  :root{
    --ui-bg:#f4f5f7;
    --ui-panel:#ffffff;
    --ui-ink:#17191d;
    --ui-muted:#737a84;
    --ui-line:#e5e7eb;
    --ui-red:#e0433a;
    --ui-red-soft:#fff1ef;
    --ui-green:#167a4b;
    --ui-shadow:0 8px 28px rgba(16,24,40,.06);
  }

  /* Work area */
  body{background:var(--ui-bg);color:var(--ui-ink)}
  .shell{grid-template-columns:224px 1fr;background:var(--ui-bg)}
  .side{
    background:#101113;border-right:0;padding:14px 10px;color:#fff;
    box-shadow:10px 0 30px rgba(0,0,0,.08)
  }
  .side .brand{padding:10px 12px;margin-bottom:6px}
  .side .brand strong{font:800 22px/1 Inter,Arial,sans-serif;letter-spacing:-.02em}
  .side .brand img{width:34px;height:34px}
  .role{margin:0 12px 14px;color:#9ea3ab;font:700 10px/1 Inter,Arial,sans-serif;letter-spacing:.08em}
  .nav{gap:2px;padding:0 2px}
  .nav button{
    color:#aeb3bb;padding:10px 12px;border-radius:8px;font:600 13px/1.2 Inter,Arial,sans-serif;
    text-transform:none;letter-spacing:0;transition:.16s ease;background:transparent
  }
  .nav button:hover{background:#191b1f;color:#fff}
  .nav button.active{background:#24262b;color:#fff;box-shadow:none;position:relative}
  .nav button.active:before{content:"";position:absolute;left:-2px;top:8px;bottom:8px;width:3px;border-radius:8px;background:var(--ui-red)}
  .sidefoot{padding:12px;color:#6f747d;font-size:10px}

  .main{background:var(--ui-bg)}
  .top{
    height:68px;background:rgba(255,255,255,.94);border-bottom:1px solid var(--ui-line);
    color:var(--ui-ink);padding:0 28px;backdrop-filter:blur(14px)
  }
  .top .ey{font:700 10px/1 Inter,Arial,sans-serif;letter-spacing:.08em;color:#8a9098}
  .top h1{font:700 21px/1.2 Inter,Arial,sans-serif;text-transform:none;letter-spacing:-.02em;margin:3px 0 0}
  .top-actions{gap:7px}
  .top-actions .pill{font-size:11px}

  .content{padding:26px 28px 40px;max-width:1500px}
  .grid{gap:16px}
  .card{
    background:var(--ui-panel);border:1px solid var(--ui-line);border-radius:12px;padding:18px;
    box-shadow:var(--ui-shadow);color:var(--ui-ink)
  }
  .card h2,.card h3{
    font:700 18px/1.25 Inter,Arial,sans-serif;text-transform:none;letter-spacing:-.01em;margin:3px 0 10px
  }
  .stat small,.field label{color:#7c838d;font-size:11px;letter-spacing:0;text-transform:none;font-weight:600}
  .stat b{font:700 28px/1.1 Inter,Arial,sans-serif;margin-top:8px;letter-spacing:-.02em}
  .muted{color:var(--ui-muted);font-size:13px;line-height:1.55}
  .ey{font:700 10px/1 Inter,Arial,sans-serif;letter-spacing:.08em;color:var(--ui-red);text-transform:uppercase}
  .btn{
    min-height:38px;border-radius:8px;border:1px solid #d7dbe0;background:#fff;color:#25282d;
    padding:8px 13px;font-size:12px;font-weight:700;letter-spacing:0;text-transform:none;white-space:nowrap;
    transition:.15s ease
  }
  .btn:hover{transform:translateY(-1px);box-shadow:0 4px 12px rgba(16,24,40,.06)}
  .btn.red{background:var(--ui-red);border-color:var(--ui-red);color:#fff}
  .btn.out{background:#fff;color:#30343a}
  .btn.danger{background:#fff7f7;border-color:#f0c7c5;color:#b42318}
  .pill{padding:5px 8px;font-size:10px}
  .item{background:#fff;border:1px solid var(--ui-line);border-radius:10px;padding:12px}
  .item b{font-size:13px;color:#20242a}
  .item small{color:#7d848d}
  .empty{padding:24px;border:1px dashed #cfd4da;color:#868d96;background:#fafbfc}
  .table-wrap{border:1px solid var(--ui-line);border-radius:10px;background:#fff}
  .tbl{min-width:720px}
  .tbl th,.tbl td{padding:11px 12px;border-bottom:1px solid #eef0f2;font-size:12px;color:#34383e}
  .tbl th{background:#fafbfc;color:#737a83;font-size:11px;text-transform:none;letter-spacing:0}

  .field input,.field select,.field textarea{
    padding:10px 11px;background:#fff;color:#17191d;border:1px solid #d7dbe0;border-radius:8px;font-size:14px
  }
  .field input:focus,.field select:focus,.field textarea:focus{border-color:#b8bdc5;box-shadow:0 0 0 3px rgba(224,67,58,.08)}
  .notice{background:#fff8f7;border:1px solid #f2d1ce;border-left:3px solid var(--ui-red);color:#5c4846}

  /* Compact admin navigation: keep the important actions visible, tuck the rest under Más. */
  .z33-more{position:relative;margin:3px 2px 0}
  .z33-more>button{width:100%;display:flex;align-items:center;justify-content:space-between}
  .z33-more-menu{display:none;padding:4px 0 2px 10px}
  .z33-more.open .z33-more-menu{display:grid;gap:2px}
  .z33-more-menu button{width:100%;text-align:left;border:0;background:transparent;color:#9ea4ad;padding:8px 10px;border-radius:7px;font:600 12px/1.2 Inter,Arial,sans-serif}
  .z33-more-menu button:hover,.z33-more-menu button.active{background:#191b1f;color:#fff}
  .z33-section{padding:12px 12px 5px;color:#666d76;font:700 9px/1 Inter,Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase}

  /* Give the dashboard a genuine app feel instead of poster-sized hero blocks. */
  .hero{background:transparent!important;border:0!important;padding:0!important;margin:0 0 16px!important}
  .hero h2{font:700 clamp(24px,3vw,30px)/1.15 Inter,Arial,sans-serif!important;text-transform:none!important;letter-spacing:-.03em!important;margin:4px 0 7px!important;color:var(--ui-ink)!important}
  .hero h2 span{color:var(--ui-red)!important}

  /* Auth */
  .auth{background:linear-gradient(135deg,#f3f4f6,#fff)}
  .auth-card{background:#fff;border:1px solid var(--ui-line);border-radius:16px;padding:32px;box-shadow:0 20px 60px rgba(16,24,40,.10)}
  .auth h1{font:700 38px/1.05 Inter,Arial,sans-serif;text-transform:none;color:var(--ui-ink);margin:12px 0}
  .auth .ey{font:700 10px/1 Inter,Arial,sans-serif}
  .auth .muted{font-size:14px}

  @media(max-width:900px){
    .shell{grid-template-columns:1fr}
    .side{display:none}
    .top{padding:0 16px}
    .content{padding:18px 16px 92px}
    .card{box-shadow:0 5px 18px rgba(16,24,40,.05)}
  }
  `;

  const s=document.createElement('style');
  s.id='z33-modern-ui';
  s.textContent=CSS;
  document.head.appendChild(s);

  function isAdmin(){return window.role==='admin' || document.querySelector('.role')?.textContent?.toLowerCase().includes('admin')}
  function byPage(p){return document.querySelector(`#nav button[data-page="${p}"]`)}

  function button(label,page){
    const b=document.createElement('button');
    b.type='button'; b.textContent=label; b.dataset.page=page;
    b.onclick=()=>window.go(page);
    return b;
  }

  function modernizeNav(){
    const nav=document.querySelector('#nav');
    if(!nav || nav.dataset.modernized==='1') return;
    if(!isAdmin()) { nav.dataset.modernized='1'; return; }

    const available=[...nav.querySelectorAll('button')];
    const map=new Map(available.map(b=>[b.dataset.page,b]));
    const core=['overview','classes','clients'];
    const finance=['payments','plans','founders'];
    const content=['wod','leaderboard','instagram','community','site'];
    const team=['coaches'];
    const reservations=map.has('reservations')?'reservations':null;

    nav.innerHTML='';
    const addSection=(title)=>{
      const d=document.createElement('div'); d.className='z33-section'; d.textContent=title; nav.appendChild(d);
    };
    const add=(p,label)=>{ if(map.has(p)) nav.appendChild(map.get(p)); else if(p==='reservations') nav.appendChild(button(label,p)); };

    addSection('Principal');
    add('overview','Inicio');
    add('classes','Agenda');
    if(reservations){
      const r=map.get('reservations');
      if(r) r.textContent='Reservas';
      add('reservations','Reservas');
    }
    add('clients','Clientes');

    addSection('Gestión');
    add('coaches','Coaches');

    const more=document.createElement('div');
    more.className='z33-more';
    const moreBtn=document.createElement('button');
    moreBtn.className='navMoreBtn'; moreBtn.type='button'; moreBtn.innerHTML='<span>Más</span><span>⌄</span>';
    const menu=document.createElement('div'); menu.className='z33-more-menu';
    const financeNodes=[];
    finance.forEach(p=>{if(map.has(p)){const b=map.get(p);financeNodes.push(b)}});
    content.forEach(p=>{if(map.has(p))menu.appendChild(map.get(p))});
    financeNodes.forEach(b=>menu.appendChild(b));
    more.appendChild(moreBtn); more.appendChild(menu); nav.appendChild(more);
    moreBtn.onclick=()=>more.classList.toggle('open');

    nav.dataset.modernized='1';
  }

  function markPage(){
    const nav=document.querySelector('#nav');
    if(!nav) return;
    const current=document.querySelector('#pageTitle')?.textContent||'';
    const labels={Inicio:'overview',Agenda:'classes',Reservas:'reservations',Clientes:'clients',Coaches:'coaches'};
    let p=labels[current];
    if(!p && typeof window.labels==='object') p=Object.entries(window.labels).find(x=>x[1]===current)?.[0];
    nav.querySelectorAll('button[data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page===p));
  }

  function polishShell(){
    modernizeNav();
    markPage();
    const title=document.querySelector('#pageTitle');
    if(title && !title.dataset.modernized){title.dataset.modernized='1'}
  }

  const mo=new MutationObserver(()=>{clearTimeout(window.__z33ui);window.__z33ui=setTimeout(polishShell,25)});
  mo.observe(document.body,{childList:true,subtree:true});
  window.addEventListener('load',polishShell);
  setTimeout(polishShell,120);
})();
