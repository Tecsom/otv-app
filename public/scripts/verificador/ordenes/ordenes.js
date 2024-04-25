import { fetchData, loadingButton, isoDateToFormatted } from '/public/scripts/helpers.js';

// <th>#CODIGO</th>
//             <th>No. de parte</th>
//             <th>Revisión</th>
//             <th>Descripción</th>
//             <th>Opciones</th>

const table_piezas = $('#table_piezas_oc').DataTable({
  language: {
    url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json'
  },
  columns: [
    { data: 'codigo', title: '#CODIGO' },
    { data: 'numero_parte', title: 'No. de parte' },
    { data: 'revision', title: 'Revisión' },
    { data: 'descripcion', title: 'Descripción' }
  ],
  searching: false,
  paging: false,
  info: false
});

$(document).ready(function () {
  // $('#modal_view_pieza').modal('show');

  $('#folio_oc').text(ordenData.folio_unico);
  $('#fecha_entrega_oc').text(isoDateToFormatted(ordenData.fecha_entrega));
  console.log(ordenData);
  const data_table_piezas = [];
  const { productos, codigos } = ordenData;

  for (const codigo of codigos) {
    const { code, numero_parte } = codigo;
    const producto = productos.find(producto => producto.numero_parte === numero_parte);
    console.log({ codigo });
    data_table_piezas.push({
      codigo: code,
      numero_parte: producto.numero_parte,
      revision: producto.revisiones.nombre,
      descripcion: producto.descripcion
    });
  }

  table_piezas.rows.add(data_table_piezas).draw();
});

$('#startVerificacion').on('click', function () {
  $('#start_verificacion').modal('show');
});
