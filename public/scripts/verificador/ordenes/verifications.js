import { isoDateToFormattedWithTime } from '/public/scripts/helpers.js';
console.log(ordenData);
const select_verifications = $('#select_verificaciones').select2({
  placeholder: 'Selecciona una verificación',
  allowClear: true
});

$('#select_verificaciones').on('change', async function () {
  const verification = $(this).val();
  $('tr').removeClass('bg-label-success');
  if (!verification) return;

  const codes_verfications = ordenData.ordenes_static_verified.filter(ver => ver.created_at === verification);

  console.log({ veri: ordenData.ordenes_static_verified, verification });
  for (const ver of codes_verfications) {
    verificarPieza(ver.codigo);
  }
});

const verificarPieza = async codigo => {
  const table_data = table_piezas.rows().data().toArray();
  const pieza = table_data.find(pieza => pieza.codigo === codigo);
  console.log(pieza);

  //set background color green to verified row
  const row = table_piezas.rows().nodes().to$().find(`td:contains(${codigo})`).parent();
  row.addClass('bg-label-success');
  const cells = row.find('td');

  //set datatable row data to verified
  pieza.verified = true;
  table_piezas.rows().invalidate().draw();
};

$(document).ready(async function () {
  const codes_verfications = ordenData.ordenes_static_verified;

  //group verifications by created_at
  const verifications = codes_verfications.reduce((acc, verification) => {
    const key = verification.created_at;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(verification);
    return acc;
  }, {});

  for (const key in verifications) {
    select_verifications.append(new Option(isoDateToFormattedWithTime(key), key, false, false));
  }

  select_verifications.val(null).trigger('change');
});
