import { fetchData, loadingButton } from '/public/scripts/helpers.js';
let movements = [];
const tableActions = `<div class="d-inline-block text-nowrap">
                    <button class="btn btn-sm btn-icon delete-icon open-delete-mv-modal" title="Eliminar" data-bs-toggle="tooltip" data-bs-placement="top"><i class="ti ti-trash-x"></i></button>
                </div>`;

$('#select-products-inventario').select2({
  placeholder: 'Seleccione un producto',
  dropdownParent: $('#modify_inventory_modal'),
  ajax: {
    url: '/api/inventory/paging',
    dataType: 'json',
    data: function (params) {
      return { search: params.term, length: 10, draw: 1, start: params.page || 1, page: params.page || 1 };
    },
    processResults: function (data, params) {
      return {
        results: data.data.map(prod => ({
          id: prod.id,
          text: prod.name,
          ...prod
        })),
        pagination: {
          more: data.data.length === 10
        }
      };
    }
  }
});

$('#select-individuals-inventario').select2({
  placeholder: 'Seleccione un individual',
  dropdownParent: $('#modify_inventory_modal'),
  ajax: {
    url: '/api/inventory/paging/individual',
    dataType: 'json',
    data: function (params) {
      return {
        search: params.term,
        length: 10,
        draw: 1,
        page: params.page || 1,
        product_id: $('#select-products-inventario').val(),
        excluded_individuals
      };
    },
    processResults: function (data, params) {
      return {
        results: data.data.map(ind => ({
          id: ind.id,
          text: ind.code,
          ...ind
        })),
        pagination: {
          more: data.data.length === 10
        }
      };
    }
  }
});

let excluded_individuals = [];

const $container_individuals = $('#container-individuals');
const render_individual = individual => {
  return `<div class="col-md-12 individual-child" individual-id="${individual.individual_id}" data-individual='${JSON.stringify(
    individual
  )}'>
    <div class="card rounded-3 overflow-hidden">
        <div class="card-body">
            <div
                class="d-flex justify-content-between align-items-center"
            >
                <div class="d-flex align-items-center gap-2">
                    <strong class="mb-0">${individual.code}</strong>
                    <p class="mb-0">Restante: ${individual.remaining * 100}%</p>
                    <input
                        style="width: 100px"
                        type="number"
                        min="0"
                        max="100"
                        class="form-control rounded-3 input-consumed"
                        placeholder="10"
                        value="${individual.consumed ?? ''}"
                    />
                </div>
                <button
                    class="btn btn-icon bg-red-lt delete-individual"
                    aria-label="Button"
                >
                    <i class="ti ti-x ti-sm"></i>
                </button>
            </div>
        </div>
    </div>
</div>`;
};

const inventarios_table = $('#inventario_table').DataTable({
  columns: [
    { data: 'code', title: 'Código', orderable: false },
    { data: 'product_name', visible: false },
    {
      data: 'consumed',
      title: 'Consumido',
      orderable: false,
      render: function (data, type, row) {
        const movement = movements.find(mov => mov.individual_id === row.id && mov.product_id === row.product_id);
        //to .00
        const percentage = (movement ? movement.consumed * 100 : 0).toFixed(2);
        return `${percentage}%`;
      }
    },
    { title: '', defaultContent: tableActions, width: '30px' }
  ],
  rowGroup: {
    dataSrc: 'product_name'
  },
  order: [[1, 'asc']],
  dom: 'rtp',
  language: {
    url: 'https://cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json'
  },
  paging: false
});

$('#select-products-inventario').on('select2:select', function (e) {
  $('#select-individuals-inventario').val(null).trigger('change');
});

$('#select-individuals-inventario').on('select2:select', function (e) {
  const data = e.params.data;
  const data_individual = {
    individual_id: data.id,
    code: data.text,
    remaining: data.remaining,
    consumed: 0
  };

  $container_individuals.append(render_individual(data_individual));
  excluded_individuals.push(data.id);
  $('#select-individuals-inventario').val(null).trigger('change');
  $('#select-products-inventario').prop('disabled', true);
});

$container_individuals.on('click', '.delete-individual', function () {
  const individual_id = $(this).closest('.individual-child').attr('individual-id');
  excluded_individuals = excluded_individuals.filter(id => id !== parseInt(individual_id));

  $(this).closest('.individual-child').remove();
  if ($('.individual-child').length === 0) {
    $('#select-products-inventario').prop('disabled', false);
  }
});

