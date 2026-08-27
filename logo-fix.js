(()=>{
'use strict';
const logo='/assets/zona33-logo-correct.svg';
const LANDING='https://zona33.pages.dev/';
const loadSequential=async()=>{
  const files=[
    ['/enhancements5.js?v=20260827-cms4','data-z33-cms'],
    ['/enhancements6.js?v=20260827-cal5','data-z33-calendar'],
    ['/enhancements9.js?v=20260827-admin9','data-z33-admin'],
    ['/enhancements10.js?v=20260827-ig-url1','data-z33-ig-url'],
    ['/enhancements11.js?v=20260827-people12','data-z33-people']
  ];
  for(const [src,attr] of files){
    if(document.querySelector(`script[${attr}]`))continue;
    await new Promise(resolve=>{const s=document.createElement('script');s.src=src;s.defer=true;s.onload=()=>resolve();s.onerror=()=>resolve();s.setAttribute(attr,'1');document.body.appendChild(s)});
  }
};
const fixLogo=()=>document.querySelectorAll('.brand img').forEach(img=>{img.src=logo;img.alt='ZONA 33';img.removeAttribute('onerror')});
const fixSite=()=>document.querySelectorAll('button').forEach(btn=>{if(String(btn.textContent||'').trim().toUpperCase()==='SITIO')btn.onclick=()=>window.location.assign(LANDING)});
const fix=()=>{fixLogo();fixSite();document.querySelectorAll('a.brand').forEach(a=>a.href=LANDING);loadSequential()};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',fix,{once:true});else fix();
})();
