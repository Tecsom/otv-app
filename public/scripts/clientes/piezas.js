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
  maxFilesize: 2,
  addRemoveLinks: true,
  url: '/',
  acceptedFiles: 'application/pdf'
});

const dropzoneImagesEdit = new Dropzone('#dpz-imgs-edit', {
  previewTemplate: previewTemplate,
  parallelUploads: 1,
  maxFilesize: 5,
  addRemoveLinks: true,
  url: '/',
  acceptedFiles: 'image/*'
});
const dropzoneFilesEdit = new Dropzone('#dpz-files-edit', {
  previewTemplate: previewTemplate,
  parallelUploads: 1,
  maxFilesize: 2,
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

piezas_table.on('click', 'tbody tr', async function () {
  const data = piezas_table.row(this).data();
  const { cliente_id, id } = data;
  const res_revisiones = await fetchData(`/clientes/${cliente_id}/piezas/${id}/revisiones`);
  if (!res_revisiones.status) {
    toastr.error(res_revisiones.message, 'Error obteniendo las revisiones');
    return;
  }

  addRevisionesToSelect(res_revisiones.data);

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
  const { numero_parte, descripcion } = pieza_data;

  $('#numero_parte_editar').val(numero_parte);
  $('#descripcion_editar').val(descripcion);

  $('#modal_editar_pieza').modal('show');
  $('#offcanvas_pieza').offcanvas('hide');
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
  const res = await fetchData(`/clientes/${cliente_id}/piezas`, 'PUT', data);
  button.stop();
  if (res.status === true) {
    await updatePiezasTable();
    toastr.success(res.message, 'Pieza actualizada');
    $('#modal_editar_pieza').modal('hide');
    return;
  }
  toastr.error(res.message, 'Error actualizando la pieza');
});

const updatePiezasTable = async () => {
  const { id: cliente_id } = clientData;
  const res = await fetchData(`/clientes/${cliente_id}/piezas`);
  if (!res.status) {
    toastr.error(res.message, 'Error obteniendo las piezas');
    return;
  }
  piezas_table.clear().draw();
  piezas_table.rows.add(res.data).draw();
};

$('#btn_edit_revision').on('click', async function () {
  const pieza_id = $('#offcanvas_pieza').attr('data-pieza-id');
  const revision_id = select_revision.val();
  const res = await fetchData(`/clientes/${clientData.id}/piezas/${pieza_id}/revisiones/${revision_id}/files`);
  if (!res.status) {
    toastr.error(res.message, 'Error obteniendo la revisión');
    return;
  }
  const {
    data: { images, files }
  } = res;

  dropzoneImagesEdit.removeAllFiles();
  for (const imagen of images) {
    const blob = await fetch(imagen.data).then(res => res.blob());
    const file = new File([blob], imagen.name, { type: imagen.type });
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
});
