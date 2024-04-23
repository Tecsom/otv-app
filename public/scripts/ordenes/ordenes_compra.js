//ordenes_table
import { fetchData, loadingButton } from '/public/scripts/helpers.js';

$(() => {
  init();
});

async function init() {
  new PerfectScrollbar(document.getElementById('ordenes_compra_container'), {
    wheelPropagation: false
  });

  $('#date_picker').flatpickr({
    // EN ESTA PARTE ES DONDE SE REGISTRA EL EVENTO
    onChange: function (selectedDates, dateStr, instance) {
      console.log(selectedDates + '/' + dateStr);
    },
    // FIN EVENTO
    minDate: 'today',
    dateFormat: 'd/m/Y',
    //maxDate: 'today',
    locale: {
      firstDayOfWeek: 1,
      weekdays: {
        shorthand: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'],
        longhand: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
      },
      months: {
        shorthand: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Оct', 'Nov', 'Dic'],
        longhand: [
          'Enero',
          'Febrero',
          'Мarzo',
          'Abril',
          'Mayo',
          'Junio',
          'Julio',
          'Agosto',
          'Septiembre',
          'Octubre',
          'Noviembre',
          'Diciembre'
        ]
      }
    }
  });

  const $clients = $('#select_client');
  const clientes = await getClientes();

  clientes.forEach(cliente => {
    $clients.append(
      $('<option>', {
        value: cliente.id,
        text: cliente.nombre
      })
    );
  });
}

async function getClientes() {
  const clientes = await fetchData('/clientes', 'GET');
  if (!clientes.status) {
    console.log('No se encontraron clientes');
    return [];
  }

  return clientes.data;
}

$('#create_order').on('submit', async function (e) {
  e.preventDefault();
  const $folio = $('#folio_id');
  const $date = $('#date_picker');
  const $client = $('#select_client');

  const folio = $folio.val().trim();
  const dateval = $date.val();
  const client_id = $client.val();

  if (!client_id || !dateval || !folio) {
    toastr.error('Completa los campos para crear órden', 'Formulario incompleto');
    return;
  }

  const date = new Date(dateval);
  date.setUTCHours(date.getUTCHours() - 6);
  const isoStringDate = date.toISOString();

  const result = await fetchData('/ordenes/create', 'POST', {
    folio_id: folio,
    delivery_date: isoStringDate,
    client_id: client_id
  });

  const apiResult = result.data;

  if (!apiResult.status) {
    toastr.error(apiResult.data.details, 'Ocurró un error');
    return;
  }
  toastr.success('Creado con éxito');
  $folio.val('');
  $date.val('');
  $client.val('');
  $('#create_orden_compra').modal('hide');
});

async function getOrdenes() {
  const ordenes = await fetchData('/ordenes', 'GET'); //api/ordenes
  if (!ordenes.status) {
    toastr.error('Ocurrio un error al obtener órdenes');
    return;
  }
  return ordenes.data;
}

async function loadOrdenes() {
  const $container = $('#ordenes_compra_container');
  $container.empty();
  const ordenes = await getOrdenes();
  ordenes.forEach(orden => {
    var $newdiv1 = $(`
        <div id="order_${orden.id}">
          <label>Folio Asignado</label>
          <p>${addLeadingZeros(orden.unique_folio, 6)}</p>
          <label>Cliente</label>
          <p>${orden.client_id}</p>
          <label>Folio</label>
          <p>${orden.folio_id}</p>
          <label>Fecha de entrega</label>
          <p>${orden.delivery_date}</p>          
        </div>
      `);
    $newdiv1.data({ data: orden });

    $container.append($newdiv1);
    $container.append('<hr>');
  });
}

loadOrdenes();

function addLeadingZeros(number, length) {
  // Convert number to string
  let numStr = String(number);

  // Calculate how many zeros to add
  let zerosToAdd = Math.max(length - numStr.length, 0);

  // Return the number padded with leading zeros
  return '0'.repeat(zerosToAdd) + numStr;
}
