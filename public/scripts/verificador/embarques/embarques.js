import { fetchData, isoDateToFormatted } from '../../helpers.js';

let verificadas_array = [];

$(() => {
  init();
});

async function init() {
  new PerfectScrollbar(document.getElementById('embarques_container'), {
    wheelPropagation: false
  });

  const optiones_html = `
  <button class="btn btn-sm btn-opciones-pieza">
    <i class="ti ti-eye"></i>
  </button>
  <button class="btn btn-sm btn-ver-codigos">
    <i class="ti ti-plus"></i>
  </button>
  `;

  table_piezas = $('#table_piezas_oc').DataTable({
    language: {
      url: 'https://cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json'
    },
    columns: [
      { data: 'nombre', title: 'Nombre contenedor' },
      {
        title: 'Total verificado',
        render: function (data, type, row) {
          //verificaciones unicas por pieza
          console.log(row);
          const verificaciones = embarqueData.embarque_contenedor_verified.filter(ver =>
            row.codigo.includes(ver.codigo)
          );
          const verificaciones_unicas = verificaciones.reduce((acc, ver) => {
            if (!acc.includes(ver.codigo)) {
              acc.push(ver.codigo);
            }
            return acc;
          }, []);
          return `${verificaciones_unicas.length} de 1`;
        }
      },
      { defaultContent: optiones_html, title: 'Opciones' }
    ],
    searching: false,
    paging: false,
    info: false,
    autoWidth: false
  });

  table_verificadas = $('#table_verificadas').DataTable({
    language: {
      url: 'https://cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json'
    },
    columns: [{ data: 'codigo', title: 'Código' }],
    searching: false,
    paging: false,
    info: false,
    autoWidth: false
  });
  table_not_verificadas = $('#table_not_verificadas').DataTable({
    language: {
      url: 'https://cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json'
    },
    columns: [{ data: 'code', title: 'Código' }],
    searching: false,
    paging: false,
    info: false,
    autoWidth: false
  });
}

loadEmbarqueData = async () => {
  table_piezas.clear().draw();
  $('#folio_em').text(embarqueData.embarques.folio_unico ?? 'Sin folio');
  $('#fecha_entrega_em').text(isoDateToFormatted(embarqueData.embarques.fecha_entrega) ?? 'Sin fecha de entrega');
  $('#embarque').text(embarqueData?.embarques.descripcion);

  const data_table_piezas = embarqueData.embarque_contenedores.map(contenedor => {
    return {
      codigo: contenedor.codigo,
      id: contenedor.id,
      nombre: contenedor.nombre_contenedor
    };
  });

  // for (const codigo of codigos) {
  //   const { code, numero_parte, verified } = codigo;
  //   const producto = productos.find(producto => producto.codigos?.some(codigo => codigo === code));
  //   data_table_piezas.push({
  //     codigo: code,
  //     verified: false,
  //     numero_parte: producto.numero_parte,
  //     revision: producto.revisiones.nombre,
  //     descripcion: producto.descripcion,
  //     producto
  //   });
  // }

  table_piezas.rows.add(data_table_piezas).draw();
  updateGeneralProgress();
};

$('#startVerificacion').on('click', function () {
  $('#start_verificacion').modal('show');
});

$('#start_verificacion_btn').on('click', function () {
  resetVerifications();
  verification_mode = true;
  $('#start_verificacion').modal('hide');
  $('#save_verification_btn').removeClass('d-none');
  $('#cancel_verificacion_btn').removeClass('d-none');
  $('#startVerificacion').addClass('d-none');

  $('#progress_verificacion').css('width', '0%');
  $('#progress_verificacion').text('Progreso de verificación (0%)');

  $('#container_general').addClass('d-none');
  $('#container_verificacion').removeClass('d-none');
  $('#select_verificaciones ~ span').addClass('d-none');

  $('#container_piezas_table').addClass('d-none');
  $('#container_verificaciones_table').removeClass('d-none');

  table_verificadas.clear().draw();
  table_not_verificadas.clear().draw();

  const codigos = embarqueData.embarque_contenedor_codes.map(codigo => {
    return {
      code: codigo.code
    };
  });

  table_not_verificadas.rows.add(codigos).draw();
});

$('#table_piezas_oc').on('click', '.btn-opciones-pieza', async function () {
  const data = table_piezas.row($(this).parents('tr')).data();
  const producto = data;

  $('#pieza_numero_parte').text(producto.nombre);
  $('#pieza_numero_parte_title').text(producto.nombre);
  $('#pieza_descripcion').text(producto.codigo);
  $('#modal_view_pieza').modal('show');
});