$('#save_inventory').on('click', async function () {
  const product_id = parseInt($('#select-products-inventario').val());
  const individuals = [];
  const order_data = $('#container-reporte').data();
  const order_id = order_data.id;
  $('.individual-child').each(function () {
    const individual = $(this).data('individual');
    const consumed_b100 = parseFloat($(this).find('input').val()) || 0;
    const consumed = consumed_b100 / 100;

    if (consumed_b100 < 0.1) {
      toastr.error('El consumo no puede ser menor a 0.1%', 'Error');
      throw 'El consumo no puede ser menor a 0.1';
    }

    individuals.push({
      product_id,
      individual_id: individual.individual_id,
      type: 'output',
      consumed,
      order_id,
      ...(individual.id ? { id: individual.id } : {})
    });
  });

  const res = await fetchData('/movements', 'PUT', individuals);
  if (res.status === true) {
    let upserted = res.data.map(mov => ({
      individual_id: mov.individual_id,
      code: mov.individual.code,
      product_name: mov.product.name,
      product_id: mov.product_id,
      consumed: mov.consumed
    }));

    if (upserted.length < 1) return;
    let updated_movements = [];

    for (const upserted_item of upserted) {
      const index = movements.findIndex(
        mov => mov.individual_id === upserted_item.id && mov.product_id === upserted_item.product_id
      );
      if (index !== -1) {
        updated_movements.push(movements[index]);
        movements.splice(index, 1);
      } else {
        updated_movements.push(upserted_item);
      }
    }

    movements.push(...updated_movements);

    const rows = inventarios_table.rows().data().toArray();
    upserted = upserted.map(upserted_item => {
      delete upserted_item.id;
      upserted_item.id = upserted_item.individual_id;
      return upserted_item;
    });
    rows.push(...upserted);

    inventarios_table.clear().draw();
    inventarios_table.rows.add(rows).draw();

    $('#modify_inventory_modal').modal('hide');
    return;
  }
  toastr.error('Ha ocurrido un error al modificar el inventario', 'Error');
});

//min 0 max 100 just numbers one decimal, two decimals and no negative numbers
$container_individuals.on('input', '.input-consumed', function () {
  const value = $(this).val();
  if (value.length === 0) return;
  //   const regex = /^\d{1,2}(\.\d{1,2})?$/; need to allow 100
  //   if (!regex.test(value)) {
  //     $(this).val(value.slice(0, -1));
  //   }

  const regex = /^\d{1,3}(\.\d{1,2})?$/;
  if (!regex.test(value)) {
    $(this).val(value.slice(0, -1));
  }
});

$('#modify_inventory_button').on('click', function () {
  $('#modify_inventory_modal').modal('show');
  $container_individuals.empty();
  $('#select-products-inventario').prop('disabled', false);
  $('#select-products-inventario').val(null).trigger('change');
  $('#select-individuals-inventario').val(null).trigger('change');
});

$('#ordenes_compra_container').on('click', '.order_container_child', function () {
  excluded_individuals = [];

  const order_data = $(this).data().data;
  inventarios_table.clear().draw();

  const { products } = order_data;
  if (!products) return;
  const products_parsed = products
    .map(prod => JSON.parse(prod))
    .sort((a, b) => {
      if (a.product_name < b.product_name) {
        return -1;
      }
      if (a.product_name > b.product_name) {
        return 1;
      }
      return 0;
    });

  excluded_individuals = products_parsed.map(prod => prod.id);
  movements = order_data.movements ?? [];
  inventarios_table.rows.add(products_parsed).draw();

  if (order_data.estado !== 'pendiente') {
    $('#modify_inventory_button').addClass('d-none');
    inventarios_table.column(3).visible(false);
  } else {
    $('#modify_inventory_button').removeClass('d-none');
    inventarios_table.column(3).visible(true);
  }
});

inventarios_table.on('click', '.open-delete-mv-modal', function () {
  const data = inventarios_table.row($(this).closest('tr')).data();
  const movement = movements.find(mov => mov.individual_id === data.id && mov.product_id === data.product_id);
  const movement_id = movement.id;
  $('#delete_inventario_modal').modal('show');
  $('#delete_inventario_modal').data('movement_id', movement_id);
});

$('#delete-movement-button').on('click', async function () {
  const movement_id = $('#delete_inventario_modal').data('movement_id');
  const movement_data = movements.find(mov => mov.id === movement_id);
  const button = new loadingButton($(this));
  button.start();
  const res = await fetchData(`/movements/${movement_id}`, 'DELETE');
  button.stop();
  if (res.status === true) {
    const index = movements.findIndex(mov => mov.id === movement_id);
    movements.splice(index, 1);
    const rows = inventarios_table.rows().data().toArray();
    const index_row = rows.findIndex(
      row => row.id === movement_data.individual_id && row.product_id === movement_data.product_id
    );
    rows.splice(index_row, 1);
    inventarios_table.clear().draw();
    inventarios_table.rows.add(rows).draw();
    $('#delete_inventario_modal').modal('hide');
    excluded_individuals = excluded_individuals.filter(id => id !== movement_data.individual_id);
  }
});
