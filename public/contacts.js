document.addEventListener('DOMContentLoaded', function () {
    const listarContactosBtn = document.getElementById('listar-contactos');
    const agregarContactoBtn = document.getElementById('agregar-contacto');
    const buscarContactoBtn = document.getElementById('buscar-contacto');
    const eliminarContactoBtn = document.getElementById('eliminar-contacto');
    const logoutButton = document.getElementById('logout');
    const contentDiv = document.getElementById('content');
    const sectionTitle = document.getElementById('section-title');
    const userId = localStorage.getItem('userId');

    if (!userId) {
        window.location.href = 'login.html';
        return;
    }

    async function listarContactos() {
        sectionTitle.textContent = 'Lista de Contactos';
        contentDiv.innerHTML = '<ul id="lista-contactos"></ul>';

        try {
            const response = await fetch(`/contactos/${userId}`);
            if (!response.ok) {
                throw new Error(`Error al obtener contactos: ${response.status}`);
            }

            const data = await response.json();
            const lista = document.getElementById('lista-contactos');
            data.forEach(contacto => {
                const li = document.createElement('li');
                li.innerHTML = `${contacto.nombre} - <span>${contacto.telefono}</span>`;
                lista.appendChild(li);
            });
        } catch (error) {
            console.error('Error al listar contactos:', error);
        }
    }

    function mostrarFormularioAgregar() {
        sectionTitle.textContent = 'Agregar Contacto';
        contentDiv.innerHTML = `
            <form id="form-agregar-contacto">
                <label for="nombre">Nombre:</label><br>
                <input type="text" id="nombre" name="nombre" required><br>
                <label for="telefono">Teléfono:</label><br>
                <input type="text" id="telefono" name="telefono" required><br>
                <button type="submit">Agregar</button>
            </form>
        `;
        const form = document.getElementById('form-agregar-contacto');
        form.addEventListener('submit', async event => {
            event.preventDefault();
            const nombre = document.getElementById('nombre').value;
            const telefono = document.getElementById('telefono').value;

            try {
                const response = await fetch('/contactos', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ nombre, telefono, id_usuario: userId })
                });
                const data = await response.json();

                if (response.ok) {
                    alert('Contacto agregado exitosamente');
                    listarContactos();
                } else {
                    alert(data.message || 'Error al agregar contacto');
                }
            } catch (error) {
                console.error('Error al agregar contacto:', error);
                alert('Error al agregar contacto');
            }
        });
    }

    function mostrarFormularioBuscar() {
        sectionTitle.textContent = 'Buscar Contacto';
        contentDiv.innerHTML = `
            <form id="form-buscar-contacto">
                <label for="telefono-buscar">Teléfono:</label><br>
                <input type="text" id="telefono-buscar" name="telefono" required><br>
                <button type="submit">Buscar</button>
            </form>
            <div id="resultado-buscar"></div>
        `;
        const form = document.getElementById('form-buscar-contacto');
        form.addEventListener('submit', async event => {
            event.preventDefault();
            const telefono = document.getElementById('telefono-buscar').value;
    
            try {
                const response = await fetch(`/contactos/${userId}/buscar/${telefono}`);
                
                if (!response.ok) {
                    if (response.status === 404) {
                        document.getElementById('resultado-buscar').innerHTML = '<p>Contacto no encontrado</p>';
                    } else {
                        throw new Error('Error en la búsqueda del contacto');
                    }
                    return;
                }
    
                const data = await response.json();
                const resultadoDiv = document.getElementById('resultado-buscar');
    
                resultadoDiv.innerHTML = `<p>Nombre: ${data.nombre}<br>Teléfono: ${data.telefono}</p>`;
            } catch (error) {
                console.error('Error al buscar contacto:', error);
                document.getElementById('resultado-buscar').innerHTML = '<p>Error al buscar contacto</p>';
            }
        });
    }

    function mostrarFormularioEliminar() {
        sectionTitle.textContent = 'Eliminar Contacto';
        contentDiv.innerHTML = `
            <form id="form-eliminar-contacto">
                <label for="telefono-eliminar">Teléfono:</label><br>
                <input type="text" id="telefono-eliminar" name="telefono" required><br>
                <button type="submit">Eliminar</button>
            </form>
        `;
        const form = document.getElementById('form-eliminar-contacto');
        form.addEventListener('submit', async event => {
            event.preventDefault();
            const telefono = document.getElementById('telefono-eliminar').value;

            try {
                const response = await fetch(`/contactos/${userId}/${telefono}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    alert('Contacto eliminado exitosamente');
                    listarContactos();
                } else {
                    alert('Error al eliminar contacto');
                }
            } catch (error) {
                console.error('Error al eliminar contacto:', error);
            }
        });
    }

    logoutButton.addEventListener('click', function() {
        localStorage.removeItem('userId');
        window.location.href = 'index.html';
    });

    listarContactosBtn.addEventListener('click', listarContactos);
    agregarContactoBtn.addEventListener('click', mostrarFormularioAgregar);
    buscarContactoBtn.addEventListener('click', mostrarFormularioBuscar);
    eliminarContactoBtn.addEventListener('click', mostrarFormularioEliminar);

    listarContactos();
});