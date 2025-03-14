// challenge.js
const form = document.getElementById('form-checa-cpf-auth');

const apiUrl = document.body.dataset.apiUrl;
const submitButtonCpf = document.getElementById('enviar-form-checa-cpf');
const state = document.body.dataset.state;
const returnUrl = document.body.dataset.returnUrl;
const enterpriseSiteKey = document.body.dataset.captchaKey;

// get data-base-url from body attr
const dataBaseUrl = document.body.dataset.baseUrl;

let receivedNonce = null;

// Initialize Transmit SDK
// Get client ID from body attribute transmit-id
const transmitId = document.body.dataset.transmitId;
document.getElementById("ts-platform-script").addEventListener("load", function () {
    window.tsPlatform.initialize({ clientId: transmitId });
});

const executeCaptcha = async (enterpriseSiteKey, action) => {
    return await grecaptcha.enterprise.execute(enterpriseSiteKey, { action });
};

const postData = async (url, data) => {
    return await axios.post(url, data, {
        headers: { 'Content-Type': 'application/json' },
    });
};

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    document.querySelector('#error-message .btn-close').click();

    let userDocument = document.getElementById('usuario').value.replace(/\D/g, "");
    submitButtonCpf.disabled = true;
    submitButtonCpf.innerHTML = 'Verificando...';



    try {
        const token = await executeCaptcha(enterpriseSiteKey, 'identify');

        // Adds transmit security
        // Reporte ação para a Transmit Security para o evento de preenchimento de CPF
        window.tsPlatform.drs.triggerActionEvent("transaction").then(async (actionResponse) => {
            let actionToken = actionResponse.actionToken;
            // Add code here to send the action and the received actionToken to your backend

            const postData = async (url, data) => {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                // // Verifica se a resposta é bem-sucedida
                // if (!response.ok) {
                //     throw new Error(`HTTP error! status: ${response.status}`);
                // }
                return await response.json(); // ou .text() se for esperado um retorno em texto
            };

            // store in session storage checkCpf the userDocument
            sessionStorage.setItem('checkCpf', userDocument);

            const response = await postData(`${apiUrl}/challenge/`, {
                document: userDocument,
                state,
                return_url: returnUrl,
                grToken: token,
                grAction: 'identify',
                actionToken,
                actionResponse
            });

            if (response.nonce) {
                response.data = response;
                document.getElementById('metodos-verificacao').classList.remove('d-none');
                document.getElementById('form-checa-cpf-auth').classList.add('d-none');
                receivedNonce = response.data.nonce;

                if (response.data.email && response.data.email !== '') {
                    const emailBox = `
          <div class="form-check" data-contact="${response.data.email}">
            <input data-prefix="email" class="form-check-input" value="email-0" type="radio" name="metodo-verificacao" id="metodo-verificacao1" required>
            <label class="form-check-label" for="metodo-verificacao1">
              Receber código de verificação por e-mail: <br><strong><span class="fs-6">${response.data.email}</span></strong>
            </label>
          </div>`;
                    document.getElementById('ver_email').innerHTML = emailBox;
                    document.getElementById('ver_email').classList.remove('d-none');
                    document.getElementById('ver_email').classList.add('d-block');
                }

                if (response.data.phones && response.data.phones.length > 0) {
                    let phoneBox = response.data.phones.map((phone, index) => `
          <div class="form-check mt-2" data-contact="${phone}">
            <input data-prefix="phones" class="form-check-input" value="phone-${index}" type="radio" name="metodo-verificacao" id="metodo-verificacao${index + 2}" required>
            <label class="form-check-label" for="metodo-verificacao${index + 2}">
              Receber código de verificação por SMS: <br><strong><span class="fs-6">${phone}</span></strong>
            </label>
          </div>`).join('');
                    document.getElementById('ver_tel').innerHTML = phoneBox;
                    document.getElementById('ver_tel').classList.remove('d-none');
                    document.getElementById('ver_tel').classList.add('d-block');
                }
            } else {
                document.getElementById('error-message-title').innerHTML = "Erro ao processar dados";
                document.getElementById('error-message-text').innerHTML = "Por favor, tente novamente. #bn9855";
                if (response.captcha) {
                    document.getElementById('error-message-text').innerHTML = "Seu teste Captcha está falhando. Isso pode ocorrer por várias razões, como usar uma VPN ou redes públicas não seguras. Para sua segurança, você deve tentar novamente. #bn9858";
                }
                document.getElementById('error-message').classList.remove('d-none');
                submitButtonCpf.disabled = false;
                submitButtonCpf.innerHTML = 'Continuar →';
                // Check if is not a captcha issue - must have a captcha field true in response
                if (!response.captcha) {
                    // Redirect user to /fale-com-a-clara
                    window.location.href = dataBaseUrl + '/fale-com-a-clara/?state=' + state + '&return_url=' + returnUrl;
                }
            }
        });
    } catch (error) {
        // General error handling
        document.getElementById('error-message-title').innerHTML = "Erro ao processar dados";
        document.getElementById('error-message-text').innerHTML = "Por favor, tente novamente. #bn97";
        document.getElementById('error-message').classList.remove('d-none');
        submitButtonCpf.disabled = false;
        submitButtonCpf.innerHTML = 'Continuar →';

    }
});


