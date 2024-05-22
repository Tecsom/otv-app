import { fetchData } from "../helpers.js";

$(() => {
  init();
});

async function init() {
  new PerfectScrollbar(document.getElementById('embarques_container'), {
    wheelPropagation: false
  });
  loadEmbarques();

}

async function getEmbarques(){
  $("#embarques_container").empty();
  const embarques = await fetchData('/embarques', 'GET')

  if(embarques.status == false){
    toastr.error("Error al obtener los embarques")
  }

  return embarques
}

async function loadEmbarques() {
  const $container = $("#embarques_container")

  const embarques = await getEmbarques()
  
  for(let embarque of embarques.data){
    const uniqueFolio = Math.random().toFixed(3)

    const $newdiv1 = $(`
    <div class="embarque_container_child card-body border rounded mt-3 cursor-pointer" embarque_id="${embarque.id}" id="order_${uniqueFolio}">
      <div class="row g-2">
        <div class="col-md-12">
          <div class="d-flex align-items-center justify-content-between p-2 pb-0">
            <span class="badge bg-label-dark">${uniqueFolio}</span>
            <span class="text-capitalize badge bg-secondary">Pendiente</span>
          </div>
        </div>
        <div class="col-md-12">
          <hr class="m-0" />
        </div>
        <div class="col-md-12">
          <div class="p-2 pb-1 pt-0">
            <p class="mb-0 small"><strong>Cliente: </strong>${embarque.descripcion ?? '<span style="color:Red">Sin cliente relacionado</span>'}</p>
            <p class="mb-0 small"><strong>Folio de cliente: </strong></p>
            <p class="mb-0 small"><strong>Fecha de entrega: </strong></p>
            <p class="mb-0 small"><strong>Fecha de creación: </strong></p>   
          </div>      
        </div>
      </div>
    </div>
  `);
  $newdiv1.data({ data: embarque });
  $container.append($newdiv1);
  }

}


$("#create_order").on('submit', async function (e) {
  e.preventDefault();
  //Variables para post
  const $descripcion = $("#descripcion_embarque")

  const descripcion = $descripcion.val().trim();

  if(!descripcion){
    toastr.error("Completar los campos para crear el embarque")
  }

  const result = await fetchData('/embarque/create', 'POST', {
    descripcion: descripcion
  })

  const apiResult = result.data


  if (apiResult.status == false) {
    toastr.error(apiResult.data, 'Ocurrió un error');
    return;
  }

  toastr.success('Creado con éxito');
  $descripcion.val('');

  $("#create_embarque").modal("hide")

  await loadEmbarques()
})

$("#embarques_container").on('click', '.embarque_container_child', async function (e) {
  
  const $embarque = $(this)
  const data = $embarque.data().data

  console.log(data)

  const embarque = await fetchData('/embarque/' + data.id)

  console.log(embarque.data)

})