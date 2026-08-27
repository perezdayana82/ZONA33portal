(()=>{
const logo='/assets/zona33-logo-correct.svg';
const LANDING='https://zona33.pages.dev/';
const loadCMS=()=>{if(document.querySelector('script[data-z33-cms]'))return;const s=document.createElement('script');s.src='/enhancements5.js?v=20260826-gallery';s.defer=true;s.dataset.z33Cms='1';document.body.appendChild(s)};
const loadSchedule=()=>{if(document.querySelector('script[data-z33-calendar]'))return;const s=document.createElement('script');s.src='/enhancements6.js?v=20260826-cal3';s.defer=true;s.dataset.z33Calendar='1';document.body.appendChild(s)};
const loadAdminTools=()=>{if(document.querySelector('script[data-z33-admin-tools]'))return;const s=document.createElement('script');s.src='/enhancements7.js?v=20260827-admin7';s.defer=true;s.dataset.z33AdminTools='1';document.body.appendChild(s)};
const fix=()=>{document.querySelectorAll('.brand img').forEach(img=>{img.src=logo;img.alt='ZONA 33';img.removeAttribute('onerror')});document.querySelectorAll('button').forEach(btn=>{if(String(btn.textContent||'').trim().toUpperCase()==='SITIO')btn.onclick=()=>window.location.assign(LANDING)});document.querySelectorAll('a.brand').forEach(a=>{a.href=LANDING});loadCMS();loadSchedule();loadAdminTools()};
new MutationObserver(fix).observe(document.body,{childList:true,subtree:true});fix();
})();
