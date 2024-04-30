import { fetchData, loadingButton } from '/public/scripts/helpers.js';
const previewTemplate = `<div class="dz-preview dz-file-preview">
<div class="dz-details">
    <div class="progress">
      <div class="progress-bar progress-bar-primary" role="progressbar" aria-valuemin="0" aria-valuemax="100" data-dz-uploadprogress></div>
    </div>
  </div>
</div>`;
const dropzoneCliente = new Dropzone('#dpz-cliente', {
  previewTemplate: previewTemplate,
  parallelUploads: 1,
  maxFilesize: 5,
  addRemoveLinks: true,
  url: '/',
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
  acceptedFiles: 'image/*',
  accept: function (file, done) {
    // done();
  }
});

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
  $('#nombre_cliente').val(cliente.nombre);
  $('#rfc_cliente').val(cliente.identificador);
  $('#email_cliente').val(cliente.correo);
  $('#telefono_cliente').val(cliente.telefono);
  $('#celular_cliente').val(cliente.celular);
  $('#domilicio_cliente').val(cliente.domilicio);
  $('#ciudad_cliente').val(cliente.ciudad);
  $('#estado_cliente').val(cliente.estado);
  $('#pais_cliente').val(cliente.pais);
};

$(document).ready(function () {
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
