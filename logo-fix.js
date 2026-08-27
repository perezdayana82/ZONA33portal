(()=>{
'use strict';
const logo='/assets/zona33-logo-correct.svg';
const LANDING='https://zona33.pages.dev/';
const load=(src,attr)=>{if(document.querySelector(`script[${attr}]`))return;const s=document.createElement('script');s.src=src;s.defer=true;s.setAttribute(attr,'1');document.body.appendChild(s)};
const fixLogo=()=>document.querySelectorAll('.brand img').forEach(img=>{img.src=logo;img.alt='ZONA 33';img.removeAttribute('onerror')});
const fixSite=()=>document.querySelectorAll('button').forEach(btn=>{if(String(btn.textContent||'').trim().toUpperCase()==='SITIO')btn.onclick=()=>window.location.assign(LANDING)});
const fix=()=>{fixLogo();fixSite();document.querySelectorAll('a.brand').forEach(a=>a.href=LANDING);load('/enhancements5.js?v=20260827-cms4','data-z33-cms');load('/enhancements6.js?v=20260827-cal5','data-z33-calendar');load('/enhancements9.js?v=20260827-admin9','data-z33-admin')};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',fix,{once:true});else fix();
})();
