var express = require('express');
var bcrypt = require('bcryptjs');
var Usuario = require('../models/usuario');
var jwt = require('jsonwebtoken');
var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

// Obtener todos los Usuarios
app.get('/', (req, res, next) => {

    var skip = req.query.skip || 0;
    skip = Number(skip);

    var limit = req.query.limit || 10;
    limit = Number(limit);

    Usuario.find({}, 'nombre email img role')
        .skip(skip)
        .limit(limit)
        .exec(
            (err, usuarios) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando usuario de la base de datos',
                        errors: err
                    });
                }

                Usuario.count({}, (err, count) => {

                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error al contar los datos',
                            errors: err
                        });
                    }

                    res.status(200).json({
                        ok: true,
                        usuarios: usuarios,
                        total: count
                    });
                });

            });
});


//Crear un nuevo Usuario
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario en la base de datos',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuariotoken: req.usuario
        });
    });
});


//Actualizar Usuario
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }



        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id ' + id + 'no existe',
                errors: { message: 'No existe un usuario con ese ID' }
            });
        }


        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioGuardado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al actualizar el usuario',
                    errors: err
                });
            }

            usuarioGuardado.password = ':)';

            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });
        });
    });
});


app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error borrando Usuario',
                errors: err
            });
        }

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un usuario con ese ID',
                errors: { message: 'No existe un usuario con ese ID' }
            });
        }


        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });

    });

});

module.exports = app;