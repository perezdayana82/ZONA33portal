(()=>{
'use strict';
const logo='/assets/zona33-logo-correct.svg';
const LANDING='https://zona33.pages.dev/';
const load=(src,attr)=>{if(document.querySelector(`script[${attr}]`))return;const s=document.createElement('script');s.src=src;s.defer=true;s.setAttribute(attr,'1');document.body.appendChild(s)};
const fix=()=>{document.querySelectorAll('.brand img').forEach(img=>{img.src=logo;img.alt='ZONA 33';img.removeAttribute('onerror')});document.querySelectorAll('button').forEach(btn=>{if(String(btn.textContent||'').trim().toUpperCase()==='SITIO')btn.onclick=()=>window.location.assign(LANDING)});document.querySelectorAll('a.brand').forEach(a=>a.href=LANDING);load('/enhancements5.js?v=20260827-cms3','data-z33-cms');load('/enhancements7.js?v=20260827-admin7','data-z33-admin-core');load('/enhancements9.js?v=20260827-fix9','data-z33-fixes')};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',fix,{once:true});else fix();
})();
