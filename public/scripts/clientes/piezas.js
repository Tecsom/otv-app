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

const select_revision = $('#select_revision').select2({
  dropdownParent: $('#offcanvas_pieza'),
  minimumResultsForSearch: -1,
  placeholder: 'Selecciona una revisión'
});

const dropzoneImages = new Dropzone('#dpz-imgs', {
  previewTemplate: previewTemplate,
  parallelUploads: 1,
  maxFilesize: 5,
  addRemoveLinks: true,
  url: '/',
  acceptedFiles: 'image/*',
  dictDefaultMessage: 'Arrastra aquí las imágenes de la pieza',
  dictFallbackMessage: 'Tu navegador no soporta la carga de archivos por arrastrar y soltar.',
  dictFallbackText:
    'Por favor, utiliza el formulario alternativo a continuación para cargar tus archivos como en los viejos tiempos.',
  dictFileTooBig: 'El archivo es demasiado grande ({{filesize}}MiB). Tamaño máximo de archivo: {{maxFilesize}}MiB.',
  dictInvalidFileType: 'No puedes subir archivos de este tipo.',
  dictResponseError: 'El servidor respondió con código {{statusCode}}.',
  dictCancelUpload: 'Cancelar carga',
  dictCancelUploadConfirmation: '¿Estás seguro de que quieres cancelar esta carga?',
  dictRemoveFile: 'Eliminar archivo',
  dictMaxFilesExceeded: 'No puedes subir más archivos.'
});

const dropzoneFiles = new Dropzone('#dpz-files', {
  previewTemplate: previewTemplate,
  parallelUploads: 1,
  maxFilesize: 2,
  addRemoveLinks: true,
  url: '/',
  acceptedFiles: 'application/pdf',
  dictDefaultMessage: 'Arrastra aquí las imágenes de la pieza',
  dictFallbackMessage: 'Tu navegador no soporta la carga de archivos por arrastrar y soltar.',
  dictFallbackText:
    'Por favor, utiliza el formulario alternativo a continuación para cargar tus archivos como en los viejos tiempos.',
  dictFileTooBig: 'El archivo es demasiado grande ({{filesize}}MiB). Tamaño máximo de archivo: {{maxFilesize}}MiB.',
  dictInvalidFileType: 'No puedes subir archivos de este tipo.',
  dictResponseError: 'El servidor respondió con código {{statusCode}}.',
  dictCancelUpload: 'Cancelar carga',
  dictCancelUploadConfirmation: '¿Estás seguro de que quieres cancelar esta carga?',
  dictRemoveFile: 'Eliminar archivo',
  dictMaxFilesExceeded: 'No puedes subir más archivos.'
});

