document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginMessage = document.getElementById('login-message');
    const registerMessage = document.getElementById('register-message');

    // Evento de envío del formulario de inicio de sesión
    loginForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            const response = await fetch('/usuarios/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ correo: email, contraseña: password })
            });

            const data = await response.json();

            if (response.ok) {
                loginMessage.textContent = 'Inicio de sesión exitoso';
                loginMessage.classList.add('success');
                 // Redirige a index.html después del login exitoso
                window.location.href = 'index.html';
                // Almacena el id del usuario en el almacenamiento local (para usarlo en index.html)
               localStorage.setItem('userId', data.usuario.id);
            } else {
                loginMessage.textContent = data.message || 'Credenciales inválidas';
                loginMessage.classList.add('error');
            }
        } catch (error) {
            loginMessage.textContent = 'Error de red. Inténtalo de nuevo.';
             loginMessage.classList.add('error');
            console.error('Error en el login:', error);
        }
    });

    // Evento de envío del formulario de registro
    registerForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;

        try {
            const response = await fetch('/usuarios', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nombre: name, correo: email, contraseña: password })
            });

            const data = await response.json();
            if(response.ok){
                registerMessage.textContent = 'Registro exitoso. Inicia sesión.';
                registerMessage.classList.add('success');
            }
            else{
                registerMessage.textContent = data.message || 'Error al registrar usuario';
                registerMessage.classList.add('error');
            }
        } catch (error) {
             registerMessage.textContent = 'Error de red. Inténtalo de nuevo.';
             registerMessage.classList.add('error');
            console.error('Error en el registro:', error);
        }
    });
});