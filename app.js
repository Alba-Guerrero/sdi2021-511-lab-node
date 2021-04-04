//Modulos
let express=require('express');
let app= express();
let swig = require('swig');
let mongo = require('mongodb');

let bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));

let gestorBD = require("./modules/gestorBD.js");
gestorBD.init(app,mongo);


//Variables
app.set('port',8081);
app.set('db','mongodb://admin:sdi@tiendamusica-shard-00-00.mwotb.mongodb.net:27017,tiendamusica-shard-00-01.mwotb.mongodb.net:27017,tiendamusica-shard-00-02.mwotb.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-12uxxv-shard-0&authSource=admin&retryWrites=true&w=majority');
//Rutas/controladores por lógica
require("./routes/rusuarios.js")(app,swig,gestorBD); // (app, param1, param2, etc.)
require("./routes/rcanciones.js")(app,swig,gestorBD); // (app, param1, param2, etc.)
require("./routes/rautores.js")(app,swig); // (app, param1, param2, etc.)



app.listen(app.get('port'),function (){
    console.log('Servidor activo');
});
app.get('/promo*', function (req, res) {
    res.send('Respuesta patrón promo* ');
});