const dropzoneImagesEdit = new Dropzone('#dpz-imgs-edit', {
  previewTemplate: previewTemplate,
  parallelUploads: 1,
  maxFilesize: 5,
  addRemoveLinks: true,
  url: '/',
  acceptedFiles: 'image/*',
  dictDefaultMessage: 'Arrastra aquí los archivos de la pieza (planos)',
  dictFallbackMessage: 'Tu navegador no soporta la carga de archivos por arrastrar y soltar.',
  dictFallbackText:
    'Por favor, utiliza el formulario alternativo a continuación para cargar tus archivos como en los viejos tiempos.',
  dictFileTooBig: 'El archivo es demasiado grande ({{filesize}}MiB). Tamaño máximo de archivo: {{maxFilesize}}MiB.',
  dictInvalidFileType: 'No puedes subir archivos de este tipo.',
  dictResponseError: 'El servidor respondió con código {{statusCode}}.',
  dictCancelUpload: 'Cancelar carga',
  dictCancelUploadConfirmation: '¿Estás seguro de que quieres cancelar esta carga?',
  dictRemoveFile: 'Eliminar archivo',
  dictMaxFilesExceeded: 'No puedes subir más archivos.'
});
const dropzoneFilesEdit = new Dropzone('#dpz-files-edit', {
  previewTemplate: previewTemplate,
  parallelUploads: 1,
  maxFilesize: 2,
  addRemoveLinks: true,
  url: '/',
  acceptedFiles: 'application/pdf',
  dictDefaultMessage: 'Arrastra aquí los archivos de la pieza (planos)',
  dictFallbackMessage: 'Tu navegador no soporta la carga de archivos por arrastrar y soltar.',
  dictFallbackText:
    'Por favor, utiliza el formulario alternativo a continuación para cargar tus archivos como en los viejos tiempos.',
  dictFileTooBig: 'El archivo es demasiado grande ({{filesize}}MiB). Tamaño máximo de archivo: {{maxFilesize}}MiB.',
  dictInvalidFileType: 'No puedes subir archivos de este tipo.',
  dictResponseError: 'El servidor respondió con código {{statusCode}}.',
  dictCancelUpload: 'Cancelar carga',
  dictCancelUploadConfirmation: '¿Estás seguro de que quieres cancelar esta carga?',
  dictRemoveFile: 'Eliminar archivo',
  dictMaxFilesExceeded: 'No puedes subir más archivos.'
});
const dropzoneImagesNew = new Dropzone('#dpz-imgs-new', {
  previewTemplate: previewTemplate,
  parallelUploads: 1,
  maxFilesize: 5,
  addRemoveLinks: true,
  url: '/',
  acceptedFiles: 'image/*',
  dictDefaultMessage: 'Arrastra aquí los archivos de la pieza (planos)',
  dictFallbackMessage: 'Tu navegador no soporta la carga de archivos por arrastrar y soltar.',
  dictFallbackText:
    'Por favor, utiliza el formulario alternativo a continuación para cargar tus archivos como en los viejos tiempos.',
  dictFileTooBig: 'El archivo es demasiado grande ({{filesize}}MiB). Tamaño máximo de archivo: {{maxFilesize}}MiB.',
  dictInvalidFileType: 'No puedes subir archivos de este tipo.',
  dictResponseError: 'El servidor respondió con código {{statusCode}}.',
  dictCancelUpload: 'Cancelar carga',
  dictCancelUploadConfirmation: '¿Estás seguro de que quieres cancelar esta carga?',
  dictRemoveFile: 'Eliminar archivo',
  dictMaxFilesExceeded: 'No puedes subir más archivos.'
});
const dropzoneFilesNew = new Dropzone('#dpz-files-new', {
  previewTemplate: previewTemplate,
  parallelUploads: 1,
  maxFilesize: 2,
  addRemoveLinks: true,
  url: '/',
  acceptedFiles: 'application/pdf',
  dictDefaultMessage: 'Arrastra aquí los archivos de la pieza (planos)',
  dictFallbackMessage: 'Tu navegador no soporta la carga de archivos por arrastrar y soltar.',
  dictFallbackText:
    'Por favor, utiliza el formulario alternativo a continuación para cargar tus archivos como en los viejos tiempos.',
  dictFileTooBig: 'El archivo es demasiado grande ({{filesize}}MiB). Tamaño máximo de archivo: {{maxFilesize}}MiB.',
  dictInvalidFileType: 'No puedes subir archivos de este tipo.',
  dictResponseError: 'El servidor respondió con código {{statusCode}}.',
  dictCancelUpload: 'Cancelar carga',
  dictCancelUploadConfirmation: '¿Estás seguro de que quieres cancelar esta carga?',
  dictRemoveFile: 'Eliminar archivo',
  dictMaxFilesExceeded: 'No puedes subir más archivos.'
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

$('#crear-pieza-form').on('submit', async function (e) {
  e.preventDefault();
  const confirm_button = $('#confirm_new_pieza');
  if (confirm_button.hasClass('disabled')) return;
  const button = new loadingButton(confirm_button);
  button.start();
  const cliente_id = clientData.id;
  const formData = new FormData(this);
  let data = Object.fromEntries(formData);
  const accepted_images = dropzoneImages.getAcceptedFiles();
  const accepted_files = dropzoneFiles.getAcceptedFiles();

  data.imagenes = accepted_images.map(file => ({
    data: file.dataURL?.split('base64,')[1] ?? file.dataURL,
    name: file.name,
    type: file.type
  }));

  data.archivos = [];

  for (const file of accepted_files) {
    const b_64 = await processFile(file);

    data.archivos.push({
      data: b_64?.split('base64,')[1] ?? b_64,
      name: file.name,
      type: file.type
    });
  }

  const res = await fetchData(`/clientes/${cliente_id}/piezas`, 'POST', data);
  button.stop();
  if (res.status === true) {
    await piezas_table.ajax.reload();
    toastr.success(res.message, 'Pieza creada');
    $('#modal_create_pieza').modal('hide');
    $(this).trigger('reset');

    dropzoneImages.removeAllFiles();
    dropzoneFiles.removeAllFiles();

    return;
  }
  toastr.error(res.message, 'Error creando la pieza');
});

piezas_table.on('click', 'tbody tr', async function () {
  const data = piezas_table.row(this).data();
  const { cliente_id, id, estado } = data;
  const res_revisiones = await fetchData(`/clientes/${cliente_id}/piezas/${id}/revisiones`);
  if (!res_revisiones.status) {
    toastr.error(res_revisiones.message, 'Error obteniendo las revisiones');
    return;
  }

  addRevisionesToSelect(res_revisiones.data);

  $('#badge-status-pieza').text(estado ? 'Activo' : 'No activo');
  if (estado) $('#badge-status-pieza').removeClass('bg-label-danger').addClass('bg-label-success');
  else $('#badge-status-pieza').removeClass('bg-label-success').addClass('bg-label-danger');
  $('#offcanvas_pieza').offcanvas('show');
  $('#offcanvas_pieza').attr('data-pieza-id', id);
  $('#offcanvas_pieza').data('pieza_data', data);
});

const addRevisionesToSelect = (revisiones = []) => {
  select_revision.empty();
  for (const revision of revisiones) {
    const { id, nombre } = revision;
    select_revision.append(new Option(nombre, id)).trigger('change');
  }
};

$('#btn_edit_pieza').on('click', async function () {
  const pieza_data = $('#offcanvas_pieza').data('pieza_data');
  const { numero_parte, descripcion, estado, costo_venta, costo_produccion } = pieza_data;
  $('#numero_parte_editar').val(numero_parte);
  $('#descripcion_editar').val(descripcion);
  $('#costo_venta_editar').val(costo_venta);
  $('#costo_produccion_editar').val(costo_produccion);

  $('#modal_editar_pieza').modal('show');
  $('#offcanvas_pieza').offcanvas('hide');

  $('#switch-input-estado')
    .prop('checked', estado === true)
    .trigger('change');
});

$('#editar-pieza-form').on('submit', async function (e) {
  e.preventDefault();
  const button = new loadingButton($('#confirm_edit_pieza'));
  button.start();
  const pieza_id = $('#offcanvas_pieza').attr('data-pieza-id');
  const { id: cliente_id } = clientData;
  const formData = new FormData(this);
  let data = Object.fromEntries(formData);
  data.id = pieza_id;
  data.estado = $('#switch-input-estado').prop('checked');

  const res = await fetchData(`/clientes/${cliente_id}/piezas`, 'PUT', data);
  button.stop();
  if (res.status === true) {
    await piezas_table.ajax.reload();
    toastr.success(res.message, 'Pieza actualizada');
    $('#modal_editar_pieza').modal('hide');
    return;
  }
  toastr.error(res.message, 'Error actualizando la pieza');
});

$('#btn_edit_revision').on('click', async function () {
  const pieza_id = $('#offcanvas_pieza').attr('data-pieza-id');
  const revision_id = select_revision.val();
  const button = new loadingButton($('#btn_edit_revision'));
  button.start();
  const res = await fetchData(`/clientes/${clientData.id}/piezas/${pieza_id}/revisiones/${revision_id}/files`);
  if (!res.status) {
    toastr.error(res.message, 'Error obteniendo la revisión');
    button.stop();
    return;
  }
  const {
    data: { images, files }
  } = res;

  dropzoneImagesEdit.removeAllFiles();
  for (const imagen of images) {
    const blob = await fetch(imagen.data).then(res => res.blob());
    const file = new File([blob], imagen.name, { type: imagen.type, isUploaded: true });
    dropzoneImagesEdit.addFile(file);
  }

  dropzoneFilesEdit.removeAllFiles();
  for (const archivo of files) {
    const blob = await fetch(archivo.data).then(res => res.blob());
    const file = new File([blob], archivo.name, { type: archivo.type });
    dropzoneFilesEdit.addFile(file);
  }

  $('#modal_editar_revision').modal('show');
  $('#offcanvas_pieza').offcanvas('hide');
  button.stop();
});

$('#editar-revision-form').on('submit', async function (e) {
  e.preventDefault();
  const button = new loadingButton($('#confirm_edit_revision'));
  button.start();
  const pieza_id = $('#offcanvas_pieza').attr('data-pieza-id');
  const revision_id = select_revision.val();
  let data = {};
  const accepted_images = dropzoneImagesEdit.getAcceptedFiles();
  const accepted_files = dropzoneFilesEdit.getAcceptedFiles();

  data.imagenes = accepted_images.map(file => ({
    data: file.dataURL?.split('base64,')[1] ?? file.dataURL,
    name: file.name,
    type: file.type
  }));

  data.archivos = [];

  for (const file of accepted_files) {
    const b_64 = await processFile(file);

    data.archivos.push({
      data: b_64?.split('base64,')[1] ?? b_64,
      name: file.name,
      type: file.type
    });
  }

  const res = await fetchData(`/clientes/${clientData.id}/piezas/${pieza_id}/revisiones/${revision_id}`, 'PUT', data);
  button.stop();
  if (res.status === true) {
    toastr.success(res.message, 'Revisión actualizada');
    $('#modal_editar_revision').modal('hide');
    return;
  }
  toastr.error(res.message, 'Error actualizando la revisión');
});

$('#btn_new_revision').on('click', async function () {
  $('#modal_nueva_revision').modal('show');
  $('#offcanvas_pieza').offcanvas('hide');
});

$('#nueva-revision-form').on('submit', async function (e) {
  e.preventDefault();
  const button = new loadingButton($('#confirm_new_revision'));
  button.start();
  const pieza_id = $('#offcanvas_pieza').attr('data-pieza-id');
  const formData = new FormData(this);
  const data = Object.fromEntries(formData);
  const accepted_images = dropzoneImagesNew.getAcceptedFiles();
  const accepted_files = dropzoneFilesNew.getAcceptedFiles();

  data.imagenes = accepted_images.map(file => ({
    data: file.dataURL?.split('base64,')[1] ?? file.dataURL,
    name: file.name,
    type: file.type
  }));

  data.archivos = [];

  for (const file of accepted_files) {
    const b_64 = await processFile(file);

    data.archivos.push({
      data: b_64?.split('base64,')[1] ?? b_64,
      name: file.name,
      type: file.type
    });
  }
  console.log(data);
  const res = await fetchData(`/clientes/${clientData.id}/piezas/${pieza_id}/revisiones`, 'POST', data);
  button.stop();
  if (res.status === true) {
    toastr.success(res.message, 'Revisión creada');
    $('#modal_nueva_revision').modal('hide');
    return;
  }
  toastr.error(res.message, 'Error creando la revisión');
});

$('#switch-input-estado').on('change', function (event) {
  const checked = $(this).prop('checked');
  if (checked) $('#edit-pieza-label-estado').text('Activo');
  else $('#edit-pieza-label-estado').text('No activo');
});

$('#btn-open-delete-pieza').on('click', function () {
  $('#delete_pieza_modal').modal('show');
  $('#offcanvas_pieza').offcanvas('hide');
});

$('#delete_pieza_btn').on('click', async function () {
  const button = new loadingButton($('#delete_pieza_btn'));
  button.start();
  const pieza_id = $('#offcanvas_pieza').attr('data-pieza-id');
  const res = await fetchData(`/clientes/${clientData.id}/piezas/${pieza_id}`, 'DELETE');
  button.stop();
  if (res.status === true) {
    await piezas_table.ajax.reload();
    toastr.success(res.message, 'Pieza eliminada');
    $('#delete_pieza_modal').modal('hide');
    return;
  }
  toastr.error(res.message, 'Error eliminando la pieza');
});

$('#btn-delete-revision').on('click', async function () {
  $('#delete_revision_modal').modal('show');
  $('#offcanvas_pieza').offcanvas('hide');
});

$('#delete_revision_btn').on('click', async function () {
  const button = new loadingButton($('#delete_revision_btn'));
  button.start();
  const pieza_id = $('#offcanvas_pieza').attr('data-pieza-id');
  const revision_id = select_revision.val();
  console.log(`/clientes/${clientData.id}/piezas/${pieza_id}/revisiones/${revision_id}`);
  const res = await fetchData(`/clientes/${clientData.id}/piezas/${pieza_id}/revisiones/${revision_id}`, 'DELETE');
  button.stop();
  if (res.status === true) {
    await piezas_table.ajax.reload();
    toastr.success(res.message, 'Revisión eliminada');
    $('#delete_revision_modal').modal('hide');
    return;
  }
  toastr.error(res.message, 'Error eliminando la revisión');
});
