document.addEventListener('DOMContentLoaded', () => {
    const listarContactosBtn = document.getElementById('listar-contactos');
    const agregarContactoBtn = document.getElementById('agregar-contacto');
    const buscarContactoBtn = document.getElementById('buscar-contacto');
    const eliminarContactoBtn = document.getElementById('eliminar-contacto');
    const contentDiv = document.getElementById('content');
    const sectionTitle = document.getElementById('section-title');

    function listarContactos() {
        sectionTitle.textContent = 'Lista de Contactos';
        contentDiv.innerHTML = '<ul id="lista-contactos"></ul>';
        fetch('/contactos')
            .then(response => response.json())
            .then(data => {
                const lista = document.getElementById('lista-contactos');
                data.forEach(contacto => {
                    const li = document.createElement('li');
                    li.innerHTML = `${contacto.nombre} - <span>${contacto.telefono}</span>`;
                    lista.appendChild(li);
                });
            })
            .catch(error => console.error('Error al listar contactos:', error));
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
        form.addEventListener('submit', event => {
            event.preventDefault();
            const nombre = document.getElementById('nombre').value;
            const telefono = document.getElementById('telefono').value;

            fetch('/contactos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nombre, telefono }),
            })
                .then(response => {
                    if (response.ok) {
                        alert('Contacto agregado exitosamente');
                        listarContactos(); // Actualizar la lista
                    } else {
                        alert('Error al agregar contacto');
                    }
                })
                .catch(error => console.error('Error al agregar contacto:', error));
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
        form.addEventListener('submit', event => {
            event.preventDefault();
            const telefono = document.getElementById('telefono-buscar').value;

            fetch(`/contactos/telefono/${telefono}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Contacto no encontrado');
                    }
                    return response.json();
                })
                .then(data => {
                    const resultadoDiv = document.getElementById('resultado-buscar');
                    resultadoDiv.innerHTML = `<p>Nombre: ${data.nombre}<br>Teléfono: ${data.telefono}</p>`;
                })
                .catch(error => {
                    const resultadoDiv = document.getElementById('resultado-buscar');
                    resultadoDiv.innerHTML = '<p>Contacto no encontrado</p>';
                    console.error('Error al buscar contacto:', error);
                });
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
        form.addEventListener('submit', event => {
            event.preventDefault();
            const telefono = document.getElementById('telefono-eliminar').value;

            fetch(`/contactos/telefono/${telefono}`, {
                method: 'DELETE',
            })
                .then(response => {
                    if (response.ok) {
                        alert('Contacto eliminado exitosamente');
                        listarContactos(); // Actualizar la lista
                    } else {
                        alert('Error al eliminar contacto');
                    }
                })
                .catch(error => console.error('Error al eliminar contacto:', error));
        });
    }

    listarContactosBtn.addEventListener('click', listarContactos);
    agregarContactoBtn.addEventListener('click', mostrarFormularioAgregar);
    buscarContactoBtn.addEventListener('click', mostrarFormularioBuscar);
    eliminarContactoBtn.addEventListener('click', mostrarFormularioEliminar);

    listarContactos();
});
