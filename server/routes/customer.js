const {ObjectID} = require('mongodb');
const formidable = require('formidable');
const fs = require('fs');
const express = require('express');

const {authenticate} = require('../middleware/authenticate')
const Customer = require('../models/Customer');
const router = express.Router();

let customerName;

/**
 * ADD CUSTOMER
 */

router.post('/customer',authenticate,(req,res)=>{
    const form = formidable.IncomingForm({uploadDir: __dirname + '../../../public/upload', keepExtensions: true});
    form.parse(req, function (err, fields, files) {
        fs.rename(files.image.path, __dirname + `../../../public/upload/${fields.name.toLowerCase()}_profile_pic.jpg`,
            function (err, data) {
            if (err) throw err;
        });
        const newCustomer = new Customer({
            name: fields.   name,
            email: fields.email,
            mobile: fields.mobile,
            address: fields.address,
            profile_pic: `http://localhost:8080/${fields.name.toLowerCase()}_profile_pic.jpg`
        });
        newCustomer.save().then((result) => {
            res.send(result);
        }, (err) => {
            res.status(500).send(err);
        });
    });
});

/**
 * VIEW CUSTOMER
 */

router.get('/customer', authenticate, (req, res) => {
    Customer.find().then((result) => {
        res.send(result);
    }, (err) => {
        res.status(500).send(err);
    });
});

/**
 * UPDATE CUSTOMER
 */

router.put('/customer',authenticate,(req,res)=>{

    const form = formidable.IncomingForm({uploadDir: __dirname + '../../../public/upload', keepExtensions: true});
    form.parse(req, function (err, fields, files) {

        Customer.findById(fields.id, (err, customer) => {
            customerName = customer.name;
        });

        if (!ObjectID.isValid(fields.id)) {
            console.log("ID not find");
            return res.status(404).send();
        }

        fs.rename(files.image.path, __dirname + `../../../public/upload/${fields.name.toLowerCase()}_profile_pic.jpg`,
            function (err, data) {
                if (err) throw err;
            });

        const newCustomer = Object.assign({
            name: fields.name,
            email: fields.email,
            mobile: fields.mobile,
            address: fields.address,
            profile_pic: `http://localhost:8080/${fields.name.toLowerCase()}_profile_pic.jpg`
        });

        Customer.findByIdAndUpdate(fields.id, {$set: newCustomer}, {new: true}).then((result) => {
            if (!result) {
                console.log("Can't find result");
                return res.status(404).send();
            }

            res.send(result);
            fs.unlink(`../public/upload/${customerName. toLowerCase()}_profile_pic.jpg`, (err) => {
                if (err) throw err;
                console.log('Image was deleted');
            });
        }, (err) => {
            res.status(404).send(err);
        });
    });
});

/**
 * DELETE CUSTOMER
 */
router.delete('/customer',(req,res)=>{

    if (!ObjectID.isValid(req.body.id)) {
        return res.status(500).send("error");
    }

    Customer.findByIdAndRemove(req.body.id).then((customer) => {
        if (!customer) {
            return res.status(500).send();
        }

        res.send(customer);
        fs.unlink(`../public/upload/${customer.name}_profile_pic.jpg`, (err) => {
            if (err) throw err;
            console.log('Image was deleted');
        });

    }, (err) => {
        res.status(500).send(err);
    });
});


module.exports = router;
