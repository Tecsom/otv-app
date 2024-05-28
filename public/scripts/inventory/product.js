import { fetchData, loadingButton } from '/public/scripts/helpers.js';

//get product_id from url last param
const product_id = window.location.pathname.split('/').pop();

$('#edit-product-form').submit(async function (e) {
  e.preventDefault();
  const formData = new FormData(this);
  const data = Object.fromEntries(formData);
  data.id = product_id;
  const button = new loadingButton($('#confirm_edit_product'));
  button.start();
  const res = await fetchData(`/inventory`, 'PUT', data);
  button.stop();
  if (res.status === true) {
    $('#modal_edit_product').modal('hide');
    toastr.success('Producto actualizado exitosamente', 'Producto actualizado');
    return;
  }
});

$('#delete_product_button').on('click', async function () {
  const button = new loadingButton($('#delete_product_button'));
  button.start();
  const res = await fetchData(`/inventory/${product_id}`, 'DELETE');
  if (res.status === true) {
    window.location.href = '/inventario';
    return;
  }

  toastr.error('Error al eliminar el producto', 'Error');
  button.stop();
});
