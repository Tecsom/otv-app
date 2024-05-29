const defaultOptions = `<div class="d-inline-block text-nowrap">
<button class="btn btn-sm btn-icon edit-icon editar-contenedor" title="Editar" data-bs-toggle="tooltip" data-bs-placement="top"><i class="ti ti-edit"></i></button>
<button class="btn btn-sm btn-icon delete-icon eliminar-contenedor" title="Eliminar" data-bs-toggle="tooltip" data-bs-placement="top"><i class="ti ti-trash-x"></i></button>
</div>`;

contenedores_table = $('#contenedores_table').DataTable({
  columns: [
    { title: 'nombre', data: 'nombre_contenedor' },
    { title: 'codigo', data: 'codigo_contenedor' },
    { title: 'acciones', defaultContent: defaultOptions, width: '30px' }
  ],
  pageLength: 5,
  orderable: false,
  lengthChange: false,
  info: false,
  searching: false,
  ordering: false,
  destroy: true,
  language: {
    url: 'https://cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json'
  }
});
productos_table = $('#productos_table').DataTable({
  columns: [
    { title: 'nombre', data: '1' },
    { title: 'codigo', data: '2' },
    { title: 'acciones', defaultContent: defaultOptions, width: '30px' }
  ],
  pageLength: 5,
  orderable: false,
  lengthChange: false,
  info: false,
  searching: false,
  ordering: false,
  destroy: true,
  language: {
    url: 'https://cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json'
  }
});
