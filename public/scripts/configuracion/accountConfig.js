import {fetchData} from '/public/scripts/helpers.js'


$('#verificadorPass').on('submit',async function(e){
    e.preventDefault()
    const $passChecker = $('#passchecker') 
    const newPass = $passChecker.val()

    if(!newPass || newPass.length < 5){
        toastr.error("La contraseña debe contener al menos 6 números","Contraseña inválida")
        return
    }

    await fetchData('/settings/verificador/password/update','PUT',{password: newPass})

})
