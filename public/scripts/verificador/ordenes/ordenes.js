import { fetchData, loadingButton, isoDateToFormatted, isoDateToFormattedWithTime } from '/public/scripts/helpers.js';

let cantidadRestante;
let cantidadProductos;
let cantidadIngresada;
let productoByCode;
let codigoVerificador;
let verificadas_array = [];
$('#exit-checker').on('click', async function () {
  $('#modal_quit_checker').modal('show');
});

$('#quit-checker-form').on('submit', async function (e) {
  e.preventDefault();
  const button = new loadingButton($('#button_confirm_quit'));
  button.start();

  const password = $('#password').val();

  if (password === '') {
    toastr.error('Por favor, ingrese su contraseña');
    return;
  }

  const res = await fetchData('/settings/quit-checker?password=' + password);

  if (res.status === true) {
    toastr.success('Contraseña correcta');
    localStorage.removeItem('checker');
    window.location.href = '/';

    return;
  }
  button.stop();
  toastr.error('Contraseña incorrecta');
});

const renderListImage = (name, url) => {
  return `<a ${url && 'signed-url=' + url} href="javascript:void(0);" class="list-group-item list-group-item-action">${name}</a>`;
};

const renderListFile = (name, url, filename) => {
  return `

    <a href="javascript:void(0);"  class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
      ${name} 
      <button style="box-shadow: none;" signed-url=${url} file-name="${filename}" type="button" class="btn btn-icon download-file">
        <span class="ti ti-download"></span>
      </button>
    </a>
  `;
};

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
    { data: 'numero_parte', title: 'No. de parte' },
    {
      title: 'Total verificado',
      render: function (data, type, row) {
        //verificaciones unicas por pieza
        const verificaciones = ordenData.ordenes_static_verified.filter(ver => row.codigos.includes(ver.codigo));
        const verificaciones_unicas = verificaciones.reduce((acc, ver) => {
          console.log(ver);
          if (!acc.includes(ver.codigo)) {
            acc.push({ codigo: ver.codigo, cantidad: ver.quantity });
          }
          return acc;
        }, []);
        if (row.type === 'bulk') {
          if (verificaciones_unicas.length == 0) {
            return `${verificaciones_unicas.length || 0} de ${row.quantity}`;
          } else {
            return `${verificaciones_unicas.reduce((acc, ver) => acc + ver.cantidad, 0)} de ${row.quantity}`;
          }
        }
        return `${verificaciones_unicas.length || 0} de ${row.codigos.length}`;
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

const format_subrow = (data, isLast) => {
  const styles = !isLast ? 'border-bottom: 1px dotted #dee2e6;' : '';
  return `
    <div class="row py-3 px-2" codigo="${data.code}" style="${styles}" >
      <div class="col-md-6">
        <p class="mb-0"><strong>Código: </strong>${data.code}</p>
      </div>
      <div class="col-md-6">
        <p class="mb-0"><strong>Revisión: </strong>${data.revisiones.nombre}</p>
      </div>
    </div>
  `;
};

table_piezas.on('click', '.btn-ver-codigos', function (e) {
  let tr = e.target.closest('tr');
  let row = table_piezas.row(tr);
  const data = row.data();

  const full_codigos = ordenData.codigos;
  const codigos = full_codigos.filter(codigo => data.codigos.includes(codigo.code));
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

loadOrderData = async () => {
  table_piezas.clear().draw();
  $('#folio_oc').text(ordenData.folio_unico ?? 'Sin folio');
  $('#fecha_entrega_oc').text(isoDateToFormatted(ordenData.fecha_entrega) ?? 'Sin fecha de entrega');
  $('#cliente_oc').text(ordenData?.cliente?.nombre ?? 'Sin cliente relacionado');
  $('#cliente_folio_oc').text(ordenData.folio_cliente ?? 'Sin folio de cliente');

  $('#client_avatar').text(ordenData?.cliente?.nombre.charAt(0).toUpperCase());

  const pp_res = await fetchData(`/clientes/${ordenData?.cliente?.id}/profile-photo`);
  if (pp_res.status === true) {
    $('#client_pp').attr('src', pp_res.data);
    $('#client_avatar').addClass('d-none');
    $('#client_pp').removeClass('d-none');
  } else {
    $('#client_avatar').removeClass('d-none');
    $('#client_pp').addClass('d-none');
  }

  // const data_table_piezas = [];
  const { productos, codigos } = ordenData;

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

  table_piezas.rows.add(productos).draw();
  updateGeneralProgress();
};

$('#startVerificacion').on('click', function () {
  const progress = updateGeneralProgress();
  console.log(progress);
  if (progress === 100) {
    toastr.error('La orden ya ha sido verificada');
    return;
  }
  $('#start_verificacion').modal('show');
});

$('#table_piezas_oc').on('click', '.btn-opciones-pieza', async function () {
  const data = table_piezas.row($(this).parents('tr')).data();
  const producto = data;

  $('#pieza_numero_parte').text(producto.numero_parte);
  $('#pieza_numero_parte_title').text(producto.numero_parte);
  $('#pieza_revision').text(producto.revisiones.nombre);
  $('#pieza_descripcion').text(producto.descripcion);
  $('#pieza_cantidad').text(producto.quantity);
  $('#modal_view_pieza').modal('show');

  // /clientes/:cliente_id/piezas/:pieza_id/revisiones/:revision_id/files

  const files_res = await fetchData(
    `/clientes/${producto.client_id}/piezas/${producto.pieza_id}/revisiones/${producto.revisiones.id}/files`
  );
  if (files_res.status === true) {
    const { images, files } = files_res.data;
    const list_images = images.map(image => renderListImage(image.name, image.data)).join('');
    const list_files = files.map(file => renderListFile(file.name, file.data, file.name)).join('');

    $('#pieza_files_list').html(list_files);
    $('#pieza_images_list').html(list_images);
  }
});

$('#pieza_files_list').on('click', 'button', async function () {
  const url = $(this).attr('signed-url');
  const filename = $(this).attr('file-name');

  const response = await fetch(url);

  const blob = await response.blob();

  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  link.remove();
});

$('#pieza_images_list').on('click', 'a', function () {
  const url = $(this).attr('signed-url');
  const lightbox = new FsLightbox();
  lightbox.props.sources = [url];
  lightbox.open();
});

$('#start_verificacion_btn').on('click', function () {
  resetVerifications();
  verification_mode = true;
  $('#start_verificacion').modal('hide');
  $('#save_verification_btn').removeClass('d-none');
  $('#cancel_verificacion_btn').removeClass('d-none');
  $('#startVerificacion').addClass('d-none');

  //$('#progress_verificacion').css('width', '0%');
  //$('#progress_verificacion').text('Progreso de verificación (0%)');

  $('#container_general').addClass('d-none');
  $('#container_verificacion').removeClass('d-none');
  $('#select_verificaciones ~ span').addClass('d-none');

  $('#container_piezas_table').addClass('d-none');
  $('#container_verificaciones_table').removeClass('d-none');

  table_verificadas.clear().draw();
  table_not_verificadas.clear().draw();

  const codigos = ordenData.codigos;

  console.log({ ordenData });

  const codigosUnicos = new Set(codigos.map(pieza => pieza.code));

  const ordenesVerificadasArray = ordenData.ordenes_static_verified?.filter(orden =>
    codigos.find(pieza => pieza.code === orden.codigo)
  );

  const codigosCantidad = {};

  ordenesVerificadasArray.forEach(orden => {
    if (codigosCantidad[orden.codigo]) {
      codigosCantidad[orden.codigo] += orden.quantity;
    } else {
      codigosCantidad[orden.codigo] = orden.quantity;
    }
  });

  const productos = ordenesVerificadasArray.map(orden => {
    const producto = ordenData.productos.find(prod => prod.codigos.includes(orden.codigo));
    if (producto && producto.type === 'simple') {
      return { ...producto, quantity: codigosCantidad[orden.codigo] };
    }
    return producto;
  });

  const comparacion = ordenesVerificadasArray.map((orden, index) => {
    const producto = productos[index];
    return {
      orden: orden.codigo,
      ordenQuantity: codigosCantidad[orden.codigo],
      productoQuantity: producto ? producto.quantity : 'Producto no encontrado',
      sonIguales: producto ? producto.quantity === codigosCantidad[orden.codigo] : false
    };
  });

  const ordenesVerificadasTemp = ordenData.ordenes_static_verified?.filter(
    (orden, index, self) => codigosUnicos.has(orden.codigo) && self.findIndex(t => t.codigo === orden.codigo) === index
  );

  const ordenesSinVerificar = codigos.filter(
    pieza =>
      !ordenesVerificadasTemp.find(orden => orden.codigo === pieza.code) ||
      comparacion.find(comp => comp.orden === pieza.code && !comp.sonIguales)
  );

  const ordenesVerificadas = ordenesVerificadasTemp.filter(
    orden => !ordenesSinVerificar.find(noVerificado => noVerificado.code === orden.codigo)
  );

  table_not_verificadas.rows.add(ordenesSinVerificar).draw();
});

$('#cancel_verificacion_btn').on('click', function () {
  $('#cancel_verification_modal').modal('show');
});

$('#cancel_verification_modal_btn').on('click', function () {
  totalProgress = 0;

  $('#cancel_verification_modal').modal('hide');
  $('#save_verification_btn').addClass('d-none');
  $('#cancel_verificacion_btn').addClass('d-none');
  $('#startVerificacion').removeClass('d-none');
  $('#select_verificaciones ~ span').removeClass('d-none');

  $('#container_piezas_table').removeClass('d-none');
  $('#container_verificaciones_table').addClass('d-none');

  resetVerifications();
});

const resetVerifications = () => {
  $('tr').removeClass('bg-label-success');
  $('#select_verificaciones').val(null).trigger('change');
  const table_data = table_piezas.rows().data().toArray();
  productoByCode = {};
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

const socket = io.connect();
socket.on('scanner', data => {
  if (verification_mode === true) {
    verificarPieza(data);
  }
});

const verificarPieza = async codigo => {
  //const exists = ordenData.codigos.find(pieza => pieza.code === codigo);
  const isVerified = verificadas_array.includes(codigo);

  productoByCode = ordenData.productos.find(product => product.codigos.find(code => code === codigo));

  const data_no_verified = table_not_verificadas.rows().data().toArray();

  const existsInNotVerified = data_no_verified.find(pieza => pieza.code === codigo);

  const data_verified = table_verificadas.rows().data().toArray();

  const existsInVerified = data_verified.find(pieza => pieza.codigo === codigo);

  if (existsInVerified) {
    toastr.warning('Pieza ya verificada');
    return;
  }

  codigoVerificador = codigo;

  if (!existsInNotVerified) {
    toastr.error('Pieza no encontrada');
    return;
  }

  if (isVerified) {
    toastr.warning('Pieza ya verificada');
    return;
  }

  if (productoByCode?.type === 'bulk') {
    $('#check_quantity').val('');
    $('#ask_quantity').modal('show');
    return;
  }

  productoByCode.quantity = 1;

  console.log(productoByCode);

  verify(codigo);
};

$('#boton_mandar_cantidad').on('click', function () {
  console.log(productoByCode);
  const ordenesVerificadas = ordenData.ordenes_static_verified?.filter(orden => orden.codigo === codigoVerificador);
  console.log({ ordenesVerificadas });

  const cantidadPieza = ordenesVerificadas.reduce((acc, orden) => acc + orden.quantity, 0);
  console.log({ cantidadPieza });

  cantidadRestante = productoByCode.quantity - cantidadPieza;
  console.log({ cantidadRestante });

  if ($('#check_quantity').val() > productoByCode.quantity) {
    toastr.error('La cantidad ingresada es mayor a la cantidad de la pieza');
    return false;
  }
  if ($('#check_quantity').val() <= 0) {
    toastr.error('Debe ingresar una cantidad valida');
    return false;
  }
  if ($('#check_quantity').val() === '') {
    toastr.error('Ingrese la cantidad de producto');
    return false;
  }
  cantidadIngresada = Number($('#check_quantity').val());

  if (cantidadRestante == 0) {
    toastr.error('Toda la cantidad de la pieza ya ha sido verificada');
    $('#ask_quantity').modal('hide');

    return;
  }

  if (cantidadIngresada > cantidadRestante) {
    toastr.error('La cantidad ingresada es mayor a la cantidad restante por verificar');
    return;
  }
  $('#ask_quantity').modal('hide');
  verify(codigoVerificador);
});

let totalProgress = 0;

const verify = codigo => {
  table_verificadas.rows
    .add([
      {
        codigo,
        cantidad: productoByCode.type === 'bulk' ? cantidadIngresada : 1
      }
    ])
    .draw();

  //remove from table_not_verificadas
  table_not_verificadas.rows().every(function () {
    const row = this.data();
    if (productoByCode.quantity === cantidadIngresada && productoByCode.type === 'bulk') {
      if (row?.code === codigo) {
        this.remove().draw();
      }
    } else {
      if (row?.code === codigo) {
        this.remove().draw();
      }
    }
  });

  cantidadProductos =
    table_verificadas.rows().data().toArray().length + table_not_verificadas.rows().data().toArray().length;

  if (!verificadas_array.includes(codigo)) {
    verificadas_array.push(codigo);

    console.log(productoByCode);

    let progress = 0;
    console.log(productoByCode);
    if (productoByCode.type === 'bulk') {
      progress = (cantidadIngresada / cantidadRestante) * 100;
      progress /= cantidadProductos;
    } else {
      progress = 100 / cantidadProductos;
    }

    totalProgress += progress;

    $('#progress_verificacion').css('width', `${totalProgress}%`);
    $('#progress_verificacion').text(`Progreso de verificación (${totalProgress.toFixed(2)}%)`);
  }
};

$('#save_verification_modal_btn').on('click', async function () {
  const piezas_verificadas = table_verificadas.rows().data().toArray();
  totalProgress = 0;

  const order_id = ordenData.id;
  const button = new loadingButton($(this), 'Guardando...');

  if (piezas_verificadas.length === 0) {
    toastr.error('No se ha verificado ninguna pieza');
    return;
  }

  const created_at = new Date().toISOString();

  const data = {
    order_id,
    piezas_verificadas,
    created_at
  };

  console.log(data);
  button.start();
  const response = await fetchData('/ordenes/verificar', 'POST', data);
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
    ordenData.codigos = ordenData.codigos.map(pieza => {
      if (piezas_verificadas.find(pieza_verificada => pieza_verificada.codigo === pieza.code)) {
        pieza.verified = true;
      }
      return pieza;
    });

    for (const cod of piezas_verificadas) {
      ordenData.ordenes_static_verified.push({
        created_at,
        codigo: cod.codigo
      });
    }

    $('#select_verificaciones ~ span').removeClass('d-none');
    $('#select_verificaciones').empty();
    $('#select_verificaciones').append(new Option(isoDateToFormattedWithTime(created_at), created_at, false, false));
    updateGeneralProgress();
    $('#save_verification_modal').modal('hide');
    $(".order_container_child[order_id='" + ordenData.id + "']").click();
  } else {
    toastr.error('Error al verificar piezas');
  }
});

$('#save_verification_btn').on('click', async function () {
  $('#save_verification_modal').modal('show');
});

const updateGeneralProgress = () => {
  const order_data = ordenData;
  let piezas = 0;
  let piezas_verificadas = 0;
  for (const producto of order_data.codigos) {
    const main_prod = order_data?.productos?.find(prod => prod.codigos.includes(producto.code));
    if (main_prod.type === 'bulk') {
      const ordenVerificada = order_data.ordenes_verified?.find(orden => orden.codigo === producto.code);
      const quantity = producto.data.reduce((acc, item) => acc + item.quantity, 0);
      const main_quantity = main_prod.quantity;

      if (quantity > 0) {
        const percentaje = quantity / main_quantity;
        console.log({ percentaje });
        piezas_verificadas += percentaje;
      }
      piezas++;
    } else {
      if (producto.verified) {
        piezas_verificadas++;
      }
      piezas++;
    }
  }
  console.log({ piezas, piezas_verificadas });

  const progress = (piezas_verificadas / piezas) * 100;

  $('#progress_general').css('width', `${progress}%`);
  $('#progress_general').text(`Progreso general (${progress.toFixed(2)}%)`);

  return progress;
};
