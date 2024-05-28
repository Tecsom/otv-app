const defaultOptions = `
<div class="d-inline-block text-nowrap" id="embarque-producto-table">
  <button class="btn btn-sm btn-icon delete-icon eliminar-producto" title="Eliminar" data-bs-toggle="tooltip" data-bs-placement="top"><i class="ti ti-trash-x"></i></button>
</div>`;

contenedores_table = $('#contenedores_table').DataTable({
  columns: [
    { title: 'Producto', data: 'producto' },
    { title: 'Descripción', data: 'descripcion_producto' },
    { title: 'Cantidad', data: 'cantidad' },
    { title: 'Acciones', defaultContent: defaultOptions, width: '30px' }
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
  },
  rowGroup: {
    dataSrc: 'nombre_contenedor'
  }
});
