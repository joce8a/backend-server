// requires
var express = require('express');
var mongoose = require('mongoose');

// Inicializar variables
var app = express();

// Conecxion a la base de Datos
mongoose.connect('mongodb://localhost:27017/hospitalDB').then(
    () => { console.log('Base de datos: \x1b[32m%s\x1b[0m', 'en linea') },
    err => { console.log('Error Base de datos: \x1b[32m%s\x1b[0m', 'en linea') }

);

//ruta
app.get('/', (req, res, next) => {

    res.status(200).json({
        ok: true,
        mensaje: 'Petición realizada correctamente'
    })

});


// Puerto
app.listen(3000, () => {

    console.log('Express server en el puerto 3000: \x1b[32m%s\x1b[0m', 'en linea');

});