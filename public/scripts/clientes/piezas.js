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

const piezas_table = $('#piezas_table').DataTable({
  select: {
    style: 'multi',
    selector: 'td:not(.non-selectable)'
  },
  columns: [
    { data: 'numero_parte', title: 'Número de parte', orderable: true, className: 'non-selectable' },
    { data: 'descripcion', title: 'Descripción', orderable: true, className: 'non-selectable' }
  ],
  dom: 'rtp',
  paging: false,
  language: {
    url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json'
  },
  order: [[0, 'asc']],
  searching: true
});

const dropzoneImages = new Dropzone('#dpz-imgs', {
  previewTemplate: previewTemplate,
  parallelUploads: 1,
  maxFilesize: 5,
  addRemoveLinks: true,
  url: '/',
  acceptedFiles: 'image/*'
});
const dropzoneFiles = new Dropzone('#dpz-files', {
  previewTemplate: previewTemplate,
  parallelUploads: 1,
  maxFilesize: 5,
  addRemoveLinks: true,
  url: '/',
  acceptedFiles: 'application/pdf'
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
  const button = new loadingButton($('#confirm_create_pieza'));
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
    toastr.success(res.message, 'Pieza creada');
    $('#modal_create_pieza').modal('hide');
    return;
  }
  toastr.error(res.message, 'Error creando la pieza');
});

$(document).ready(function () {
  piezas_table.clear().draw();
  piezas_table.rows.add(piezasData).draw();
});

piezas_table.on('click', 'tbody tr', function () {
  const data = piezas_table.row(this).data();
  console.log({ data });
  $('#offcanvas_pieza').offcanvas('show');
});