// Step 2
const formVerificacao = document.getElementById('metodos-verificacao');
const submitButtonVerificacao = document.getElementById('enviar-form-verificacao');

formVerificacao.addEventListener('submit', (event) => {
    defineStep(3);
    event.preventDefault();
    // get the value from the radio button metodo-verificacao checked
    const metodoVerificacao = document.querySelector('input[name="metodo-verificacao"]:checked').value;
    // get the prefix from the radio button metodo-verificacao checked
    const contactType = document.querySelector('input[name="metodo-verificacao"]:checked').dataset.prefix;
    // get the radio button checked parent element
    const metodoVerificacaoParent = document.querySelector('input[name="metodo-verificacao"]:checked').parentElement;



    // show #valida-metodo-verificacao and hide #metodos-verificacao
    document.getElementById('metodos-verificacao').classList.add('d-none');
    document.getElementById('valida-metodo-verificacao').classList.remove('d-none');

    // if contact type is email, show the email input, otherwise show the phone input
    if (contactType === 'email') {
        // add required attribute to the email input
        document.getElementById('verificar-email').querySelector('input[name="contact_user"]').required = true;
        // remove required attribute to the phone input
        document.getElementById('verificar-phone').querySelector('input[name="contact_user"]').required = false;

        document.getElementById('verificar-email').classList.remove('d-none');
        document.getElementById('verificar-phone').classList.remove('active_response');
        document.getElementById('verificar-email').classList.add('active_response');
        document.getElementById('verificar-phone').classList.add('d-none');
        document.querySelector('#verificar-email .confirmeDadosContato').innerHTML = metodoVerificacaoParent.dataset.contact;


    }
    else {
        // add required to .verificar-phone input
        document.getElementById('verificar-phone').querySelector('input[name="contact_user"]').required = true;
        // remove required to .verificar-email input
        document.getElementById('verificar-email').querySelector('input[name="contact_user"]').required = false;


        document.getElementById('verificar-phone').classList.remove('d-none');
        document.getElementById('verificar-email').classList.remove('active_response');
        document.getElementById('verificar-phone').classList.add('active_response');
        document.getElementById('verificar-email').classList.add('d-none');
        document.querySelector('#verificar-phone .confirmeDadosContato').innerHTML = metodoVerificacaoParent.dataset.contact;
    }
});

// Step 3, send the challenge
const formValidacao = document.getElementById('valida-metodo-verificacao');
const submitButtonValidacao = document.getElementById('enviar-form-validacao');

