import { fetchData, loadingButton, isoDateToFormatted } from '/public/scripts/helpers.js';
let verification_mode = false;

let verificadas_array = [];
$('#exit-checker').on('click', async function () {
  $('#modal_quit_checker').modal('show');
});

$('#quit-checker-form').on('submit', async function (e) {
  e.preventDefault();
  const button = new loadingButton($('#button_confirm_quit'));
  button.start();

  const password = $('#password').val();

  if (password === '') {
    toastr.error('Por favor, ingrese su contraseña');
    return;
  }

  const res = await fetchData('/settings/quit-checker?password=' + password);

  if (res.status === true) {
    toastr.success('Contraseña correcta');
    localStorage.removeItem('checker');
    window.location.href = '/';

    return;
  }
  button.stop();
  toastr.error('Contraseña incorrecta');
});

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
  <button class="btn btn-sm btn-opciones-pieza">
    <i class="ti ti-eye"></i>
  </button>
  `;

table_piezas = $('#table_piezas_oc').DataTable({
  language: {
    url: 'https://cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json'
  },
  columns: [
    { data: 'codigo', title: '#CODIGO' },
    //{ data: 'numero_parte', title: 'No. de parte' },
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

$(document).ready(async function () {
  $('#folio_oc').text(ordenData.folio_unico);
  $('#fecha_entrega_oc').text(isoDateToFormatted(ordenData.fecha_entrega));
  $('#cliente_oc').text(ordenData?.cliente?.nombre ?? '-');
  $('#cliente_folio_oc').text(ordenData.folio_cliente);

  $('#client_avatar').text(ordenData?.cliente?.nombre.charAt(0).toUpperCase());

  const pp_res = await fetchData(`/clientes/${ordenData?.cliente?.id}/profile-photo`);
  if (pp_res.status === true) {
    $('#client_pp').attr('src', pp_res.data);
    $('#client_avatar').addClass('d-none');
    $('#client_pp').removeClass('d-none');
  }

  const data_table_piezas = [];
  const { productos, codigos } = ordenData;

  for (const codigo of codigos) {
    const { code, numero_parte, verified } = codigo;
    const producto = productos.find(producto => producto.codigos?.some(codigo => codigo === code));
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
  updateGeneralProgress();
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
  resetVerifications();
  verification_mode = true;
  $('#start_verificacion').modal('hide');
  $('#save_verification_btn').removeClass('d-none');
  $('#cancel_verificacion_btn').removeClass('d-none');
  $('#startVerificacion').addClass('d-none');

  $('#progress_verificacion').css('width', '0%');
  $('#progress_verificacion').text('Progreso de verificación (0%)');

  $('#container_general').addClass('d-none');
  $('#container_verificacion').removeClass('d-none');
  $('#select_verificaciones ~ span').addClass('d-none');
});

$('#cancel_verificacion_btn').on('click', function () {
  $('#cancel_verification_modal').modal('show');
});

$('#cancel_verification_modal_btn').on('click', function () {
  $('#cancel_verification_modal').modal('hide');
  $('#save_verification_btn').addClass('d-none');
  $('#cancel_verificacion_btn').addClass('d-none');
  $('#startVerificacion').removeClass('d-none');
  $('#select_verificaciones ~ span').removeClass('d-none');
  resetVerifications();
});

const resetVerifications = () => {
  $('tr').removeClass('bg-label-success');
  $('#select_verificaciones').val(null).trigger('change');
  const table_data = table_piezas.rows().data().toArray();
  table_data.forEach(pieza => {
    pieza.verified = false;
  });
  table_piezas.rows().invalidate().draw();
  $('#progress_verificacion').css('width', '0%');
  $('#progress_verificacion').text('Progreso de verificación (0%)');

  $('#container_verificacion').addClass('d-none');
  verificadas_array = [];
  $('#container_general').removeClass('d-none');

  updateGeneralProgress();

  verification_mode = false;
};

const socket = io.connect();
socket.on('scanner', data => {
  console.log({ verification_mode });
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
  if (!verificadas_array.includes(codigo)) {
    verificadas_array.push(codigo);

    const piezas_verificadas = verificadas_array.length;
    const piezas_totales = table_data.length;

    const progress = (piezas_verificadas / piezas_totales) * 100;

    $('#progress_verificacion').css('width', `${progress}%`);
    $('#progress_verificacion').text(`Progreso de verificación (${progress.toFixed(2)}%)`);
  }
};
$('#save_verification_modal_btn').on('click', async function () {
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
    resetVerifications();
    $('#save_verification_btn').addClass('d-none');
    $('#cancel_verificacion_btn').addClass('d-none');
    $('#startVerificacion').removeClass('d-none');
    $('#start_verificacion').modal('hide');

    $('#container_general').removeClass('d-none');
    $('#container_verificacion').addClass('d-none');

    verificadas_array = [];
    ordenData.codigos = ordenData.codigos.map(pieza => {
      if (piezas_verificadas.find(pieza_verificada => pieza_verificada.codigo === pieza.code)) {
        pieza.verified = true;
      }
      return pieza;
    });
    $('#select_verificaciones ~ span').removeClass('d-none');
    updateGeneralProgress();
    $('#save_verification_modal').modal('hide');
  } else {
    toastr.error('Error al verificar piezas');
  }
});

$('#save_verification_btn').on('click', async function () {
  $('#save_verification_modal').modal('show');
});

const updateGeneralProgress = () => {
  const order_data = ordenData;
  const piezas = order_data.codigos.length;
  const piezas_verificadas = order_data.codigos.filter(pieza => pieza.verified === true).length;

  const progress = (piezas_verificadas / piezas) * 100;
  $('#progress_general').css('width', `${progress}%`);
  $('#progress_general').text(`Progreso general (${progress.toFixed(2)}%)`);
};
