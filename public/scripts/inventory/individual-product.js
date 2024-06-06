import { fetchData, loadingButton } from '/public/scripts/helpers.js';

const product_id = window.location.pathname.split('/').pop();

const delete_button = `
    <button class="btn btn-danger btn-sm open-output-modal" >Salida</button>
    `;

const individual_product_table = $('#individual-product-table').DataTable({
  columns: [
    { data: 'code', title: 'Código', orderable: true },
    {
      title: '% Restante',
      orderable: true,
      render: function (data, type, row) {
        // Calculate the percentage of remaining product in remaining prop (0-1)
        const remaining = row.remaining;
        const percentage = remaining * 100;
        return percentage.toFixed(2) + '%';
      }
    },
    {
      defaultContent: delete_button
    }
  ],
  dom: 'rtp',
  language: {
    url: 'https://cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json'
  },
  order: [[0, 'asc']],
  paging: true,
  searching: true
});

$('#search_individual').on('keyup', function () {
  individual_product_table.search(this.value).draw();
});

$('#create_individual_product_form').submit(async function (e) {
  e.preventDefault();
  const quantity = parseFloat($('#quantity_ins').val());
  const description = $('#description_input').val();

  const button = new loadingButton($('#confirm_new_individual'));
  button.start();
  const res = await fetchData('/inventory/' + product_id + '/individual', 'POST', {
    quantity,
    description
  });
  button.stop();
  if (res.status === true) {
    await loadIndividualProducts();
    $('#modal_create_individual_product').modal('hide');
    $('#create_individual_product_form').trigger('reset');
    const prev_quantity = parseFloat($('#total_quantity').text());
    $('#total_quantity').text(prev_quantity + quantity);
    $('#historial_table').DataTable().ajax.reload();

    toastr.success('Producto creado exitosamente', 'Producto creado');
    return;
  }

  toastr.error(res.message, 'Error');
});

$(document).ready(function () {
  loadIndividualProducts();
});

const loadIndividualProducts = async () => {
  const res = await fetchData(`/inventory/${product_id}/individual`);
  if (res.status === true) {
    individual_product_table.clear();
    individual_product_table.rows.add(res.data);
    individual_product_table.draw();
  }
};

$('#individual-product-table').on('click', '.open-output-modal', function () {
  $('#modal_output_product').modal('show');
  const data = individual_product_table.row($(this).parents('tr')).data();

  $('#modal_output_product').data('individual_product_id', data.id);
  $('#modal_output_product').data('remaining', data.remaining);
});

$('#output_product_form').submit(async function (e) {
  e.preventDefault();
  const individual_product_id = $('#modal_output_product').data('individual_product_id');
  const remaining = $('#modal_output_product').data('remaining');

  const quantity_b100 = parseFloat($('#quantity_output').val());
  const quantity = quantity_b100 / 100;

  const description = $('#description_output').val();

  const movement = {
    individual_id: individual_product_id,
    consumed: quantity,
    type: 'output',
    product_id,
    generated: true,
    description
  };

  const button = new loadingButton($('#confirm_output_product'));
  button.start();
  const res = await fetchData(`/movements/output`, 'POST', movement);
  button.stop();
  if (res.status === true) {
    const new_quantity = remaining - quantity;
    console.log({ new_quantity, remaining, quantity });
    if (new_quantity <= 0) {
      $('#total_quantity').text(parseFloat($('#total_quantity').text()) - 1);
    }

    $('#historial_table').DataTable().ajax.reload();

    await loadIndividualProducts();
    $('#modal_output_product').modal('hide');
    $('#output_product_form').trigger('reset');
    toastr.success('Salida realizada exitosamente', 'Salida realizada');
    return;
  }
  console.log({ res });

  toastr.error(res.message, 'Error');
});

$(document).ready(async function () {
  // /inventory/:product_id/individual/totals
  const res = await fetchData(`/inventory/${product_id}/individual/totals`);
  console.log({ res });
  if (res.status === true) {
    $('#total_quantity').text(res.data);
  }
});

// {
//   product_id,
//   individual_id: individual.individual_id,
//   type: 'output',
//   consumed,
//   order_id,
//   ...(individual.id ? { id: individual.id } : {})
// }