const updateButtonState = (button, isSending) => {
    button.innerHTML = isSending ? 'Enviando...' : 'Enviar';
    button.disabled = isSending;
};

const handleValidationResponse = (response) => {
    if (response.status === 200) {
        transitionToTokenValidation();
    } else {
        displayValidationErrorMessage(response.data.message);
    }
};

const displayValidationErrorMessage = (message) => {
    const errorMessageContainer = document.getElementById('error-message-validacao-text');
    errorMessageContainer.innerHTML = message;
    errorMessageContainer.parentElement.parentElement.classList.remove('d-none');
    updateButtonState(submitButtonValidacao, false);
};

const transitionToTokenValidation = () => {
    formValidacao.classList.add('d-none');
    document.getElementById('valida-token').classList.remove('d-none');
    document.getElementById('codigo-verificacao1').focus();
    document.getElementById('email_user_v').value = document.getElementById('email_user').value;
    document.getElementById('phone_user_v').value = document.getElementById('phone_user').value;
};

const sendChallenge = (challengeData) => {
    axios.post(apiUrl + '/challenge/verify', challengeData)
        .then(handleValidationResponse)
        .catch((error) => {
            if (error.response) {
                displayValidationErrorMessage("<strong>Erro:</strong> Confira seu contato. Por favor, tente novamente. #bn97");
            }
        });
};

formValidacao.addEventListener('submit', async (event) => {
    startTimer(); // Assuming startTimer is a function defined elsewhere
    event.preventDefault();

    let challenge = document.querySelector('.active_response input[name="contact_user"]').value;
    let typeContact = document.querySelector('.active_response').dataset.typeContact;
    if (typeContact !== 'email') {
        challenge = challenge.replace(/\D/g, ''); // Remove non-numeric chars for non-email
    }

    updateButtonState(submitButtonValidacao, true); // Update button to "Enviando..."

    let documentUser = document.getElementById('usuario').value.replace(/\D/g, '');
    let stateUser = document.getElementById('user_state').value;
    let challengeData = {
        contact: challenge,
        document: documentUser,
        type: typeContact,
        state: stateUser,
        nonce: receivedNonce // Assuming receivedNonce is defined elsewhere
    };

    try {
        const token = await grecaptcha.enterprise.execute(enterpriseSiteKey, { action: 'verify_contact' });
        // Append the reCAPTCHA token to challenge data
        challengeData['grToken'] = token;
        challengeData['grAction'] = 'verify_contact';

        sendChallenge(challengeData); // Sending challenge data to the server along with reCAPTCHA token
    } catch (error) {
        console.error('Error executing reCAPTCHA', error);
        displayValidationErrorMessage("Erro ao executar reCAPTCHA. Tente novamente.");
    }
});

const formValidaToken = document.getElementById('valida-token');
const submitButtonValidaToken = document.getElementById('enviar-form-valida-token');

formValidaToken.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Extract the challenge based on contact method.
    let challenge = document.querySelector('.active_response input[name="contact_user"]').value;
    if (document.querySelector('.active_response').dataset.typeContact !== 'email') {
        challenge = challenge.replace(/\D/g, ''); // sanitize input for non-email contact types
    }

    // Indicate loading state on button
    submitButtonValidaToken.innerHTML = 'Enviando...';
    submitButtonValidaToken.disabled = true;

    // Concatenate token values from individual input fields
    let token = '';
    for (let i = 1; i <= 6; i++) {
        token += document.getElementById('codigo-verificacao' + i).value;
    }

    // Prepare data to send, including reCAPTCHA token and action
    let challengeData = {
        contact: challenge,
        type: document.querySelector('.active_response').dataset.typeContact,
        document: document.getElementById('usuario').value.replace(/\D/g, ''), // sanitize document input
        state: document.querySelector('#user_state').value,
        token: token // the verification code entered by the user
    };

    try {
        // Execute reCAPTCHA and add the token and action to challengeData
        challengeData['grToken'] = await grecaptcha.enterprise.execute(enterpriseSiteKey, { action: 'verify_contact' });
        challengeData['grAction'] = 'verify_contact';

        // Post data to verification endpoint
        axios.post(apiUrl + '/token/verify', challengeData)
            .then(function (response) {
                if (response.status === 200) {
                    // On success, transition to next state
                    let nonce = response.data.nonce;
                    handleTokenValidationSuccess(response.data.jwtToken, challenge, nonce);
                } else {
                    // Handle non-success status codes as errors
                    handleTokenValidationError(response.data.message);
                }
            })
            .catch(function (error) {
                // Handle any errors that occur during the HTTP request
                handleTokenValidationFailure();
            });
    } catch (error) {
        console.error('Error executing reCAPTCHA:', error);
        handleTokenValidationFailure();
    }
});

