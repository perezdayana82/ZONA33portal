// ZONA 33 · Cliente: pagos y vigencia
(function(){
  const WHATSAPP='522229195074';
  const whatsappUrl=(text)=>`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;

  window.clientPayments=function(c){
    const active=state.memberships.find(x=>x.status==='active'&&x.end_date>=today());
    const daysRemaining=active?.end_date
      ? Math.max(0,Math.ceil((new Date(active.end_date+'T23:59:59')-new Date())/86400000))
      : 0;

    c.innerHTML=`
      <div class="hero">
        <div class="ey">Pagos</div>
        <h2>Mi <span>historial.</span></h2>
      </div>

      ${active?`<div class="card" style="margin-bottom:14px">
        <div class="ey">Membresía actual</div>
        <div class="grid grid2" style="align-items:center">
          <div>
            <h2 style="margin-bottom:6px">${esc(active.membership_plans?.name||'Membresía')}</h2>
            <p class="muted" style="margin:0">Vigencia hasta ${esc(dateText(active.end_date))}</p>
          </div>
          <div style="text-align:right">
            <strong style="font:900 42px/.9 'Barlow Condensed';display:block">${daysRemaining}</strong>
            <span class="pill ${daysRemaining<=5?'warn':'ok'}">DÍAS RESTANTES</span>
          </div>
        </div>
      </div>`:''}

      <div class="card" style="margin-bottom:14px">
        <div class="ey">Renovación</div>
        <h2>Membresía mensual</h2>
        <p class="muted">Para realizar o renovar tu pago, contáctanos por WhatsApp.</p>
        <button class="btn red" onclick="window.open('${whatsappUrl('Hola ZONA 33, quiero realizar mi pago de la membresía mensual.')}','_blank')">
          REALIZAR PAGO POR WHATSAPP
        </button>
      </div>

      <div class="card">
        <div class="ey">Historial de pagos</div>
        <div class="list">
          ${state.payments.length?state.payments.map(x=>`<div class="item">
            <div>
              <b>${esc(x.membership_plans?.name||'Pago')}</b>
              <small>${esc(new Date(x.created_at).toLocaleDateString('es-MX'))} · ${esc(x.method)}</small>
            </div>
            <div>
              <strong>${money(x.amount)}</strong>
              <span class="pill ${x.status==='paid'?'ok':'warn'}">${esc(x.status)}</span>
            </div>
          </div>`).join(''):'<div class="empty">Aún no hay pagos registrados.</div>'}
        </div>
      </div>`;
  };

  // Carga el parche final del portal admin después de los demás overrides.
  const s=document.createElement('script');
  s.src='./enhancements18.js?v=20260901-3';
  s.onload=()=>console.log('ZONA33 admin fixes loaded');
  s.onerror=()=>console.error('No se pudo cargar enhancements18.js');
  document.head.appendChild(s);
})();
