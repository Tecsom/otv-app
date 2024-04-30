const per_page = 20;

clientes_table = $('#clientes_table').DataTable({
  select: {
    style: 'multi',
    selector: 'td:not(.non-selectable)'
  },
  columns: [
    { data: 'nombre', title: 'Nombre', orderable: true, className: 'non-selectable' },
    { data: 'identificador', title: 'Identificador', orderable: true, className: 'non-selectable' },
    { data: 'domicilio', title: 'Domicilio', orderable: false, className: 'non-selectable' }
  ],
  dom: 'rtp',
  language: {
    url: 'https://cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json'
  },
  order: [[0, 'asc']],
  paging: true,
  searching: true,
  pageLength: per_page,
  processing: true,
  serverSide: true,
  ajax: '/api/clientes/paging'
});

$('#search-client').on('keyup', function () {
  clientes_table.search($('#search-client').val()).draw();
});