// Function to call on successful token validation
function handleTokenValidationSuccess(jwtToken, challenge, nonce) {
    formValidaToken.classList.add('d-none');
    document.getElementById('jwt').value = jwtToken;
    // Adds data to transmit
    window.tsPlatform.drs.setAuthenticatedUser(nonce);
    startTextChange(); // Assuming this is a function that initiates text change
    document.getElementById('contactForNonce').value = challenge;
}

// Function to display error messages when token validation fails
function handleTokenValidationError(message) {
    document.getElementById('error-message-valida-token-text').innerHTML = message;
    document.getElementById('error-message-valida-token-text').classList.remove('d-none');
    resetTokenForm();
}

// Function to reset form and display a generic error message on failure
function handleTokenValidationFailure() {
    document.getElementById('error-message-valida-token-text').innerHTML = "O código de verificação está incorreto. Por favor, tente novamente. #bn937";
    document.getElementById('error-message-valida-token-text').classList.remove('d-none');
    resetTokenForm();
}

// Function to reset the verification token inputs and state
function resetTokenForm() {
    for (let i = 1; i <= 6; i++) {
        document.getElementById('codigo-verificacao' + i).value = '';
    }
    submitButtonValidaToken.innerHTML = 'Enviar';
    submitButtonValidaToken.disabled = false;
    document.getElementById('codigo-verificacao1').focus();
}




const inputs = Array.from(formValidaToken.querySelectorAll('input[id^="codigo-verificacao"]'));
const submitButton = document.getElementById('enviar-form-valida-token');

inputs.forEach((input, index) => {
    input.addEventListener('keyup', (event) => {
        if (event.target.value.length === 1) {
            if (index < inputs.length - 1) {
                inputs[index + 1].focus();
            } else {
                submitButton.click();
            }
        } else if (event.target.value.length === 0 && index > 0) {
            inputs[index - 1].focus();
        }
    });

    input.addEventListener('paste', (event) => {
        let clipboardData = event.clipboardData || window.clipboardData;
        let pastedData = clipboardData.getData('Text');
        if (pastedData.length === inputs.length) {
            for (let j = 0; j < inputs.length; j++) {
                inputs[j].value = pastedData[j];
            }
            submitButton.click();
        }
    });

    // We need to add an event listener to ios autocomplete
    input.addEventListener('change', (event) => {
        if (event.target.value.length === 1) {
            if (index < inputs.length - 1) {
                inputs[index + 1].focus();
            } else {
                submitButton.click();
            }
        }
    });
});


// Controls the loading scene
const texto_progresso = document.getElementById('texto_progresso');
const thankyou = document.getElementById('thankyou');
const textWrapper = document.querySelector('.loading-texts');

const texts = [
    null, // to match the index with the step
    "Realizando validação de segurança...",
    "Concluindo...",
    "Pronto! Seus dados foram atualizados com sucesso!"
];

