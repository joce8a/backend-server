var express = require('express');
var Medico = require('../models/medico');
var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

//obtener todos los medicos
app.get('/', (req, res, next) => {
    var skip = req.query.skip || 0;
    skip = Number(skip);

    var limit = req.query.limit || 10;
    limit = Number(limit);

    Medico.find({})
        .populate('usuario', 'nombre email')
        .populate('hospital', 'nombre')
        .skip(skip)
        .limit(limit)
        .exec(
            (err, medicos) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al cargar medicos de la base de datos',
                        errors: err
                    });
                }

                Medico.count({}, (err, count) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error al contar los datos',
                            errors: err
                        });
                    }
                    res.status(200).json({
                        ok: true,
                        medicos: medicos,
                        total: count
                    });
                });
            });
});




//Crear un nuevo medico
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        hospital: body.hospital,
        usuario: req.usuario._id
    });

    medico.save((err, medicoGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear un medico en la Base de datos',
                errors: err
            });
        }

        res.status(200).json({
            ok: true,
            medico: medicoGuardado
        });

    });
});



//Actualizar Medico
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;


    Medico.findById(id, (err, medico) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar medico',
                errors: err
            });
        }

        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe el id ' + id + ' del medico',
                errors: { message: 'No existe un medico con ese ID' }
            });
        }

        medico.nombre = body.nombre;
        medico.hospital = body.hospital;
        medico.usuario = req.usuario._id;

        medico.save((err, medicoGuardado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al actualizar el medico',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });
        });
    });
});





//Eliminar medico
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error Borrando Medico',
                errors,
                err
            });
        }
        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un Medico con ese ID',
                errors: {
                    message: 'No existe un Medico con ese ID'
                }
            });
        }
        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });
    });

});





module.exports = app;