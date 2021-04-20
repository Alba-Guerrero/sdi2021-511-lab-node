module.exports = function(app, gestorBD) {

    app.get("/api/cancion", function(req, res) {
        gestorBD.obtenerCanciones( {} , function(canciones) {
            if (canciones == null) {
                res.status(500);
                res.json({
                    error : "se ha producido un error"
                })
            } else {
                res.status(200);
                res.send( JSON.stringify(canciones) );
            }
        });
    });



app.get("/api/cancion/:id", function(req, res) {
    let criterio = { "_id" : gestorBD.mongo.ObjectID(req.params.id)}

    gestorBD.obtenerCanciones(criterio,function(canciones){
        if ( canciones == null ){
            res.status(500);
            res.json({
                error : "se ha producido un error"
            })
        } else {
            res.status(200);
            res.send( JSON.stringify(canciones[0]) );
        }
    });
});

    app.delete("/api/cancion/:id", function(req, res) {
        let criterio = {"_id": gestorBD.mongo.ObjectID(req.params.id)}
        let user = {"usuario": req.session.usuario};
        esAutor(user, criterio, function (funcion) {
            if (funcion) {
                gestorBD.eliminarCancion(criterio, function (canciones) {
                    if (canciones == null) {
                        res.status(500);
                        res.json({
                            error: "se ha producido un error"
                        })
                    } else {
                        res.status(200);
                        res.send(JSON.stringify(canciones));
                    }
                });
            } else {

                res.status(500);
                res.json({
                    error: "No puedes modificarlo, porque no es el autor"
                })

            }
        });
    });


    app.post("/api/cancion", function(req, res) {
        let cancion = {
            nombre: req.body.nombre,
            genero: req.body.genero,
            precio: req.body.precio,
        }
        // ¿Validar nombre, genero, precio?
        if (cancion.nombre.length == 0 || cancion.genero.length == 0 || cancion.precio <= 0) {
            res.status(500);
            res.json({
                error: "Se ha producido un error a los datos"
            });
        } else {

            gestorBD.insertarCancion(cancion, function (id) {
                if (id == null) {
                    res.status(500);
                    res.json({
                        error: "se ha producido un error"
                    })
                } else {
                    res.status(201);
                    res.json({
                        mensaje: "canción insertada",
                        _id: id
                    })
                }
            });

        }
    });
    app.put("/api/cancion/:id", function(req, res) {

        let criterio = { "_id" : gestorBD.mongo.ObjectID(req.params.id) };
        let control;

        let cancion = {}; // Solo los atributos a modificar
        if ( req.body.nombre != null||req.body.nombre.length===0 )
            cancion.nombre = req.body.nombre;
        else
            control=null
        if ( req.body.genero != null ||req.body.genero.length===0 )
            cancion.genero = req.body.genero;
        else
            control=null;
        if ( req.body.precio != null || req.body.precio<=0 )
            cancion.precio = req.body.precio;
        else
            control=null;
        if(control===null){
            res.status(400);
            return res.json({
                error : "Los datos a modificar son incorrectos"
            });

        }
        else {
            let criterio = {"_id": gestorBD.mongo.ObjectID(req.params.id)}
            let user = {"usuario": req.session.usuario};
             esAutor(user, criterio, function (funcion) {
                if (funcion) {
                    gestorBD.modificarCancion(criterio, cancion, function (result) {
                        if (result == null) {
                            res.status(500);
                            res.json({
                                error: "se ha producido un error"
                            })
                        } else {
                            res.status(200);
                            res.json({
                                mensaje: "canción modificada",
                                _id: req.params.id
                            })
                        }
                    });

                } else {

                    res.status(500);
                    res.json({
                        error: "No puedes modificarlo, porque no es el autor"
                    })

                }
            });
        }

});



    app.post("/api/autenticar/", function(req,res)
    {
        let seguro = app.get("crypto").createHmac('sha256', app.get('clave')).update(req.body.password).digest('hex');
        let criterio = {
            email: req.body.email,
            password: seguro

        }
        gestorBD.obtenerUsuarios(criterio, function (usuarios) {

            if (usuarios == null || usuarios.length == 0) {

                res.status(401);
                res.json({
                    autenticado: false
                })
            } else {
                let token = app.get('jwt').sign(
                    {usuario: criterio.email , tiempo: Date.now()/1000},
                    "secreto");
                res.status(200);
                res.json({
                    autenticado: true,
                    token : token
                });


            }
        });


    });

    function esAutor(usuario, cancion,callback){

        gestorBD.obtenerCanciones(cancion,function(canciones){

            if(canciones !=null){

                callback(true);
            }
            else{
                callback(false);
            }


        });

    }
}