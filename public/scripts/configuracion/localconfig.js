import {fetchData, setCookie, getCookie, deleteCookie} from '/public/scripts/helpers.js'
//Modo oscuro

const cookiePortName = "scannerPort"

async function init(){

    await listPorts()
    const cookie = getCookie(cookiePortName)
    if(!cookie){
        return
    }
    const $ports = $('#portSelect')
    
    if ($ports.find(`option[value="${cookie}"]`).length === 0) {
        console.log("option of cookie not found")
        return
    }

    $ports.val(cookie)
}

//Puerto serie
async function listPorts(){
    const $ports = $('#portSelect')
    const result = await fetchData('/list/ports')
    if(!result.status){
        toastr.error("Ocurrió un error al leer puertos")
        return
    }
    result.data.forEach(portPath => {
        const port = portPath.path
        const portName = getPortName(port)
        $ports.append($('<option>', {
            value: port,
            text: portName
        }));
    });
    
}

function getPortName(portPath){
    const match = portPath.match(/\/dev\/tty\.(.+)/);
    return match ? match[1] : null;
}




$('#localConfigForm').on('submit',function(e){
    e.preventDefault()
    console.log("submit")

    const $isDarkMode = $('#isDarkMode')
    const isDarkMode = $isDarkMode.val()

    const $ports = $('#portSelect')
    const portValue = $ports.val()

    if(!portValue){
        deleteCookie(cookiePortName)
        return
    }
    const expiration = 157788000000 //5 años

    setCookie(cookiePortName,portValue,expiration)

    toastr.success(`Aplicando cambios`)

    if(isDarkMode){
        window.templateCustomizer.setStyle('dark');
    }else{
        window.templateCustomizer.setStyle('light');

    }

})

init()