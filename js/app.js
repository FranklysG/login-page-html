// Set all axios timeouts to 10 seconds
axios.defaults.timeout = 10000;

function ValidaCPF() {
  var RegraValida = document.getElementById("usuario").value;
  var cpfValido = /^(([0-9]{3}.[0-9]{3}.[0-9]{3}-[0-9]{2})|([0-9]{11}))$/;
  if (cpfValido.test(RegraValida) == true) {
    console.log("CPF Válido");
  } else {
    console.log("CPF Inválido");
  }
}
function fMasc(objeto, mascara) {
  setTimeout(function () {
    fMascEx(objeto, mascara);
  }, 1);
}

function fMascEx(obj, masc) {
  obj.value = masc(obj.value);
}

function mCPF(cpf) {
  cpf = cpf.replace(/\D/g, ""); // remove any non-digit characters

  if (cpf.length <= 11) { // if the length is up to 11, consider it as CPF
    cpf = cpf.replace(/(\d{3})(\d)/, "$1.$2"); // put a dot between the third and the forth digits
    cpf = cpf.replace(/(\d{3})(\d)/, "$1.$2"); // put a dot between the third and the forth digits again
    cpf = cpf.replace(/(\d{3})(\d{1,2})$/, "$1-$2"); // put a dash before the last two digits
  } else { // if the length is more than 11, consider it as CNPJ
    cpf = cpf.replace(/^(\d{2})(\d)/, "$1.$2"); // put a dot after the second digit
    cpf = cpf.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3"); // put a dot after the fifth digit
    cpf = cpf.replace(/\.(\d{3})(\d)/, ".$1/$2"); // put a slash after the eigth digit
    cpf = cpf.replace(/(\d{4})(\d)/, "$1-$2"); // put a dash after the twelfth digit
  }

  return cpf;

}

// Atribuição de evento ao elemento #usuario
var usuarioInput = document.getElementById("usuario");
if (usuarioInput) {
  usuarioInput.addEventListener("keyup", function () {
    fMasc(usuarioInput, mCPF);
  });
  // We need to apply the mask when the user paste the value using the mouse
  usuarioInput.addEventListener("paste", function () {
    fMasc(usuarioInput, mCPF);
  });

}

// Atribuição de evento para voltar à página anterior nos elementos .btns-back
var btnsBack = document.querySelectorAll('.btns-back');
btnsBack.forEach(function (btn) {
  btn.addEventListener('click', function () {
    history.back();
  });
});


function telefone(v) {
  v = v.replace(/\D/g, "")
  v = v.replace(/^(\d\d)(\d)/g, "($1) $2")
  v = v.replace(/(\d{4})(\d)/, "$1-$2")    //Coloca hífen entre o quarto e o quinto dígitos
  return v
}

function checaCpfForm(e) {

  return true;

}




if (
  document.getElementById("form-checa-cpf") ||
  document.getElementById("form-login-verificadas") ||
  document.getElementById("form-login-enviadas") ||
  document.getElementById("video-container") ||
  document.getElementById("email_ver")
) {
  //Inserir tela de loading 
  window.onbeforeunload = function (e) {
    // check condition
    document.querySelector(".spinner-page-hold").style.display = 'block'
  }
}



//controle aviso qr code

// const continuar_desktop = document.getElementById("continuar_desktop");
// const desktop_only = document.querySelector(".desktop_only");
// const form_login = document.getElementById("form-login");


// continuar_desktop.addEventListener("click", function (e) {
//   e.preventDefault;
//   desktop_only.style.display = "none";
//   form_login.style.display = "block";
// })


// Define mask function
function phoneMask(phone) {
  return phone.replace(/\D/g, '')
    .replace(/^(\d)/, '($1')
    .replace(/^(\(\d{2})(\d)/, '$1) $2')
    .replace(/(\d{5})(\d{1,4})/, '$1-$2')
    .replace(/(-\d{4})\d+?$/, '$1');
}

// Define input handler function
function handleInput(e) {
  e.target.value = phoneMask(e.target.value)
}

// Select all inputs with '[data-js="input"]' attribute
const $inputs = document.querySelectorAll('[data-js="input"]')

// Add event listeners to all matching inputs
if ($inputs.length > 0) {
  Array.from($inputs).forEach(input => input.addEventListener('input', handleInput, false))
}





//Envio do fluxo de nao reconheco esses dados
const envia_a1 = document.getElementById("envia-a1");
const form_envia_a1 = document.getElementById("form-envia-a1");

if (envia_a1 != null) {
  envia_a1.addEventListener('click', function () {
    form_envia_a1.submit();
  })
}


//Exibir senha
if (document.getElementsByClassName("show-senha")) {
  [...document.querySelectorAll('.show-senha')].forEach(function (item) {
    item.addEventListener('click', function () {
      let campo = this.getAttribute("data-show");
      if (document.getElementById(campo).type === "password") {
        document.getElementById(campo).type = "text";
      } else {
        document.getElementById(campo).type = "password";
      }
    });
  });
}


// Controles scene in page
// add event listener to all .back-scene anchors
[...document.querySelectorAll('.back-scene')].forEach(function (item) {
  item.addEventListener('click', function () {
    let scene = this.getAttribute("data-scene");
    let scene_back = this.getAttribute("data-scene-back");
    document.querySelector(scene).classList.add('d-none');
    document.querySelector(scene_back).classList.remove('d-none');
  });
});


// Controls the error box to avoid decomission it in the page
document.querySelector('#error-message .btn-close').addEventListener('click', function (e) {
  e.preventDefault();
  document.getElementById('error-message').classList.add('d-none');
});

// Controls the steps
function defineStep(step, finish = false) {

  // Add to .step-2 the class .progress-active and for the others remove it.
  const stepActual = document.querySelector('.step-' + step);
  const steps = document.querySelectorAll('.progress-step');

  // Clear all active steps
  steps.forEach((step) => {
    step.classList.remove('progress-active');
  });

  if (finish == false) {

    stepActual.classList.add('progress-active');

    // iterate over all steps, counting the number of steps that have the class .progress-step
    // Get all the steps before the actual step and add to the progress bar the class .progress-done
    for (let i = 1; i < step; i++) {
      const stepDone = document.querySelector('.step-' + i);
      stepDone.classList.add('progress-done');
    }

    return;
  }

  // If the finish is true, add the class .progress-done to all steps
  steps.forEach((step) => {
    step.classList.add('progress-done');
  });


}

// Check if const step is defined
if (typeof step !== 'undefined') {
  defineStep(step);
}