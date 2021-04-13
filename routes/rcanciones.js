
module.exports = function(app,swig,gestorBD) {


    app.get('/canciones/agregar', function (req, res) {
        if (req.session.usuario == null) {
            res.redirect("/tienda");
            return;
        }
        let respuesta = swig.renderFile('views/bagregar.html', {});
        res.send(respuesta);
    })
    app.get('/cancion/modificar/:id', function (req, res) {
        let criterio = {"_id": gestorBD.mongo.ObjectID(req.params.id)};
        gestorBD.obtenerCanciones(criterio, function (canciones) {
            if (canciones == null) {
                res.send(respuesta);
            } else {
                let respuesta = swig.renderFile('views/bcancionModificar.html',
                    {
                        cancion: canciones[0]
                    });
                res.send(respuesta);
            }
        });
    })


    app.get('/cancion/comprar/:id', function (req, res) {
        let cancionId = gestorBD.mongo.ObjectID(req.params.id);
        let compra = {
            usuario: req.session.usuario,
            cancionId: cancionId
        }
        let user = {"usuario": req.session.usuario};
        var res=autorIgualAUsuario(cancionId,user);
        if(res) {
            gestorBD.insertarCompra(compra, function (idCompra) {
                if (idCompra == null) {
                    res.send(respuesta);
                } else {
                    res.redirect("/compras");
                }
            });
        }
        else{
            res.send("No se puede comprar mismo usuario");
        }

    });


    app.get("/canciones", function (req, res) {

        let canciones = [{

            "nombre": "Blank space",
            "precio": "1.2"
        },
            {
                "nombre": "See you again",
                "precio": "1.3"
            },
            {
                "nombre": "Uptown funk",
                "precio": "1.1"
            }];

        let respuesta = swig.renderFile('views/btienda.html', {
            vendedor: 'Tienda de canciones',
            canciones: canciones
        });
        res.send(respuesta);

    })

    app.get('/cancion/:id', function (req, res) {
        let criterio = {"_id": gestorBD.mongo.ObjectID(req.params.id)};


        gestorBD.obtenerCanciones(criterio, function (canciones) {
            if (canciones == null) {
                res.send("Error al recuperar la canción.");
            } else {
                let user = {"usuario": req.session.usuario};
                let result=false;
                gestorBD.obtenerCompras(user, function (compras) {

                    if (compras != null) {
                        for (i = 0; i < compras.length; i++) {
                            if (compras[i].cancionId.toString() == req.params.id) {
                                console.log("Entro en el true");
                                result= true;

                            }

                        }

                    }

                if (result == true) {

                        let criterio2 = {"cancion_id": gestorBD.mongo.ObjectID(req.params.id)};
                        gestorBD.obtenerComentarios(criterio2, function (comentarios) {
                            if (comentarios != null) {

                                let respuesta = swig.renderFile('views/bcancion.html',
                                    {
                                        cancion: canciones[0],
                                        comprada: true,
                                        comentarios: comentarios
                                    });
                                res.send(respuesta);
                            } else {
                                let respuesta = swig.renderFile('views/bcancion.html',
                                    {
                                        cancion: canciones[0],
                                        comprada: true
                                    });
                                res.send(respuesta);
                            }
                        });
                    } else {
                        let criterio2 = {"cancion_id": gestorBD.mongo.ObjectID(req.params.id)};
                        gestorBD.obtenerComentarios(criterio2, function (comentarios) {
                            if (comentarios != null) {

                                let respuesta = swig.renderFile('views/bcancion.html',
                                    {
                                        cancion: canciones[0],
                                        comprada: false,
                                        comentarios: comentarios
                                    });
                                res.send(respuesta);
                            } else {
                                let respuesta = swig.renderFile('views/bcancion.html',
                                    {
                                        cancion: canciones[0],
                                        comprada: false
                                    });
                                res.send(respuesta);
                            }

                        });
                    }
                });

            }
        });

    });
    app.get('/compras', function (req, res) {
        let criterio = {"usuario": req.session.usuario};
        gestorBD.obtenerCompras(criterio, function (compras) {
            if (compras == null) {
                let respuesta = swig.renderFile('views/error.html',
                    {

                        mensaje: "No se puede listar "
                    });
                res.send(respuesta);
            } else {
                let cancionesCompradasIds = [];
                for (i = 0; i < compras.length; i++) {
                    cancionesCompradasIds.push(compras[i].cancionId);
                }
                let criterio = {"_id": {$in: cancionesCompradasIds}}
                gestorBD.obtenerCanciones(criterio, function (canciones) {
                    let respuesta = swig.renderFile('views/bcompras.html',
                        {
                            canciones: canciones,
                            comprada:true
                        });
                    res.send(respuesta);
                });
            }
        });
    });


    app.get("/canciones", function (req, res) {
        let respuesta = "";
        if (req.query.nombre != null)
            respuesta += 'Nombre: ' + req.query.nombre + '<br>'
                + 'Autor: ' + req.query.autor;
        if (typeof (req.query.autor) != "undefined")
            respuesta += 'Autor: ' + req.query.autor;
        res.send(respuesta);
    });


    app.get('/suma', function (req, res) {
        let respuesta = parseInt(req.query.num1) + parseInt(req.query.num2);
        res.send(String(respuesta));
    });


    app.post("/cancion", function (req, res) {
        if (req.session.usuario == null) {
            res.redirect("/tienda");
            return;
        }
        var cancion = {
            nombre: req.body.nombre,
            genero: req.body.genero,
            precio: req.body.precio,
            autor: req.session.usuario
        }

        // Conectarse
        gestorBD.insertarCancion(cancion, function (id) {
            if (id == null) {
                res.redirect("/publicaciones");
            } else {
                if (req.files.portada != null) {
                    var imagen = req.files.portada;
                    imagen.mv('public/portadas/' + id + '.png', function (err) {
                        if (err) {
                            let respuesta = swig.renderFile('views/error.html',
                                {

                                    mensaje: "La portada no puede cargarse"
                                });
                            res.send(respuesta);
                        } else {
                            if (req.files.audio != null) {
                                let audio = req.files.audio;
                                audio.mv('public/audios/' + id + '.mp3', function (err) {
                                    if (err) {
                                        let respuesta = swig.renderFile('views/error.html',
                                            {

                                                mensaje: "no se puede subir el audio"
                                            });
                                        res.send(respuesta);

                                    } else {

                                        res.send("Agregada id: " + id);
                                    }

                                });
                            }
                        }
                    });
                }


            }
        });

    });

    app.get("/tienda", function (req, res) {
        let criterio = {};
        if (req.query.busqueda != null) {
            criterio = {"nombre": {$regex: ".*" + req.query.busqueda + ".*"}};
        }
        let pg = parseInt(req.query.pg); // Es String !!!
        if (req.query.pg == null) { // Puede no venir el param
            pg = 1;
        }
        gestorBD.obtenerCancionesPg(criterio, pg, function (canciones, total) {
            if (canciones == null) {
                let respuesta = swig.renderFile('views/error.html',
                    {

                        mensaje: "Error al listar "
                    });
                res.send(respuesta);
            } else {
                let ultimaPg = total / 4;
                if (total % 4 > 0) { // Sobran decimales
                    ultimaPg = ultimaPg + 1;
                }
                let paginas = []; // paginas mostrar
                for (let i = pg - 2; i <= pg + 2; i++) {
                    if (i > 0 && i <= ultimaPg) {
                        paginas.push(i);
                    }
                }
                let respuesta = swig.renderFile('views/btienda.html',
                    {
                        canciones: canciones,
                        paginas: paginas,
                        actual: pg
                    });
                res.send(respuesta);
            }
        });

    });
    app.post('/cancion/modificar/:id', function (req, res) {
        let id = req.params.id;
        let criterio = {"_id": gestorBD.mongo.ObjectID(id)};
        let cancion = {
            nombre: req.body.nombre,
            genero: req.body.genero,
            precio: req.body.precio
        }
        gestorBD.modificarCancion(criterio, cancion, function (result) {
            if (result == null) {
                let respuesta = swig.renderFile('views/error.html',
                    {

                        mensaje: " no se puede modificar"
                    });
                res.send(respuesta);

            } else {
                paso1ModificarPortada(req.files, id, function (result) {
                    if (result == null) {
                        let respuesta = swig.renderFile('views/error.html',
                            {

                                mensaje: "No se puede realizar la modificación"
                            });
                        res.send(respuesta);
                    } else {
                        res.redirect("/publicaciones");
                    }
                });

            }
        });
    })
    function autorIgualAUsuario(idcancion,user) {
        gestorBD.obtenerCanciones(idcancion, function (cancion) {

            if (cancion != null) {
                console.log("hay canciones");
                for (i = 0; i < cancion.length; i++) {
                    console.log("id lista" + cancion[i].cancionId + " id pasado" + idcancion);
                    if (cancion[i].autor==user) {

                        return true;
                    }

                }
                return false;
            }
        });
        return false;
    };



            function paso1ModificarPortada(files, id, callback) {
                if (files && files.portada != null) {
                    let imagen = files.portada;
                    imagen.mv('public/portadas/' + id + '.png', function (err) {
                        if (err) {
                            callback(null); // ERROR
                        } else {
                            paso2ModificarAudio(files, id, callback); // SIGUIENTE
                        }
                    });
                } else {
                    paso2ModificarAudio(files, id, callback); // SIGUIENTE
                }
            };

            function paso2ModificarAudio(files, id, callback) {
                if (files && files.audio != null) {
                    let audio = files.audio;
                    audio.mv('public/audios/' + id + '.mp3', function (err) {
                        if (err) {
                            callback(null); // ERROR
                        } else {
                            callback(true); // FIN
                        }
                    });
                } else {
                    callback(true); // FIN
                }
            };
            app.get('/canciones/:id', function (req, res) {
                let respuesta = 'id: ' + req.params.id;
                res.send(respuesta);
            });
            app.get('/canciones/:genero/:id', function (req, res) {
                let respuesta = 'id: ' + req.params.id + '<br>'
                    + 'Género: ' + req.params.genero;
                res.send(respuesta);
            });
            app.get('/cancion/eliminar/:id', function (req, res) {
                let criterio = {"_id": gestorBD.mongo.ObjectID(req.params.id)};
                gestorBD.eliminarCancion(criterio, function (canciones) {
                    if (canciones == null) {
                        res.send(respuesta);
                    } else {
                        res.redirect("/publicaciones");
                    }
                });
            })


            app.get("/publicaciones", function (req, res) {
                let criterio = {autor: req.session.usuario};
                gestorBD.obtenerCanciones(criterio, function (canciones) {
                    if (canciones == null) {
                        let respuesta = swig.renderFile('views/error.html',
                            {

                                mensaje: "Error al listar "
                            });
                        res.send(respuesta);
                    } else {
                        let respuesta = swig.renderFile('views/bpublicaciones.html',
                            {
                                canciones: canciones
                            });
                        res.send(respuesta);
                    }
                });
            });



};