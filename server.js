const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));


const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', 
    password: 'root', 
    database: 'contactos', 
});

db.connect(err => {
    if (err) {
        console.error('Error conectando a MySQL:', err);
        return;
    }
    console.log('Conexión exitosa a MySQL.');
});

app.get('/', (req, res) => {
    res.send('¡Servidor funcionando!');
});

app.get('/contactos', (req, res) => {
    const query = 'SELECT * FROM contacts';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener los contactos:', err);
            res.status(500).send('Error al obtener los contactos');
            return;
        }
        res.json(results);
    });
});

app.post('/contactos', (req, res) => {
    const { nombre, telefono } = req.body;
    const query = 'INSERT INTO contacts (nombre, telefono) VALUES (?, ?)';
    db.query(query, [nombre, telefono], (err, results) => {
        if (err) {
            console.error('Error al agregar contacto:', err);
            res.status(500).send('Error al agregar contacto');
            return;
        }
        res.status(201).send('Contacto agregado correctamente');
    });
});

app.get('/contactos/:telefono', (req, res) => {
    const telefono = req.params.telefono;
    const query = 'SELECT * FROM contacts WHERE telefono = ?';
    db.query(query, [telefono], (err, results) => {
        if (err) {
            console.error('Error al buscar el contacto:', err);
            res.status(500).send('Error al buscar el contacto');
            return;
        }
        if (results.length === 0) {
            res.status(404).send('Contacto no encontrado');
            return;
        }
        res.json(results[0]);
    });
});

app.delete('/contactos/:telefono', (req, res) => {
    const telefono = req.params.telefono;
    const query = 'DELETE FROM contacts WHERE telefono = ?';
    db.query(query, [telefono], (err, results) => {
        if (err) {
            console.error('Error al eliminar el contacto:', err);
            res.status(500).send('Error al eliminar el contacto');
            return;
        }
        if (results.affectedRows === 0) {
            res.status(404).send('Contacto no encontrado');
            return;
        }
        res.status(200).send('Contacto eliminado correctamente');
    });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
