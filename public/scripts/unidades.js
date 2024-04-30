import { fetchData, loadingButton } from '/public/scripts/helpers.js';

const badge_dot = `<div class="d-flex align-items-center lh-1 me-3">
                        <span class="badge badge-dot bg-primary me-1"></span> App
                    </div>`;

$('#unidades_medida_table').DataTable({
  columnDefs: [
    {
      // For Checkboxes
      targets: 0,
      searchable: false,
      orderable: true,
      render: function () {
        return '<input type="checkbox" class="dt-checkboxes form-check-input">';
      },
      checkboxes: {
        selectRow: true,
        selectAllRender: '<input type="checkbox" class="form-check-input">'
      }
    }
  ],
  select: {
    // Select style
    style: 'multi',
    selector: 'td:not(.non-selectable)'
  },
  columns: [
    { orderable: false, defaultContent: '', width: '50px' },
    { data: 'name', title: 'Nombre', orderable: true, className: 'non-selectable' },
    { data: 'short_name', title: 'Abreviatura', orderable: true, className: 'non-selectable' }
    //{ title: '', orderable: false, defaultContent: options, className: 'non-selectable' },
  ],
  dom: 'rtp',
  paging: false,
  language: {
    url: 'https:////cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json'
  },
  order: [[0, 'asc']],
  searching: true
});

$('#confirm_new_medida').on('click', function () {
  addMedida();
});

//fetchData  (endpoint, method = 'GET', body)

async function getMedidas() {
  const medidas_list = (await fetchData('/unidades/medida', 'GET')).data;

  $('#unidades_medida_table').DataTable().clear();
  $('#unidades_medida_table').DataTable().rows.add(medidas_list).draw();
}

async function addMedida() {
  const $btn = new loadingButton('#confirm_new_medida');

  $btn.start();

  const $name = $('#name_unidad_medida');
  const $shortName = $('#short_name_unidad_medida');

  const name = $name.val().trim();
  const short_name = $shortName.val().trim();

  if (!name || !short_name) {
    toastr.error('Es necesario llenar todos los campos', 'Ocurrió un error');
    $btn.stop();

    return;
  }

  const newMedida = {
    name,
    short_name
  };

  try {
    const result = await fetchData('/unidades/medida/new', 'POST', newMedida);
    if (!result.status) {
      toastr.error('Uno o más campos duplicados', 'Ocurrió un error');
      $btn.stop();
      return;
    }
    toastr.success('Creado con éxito');
    await getMedidas();
    $name.val('');
    $shortName.val('');
    $('#newMedida').modal('hide');
  } catch (e) {
    toastr.error('No se pudo crear');
  }
  $btn.stop();
}

function deleteMedida() {}

getMedidas();

