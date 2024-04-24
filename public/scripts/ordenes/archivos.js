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

dropzoneFiles = new Dropzone('#dropzone', {
  previewTemplate: previewTemplate,
  parallelUploads: 1,
  maxFilesize: 2,
  addRemoveLinks: true,
  url: '/',

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

$('#uploadFilesButton').click(async () => {
  const order_id = $('#container-reporte').data().id;
  if (!order_id) {
    toastr.error('No se ha podido obtener el ID de la orden');
    return;
  }
  const button = new loadingButton('#uploadFilesButton');
  button.start();

  const accepted_files = dropzoneFiles.getAcceptedFiles();

  const files = [];

  for (const file of accepted_files) {
    const b_64 = await processFile(file);

    files.push({
      data: b_64?.split('base64,')[1] ?? b_64,
      name: file.name,
      type: file.type
    });
  }

  const res = await fetchData(`/ordenes/${order_id}/files`, 'POST', { files });
  button.stop();
  if (res.status === true) {
    toastr.success(res.message, 'Pieza creada');
    $('#modal_create_pieza').modal('hide');

    return;
  }
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
