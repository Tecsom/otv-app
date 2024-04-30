import { fetchData, loadingButton } from '/public/scripts/helpers.js';

const per_page = 10;

piezas_table = $('#piezas_table').DataTable({
  select: {
    style: 'multi',
    selector: 'td:not(.non-selectable)'
  },
  columns: [
    { data: 'numero_parte', title: 'Número de parte', orderable: false, className: 'non-selectable' },
    { data: 'descripcion', title: 'Descripción', orderable: false, className: 'non-selectable' },
    { data: 'revision', title: 'Revisión', orderable: false, className: 'non-selectable' }
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
  ajax: '/api/clientes/:id/piezas/paging?cliente_id=' + clientData.id
});

$('#search_equipment').on('keyup', function () {
  piezas_table.search($('#search_equipment').val()).draw();
});
