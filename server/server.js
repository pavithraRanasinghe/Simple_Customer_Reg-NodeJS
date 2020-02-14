const express = require('express');
const path = require('path');

const mongoose = require('./db/mongoose');
const {authenticate} = require('./middleware/authenticate');
const admin = require('./routes/admin');
const customer = require('./routes/customer');
const index = require('./routes/index');

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.set('views', path.join(__dirname, '../public/views'));
app.use(express.static(path.join(__dirname, '../public/upload')));
app.set('view engine', 'hbs');


/**
 * Login page load
 */

app.use('/',index);

/**
 * Admin
 */

app.use('/',admin);

/**
 * Customer
 */

app.use('/',customer);

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

app.listen(8080, () => {
    console.log("Server up on port 8080");
});