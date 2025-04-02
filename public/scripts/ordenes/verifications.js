verificaciones_table = $('#verificaciones_table').DataTable({
  language: {
    url: 'https://cdn.datatables.net/plug-ins/1.10.19/i18n/Spanish.json'
  },
  columns: [
    { data: 'fecha', title: 'Fecha' },
    { data: 'total_verificaciones', title: 'total', defaultContent: '' },
    { data: 'userName', title: 'Usuario', defaultContent: '' }
  ],
  dom: 'rtp',
  language: {
    url: 'https://cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json'
  },
  order: [[0, 'asc']],
  autoWidth: false
});

const verificacion_table = $('#verificacion_table').DataTable({
  language: {
    url: 'https://cdn.datatables.net/plug-ins/1.10.19/i18n/Spanish.json'
  },
  columns: [
    {
      data: null,
      title: '<input type="checkbox" id="select-all" class="form-check-input">', // Checkbox en el encabezado
      orderable: false,
      className: 'dt-center',
      defaultContent: '<input type="checkbox" class="row-checkbox form-check-input">'
    },
    { data: 'codigo', title: 'Código' },
    { data: 'numero_parte', title: 'Número de parte' }
  ],
  dom: 'rtp',
  language: {
    url: 'https://cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json'
  },
  order: [[0, 'asc']],
  autoWidth: false,
  rowGroup: {
    dataSrc: 'numero_parte'
  },
  pageLength: 10
});

$('#verificacion_table thead').on('click', '#select-all', function () {
  let isChecked = this.checked;
  $('.row-checkbox').prop('checked', isChecked);
});

verificaciones_table.on('click', 'tr', async function () {
  const data = verificaciones_table.row(this).data();
  const verifications = data.verifications;
  $('#view_verifications_modal').modal('show');
  $('#list-verifications').empty();
  // verifications.forEach(verification => {
  //   const codigos = codigos_table.rows().data().toArray();

  //

  //   const numero_parte = codigos.find(codigo => codigo.code === verification.codigo).numero_parte;

  //
  //   $('#list-verifications').append(`
  //     <li class="list-group-item d-flex justify-content-between align-items-center flex-row">
  //       <span>${verification.codigo}</span>
  //       <span>${numero_parte}</span>
  //     </li>
  //   `);
  // });

  verificacion_table.clear().draw();
  verificacion_table.rows
    .add(
      verifications.map(verification => {
        const codigos = codigos_table.rows().data().toArray();
        const numero_parte = codigos.find(codigo => codigo.code === verification.codigo).numero_parte;
        return {
          codigo: verification.codigo,
          numero_parte
        };
      })
    )
    .draw();
});
// verificacion_table
