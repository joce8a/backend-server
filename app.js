// requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

// Inicializar variables
var app = express();

//Body Parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Conecxion a la base de Datos
mongoose.connect('mongodb://localhost:27017/hospitalDB').then(
    () => { console.log('Base de datos: \x1b[32m%s\x1b[0m', 'en linea') },
    err => { console.log('Error Base de datos: \x1b[32m%s\x1b[0m', 'en linea') }

);

//importar rutas
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var loginRoutes = require('./routes/login');




//Rutas
app.use('/usuario', usuarioRoutes);
app.use('/login', loginRoutes);
app.use('/', appRoutes);


// Puerto
app.listen(3000, () => {

    console.log('Express server en el puerto 3000: \x1b[32m%s\x1b[0m', 'en linea');

});