import { fetchData, loadingButton } from '/public/scripts/helpers.js';

const previewTemplate = `<div class="dz-preview dz-file-preview">
<div class="dz-details">
  <div class="dz-thumbnail">
    <img data-dz-thumbnail>
    <span class="dz-nopreview">No preview</span>
    <div class="dz-success-mark"></div>
    <div class="dz-error-mark"></div>
    <div class="dz-error-message"><span data-dz-errormessage></span></div>
    <div class="progress">
      <div class="progress-bar progress-bar-primary" role="progressbar" aria-valuemin="0" aria-valuemax="100" data-dz-uploadprogress></div>
    </div>
  </div>
  <div class="dz-filename" data-dz-name></div>
  <div class="dz-size" data-dz-size></div>
</div>
</div>`;

const per_page = 10;

piezas_table = $('#piezas_table').DataTable({
  select: {
    style: 'multi',
    selector: 'td:not(.non-selectable)'
  },
  columns: [
    { data: 'numero_parte', title: 'Número de parte', orderable: true, className: 'non-selectable' },
    { data: 'descripcion', title: 'Descripción', orderable: true, className: 'non-selectable' }
  ],
  dom: 'rtp',
  language: {
    url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json'
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
