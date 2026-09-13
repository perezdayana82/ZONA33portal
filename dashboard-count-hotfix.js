(()=>{
'use strict';
const U='https://ponhllwbvhtczaphfdgw.supabase.co',K='sb_publishable_okgoHkX2YZFtQ9P72ckztQ_jiCuWN-6';
const db=window.supabase.createClient(U,K,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
const today=()=>new Date().toISOString().slice(0,10);
async function fix(){const [{data:clients=[]},{data:ms=[]}]=await Promise.all([db.from('profiles').select('id').eq('role','cliente').not('full_name','is',null),db.from('memberships').select('profile_id,status,end_date,created_at').order('created_at',{ascending:false})]);const latest=new Map();ms.forEach(m=>{if(!latest.has(m.profile_id))latest.set(m.profile_id,m)});const active=clients.filter(c=>{const m=latest.get(c.id);return m&&m.status==='active'&&m.end_date>=today()}).length;document.querySelectorAll('#zf-content .zf-stat').forEach(s=>{const span=s.querySelector('span');if(span&&span.textContent.trim()==='Membresías activas'){const b=s.querySelector('b');if(b)b.textContent=active}})}
let done=false;const wrap=()=>{if(done||typeof window.route!=='function')return;const old=window.route;window.route=async p=>{const r=await old(p);if(p==='dashboard')setTimeout(fix,80);return r};done=true};const t=setInterval(()=>{wrap();if(done)clearInterval(t)},80);setTimeout(wrap,1200);
})();