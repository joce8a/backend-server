var express = require('express');
var Hospital = require('../models/hospital');
var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

//obtener todos los hospitales
app.get('/', (req, res, next) => {

    var skip = req.query.skip || 0;
    skip = Number(skip);

    var limit = req.query.limit || 10;
    limit = Number(limit);


    Hospital.find({})
        .populate('usuario', 'nombre email')
        .skip(skip)
        .limit(limit)
        .exec(
            (err, hospitales) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al cargar hospitales de la base de datos',
                        errors: err
                    });
                }

                Hospital.count({}, (err, count) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error al contar los datos',
                            errors: err
                        });
                    }
                    res.status(200).json({
                        ok: true,
                        hospitales: hospitales,
                        total: count
                    });
                });
            });
});

//Crear un nuevo hospital
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;
    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear un hospital en la Base de datos',
                errors: err
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalGuardado
        });

    });
});

//Actualizar un nuevo hospital
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;


    Hospital.findById(id, (err, hospital) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospita',
                errors: err
            });
        }

        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe el id ' + id + ' del hospital',
                errors: { message: 'No existe un hospital con ese ID' }
            });
        }

        hospital.nombre = body.nombre;
        hospital.img = body.img;
        hospital.usuario = req.usuario._id;

        hospital.save((err, hospitalGuardado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al actualizar el hospital',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });
        });
    });
});


app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error Borrando Hospital',
                errors,
                err
            });
        }
        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un Hospital con ese ID',
                errors: {
                    message: 'No existe un Hospital con ese ID'
                }
            });
        }
        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });
    });

});

module.exports = app;