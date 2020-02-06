const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');
const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

const mongoose = require('./../db/mongoose');
const Customer = require('./../models/customer');
const Admin = require('./../models/admin');
const {authenticate} = require('./../middleware/authenticate');
const helpers = require('./../helper/helpers');


const app = express();
app.use(bodyParser.json());

app.post('/customer',authenticate, (req, res) => {
    const newCustomer = new Customer({
        name: req.body.username,
        email: req.body.email,
        mobile: req.body.mobile,
        address: req.body.address,
    });

    console.log("Customer add : "+newCustomer);

    newCustomer.save().then((result) => {
        res.send(result);
    }, (err) => {
        res.status(500).send(err);
    });
});

app.get('/customer',authenticate, (req, res) => {
    console.log("BODY : " +req.body.name);
    Customer.find().then((result) => {
        res.send({result});
    }, (err) => {
        res.status(500).send(err);
    });
});

app.delete('/customer/:id',authenticate,(req,res)=>{
   const id = req.params.id;
   console.log("Customer ID : "+id);

   if (!ObjectID.isValid(id)){
       return res.status(500).send("error");
   }

   Customer.findByIdAndRemove(id).then((customer)=>{
       if (!customer){
           return res.status(404).send();
       }
       res.send(customer);
   },(err)=>{
        res.status(404).send(err);
   });
});

app.patch('/customer/:id',authenticate,(req,res)=>{
   const id = req.params.id;
   const body = _.pick(req.body,['username','email','mobile','address']);
    console.log(body);
   if (!ObjectID.isValid(id)){
       console.log("ID find result");
       return res.status(404).send();
   }

   Customer.findByIdAndUpdate(id,{$set:body},{new:true}).then((result)=>{
       if (!result){
           console.log("Can't find result");
           return res.status(404).send();
       }

       res.send(result);
   },(err)=>{
       res.status(404).send(err);
   });
});

// ==================================ADMIN================================================

// app.post('/admin',(req,res)=>{
//    const {username, password} = req.body;
//    const admin = new Admin(req.body);
//
//    admin.save().then(()=>{
//        console.log(admin);
//         // return admin.generateAuthToken(username);
//    }).then((token)=>{
//        console.log("Header");
//         res.header('x-auth',token).send(token);
//     }).catch((err)=>{
//        console.log("Error");
//         res.status(400).send(err);
//    });
// });


app.post('/login',(req,res)=>{
    const {username, password} = req.body;

    Admin.findByUsername(username,password).then((admin)=>{
        console.log("Server Admin : "+admin);
        const accessToken = jwt.sign({
            username: username,
        }, '123abc', {
            expiresIn: '1d'
        });
        console.log("Token: " + accessToken);

        res.header('x-auth',accessToken).send(accessToken);
    }).catch((err)=>{
        res.status(401).send(err);
    });
});

app.listen(8080, () => {
    console.log("Server up on port 8080");
});