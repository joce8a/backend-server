var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

var app = express();

// Busqueda por coleccion
app.get('/coleccion/:tabla/:busqueda', (req, res, next) => {

    var tabla = req.params.tabla;
    var busqueda = req.params.busqueda;

    var regext = new RegExp(busqueda, 'i');

    var promesa;

    switch (tabla) {
        case 'usuarios':
            promesa = buscarUsuarios(busqueda, regext);
            break;
        case 'medicos':
            promesa = buscarMedicos(busqueda, regext);
            break;
        case 'hospitales':
            promesa = buscarHospitales(busqueda, regext);
            break;
        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'Los tipos de busqueda solo son usuarios, medicos, hospitales',
                errors: { message: 'Tipo de tabla no existe' }
            });
    }

    promesa.then(data => {
        res.status(200).json({
            ok: true,
            [tabla]: data
        });
    });

});


//Busqueda General
app.get('/todo/:busqueda', (req, res, next) => {
    var skip = req.query.skip || 0;
    skip = Number(skip);

    var limit = req.query.limit || 10;
    limit = Number(limit);


    var busqueda = req.params.busqueda;

    var regext = new RegExp(busqueda, 'i');


    Promise.all([
            buscarHospitales(busqueda, regext),
            buscarMedicos(busqueda, regext),
            buscarUsuarios(busqueda, regext)
        ])
        .then(respuestas => {

            res.status(200).json({
                ok: true,
                hospitales: respuestas[0],
                medico: respuestas[1],
                usuarios: respuestas[2]
            });

        });


});


function buscarHospitales(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre email img')
            .exec((err, hospitales) => {

                if (err) {
                    reject('Error al cargar hospitales', err);
                } else {
                    resolve(hospitales)
                }
            });
    });
}


function buscarMedicos(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Medico.find({ nombre: regex })
            .populate('usuario', 'nombre email img')
            .populate('hospital')
            .exec((err, medicos) => {

                if (err) {
                    reject('Error al cargar medicos', err);
                } else {
                    resolve(medicos)
                }
            });
    });
}


function buscarUsuarios(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Usuario.find({}, 'nombre email role img')
            .or([{ 'nombre': regex }, { 'email': regex }])
            .exec((err, usuarios) => {

                if (err) {
                    reject('Erro al cargar usuarios', err);
                } else {
                    resolve(usuarios);
                }


            })


    });
}


module.exports = app;