function changeText(index) {
    if (index >= 1 && index < texts.length) {
        texto_progresso.classList.remove('fade__toggle');
        void texto_progresso.offsetWidth; // tells browser to reset transition
        texto_progresso.innerHTML = texts[index];
        texto_progresso.classList.add('fade__toggle');
    }
}

let currentIndex = 1;

let intervalId;

function startTextChange() {

    defineStep(3);
    // If has window.ReactNativeWebView, then is running inside a webview
    // check if is running inside a webview
    if (window.ReactNativeWebView) {
        function sendDataToReactNative(data) {
            if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(data);
            } else {
                console.log('Not WebView');
            }
        }

        // check if #jwt exists and is not empty
        if (document.getElementById('jwt') && document.getElementById('jwt').value !== '') {
            let jwt = document.getElementById('jwt').value;
            sendDataToReactNative(jwt);
        }

        // Check if #webview-btn exists and remove d-none class
        if (document.getElementById('webview-btn')) {
            document.getElementById('webview-btn').classList.remove('d-none');
            // Hide the #form-go-to-login form
            document.getElementById('form-go-to-login').classList.add('d-none');
        }


    }

    // Check if #user_state is 62, so change the form #form-go-to-login action to <%= returnUrl %> and method to get
    // THIS DOES NOT WORK ON MOBILE
    if (document.getElementById('user_state').value === '62') {
        document.getElementById('form-go-to-login').action = returnUrl + '?token=' + document.getElementById('jwt').value;
        document.getElementById('form-go-to-login').method = 'get';
    }


    textWrapper.classList.remove('d-none');
    intervalId = setInterval(() => {
        changeText(currentIndex);
        currentIndex++;


        if (currentIndex >= texts.length) {

            clearInterval(intervalId);
            texto_progresso.classList.add('d-none');
            textWrapper.classList.add('d-none');
            thankyou.classList.remove('d-none');
            defineStep(4, true);
            // Start countdown to login
            startCountdown();
        }
    }, 3000);
}

function showError(error) {

    clearInterval(intervalId);
    texto_progresso.classList.add('d-none');
    textWrapper.classList.add('d-none');
    thankyou.classList.add('d-none');
    document.getElementById('error-message-finaliza-text').classList.remove('d-none');
    document.getElementById('enviar-form-finaliza').disabled = false;
    document.getElementById('enviar-form-finaliza').innerHTML = 'Enviar';
    if (error.response.data.message) {
        document.getElementById('error-description').innerHTML = error.response.data.message;
        document.getElementById('error-description').classList.remove('d-none');
    }

}


// Obter elementos
var password = document.getElementById("senha");
var confirm_password = document.getElementById("confirmar-senha");
var progressLabel = document.getElementById("progresslabel");
var progress = document.getElementById("progress");

// Função para verificar se as senhas são idênticas
function validatePassword() {
    if (password.value !== confirm_password.value) {
        confirm_password.setCustomValidity("Senhas não coincidem. Favor digite novamente.");
    } else {
        confirm_password.setCustomValidity("");
    }
}

