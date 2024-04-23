//ordenes_table
import { fetchData, loadingButton } from '/public/scripts/helpers.js';

const clientes_table = $('#ordenes_table').DataTable({
    select: {
      style: 'multi',
      selector: 'td:not(.non-selectable)'
    },
    columns: [
      { data: 'folio_id', title: 'Folio identificador', orderable: true, className: 'non-selectable' },
      { data: 'Folio', title: 'Folio (Automático)', orderable: true, className: 'non-selectable' },
      { data: 'cliente', title: 'Cliente', orderable: false, className: 'non-selectable' }
    ],
    dom: 'rtp',
    paging: false,
    language: {
      url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json'
    },
    order: [[0, 'asc']],
    searching: true
  });


 
$(()=>{

    init()

})
  

async function init(){

    $("#date_picker").flatpickr({
      // EN ESTA PARTE ES DONDE SE REGISTRA EL EVENTO
      onChange: function(selectedDates, dateStr, instance) {
      console.log(selectedDates+"/"+dateStr)
      },
      // FIN EVENTO
      minDate: 'today',
      //maxDate: 'today',
      locale: {
      firstDayOfWeek: 1,
      weekdays: {
        shorthand: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'],
        longhand: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],         
      }, 
      months: {
        shorthand: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Оct', 'Nov', 'Dic'],
        longhand: ['Enero', 'Febrero', 'Мarzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      },
    },

  });


    const $clients = $('#select_client')
    const clientes = await getClientes()

    clientes.forEach(cliente => {
      $clients.append($('<option>', {
        value: cliente.id,
        text: cliente.nombre
      }));
    });
}


  async function getClientes(){
    const clientes = await fetchData('/clientes','GET')
    if(!clientes.status){
        console.log("No se encontraron clientes")
        return []
    }

    return clientes.data
  }

  $('#create_order').on('submit',async function(e){
    e.preventDefault()
    const $folio = $('#folio_id')
    const $date = $('#date_picker')
    const $client = $('#select_client')

    const folio = $folio.val().trim()
    const date = dateToTimestamo($date.val())
    const client_id = $client.val()

    if(!client_id || !date || !folio){
      toastr.error("Completa los campos para crear órden", "Formulario incompleto")
      return
    }

    const result = await fetchData('/ordenes/create','POST',{
      folio_id:folio, 
      delivery_date: date, 
      client_id: client_id
    })
    
    if(!result.status){
      toastr.error("Ocurró un error")
      return
    }
    toastr.success("Creado con éxito")
    console.log("enviar formulario")


console.log({folio,date,client_id})
  })
  
  function dateToTimestamo(fechaString) {
    const fecha = new Date(fechaString);

    const timestamp = fecha.getTime();

    return timestamp;
}