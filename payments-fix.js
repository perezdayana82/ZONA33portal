(()=>{
const SB_URL='https://ponhllwbvhtczaphfdgw.supabase.co',SB_KEY='sb_publishable_okgoHkX2YZFtQ9P72ckztQ_jiCuWN-6';
const payApi=supabase.createClient(SB_URL,SB_KEY,{auth:{persistSession:true,autoRefreshToken:true}});
const escPay=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const wa='https://wa.me/522229195074';
function goWhatsApp(plan){const text=encodeURIComponent(`Hola, quiero contratar el plan ${plan||''} de ZONA 33. Quiero completar mi pago.`);window.location.href=`${wa}?text=${text}`}
window.goWhatsApp=goWhatsApp;
async function confirmPayment(id){if(!id)return toast('No se encontró el pago.');const {data,error}=await payApi.rpc('admin_confirm_payment',{p_payment_id:id,p_method:'Transferencia'});if(error)return toast(error.message);toast('Pago confirmado. Membresía activa.');if(typeof window.refresh==='function')await window.refresh();}
window.confirmPayment=confirmPayment;
const oldPlans=window.adminMemberships;
if(oldPlans) window.adminMemberships=async function(c){return oldPlans(c)};
const oldClient=window.clientMembership;
if(oldClient) window.clientMembership=async function(c){return oldClient(c)};
})();
