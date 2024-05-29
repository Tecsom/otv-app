import { fetchData, loadingButton } from '/public/scripts/helpers.js';

const badge_dot = `<div class="d-flex align-items-center lh-1 me-3">
                        <span class="badge badge-dot bg-primary me-1"></span> App
                    </div>`;

$('#unidades_medida_table').DataTable({
  columnDefs: [
    {
      // For Checkboxes
      targets: 0,
      searchable: false,
      orderable: true,
      render: function () {
        return '<input type="checkbox" class="dt-checkboxes form-check-input">';
      },
      checkboxes: {
        selectRow: true,
        selectAllRender: '<input type="checkbox" class="form-check-input">'
      }
    }
  ],
  select: {
    // Select style
    style: 'multi',
    selector: 'td:not(.non-selectable)'
  },
  columns: [
    { orderable: false, defaultContent: '', width: '50px' },
    { data: 'name', title: 'Nombre', orderable: true, className: 'non-selectable' },
    { data: 'short_name', title: 'Abreviatura', orderable: true, className: 'non-selectable' }
    //{ title: '', orderable: false, defaultContent: options, className: 'non-selectable' },
  ],
  dom: 'rtp',
  paging: false,
  language: {
    url: 'https:////cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json'
  },
  order: [[0, 'asc']],
  searching: true
});

$('#confirm_new_medida').on('click', function () {
  addMedida();
});

//fetchData  (endpoint, method = 'GET', body)

async function getMedidas() {
  const medidas_list = (await fetchData('/unidades/medida', 'GET')).data;

  $('#unidades_medida_table').DataTable().clear();
  $('#unidades_medida_table').DataTable().rows.add(medidas_list).draw();
}

async function addMedida() {
  const $btn = new loadingButton('#confirm_new_medida');

  $btn.start();

  const $name = $('#name_unidad_medida');
  const $shortName = $('#short_name_unidad_medida');

  const name = $name.val().trim();
  const short_name = $shortName.val().trim();

  if (!name || !short_name) {
    toastr.error('Es necesario llenar todos los campos', 'Ocurrió un error');
    $btn.stop();

    return;
  }

  const newMedida = {
    name,
    short_name
  };

  try {
    const result = await fetchData('/unidades/medida/new', 'POST', newMedida);
    if (!result.status) {
      toastr.error('Uno o más campos duplicados', 'Ocurrió un error');
      $btn.stop();
      return;
    }
    toastr.success('Creado con éxito');
    await getMedidas();
    $name.val('');
    $shortName.val('');
    $('#newMedida').modal('hide');
  } catch (e) {
    toastr.error('No se pudo crear');
  }
  $btn.stop();
}

function deleteMedida() {}

getMedidas();
