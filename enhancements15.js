(()=>{
const SB_URL='https://ponhllwbvhtczaphfdgw.supabase.co';
const SB_KEY='sb_publishable_okgoHkX2YZFtQ9P72ckztQ_jiCuWN-6';
const api=supabase.createClient(SB_URL,SB_KEY,{auth:{persistSession:true,autoRefreshToken:true}});
const tx=m=>window.toast?window.toast(m):console.log(m);
const reserve=async id=>{
 if(!id)return tx('No se encontró la clase.');
 const {error}=await api.rpc('reserve_class',{p_class_id:id});
 if(error)return tx(error.message);
 if(typeof window.refresh==='function')await window.refresh();
 tx('Clase reservada correctamente.');
 if(typeof window.go==='function')window.go('reservations');
};
window.reserve=reserve;
})();
