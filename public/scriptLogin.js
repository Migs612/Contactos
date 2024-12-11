const loginForm = document.getElementById('form_login');
const registerForm = document.getElementById('form_registro');
const btnShowRegister = document.getElementById('btn_show_register');
const btnShowLogin = document.getElementById('btn_show_login');

btnShowRegister.addEventListener('click', () => {
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
});

btnShowLogin.addEventListener('click', () => {
    registerForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
});