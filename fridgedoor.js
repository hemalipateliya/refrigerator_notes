var express = require('express');
var app = express();  //use express js module
var router=express.Router();
var bodyParser = require('body-parser');
var commonmark=require('commonmark');
var reader=new commonmark.Parser();
var writer=new commonmark.HtmlRenderer();


var assert=require('assert');
var testDB;
var url="mongodb://localhost:27017/test";
//mongo.connect(url, function(err, db) {
 //testDB= db;
//})

var Datastore = require('nedb')
  , testDB = new Datastore({ filename: './fridgetNotes.db', autoload: true });

testDB.loadDatabase();
//add handlebars view engine
var handlebars = require('express3-handlebars')
	.create({defaultLayout: 'main'});  //default handlebars layout page

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars'); //sets express view engine to handlebars

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));
app.set('port', process.env.PORT || 3000);  //sets port 3000

app.get('/', function(req,res){
   /* db.find({}).sort({ planet: 1 }).skip(1).limit(2).exec(function (err, docs)*/
    testDB.find({}).sort({datetime:-1}).exec(function (err, docs) {

        var items=Object.assign(docs);
        for(let item of items)
            {
                var d = new Date(item.datetime);
                item.datetime = d.toLocaleString();
            }

        res.render('allNotes',{items:items});  //respond with homepage
});
});




app.get('/deleteform', function(req,res){
     testDB.find({}).sort({datetime:-1}).exec(function (err, docs) {
        var items=Object.assign(docs);
         for(let item of items)
            {
                var d = new Date(item.datetime);
                item.datetime = d.toLocaleString();
            }

        res.render('deleteform',{items:items});  //respond with homepage
});
});

app.get('/noteForm',function(req,res)
        {

    res.render('noteForm');
});

app.post('/deleteform', function(req, res) {
   testDB.remove({ _id : { $in : req.body.deteleSelected}}, {multi:true}, function (err, numRemoved) {
        res.redirect('/');
	});
});


app.get('/note/:noteid', function(req, res){
    /*console.log(req.params.noteid);*/

    testDB.findOne({_id:req.params.noteid}, function (err, doc) {

        var item=Object.assign({},doc);
      	var d = new Date(item.datetime);
        item.datetime = d.toLocaleString();
        let parsed=reader.parse(item.content);
        item.content = writer.render(parsed);
        res.render('noteid',{item:item});
  /*  res.render('noteid');*/

});
});

app.post('/noteForm', function(req,res){

    var item=
        {
            title:req.body.title,
            author:req.body.author,
            content:req.body.content,
            datetime: new Date().valueOf()
        };

        testDB.insert(item,function(err,result){
							res.redirect(`/note/`+result._id);
        });


    });




app.use(express.static(__dirname + '/public'));

/*app.use(function(req,res){  //express catch middleware if page doesn't exist
	res.status(404);  //respond with status code
	res.render('404'); //respond with 404 page
});*/

app.listen(app.get('port'), function(){ //start express server
	console.log( 'Express Server Started on http://localhost:3000');

});
