verificaciones_table = $('#verificaciones_table').DataTable({
  language: {
    url: '//cdn.datatables.net/plug-ins/1.10.19/i18n/Spanish.json'
  },
  columns: [
    { data: 'fecha', title: 'Fecha' },
    { data: 'total_verificaciones', title: 'total' }
  ],
  dom: 'rtp',
  language: {
    url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json'
  },
  order: [[0, 'asc']],
  autoWidth: false
});

verificaciones_table.on('click', 'tr', async function () {
  const data = verificaciones_table.row(this).data();
  const verifications = data.verifications;
  $('#view_verifications_modal').modal('show');
  $('#list-verifications').empty();
  verifications.forEach(verification => {
    const codigos = codigos_table.rows().data().toArray();

    console.log({ codigos, verification });

    const numero_parte = codigos.find(codigo => codigo.code === verification.codigo).numero_parte;

    console.log({ numero_parte });
    $('#list-verifications').append(`
      <li class="list-group-item d-flex justify-content-between align-items-center flex-row">
        <span>${verification.codigo}</span>
        <span>${numero_parte}</span>
      </li>
    `);
  });
});