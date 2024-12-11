document.addEventListener('DOMContentLoaded', function() {

    if(!userId){
        window.location.href = 'login.html';
       }
   else{
         loadContacts();
   }
   
    const logoutButton = document.getElementById('logout-button');
    const contactList = document.getElementById('contact-list');
    const addContactForm = document.getElementById('add-contact-form');
    const addContactMessage = document.getElementById('add-contact-message');
    const userId = localStorage.getItem('userId');

   async function loadContacts() {
        try {
            const response = await fetch(`/contactos/${userId}`);
             if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const contacts = await response.json();
            contactList.innerHTML = '';
            contacts.forEach(contact => {
                const li = document.createElement('li');
                li.textContent = `${contact.nombre} - ${contact.telefono}`;
                contactList.appendChild(li);
            });
        } catch (error) {
            console.error('Error al cargar los contactos:', error);
        }
    }

    // Evento de envío del formulario de agregar contacto
    addContactForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const name = document.getElementById('add-contact-name').value;
        const phone = document.getElementById('add-contact-phone').value;

        try {
            const response = await fetch('/contactos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nombre: name, telefono: phone, id_usuario: userId })
            });
           const data = await response.json()
            if (response.ok) {
                addContactMessage.textContent = 'Contacto agregado exitosamente';
                addContactMessage.classList.add('success');
                addContactForm.reset()
                loadContacts();
            } else {
                 addContactMessage.textContent = data.message || 'Error al agregar contacto';
                 addContactMessage.classList.add('error');
            }
        } catch (error) {
            addContactMessage.textContent = 'Error de red. Inténtalo de nuevo.';
            addContactMessage.classList.add('error');
             console.error('Error al agregar el contacto:', error);
        }
    });


    logoutButton.addEventListener('click', function() {
        localStorage.removeItem('userId'); // Elimina el ID del usuario al cerrar sesión
        window.location.href = 'login.html'; // Redirige a login.html
    });

    if(userId){
        loadContacts();
    }
    else{
        window.location.href = 'login.html';
    }
});