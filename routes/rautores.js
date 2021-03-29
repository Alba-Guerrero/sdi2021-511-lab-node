module.exports = function(app,swig) {

    app.get('/autores/agregar', function (req, res) {
        let respuesta = swig.renderFile('views/autores-agregar.html', {

        });
        res.send(respuesta);
    })


    app.get("/autores",function (req,res){

        let autores =[{

            "nombre" : "Autor desconocido",
            "grupo" : "unknow"},

            {
                "nombre" : "John Lennon",
                "grupo" : "The beatles"},
            {
                "nombre" : "Justin Bieber",
                "grupo" : "unknow"
            }];

        let respuesta= swig.renderFile('views/autores.html',{
            autores : autores
        });
        res.send(respuesta);

    });

    app.get("/autores", function (req, res) {
        let respuesta = "";
        if (req.query.nombre != null)
            respuesta += 'Nombre: ' + req.query.nombre + '<br>'
                + 'Grupo: ' + req.query.grupo;
        if (typeof (req.query.rol) != "undefined")
            respuesta += 'Rol: ' + req.query.rol;
        res.send(respuesta);
    });


    app.post("/autor",function (req,res){
        res.send("Autor agregado:"+req.body.nombre +"<br>"+ " grupo : " +req.body.grupo +
            "<br>"+ " rol "+req.body.rol);
    });



};