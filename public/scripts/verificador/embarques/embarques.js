import { fetchData, isoDateToFormatted, loadingButton, isoDateToFormattedWithTime } from '../../helpers.js';

let data_table_productos;
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
              row.verified = true;
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

  $('#container_products_table').DataTable({
    data: [],
    language: {
      url: 'https://cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json'
    },
    columns: [
      { title: 'folio', data: 'unique_folio' },
      { title: 'folio cliente', data: 'folio_id' },
      { title: 'tipo de pieza', data: 'tipo_pieza' },
      { title: 'nombre pieza', data: 'numero_parte' },
      { title: 'costo produccion', data: 'costo_produccion' },
      { title: 'costo venta', data: 'costo_venta' }
    ],
    searching: false,
    paging: false,
    info: false,
    autoWidth: true
  });

  $('#container_clients_table').DataTable({
    data: [],
    language: {
      url: 'https://cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json'
    },
    columns: [
      { title: 'cliente', data: 'cliente' },
      { title: 'ciudad', data: 'ciudad' },
      { title: 'pais', data: 'pais' },
      { title: 'estado', data: 'estado' },
      { title: 'celular', data: 'celular' }
    ],
    searching: false,
    paging: false,
    info: false,
    autoWidth: true
  });
}

$('#embarques_container').on('click', '.embarque_container_child', async function () {
  $(this).addClass('active').siblings().removeClass('active');
  $('#cancel_verification_modal').modal('hide');
  $('#save_verification_btn').addClass('d-none');
  $('#cancel_verificacion_btn').addClass('d-none');
  $('#startVerificacion').removeClass('d-none');
  $('#select_verificaciones ~ span').removeClass('d-none');
  verification_mode = false;

  const $this = $(this);

  const data = $this.data('data');
  const res = await fetchData('/embarques/all/' + data.id, 'GET', {});

  console.log(res);

  if (!res.status) return toastr.error('Ocurrió un error al obtener la orden');

  embarqueData = res.data;

  console.log(embarqueData);

  $('#embarques_container').data('selected', data.id);

  $('.embarque_container_child').removeClass('selected');
  $this.addClass('selected');

  $('#oc_modal').modal('show');
  loadEmbarqueData();
  loadVerificaciones();
  updateGeneralProgress();
  $('#container-buttons-verification').removeClass('d-none');
});

