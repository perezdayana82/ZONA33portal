(() => {
  'use strict';

  const db = window.supabase.createClient(
    'https://ponhllwbvhtczaphfdgw.supabase.co',
    'sb_publishable_okgoHkX2YZFtQ9P72ckztQ_jiCuWN-6',
    { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }
  );

  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));

  function openDrawer(title, html) {
    const overlay = document.querySelector('#z33-drawer-overlay');
    const drawer = document.querySelector('#z33-drawer');
    if (!overlay || !drawer) return false;
    overlay.classList.add('show');
    drawer.classList.add('show');
    drawer.innerHTML = `<div class="z33a-drawer-head"><div><div class="z33a-kicker">ZONA 33</div><h3>${title}</h3></div><button class="z33a-btn" onclick="window.z33CloseDrawer()">Cerrar</button></div>${html}`;
    return true;
  }

  async function waitForAdmin() {
    for (let i = 0; i < 80; i += 1) {
      if (document.querySelector('#z33-drawer') && window.z33CloseDrawer) return;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  window.z33PaymentForm = async function paymentFormFixed() {
    await waitForAdmin();

    const { data: clients, error: clientsError } = await db
      .from('profiles')
      .select('id,full_name,email')
      .eq('role', 'cliente')
      .order('full_name');

    if (clientsError) {
      alert(`No se pudieron cargar los clientes: ${clientsError.message}`);
      return;
    }

    if (!clients?.length) {
      alert('No hay clientes registrados para asignar el pago.');
      return;
    }

    if (!openDrawer('Registrar pago', `
      <form id="z33-payment-fix-form" class="z33a-form">
        <div class="z33a-row">
          <label>Cliente
            <select id="z33pf-client" required>
              ${clients.map((c) => `<option value="${esc(c.id)}">${esc(c.full_name || 'Cliente')} — ${esc(c.email || '')}</option>`).join('')}
            </select>
          </label>
          <label>Concepto<input id="z33pf-concept" value="Mensualidad" required></label>
        </div>
        <div class="z33a-row">
          <label>Monto<input id="z33pf-amount" type="number" min="0" step="1" value="500" required></label>
          <label>Fecha<input id="z33pf-date" type="date" value="${new Date().toISOString().slice(0,10)}" required></label>
        </div>
        <div class="z33a-row">
          <label>Método
            <select id="z33pf-method">
              <option value="transferencia">Transferencia</option>
              <option value="ficha">Ficha</option>
              <option value="online">Online</option>
              <option value="efectivo">Efectivo</option>
              <option value="tarjeta">Tarjeta</option>
            </select>
          </label>
          <label>Estado
            <select id="z33pf-status">
              <option value="approved">Pagado</option>
              <option value="pending">Pendiente</option>
              <option value="rejected">Rechazado</option>
            </select>
          </label>
        </div>
        <label>Notas<textarea id="z33pf-notes" placeholder="Nota opcional"></textarea></label>
        <div class="z33a-muted">Los pagos administrativos se guardan directamente en Finanzas y quedan ligados al cliente.</div>
        <div class="z33a-actions-row">
          <button type="button" class="z33a-btn" onclick="window.z33CloseDrawer()">Cancelar</button>
          <button class="z33a-btn red" id="z33pf-save">Guardar pago</button>
        </div>
        <div id="z33pf-error" class="z33a-muted" style="color:#b42318"></div>
      </form>
    `)) return;

    const form = document.querySelector('#z33-payment-fix-form');
    const errorBox = document.querySelector('#z33pf-error');
    const button = document.querySelector('#z33pf-save');
    if (!form || !button) return;

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      button.disabled = true;
      button.textContent = 'Guardando…';
      errorBox.textContent = '';

      const payload = {
        p_profile_id: document.querySelector('#z33pf-client').value,
        p_amount: Number(document.querySelector('#z33pf-amount').value || 0),
        p_method: document.querySelector('#z33pf-method').value,
        p_status: document.querySelector('#z33pf-status').value,
        p_concept: document.querySelector('#z33pf-concept').value.trim() || 'Mensualidad',
        p_payment_date: document.querySelector('#z33pf-date').value,
        p_notes: document.querySelector('#z33pf-notes').value.trim() || null,
      };

      if (!(payload.p_amount >= 0)) {
        errorBox.textContent = 'El monto no es válido.';
        button.disabled = false;
        button.textContent = 'Guardar pago';
        return;
      }

      const { error } = await db.rpc('admin_record_payment', payload);
      if (error) {
        errorBox.textContent = `No se pudo registrar: ${error.message}`;
        button.disabled = false;
        button.textContent = 'Guardar pago';
        return;
      }

      window.z33CloseDrawer?.();
      window.location.reload();
    });
  };
})();