/*
$('#unidades_medida_table').DataTable().on('select', function (e, dt, type, indexes) {

    if (type === 'row') {
        const data = $('#unidades_medida_table').DataTable().rows({ selected: true }).data().toArray();

        if (data.length > 1) {
            $("#selectedCollapse").collapse("show");
            $("#selectedClients").text(data.length);
        }

        //console.log({ data })

    }
});



$('#newClientButton').on('click', async function (e) {
    console.log("new client")
    listenEstadosSelect("#estado_cliente", "#ciudad_cliente")

    const estados = await loadEstados() //states array
    const $estados = $('#estado_cliente') //dom

    estados.forEach(function (estado) {
        var newOption = $('<option></option>');
        newOption.val(estado.id).text(estado.name);
        $estados.append(newOption);
    });

});

$('#confirm_new_client').on('click', async function (e) {
    addLoading(this)

    const $nombre = $("#nombre_cliente") //*Required filed
    const $RFC = $("#rfc_cliente") // *Required filed
    const $celular = $('#celular_cliente')
    const $ciudad = $('#ciudad_cliente')
    const $correo = $('#email_cliente')
    const $direccion = $('#domicilio_cliente')
    const $estado = $('#estado_cliente')
    const $telefono = $('#telefono_cliente')

    const rfc = $('#rfc_cliente').val().trim()
    const nombre = $('#nombre_cliente').val().trim()

    if (nombre == '' || rfc == '') {
        $nombre.addClass("field-error") //this class does not exists
        $RFC.addClass("field-error") //this class does not exists
        toastr.error("RFC y Nombre son campos obligatorios", "Error creando el cliente")
        removeLoading(this)
        return
    }

    const place_data = $(".modal_cliente").data().place
    let lat = 0
    let long = 0

    if (place_data) {
        lat = place_data?.geometry?.location?.lat() ?? 0
        long = place_data?.geometry?.location?.lng() ?? 0
    }

    const payload = { //EmpresaDataModel
        Celular: $celular.val(),
        Ciudad: $ciudad.val() != "" ? $('#ciudad_cliente option:selected').text() : '',
        Correo: $correo.val(),
        Direccion: $direccion.val(),
        Estado: $estado.val() != "" ? $('#estado_cliente option:selected').text() : '',
        Nombre: nombre,
        Servicios: [],
        Telefono: $telefono.val(),
        RFC: rfc,
        meta: {
            coords: {
                lat,
                long
            },
        }
    }
    console.log({ payload })


    try {
        const result = await put('/api/clientes/new', payload);
        if (result.error) {
            throw new Error(result.error)
        }
        await loadClientes()

        $("#newClient").modal("hide")

        $nombre.val("")
        $RFC.val("")
        $celular.val("")
        $ciudad.val("")
        $ciudad.prop('disabled', "true")
        $correo.val("")
        $direccion.val("")
        $estado.val("")
        $telefono.val("")


    } catch (error) {
        console.log({ error })
        toastr.error(error.message, "Error creando el cliente")
    }


    removeLoading(this)
})



// #myInput is a <input type="text"> element
$('#search-client').on('keyup', function () {
    searchInDatatable()
});

$('#ProductStatus').on('change', function () {
    searchInDatatable()
})
$("#creation_method_select").on("change", function () {
    searchInDatatable()
})

function searchInDatatable() {
    const datatable = $('#unidades_medida_table').DataTable()

    const $searchInput = $("#search-client")
    const $clientStatus = $("#ProductStatus")
    const $creation_on_select = $('#creation_method_select')

    const text = $searchInput.val().trim() != "" ? $searchInput.val() : ""
    const status = $clientStatus.val() != "" ? $clientStatus.val() : ""
    const creation_on = $creation_on_select.val() != "" ? $creation_on_select.val() : ""

    const value = `${status} ${creation_on} ${text} `

    datatable.search(value).draw();
}


async function loadClientes() {

    const clientes_res = await fetch('/api/clientes/list');
    const clientes_list = await clientes_res.json()
    //console.log({ clientes_list })

    clientes_list.forEach(function (client) {
        client.Ubicación = `${client.Ciudad}, ${client.Estado}`;
        const createdOn = (client.meta?.created_on ?? "app")
        const createdOnCapitalized = createdOn.charAt(0).toUpperCase() + createdOn.slice(1);
        const dotClass = createdOn == "app" ? "bg-success" : "bg-primary"
        client.created_on = `<div class="d-flex align-items-center lh-1 me-3">
                                <span class="badge badge-dot ${dotClass} me-1"></span> ${createdOnCapitalized}
                            </div>`
        const status = client.meta?.status ?? "active"
        client.Status = `<span class="badge ${status == "active" ? "bg-label-success" : "bg-label-warning"}">
                            ${status == "active" ? "Activo" : "Archivado"}
                        </span>`
    });

    clientes_list.sort((a, b) => {

        const nameA = a.Nombre.toLowerCase();
        const nameB = b.Nombre.toLowerCase();

        return nameA.localeCompare(nameB);
    });


    console.log({ clientes_list })

    $('#unidades_medida_table').DataTable().clear();
    $('#unidades_medida_table').DataTable().rows.add(clientes_list).draw();
    //$('[data-bs-toggle="tooltip"]').tooltip();

    $('#unidades_medida_table tbody').on('click', 'tr', function (e) {
        console.log(e.target.nodeName, e.target.className)
        // Check if the click was on the row itself
        if (e.target.nodeName !== "I" && !e.target.className.includes("dt-checkboxes")) {
            // Get the data of the clicked row
            var rowData = $('#unidades_medida_table').DataTable().row(this).data();
            window.location.href = `/clientes/${rowData.id}`;
        }
    });
}*/

//loadClientes();
