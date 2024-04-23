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

const dropzoneImages = new Dropzone('#dpz-imgs', {
  previewTemplate: previewTemplate,
  parallelUploads: 1,
  maxFilesize: 5,
  addRemoveLinks: true,
  url: '/'
});
const dropzoneFiles = new Dropzone('#dpz-files', {
  previewTemplate: previewTemplate,
  parallelUploads: 1,
  maxFilesize: 5,
  addRemoveLinks: true,
  url: '/'
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

  const whitelist = [
    'Número de parte',
    'Revisión de parte',
    'ID de cliente',
    'ID orden de compra',
    'Semana del año (Fecha de entrega - WW)',
    'Año (Fecha de entrega - YYYY)',
    'Año (Fecha de entrega - YY)',
    'Identificador de proveedor',
    '# Consecutivo de la pieza por OC'
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

$('#crear-pieza-form').on('submit', async function (e) {
  e.preventDefault();
  const button = new loadingButton($('#confirm_create_pieza'));
  button.start();
  const cliente_id = clientData.id;
  const formData = new FormData(this);
  let data = Object.fromEntries(formData);
  const accepted_images = dropzoneImages.getAcceptedFiles();
  const accepted_files = dropzoneFiles.getAcceptedFiles();

  data.imagenes = accepted_images;
  data.archivos = accepted_files;

  // data.imagenes = accepted_images.map(file => ({
  //   data: file.dataURL,
  //   name: file.name
  // }));

  // data.archivos = [];

  // for (const file of accepted_files) {
  //   const b_64 = await processFile(file);

  //   data.archivos.push({
  //     data: b_64,
  //     name: file.name
  //   });
  // }

  const res = await fetchData(`/clientes/${cliente_id}/piezas`, 'POST', data);
  button.stop();
  if (res.status === true) {
    toastr.success(res.message, 'Pieza creada');
    $('#modal_create_pieza').modal('hide');
    return;
  }
  toastr.error(res.message, 'Error creando la pieza');
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
