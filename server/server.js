const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');

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

app.

app.listen(8080, () => {
    console.log("Server up on port 8080");
});