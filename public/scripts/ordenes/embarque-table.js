embarques_table = $('#embarque_table_nav').DataTable({
  columns: [
    { title: 'producto', data: 'producto' },
    { title: 'fecha de embarque', data: 'fecha_embarque' }
  ],
  pageLength: 10,
  orderable: false,
  lengthChange: false,
  info: false,
  searching: false,
  ordering: false,
  destroy: true,
  language: {
    url: 'https://cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json'
  },
  rowGroup: {
    dataSrc: 'codigo_contenedor'
  }
});
