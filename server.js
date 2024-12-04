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

const createTableQuery = `
    CREATE TABLE IF NOT EXISTS contactos (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        telefono VARCHAR(15) NOT NULL UNIQUE
    );
`;

client.query(createTableQuery)
    .then(() => console.log('Tabla contactos creada o ya existe'))
    .catch(err => console.error('Error al crear la tabla', err.stack));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');  
});

app.get('/contactos', (req, res) => {
    const query = 'SELECT * FROM contactos'; 
    client.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener los contactos:', err);
            res.status(500).send('Error al obtener los contactos');
            return;
        }
        res.json(results.rows);
    });
});

app.get('/contactos/telefono/:telefono', (req, res) => {
    const { telefono } = req.params;
    const query = 'SELECT * FROM contactos WHERE telefono = $1';
    const values = [telefono];

    client.query(query, values, (err, results) => {
        if (err) {
            console.error('Error al buscar el contacto:', err);
            res.status(500).send('Error al buscar el contacto');
            return;
        }

        if (results.rows.length === 0) {
            return res.status(404).send('Contacto no encontrado');
        }

        res.json(results.rows[0]);
    });
});

app.post('/contactos', (req, res) => {
    const { nombre, telefono } = req.body;

    if (!nombre || !telefono) {
        return res.status(400).send('Faltan datos (nombre o teléfono)');
    }

    const query = 'INSERT INTO contactos (nombre, telefono) VALUES ($1, $2) RETURNING *';
    const values = [nombre, telefono];

    client.query(query, values, (err, results) => {
        if (err) {
            console.error('Error al agregar el contacto:', err);
            res.status(500).send('Error al agregar el contacto');
            return;
        }
        res.status(201).json(results.rows[0]);
    });
});

app.delete('/contactos/:id', (req, res) => {
    const { id } = req.params;

    const query = 'DELETE FROM contactos WHERE id = $1 RETURNING *';
    const values = [id];

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

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});