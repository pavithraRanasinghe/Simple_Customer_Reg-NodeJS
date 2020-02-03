const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');
const {ObjectID} = require('mongodb');

const mongoose = require('./../db/mongoose');
const Customer = require('./../models/customer');

const app = express();
app.use(bodyParser.json());

app.post('/customer', (req, res) => {
    const newCustomer = new Customer({
        username: req.body.username,
        email: req.body.email,
        mobile: req.body.mobile,
        address: req.body.address
    });

    newCustomer.save().then((result) => {
        res.send(result);
    }, (err) => {
        req.status(400).send(err);
    });
});

app.get('/customer', (req, res) => {
    Customer.find().then((result) => {
        res.send({result});
    }, (err) => {
        res.status(404).send(err);
    });
});

app.delete('/customer/:id',(req,res)=>{
   const id = req.params.id;

   if (!ObjectID.isValid(id)){
       return res.status(404).send("error");
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

app.patch('/customer/:id',(req,res)=>{
   const id = req.params.id;
   const body = _.pick(req.body,['username','email','mobile','address']);

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

app.listen(8080, () => {
    console.log("Server up on port 8080");
});