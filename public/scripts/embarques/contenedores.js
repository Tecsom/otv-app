const defaultOptionsDestinos = `<div class="d-inline-block text-nowrap">
<button class="btn btn-sm btn-icon edit-icon editar-destino" title="Editar" data-bs-toggle="tooltip" data-bs-placement="top"><i class="ti ti-edit"></i></button>
<button class="btn btn-sm btn-icon delete-icon eliminar-destino" title="Eliminar" data-bs-toggle="tooltip" data-bs-placement="top"><i class="ti ti-trash-x"></i></button>
</div>`;

const defaultOptionsProducts = `<div class="d-inline-block text-nowrap">
<button class="btn btn-sm btn-icon delete-icon eliminar-producto" title="Eliminar" data-bs-toggle="tooltip" data-bs-placement="top"><i class="ti ti-trash-x"></i></button>
</div>`;

const defaultOptions = `<div class="d-inline-block text-nowrap">
<button class="btn btn-sm btn-icon edit-icon editar-contenedor" title="Editar" data-bs-toggle="tooltip" data-bs-placement="top"><i class="ti ti-edit"></i></button>
<button class="btn btn-sm btn-icon delete-icon eliminar-contenedor" title="Eliminar" data-bs-toggle="tooltip" data-bs-placement="top"><i class="ti ti-trash-x"></i></button>
</div>`;
const tableActions = `<div class="d-inline-block text-nowrap">
                        <button class="btn btn-sm btn-icon barcode-icon" title="Editar" data-bs-toggle="tooltip" data-bs-placement="top"><i class="ti ti-barcode"></i></button>
                    </div>`;

contenedores_table = $('#contenedores_table').DataTable({
  columns: [
    { title: 'nombre', data: 'nombre_contenedor' },
    { title: 'codigo', data: 'codigo_contenedor' },
    { title: '# productos', data: 'cantidad' },
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

productos_table = $('#productos_table_tab').DataTable({
  columns: [
    { title: 'cliente', data: 'cliente' },
    { title: 'producto', data: 'nombre_producto' },
    { title: 'descripcion', data: 'descripcion_producto' },
    { title: 'cantidad', data: 'cantidad' },
    { title: 'acciones', defaultContent: defaultOptionsProducts, width: '30px' }
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
    dataSrc: 'contenedor',
    startRender: function (rows, group) {
      return group;
    }
  }
});

destinos_table = $('#destinos_table').DataTable({
  columns: [
    { title: 'cliente', data: 'cliente' },
    { title: 'ubicacion', data: 'domicilio' },
    { title: 'correo', data: 'correo' },
    { title: 'telefono', data: 'telefono' },
    { defaultContent: defaultOptionsDestinos, width: '30px' }
  ],
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

codigos_table = $('#codigos_table').DataTable({
  columns: [
    { title: 'contenedor', data: 'contenedor' },
    //{ title: 'ultimo escaneo' },
    { title: 'acciones', defaultContent: tableActions }
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
  }
});

$('#codigos_table').on('click', 'tbody tr button', async function (e) {
  const buttonClicked = $(this); // Obtener el botón que ha sido clicado
  const row = buttonClicked.closest('tr'); // Encontrar la fila asociada al botón clicado
  const data = $('#codigos_table').DataTable().row(row).data(); // Obtener los datos de la fila

  if (buttonClicked.hasClass('barcode-icon')) {
    //VERIFICAR QUE TIPO DE CODIGO NECESITA
    showBarcode(data);
  }
});

const showBarcode = async data => {
  const code_type = 'QR';
  //get templateCustomizer-vertical-menu-template-starter--Style from localstorage
  const colorPref = localStorage.getItem('templateCustomizer-vertical-menu-template-starter--Style');
  $('#viewCodeModal').modal('show');
  $('#codeWrapper').empty();
  if (code_type == 'QR') {
    const svgNode = QRCode(data.codigo);

    $('#codeWrapper').append(svgNode);
  } else if (code_type == 'DM') {
    const svgNode = DATAMatrix(data.codigo);

    $('#codeWrapper').append(svgNode);
  }
  $('#codeWrapper svg').attr('fill', colorPref === 'dark' ? '#fff' : '#000');
};
