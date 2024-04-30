import { fetchData, loadingButton, isoDateToFormatted } from '/public/scripts/helpers.js';
let verification_mode = false;

const renderListImage = (name, url) => {
  return `<a ${url && 'signed-url=' + url} href="javascript:void(0);" class="list-group-item list-group-item-action">${name}</a>`;
};

const renderListFile = (name, url, filename) => {
  return `

    <a href="javascript:void(0);"  class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
      ${name} 
      <button style="box-shadow: none;" signed-url=${url} file-name="${filename}" type="button" class="btn btn-icon download-file">
        <span class="ti ti-download"></span>
      </button>
    </a>
  `;
};

const optiones_html = `
  <button class="btn btn-primary btn-sm btn-opciones-pieza">
    <i class="ti ti-eye"></i>
  </button>
  `;

table_piezas = $('#table_piezas_oc').DataTable({
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
      verified: false,
      numero_parte: producto.numero_parte,
      revision: producto.revisiones.nombre,
      descripcion: producto.descripcion,
      producto
    });
  }
  table_piezas.rows.add(data_table_piezas).draw();
  //if pieza is verified set background color to green
  // const rows = table_piezas.rows().nodes().to$();
  // rows.each((index, row) => {
  //   const cells = $(row).find('td');
  //   const codigo = $(cells[0]).text();
  //   const pieza = data_table_piezas.find(pieza => pieza.codigo === codigo);
  //   if (pieza.verified) {
  //     // $('#table_piezas_oc tr').removeClass('bg-label-success');
  //     $(row).addClass('bg-label-success');
  //   }
  // });
});

$('#startVerificacion').on('click', function () {
  $('#start_verificacion').modal('show');
});

$('#table_piezas_oc').on('click', '.btn-opciones-pieza', async function () {
  const data = table_piezas.row($(this).parents('tr')).data();
  const producto = data.producto;
  console.log({ producto, data });
  $('#pieza_numero_parte').text(producto.numero_parte);
  $('#pieza_numero_parte_title').text(producto.numero_parte);
  $('#pieza_revision').text(producto.revisiones.nombre);
  $('#pieza_descripcion').text(producto.descripcion);
  $('#pieza_cantidad').text(producto.quantity);
  $('#modal_view_pieza').modal('show');

  // /clientes/:cliente_id/piezas/:pieza_id/revisiones/:revision_id/files

  const files_res = await fetchData(
    `/clientes/${producto.client_id}/piezas/${producto.pieza_id}/revisiones/${producto.revisiones.id}/files`
  );
  if (files_res.status === true) {
    const { images, files } = files_res.data;
    const list_images = images.map(image => renderListImage(image.name, image.data)).join('');
    const list_files = files.map(file => renderListFile(file.name, file.data, file.name)).join('');

    $('#pieza_files_list').html(list_files);
    $('#pieza_images_list').html(list_images);
  }
});

$('#pieza_files_list').on('click', 'button', async function () {
  const url = $(this).attr('signed-url');
  const filename = $(this).attr('file-name');
  console.log({ url, filename });

  const response = await fetch(url);

  const blob = await response.blob();

  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  link.remove();
});

$('#pieza_images_list').on('click', 'a', function () {
  const url = $(this).attr('signed-url');
  const lightbox = new FsLightbox();
  lightbox.props.sources = [url];
  lightbox.open();
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
