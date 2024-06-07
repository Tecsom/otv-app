import { fetchData, loadingButton, isoDateToFormattedWithTime, isoDateToFormatted } from '/public/scripts/helpers.js';
let page_oc = 0;
let limit_oc = 5;

let page_emb = 0;
let limit_emb = 5;

const badgeType = {
  pendiente: 'primary',
  proceso: 'secondary',
  embarque: 'info',
  cancelada: 'danger',
  finalizada: 'success'
};

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
</div>
</div>`;

const dropzoneCliente = new Dropzone('#dpz-cliente', {
  previewTemplate: previewTemplate,
  maxFilesize: 2,
  url: 'api/clientes/52/update-photo',
  method: 'PUT ',
  autoQueue: true,
  autoProcessQueue: true,
  acceptedFiles: 'image/*',
  dictDefaultMessage: 'Añadir logo de cliente',
  dictFallbackMessage: 'Tu navegador no soporta la carga de archivos por arrastrar y soltar.',
  dictFallbackText:
    'Por favor, utiliza el formulario alternativo a continuación para cargar tus archivos como en los viejos tiempos.',
  dictFileTooBig: 'El archivo es demasiado grande ({{filesize}}MiB). Tamaño máximo de archivo: {{maxFilesize}}MiB.',
  dictInvalidFileType: 'No puedes subir archivos de este tipo.',
  dictResponseError: 'El servidor respondió con código {{statusCode}}.',
  dictCancelUpload: 'Cancelar carga',
  dictCancelUploadConfirmation: '¿Estás seguro de que quieres cancelar esta carga?',
  dictRemoveFile: 'Eliminar archivo',
  dictMaxFilesExceeded: 'No puedes subir más archivos.',
  accept: async function (file, done) {
    const data = await processFile(file);
    const client_id = clientData.id;
    console.log({ data });
    const res = await fetchData('/clientes/' + client_id + '/update-photo', 'PUT', {
      photo: {
        data: data?.split('base64,')[1] ?? data,
        name: 'logo' + file.type.replace('image/', '.'),
        type: file.type
      }
    });

    if (res.status === true) {
      toastr.success(res.message, 'Foto actualizada');
      $('#container-upload-pp').addClass('d-none');
      $('#container-pp').removeClass('d-none');
      $('#img-pp').attr('src', data);
      return done();
    }
  }
});

$('#change_profile_btn').on('click', function () {
  $('#container-upload-pp').removeClass('d-none');
  $('#container-pp').addClass('d-none');
  dropzoneCliente.removeAllFiles();
});

const processFile = file => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function (event) {
      resolve(event.target.result);
    };
    reader.readAsDataURL(file);
  });
};

$('#edit-client-form').on('submit', async function (e) {
  e.preventDefault();
  const button = new loadingButton($('#confirm_edit_client'));
  button.start();
  const cliente_id = clientData.id;
  const formData = new FormData(this);
  const data = Object.fromEntries(formData);
  const res = await fetchData(`/clientes/${cliente_id}`, 'PUT', data);
  button.stop();
  if (res.status === true) {
    toastr.success(res.message, 'Cliente actualizado');
    updateClientData(res.data);
    $('#modal_edit_client').modal('hide');
    return;
  }
  toastr.error(res.message, 'Error actualizando el cliente');
});

const updateClientData = data => {
  $('#details_client_name').text(data.nombre);
  $('#details_client_rfc').text(data.identificador);
  $('#details_client_mail').text(data.correo);
  $('#details_client_phone').text(data.telefono);
  $('#details_client_cellphone').text(data.celular);
  $('#details_client_adress').text(data.domicilio);
  $('#details_client_city').text(data.ciudad);
  $('#details_client_state').text(data.estado);
  $('#client_name_title').text(data.nombre);
};
const updateFieldsEdit = cliente => {
  console.log({ cliente });
  $('#nombre_cliente').val(cliente.nombre);
  $('#rfc_cliente').val(cliente.identificador);
  $('#email_cliente').val(cliente.correo);
  $('#telefono_cliente').val(cliente.telefono);
  $('#celular_cliente').val(cliente.celular);
  $('#domicilio_cliente').val(cliente.domicilio);
  $('#ciudad_cliente').val(cliente.ciudad);
  $('#estado_cliente').val(cliente.estado);
  $('#pais_cliente').val(cliente.pais);
};

$(document).ready(async function () {
  updateFieldsEdit(clientData);

  const TagifyCustomInlineSuggestionEl = document.querySelector('#TagifyCustomInlineSuggestion');

  // const whitelist = [
  //   'Número de parte',
  //   'Revisión de parte',
  //   'ID de cliente',
  //   'ID orden de compra',
  //   'Semana del año (Fecha de entrega - WW)',
  //   'Año (Fecha de entrega - YYYY)',
  //   'Año (Fecha de entrega - YY)',
  //   'Identificador de proveedor',
  //   '# Consecutivo de la pieza por OC'
  // ];

  const whitelist = [
    { value: 'Número de parte', id: 'numero_parte' },
    { value: 'Revisión de parte', id: 'revision_parte' },
    { value: 'ID de cliente', id: 'cliente_id' },
    { value: 'ID orden de compra', id: 'orden_compra_id' },
    { value: 'Semana del año (Fecha de entrega - WW)', id: 'semana_ano' },
    { value: 'Año (Fecha de entrega - YYYY)', id: 'ano_YYYY' },
    { value: 'Año (Fecha de entrega - YY)', id: 'ano_YY' },
    { value: 'Identificador de proveedor', id: 'proveedor_id' },
    { value: '# Consecutivo de la pieza por OC', id: 'consecutivo' }
  ];

  // Inline
  let TagifyCustomInlineSuggestion = new Tagify(TagifyCustomInlineSuggestionEl, {
    whitelist: whitelist,
    maxTags: 10, // allows to select max items
    dropdown: {
      maxItems: 20, // display max items
      classname: 'tags-inline', // Custom inline class
      enabled: 0,
      closeOnSelect: false
    },
    templates: {
      dropdownFooter(suggestions) {
        var hasMore = suggestions.length - this.settings.dropdown.maxItems;

        return hasMore > 0
          ? `<footer data-selector='tagify-suggestions-footer' class="${this.settings.classNames.dropdownFooter}">
              ${hasMore} elementos restantes, escribe la búsqueda.
            </footer>`
          : '';
      }
    }
  });

  await loadHistorialOrdenes(clientData.id);
  await loadHistorialEmbarques(clientData.id);
});

$('#delete_client_btn').on('click', async function () {
  const button = new loadingButton($(this));
  console.log('click del');
  button.start();
  const res = await fetchData(`/clientes/${clientData.id}`, 'DELETE');

  if (res.status === true) {
    window.location.href = '/clientes';
    return;
  }
  toastr.error(res.message, 'Error eliminando el cliente');
  button.stop();
});

$('#form_qr_config').on('submit', async function (e) {
  e.preventDefault();
  const button = new loadingButton($('#save_qr_config'));
  button.start();
  const formData = new FormData(this);
  let data = Object.fromEntries(formData);
  data.code_string = JSON.parse(data.code_string);

  const res = await fetchData(`/clientes/${clientData.id}`, 'PUT', data);
  button.stop();
  if (res.status === true) {
    toastr.success(res.message, 'Configuración guardada');
    return;
  }
  toastr.error(res.message, 'Error guardando la configuración');
});

const loadHistorialOrdenes = async cliente_id => {
  const params = `?page=${page_oc}&limit=${limit_oc}`;
  const response = await fetchData('/clientes/historial/ordenes/' + cliente_id + params, 'GET', {});
  if (response.status === false) return toastr.error(response.message, 'Error obteniendo historial de órdenes');

  for (let orden of response.data) {
    const $newListItem = $(`
      <li class="timeline-item timeline-item-transparent">
      <span class="timeline-point timeline-point-primary"></span>
      <div class="timeline-event">
        <div class="timeline-header mb-1">
          <h6 class="mb-0">${orden.folio_id}</h6>
          <small class="text-muted">${isoDateToFormattedWithTime(orden.created_at)}</small>
        </div>
        <p class="mb-2">Estado: <span class="text-capitalize badge bg-${badgeType[orden.estado]}">${orden.estado}</span></p>
        <p class="mb-2">Folio único: ${orden.unique_folio ? addLeadingZeros(orden.unique_folio, 6) : '<b>sin folio</b>'}</p>
        <p class="mb-2">Fecha de entrega: ${isoDateToFormattedWithTime(orden.delivery_date)}</p>
      </div>
    </li>
    `);

    $('#historial_oc').append($newListItem);
  }
  page_oc++;
  if (response.data.length < limit_oc) $('#load_more_oc').addClass('d-none');
};

$('#load_more_oc').on('click', async function () {
  console.log('asd');
  await loadHistorialOrdenes(clientData.id);
});

$('#load_more_emb').on('click', async function () {
  await loadHistorialEmbarques(clientData.id);
});

const loadHistorialEmbarques = async cliente_id => {
  const params = `?page=${page_emb}&limit=${limit_emb}`;

  const response = await fetchData('/cliente/historial/embarques/' + cliente_id + params, 'GET', {});

  for (let embarque of response.data) {
    const $newListItem = $(`
      <li class="timeline-item timeline-item-transparent">
      <span class="timeline-point timeline-point-primary"></span>
      <div class="timeline-event">
        <div class="timeline-header mb-1">
          <h6 class="mb-0">${embarque.embarque_id.descripcion}</h6>
          <small class="text-muted">${isoDateToFormattedWithTime(embarque.embarque_id.created_at)}</small>
        </div>
        <p class="mb-2">Estado: <span class="text-capitalize badge bg-${badgeType[embarque.embarque_id.estado]}">${embarque.embarque_id.estado}</span></p>
        <p class="mb-2">Folio único: ${embarque.embarque_id.folio_unico ? addLeadingZeros(embarque.embarque_id.folio_unico, 6) : '<b>sin folio</b>'}</p>
        <p class="mb-2">Fecha de embarque: ${isoDateToFormatted(embarque.embarque_id.fecha_embarque)}</p>
        <p class="mb-2">Fecha de entrega: ${isoDateToFormatted(embarque.embarque_id.fecha_entrega)}</p>
      </div>
    </li>
  `);

    $('#historial_emb').append($newListItem);
  }

  page_emb++;
  if (response.data.length < limit_emb) $('#load_more_emb').addClass('d-none');
};

function addLeadingZeros(number, length) {
  let numStr = String(number);

  let zerosToAdd = Math.max(length - numStr.length, 0);

  return '0'.repeat(zerosToAdd) + numStr;
}
