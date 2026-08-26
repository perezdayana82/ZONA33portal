(()=>{
const logo='/assets/zona33-logo-correct.svg';
const LANDING='https://zona33.pages.dev/';
const fix=()=>{
  document.querySelectorAll('.brand img').forEach(img=>{img.src=logo;img.alt='ZONA 33';img.removeAttribute('onerror')});
  document.querySelectorAll('button').forEach(btn=>{
    if(String(btn.textContent||'').trim().toUpperCase()==='SITIO') btn.onclick=()=>window.location.assign(LANDING);
  });
  document.querySelectorAll('a.brand').forEach(a=>{a.href=LANDING;});
};
new MutationObserver(fix).observe(document.body,{childList:true,subtree:true});
fix();
})();