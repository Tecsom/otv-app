import { isoDateToFormattedWithTime } from '/public/scripts/helpers.js';

const select_verifications = $('#select_verificaciones').select2({
  placeholder: 'Selecciona una verificación',
  allowClear: true
});

$('#select_verificaciones').on('change', async function () {
  const verification = $(this).val();
  $('tr').removeClass('bg-label-success');

  $('#container_piezas_table').removeClass('d-none');
  $('#container_verificaciones_table').addClass('d-none');
  if (!verification) return;

  const codes_verfications = ordenData.ordenes_static_verified.filter(ver => ver.created_at === verification);
  const codes_not_verfications = ordenData.codigos.filter(
    codigo => !codes_verfications.find(ver => ver.codigo === codigo.code)
  );
  console.log({ codes_verfications, codes_not_verfications });

  table_verificadas.clear().draw();
  table_not_verificadas.clear().draw();

  table_verificadas.rows.add(codes_verfications).draw();
  table_not_verificadas.rows.add(codes_not_verfications).draw();

  $('#container_piezas_table').addClass('d-none');
  $('#container_verificaciones_table').removeClass('d-none');
});

loadVerificaciones = async () => {
  //  select_verifications.empty();
  //  const codes_verfications = ordenData.ordenes_static_verified;
  //
  //  //group verifications by created_at
  //  const verifications = codes_verfications.reduce((acc, verification) => {
  //    const key = verification.created_at;
  //    if (!acc[key]) {
  //      acc[key] = [];
  //    }
  //    acc[key].push(verification);
  //    return acc;
  //  }, {});
  //
  //  for (const key in verifications) {
  //    select_verifications.append(new Option(isoDateToFormattedWithTime(key), key, false, false));
  //  }
  //
  //  select_verifications.val(null).trigger('change');
};
