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

$('#create_individual_product_form').submit(async function (e) {
  e.preventDefault();
  const quantity = parseFloat($('#quantity_ins').val());

  const button = new loadingButton($('#confirm_new_individual'));
  button.start();
  const res = await fetchData('/inventory/' + product_id + '/individual', 'POST', {
    quantity
  });
  button.stop();
  if (res.status === true) {
    await loadIndividualProducts();
    $('#modal_create_individual_product').modal('hide');
    $('#create_individual_product_form').trigger('reset');

    toastr.success('Producto creado exitosamente', 'Producto creado');
    return;
  }
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
});

$('#output_product_form').submit(async function (e) {
  e.preventDefault();
  const individual_product_id = $('#modal_output_product').data('individual_product_id');
  const quantity_b100 = parseFloat($('#quantity_output').val());
  const quantity = quantity_b100 / 100;
  // const button = new loadingButton($('#confirm_output_product'));
  // button.start();
  // const res = await fetchData(`/inventory/${product_id}/individual/${individual_product_id}/output`, 'POST', {
  //   quantity
  // });
  // button.stop();
  // if (res.status === true) {
  //   await loadIndividualProducts();
  //   $('#modal_output_product').modal('hide');
  //   $('#output_product_form').trigger('reset');
  //   toastr.success('Salida realizada exitosamente', 'Salida realizada');
  //   return;
  // }
});
