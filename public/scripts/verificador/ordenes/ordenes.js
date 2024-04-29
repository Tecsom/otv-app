import { fetchData, loadingButton, isoDateToFormatted } from '/public/scripts/helpers.js';
let verification_mode = false;

const optiones_html = `
  <button class="btn btn-primary btn-sm btn-opciones-pieza">
    <i class="ti ti-eye"></i>
  </button>
  `;

const table_piezas = $('#table_piezas_oc').DataTable({
  language: {
    url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json'
  },
  columns: [
    { data: 'codigo', title: '#CODIGO' },
    { data: 'numero_parte', title: 'No. de parte' },
    { data: 'revision', title: 'Revisión' },
    { data: 'descripcion', title: 'Descripción' },
    { defaultContent: optiones_html, title: 'Opciones' }
  ],
  searching: false,
  paging: false,
  info: false,
  autoWidth: false,
  rowGroup: {
    dataSrc: 'numero_parte'
  }
});

$(document).ready(function () {
  // $('#modal_view_pieza').modal('show');

  $('#folio_oc').text(ordenData.folio_unico);
  $('#fecha_entrega_oc').text(isoDateToFormatted(ordenData.fecha_entrega));
  console.log(ordenData);
  const data_table_piezas = [];
  const { productos, codigos } = ordenData;

  for (const codigo of codigos) {
    const { code, numero_parte, verified } = codigo;
    const producto = productos.find(producto => producto.numero_parte === numero_parte);
    data_table_piezas.push({
      codigo: code,
      verified,
      numero_parte: producto.numero_parte,
      revision: producto.revisiones.nombre,
      descripcion: producto.descripcion
    });
  }
  table_piezas.rows.add(data_table_piezas).draw();
  //if pieza is verified set background color to green
  const rows = table_piezas.rows().nodes().to$();
  rows.each((index, row) => {
    const cells = $(row).find('td');
    const codigo = $(cells[0]).text();
    const pieza = data_table_piezas.find(pieza => pieza.codigo === codigo);
    if (pieza.verified) {
      // $('#table_piezas_oc tr').removeClass('bg-label-success');
      $(row).addClass('bg-label-success');
    }
  });
});

$('#startVerificacion').on('click', function () {
  $('#start_verificacion').modal('show');
});

$('#table_piezas_oc').on('click', '.btn-opciones-pieza', function () {
  const data = table_piezas.row($(this).parents('tr')).data();
  console.log(data);
  $('#modal_view_pieza').modal('show');
});

$('#start_verificacion_btn').on('click', function () {
  verification_mode = true;
  $('#start_verificacion').modal('hide');
  $('#save_verification_btn').removeClass('d-none');
  $('#startVerificacion').addClass('d-none');
});

const socket = io.connect();
socket.on('scanner', data => {
  if (verification_mode === true) {
    verificarPieza(data);
  }
});

const verificarPieza = async codigo => {
  const table_data = table_piezas.rows().data().toArray();
  const pieza = table_data.find(pieza => pieza.codigo === codigo);

  if (!pieza) {
    console.error('Pieza no encontrada');
    return;
  }

  if (pieza.verified) {
    toastr.warning('Pieza ya verificada');
    return;
  }

  //set background color green to verified row
  const row = table_piezas.rows().nodes().to$().find(`td:contains(${codigo})`).parent();
  row.addClass('bg-label-success');
  const cells = row.find('td');

  //set datatable row data to verified
  pieza.verified = true;
  table_piezas.rows().invalidate().draw();
};

$('#save_verification_btn').on('click', async function () {
  const table_data = table_piezas.rows().data().toArray();
  const piezas = table_data.filter(pieza => pieza.verified === true);
  const piezas_verificadas = piezas.map(pieza => {
    console.log({ pieza });
    return {
      codigo: pieza.codigo
    };
  });
  const order_id = ordenData.id;
  const button = new loadingButton($(this), 'Guardando...');

  if (piezas_verificadas.length === 0) {
    toastr.error('No se ha verificado ninguna pieza');
    return;
  }

  const data = {
    order_id,
    piezas_verificadas
  };

  console.log({ data });

  button.start();
  const response = await fetchData('/ordenes/verificar', 'POST', data);
  button.stop();

  if (response.status === true) {
    toastr.success('Piezas verificadas correctamente');
    verification_mode = false;
    $('#save_verification_btn').addClass('d-none');
    $('#startVerificacion').removeClass('d-none');
    $('#start_verificacion').modal('hide');
  } else {
    toastr.error('Error al verificar piezas');
  }
});
