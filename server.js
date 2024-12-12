const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Client } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.use(express.static('public'));

const client = new Client({
    user: 'root', 
    host: 'dpg-ct87172j1k6c739c2910-a.frankfurt-postgres.render.com', 
    database: 'contactosdb', 
    password: 'YQwJWTlC4mN1CruKmW3QvggO5tgJXuGd', 
    port: 5432,
    ssl: { rejectUnauthorized: false },
});

client.connect()
    .then(() => console.log('Conexión exitosa a PostgreSQL en Render'))
    .catch(err => console.error('Error al conectar a PostgreSQL', err.stack));

const createTableContactosQuery = `
    CREATE TABLE IF NOT EXISTS contactos (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        telefono VARCHAR(15) NOT NULL,
        id_usuario INTEGER NOT NULL,
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE
    );
`;

const createTableUsuariosQuery = `
    CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        correo VARCHAR(100) NOT NULL UNIQUE,
        contraseña VARCHAR(255) NOT NULL
    );
`;

client.query(createTableUsuariosQuery)
    .then(() => console.log('Tabla usuarios creada o ya existe'))
    .catch(err => console.error('Error al crear la tabla de usuarios', err.stack));

client.query(createTableContactosQuery)
    .then(() => console.log('Tabla contactos creada o ya existe'))
    .catch(err => console.error('Error al crear la tabla de contactos', err.stack));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/login.html');  
});

app.get('/contactos/:id_usuario', (req, res) => {
    const { id_usuario } = req.params;
    const query = 'SELECT * FROM contactos WHERE id_usuario = $1'; 
    client.query(query, [id_usuario], (err, results) => {
        if (err) {
            console.error('Error al obtener los contactos:', err);
            res.status(500).send('Error al obtener los contactos');
            return;
        }
        res.json(results.rows);
    });
});

app.post('/contactos', (req, res) => {
    const { nombre, telefono, id_usuario } = req.body;

    if (!nombre || !telefono || !id_usuario) {
        return res.status(400).send('Faltan datos (nombre, teléfono o id_usuario)');
    }

    const query = 'INSERT INTO contactos (nombre, telefono, id_usuario) VALUES ($1, $2, $3) RETURNING *';
    const values = [nombre, telefono, id_usuario];

    client.query(query, values, (err, results) => {
        if (err) {
            console.error('Error al agregar el contacto:', err);
            res.status(500).send('Error al agregar el contacto');
            return;
        }
        res.status(201).json(results.rows[0]);
    });
});

app.get('/contactos/:id_usuario/buscar/:telefono', (req, res) => {
    const { id_usuario, telefono } = req.params;
    const query = 'SELECT * FROM contactos WHERE id_usuario = $1 AND telefono = $2';
    const values = [id_usuario, telefono];

    client.query(query, values, (err, results) => {
        if (err) {
            console.error('Error al buscar el contacto:', err);
            res.status(500).send('Error al buscar el contacto');
            return;
        }

        if (results.rows.length === 0) {
            return res.status(404).send('Contacto no encontrado');
        }

        res.status(200).json(results.rows[0]);
    });
});

app.delete('/contactos/:id_usuario/:telefono', (req, res) => {
    const { id_usuario, telefono } = req.params; 
    const query = 'DELETE FROM contactos WHERE id_usuario = $1 AND telefono = $2 RETURNING *';
    const values = [id_usuario, telefono];

    client.query(query, values, (err, results) => {
        if (err) {
            console.error('Error al eliminar el contacto:', err);
            res.status(500).send('Error al eliminar el contacto');
            return;
        }

        if (results.rowCount === 0) {
            return res.status(404).send('Contacto no encontrado');
        }

        res.status(200).json(results.rows[0]);
    });
});

app.post('/usuarios', (req, res) => {
    const { nombre, correo, contraseña } = req.body;

    if (!nombre || !correo || !contraseña) {
        return res.status(400).send('Faltan datos (nombre, correo o contraseña)');
    }

    const query = 'INSERT INTO usuarios (nombre, correo, contraseña) VALUES ($1, $2, $3) RETURNING *';
    const values = [nombre, correo, contraseña];

    client.query(query, values, (err, results) => {
        if (err) {
            console.error('Error al agregar el usuario:', err);
            res.status(500).send('Error al agregar el usuario');
            return;
        }
        res.status(201).json(results.rows[0]);
    });
});

app.post('/usuarios/login', (req, res) => {
    const { correo, contraseña } = req.body;

    if (!correo || !contraseña) {
        return res.status(400).send('Faltan datos (correo o contraseña)');
    }

    const query = 'SELECT * FROM usuarios WHERE correo = $1 AND contraseña = $2';
    const values = [correo, contraseña];

    client.query(query, values, (err, results) => {
        if (err) {
            console.error('Error al verificar el usuario:', err);
            res.status(500).send('Error al verificar el usuario');
            return;
        }

        if (results.rows.length === 0) {
            return res.status(401).send('Credenciales inválidas');
        }

        res.status(200).json({ mensaje: 'Login exitoso', usuario: results.rows[0] });
    });
});

app.put('/usuarios/contraseña', (req, res) => {
    const { correo, nuevaContraseña } = req.body;

    if (!correo || !nuevaContraseña) {
        return res.status(400).send('Faltan datos (correo o nueva contraseña)');
    }

    const query = 'UPDATE usuarios SET contraseña = $1 WHERE correo = $2 RETURNING *';
    const values = [nuevaContraseña, correo];

    client.query(query, values, (err, results) => {
        if (err) {
            console.error('Error al actualizar la contraseña:', err);
            res.status(500).send('Error al actualizar la contraseña');
            return;
        }

        if (results.rowCount === 0) {
            return res.status(404).send('Usuario no encontrado');
        }

        res.status(200).json({ mensaje: 'Contraseña actualizada exitosamente', usuario: results.rows[0] });
    });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