const format_subrow = (data, isLast) => {
  const styles = !isLast ? 'border-bottom: 1px dotted #dee2e6;' : '';
  return `
      <div class="row py-3 px-2" codigo="${data.code}" style="${styles}" >
        <div class="col-md-6">
          <p class="mb-0"><strong>Código: </strong>${data.code}</p>
        </div>
      </div>
    `;
};

$('#cancel_verificacion_btn').on('click', function () {
  $('#cancel_verification_modal').modal('show');
});

$('#cancel_verification_modal_btn').on('click', function () {
  $('#cancel_verification_modal').modal('hide');
  $('#save_verification_btn').addClass('d-none');
  $('#cancel_verificacion_btn').addClass('d-none');
  $('#startVerificacion').removeClass('d-none');
  $('#select_verificaciones ~ span').removeClass('d-none');

  $('#container_piezas_table').removeClass('d-none');
  $('#container_verificaciones_table').addClass('d-none');

  resetVerifications();
});

$('#save_verification_btn').on('click', async function () {
  $('#save_verification_modal').modal('show');
});

$('#table_piezas_oc').on('click', '.btn-ver-codigos', function (e) {
  let tr = e.target.closest('tr');
  let row = table_piezas.row(tr);
  const data = row.data();

  const full_codigos = embarqueData.embarque_contenedor_codes;
  const codigos = full_codigos.filter(codigo => data.codigo.includes(codigo.code));
  const codigos_html = codigos
    .map((codigo, index) => {
      return format_subrow({ ...codigo, revisiones: data.revisiones }, index === codigos.length - 1);
    })
    .join('');

  if (row.child.isShown()) {
    // This row is already open - close it
    row.child.hide();
    $(this).find('i').removeClass('ti-minus').addClass('ti-plus');
  } else {
    // Open this row
    row.child(codigos_html).show();
    $(this).find('i').removeClass('ti-plus').addClass('ti-minus');
  }
});

const socket = io.connect();
socket.on('scanner', data => {
  console.log({ verification_mode });
  if (verification_mode === true) {
    console.log({ data });
    verificarPieza(data);
  }
});

const verificarPieza = async codigo => {
  const exists = embarqueData.embarque_contenedor_codes.find(pieza => pieza.code === codigo);
  const isVerified = verificadas_array.includes(codigo);

  if (!exists) {
    toastr.error('Pieza no encontrada');
    return;
  }

  if (isVerified) {
    toastr.warning('Pieza ya verificada');
    return;
  }
  verify(codigo);
};

const verify = codigo => {
  console.log(codigo);
  table_verificadas.rows
    .add([
      {
        codigo
      }
    ])
    .draw();
  //remove from table_not_verificadas
  table_not_verificadas.rows().every(function () {
    const row = this.data();
    if (row?.code === codigo) {
      this.remove().draw();
    }
  });
  if (!verificadas_array.includes(codigo)) {
    verificadas_array.push(codigo);
    const piezas_verificadas = verificadas_array.length;
    const piezas_totales = embrarqueData.embarque_contenedor_codes.length;
    const progress = (piezas_verificadas / piezas_totales) * 100;
    $('#progress_verificacion').css('width', `${progress}%`);
    $('#progress_verificacion').text(`Progreso de verificación (${progress.toFixed(2)}%)`);
  }
};

const resetVerifications = () => {
  $('tr').removeClass('bg-label-success');
  $('#select_verificaciones').val(null).trigger('change');
  const table_data = table_piezas.rows().data().toArray();
  table_data.forEach(pieza => {
    pieza.verified = false;
  });
  table_piezas.rows().invalidate().draw();
  $('#progress_verificacion').css('width', '0%');
  $('#progress_verificacion').text('Progreso de verificación (0%)');

  $('#container_verificacion').addClass('d-none');
  verificadas_array = [];
  $('#container_general').removeClass('d-none');

  updateGeneralProgress();

  verification_mode = false;
};

const updateGeneralProgress = () => {
  const embarque_data = embarqueData;
  const piezas = embarque_data.embarque_contenedor_codes.length;
  console.log({ piezas });
  const piezas_verificadas = embarque_data.embarque_contenedor_codes.filter(pieza => pieza.verified === true).length;
  console.log({ piezas_verificadas });
  const progress = (piezas_verificadas / piezas) * 100;
  $('#progress_general').css('width', `${progress}%`);
  $('#progress_general').text(`Progreso general (${progress.toFixed(2)}%)`);
};
