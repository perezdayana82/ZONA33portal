// ZONA 33 · Exportación Excel real para el portal admin
(function(){
  const escXml=v=>String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
  const download=(blob,name)=>{const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)};

  window.exportClientsExcel=function(){
    if(typeof role!=='undefined'&&role!=='admin')return toast('Solo un administrador puede exportar clientes.');
    const rows=(state.clients||[]).map(x=>({
      'Nombre':x.full_name||'',
      'Correo':x.email||'',
      'Teléfono':x.phone||'',
      'Fecha de nacimiento':x.birth_date||'',
      'Estado':x.is_active?'Activo':'Inactivo',
      'Fecha de registro':x.created_at?new Date(x.created_at).toLocaleDateString('es-MX'):''
    }));
    if(!rows.length)return toast('No hay clientes para exportar.');
    const cols=Object.keys(rows[0]);
    if(window.XLSX){
      const ws=XLSX.utils.json_to_sheet(rows,{header:cols});
      ws['!cols']=cols.map(k=>({wch:Math.min(32,Math.max(14,k.length+4))}));
      const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,'Clientes');
      XLSX.writeFile(wb,'ZONA33_clientes.xlsx');
      return;
    }
    const xml='<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="Clientes"><Table>'+
      '<Row>'+cols.map(c=>`<Cell><Data ss:Type="String">${escXml(c)}</Data></Cell>`).join('')+'</Row>'+rows.map(r=>'<Row>'+cols.map(c=>`<Cell><Data ss:Type="String">${escXml(r[c])}</Data></Cell>`).join('')+'</Row>').join('')+
      '</Table></Worksheet></Workbook>';
    download(new Blob([xml],{type:'application/vnd.ms-excel;charset=utf-8'}),'ZONA33_clientes.xls');
  };

  window.exportReservationsExcel=async function(){
    if(typeof role!=='undefined'&&role!=='admin')return toast('Solo un administrador puede exportar reservas.');
    const {data,error}=await sb.rpc('admin_list_reservations');
    if(error)return toast(error.message||'No se pudieron obtener las reservas.');
    const rows=(Array.isArray(data)?data:[]).map(r=>({
      'Fecha':r.class_date||'',
      'Hora':String(r.start_time||'').slice(0,5),
      'Clase':r.class_type||'Functional',
      'Coach':r.coach_name||'',
      'Cliente':r.client_name||'',
      'Correo':r.client_email||'',
      'Estado':r.status||'',
      'Cupo':r.capacity??''
    }));
    if(!rows.length)return toast('No hay reservas para exportar.');
    const cols=Object.keys(rows[0]);
    if(window.XLSX){
      const ws=XLSX.utils.json_to_sheet(rows,{header:cols});
      ws['!cols']=cols.map(k=>({wch:Math.min(28,Math.max(12,k.length+4))}));
      const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,'Reservas');
      XLSX.writeFile(wb,'ZONA33_reservas.xlsx');
      return;
    }
    const xml='<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="Reservas"><Table>'+
      '<Row>'+cols.map(c=>`<Cell><Data ss:Type="String">${escXml(c)}</Data></Cell>`).join('')+'</Row>'+rows.map(r=>'<Row>'+cols.map(c=>`<Cell><Data ss:Type="String">${escXml(r[c])}</Data></Cell>`).join('')+'</Row>').join('')+
      '</Table></Worksheet></Workbook>';
    download(new Blob([xml],{type:'application/vnd.ms-excel;charset=utf-8'}),'ZONA33_reservas.xls');
  };

  const baseClients=window.adminClients;
  window.adminClients=async function(c){
    if(typeof baseClients==='function')await baseClients(c);
    const hero=c.querySelector('.hero');
    if(hero&&!hero.querySelector('[data-export-clients]')){
      const b=document.createElement('button');
      b.className='btn out';b.dataset.exportClients='1';b.textContent='DESCARGAR EXCEL';b.onclick=exportClientsExcel;
      hero.appendChild(b);
    }
  };

  const baseReservations=window.adminReservations;
  window.adminReservations=async function(c){
    await baseReservations(c);
    const hero=c.querySelector('.hero');
    if(hero&&!hero.querySelector('[data-export-reservations]')){
      const b=document.createElement('button');
      b.className='btn out';b.dataset.exportReservations='1';b.textContent='DESCARGAR EXCEL';b.onclick=exportReservationsExcel;
      hero.appendChild(b);
    }
  };
})();