loadEmbarqueData = async () => {
  table_piezas.clear().draw();
  $('#folio_em').text(embarqueData.embarques.folio_unico ?? 'Sin folio');
  $('#fecha_entrega_em').text(isoDateToFormatted(embarqueData.embarques.fecha_entrega) ?? 'Sin fecha de entrega');
  $('#embarque').text(embarqueData?.embarques.descripcion);

  console.log(embarqueData);

  let data_table_piezas = embarqueData.embarque_contenedores.map(contenedor => {
    return {
      codigo: contenedor.codigo,
      id: contenedor.id,
      nombre: contenedor.nombre_contenedor,
      cantidad: contenedor.cantidad
    };
  });

  data_table_productos = embarqueData.embarque_products.map(productos => {
    return {
      contenedor_id: productos.contenedor_id,
      tipo_pieza: productos.producto_id.pieza_id.type,
      numero_parte: productos.producto_id.pieza_id.numero_parte,
      costo_produccion: '$' + productos.producto_id.pieza_id.costo_produccion,
      costo_venta: '$' + productos.producto_id.pieza_id.costo_venta,

      cliente_id: productos.order_id.client_id.id,
      cliente: productos.order_id.client_id.nombre,
      ciudad: productos.order_id.client_id.ciudad,
      pais: productos.order_id.client_id.pais,
      estado: productos.order_id.client_id.estado,
      celular: productos.order_id.client_id.celular,

      folio_id: productos.order_id.folio_id,
      unique_folio: productos.order_id.unique_folio
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
  $('#container_products_table').DataTable().clear().rows.add(data_table_productos).draw();
  $('#container_clients_table').DataTable().clear().rows.add(data_table_productos).draw();
  updateGeneralProgress();
};

$('#startVerificacion').on('click', function () {
  const progress = updateGeneralProgress();
  console.log(progress);
  if (progress === 100) {
    toastr.error('Los contenedores ya han sido verificados');
    return;
  }
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

  const codigos = embarqueData.embarque_contenedor_codes;

  const codigosUnicos = new Set(codigos.map(pieza => pieza.code));

  const ordenesVerificadasTemp = embarqueData.embarque_contenedor_verified?.filter(
    (orden, index, self) => codigosUnicos.has(orden.codigo) && self.findIndex(t => t.codigo === orden.codigo) === index
  );

  const ordenesSinVerificar = codigos.filter(
    pieza => !ordenesVerificadasTemp.find(orden => orden.codigo === pieza.code)
  );

  table_not_verificadas.rows.add(ordenesSinVerificar).draw();
});

$('#table_piezas_oc').on('click', '.btn-opciones-pieza', async function () {
  const data = table_piezas.row($(this).parents('tr')).data();

  console.log(data);

  const data_products = data_table_productos;

  const dataFiltered = data_products.filter(cont => cont.contenedor_id === data.id);

  const clientData = data_products
    .filter(cont => cont.contenedor_id === data.id)
    .reduce((acc, product) => {
      console.log({ product });
      if (!acc[product.cliente_id]) {
        acc[product.cliente_id] = product;
      }
      return acc;
    }, {});

  const clientDataArray = Object.values(clientData);

  $('#container_products_table').DataTable().clear().rows.add(dataFiltered).draw();
  $('#container_clients_table').DataTable().clear().rows.add(clientDataArray).draw();

  $('#pieza_numero_parte').text(data.nombre);
  $('#pieza_numero_parte_title').text(data.nombre);
  $('#pieza_descripcion').text(data.codigo);
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
  //const exists = embarqueData.embarque_contenedor_codes.find(pieza => pieza.code === codigo);
  const isVerified = verificadas_array.includes(codigo);

  const data_no_verified = table_not_verificadas.rows().data().toArray();

  const existsInNotVerified = data_no_verified.find(pieza => pieza.code === codigo);

  const data_verified = table_verificadas.rows().data().toArray();

  const existsInVerified = data_verified.find(pieza => pieza.codigo === codigo);

  if (existsInVerified) {
    toastr.warning('Pieza ya verificada');
    return;
  }

  if (!existsInNotVerified) {
    toastr.error('Pieza no encontrada');
    return;
  }

  if (isVerified) {
    toastr.warning('Codigo ya verificado');
    return;
  }
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
    const piezas_totales = embarqueData.embarque_contenedor_codes.length;
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
  console.log(embarque_data.embarque_contenedor_codes);
  const piezas = embarque_data.embarque_contenedor_codes.length;
  console.log({ piezas });
  const piezas_verificadas = embarque_data.embarque_contenedor_verified.filter(pieza => pieza).length;
  console.log({ piezas_verificadas });
  const progress = (piezas_verificadas / piezas) * 100;
  $('#progress_general').css('width', `${progress}%`);
  $('#progress_general').text(`Progreso general (${progress.toFixed(2)}%)`);

  return progress;
};

$('#save_verification_modal_btn').on('click', async function () {
  const piezas_verificadas = table_verificadas.rows().data().toArray();

  const embarque_id = embarqueData.embarques.id;
  const button = new loadingButton($(this), 'Guardando...');

  if (piezas_verificadas.length === 0) {
    toastr.error('No se ha verificado ninguna pieza');
    return;
  }

  const created_at = new Date().toISOString();

  const data = {
    embarque_id: embarque_id,
    piezas_verificadas
  };

  console.log(data);
  button.start();
  const response = await fetchData('/embarques/verificar', 'POST', data);
  button.stop();

  if (response.status === true) {
    toastr.success('Piezas verificadas correctamente');
    verification_mode = false;
    resetVerifications();
    $('#save_verification_btn').addClass('d-none');
    $('#cancel_verificacion_btn').addClass('d-none');
    $('#startVerificacion').removeClass('d-none');
    $('#start_verificacion').modal('hide');

    $('#container_general').removeClass('d-none');
    $('#container_verificacion').addClass('d-none');

    $('#container_piezas_table').removeClass('d-none');
    $('#container_verificaciones_table').addClass('d-none');

    verificadas_array = [];
    embarqueData.embarque_contenedor_codes = embarqueData.embarque_contenedor_codes.map(pieza => {
      if (piezas_verificadas.find(pieza_verificada => pieza_verificada.codigo === pieza.code)) {
        console.log(pieza);
        pieza.verified = true;
      }
      return pieza;
    });

    for (const cod of piezas_verificadas) {
      embarqueData.embarque_contenedor_verified.push({
        created_at,
        codigo: cod.codigo
      });
    }

    $('#select_verificaciones ~ span').removeClass('d-none');
    $('#select_verificaciones').empty();
    $('#select_verificaciones').append(new Option(isoDateToFormattedWithTime(created_at), created_at, false, false));
    updateGeneralProgress();
    $('#save_verification_modal').modal('hide');
    $(".embarque_container_child[embarque_id='" + embarqueData.embarques.id + "']").click();
  } else {
    toastr.error('Error al verificar piezas');
  }
});
