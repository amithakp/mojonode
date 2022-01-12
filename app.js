var express = require('express');
var app = express();
var dotenv =require('dotenv');
var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;
dotenv.config();
var mongourl = 'mongodb+srv://test:test@cluster0.vkjly.mongodb.net/mojo_shine?retryWrites=true&w=majority';
var cors = require('cors')
const bodyParser = require('body-parser')
var port = process.env.PORT || 8144;

var db;
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cors());
//route
app.get('/',(req,res) => {
    res.send("This is Default Page");
})

//return all category(vehicle).. which is car or bike
app.get('/vehicle',(req,res) => {
    db.collection('vehicle').find().toArray((err,result) => {
        if(err) throw err;
        res.send(result);
    })
})

// vehicle services(2nd page) wrt to id
app.get('/vehicle/:id',(req,res) => {
    var id = parseInt(req.params.id);
    db.collection('bookingServices').find({"category_id":id},{projection: {"services.service_price":0,"services.service_details":0}}).toArray((err,result) =>{
        if(err) throw err;
        res.send(result) 
    })
})
// app.get('/vehicle/:id',(req,res) => {
//     var id = parseInt(req.params.id);
//     var query={"category_id":id};
//     if(req.query.services){
//         query = {"category_id":id,"services.service_id":Number(req.query.services)};
//         //query = {"category_id":id,"services.service_id":{$in:[2,5]}};
//     }
//     db.collection('bookingServices').find(query).toArray((err,result) =>{
//         if(err) throw err;
//         res.send(result) 
//     })
// })

app.get('/booking/:id',(req,res) => {
    var id = parseInt(req.params.id);
    db.collection('bookingServices').find({"services.service_id":id}).toArray((err,result) =>{
        if(err) throw err;
        res.send(result) 
    })
})


//return all orders
 app.get('/orders',(req,res) =>{
     db.collection('booking').find().toArray((err,result) => {
         if(err) throw err;
         res.send(result);
     })
 })
 //insert orders
 app.post('/placeOrder',(req,res)=>{
    console.log(req.body);
    db.collection('booking').insert(req.body,(err,result)=>{
        if(err) throw err;
        res.send("order placed");
    })
})
//delete all orders
app.delete('/deleteOrder',(req,res)=>{
    db.collection('booking').remove({},(err,result)=>{
        if(err) throw err;
        res.send(result);
    })
})

//update order with pymnt 
app.put('/updateStatus/:id',(req,res) =>{
    var id = Number(req.params.id);
    var status = req.body.status?req.body.status:"Pending"
    db.collection('booking').updateOne(
        {id:id},
        {
            $set:{
                "date":req.body.date,
                "bank_status":req.body.bank_status,
                "bank":req.body.bank,
                "status":status
            }
        }
    )
    res.send("data updated")
})

MongoClient.connect(mongourl, (err,client) => {
    if(err) console.log("Error while Connecting...");
    db = client.db('mojo_shine');
    app.listen(port,() => {
        console.log(`Listening On Port: ${port}`);
    })
})
