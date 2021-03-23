
module.exports = function(app,swig) {

    app.get('/canciones/agregar', function (req, res) {
        let respuesta = swig.renderFile('views/bagregar.html', {

        });
        res.send(respuesta);
    })

    app.get("/canciones",function (req,res){

        let canciones=[{

            "nombre" : "Blank space",
            "precio" : "1.2"},
            {
                "nombre" : "See you again",
                "precio" : "1.3"},
            {
                "nombre" : "Uptown funk",
                "precio" : "1.1"
            }];

        let respuesta= swig.renderFile('views/btienda.html',{
            vendedor: 'Tienda de canciones',
            canciones : canciones
        });
        res.send(respuesta);

    })
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


    app.get('/canciones/:id', function (req, res) {
        let respuesta = 'id: ' + req.params.id;
        res.send(respuesta);
    });
    app.get('/canciones/:genero/:id', function (req, res) {
        let respuesta = 'id: ' + req.params.id + '<br>'
            + 'Género: ' + req.params.genero;
        res.send(respuesta);
    });


};