// Função para verificar a força da senha
function checkPasswordStrength() {
    var pwd = password.value;

    // Reseta se o tamanho da senha for zero
    if (pwd.length === 0) {
        progressLabel.innerHTML = "";
        progress.value = "0";
        return;
    }

    // Verificar progresso
    var prog = [/[$@$!%*#?&]/, /[A-Z]/, /[0-9]/, /[a-z]/].reduce(
        (memo, test) => memo + test.test(pwd),
        0
    );

    // O tamanho deve ser de pelo menos 8 caracteres
    if (pwd.length >= 8) {
        prog++;
    }

    // Exibir
    var strength = "";
    switch (prog) {
        case 0:
        case 1:
        case 2:
            strength = "Senha muito fraca";
            progress.value = "20";
            password.setCustomValidity("Sua senha deve ter ao menos 8 dígitos, contendo minúsculas, maiúsculas, números e símbolos.");
            break;
        case 3:
            strength = "Senha fraca";
            progress.value = "40";
            password.setCustomValidity("Sua senha deve ter ao menos 8 dígitos, contendo minúsculas, maiúsculas, números e símbolos.");
            break;
        case 4:
            strength = "Senha OK";
            progress.value = "60";
            password.setCustomValidity("");
            break;
        case 5:
            strength = "Senha forte";
            progress.value = "80";
            password.setCustomValidity("");
            break;
        case 6:
            strength = "Senha muito forte";
            progress.value = "100";
            password.setCustomValidity("");
            break;
    }
    progressLabel.innerHTML = strength;
    validatePassword();
}

// Configurar eventos
if (password) {
    password.addEventListener("keyup", checkPasswordStrength);
    password.addEventListener("change", validatePassword);
}

if (confirm_password) {
    confirm_password.addEventListener("keyup", validatePassword);
}

// Capctha control
function onCaptchaSuccess() {
    // Habilita o botão de envio do formulário quando o captcha é validado
    document.getElementById('enviar-form-finaliza').disabled = false;
}

function onCaptchaExpired() {
    // Desabilita o botão de envio do formulário quando o captcha expira
    document.getElementById('enviar-form-finaliza').disabled = true;
}

// Timer control
let timer;
let timerDuration = 120;
let resendCount = 0;

function startTimer() {
    let minutes;
    let seconds;

    timer = setInterval(() => {
        minutes = Math.floor(timerDuration / 60);
        seconds = timerDuration % 60;
        if (timerDuration <= 0) {
            clearInterval(timer);
            document.getElementById('resend-token-div').classList.remove('d-none');
        }
        timerDuration--;

    }, 1000);
}

// Captura os elementos uma vez para evitar repetições desnecessárias.
const resendTokenDiv = document.getElementById('resend-token-div');
const activeResponse = document.querySelector('.active_response');
const userState = document.querySelector('#user_state');

document.getElementById('resend-token-link').addEventListener('click', async function (e) {
    e.preventDefault();

    if (resendCount >= 3) {
        displayMessage("No momento não podemos reenviar mais tokens, favor reiniciar a liberação.");
        setTimeout(() => {
            window.location.href = dataBaseUrl + "/liberar-acesso";
        }, 3000);
        return;
    }

    e.target.setAttribute('disabled', 'disabled');

    try {
        const response = await axios.post(apiUrl + '/token/resend', {
            contact: document.querySelector('input[name="contact_user"]').value,
            document: document.getElementById('usuario').value.replace(/\D/g, ''),
            type: document.querySelector('.active_response').dataset.typeContact,
            state: userState.value
        });

        if (response.data.success) {
            resendCount++;
            displayMessage('Token reenviado. Aguarde 2 minutos para tentar novamente.');
            timerDuration = 120;
            startTimer();
        } else {
            displayMessage('Erro ao enviar o token. Tente novamente.');
            e.target.removeAttribute('disabled');
        }
    } catch (error) {
        console.error('Erro:', error);
        displayMessage('Erro ao enviar o token. Tente novamente. #er99iou-2');
        e.target.removeAttribute('disabled');
    }
});

function displayMessage(message) {
    resendTokenDiv.innerText = message;
}


let timerLoginDuration = 600;
const countDownGoToLogin = document.getElementById('countdown-go-to-login');

function startCountdown() {
    // Atualiza a visualização imediatamente
    updateDisplay();

    const interval = setInterval(() => {
        timerLoginDuration--;

        // Atualiza a visualização
        updateDisplay();

        // Se o timer chegar a zero, para o intervalo
        if (timerLoginDuration <= 0) {
            clearInterval(interval);
        }
    }, 1000);
}

function updateDisplay() {
    const minutes = Math.floor(timerLoginDuration / 60);
    const seconds = timerLoginDuration % 60;
    if (countDownGoToLogin) {
        countDownGoToLogin.innerText = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
}
