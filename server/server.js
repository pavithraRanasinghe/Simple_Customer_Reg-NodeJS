const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');
const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const formidable = require('formidable');
const path = require('path');
const fs = require('fs');

const mongoose = require('./../db/mongoose');
const Customer = require('./../models/customer');
const Admin = require('./../models/admin');
const {authenticate} = require('./../middleware/authenticate');


const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));


// =============ImageStorage========================
// const storage = multer.diskStorage({
//     destination: function(req, file, cb) {
//         cb(null, 'uploads/');
//     },
//
//     filename: function(req, file, cb) {
//         cb(null, file.fieldname + path.extname(file.originalname));
//     }
// });
// // var upload = multer({ storage: storage })

app.use(express.static(__dirname + '/upload'));

//=====================================ADD CUSTOMER=======================================

app.post('/customer', authenticate, (req, res) => {
    const form = formidable.IncomingForm({uploadDir: __dirname + '/upload', keepExtensions: true});
    form.parse(req, function (err, fields, files) {
        console.log("files", files.image);
        console.log("Text", fields);

        fs.rename(files.image.path, __dirname + `/upload/${fields.username.toLowerCase()}_profile_pic.jpg`, function (err, data) {
            if (err) throw err;
            console.log("Image Name : ", data);
        });

        const newCustomer = new Customer({
            name: fields.username,
            email: fields.email,
            mobile: fields.mobile,
            address: fields.address,
            profile_pic: `http://localhost:8080/${fields.username.toLowerCase()}_profile_pic.jpg`
        });
        console.log("Customer Object : ", newCustomer);

        newCustomer.save().then((result) => {
            res.send(result);
        }, (err) => {
            res.status(500).send(err);
        });

    });
});

//=====================================GET CUSTOMERS=======================================

app.get('/customer', authenticate,async (req, res) => {
    Customer.find().then((result) => {
        for (let customer of result) {
            let url = customer.profile_pic;

            app.get(url,(req,res)=>{

                res.send(` <hr><img src="${req.url}" width="500">`);
            });
        }
        res.send(result);
        }, (err) => {
        res.status(500).send(err);
    });
});



//==================================DELETE CUSTOMER=======================================

app.delete('/customer/:id', authenticate, (req, res) => {
    const id = req.params.id;
    console.log("Customer ID : " + id);

    if (!ObjectID.isValid(id)) {
        return res.status(500).send("error");
    }

    Customer.findByIdAndRemove(id).then((customer) => {
        if (!customer) {
            return res.status(404).send();
        }
        fs.unlink(`server/upload/${customer.profile_pic}`, (err) => {
            if (err) throw err;
            console.log('Image was deleted');
        });
        res.send(customer);
    }, (err) => {
        res.status(404).send(err);
    });
});
//=====================================UPDATE CUSTOMER=======================================

app.patch('/customer/:id', authenticate, async (req, res) => {

    const id = req.params.id;
    console.log("id : ", id);

    if (!ObjectID.isValid(id)) {
        console.log("ID not find");
        return res.status(404).send();
    }

    Customer.findById(id).then((result)=>{
        fs.unlink(`server/upload/${result.profile_pic}`, (err) => {
            if (err) throw err;
            console.log('Image was deleted');
        });
    }).catch((err)=>{
        console.log("Error : ",err);

    });


    const form = formidable.IncomingForm({uploadDir: __dirname + '/upload', keepExtensions: true});
    form.parse(req, function (err, fields, files) {

        fs.rename(files.image.path, __dirname + `/upload/${fields.username} profile_pic.jpg`, function (err, data) {
            if (err) throw err;
            console.log("Image rename successfull");
        });

        const newCustomer = Object.assign({
            name: fields.username,
            email: fields.email,
            mobile: fields.mobile,
            address: fields.address,
            profile_pic: `${fields.username} profile_pic.jpg`
        });
        console.log("Customer Object : ", newCustomer);

        Customer.findByIdAndUpdate(id, {$set: newCustomer}, {new: true}).then((result) => {
            if (!result) {
                console.log("Can't find result");
                return res.status(404).send();
            }

            res.send(result);
        }, (err) => {
            res.status(404).send(err);
        });
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


//================================LOGIN ADMIN=======================================

app.post('/login', (req, res) => {
    const {username, password} = req.body;

    Admin.findByUsername(username, password).then((admin) => {
        console.log("Server Admin : " + admin);
        const accessToken = jwt.sign({
            username: username,
        }, '123abc', {
            expiresIn: '1d'
        });
        console.log("Token: " + accessToken);

        res.header('x-auth', accessToken).send(accessToken);
    }).catch((err) => {
        res.status(401).send(err);
    });
});

app.listen(8080, () => {
    console.log("Server up on port 8080");
});