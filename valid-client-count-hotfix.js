(()=>{
'use strict';
const U='https://ponhllwbvhtczaphfdgw.supabase.co',K='sb_publishable_okgoHkX2YZFtQ9P72ckztQ_jiCuWN-6';
const db=window.supabase.createClient(U,K,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
async function fix(){const {data=[]}=await db.from('profiles').select('id,full_name').eq('role','cliente').neq('full_name','');const root=document.getElementById('zf-content');if(!root)return;root.querySelectorAll('.z33s-stat').forEach(card=>{const s=card.querySelector('span');if(s&&s.textContent.trim()==='Total clientes'){const b=card.querySelector('b');if(b)b.textContent=data.length}})}
let once=false;const wrap=()=>{if(once||typeof window.route!=='function')return;const old=window.route;window.route=async p=>{const r=old(p);if(p==='dashboard'||p==='finance')setTimeout(fix,120);return r};once=true};const t=setInterval(()=>{wrap();if(once)clearInterval(t)},80);setTimeout(wrap,1200);
})();